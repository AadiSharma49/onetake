import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Reveal } from "@/components/motion/reveal";

const FEATURES = [
  {
    title: "Points + time limit as input",
    description:
      "Tell OneTake what the video must cover and how long it can be. It guarantees both.",
  },
  {
    title: "Live points tracker",
    description:
      "While you record, points tick off as you speak them, with time left always on screen.",
  },
  {
    title: "Missed point rescue",
    description:
      "Forgot something? Record just that part. OneTake splices it in and re-fits the whole video to your limit.",
  },
  {
    title: "Voice-named highlight",
    description:
      'Say "look at this useEffect" and OneTake finds it on screen and zooms in. Other tools only react to clicks.',
  },
];

const STEPS = [
  { title: "Set your points & limit", description: "Tell it what to cover and how long it can run." },
  { title: "Record naturally", description: "Ramble, restart, go on tangents — doesn't matter." },
  { title: "OneTake fits it", description: "Fillers, pauses, and weak takes get cut automatically." },
  { title: "Get your one take", description: "Download a clean video that hits your limit, every time." },
];

// Reads the session (cookies), so it can't be part of the static shell —
// streams in behind its own <Suspense> boundary instead. See
// https://nextjs.org/docs/app/guides/authentication-with-cache-components
async function HeroCTA() {
  const { userId } = await auth();

  if (userId) {
    return (
      <Link
        href="/dashboard"
        className="mt-10 flex h-12 w-fit items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98]"
      >
        Go to your projects
      </Link>
    );
  }

  return (
    <div className="mt-10 flex flex-col gap-3 sm:flex-row">
      <Link
        href="/sign-up"
        className="flex h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98]"
      >
        Get started free
      </Link>
      <Link
        href="/sign-in"
        className="flex h-12 items-center justify-center rounded-full border border-black/[.08] px-6 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
      >
        Sign in
      </Link>
    </div>
  );
}

// Same reasoning as HeroCTA — reads the session, so it's wrapped separately.
async function FinalCTA() {
  const { userId } = await auth();
  if (userId) return null;

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-24 text-center">
      <Reveal>
        <h2 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl dark:text-zinc-50">
          Ready to stop doing retakes?
        </h2>
        <Link
          href="/sign-up"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98]"
        >
          Get started free
        </Link>
      </Reveal>
    </section>
  );
}

export default function Home() {
  return (
    <main className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      {/* Hero — left-aligned, not centered. A symmetric centered hero is the
          single most recognizable "generic template" tell. */}
      <section className="mx-auto w-full max-w-5xl px-6 py-20 sm:py-28">
        <div className="mb-6 inline-flex items-center gap-2 text-xs font-medium tracking-wide text-accent uppercase">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          Recording, guaranteed to fit
        </div>
        <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-balance text-black sm:text-7xl dark:text-zinc-50">
          One perfect take,{" "}
          <span className="text-accent">guaranteed.</span>
        </h1>
        <p className="mt-6 max-w-lg text-lg text-zinc-600 dark:text-zinc-400">
          Tell OneTake what your video must cover and how long it can be. It
          tracks your points while you record, patches anything you missed,
          and fits it to the limit.
        </p>
        <Suspense fallback={<div className="mt-10 h-12" />}>
          <HeroCTA />
        </Suspense>
      </section>

      {/* Problem framing */}
      <section className="border-y border-black/[.08] bg-white px-6 py-16 dark:border-white/[.145] dark:bg-[#0a0a0a]">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-base text-zinc-600 sm:text-lg dark:text-zinc-400">
            Job portals, take-home tasks, and applications ask for short
            videos with hard limits — &quot;max 3 minutes&quot;, &quot;1 minute
            founder video&quot;. Most people either do endless nervous retakes,
            or upload something rambling and over the limit. OneTake records
            you freely, then gives back what looks like one perfect take.
          </p>
        </Reveal>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-5xl px-6 py-20">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl dark:text-zinc-50">
            How it works
          </h2>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.08} className="flex flex-col items-start gap-2">
              <span className="text-sm font-medium text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-base font-semibold text-black dark:text-zinc-50">
                {step.title}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{step.description}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* USP features */}
      <section className="border-t border-black/[.08] bg-white px-6 py-20 dark:border-white/[.145] dark:bg-[#0a0a0a]">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl dark:text-zinc-50">
              What no other tool does
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {FEATURES.map((feature, i) => (
              <Reveal
                key={feature.title}
                delay={i * 0.08}
                className="group rounded-2xl border border-black/[.08] p-6 transition-colors hover:border-accent/40 dark:border-white/[.145]"
              >
                <h3 className="text-base font-semibold text-black dark:text-zinc-50">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {feature.description}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <Suspense fallback={null}>
        <FinalCTA />
      </Suspense>

      <footer className="border-t border-black/[.08] px-6 py-8 text-center text-sm text-zinc-500 dark:border-white/[.145] dark:text-zinc-500">
        OneTake
      </footer>
    </main>
  );
}
