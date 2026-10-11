import { PrismaClient } from "@prisma/client";

/** True when a database is configured. Without one the site runs on the bundled sample data. */
export const hasDb = Boolean(process.env.DATABASE_URL);

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
