"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";

export async function createProject(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const title = String(formData.get("title") ?? "").trim();
  const timeLimitMinutes = Number(formData.get("timeLimitMinutes"));
  const points = formData
    .getAll("points")
    .map((p) => String(p).trim())
    .filter((p) => p.length > 0);

  if (!title || !Number.isFinite(timeLimitMinutes) || timeLimitMinutes <= 0) {
    throw new Error("Title and a valid time limit are required.");
  }

  const project = await prisma.project.create({
    data: {
      userId: user.id,
      title,
      timeLimitSeconds: Math.round(timeLimitMinutes * 60),
      points: {
        create: points.map((text, order) => ({ text, order })),
      },
    },
  });

  redirect(`/projects/${project.id}/record`);
}
