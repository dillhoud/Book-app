import "server-only";
import type { Issue as DbIssue, Promo as DbPromo } from "@prisma/client";
import type { Category } from "@/data/catalog";
import { ISSUES, type CommonIssue, type IssueKind, type Severity } from "@/data/issues";
import { PROMOS, type Promo, type PromoType } from "@/data/promos";
import { hasDb, prisma } from "./db";

// The DB enums use underscores; the app has always used hyphens.
export const toKind = (k: DbIssue["kind"]) => k.replace(/_/g, "-") as IssueKind;
export const fromKind = (k: string) => k.replace(/-/g, "_") as DbIssue["kind"];
export const toPromoType = (t: DbPromo["type"]) => t.replace(/_/g, "-") as PromoType;
export const fromPromoType = (t: string) => t.replace(/-/g, "_") as DbPromo["type"];

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

function mapIssue(i: DbIssue): CommonIssue {
  return {
    id: i.id,
    modelSlug: i.modelSlug,
    title: i.title,
    severity: i.severity as Severity,
    kind: toKind(i.kind),
    years: i.years,
    symptoms: i.symptoms,
    fix: i.fix,
    estCost: i.estCost,
    mentions: i.mentions,
    sources: i.sources,
    sourceUrls: i.sourceUrls,
    lastVerified: i.lastVerified ? isoDate(i.lastVerified) : undefined,
  };
}

function mapPromo(p: DbPromo): Promo {
  return {
    id: p.id,
    make: p.make,
    type: toPromoType(p.type),
    title: p.title,
    amount: p.amount,
    value: p.value,
    categories: p.categories as Category[],
    models: p.models ?? undefined,
    eligibility: p.eligibility,
    ends: isoDate(p.ends),
    verifyUrl: p.verifyUrl,
    lastVerified: p.lastVerified ? isoDate(p.lastVerified) : undefined,
  };
}

const SEV_ORDER: Record<Severity, number> = { major: 0, moderate: 1, minor: 2 };
const bySeverity = (a: CommonIssue, b: CommonIssue) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity] || b.mentions - a.mentions;

/** Published issues (all of them, or one model's). */
export async function getIssues(modelSlug?: string): Promise<CommonIssue[]> {
  if (!hasDb) return ISSUES.filter((i) => !modelSlug || i.modelSlug === modelSlug).sort(bySeverity);
  const rows = await prisma.issue.findMany({ where: { published: true, ...(modelSlug ? { modelSlug } : {}) } });
  return rows.map(mapIssue).sort(bySeverity);
}

/** Published offers that haven't ended yet. */
export async function getPromos(make?: string): Promise<Promo[]> {
  const today = new Date(new Date().toISOString().slice(0, 10));
  if (!hasDb) return PROMOS.filter((p) => (!make || p.make === make) && new Date(p.ends) >= today);
  const rows = await prisma.promo.findMany({ where: { published: true, ends: { gte: today }, ...(make ? { make } : {}) } });
  return rows.map(mapPromo);
}
