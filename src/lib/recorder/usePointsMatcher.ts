"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface TrackedPoint {
  id: string;
  text: string;
  covered: boolean;
}

// Debounced a few seconds after new transcript text arrives, rather than on
// every word — keeps Gemini calls (and cost) reasonable during a recording
// that might run for minutes.
const MATCH_DEBOUNCE_MS = 4000;

export function usePointsMatcher(projectId: string, initialPoints: TrackedPoint[]) {
  const [points, setPoints] = useState(initialPoints);
  const pointsRef = useRef(points);
  useEffect(() => {
    pointsRef.current = points;
  }, [points]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notifyTranscript = useCallback(
    (fullTranscript: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(async () => {
        if (!pointsRef.current.some((p) => !p.covered)) return;

        try {
          const res = await fetch(`/api/projects/${projectId}/points/match`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transcript: fullTranscript }),
          });
          if (!res.ok) return;
          const { coveredPointIds } = (await res.json()) as { coveredPointIds: string[] };
          if (coveredPointIds.length === 0) return;

          setPoints((prev) =>
            prev.map((p) => (coveredPointIds.includes(p.id) ? { ...p, covered: true } : p))
          );
        } catch {
          // A missed match attempt isn't fatal — the next transcript update retries.
        }
      }, MATCH_DEBOUNCE_MS);
    },
    [projectId]
  );

  return { points, notifyTranscript };
}
