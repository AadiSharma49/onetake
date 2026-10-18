import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";

const VALID_STATUSES = ["READY", "FAILED"] as const;

// Marks a track's upload as finished (all chunks confirmed) or failed.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; recordingId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId, recordingId } = await params;
  const recording = await prisma.recording.findUnique({
    where: { id: recordingId },
    include: { project: true },
  });
  if (!recording || recording.projectId !== projectId || recording.project.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const { status, durationMs } = body;
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const updated = await prisma.recording.update({
    where: { id: recordingId },
    data: { status, durationMs: typeof durationMs === "number" ? durationMs : undefined },
  });

  return NextResponse.json({ status: updated.status });
}
