import "server-only";
import { GoogleGenAI } from "@google/genai";

const DEFAULT_MODEL = "gemini-2.5-flash";

export function isTranslateConfigured(): boolean {
  return Boolean(process.env.GOOGLE_API_KEY);
}

export function translatorCredit(): string {
  const model = process.env.TRANSLATION_MODEL ?? DEFAULT_MODEL;
  const date = new Date().toISOString().slice(0, 10);
  return `${model} (${date})`;
}

function client(): GoogleGenAI {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
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
  const ai = client();

  const systemInstruction = [
    "You are a translator preparing canonical world stories for a public archive.",
    "Render the source into clear, modern, accessible English that any reader today can follow.",
    "Stay faithful to the meaning, structure, and order of events. Do not abridge, summarize, or add interpretation.",
    "Preserve names, places, and specific cultural terms; do not domesticate them.",
    "Keep the tone appropriate to the original (epic, folk, mythic, intimate).",
    "Output only the translated text. No preface, no notes, no headings unless they were present.",
  ].join(" ");

  const prompt = [
    input.context ? `Context: ${input.context}` : null,
    `Source language: ${input.sourceLanguage}`,
    `Source text:`,
    "",
    input.sourceText,
  ]
    .filter(Boolean)
    .join("\n");

  const res = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { systemInstruction },
  });

  const text = res.text?.trim();
  if (!text) {
    throw new Error("Translator returned empty content");
  }
  return text;
}
