export function StatusPill({ live }: { live: boolean }) {
  return live ? (
    <span className="rounded-sm bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400">Live</span>
  ) : (
    <span className="rounded-sm bg-carbon-700 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400">Draft</span>
  );
}

export function Flash({ sp }: { sp: Record<string, string | undefined> }) {
  const msg = sp.saved ? "Saved — the public site is updated." : sp.deleted ? "Deleted." : null;
  if (sp.error) return <p className="mt-4 rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{sp.error}</p>;
  if (!msg) return null;
  return <p className="mt-4 rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{msg}</p>;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-zinc-600">{hint}</span>}
    </label>
  );
}
