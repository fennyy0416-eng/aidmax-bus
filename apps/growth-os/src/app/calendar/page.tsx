"use client";

import Link from "next/link";
import { useAppStore, useHydrated } from "@/lib/store";
import { CHANNEL_LABEL } from "@/components/channel-allocation";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import type { AssetStatus, CalendarTask, CampaignAsset } from "@/lib/types";

const WEEK_TITLE: Record<1 | 2 | 3 | 4, string> = {
  1: "Week 1 · 基础页面与三条 TikTok 创意",
  2: "Week 2 · 选出胜出 Hook，启动小额 Meta 测试",
  3: "Week 3 · Retargeting 与产品页迭代",
  4: "Week 4 · 复盘，决定 Scale / Iterate / Stop",
};

const STATUS_STYLE: Record<string, string> = {
  待执行: "border-line-strong bg-surface-muted text-ink-soft",
  草稿: "border-line-strong bg-surface-muted text-ink-soft",
  待审批: "border-amber/30 bg-amber-soft text-amber",
  已批准: "border-sage/30 bg-sage-soft text-sage",
  要求修改: "border-clay/30 bg-clay-soft text-clay",
  已暂停: "border-line-strong bg-surface-muted text-ink-muted",
  "等待花费批准": "border-clay/30 bg-clay-soft text-clay",
};

function taskStatus(task: CalendarTask, assets: CampaignAsset[]): string {
  const asset = task.assetId ? assets.find((a) => a.id === task.assetId) : undefined;
  if (asset) {
    const map: Record<AssetStatus, string> = {
      draft: "草稿",
      pending: "待审批",
      approved: "已批准",
      changes_requested: "要求修改",
      paused: "已暂停",
    };
    return map[asset.status];
  }
  return task.baseStatus === "blocked" ? "等待花费批准" : "待执行";
}

export default function CalendarPage() {
  const hydrated = useHydrated();
  const tasks = useAppStore((s) => s.tasks);
  const assets = useAppStore((s) => s.assets);
  const strategy = useAppStore((s) => s.strategy);

  if (!hydrated) return <p className="text-sm text-ink-muted">读取本地数据…</p>;

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="还没有实验日历"
        description="日历由生成的资产推导：每条创意、每个 Campaign 都会落到具体的一周。"
        actionHref={strategy ? "/strategy" : "/diagnosis"}
        actionLabel={strategy ? "去生成资产" : "去运行诊断"}
      />
    );
  }

  const weeks: (1 | 2 | 3 | 4)[] = [1, 2, 3, 4];

  return (
    <div>
      <PageHeader
        eyebrow="Step 6 · Experiment Calendar"
        title="30 天实验日历"
        description="任务状态与审批中心实时同步。带花费的任务在被批准之前一直是「等待花费批准」。"
      />

      <div className="space-y-5">
        {weeks.map((w) => {
          const list = tasks.filter((t) => t.week === w);
          const budget = list.reduce((s, t) => s + t.budget, 0);
          return (
            <Card key={w}>
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
                <h2 className="text-[15px] font-semibold text-ink">{WEEK_TITLE[w]}</h2>
                <p className="text-[13px] text-ink-muted tabular-nums">
                  本周计划预算 ${budget}
                </p>
              </div>
              <div className="divide-y divide-line">
                {list.map((t) => {
                  const status = taskStatus(t, assets);
                  return (
                    <div
                      key={t.id}
                      className="flex flex-col gap-2 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:gap-4"
                    >
                      <div className="flex shrink-0 items-center gap-2 sm:w-40">
                        <span className="rounded-md border border-line-strong bg-surface-muted px-1.5 py-0.5 text-[11px] font-medium text-ink-soft">
                          {t.channel === "ops" ? "站点/运营" : CHANNEL_LABEL[t.channel]}
                        </span>
                        <span
                          className={`rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${
                            STATUS_STYLE[status] ?? STATUS_STYLE["待执行"]
                          }`}
                        >
                          {status}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium text-ink">{t.title}</p>
                        <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
                          成功指标：{t.successMetric}
                        </p>
                        <p className="mt-1 text-[12px] text-ink-muted">
                          负责人：{t.owner}
                          {t.budget > 0 ? ` · 预算 $${t.budget}` : " · 无花费"}
                          {t.assetId ? (
                            <>
                              {" · "}
                              <Link href="/approvals" className="underline underline-offset-2 hover:text-ink">
                                关联资产
                              </Link>
                            </>
                          ) : null}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
