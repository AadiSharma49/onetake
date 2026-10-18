import { auth } from "@clerk/nextjs/server";
import { NewProjectForm } from "@/components/projects/new-project-form";

// Entirely private — same reasoning as the record page.
export const instant = false;

export default async function NewProjectPage() {
  await auth.protect();

  return (
    <main className="mx-auto w-full max-w-xl px-6 py-16">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">New project</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Set what your video must cover and how long it can be.
      </p>
      <div className="mt-8">
        <NewProjectForm />
      </div>
    </main>
  );
}
