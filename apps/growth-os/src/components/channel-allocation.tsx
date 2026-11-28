import type { Channel, ChannelAllocation } from "@/lib/types";

export const CHANNEL_LABEL: Record<Channel, string> = {
  tiktok: "TikTok",
  meta: "Meta Ads",
  seo: "SEO",
};

export const ROLE_LABEL: Record<ChannelAllocation["role"], string> = {
  primary: "主渠道",
  supporting: "辅助渠道",
  deferred: "暂缓渠道",
};

const ROLE_CLASS: Record<ChannelAllocation["role"], string> = {
  primary: "border-sage/40 bg-sage-soft text-sage",
  supporting: "border-line-strong bg-surface-muted text-ink-soft",
  deferred: "border-amber/40 bg-amber-soft text-amber",
};

export function ScoreBar({ score, role }: { score: number; role: ChannelAllocation["role"] }) {
  const color = role === "primary" ? "bg-sage" : role === "supporting" ? "bg-ink-soft" : "bg-amber";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
    </div>
  );
}

export function ChannelAllocationCard({ allocation }: { allocation: ChannelAllocation }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-ink">{CHANNEL_LABEL[allocation.channel]}</h3>
            <span
              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${ROLE_CLASS[allocation.role]}`}
            >
              {ROLE_LABEL[allocation.role]}
            </span>
          </div>
          <p className="mt-1 text-xs text-ink-muted">
            适合度 {allocation.score} / 100 · 建议预算 {allocation.budgetPercent}%
          </p>
        </div>
        <p className="text-2xl font-semibold tracking-tight text-ink tabular-nums">
          {allocation.budgetPercent}%
        </p>
      </div>

      <div className="mt-4">
        <ScoreBar score={allocation.score} role={allocation.role} />
      </div>

      <ul className="mt-4 space-y-2">
        {allocation.rationale.map((r) => (
          <li key={r} className="flex gap-2 text-[13px] leading-relaxed text-ink-soft">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-line-strong" aria-hidden />
            <span>{r}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 space-y-2 border-t border-line pt-4 text-[13px] leading-relaxed">
        <p className="text-ink-soft">
          <span className="font-medium text-ink">第一轮测什么：</span>
          {allocation.firstTest}
        </p>
        <p className="text-clay">
          <span className="font-medium">什么情况下换渠道：</span>
          {allocation.invalidationCondition}
        </p>
      </div>
    </div>
  );
}
