import Link from "next/link";

// Simple play-triangle mark — keeps the video/recording motif without needing
// an external image asset.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-foreground">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-background">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      <span className="text-sm font-semibold text-black dark:text-zinc-50">OneTake</span>
    </Link>
  );
}
