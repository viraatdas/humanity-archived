import "server-only";
import { isDbConfigured, query } from "./db";
import { embed, isEmbedConfigured, toPgVectorLiteral } from "./embed";

export type SearchResult = {
  slug: string;
  title: string;
  region: string;
  timePeriod: string;
  genre: string;
  author: string | null;
  snippet: string; // contains <em>...</em> highlights
  score: number;
};

export type SearchOutput = {
  ok: true;
  query: string;
  results: SearchResult[];
  modes: {
    exact: boolean;
    fuzzy: boolean;
    semantic: boolean;
  };
};

const FUSED_SQL_WITH_VECTOR = `
WITH
  q_text AS (
    SELECT plainto_tsquery('english', $1) AS qt
  ),
  exact_hits AS (
    SELECT slug,
           ROW_NUMBER() OVER (ORDER BY ts_rank_cd(s.tsv, qt) DESC) AS rnk
    FROM stories s, q_text
    WHERE s.tsv @@ qt
    LIMIT 60
  ),
  fuzzy_hits AS (
    SELECT slug,
           ROW_NUMBER() OVER (
             ORDER BY GREATEST(
               similarity(title, $1),
               similarity(region_name, $1)
             ) DESC
           ) AS rnk
    FROM stories
    WHERE title % $1 OR region_name % $1
    LIMIT 60
  ),
  semantic_hits AS (
    SELECT slug,
           ROW_NUMBER() OVER (ORDER BY embedding <=> $2::vector ASC) AS rnk
    FROM stories
    WHERE embedding IS NOT NULL
    LIMIT 60
  ),
  fused AS (
    SELECT slug, SUM(1.0 / (60 + rnk)) AS score
    FROM (
      SELECT slug, rnk FROM exact_hits
      UNION ALL SELECT slug, rnk FROM fuzzy_hits
      UNION ALL SELECT slug, rnk FROM semantic_hits
    ) t
    GROUP BY slug
  )
SELECT s.slug, s.title, s.region_name, s.time_period, s.genre, s.author,
       f.score::float AS score,
       coalesce(
         nullif(
           ts_headline(
             'english',
             s.body_excerpt,
             q_text.qt,
             'StartSel=<em>, StopSel=</em>, MaxWords=24, MinWords=10, ShortWord=3, MaxFragments=1'
           ),
           ''
         ),
         left(s.body_excerpt, 200)
       ) AS snippet
FROM fused f
JOIN stories s USING (slug)
CROSS JOIN q_text
ORDER BY f.score DESC
LIMIT $3;
`;

const FUSED_SQL_NO_VECTOR = `
WITH
  q_text AS (
    SELECT plainto_tsquery('english', $1) AS qt
  ),
  exact_hits AS (
    SELECT slug,
           ROW_NUMBER() OVER (ORDER BY ts_rank_cd(s.tsv, qt) DESC) AS rnk
    FROM stories s, q_text
    WHERE s.tsv @@ qt
    LIMIT 60
  ),
  fuzzy_hits AS (
    SELECT slug,
           ROW_NUMBER() OVER (
             ORDER BY GREATEST(
               similarity(title, $1),
               similarity(region_name, $1)
             ) DESC
           ) AS rnk
    FROM stories
    WHERE title % $1 OR region_name % $1
    LIMIT 60
  ),
  fused AS (
    SELECT slug, SUM(1.0 / (60 + rnk)) AS score
    FROM (
      SELECT slug, rnk FROM exact_hits
      UNION ALL SELECT slug, rnk FROM fuzzy_hits
    ) t
    GROUP BY slug
  )
SELECT s.slug, s.title, s.region_name, s.time_period, s.genre, s.author,
       f.score::float AS score,
       coalesce(
         nullif(
           ts_headline(
             'english',
             s.body_excerpt,
             q_text.qt,
             'StartSel=<em>, StopSel=</em>, MaxWords=24, MinWords=10, ShortWord=3, MaxFragments=1'
           ),
           ''
         ),
         left(s.body_excerpt, 200)
       ) AS snippet
FROM fused f
JOIN stories s USING (slug)
CROSS JOIN q_text
ORDER BY f.score DESC
LIMIT $2;
`;

type Row = {
  slug: string;
  title: string;
  region_name: string;
  time_period: string;
  genre: string;
  author: string | null;
  score: number;
  snippet: string;
};

export async function search(
  q: string,
  limit = 20,
): Promise<SearchOutput> {
  const trimmed = q.trim();
  if (trimmed.length === 0) {
    return {
      ok: true,
      query: trimmed,
      results: [],
      modes: { exact: false, fuzzy: false, semantic: false },
    };
  }
  if (!isDbConfigured()) {
    throw new Error("Search requires DATABASE_URL");
  }

  // Try semantic, but degrade cleanly if the embed call fails or isn't
  // configured. Exact + fuzzy still return useful results.
  let qVec: number[] | null = null;
  if (isEmbedConfigured()) {
    try {
      qVec = await embed(trimmed);
    } catch (err) {
      console.error("[search] embed failed, falling back to lexical only", err);
    }
  }

  const rows = qVec
    ? (
        await query<Row>(FUSED_SQL_WITH_VECTOR, [
          trimmed,
          toPgVectorLiteral(qVec),
          limit,
        ])
      ).rows
    : (await query<Row>(FUSED_SQL_NO_VECTOR, [trimmed, limit])).rows;

  return {
    ok: true,
    query: trimmed,
    results: rows.map((r) => ({
      slug: r.slug,
      title: r.title,
      region: r.region_name,
      timePeriod: r.time_period,
      genre: r.genre,
      author: r.author,
      snippet: r.snippet,
      score: r.score,
    })),
    modes: {
      exact: true,
      fuzzy: true,
      semantic: qVec !== null,
    },
  };
}
