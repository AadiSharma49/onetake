import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Reuse the client across hot reloads in dev — otherwise each reload opens a new pool.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// App runtime uses the pooled connection; migrations use the direct one (see prisma.config.ts).
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
