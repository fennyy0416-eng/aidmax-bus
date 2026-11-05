"use client";

import { useAppStore, useHydrated, useLearningReport } from "@/lib/store";
import { MetricCard } from "@/components/metric-card";
import { Callout, Card, EmptyState, PageHeader, SectionTitle } from "@/components/ui";
import type { Decision, HypothesisResult } from "@/lib/types";

const DECISION: Record<Decision, { label: string; className: string; zh: string }> = {
  scale: { label: "Scale", zh: "放大", className: "border-sage/40 bg-sage-soft text-sage" },
  iterate: { label: "Iterate", zh: "修改后再测", className: "border-amber/40 bg-amber-soft text-amber" },
  stop: { label: "Stop", zh: "停止加投", className: "border-clay/40 bg-clay-soft text-clay" },
};

const VERDICT: Record<HypothesisResult["verdict"], { label: string; className: string }> = {
  supported: { label: "成立", className: "border-sage/30 bg-sage-soft text-sage" },
  rejected: { label: "被证伪", className: "border-clay/30 bg-clay-soft text-clay" },
  inconclusive: { label: "样本不足", className: "border-line-strong bg-surface-muted text-ink-soft" },
};

export default function ReportPage() {
  const hydrated = useHydrated();
  const scenario = useAppStore((s) => s.scenario);
  const setScenario = useAppStore((s) => s.setScenario);
  const strategy = useAppStore((s) => s.strategy);
  const report = useLearningReport();

  if (!hydrated) return <p className="text-sm text-ink-muted">读取本地数据…</p>;

  if (!report) {
    return (
      <EmptyState
        title="还没有可复盘的实验"
        description="学习报告基于你已生成并批准的资产。先走完前面的步骤，再回来看两个模拟结果场景。"
        actionHref={strategy ? "/strategy" : "/diagnosis"}
        actionLabel={strategy ? "去生成资产" : "去运行诊断"}
      />
    );
  }

  const d = DECISION[report.decision];

  return (
    <div>
      <PageHeader
        eyebrow="Step 8 · Learning Report"
        title="学习报告"
        description="以下 Performance 数据是模拟的 seed 场景，用于演示决策逻辑，不是真实投放结果。切换场景可以看到系统给出完全不同的决策。"
      />

      <Card className="mb-6">
        <SectionTitle title="选择模拟结果场景" hint="两个场景对应两种常见的真实结局。" />
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              { key: "A" as const, title: "Scenario A：TikTok Hook 胜出", sub: "内容成立，转化卡在产品页" },
              { key: "B" as const, title: "Scenario B：产品尚未准备好", sub: "有播放没点击，差异没被识别" },
            ]
          ).map((s) => {
            const active = scenario === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setScenario(s.key)}
                className={`rounded-xl border px-4 py-3.5 text-left transition-colors ${
                  active
                    ? "border-ink bg-ink text-canvas"
                    : "border-line-strong bg-surface hover:bg-surface-muted"
                }`}
              >
                <p className="text-[13px] font-semibold">{s.title}</p>
                <p className={`mt-1 text-[12px] ${active ? "text-canvas/60" : "text-ink-muted"}`}>
                  {s.sub}
                </p>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-ink">{report.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-soft">{report.narrative}</p>
          </div>
          <span className={`inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-semibold ${d.className}`}>
            {d.label} · {d.zh}
          </span>
        </div>
      </Card>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {report.metrics.map((m) => (
          <MetricCard
            key={m.label}
            label={m.label}
            value={m.value}
            sub={m.delta}
            tone={m.tone === "good" ? "good" : m.tone === "bad" ? "bad" : "neutral"}
          />
        ))}
      </div>

      <Card className="mb-6">
        <SectionTitle title="假设检验结果" hint="实验的意义是让假设变成结论，而不是产生更多内容。" />
        <div className="divide-y divide-line">
          {report.hypotheses.map((h) => (
            <div key={h.hypothesis} className="flex flex-col gap-2 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:gap-4">
              <span
                className={`inline-flex h-fit shrink-0 items-center rounded-md border px-2 py-0.5 text-[11px] font-medium sm:w-20 sm:justify-center ${VERDICT[h.verdict].className}`}
              >
                {VERDICT[h.verdict].label}
              </span>
              <div>
                <p className="text-[13px] font-medium text-ink">{h.hypothesis}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">证据：{h.evidence}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mb-6">
        <SectionTitle title={`决策：${d.label}`} />
        <div className="mb-4">
          <Callout tone={report.decision === "scale" ? "good" : "warn"}>{report.decisionReason}</Callout>
        </div>
        <h3 className="mb-2 text-[13px] font-medium text-ink">下一步动作</h3>
        <ol className="space-y-2">
          {report.nextActions.map((a, i) => (
            <li key={a} className="flex gap-2.5 text-[13px] leading-relaxed text-ink-soft">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-surface-muted text-[11px] font-medium text-ink-soft tabular-nums">
                {i + 1}
              </span>
              <span>{a}</span>
            </li>
          ))}
        </ol>
      </Card>

      <Card>
        <SectionTitle title="这一轮明确不要做的事" hint="限制动作数量，是让结论保持可读的前提。" />
        <ul className="space-y-2">
          {report.doNotDo.map((x) => (
            <li key={x} className="flex gap-2 text-[13px] leading-relaxed text-clay">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-clay" aria-hidden />
              <span>{x}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
