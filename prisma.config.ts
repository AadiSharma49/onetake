import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Next.js convention keeps env vars in .env.local, not .env — load it explicitly
// since prisma.config.ts runs outside Next's runtime.
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // Migrations need the direct (unpooled) connection — Neon's pooler drops
  // session state Prisma Migrate relies on. The app's runtime client uses
  // the pooled DATABASE_URL instead, wired up via the adapter in src/lib/prisma.ts.
  datasource: {
    url: env("DATABASE_URL_UNPOOLED"),
  },
});
