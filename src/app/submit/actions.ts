"use server";

import matter from "gray-matter";
import { GENRES, type Genre } from "@/lib/schema";
import { findRegion } from "@/lib/regions";
import { LANGUAGES } from "@/lib/languages";
import { makeSlug } from "@/lib/slug";
import { isGithubConfigured, openStoryPR } from "@/lib/github";
import { isEmailConfigured, notifyAdmin } from "@/lib/email";

export type SubmitResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

function resolveRegion(value: string) {
  if (!value) return null;
  // Country code lookup
  if (value.length === 2 && value === value.toUpperCase()) {
    const r = findRegion(value);
    if (r) {
      return {
        name: r.name,
        countryCode: r.code,
        lat: r.lat,
        lng: r.lng,
      };
    }
  }
  // Custom typed region
  return { name: value };
}

function resolveLanguage(value: string) {
  if (!value) return null;
  const known = LANGUAGES.find(
    (l) =>
      l.code.toLowerCase() === value.toLowerCase() ||
      l.name.toLowerCase() === value.toLowerCase(),
  );
  if (known) return { code: known.code, name: known.name };
  return { code: value.toLowerCase(), name: value };
}

export async function submitStory(formData: FormData): Promise<SubmitResult> {
  const title = String(formData.get("title") ?? "").trim();
  const timePeriod = String(formData.get("timePeriod") ?? "").trim();
  const yearStr = String(formData.get("year") ?? "").trim();
  const era = String(formData.get("era") ?? "CE").toUpperCase();
  const regionRaw = String(formData.get("region") ?? "").trim();
  const genreRaw = String(formData.get("genre") ?? "").trim();
  const authorRaw = String(formData.get("author") ?? "").trim();
  const authorVisible = formData.get("authorVisible") === "on";
  const languageRaw = String(formData.get("language") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!title) return { ok: false, error: "Please give the story a title." };
  if (!timePeriod)
    return { ok: false, error: "Please describe roughly when the story is from." };
  if (!regionRaw) return { ok: false, error: "Please choose a region." };
  if (!genreRaw) return { ok: false, error: "Please pick a genre." };
  if (!languageRaw) return { ok: false, error: "Please pick the original language." };
  if (body.length < 20)
    return { ok: false, error: "The story is a bit short — please add more." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, error: "Please give a valid email." };

  if (!GENRES.includes(genreRaw as Genre)) {
    return { ok: false, error: "Invalid genre selection." };
  }

  const region = resolveRegion(regionRaw);
  if (!region) return { ok: false, error: "Could not resolve region." };

  const language = resolveLanguage(languageRaw);
  if (!language) return { ok: false, error: "Could not resolve language." };

  let approxYear: number | undefined;
  if (yearStr) {
    const y = Number(yearStr);
    if (!Number.isFinite(y) || y < 0)
      return { ok: false, error: "Year must be a positive number." };
    approxYear = era === "BCE" ? -y : y;
  }

  const author = authorRaw.length > 0 ? authorRaw : undefined;
  const slug = makeSlug(title);
  const createdAt = new Date().toISOString();

  const frontmatter = {
    title,
    slug,
    timePeriod,
    approxYear,
    region,
    genre: genreRaw,
    author,
    authorVisible,
    language: language.code,
    languageName: language.name,
    translations: [],
    license: "CC-BY-SA-4.0",
    createdAt,
  };

  const fileContent = matter.stringify(body + "\n", frontmatter);
  const authorLabel = author
    ? authorVisible
      ? author
      : `${author} (anonymous)`
    : "Anonymous";

  if (!isGithubConfigured()) {
    return {
      ok: false,
      error:
        "The submission system is not yet connected (GitHub credentials missing). Your story has not been saved.",
    };
  }

  try {
    const { prUrl } = await openStoryPR({
      slug,
      title,
      fileContent,
      submitterEmail: email,
      authorLabel,
    });

    if (isEmailConfigured()) {
      await notifyAdmin({
        subject: `[Humanity Archived] New submission: ${title}`,
        text: [
          `A new story has been submitted to the archive.`,
          ``,
          `Title: ${title}`,
          `Time: ${timePeriod}${approxYear !== undefined ? ` (${Math.abs(approxYear)} ${approxYear < 0 ? "BCE" : "CE"})` : ""}`,
          `Region: ${region.name}`,
          `Genre: ${genreRaw}`,
          `Language: ${language.name} (${language.code})`,
          `Author: ${authorLabel}`,
          `Submitter: ${email}`,
          ``,
          `Review and merge: ${prUrl}`,
        ].join("\n"),
      });
    }

    return {
      ok: true,
      message:
        "Thank you. Your story has been received and is in moderation. You will hear back at the email you provided once it's been reviewed, and again when it's approved and live in the archive.",
    };
  } catch (err) {
    console.error("submitStory failed", err);
    return {
      ok: false,
      error:
        "Something went wrong saving your submission. Please try again in a few minutes.",
    };
  }
}
