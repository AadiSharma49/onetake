"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSignIn } from "@clerk/nextjs";
import { OAUTH_PROVIDERS, type OAuthStrategy } from "@/lib/auth/oauth-providers";
import { OAuthIcon } from "@/components/auth/oauth-icons";

// NOTE: @clerk/nextjs 7.x's useSignIn/useSignUp ("Core 3") hooks have a
// different shape than older Clerk docs show — no isLoaded/setActive, methods
// are namespaced (signIn.password(), signIn.sso(), signIn.finalize()) and
// return { error } instead of throwing. fetchStatus replaces isLoaded/isSubmitting.
export default function SignInPage() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isSubmitting = fetchStatus === "fetching";

  async function navigateHome({ decorateUrl }: { decorateUrl: (path: string) => string }) {
    const url = decorateUrl("/");
    if (url.startsWith("http")) {
      window.location.href = url;
    } else {
      router.push(url);
    }
  }

  async function handleOAuth(strategy: OAuthStrategy) {
    setError(null);
    const { error } = await signIn.sso({
      strategy,
      redirectUrl: "/",
      redirectCallbackUrl: "/sso-callback",
    });
    if (error) setError(error.longMessage ?? error.message);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const { error } = await signIn.password({ identifier: email, password });
    if (error) {
      setError(error.longMessage ?? error.message);
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({ navigate: navigateHome });
    } else {
      // e.g. needs_second_factor / needs_client_trust — not supported in this flow yet.
      setError("Additional verification is required for this account.");
    }
  }

  return (
    <>
        <h1 className="text-xl font-semibold text-black dark:text-zinc-50">Sign in</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Welcome back to OneTake.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          {OAUTH_PROVIDERS.map(({ strategy, label }) => (
            <button
              key={strategy}
              type="button"
              onClick={() => handleOAuth(strategy)}
              disabled={isSubmitting}
              className="flex h-10 items-center justify-center gap-2 rounded-full border border-black/[.08] text-sm font-medium transition-colors hover:bg-black/[.04] disabled:opacity-50 dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
            >
              <OAuthIcon strategy={strategy} />
              Continue with {label}
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-500">
          <div className="h-px flex-1 bg-black/[.08] dark:bg-white/[.145]" />
          or
          <div className="h-px flex-1 bg-black/[.08] dark:bg-white/[.145]" />
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-black/[.08] bg-transparent px-3 py-2 text-sm outline-none focus:border-black/30 dark:border-white/[.145] dark:focus:border-white/30"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-black/[.08] bg-transparent px-3 py-2 text-sm outline-none focus:border-black/30 dark:border-white/[.145] dark:focus:border-white/30"
            />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 flex h-11 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-medium text-zinc-950 dark:text-zinc-50">
            Sign up
          </Link>
        </p>
    </>
  );
}
