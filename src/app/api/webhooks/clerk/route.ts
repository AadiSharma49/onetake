import type { NextRequest } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { prisma } from "@/lib/db/prisma";

// Clerk calls this on every user.created/updated/deleted event (email, Google,
// Slack, Atlassian sign-ups all funnel through the same events) so Postgres
// stays in sync with Clerk's identity data. Signature is verified via
// CLERK_WEBHOOK_SIGNING_SECRET before anything in the payload is trusted.
export async function POST(request: NextRequest) {
  let evt;
  try {
    evt = await verifyWebhook(request);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  switch (evt.type) {
    case "user.created":
    case "user.updated": {
      const { id, email_addresses, primary_email_address_id, first_name, last_name } = evt.data;
      const primaryEmail = email_addresses.find((e) => e.id === primary_email_address_id);
      if (!primaryEmail) break;

      const name = [first_name, last_name].filter(Boolean).join(" ") || null;

      await prisma.user.upsert({
        where: { clerkId: id },
        create: { clerkId: id, email: primaryEmail.email_address, name },
        update: { email: primaryEmail.email_address, name },
      });
      break;
    }
    case "user.deleted": {
      if (evt.data.id) {
        await prisma.user.deleteMany({ where: { clerkId: evt.data.id } });
      }
      break;
    }
  }

  return new Response("OK", { status: 200 });
}
