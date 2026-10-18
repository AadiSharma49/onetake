import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";
import { recordingsFiles, MAX_CHUNK_BYTES } from "@/lib/storage/files";

// Issues one presigned upload URL per chunk. The client calls this once per
// MediaRecorder timeslice (~5s) rather than holding the whole take in memory.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; recordingId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId, recordingId } = await params;
  // Re-checked here (not just in the route that created the Recording row) —
  // this URL is requested repeatedly over the life of the recording.
  const recording = await prisma.recording.findUnique({
    where: { id: recordingId },
    include: { project: true },
  });
  if (!recording || recording.projectId !== projectId || recording.project.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const { chunkIndex } = body;
  if (typeof chunkIndex !== "number" || chunkIndex < 0 || !Number.isInteger(chunkIndex)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const key = `${recording.storageKeyPrefix}${String(chunkIndex).padStart(5, "0")}.part`;
  const signedUpload = await recordingsFiles.signedUploadUrl(key, {
    expiresIn: 300,
    contentType: recording.mimeType,
    maxSize: MAX_CHUNK_BYTES,
  });

  return NextResponse.json(signedUpload);
}
