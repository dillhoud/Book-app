import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CATEGORIES, MAKES } from "@/data/catalog";
import { PROMO_TYPES } from "@/data/promos";
import { hasDb, prisma } from "@/lib/db";
import { toPromoType } from "@/lib/content";
import { shortDate } from "@/lib/format";
import { ConfirmButton } from "@/components/ConfirmButton";
import { deletePromo, savePromo } from "../../../actions";
import { Field, Flash } from "../../ui";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> };

export default async function EditDeal({ params, searchParams }: Props) {
  if (!hasDb) redirect("/admin");
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const isNew = id === "new";
  const p = isNew ? null : await prisma.promo.findUnique({ where: { id } });
  if (!isNew && !p) notFound();

  return (
    <div className="max-w-3xl">
      <Link href="/admin/deals" className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-white">← All deals</Link>
      <h1 className="font-display mt-2 text-4xl font-bold uppercase italic tracking-tight text-white">{isNew ? "Add deal" : "Edit deal"}</h1>
      {p?.lastVerified && <p className="mt-1 text-sm text-zinc-500">Last checked {shortDate(p.lastVerified.toISOString().slice(0, 10))}</p>}
      <Flash sp={sp} />

      <form action={savePromo} className="card mt-6 space-y-5 p-6">
        {p && <input type="hidden" name="id" value={p.id} />}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Brand">
            <input name="make" required list="makes" defaultValue={p?.make} className="field" />
            <datalist id="makes">{MAKES.map((m) => <option key={m} value={m} />)}</datalist>
          </Field>
          <Field label="Offer type">
            <select name="type" required defaultValue={p ? toPromoType(p.type) : "rebate"} className="field">
              {PROMO_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label} — {t.description}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Title">
          <input name="title" required defaultValue={p?.title} placeholder="Fall Sales Event — RZR" className="field" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Offer as shown" hint='e.g. "Up to $2,000 off", "1.99% APR / 36 mo"'>
            <input name="amount" required defaultValue={p?.amount} className="field" />
          </Field>
          <Field label="Rough $ value" hint="Only used to sort by biggest savings.">
            <input name="value" type="number" min={0} step={50} defaultValue={p?.value ?? 0} className="field" />
          </Field>
        </div>

        <fieldset>
          <legend className="label">Vehicle types</legend>
          <div className="flex flex-wrap gap-4 text-sm text-zinc-300">
            {CATEGORIES.map((c) => (
              <label key={c.id} className="flex items-center gap-2">
                <input type="checkbox" name="categories" value={c.id} defaultChecked={p?.categories.includes(c.id)} className="accent-brand-500" /> {c.plural}
              </label>
            ))}
          </div>
        </fieldset>

        <Field label="Models covered (optional)" hint='e.g. "Select 2025–2026 RZR"'>
          <input name="models" defaultValue={p?.models ?? ""} className="field" />
        </Field>
        <Field label="Who qualifies">
          <textarea name="eligibility" required rows={2} defaultValue={p?.eligibility} className="field" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ends">
            <input name="ends" type="date" required defaultValue={p?.ends.toISOString().slice(0, 10)} className="field" />
          </Field>
          <Field label="Verify link" hint="The brand's offer page — shown on the site as “Verify”.">
            <input name="verifyUrl" type="url" required defaultValue={p?.verifyUrl} placeholder="https://" className="field" />
          </Field>
        </div>

        <div className="flex flex-wrap gap-6 border-t border-carbon-800 pt-5 text-sm text-zinc-300">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="published" defaultChecked={p?.published ?? false} className="accent-brand-500" /> Live on the site
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="verified" defaultChecked={isNew} className="accent-brand-500" /> I&apos;ve checked this on the brand&apos;s site today
          </label>
        </div>

        <button className="btn-primary">{isNew ? "Add deal" : "Save changes"}</button>
      </form>

      {p && (
        <form action={deletePromo} className="mt-6">
          <input type="hidden" name="id" value={p.id} />
          <ConfirmButton message={`Delete "${p.make} · ${p.title}"? This can't be undone.`} className="text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300">
            Delete this deal
          </ConfirmButton>
        </form>
      )}
    </div>
  );
}
