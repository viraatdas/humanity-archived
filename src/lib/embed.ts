import "server-only";

export const EMBED_DIMS = 1536;

type Provider = "gemini" | "voyage" | "openai";

function activeProvider(): Provider {
  const v = (process.env.EMBEDDING_PROVIDER ?? "gemini").toLowerCase();
  if (v === "voyage" || v === "openai" || v === "gemini") return v;
  return "gemini";
}

export function isEmbedConfigured(): boolean {
  switch (activeProvider()) {
    case "gemini":
      return Boolean(process.env.GEMINI_API_KEY);
    case "voyage":
      return Boolean(process.env.VOYAGE_API_KEY);
    case "openai":
      return Boolean(process.env.OPENAI_API_KEY);
  }
}

/**
 * Embed a single piece of text into a `EMBED_DIMS`-dim vector.
 * Throws on configuration error. Retries 429s with exponential backoff.
 */
export async function embed(text: string): Promise<number[]> {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    throw new Error("embed: empty text");
  }
  return withRetry(() => embedOnce(trimmed));
}

async function embedOnce(text: string): Promise<number[]> {
  switch (activeProvider()) {
    case "gemini":
      return embedGemini(text);
    case "voyage":
      return embedVoyage(text);
    case "openai":
      return embedOpenAI(text);
  }
}

async function embedGemini(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: [text],
    config: {
      outputDimensionality: EMBED_DIMS,
      taskType: "RETRIEVAL_DOCUMENT",
    },
  });
  const values = response.embeddings?.[0]?.values;
  if (!values || values.length !== EMBED_DIMS) {
    throw new Error(
      `Gemini embed returned unexpected dim ${values?.length ?? 0}`,
    );
  }
  return values;
}

async function embedVoyage(text: string): Promise<number[]> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) throw new Error("VOYAGE_API_KEY is not set");
  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "voyage-3.5",
      input: text,
      input_type: "document",
      output_dimension: EMBED_DIMS,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Voyage embed failed: ${res.status} ${body}`);
  }
  const data = (await res.json()) as { data: Array<{ embedding: number[] }> };
  const values = data.data?.[0]?.embedding;
  if (!values || values.length !== EMBED_DIMS) {
    throw new Error(`Voyage embed returned unexpected dim ${values?.length ?? 0}`);
  }
  return values;
}

async function embedOpenAI(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text,
      dimensions: EMBED_DIMS,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`OpenAI embed failed: ${res.status} ${body}`);
  }
  const data = (await res.json()) as { data: Array<{ embedding: number[] }> };
  const values = data.data?.[0]?.embedding;
  if (!values || values.length !== EMBED_DIMS) {
    throw new Error(`OpenAI embed returned unexpected dim ${values?.length ?? 0}`);
  }
  return values;
}

async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 4,
): Promise<T> {
  let last: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      last = err;
      const msg = err instanceof Error ? err.message : String(err);
      const transient =
        msg.includes("429") ||
        msg.includes("rate") ||
        msg.includes("timeout") ||
        msg.includes("ECONNRESET") ||
        msg.includes("ETIMEDOUT");
      if (!transient || i === attempts - 1) throw err;
      await new Promise((r) => setTimeout(r, 400 * 2 ** i));
    }
  }
  throw last instanceof Error ? last : new Error(String(last));
}

/**
 * Render `vector(N)` literal for inline pgvector queries (when not using
 * a parameter slot). Faster than ::text casting on each query.
 */
export function toPgVectorLiteral(values: number[]): string {
  return `[${values.join(",")}]`;
}
