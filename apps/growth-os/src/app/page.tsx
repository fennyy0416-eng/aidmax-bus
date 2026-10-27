"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore, useHydrated, useLearningReport } from "@/lib/store";
import { grossMargin } from "@/lib/mock-engine";
import { MetricCard } from "@/components/metric-card";
import { CHANNEL_LABEL, ROLE_LABEL } from "@/components/channel-allocation";
import { AssetStatusBadge, ReadinessBadge } from "@/components/status-badge";
import { Button, Callout, Card, LinkButton, PageHeader, SectionTitle } from "@/components/ui";

export default function DashboardPage() {
  const hydrated = useHydrated();
  const router = useRouter();
  const product = useAppStore((s) => s.product);
  const readiness = useAppStore((s) => s.readiness);
  const diagnosis = useAppStore((s) => s.diagnosis);
  const strategy = useAppStore((s) => s.strategy);
  const assets = useAppStore((s) => s.assets);
  const tasks = useAppStore((s) => s.tasks);
  const loadDemoProduct = useAppStore((s) => s.loadDemoProduct);
  const report = useLearningReport();

  if (!hydrated) return <p className="text-sm text-ink-muted">读取本地数据…</p>;

  if (!product || !readiness) {
    return (
      <div>
        <PageHeader
          eyebrow="US Market Growth OS · V1"
          title="从一个商品开始，而不是从生成内容开始"
          description="这个工具面向已经在 Amazon 或 TikTok Shop 出单、准备做 Shopify 独立站的中国卖家。它先判断产品是否值得推广，再决定渠道，最后才生成可执行的实验。"
        />
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {[
            { t: "先诊断，再生成", d: "不同产品会得到不同的渠道组合，不会默认三个渠道平均投入。" },
            { t: "证据分级", d: "每条建议都标注是事实、推断，还是需要实验验证的假设。" },
            { t: "花费必须你批准", d: "AI 生成内容与计划，涉及广告花费的动作永远需要你单独确认。" },
          ].map((x) => (
            <Card key={x.t}>
              <h3 className="text-[14px] font-semibold text-ink">{x.t}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{x.d}</p>
            </Card>
          ))}
        </div>
        <Card>
          <SectionTitle
            title="开始"
            hint="没有准备好数据也可以，先用 Demo 商品把完整流程走一遍。"
          />
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => {
                loadDemoProduct();
                router.push("/diagnosis");
              }}
            >
              <Sparkles className="h-4 w-4" strokeWidth={1.75} />
              使用 Demo 商品
            </Button>
            <LinkButton href="/intake" variant="secondary">
              导入我自己的商品
            </LinkButton>
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-ink-muted">
            V1 使用 seed demo data 与确定性 mock engine，不接入 Amazon、Shopify、Meta 或 TikTok 的真实 API，
            所有市场数据均为演示用途，不构成真实市场研究。
          </p>
        </Card>
      </div>
    );
  }

  const primary = strategy?.allocations[0];
  const pending = assets.filter((a) => a.status === "pending");
  const approved = assets.filter((a) => a.status === "approved");
  const activeTasks = tasks.filter((t) => t.week <= 2);

  const nextStep = !diagnosis
    ? { href: "/diagnosis", label: "运行美国市场诊断" }
    : !strategy
      ? { href: "/diagnosis", label: "查看诊断结果" }
      : assets.length === 0
        ? { href: "/strategy", label: "确认预算并生成执行资产" }
        : pending.length > 0
          ? { href: "/approvals", label: `处理 ${pending.length} 个待审批资产` }
          : { href: "/report", label: "查看学习报告与下一步决策" };

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title="当前实验总览"
        description="一个商品，一条主渠道，一轮可以被证伪的实验。"
        actions={<LinkButton href={nextStep.href} size="sm">{nextStep.label}</LinkButton>}
      />

      <Card className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface-muted text-2xl">
              <span role="img" aria-label={product.imageAlt}>
                {product.imageEmoji}
              </span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink">{product.name}</h2>
              <p className="mt-1 text-[13px] text-ink-muted">
                ${product.price} · 毛利率 {grossMargin(product)}% · {product.currentPlatform.join(" / ") || "未填写平台"} ·
                Shopify{" "}
                {product.shopifyStatus === "live" ? "已上线" : product.shopifyStatus === "building" ? "建设中" : "未建"}
              </p>
              <Link
                href="/intake"
                className="mt-2 inline-block text-[12px] text-ink-muted underline underline-offset-2 hover:text-ink"
              >
                换一个商品
              </Link>
            </div>
          </div>
          <ReadinessBadge status={readiness.status} />
        </div>
      </Card>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Market Readiness"
          value={
            readiness.status === "ready"
              ? "Ready to Test"
              : readiness.status === "caution"
                ? "Test with Caution"
                : "Not Ready"
          }
          sub={`${readiness.checks.filter((c) => c.state === "pass").length}/5 项通过`}
          tone={readiness.status === "ready" ? "good" : readiness.status === "caution" ? "warn" : "bad"}
        />
        <MetricCard
          label="主渠道"
          value={primary ? CHANNEL_LABEL[primary.channel] : "未确定"}
          sub={primary ? `${ROLE_LABEL[primary.role]} · ${primary.budgetPercent}% 预算 · ${primary.score} 分` : "先运行诊断"}
        />
        <MetricCard
          label="本月测试预算"
          value={`$${product.monthlyTestBudget}`}
          sub={
            primary
              ? `其中 $${Math.round((product.monthlyTestBudget * primary.budgetPercent) / 100)} 给 ${CHANNEL_LABEL[primary.channel]}`
              : "尚未分配"
          }
        />
        <MetricCard
          label="待审批资产"
          value={pending.length}
          sub={`已批准 ${approved.length} / 共 ${assets.length}`}
          tone={pending.length > 0 ? "warn" : "neutral"}
        />
      </div>

      {assets.length > 0 ? (
        <div className="mb-6 grid gap-5 lg:grid-cols-2">
          <Card>
            <SectionTitle title="当前实验" hint="前两周要跑的任务。" right={<Link href="/calendar" className="text-[13px] text-ink-muted underline underline-offset-2 hover:text-ink">全部日历</Link>} />
            <ul className="space-y-3">
              {activeTasks.slice(0, 5).map((t) => (
                <li key={t.id} className="flex items-start gap-2.5">
                  <span className="mt-0.5 rounded-md border border-line-strong bg-surface-muted px-1.5 py-0.5 text-[11px] font-medium text-ink-soft">
                    W{t.week}
                  </span>
                  <div>
                    <p className="text-[13px] font-medium text-ink">{t.title}</p>
                    <p className="mt-0.5 text-[12px] text-ink-muted">
                      {t.owner}
                      {t.budget > 0 ? ` · $${t.budget}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <SectionTitle title="等待你决定的资产" right={<Link href="/approvals" className="text-[13px] text-ink-muted underline underline-offset-2 hover:text-ink">审批中心</Link>} />
            {assets.filter((a) => a.status !== "approved").length === 0 ? (
              <p className="text-[13px] text-ink-muted">所有资产都已批准。</p>
            ) : (
              <ul className="space-y-3">
                {assets
                  .filter((a) => a.status !== "approved")
                  .slice(0, 5)
                  .map((a) => (
                    <li key={a.id} className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-medium text-ink">{a.title}</p>
                        <p className="mt-0.5 text-[12px] text-ink-muted">
                          {CHANNEL_LABEL[a.channel]}
                          {a.requiresSpendApproval ? " · 涉及广告花费" : ""}
                        </p>
                      </div>
                      <AssetStatusBadge status={a.status} />
                    </li>
                  ))}
              </ul>
            )}
          </Card>
        </div>
      ) : null}

      {report ? (
        <Card>
          <SectionTitle
            title="最新决策建议"
            hint={`基于模拟场景 ${report.scenario}，切换场景会得到不同的决策。`}
            right={<Link href="/report" className="text-[13px] text-ink-muted underline underline-offset-2 hover:text-ink">学习报告</Link>}
          />
          <div className="mb-3">
            <Callout tone={report.decision === "scale" ? "good" : "warn"} title={`${report.decision.toUpperCase()} · ${report.title}`}>
              {report.decisionReason}
            </Callout>
          </div>
          <p className="text-[13px] leading-relaxed text-ink-soft">
            <span className="font-medium text-ink">第一件事：</span>
            {report.nextActions[0]}
          </p>
        </Card>
      ) : (
        <Card>
          <SectionTitle title="下一步" />
          <LinkButton href={nextStep.href}>
            {nextStep.label}
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </LinkButton>
        </Card>
      )}
    </div>
  );
}
