import "server-only";
import OpenAI from "openai";

const DEFAULT_MODEL = "anthropic/claude-opus-4.7";

export function isTranslateConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

export function translatorCredit(): string {
  const model = process.env.TRANSLATION_MODEL ?? DEFAULT_MODEL;
  const date = new Date().toISOString().slice(0, 10);
  return `${model} (${date})`;
}

function client(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }
  return new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_SITE_URL ?? "https://humanityarchived.com",
      "X-Title": "Humanity Archived",
    },
  });
}

export type AccessibleEnglishInput = {
  sourceText: string;
  sourceLanguage: string;
  context?: string;
};

export async function translateToAccessibleEnglish(
  input: AccessibleEnglishInput,
): Promise<string> {
  const model = process.env.TRANSLATION_MODEL ?? DEFAULT_MODEL;
  const c = client();

  const system = [
    "You are a translator preparing canonical world stories for a public archive.",
    "Render the source into clear, modern, accessible English that any reader today can follow.",
    "Stay faithful to the meaning, structure, and order of events. Do not abridge, summarize, or add interpretation.",
    "Preserve names, places, and specific cultural terms; do not domesticate them.",
    "Keep the tone appropriate to the original (epic, folk, mythic, intimate).",
    "Output only the translated text. No preface, no notes, no headings unless they were present.",
  ].join(" ");

  const user = [
    input.context ? `Context: ${input.context}` : null,
    `Source language: ${input.sourceLanguage}`,
    `Source text:`,
    "",
    input.sourceText,
  ]
    .filter(Boolean)
    .join("\n");

  const res = await c.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const text = res.choices[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("Translator returned empty content");
  }
  return text;
}
