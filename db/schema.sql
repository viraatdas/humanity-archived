-- Humanity Archived: hybrid search schema.
--
-- Run once on RDS Postgres 15+:
--   psql "$DATABASE_URL" -f db/schema.sql
-- The pg_trgm extension ships with stock RDS Postgres; pgvector ships
-- with RDS Postgres 15.3+ and 16.x by default. If `CREATE EXTENSION
-- vector;` errors, ensure the parameter group has `shared_preload_libraries`
-- including 'vector' (it usually doesn't need to — the extension is loaded
-- on-demand on supported versions).

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS stories (
  slug              text PRIMARY KEY,
  title             text NOT NULL,
  region_name       text NOT NULL,
  region_country    text,
  region_lat        double precision,
  region_lng        double precision,
  time_period       text NOT NULL,
  approx_year       integer,
  genre             text NOT NULL,
  language          text NOT NULL,
  is_oral_tradition boolean NOT NULL DEFAULT false,
  author            text,
  tags              text[] NOT NULL DEFAULT '{}',
  cycle             text,
  body_excerpt      text NOT NULL,
  body_full         text NOT NULL,
  content_hash      text NOT NULL,
  tsv               tsvector
                    GENERATED ALWAYS AS (
                      setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
                      setweight(to_tsvector('english', coalesce(region_name, '')), 'B') ||
                      setweight(to_tsvector('english', coalesce(time_period, '')), 'B') ||
                      setweight(to_tsvector('english', coalesce(genre, '')), 'C') ||
                      setweight(to_tsvector('english', coalesce(author, '')), 'C') ||
                      setweight(to_tsvector('english', array_to_string(tags, ' ')), 'C') ||
                      setweight(to_tsvector('english', coalesce(body_full, '')), 'D')
                    ) STORED,
  embedding         vector(1536),
  created_at        timestamptz NOT NULL,
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS stories_tsv_idx
  ON stories USING GIN (tsv);

CREATE INDEX IF NOT EXISTS stories_title_trgm_idx
  ON stories USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS stories_region_trgm_idx
  ON stories USING GIN (region_name gin_trgm_ops);

-- HNSW index for cosine-distance vector search.
-- Build is incremental: rows with embedding IS NULL are simply not indexed.
CREATE INDEX IF NOT EXISTS stories_embedding_idx
  ON stories USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS stories_genre_idx
  ON stories (genre);

CREATE INDEX IF NOT EXISTS stories_approx_year_idx
  ON stories (approx_year);
