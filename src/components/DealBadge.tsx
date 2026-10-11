import clsx from "clsx";
import { DEAL_RATINGS, type DealRating } from "@/lib/listings";

const STYLE: Record<DealRating, string> = {
  great: "bg-emerald-600 text-white",
  good: "bg-emerald-500/15 text-emerald-300",
  fair: "bg-sky-500/15 text-sky-300",
  high: "bg-amber-500/15 text-amber-300",
  overpriced: "bg-red-500/15 text-red-300",
};

const ICON: Record<DealRating, string> = { great: "▲▲", good: "▲", fair: "●", high: "▼", overpriced: "▼▼" };

export function DealBadge({ deal, size = "sm" }: { deal: DealRating; size?: "sm" | "lg" }) {
  const label = DEAL_RATINGS.find((d) => d.id === deal)!.label;
  return (
    <span className={clsx("inline-flex items-center gap-1.5 rounded-sm font-bold", STYLE[deal], size === "lg" ? "px-3 py-1.5 text-base" : "px-2 py-0.5 text-xs")}>
      <span className="text-[0.7em]">{ICON[deal]}</span>
      {label}
    </span>
  );
}

export function DealMeter({ price, market }: { price: number; market: number }) {
  // Map ratio 0.8 → 0%, 1.2 → 100%
  const pct = Math.max(0, Math.min(100, ((price / market - 0.8) / 0.4) * 100));
  return (
    <div>
      <div className="relative h-3 rounded-full bg-gradient-to-r from-emerald-500 via-sky-400 via-60% to-red-500">
        <div className="absolute -top-1.5 h-6 w-1.5 -translate-x-1/2 rounded bg-carbon-950 ring-2 ring-carbon-900" style={{ left: `${pct}%` }} />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] font-medium text-zinc-500">
        <span>Great</span><span>Good</span><span>Fair</span><span>High</span><span>Overpriced</span>
      </div>
    </div>
  );
}
