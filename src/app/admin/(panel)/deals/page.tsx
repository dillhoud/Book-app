import Link from "next/link";
import { redirect } from "next/navigation";
import { promoTypeLabel } from "@/data/promos";
import { hasDb, prisma } from "@/lib/db";
import { toPromoType } from "@/lib/content";
import { daysAgo, daysUntil, shortDate } from "@/lib/format";
import { AutoSubmitForm } from "@/components/AutoSubmitForm";
import { quickPromo } from "../../actions";
import { Flash, StatusPill } from "../ui";


export default async function AdminDeals({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  if (!hasDb) redirect("/admin");
  const sp = await searchParams;
  const today = new Date(new Date().toISOString().slice(0, 10));
  const stale = daysAgo(30);
  const status = sp.status ?? "";

  const [rows, makes] = await Promise.all([
    prisma.promo.findMany({
      where: {
        ...(sp.make ? { make: sp.make } : {}),
        ...(status === "live" ? { published: true, ends: { gte: today } } : {}),
        ...(status === "draft" ? { published: false } : {}),
        ...(status === "expired" ? { ends: { lt: today } } : {}),
        ...(status === "unchecked" ? { ends: { gte: today }, OR: [{ lastVerified: null }, { lastVerified: { lt: stale } }] } : {}),
      },
      orderBy: [{ ends: "asc" }],
    }),
    prisma.promo.findMany({ distinct: ["make"], select: { make: true }, orderBy: { make: "asc" } }),
  ]);
  const keep = new URLSearchParams(Object.entries(sp).filter(([k, v]) => v && !["saved", "deleted", "error"].includes(k)) as [string, string][]);
  const back = `/admin/deals${keep.size ? `?${keep}` : ""}`;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold uppercase italic tracking-tight text-white">Deals</h1>
          <p className="mt-1 text-sm text-zinc-500">{rows.length} shown · sorted by end date</p>
        </div>
        <Link href="/admin/deals/new" className="btn-primary">Add deal</Link>
      </div>
      <Flash sp={sp} />

      <AutoSubmitForm className="card mt-6 grid gap-3 p-4 sm:grid-cols-2">
        <select name="make" defaultValue={sp.make ?? ""} className="field" aria-label="Brand">
          <option value="">All brands</option>
          {makes.map(({ make }) => <option key={make}>{make}</option>)}
        </select>
        <select name="status" defaultValue={status} className="field" aria-label="Status">
          <option value="">Any status</option>
          <option value="live">Live</option>
          <option value="draft">Drafts</option>
          <option value="unchecked">Not checked in 30 days</option>
          <option value="expired">Expired</option>
        </select>
      </AutoSubmitForm>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="eyebrow border-b border-carbon-800 text-left text-zinc-500">
              <th className="p-3 font-semibold">Offer</th>
              <th className="p-3 font-semibold">Value</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold">Ends</th>
              <th className="p-3 font-semibold">Last checked</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-carbon-800">
            {rows.map((p) => {
              const ends = p.ends.toISOString().slice(0, 10);
              const left = daysUntil(ends);
              const checked = p.lastVerified && p.lastVerified > stale;
              return (
                <tr key={p.id} className="hover:bg-carbon-850">
                  <td className="p-3">
                    <Link href={`/admin/deals/${p.id}`} className="font-semibold text-white hover:text-brand-400">{p.make} · {p.title}</Link>
                    <div className="text-xs text-zinc-500">{promoTypeLabel(toPromoType(p.type))}</div>
                  </td>
                  <td className="p-3 font-semibold text-emerald-400">{p.amount}</td>
                  <td className="p-3">{left < 0 ? <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Expired</span> : <StatusPill live={p.published} />}</td>
                  <td className={`whitespace-nowrap p-3 text-xs ${left < 0 ? "text-zinc-600" : left <= 14 ? "text-amber-400" : "text-zinc-400"}`}>
                    {shortDate(ends)}{left >= 0 && left <= 14 ? ` · ${left}d` : ""}
                  </td>
                  <td className={`p-3 text-xs ${checked ? "text-zinc-400" : "text-amber-400"}`}>
                    {p.lastVerified ? shortDate(p.lastVerified.toISOString().slice(0, 10)) : "Never"}
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <a href={p.verifyUrl} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap rounded-sm border border-carbon-700 px-2 py-1 text-[11px] font-semibold text-zinc-300 hover:border-zinc-400 hover:text-white">Open brand site ↗</a>
                      <Quick id={p.id} back={back} op="verify" label="Mark checked" />
                      <Quick id={p.id} back={back} op={p.published ? "unpublish" : "publish"} label={p.published ? "Unpublish" : "Publish"} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-8 text-center text-sm text-zinc-500">No deals match.</p>}
      </div>
    </div>
  );
}

function Quick({ id, back, op, label }: { id: string; back: string; op: string; label: string }) {
  return (
    <form action={quickPromo}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="op" value={op} />
      <input type="hidden" name="back" value={back} />
      <button className="whitespace-nowrap rounded-sm border border-carbon-700 px-2 py-1 text-[11px] font-semibold text-zinc-300 hover:border-zinc-400 hover:text-white">{label}</button>
    </form>
  );
}
