import type { EvidenceLevel } from "@/lib/types";

const MAP: Record<EvidenceLevel, { label: string; en: string; className: string }> = {
  observed: {
    label: "事实",
    en: "Observed",
    className: "border-sage/30 bg-sage-soft text-sage",
  },
  inferred: {
    label: "推断",
    en: "Inferred",
    className: "border-line-strong bg-surface-muted text-ink-soft",
  },
  test_required: {
    label: "待验证",
    en: "Test Required",
    className: "border-clay/30 bg-clay-soft text-clay",
  },
};

export function EvidenceTag({ level, compact = false }: { level: EvidenceLevel; compact?: boolean }) {
  const m = MAP[level];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap ${m.className}`}
      title={`${m.label} · ${m.en}`}
    >
      {m.label}
      {compact ? null : <span className="opacity-60">{m.en}</span>}
    </span>
  );
}

export function EvidenceLegend() {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
      <span>证据标签：</span>
      <EvidenceTag level="observed" />
      <span>来自你的输入或已有销售数据</span>
      <EvidenceTag level="inferred" />
      <span>系统按品类推断</span>
      <EvidenceTag level="test_required" />
      <span>需要实验验证</span>
    </div>
  );
}
