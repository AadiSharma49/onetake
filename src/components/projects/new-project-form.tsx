"use client";

import { useState } from "react";
import { createProject } from "@/app/(app)/projects/new/actions";

export function NewProjectForm() {
  const [points, setPoints] = useState([""]);

  return (
    <form action={createProject} className="flex flex-col gap-6">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">Title</span>
        <input
          name="title"
          required
          placeholder="e.g. Founder intro video"
          className="rounded-lg border border-black/[.08] bg-transparent px-3 py-2 text-sm outline-none focus:border-black/30 dark:border-white/[.145] dark:focus:border-white/30"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">Time limit (minutes)</span>
        <input
          name="timeLimitMinutes"
          type="number"
          min={0.5}
          step={0.5}
          required
          defaultValue={3}
          className="w-32 rounded-lg border border-black/[.08] bg-transparent px-3 py-2 text-sm outline-none focus:border-black/30 dark:border-white/[.145] dark:focus:border-white/30"
        />
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Points your video must cover
        </span>
        {points.map((_, i) => (
          <div key={i} className="flex gap-2">
            <input
              name="points"
              placeholder={`Point ${i + 1}`}
              className="flex-1 rounded-lg border border-black/[.08] bg-transparent px-3 py-2 text-sm outline-none focus:border-black/30 dark:border-white/[.145] dark:focus:border-white/30"
            />
            {points.length > 1 && (
              <button
                type="button"
                onClick={() => setPoints((prev) => prev.filter((_, j) => j !== i))}
                className="px-2 text-sm text-zinc-500 hover:text-accent"
                aria-label={`Remove point ${i + 1}`}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setPoints((prev) => [...prev, ""])}
          className="self-start text-sm font-medium text-accent"
        >
          + Add a point
        </button>
      </div>

      <button
        type="submit"
        className="flex h-11 items-center justify-center rounded-full bg-accent text-sm font-medium text-accent-foreground transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
      >
        Create project
      </button>
    </form>
  );
}
