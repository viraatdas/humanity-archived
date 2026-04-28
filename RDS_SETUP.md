# RDS setup for Humanity Archived search

Search runs entirely inside Postgres: `tsvector` for exact, `pg_trgm` for fuzzy, `pgvector` for semantic, fused at query time. This document gets you from a fresh RDS Postgres instance to a working search index.

## Prerequisites

- An **RDS Postgres 15.3+** instance (16.x also fine)
- The instance's security group permits inbound connections from wherever the sync script runs (your laptop and / or the GitHub Actions runner)
- A `DATABASE_URL` connection string of the form `postgres://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require`
- A **Google AI Studio API key** for embedding generation: https://aistudio.google.com/apikey

## 1. Apply the schema

```bash
psql "$DATABASE_URL" -f db/schema.sql
```

This creates the `pg_trgm` and `vector` extensions, the `stories` table, and the GIN + HNSW indexes. Re-running is safe (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`).

Verify:

```bash
psql "$DATABASE_URL" -c "\d stories"
psql "$DATABASE_URL" -c "SELECT extname FROM pg_extension ORDER BY extname;"
```

You should see `pg_trgm`, `plpgsql`, and `vector`.

## 2. Set environment variables

Required:

```env
DATABASE_URL=postgres://...
GEMINI_API_KEY=...
EMBEDDING_PROVIDER=gemini   # default; omit to keep gemini
```

Optional swap-ins (only one provider is active at a time):

```env
# EMBEDDING_PROVIDER=voyage
# VOYAGE_API_KEY=...

# EMBEDDING_PROVIDER=openai
# OPENAI_API_KEY=...
```

Add the same vars to:

- Vercel project env (Production + Preview): `vercel env add DATABASE_URL production` etc.
- GitHub repository secrets (for the sync workflow): `DATABASE_URL`, `GEMINI_API_KEY`

## 3. Sync stories into the database

```bash
pnpm sync:stories
```

The script reads `content/stories/<slug>/index.yaml` + `<slug>/<lang>.md`, computes a content hash, and only re-embeds rows whose hash has changed. First run for the current archive prints something like:

```
sync: scanned 20, embedded 20, upserted 20, skipped 0, failed 0
```

Subsequent runs against unchanged stories skip everything.

## 4. Continuous sync (GitHub Action)

`.github/workflows/sync-stories.yml` runs `pnpm sync:stories` automatically on every push to `main` that touches `content/stories/**`. Add `DATABASE_URL` and `GEMINI_API_KEY` as repository secrets (Settings → Secrets and variables → Actions).

After a moderator merges a story PR, the action runs, the new row appears in Postgres within ~30 seconds, and the search API picks it up immediately.

## 5. Test end-to-end

```bash
# Exact match
curl "https://humanityarchived.com/api/search?q=Anansi"

# Fuzzy match (deliberate typo)
curl "https://humanityarchived.com/api/search?q=Gilgemesh"

# Semantic match — query terms don't appear in any of these titles
curl "https://humanityarchived.com/api/search?q=tales%20of%20mourning"
```

In the browser, hit ⌘K (or `/`), type, and watch the palette populate.

## Troubleshooting

- **`could not connect to server: Connection refused`** — check the RDS security group's inbound rules. Add your IP and the GitHub Actions runner range (or use a fixed VPN / RDS Proxy).
- **`extension "vector" is not available`** — your RDS Postgres minor version is too old; upgrade to 15.3+ or 16.x.
- **`/api/search` returns 503** — `DATABASE_URL` is not set in Vercel env. Add it and redeploy.
- **Semantic results are empty** — the embedding column is NULL for those rows. Re-run `pnpm sync:stories` and check the script output for "failed: N".
