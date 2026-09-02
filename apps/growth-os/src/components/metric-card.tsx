import type { ReactNode } from "react";

export function MetricCard({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad";
}) {
  const toneClass = {
    neutral: "text-ink",
    good: "text-sage",
    warn: "text-amber",
    bad: "text-clay",
  }[tone];
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-4">
      <p className="text-xs tracking-wide text-ink-muted">{label}</p>
      <p className={`mt-2 text-xl font-semibold tracking-tight ${toneClass}`}>{value}</p>
      {sub ? <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{sub}</p> : null}
    </div>
  );
}
