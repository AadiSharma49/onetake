"use client";

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function CountdownOverlay({ value }: { value: number }) {
  return (
    <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-black/[.08] bg-black dark:border-white/[.145]">
      <span className="text-7xl font-semibold text-white">{value}</span>
    </div>
  );
}

export function RecordingControls({
  elapsedMs,
  onStop,
}: {
  elapsedMs: number;
  onStop: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-black/[.08] p-4 dark:border-white/[.145]">
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        {formatElapsed(elapsedMs)}
      </div>
      <button
        type="button"
        onClick={onStop}
        className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98]"
      >
        Stop
      </button>
    </div>
  );
}
