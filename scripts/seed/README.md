# Seed scripts

## fetch-and-translate.mjs

Backfills original-language source files for every story in `content/stories/`, and optionally retranslates the modern English body via Gemini.

### Inputs

The script reads each story's `index.yaml` and uses two fields:

- `provenance.sourceUrl`: where the original lives (Wikisource or Project Gutenberg supported; other sources are skipped)
- `language`: ISO code that determines the filename of the saved original (`grc.md`, `de.md`, etc.)

If `isOralTradition: true` or `language: en`, the script treats `en.md` as the collected original and does not try to fetch a separate file.

### Usage

```bash
# Fetch originals only (no API key needed, no translation)
node scripts/seed/fetch-and-translate.mjs

# One story at a time
node scripts/seed/fetch-and-translate.mjs --slug yeh-shen

# Re-translate from the fetched original via Gemini
GOOGLE_API_KEY=... node scripts/seed/fetch-and-translate.mjs --translate

# Overwrite existing files
node scripts/seed/fetch-and-translate.mjs --force
```

### What it writes

For each story whose source can be fetched:

```
content/stories/<slug>/
  index.yaml      (unchanged)
  en.md           (unchanged unless --translate)
  <lang>.md       (NEW: original-language source)
```

After running, the language switcher in the story reader will show both languages.

### Limits

- Wikisource extraction strips templates and links but is not perfect; expect some manual cleanup per story.
- Project Gutenberg returns the entire ebook text including boilerplate. The script strips the standard `*** START ***` / `*** END ***` markers but does not pick out individual stories from a multi-story collection. For collections, prefer Wikisource per-story URLs.
- Sources tagged `oral-tradition`, `bureau-of-american-ethnology`, or `submission` are skipped. The collected English in `en.md` is treated as the source.
- `--translate` requires `GOOGLE_API_KEY` and uses `TRANSLATION_MODEL` (default `gemini-2.5-flash`).
