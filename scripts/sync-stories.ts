/**
 * Sync stories from `content/stories/<slug>/` into the Postgres `stories`
 * table. Computes a content hash per story so unchanged rows are skipped
 * (no embedding API call, no UPSERT).
 *
 * Run:
 *   pnpm sync:stories
 *
 * Required env:
 *   DATABASE_URL
 *   GEMINI_API_KEY (or VOYAGE_API_KEY / OPENAI_API_KEY with EMBEDDING_PROVIDER set)
 */

import { createHash } from "node:crypto";
import { config as loadEnv } from "dotenv";
import { listStories, pickBody } from "../src/lib/stories";
import { embed, isEmbedConfigured, toPgVectorLiteral } from "../src/lib/embed";
import { isDbConfigured, query } from "../src/lib/db";
import type { Story } from "../src/lib/schema";

// Load .env.local then .env so manual runs pick up local credentials.
loadEnv({ path: ".env.local" });
loadEnv();

function buildEmbeddingInput(story: Story, body: string): string {
  // Pack metadata at the top so semantic queries still hit signal even when
  // the story body gets truncated by the embedding model's per-input cap.
  const tags = (story.tags ?? []).join(", ");
  const header = [
    `Title: ${story.title}`,
    `Region: ${story.region.name}`,
    `Period: ${story.timePeriod}`,
    `Genre: ${story.genre}`,
    tags ? `Tags: ${tags}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  // Rough char-cap so we don't blow past Gemini's ~2048-token input limit.
  // ~4 chars/token average, leave headroom for the header → 6500 chars.
  const cap = 6500 - header.length - 4;
  const trimmed = body.length > cap ? body.slice(0, cap) : body;
  return `${header}\n\n${trimmed}`;
}

function hashContent(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function excerptOf(body: string): string {
  const stripped = body.replace(/\s+/g, " ").trim();
  return stripped.length > 1200 ? stripped.slice(0, 1200) : stripped;
}

async function main() {
  if (!isDbConfigured()) {
    console.error("DATABASE_URL is not set. See RDS_SETUP.md.");
    process.exit(1);
  }
  if (!isEmbedConfigured()) {
    console.error(
      "Embedding provider not configured. Set GEMINI_API_KEY (or switch via EMBEDDING_PROVIDER).",
    );
    process.exit(1);
  }

  const stories = await listStories();
  let scanned = 0;
  let upserted = 0;
  let embedded = 0;
  let skipped = 0;
  let failed = 0;

  for (const story of stories) {
    scanned += 1;
    const body = pickBody(story, "en") ?? "";
    const embedInput = buildEmbeddingInput(story, body);
    const contentHash = hashContent(embedInput);

    try {
      const existing = await query<{ content_hash: string | null }>(
        "SELECT content_hash FROM stories WHERE slug = $1",
        [story.slug],
      );
      const cur = existing.rows[0]?.content_hash;
      if (cur === contentHash) {
        skipped += 1;
        continue;
      }

      const vec = await embed(embedInput);
      embedded += 1;

      await query(
        `INSERT INTO stories (
           slug, title, region_name, region_country, region_lat, region_lng,
           time_period, approx_year, genre, language, is_oral_tradition,
           author, tags, cycle, body_excerpt, body_full, content_hash,
           embedding, created_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6,
           $7, $8, $9, $10, $11,
           $12, $13, $14, $15, $16, $17,
           $18::vector, $19
         )
         ON CONFLICT (slug) DO UPDATE SET
           title = EXCLUDED.title,
           region_name = EXCLUDED.region_name,
           region_country = EXCLUDED.region_country,
           region_lat = EXCLUDED.region_lat,
           region_lng = EXCLUDED.region_lng,
           time_period = EXCLUDED.time_period,
           approx_year = EXCLUDED.approx_year,
           genre = EXCLUDED.genre,
           language = EXCLUDED.language,
           is_oral_tradition = EXCLUDED.is_oral_tradition,
           author = EXCLUDED.author,
           tags = EXCLUDED.tags,
           cycle = EXCLUDED.cycle,
           body_excerpt = EXCLUDED.body_excerpt,
           body_full = EXCLUDED.body_full,
           content_hash = EXCLUDED.content_hash,
           embedding = EXCLUDED.embedding,
           updated_at = now()
        `,
        [
          story.slug,
          story.title,
          story.region.name,
          story.region.countryCode ?? null,
          story.region.lat ?? null,
          story.region.lng ?? null,
          story.timePeriod,
          story.approxYear ?? null,
          story.genre,
          story.language,
          story.isOralTradition ?? false,
          story.author ?? null,
          story.tags ?? [],
          story.cycle ?? null,
          excerptOf(body),
          body,
          contentHash,
          toPgVectorLiteral(vec),
          story.createdAt,
        ],
      );
      upserted += 1;
      console.log(`  ✓ ${story.slug}`);
    } catch (err) {
      failed += 1;
      console.error(`  ✗ ${story.slug}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log(
    `\nsync: scanned ${scanned}, embedded ${embedded}, upserted ${upserted}, skipped ${skipped}, failed ${failed}`,
  );
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
