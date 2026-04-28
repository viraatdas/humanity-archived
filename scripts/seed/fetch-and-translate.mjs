#!/usr/bin/env node
// Fetch original-language source text for every story in content/stories/
// and optionally retranslate the modern English body via Gemini.
//
// Usage:
//   node scripts/seed/fetch-and-translate.mjs                # fetch originals only
//   node scripts/seed/fetch-and-translate.mjs --translate    # fetch + retranslate en.md
//   node scripts/seed/fetch-and-translate.mjs --slug yeh-shen
//   node scripts/seed/fetch-and-translate.mjs --force        # overwrite existing files
//
// Reads each content/stories/<slug>/index.yaml, uses provenance.sourceUrl
// as the source pointer, and writes <language>.md as the original.
// With --translate, runs the modern English through Gemini and overwrites en.md.
//
// Requires: GOOGLE_API_KEY env var if --translate is set.

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";
import { GoogleGenAI } from "@google/genai";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..");
const STORIES_DIR = path.join(ROOT, "content", "stories");

const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const TRANSLATE = args.includes("--translate");
const slugIdx = args.indexOf("--slug");
const ONLY_SLUG = slugIdx >= 0 ? args[slugIdx + 1] : null;

const TRANSLATION_MODEL =
  process.env.TRANSLATION_MODEL ?? "gemini-2.5-flash";

function log(slug, msg) {
  console.log(`[${slug}] ${msg}`);
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

// ---- Source extractors ---------------------------------------------------

async function fetchWikisource(url) {
  // URL like https://en.wikisource.org/wiki/Aesop's_Fables_(Townsend)/The_Wolf_and_the_Crane
  const m = url.match(/^https:\/\/([a-z]+)\.wikisource\.org\/wiki\/(.+)$/);
  if (!m) throw new Error("Not a Wikisource URL: " + url);
  const lang = m[1];
  const pageTitle = decodeURIComponent(m[2]).replace(/_/g, " ");
  const apiUrl = `https://${lang}.wikisource.org/w/api.php?action=parse&format=json&page=${encodeURIComponent(pageTitle)}&prop=wikitext&formatversion=2`;
  const res = await fetch(apiUrl, { headers: { "User-Agent": "humanityarchived-seed/0.1" } });
  if (!res.ok) throw new Error(`Wikisource ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(`Wikisource error: ${json.error.info}`);
  const wikitext = json.parse?.wikitext;
  if (!wikitext) throw new Error("Empty wikitext");
  return wikitextToPlain(wikitext);
}

async function fetchGutenberg(url) {
  // Gutenberg ebook page or txt file. Prefer .txt direct.
  // If url is the catalog page, attempt to derive .txt URL.
  if (!/\.txt$/.test(url)) {
    const m = url.match(/gutenberg\.org\/(?:ebooks|files)\/(\d+)/);
    if (m) {
      url = `https://www.gutenberg.org/files/${m[1]}/${m[1]}-0.txt`;
    }
  }
  const res = await fetch(url, { headers: { "User-Agent": "humanityarchived-seed/0.1" } });
  if (!res.ok) throw new Error(`Gutenberg ${res.status}`);
  const text = await res.text();
  return stripGutenbergBoilerplate(text);
}

