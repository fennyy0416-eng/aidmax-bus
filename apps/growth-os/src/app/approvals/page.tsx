"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useAppStore, useHydrated } from "@/lib/store";
import { AssetCard } from "@/components/asset-card";
import { Callout, Card, EmptyState, PageHeader } from "@/components/ui";
import type { AssetStatus } from "@/lib/types";

const BUCKETS: { key: AssetStatus | "all"; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "pending", label: "待批准" },
  { key: "approved", label: "已批准" },
  { key: "changes_requested", label: "要求修改" },
  { key: "paused", label: "已暂停" },
  { key: "draft", label: "草稿" },
];

export default function ApprovalsPage() {
  const hydrated = useHydrated();
  const assets = useAppStore((s) => s.assets);
  const strategy = useAppStore((s) => s.strategy);
  const [bucket, setBucket] = useState<AssetStatus | "all">("all");

  if (!hydrated) return <p className="text-sm text-ink-muted">读取本地数据…</p>;

  if (assets.length === 0) {
    return (
      <EmptyState
        title="还没有需要审批的资产"
        description="所有内容和花费动作都必须经过你批准。先生成资产，这里才会有东西。"
        actionHref={strategy ? "/strategy" : "/diagnosis"}
        actionLabel={strategy ? "去生成资产" : "去运行诊断"}
      />
    );
  }

  const list = bucket === "all" ? assets : assets.filter((a) => a.status === bucket);
  const spendAssets = assets.filter((a) => a.requiresSpendApproval);
  const approvedSpend = spendAssets.filter((a) => a.status === "approved");

  return (
    <div>
      <PageHeader
        eyebrow="Step 7 · Approval Center"
        title="审批中心"
        description="AI 只负责生成，发布与花费由你决定。批准涉及花费的动作时会单独二次确认。"
      />

      <div className="mb-5">
        <Callout tone={approvedSpend.length > 0 ? "warn" : "neutral"} title="花费类动作">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
            {spendAssets.length} 个动作涉及广告花费，其中 {approvedSpend.length} 个已批准。
            系统不会自动创建 Campaign，也不会自动增加预算。
          </span>
        </Callout>
      </div>

      <Card className="mb-5 !p-4">
        <div className="flex flex-wrap gap-2">
          {BUCKETS.map((b) => {
            const count = b.key === "all" ? assets.length : assets.filter((a) => a.status === b.key).length;
            const active = bucket === b.key;
            return (
              <button
                key={b.key}
                type="button"
                onClick={() => setBucket(b.key)}
                className={`rounded-lg border px-3 py-1.5 text-[13px] transition-colors ${
                  active
                    ? "border-ink bg-ink text-canvas"
                    : "border-line-strong bg-surface text-ink-soft hover:bg-surface-muted"
                }`}
              >
                {b.label}
                <span className={`ml-1.5 tabular-nums ${active ? "text-canvas/60" : "text-ink-muted"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {list.length === 0 ? (
        <Card>
          <p className="text-[13px] text-ink-muted">这一类现在没有资产。</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {list.map((a) => (
            <AssetCard key={a.id} asset={a} compact />
          ))}
        </div>
      )}
    </div>
  );
}
