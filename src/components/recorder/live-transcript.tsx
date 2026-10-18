"use client";

import { useEffect, useRef } from "react";

export function LiveTranscript({
  lines,
  interimText,
  isSupported,
}: {
  lines: string[];
  interimText: string;
  isSupported: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines, interimText]);

  if (!isSupported) {
    return (
      <p className="text-xs text-zinc-500">
        Live transcript isn&apos;t available in this browser (Chrome/Edge only) —
        recording itself is unaffected.
      </p>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="max-h-40 overflow-y-auto rounded-2xl border border-black/[.08] p-4 text-sm text-zinc-600 dark:border-white/[.145] dark:text-zinc-400"
    >
      {lines.length === 0 && !interimText ? (
        <span className="text-zinc-400 dark:text-zinc-600">Listening…</span>
      ) : (
        <>
          {lines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
          {interimText && <p className="text-zinc-400 dark:text-zinc-600">{interimText}</p>}
        </>
      )}
    </div>
  );
}