function wikitextToPlain(wt) {
  let s = wt;
  // Strip mediawiki templates {{...}}
  let prev;
  do {
    prev = s;
    s = s.replace(/\{\{[^{}]*\}\}/g, "");
  } while (s !== prev);
  // Strip references <ref>...</ref>
  s = s.replace(/<ref[^>]*\/>/g, "");
  s = s.replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, "");
  // Strip HTML tags
  s = s.replace(/<[^>]+>/g, "");
  // Collapse internal links [[target|label]] -> label, [[target]] -> target
  s = s.replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, "$1");
  // External links [http://x label] -> label
  s = s.replace(/\[https?:\/\/\S+\s+([^\]]+)\]/g, "$1");
  s = s.replace(/\[https?:\/\/\S+\]/g, "");
  // Headings ===Foo=== -> ## Foo
  s = s.replace(/^======\s*(.*?)\s*======$/gm, "###### $1");
  s = s.replace(/^=====\s*(.*?)\s*=====$/gm, "##### $1");
  s = s.replace(/^====\s*(.*?)\s*====$/gm, "#### $1");
  s = s.replace(/^===\s*(.*?)\s*===$/gm, "### $1");
  s = s.replace(/^==\s*(.*?)\s*==$/gm, "## $1");
  // Italic/bold ''x'' '''x'''
  s = s.replace(/'''([^']+)'''/g, "**$1**");
  s = s.replace(/''([^']+)''/g, "*$1*");
  // Collapse blank lines
  s = s.replace(/\n{3,}/g, "\n\n");
  return s.trim();
}

function stripGutenbergBoilerplate(text) {
  const startRe = /\*\*\* START OF (?:THIS|THE) PROJECT GUTENBERG[^*]*\*\*\*/;
  const endRe = /\*\*\* END OF (?:THIS|THE) PROJECT GUTENBERG[^*]*\*\*\*/;
  const startMatch = text.match(startRe);
  const endMatch = text.match(endRe);
  let body = text;
  if (startMatch) body = body.slice(startMatch.index + startMatch[0].length);
  if (endMatch) {
    const endIdx = body.match(endRe);
    if (endIdx) body = body.slice(0, endIdx.index);
  }
  return body.trim();
}

async function fetchSource(provenance) {
  const url = provenance.sourceUrl;
  if (!url) return null;
  if (url.includes("wikisource.org")) return await fetchWikisource(url);
  if (url.includes("gutenberg.org")) return await fetchGutenberg(url);
  return null; // unknown source, skip
}

// ---- Gemini translation --------------------------------------------------

let _ai = null;
function gemini() {
  if (_ai) return _ai;
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_API_KEY is not set");
  _ai = new GoogleGenAI({ apiKey });
  return _ai;
}

async function translateToAccessibleEnglish({ sourceText, sourceLanguage, title }) {
  const ai = gemini();
  const systemInstruction = [
    "You are a translator preparing canonical world stories for a public archive.",
    "Render the source into clear, modern, accessible English that any reader today can follow.",
    "Stay faithful to the meaning, structure, and order of events. Do not abridge, summarize, or add interpretation.",
    "Preserve names, places, and specific cultural terms; do not domesticate them.",
    "Keep the tone appropriate to the original (epic, folk, mythic, intimate).",
    "Output only the translated text. No preface, no notes, no headings unless they were present.",
  ].join(" ");

  const prompt = [
    `Title: ${title}`,
    `Source language: ${sourceLanguage}`,
    `Source text:`,
    "",
    sourceText,
  ].join("\n");

  const res = await ai.models.generateContent({
    model: TRANSLATION_MODEL,
    contents: prompt,
    config: { systemInstruction },
  });
  const text = res.text?.trim();
  if (!text) throw new Error("Translator returned empty content");
  return text;
}

// ---- Main loop -----------------------------------------------------------

async function processStory(slug) {
  const dir = path.join(STORIES_DIR, slug);
  const yamlPath = path.join(dir, "index.yaml");
  const yamlRaw = await fs.readFile(yamlPath, "utf8");
  const meta = yaml.load(yamlRaw, { schema: yaml.JSON_SCHEMA });

  const lang = meta.language;
  const isOral = meta.isOralTradition;
  const origPath = path.join(dir, `${lang}.md`);
  const enPath = path.join(dir, "en.md");

  // Step 1: fetch original (skip oral traditions; their en.md IS the source as collected)
  if (!isOral && lang !== "en") {
    const origExists = await fileExists(origPath);
    if (origExists && !FORCE) {
      log(slug, `original ${lang}.md exists, skipping fetch`);
    } else {
      try {
        const text = await fetchSource(meta.provenance);
        if (text === null) {
          log(slug, `provenance source not auto-fetchable (${meta.provenance.source}), skipping`);
        } else {
          await fs.writeFile(origPath, text + "\n", "utf8");
          log(slug, `wrote ${lang}.md (${text.length} chars)`);
        }
      } catch (err) {
        log(slug, `fetch failed: ${err.message}`);
      }
    }
  } else {
    log(slug, "oral tradition or English-original; en.md is the source");
  }

  // Step 2: translate to English (only if --translate)
  if (TRANSLATE) {
    const enExists = await fileExists(enPath);
    if (enExists && !FORCE) {
      log(slug, "en.md exists, skipping translate (use --force to overwrite)");
      return;
    }
    const origText = await fs.readFile(origPath, "utf8").catch(() => null);
    if (!origText) {
      log(slug, "no original-language file to translate from, skipping");
      return;
    }
    try {
      const en = await translateToAccessibleEnglish({
        sourceText: origText,
        sourceLanguage: lang,
        title: meta.title,
      });
      await fs.writeFile(enPath, en + "\n", "utf8");
      log(slug, `wrote en.md via ${TRANSLATION_MODEL}`);
    } catch (err) {
      log(slug, `translate failed: ${err.message}`);
    }
  }
}

async function main() {
  const slugs = ONLY_SLUG
    ? [ONLY_SLUG]
    : (await fs.readdir(STORIES_DIR, { withFileTypes: true }))
        .filter((e) => e.isDirectory())
        .map((e) => e.name);

  console.log(
    `Processing ${slugs.length} ${slugs.length === 1 ? "story" : "stories"}` +
      `${TRANSLATE ? " with --translate" : ""}` +
      `${FORCE ? " with --force" : ""}`,
  );

  for (const slug of slugs) {
    try {
      await processStory(slug);
    } catch (err) {
      log(slug, `ERROR: ${err.message}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
