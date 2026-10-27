"use client";

import { useState } from "react";
import { useAppStore, useHydrated } from "@/lib/store";
import { AssetCard } from "@/components/asset-card";
import { CHANNEL_LABEL } from "@/components/channel-allocation";
import { Callout, Card, EmptyState, PageHeader } from "@/components/ui";
import type { Channel } from "@/lib/types";

const TABS: Channel[] = ["tiktok", "meta", "seo"];

const TAB_NOTE: Record<Channel, string> = {
  tiktok: "三条创意来自三个不同角度（问题 / 演示 / 结果），不是同一个脚本的改写。先各发一条，只比角度。",
  meta: "Meta 的两个 Campaign 草案都涉及真实花费，必须单独确认。系统不会自动创建任何 Campaign。",
  seo: "本轮只做产品页、对比页和两篇支持型文章。清单里也写明了现在不值得写什么。",
};

export default function StudioPage() {
  const hydrated = useHydrated();
  const assets = useAppStore((s) => s.assets);
  const strategy = useAppStore((s) => s.strategy);
  const [tab, setTab] = useState<Channel>("tiktok");

  if (!hydrated) return <p className="text-sm text-ink-muted">读取本地数据…</p>;

  if (assets.length === 0) {
    return (
      <EmptyState
        title="还没有生成执行资产"
        description="资产由商品信息和渠道分配共同决定。先完成诊断和渠道路由，再点击 Generate Campaign。"
        actionHref={strategy ? "/strategy" : "/diagnosis"}
        actionLabel={strategy ? "去生成资产" : "去运行诊断"}
      />
    );
  }

  const list = assets.filter((a) => a.channel === tab);
  const role = strategy?.allocations.find((a) => a.channel === tab);

  return (
    <div>
      <PageHeader
        eyebrow="Step 5 · Creative Studio"
        title="执行资产"
        description="每张卡都写清了它要验证什么假设，以及什么信号代表失败。可以直接编辑，编辑后的内容会被保存。"
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((c) => {
          const count = assets.filter((a) => a.channel === c).length;
          const active = tab === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setTab(c)}
              className={`rounded-lg border px-3.5 py-2 text-[13px] transition-colors ${
                active
                  ? "border-ink bg-ink text-canvas"
                  : "border-line-strong bg-surface text-ink-soft hover:bg-surface-muted"
              }`}
            >
              {CHANNEL_LABEL[c]}
              <span className={`ml-2 ${active ? "text-canvas/60" : "text-ink-muted"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="mb-5">
        <Card className="!p-4">
          <p className="text-[13px] leading-relaxed text-ink-soft">
            {role ? (
              <span className="font-medium text-ink">
                {CHANNEL_LABEL[tab]}：{role.budgetPercent}% 预算 ·{" "}
                {role.role === "primary" ? "主渠道" : role.role === "supporting" ? "辅助渠道" : "暂缓渠道"} ·{" "}
              </span>
            ) : null}
            {TAB_NOTE[tab]}
          </p>
        </Card>
      </div>

      {tab === "meta" ? (
        <div className="mb-5">
          <Callout tone="warn" title="花费红线">
            批准 Meta Campaign 只代表你同意这个计划。真实投放需要你自己在广告后台创建，系统不会连接任何 API，也不会自动加预算。
          </Callout>
        </div>
      ) : null}

      <div className="space-y-5">
        {list.map((a) => (
          <AssetCard key={a.id} asset={a} />
        ))}
      </div>
    </div>
  );
}
