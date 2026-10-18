import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";
import { matchCoveredPoints } from "@/lib/ai/match-points";

// Called periodically (debounced client-side) while recording, with the
// transcript accumulated so far. Only checks points not already covered.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { points: true },
  });
  if (!project || project.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const transcript = String(body.transcript ?? "");

  const unmetPoints = project.points.filter((p) => !p.covered);
  if (unmetPoints.length === 0) {
    return NextResponse.json({ coveredPointIds: [] });
  }

  let coveredPointIds: string[];
  try {
    coveredPointIds = await matchCoveredPoints(
      transcript,
      unmetPoints.map((p) => ({ id: p.id, text: p.text }))
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Matching failed" },
      { status: 502 }
    );
  }

  if (coveredPointIds.length > 0) {
    await prisma.point.updateMany({
      where: { id: { in: coveredPointIds }, projectId },
      data: { covered: true },
    });
  }

  return NextResponse.json({ coveredPointIds });
}
