// Shared centered-card chrome for /sign-in and /sign-up — sso-callback renders
// nothing visible, but sharing this layout keeps it under the same route group.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="w-full max-w-sm rounded-2xl border border-black/[.08] bg-white p-8 dark:border-white/[.145] dark:bg-[#0a0a0a]">
        {children}
      </div>
    </div>
  );
}
