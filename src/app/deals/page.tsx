import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES } from "@/data/catalog";
import { PROMO_TYPES, promoTypeLabel } from "@/data/promos";
import { getPromos } from "@/lib/content";
import { all, daysUntil, first, shortDate } from "@/lib/format";
import { AutoSubmitForm } from "@/components/AutoSubmitForm";

export const metadata: Metadata = { title: "Current deals, rebates & pro discounts" };
type SP = Record<string, string | string[] | undefined>;

const TYPE_STYLE: Record<string, string> = {
  rebate: "bg-emerald-500/15 text-emerald-300",
  financing: "bg-sky-500/15 text-sky-300",
  pro: "bg-violet-500/15 text-violet-300",
  military: "bg-lime-500/15 text-lime-300",
  "first-responder": "bg-red-500/15 text-red-300",
  ag: "bg-amber-500/15 text-amber-300",
  loyalty: "bg-carbon-700 text-zinc-100",
  racer: "bg-orange-500/15 text-orange-300",
};

export default async function DealsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const types = all(sp.type).filter(Boolean);
  const make = first(sp.make);
  const cat = first(sp.category);
  const sort = first(sp.sort) ?? "value";
  const PROMOS = await getPromos();
  const makes = Array.from(new Set(PROMOS.map((p) => p.make))).sort();

  const rows = PROMOS.filter(
    (p) => (!types.length || types.includes(p.type)) && (!make || p.make === make) && (!cat || p.categories.includes(cat as never)) && daysUntil(p.ends) >= 0,
  ).sort((a, b) => (sort === "ending" ? a.ends.localeCompare(b.ends) : b.value - a.value));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-display text-4xl font-bold uppercase italic tracking-tight text-white">Deals, rebates &amp; pro discounts</h1>
      <p className="mt-1 max-w-3xl text-zinc-500">
        Every manufacturer offer in one place — cash rebates, promo financing, and the programs most buyers miss:
        pro/industry, military, first responder, farm &amp; ag, loyalty and racer contingency. Many stack with a dealer discount.
      </p>

      <AutoSubmitForm className="card mt-6 space-y-4 p-4">
        <div>
          <span className="label">I am / I want…</span>
          <div className="flex flex-wrap gap-2">
            {PROMO_TYPES.map((t) => (
              <label key={t.id} className="cursor-pointer" title={t.description}>
                <input type="checkbox" name="type" value={t.id} defaultChecked={types.includes(t.id)} className="peer sr-only" />
                <span className="block rounded-full border border-carbon-800 px-3 py-1.5 text-sm font-medium text-zinc-400 peer-checked:border-brand-500 peer-checked:bg-brand-500/10 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand-100">
                  {t.label}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="dm">Brand</label>
            <select id="dm" name="make" defaultValue={make ?? ""} className="field">
              <option value="">All brands</option>
              {makes.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="dc">Vehicle type</label>
            <select id="dc" name="category" defaultValue={cat ?? ""} className="field">
              <option value="">All types</option>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.plural}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="ds">Sort</label>
            <select id="ds" name="sort" defaultValue={sort} className="field">
              <option value="value">Biggest savings</option>
              <option value="ending">Ending soonest</option>
            </select>
          </div>
        </div>
      </AutoSubmitForm>

      <div className="mt-3 rounded-sm border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
        Offers change monthly and vary by region and dealer. Use <b>Verify</b> to confirm on the brand&apos;s site before you go in — and ask the dealer which programs stack.
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rows.map((p) => {
          const left = daysUntil(p.ends);
          return (
            <div key={p.id} className="card flex flex-col p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold">{p.make}</span>
                <span className={`rounded-sm px-2 py-0.5 text-xs font-bold ${TYPE_STYLE[p.type]}`}>{promoTypeLabel(p.type)}</span>
              </div>
              <h2 className="mt-2 font-bold">{p.title}</h2>
              <div className="mt-1 text-2xl font-extrabold text-emerald-400">{p.amount}</div>
              {p.models && <div className="mt-1 text-sm text-zinc-400">{p.models}</div>}
              <p className="mt-2 text-sm text-zinc-400"><b className="text-zinc-100">Who qualifies:</b> {p.eligibility}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {p.categories.map((c) => <span key={c} className="chip">{CATEGORIES.find((x) => x.id === c)?.plural}</span>)}
              </div>
              <div className="mt-auto flex items-center justify-between pt-4 text-sm">
                <span className={left <= 14 ? "font-semibold text-red-400" : "text-zinc-500"}>
                  Ends {shortDate(p.ends)}{left <= 14 ? ` · ${left}d left` : ""}
                  {p.lastVerified && <span className="block text-xs text-zinc-600">Checked {shortDate(p.lastVerified)}</span>}
                </span>
                <span className="flex gap-3">
                  <Link href={`/listings?make=${encodeURIComponent(p.make)}${p.categories.length === 1 ? `&category=${p.categories[0]}` : ""}&condition=new`} className="font-semibold text-zinc-200 hover:underline">Shop</Link>
                  <a href={p.verifyUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-400 hover:underline">Verify ↗</a>
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {rows.length === 0 && <div className="card mt-6 p-10 text-center text-zinc-500">No active offers match those filters.</div>}
    </div>
  );
}
