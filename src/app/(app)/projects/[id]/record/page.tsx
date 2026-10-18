import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";
import { Recorder } from "@/components/recorder/recorder";

// Entirely private/per-session — there's no static shell worth separating
// out via Suspense (even the heading is the signed-in user's own project
// title), so this opts out of prerendering outright rather than streaming.
export const instant = false;

export default async function RecordPage({ params }: { params: Promise<{ id: string }> }) {
  await auth.protect(); // redirects to sign-in if signed out

  const { id } = await params;
  const user = await getCurrentUser();
  const project = user
    ? await prisma.project.findUnique({
        where: { id },
        include: { points: { orderBy: { order: "asc" } } },
      })
    : null;

  // 404 rather than redirect for a missing/non-owned project — don't reveal
  // whether a given id exists.
  if (!user || !project || project.userId !== user.id) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">{project.title}</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Screen, camera, and mic record as separate tracks.
      </p>
      <div className="mt-8">
        <Recorder
          projectId={project.id}
          timeLimitSeconds={project.timeLimitSeconds}
          initialPoints={project.points.map((p) => ({ id: p.id, text: p.text, covered: p.covered }))}
        />
      </div>
    </main>
  );
}
