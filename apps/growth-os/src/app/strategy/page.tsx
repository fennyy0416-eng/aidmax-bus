"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, Wand2 } from "lucide-react";
import { useAppStore, useHydrated } from "@/lib/store";
import { routeChannels } from "@/lib/mock-engine";
import {
  CHANNEL_LABEL,
  ChannelAllocationCard,
  ROLE_LABEL,
} from "@/components/channel-allocation";
import { Button, Callout, Card, EmptyState, PageHeader, SectionTitle } from "@/components/ui";
import type { Channel } from "@/lib/types";

export default function StrategyPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const product = useAppStore((s) => s.product);
  const strategy = useAppStore((s) => s.strategy);
  const assets = useAppStore((s) => s.assets);
  const setBudgets = useAppStore((s) => s.setBudgets);
  const generateCampaign = useAppStore((s) => s.generateCampaign);
  const generating = useAppStore((s) => s.generateLoading);

  const [draft, setDraft] = useState<Record<Channel, number> | null>(null);
  const [showDrivers, setShowDrivers] = useState(false);
  const [saved, setSaved] = useState(false);

  const budgets: Record<Channel, number> = useMemo(() => {
    if (draft) return draft;
    if (!strategy) return { seo: 0, meta: 0, tiktok: 0 };
    return Object.fromEntries(
      strategy.allocations.map((a) => [a.channel, a.budgetPercent]),
    ) as Record<Channel, number>;
  }, [draft, strategy]);

  const total = useMemo(() => Object.values(budgets).reduce((a, b) => a + b, 0), [budgets]);

  if (!hydrated) return <p className="text-sm text-ink-muted">读取本地数据…</p>;

  if (!product) {
    return (
      <EmptyState
        title="还没有导入商品"
        description="渠道评分完全由商品字段推导，先导入商品才能得到有意义的建议。"
        actionHref="/intake"
        actionLabel="去导入商品"
      />
    );
  }

  if (!strategy) {
    return (
      <EmptyState
        title="还没有运行诊断"
        description="渠道路由需要先完成市场准备度检查和美国市场诊断。"
        actionHref="/diagnosis"
        actionLabel="去运行诊断"
      />
    );
  }

  const systemDefault = routeChannels(product);
  const monthly = product.monthlyTestBudget;

  return (
    <div>
      <PageHeader
        eyebrow="Step 4 · Channel Routing"
        title="渠道路由"
        description="评分不是科学结论，是一组可以被你推翻的判断。每一分都能追溯到具体原因，也都写明了什么情况下应该换渠道。"
      />

      <Card className="mb-6">
        <p className="text-sm leading-relaxed font-medium text-ink">{strategy.headline}</p>
        <ul className="mt-3 space-y-2">
          {strategy.sequencing.map((s) => (
            <li key={s} className="flex gap-2 text-[13px] leading-relaxed text-ink-soft">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-line-strong" aria-hidden />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        {strategy.allocations.map((a) => (
          <ChannelAllocationCard key={a.channel} allocation={a} />
        ))}
      </div>

      <Card className="mb-6">
        <SectionTitle
          title="评分是怎么来的"
          hint="每个渠道的得分由若干可解释的加减项组成，没有黑箱模型。"
          right={
            <Button variant="ghost" size="sm" onClick={() => setShowDrivers((v) => !v)}>
              {showDrivers ? "收起" : "展开明细"}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${showDrivers ? "rotate-180" : ""}`}
                strokeWidth={1.75}
              />
            </Button>
          }
        />
        {showDrivers ? (
          <div className="space-y-6">
            {strategy.allocations.map((a) => (
              <div key={a.channel}>
                <div className="mb-2 flex items-baseline gap-2">
                  <h3 className="text-[13px] font-semibold text-ink">{CHANNEL_LABEL[a.channel]}</h3>
                  <span className="text-xs text-ink-muted">
                    合计 {a.score} 分（四舍五入到 5 分刻度，避免假装精确）
                  </span>
                </div>
                <div className="divide-y divide-line rounded-lg border border-line">
                  {a.scoreDrivers.map((d) => (
                    <div key={d.label} className="flex gap-3 px-3 py-2.5">
                      <span
                        className={`w-10 shrink-0 text-right text-[13px] font-semibold tabular-nums ${
                          d.points > 0 ? "text-sage" : d.points < 0 ? "text-clay" : "text-ink-muted"
                        }`}
                      >
                        {d.points > 0 ? "+" : ""}
                        {d.points}
                      </span>
                      <div>
                        <p className="text-[13px] font-medium text-ink">{d.label}</p>
                        <p className="mt-0.5 text-[13px] leading-relaxed text-ink-soft">{d.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-ink-muted">
            展开后可以看到每个渠道的加减分项，包括为什么 SEO 会被扣掉见效周期分。
          </p>
        )}
      </Card>

      <Card className="mb-6">
        <SectionTitle
          title="调整预算分配"
          hint={`月测试预算 $${monthly}。你可以推翻系统建议，但三个渠道合计必须等于 100%。`}
        />
        <div className="space-y-5">
          {strategy.allocations.map((a) => {
            const value = budgets[a.channel];
            return (
              <div key={a.channel}>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-[13px] font-medium text-ink">
                    {CHANNEL_LABEL[a.channel]}
                    <span className="ml-2 text-[11px] font-normal text-ink-muted">
                      {ROLE_LABEL[a.role]} · 系统建议 {a.budgetPercent}%
                    </span>
                  </label>
                  <span className="text-[13px] tabular-nums text-ink">
                    {value}% · ${Math.round((monthly * value) / 100)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={value}
                  onChange={(e) => {
                    setSaved(false);
                    setDraft({ ...budgets, [a.channel]: Number(e.target.value) });
                  }}
                  className="w-full accent-[#1b1917]"
                />
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span
            className={`text-[13px] font-medium tabular-nums ${
              total === 100 ? "text-sage" : "text-clay"
            }`}
          >
            合计 {total}%
            {total === 100 ? "" : `（还差 ${100 - total > 0 ? "+" : ""}${100 - total}%）`}
          </span>
          <Button
            size="sm"
            disabled={total !== 100}
            onClick={() => {
              setBudgets(budgets);
              setSaved(true);
            }}
          >
            保存预算分配
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const reset = Object.fromEntries(
                systemDefault.allocations.map((a) => [a.channel, a.budgetPercent]),
              ) as Record<Channel, number>;
              setDraft(reset);
              setBudgets(reset);
              setSaved(true);
            }}
          >
            恢复系统建议
          </Button>
          {saved ? <span className="text-[13px] text-sage">已保存</span> : null}
        </div>

        {total !== 100 ? (
          <div className="mt-4">
            <Callout tone="warn">合计必须为 100% 才能保存。预算分配会直接影响下一步生成的日预算。</Callout>
          </div>
        ) : null}
      </Card>

      <Card>
        <SectionTitle
          title="生成三个渠道的执行资产"
          hint="TikTok、Meta Ads、SEO 会得到不同的产出，不是同一段文案的改写。生成不会花任何广告预算。"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={async () => {
              await generateCampaign();
              router.push("/studio");
            }}
            disabled={generating}
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                正在生成…
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" strokeWidth={1.75} />
                Generate Campaign
              </>
            )}
          </Button>
          {assets.length > 0 ? (
            <span className="text-[13px] text-ink-muted">
              已生成 {assets.length} 张资产卡。重新生成会保留你的编辑和审批状态。
            </span>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
