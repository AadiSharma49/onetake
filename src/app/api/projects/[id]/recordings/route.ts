import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";

const VALID_KINDS = ["SCREEN", "CAMERA", "MIC"] as const;

// Creates one Recording row per track. Called once per track when the
// recorder starts (not per chunk — chunk-url/route.ts handles those).
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId } = await params;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  // 404 rather than 403 for a non-owned project — don't reveal it exists.
  if (!project || project.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const { kind, mimeType, startOffsetMs } = body;
  if (
    !VALID_KINDS.includes(kind) ||
    typeof mimeType !== "string" ||
    typeof startOffsetMs !== "number"
  ) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const recordingId = randomUUID();
  const storageKeyPrefix = `recordings/${projectId}/${recordingId}/`;

  const recording = await prisma.recording.create({
    data: { id: recordingId, projectId, kind, mimeType, startOffsetMs, storageKeyPrefix },
  });

  return NextResponse.json({
    recordingId: recording.id,
    storageKeyPrefix: recording.storageKeyPrefix,
  });
}
