import Link from "next/link";
import { redirect } from "next/navigation";
import { CATALOG, getModel } from "@/data/catalog";
import { hasDb, prisma } from "@/lib/db";
import { daysAgo, shortDate } from "@/lib/format";
import { AutoSubmitForm } from "@/components/AutoSubmitForm";
import { quickIssue } from "../../actions";
import { Flash, StatusPill } from "../ui";


export default async function AdminIssues({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  if (!hasDb) redirect("/admin");
  const sp = await searchParams;
  const stale = daysAgo(30);
  const status = sp.status ?? "";
  const q = sp.q?.trim();

  const rows = await prisma.issue.findMany({
    where: {
      ...(sp.model ? { modelSlug: sp.model } : {}),
      ...(status === "live" ? { published: true } : status === "draft" ? { published: false } : {}),
      ...(status === "unchecked" ? { OR: [{ lastVerified: null }, { lastVerified: { lt: stale } }] } : {}),
      ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { symptoms: { contains: q, mode: "insensitive" } }] } : {}),
    },
    orderBy: [{ modelSlug: "asc" }, { mentions: "desc" }],
  });
  const keep = new URLSearchParams(Object.entries(sp).filter(([k, v]) => v && !["saved", "deleted", "error"].includes(k)) as [string, string][]);
  const back = `/admin/issues${keep.size ? `?${keep}` : ""}`;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold uppercase italic tracking-tight text-white">Known issues</h1>
          <p className="mt-1 text-sm text-zinc-500">{rows.length} shown</p>
        </div>
        <Link href="/admin/issues/new" className="btn-primary">Add issue</Link>
      </div>
      <Flash sp={sp} />

      <AutoSubmitForm className="card mt-6 grid gap-3 p-4 sm:grid-cols-3">
        <input name="q" defaultValue={q} placeholder="Search title or symptoms" className="field" aria-label="Search" />
        <select name="model" defaultValue={sp.model ?? ""} className="field" aria-label="Model">
          <option value="">All models</option>
          {CATALOG.map((m) => <option key={m.slug} value={m.slug}>{m.make} {m.model}</option>)}
        </select>
        <select name="status" defaultValue={status} className="field" aria-label="Status">
          <option value="">Any status</option>
          <option value="live">Live</option>
          <option value="draft">Drafts</option>
          <option value="unchecked">Not checked in 30 days</option>
        </select>
      </AutoSubmitForm>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="eyebrow border-b border-carbon-800 text-left text-zinc-500">
              <th className="p-3 font-semibold">Issue</th>
              <th className="p-3 font-semibold">Severity</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold">Last checked</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-carbon-800">
            {rows.map((i) => {
              const m = getModel(i.modelSlug);
              const checked = i.lastVerified && i.lastVerified > stale;
              return (
                <tr key={i.id} className="hover:bg-carbon-850">
                  <td className="p-3">
                    <Link href={`/admin/issues/${i.id}`} className="font-semibold text-white hover:text-brand-400">{i.title}</Link>
                    <div className="text-xs text-zinc-500">
                      {m ? `${m.make} ${m.model}` : i.modelSlug} · {i.years} · {i.sourceUrls.length} source link{i.sourceUrls.length === 1 ? "" : "s"}
                    </div>
                  </td>
                  <td className={`p-3 text-xs font-bold uppercase ${i.severity === "major" ? "text-red-400" : i.severity === "moderate" ? "text-amber-400" : "text-zinc-400"}`}>{i.severity}</td>
                  <td className="p-3"><StatusPill live={i.published} /></td>
                  <td className={`p-3 text-xs ${checked ? "text-zinc-400" : "text-amber-400"}`}>
                    {i.lastVerified ? shortDate(i.lastVerified.toISOString().slice(0, 10)) : "Never"}
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <Quick id={i.id} back={back} op="verify" label="Mark checked" />
                      <Quick id={i.id} back={back} op={i.published ? "unpublish" : "publish"} label={i.published ? "Unpublish" : "Publish"} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-8 text-center text-sm text-zinc-500">No issues match.</p>}
      </div>
    </div>
  );
}

function Quick({ id, back, op, label }: { id: string; back: string; op: string; label: string }) {
  return (
    <form action={quickIssue}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="op" value={op} />
      <input type="hidden" name="back" value={back} />
      <button className="whitespace-nowrap rounded-sm border border-carbon-700 px-2 py-1 text-[11px] font-semibold text-zinc-300 hover:border-zinc-400 hover:text-white">{label}</button>
    </form>
  );
}
