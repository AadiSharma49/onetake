import Link from "next/link";

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

export default function Home() {
  return (
    <main className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      {/* Hero */}
      <section className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-20 text-center sm:py-28">
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-black sm:text-6xl dark:text-zinc-50">
          One perfect take, guaranteed.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          Tell OneTake what your video must cover and how long it can be. It
          tracks your points while you record, patches anything you missed,
          and fits it to the limit.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/sign-up"
            className="flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
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
      </section>

      {/* Problem framing */}
      <section className="border-y border-black/[.08] bg-white px-6 py-16 dark:border-white/[.145] dark:bg-[#0a0a0a]">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-base text-zinc-600 sm:text-lg dark:text-zinc-400">
            Job portals, take-home tasks, and applications ask for short
            videos with hard limits — &quot;max 3 minutes&quot;, &quot;1 minute
            founder video&quot;. Most people either do endless nervous retakes,
            or upload something rambling and over the limit. OneTake records
            you freely, then gives back what looks like one perfect take.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-5xl px-6 py-20">
        <h2 className="text-center text-2xl font-semibold text-black sm:text-3xl dark:text-zinc-50">
          How it works
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex flex-col items-start gap-2">
              <span className="text-sm font-medium text-zinc-400 dark:text-zinc-500">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-base font-semibold text-black dark:text-zinc-50">
                {step.title}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* USP features */}
      <section className="border-t border-black/[.08] bg-white px-6 py-20 dark:border-white/[.145] dark:bg-[#0a0a0a]">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-semibold text-black sm:text-3xl dark:text-zinc-50">
            What no other tool does
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-black/[.08] p-6 dark:border-white/[.145]"
              >
                <h3 className="text-base font-semibold text-black dark:text-zinc-50">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-20 text-center">
        <h2 className="text-2xl font-semibold text-black sm:text-3xl dark:text-zinc-50">
          Ready to stop doing retakes?
        </h2>
        <Link
          href="/sign-up"
          className="mt-8 flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          Get started free
        </Link>
      </section>

      <footer className="border-t border-black/[.08] px-6 py-8 text-center text-sm text-zinc-500 dark:border-white/[.145] dark:text-zinc-500">
        OneTake
      </footer>
    </main>
  );
}
