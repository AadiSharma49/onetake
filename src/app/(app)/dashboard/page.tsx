import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";

// Entirely private — same reasoning as the record page.
export const instant = false;

export default async function DashboardPage() {
  await auth.protect();

  const user = await getCurrentUser();
  const projects = user
    ? await prisma.project.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-black dark:text-zinc-50">Your projects</h1>
        <Link
          href="/projects/new"
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98]"
        >
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-600 dark:text-zinc-400">
          No projects yet. Create one to start recording.
        </p>
      ) : (
        <ul className="mt-8 flex flex-col gap-2">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/projects/${project.id}/record`}
                className="flex items-center justify-between rounded-2xl border border-black/[.08] p-4 transition-colors hover:border-accent/40 dark:border-white/[.145]"
              >
                <span className="text-sm font-medium text-black dark:text-zinc-50">
                  {project.title}
                </span>
                <span className="text-xs text-zinc-500">{project.status}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
