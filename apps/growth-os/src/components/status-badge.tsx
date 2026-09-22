import type { AssetStatus, CheckState, ReadinessStatus } from "@/lib/types";

const ASSET: Record<AssetStatus, { label: string; className: string }> = {
  draft: { label: "草稿", className: "border-line-strong bg-surface-muted text-ink-soft" },
  pending: { label: "待审批", className: "border-amber/30 bg-amber-soft text-amber" },
  approved: { label: "已批准", className: "border-sage/30 bg-sage-soft text-sage" },
  changes_requested: { label: "要求修改", className: "border-clay/30 bg-clay-soft text-clay" },
  paused: { label: "已暂停", className: "border-line-strong bg-surface-muted text-ink-muted" },
};

export function AssetStatusBadge({ status }: { status: AssetStatus }) {
  const s = ASSET[status];
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  );
}

const READINESS: Record<ReadinessStatus, { label: string; className: string }> = {
  ready: { label: "Ready to Test", className: "border-sage/40 bg-sage-soft text-sage" },
  caution: { label: "Test with Caution", className: "border-amber/40 bg-amber-soft text-amber" },
  not_ready: { label: "Not Ready", className: "border-clay/40 bg-clay-soft text-clay" },
};

export function ReadinessBadge({ status }: { status: ReadinessStatus }) {
  const s = READINESS[status];
  return (
    <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-sm font-semibold ${s.className}`}>
      {s.label}
    </span>
  );
}

export function CheckDot({ state }: { state: CheckState }) {
  const map: Record<CheckState, string> = {
    pass: "bg-sage",
    warn: "bg-amber",
    fail: "bg-clay",
  };
  const label: Record<CheckState, string> = { pass: "通过", warn: "注意", fail: "阻断" };
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium text-ink-soft">
      <span className={`h-2 w-2 rounded-full ${map[state]}`} aria-hidden />
      {label[state]}
    </span>
  );
}
