import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CATALOG, CATEGORIES } from "@/data/catalog";
import { hasDb, prisma } from "@/lib/db";
import { toKind } from "@/lib/content";
import { shortDate } from "@/lib/format";
import { ConfirmButton } from "@/components/ConfirmButton";
import { deleteIssue, saveIssue } from "../../../actions";
import { Field, Flash } from "../../ui";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> };

export default async function EditIssue({ params, searchParams }: Props) {
  if (!hasDb) redirect("/admin");
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const isNew = id === "new";
  const i = isNew ? null : await prisma.issue.findUnique({ where: { id } });
  if (!isNew && !i) notFound();

  return (
    <div className="max-w-3xl">
      <Link href="/admin/issues" className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-white">← All issues</Link>
      <h1 className="font-display mt-2 text-4xl font-bold uppercase italic tracking-tight text-white">{isNew ? "Add issue" : "Edit issue"}</h1>
      {i?.lastVerified && <p className="mt-1 text-sm text-zinc-500">Last checked {shortDate(i.lastVerified.toISOString().slice(0, 10))}</p>}
      <Flash sp={sp} />

      <form action={saveIssue} className="card mt-6 space-y-5 p-6">
        {i && <input type="hidden" name="id" value={i.id} />}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Model">
            <select name="modelSlug" required defaultValue={i?.modelSlug ?? sp.model ?? ""} className="field">
              <option value="" disabled>Choose a model…</option>
              {CATEGORIES.map((c) => (
                <optgroup key={c.id} label={c.plural}>
                  {CATALOG.filter((m) => m.category === c.id).map((m) => <option key={m.slug} value={m.slug}>{m.make} {m.model}</option>)}
                </optgroup>
              ))}
            </select>
          </Field>
          <Field label="Model years affected" hint='e.g. "2017–2020", "Some 2021–2022" or "All"'>
            <input name="years" defaultValue={i?.years ?? "All"} className="field" />
          </Field>
        </div>

        <Field label="Title" hint="Short and specific — what owners would search for.">
          <input name="title" required defaultValue={i?.title} placeholder="Drive belt wear / failure" className="field" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Severity">
            <select name="severity" required defaultValue={i?.severity ?? "moderate"} className="field">
              <option value="minor">Minor — annoyance, cheap fix</option>
              <option value="moderate">Moderate — can strand you or cost real money</option>
              <option value="major">Major — safety, recall or engine/drivetrain</option>
            </select>
          </Field>
          <Field label="Where it comes from">
            <select name="kind" required defaultValue={i ? toKind(i.kind) : "owner-reported"} className="field">
              <option value="owner-reported">Owner-reported (forums, Reddit)</option>
              <option value="service-bulletin">Service bulletin</option>
              <option value="recall">Official recall</option>
            </select>
          </Field>
        </div>

        <Field label="Symptoms">
          <textarea name="symptoms" required rows={3} defaultValue={i?.symptoms} className="field" />
        </Field>
        <Field label="Common fix">
          <textarea name="fix" required rows={3} defaultValue={i?.fix} className="field" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Typical cost" hint='e.g. "$150–$250" or "Free (recall)"'>
            <input name="estCost" defaultValue={i?.estCost} className="field" />
          </Field>
          <Field label="Owner discussions (approx.)" hint="Rough count of threads/posts you found.">
            <input name="mentions" type="number" min={0} defaultValue={i?.mentions ?? 0} className="field" />
          </Field>
        </div>

        <Field label="Communities" hint="Comma-separated, e.g. r/RZR, RZRForums">
          <input name="sources" defaultValue={i?.sources.join(", ")} className="field" />
        </Field>
        <Field label="Source links" hint="One per line — the actual threads or recall notices. Shown on the site so riders can read more.">
          <textarea name="sourceUrls" rows={4} defaultValue={i?.sourceUrls.join("\n")} placeholder={"https://www.reddit.com/r/RZR/comments/…\nhttps://www.cpsc.gov/Recalls/…"} className="field font-mono text-xs" />
        </Field>

        <div className="flex flex-wrap gap-6 border-t border-carbon-800 pt-5 text-sm text-zinc-300">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="published" defaultChecked={i?.published ?? false} className="accent-brand-500" /> Live on the site
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="verified" defaultChecked={isNew} className="accent-brand-500" /> I&apos;ve checked this today
          </label>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button className="btn-primary">{isNew ? "Add issue" : "Save changes"}</button>
          {i && <span className="text-xs text-zinc-600">Updated {shortDate(i.updatedAt.toISOString().slice(0, 10))}</span>}
        </div>
      </form>

      {i && (
        <form action={deleteIssue} className="mt-6">
          <input type="hidden" name="id" value={i.id} />
          <ConfirmButton message={`Delete "${i.title}"? This can't be undone.`} className="text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300">
            Delete this issue
          </ConfirmButton>
        </form>
      )}
    </div>
  );
}
