"use client";

import Link from "next/link";
import { useClerk, useUser } from "@clerk/nextjs";

// Custom replacement for Clerk's <UserButton>/<SignInButton> — built on the
// headless useUser/useClerk hooks so the UI matches the app instead of Clerk's styling.
export function AuthNav() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded) {
    return <div className="h-9 w-20" />;
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center gap-3 text-sm font-medium">
        <Link href="/sign-in" className="text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white">
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="rounded-full bg-foreground px-4 py-2 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-zinc-700 dark:text-zinc-300">
        {user.firstName ?? user.primaryEmailAddress?.emailAddress}
      </span>
      <button
        onClick={() => signOut({ redirectUrl: "/" })}
        className="rounded-full border border-black/[.08] px-4 py-2 font-medium transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
      >
        Sign out
      </button>
    </div>
  );
}
