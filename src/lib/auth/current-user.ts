import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";

// Maps the Clerk session to our own User row. Returns null when signed out
// or when the webhook sync hasn't landed yet (race on a brand-new sign-up).
export async function getCurrentUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  return prisma.user.findUnique({ where: { clerkId } });
}
