import { GoogleGenAI } from "@google/genai";

// Thrown lazily (not at import time) so routes that don't need Gemini still
// work before this key is configured.
export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set.");
  }
  return new GoogleGenAI({ apiKey });
}
