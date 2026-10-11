import type { PrismaClient } from "@prisma/client";
import { ISSUES } from "../data/issues";
import { PROMOS } from "../data/promos";

/**
 * Copies the bundled sample issues and offers into empty tables. Rows are
 * published but not marked checked, so they show up in "to check" lists.
 * Tables that already have rows are left alone.
 */
export async function loadStarterContent(prisma: PrismaClient) {
  let issues = 0;
  let promos = 0;
  if ((await prisma.issue.count()) === 0) {
    ({ count: issues } = await prisma.issue.createMany({
      data: ISSUES.map((i) => ({
        modelSlug: i.modelSlug,
        title: i.title,
        severity: i.severity,
        kind: i.kind.replace(/-/g, "_") as "owner_reported" | "service_bulletin" | "recall",
        years: i.years,
        symptoms: i.symptoms,
        fix: i.fix,
        estCost: i.estCost,
        mentions: i.mentions,
        sources: i.sources,
        sourceUrls: [],
        published: true,
      })),
    }));
  }
  if ((await prisma.promo.count()) === 0) {
    ({ count: promos } = await prisma.promo.createMany({
      data: PROMOS.map((p) => ({
        make: p.make,
        type: p.type.replace(/-/g, "_") as "rebate",
        title: p.title,
        amount: p.amount,
        value: p.value,
        categories: p.categories,
        models: p.models ?? null,
        eligibility: p.eligibility,
        ends: new Date(p.ends),
        verifyUrl: p.verifyUrl,
        published: true,
      })),
    }));
  }
  return { issues, promos };
}
