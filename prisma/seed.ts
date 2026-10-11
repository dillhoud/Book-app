/** `npm run db:seed` — load the bundled sample issues and offers into empty tables. */
import { PrismaClient } from "@prisma/client";
import { loadStarterContent } from "../src/lib/starter";

const prisma = new PrismaClient();
loadStarterContent(prisma)
  .then(({ issues, promos }) => console.log(`Seeded ${issues} issues, ${promos} offers (non-empty tables skipped)`))
  .finally(() => prisma.$disconnect());
