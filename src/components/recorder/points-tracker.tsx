"use client";

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function PointsTracker({
  points,
  elapsedMs,
  timeLimitSeconds,
}: {
  points: { id: string; text: string; covered: boolean }[];
  elapsedMs: number;
  timeLimitSeconds: number;
}) {
  const limitMs = timeLimitSeconds * 1000;
  const remainingMs = limitMs - elapsedMs;
  const overLimit = remainingMs < 0;
  const progress = Math.min(elapsedMs / limitMs, 1);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-black/[.08] p-4 dark:border-white/[.145]">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">Time</span>
        <span className={overLimit ? "font-medium text-accent" : "text-zinc-600 dark:text-zinc-400"}>
          {overLimit ? `${formatTime(-remainingMs)} over` : `${formatTime(remainingMs)} left`}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-black/[.08] dark:bg-white/[.145]">
        <div
          className={`h-full transition-[width] duration-300 ${overLimit ? "bg-accent" : "bg-foreground"}`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {points.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1.5">
          {points.map((point) => (
            <li
              key={point.id}
              className={`flex items-center gap-2 text-sm ${
                point.covered
                  ? "text-zinc-400 line-through dark:text-zinc-600"
                  : "text-zinc-700 dark:text-zinc-300"
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                  point.covered
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-black/[.2] dark:border-white/[.3]"
                }`}
              >
                {point.covered ? "✓" : ""}
              </span>
              {point.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
