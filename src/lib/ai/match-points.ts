import { Type } from "@google/genai";
import { getGeminiClient } from "./gemini";

export interface PointToMatch {
  id: string;
  text: string;
}

// Asks Gemini which of the still-unmet points are now covered by what's
// been said so far. Keyword matching would miss paraphrases ("the effect
// hook" vs "useEffect") — a cheap Flash call handles that correctly.
export async function matchCoveredPoints(
  transcript: string,
  points: PointToMatch[]
): Promise<string[]> {
  if (points.length === 0 || !transcript.trim()) return [];

  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              `Transcript so far (live, in-progress speech-to-text of someone recording a video):\n"""${transcript}"""\n\n` +
              `Points that must be covered:\n${points.map((p) => `- (${p.id}) ${p.text}`).join("\n")}\n\n` +
              `Which point ids has the speaker already genuinely addressed, even if paraphrased? Don't include a point just because it's topically adjacent.`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          coveredPointIds: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["coveredPointIds"],
      },
    },
  });

  const text = response.text;
  if (!text) return [];

  try {
    const parsed = JSON.parse(text) as { coveredPointIds: string[] };
    const validIds = new Set(points.map((p) => p.id));
    return parsed.coveredPointIds.filter((id) => validIds.has(id));
  } catch {
    return [];
  }
}
