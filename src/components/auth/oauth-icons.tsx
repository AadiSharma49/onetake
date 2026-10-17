import type { OAuthStrategy } from "@/lib/auth/oauth-providers";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4 shrink-0" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.9 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.4C29.5 34.9 26.9 36 24 36c-5.3 0-9.8-3.1-11.3-7.9l-6.5 5C9.6 39.6 16.3 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.3 5.7-6.3 7.1l6.5 5.4C38.6 38.3 44 32.5 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  );
}

function SlackIcon() {
  return (
    <svg viewBox="0 0 127 127" className="h-4 w-4 shrink-0" aria-hidden>
      <path fill="#E01E5A" d="M27.2 80c0 7.3-5.9 13.2-13.2 13.2S.8 87.3.8 80c0-7.3 5.9-13.2 13.2-13.2h13.2V80z" />
      <path fill="#E01E5A" d="M33.9 80c0-7.3 5.9-13.2 13.2-13.2s13.2 5.9 13.2 13.2v33c0 7.3-5.9 13.2-13.2 13.2s-13.2-5.9-13.2-13.2V80z" />
      <path fill="#36C5F0" d="M47.1 27.2c-7.3 0-13.2-5.9-13.2-13.2S39.8.8 47.1.8s13.2 5.9 13.2 13.2v13.2H47.1z" />
      <path fill="#36C5F0" d="M47.1 33.9c7.3 0 13.2 5.9 13.2 13.2s-5.9 13.2-13.2 13.2H14c-7.3 0-13.2-5.9-13.2-13.2s5.9-13.2 13.2-13.2h33.1z" />
      <path fill="#2EB67D" d="M99.9 47.1c0-7.3 5.9-13.2 13.2-13.2s13.2 5.9 13.2 13.2-5.9 13.2-13.2 13.2H99.9V47.1z" />
      <path fill="#2EB67D" d="M93.2 47.1c0 7.3-5.9 13.2-13.2 13.2s-13.2-5.9-13.2-13.2V14c0-7.3 5.9-13.2 13.2-13.2s13.2 5.9 13.2 13.2v33.1z" />
      <path fill="#ECB22E" d="M80 99.9c7.3 0 13.2 5.9 13.2 13.2S87.3 126.3 80 126.3s-13.2-5.9-13.2-13.2V99.9H80z" />
      <path fill="#ECB22E" d="M80 93.2c-7.3 0-13.2-5.9-13.2-13.2s5.9-13.2 13.2-13.2h33.1c7.3 0 13.2 5.9 13.2 13.2s-5.9 13.2-13.2 13.2H80z" />
    </svg>
  );
}

// Atlassian's real mark is a complex curved shape — a plain badge is safer
// than reproducing it inaccurately from memory.
function AtlassianIcon() {
  return (
    <span
      className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[#0052CC] text-[9px] font-bold leading-none text-white"
      aria-hidden
    >
      A
    </span>
  );
}

export function OAuthIcon({ strategy }: { strategy: OAuthStrategy }) {
  switch (strategy) {
    case "oauth_google":
      return <GoogleIcon />;
    case "oauth_slack":
      return <SlackIcon />;
    case "oauth_atlassian":
      return <AtlassianIcon />;
    default:
      return null;
  }
}
