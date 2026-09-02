"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useAppStore, useHydrated } from "@/lib/store";
import { grossMargin, unitProfit } from "@/lib/mock-engine";
import { EvidenceLegend, EvidenceTag } from "@/components/evidence-tag";
import { CheckDot, ReadinessBadge } from "@/components/status-badge";
import { Button, Callout, Card, EmptyState, KeyValue, LinkButton, PageHeader, SectionTitle } from "@/components/ui";
import type { Insight, Persona } from "@/lib/types";

function InsightList({ title, items }: { title: string; items: Insight[] }) {
  return (
    <div>
      <h4 className="mb-2 text-[13px] font-medium text-ink">{title}</h4>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.text} className="flex items-start gap-2">
            <EvidenceTag level={it.evidence} compact />
            <span className="text-[13px] leading-relaxed text-ink-soft">{it.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PersonaCard({ persona }: { persona: Persona }) {
  return (
    <Card>
      <div className="mb-4">
        <span className="rounded-md border border-line-strong bg-surface-muted px-1.5 py-0.5 text-[11px] font-medium text-ink-soft">
          {persona.role === "primary" ? "主要 Persona" : "次要 Persona"}
        </span>
        <h3 className="mt-2 text-[15px] font-semibold text-ink">{persona.name}</h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{persona.snapshot}</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <InsightList title="购买触发场景" items={persona.triggers} />
        <InsightList title="主要焦虑" items={persona.anxieties} />
        <InsightList title="当前替代方案" items={persona.alternatives} />
        <InsightList title="不购买的原因" items={persona.objections} />
      </div>
    </Card>
  );
}

export default function DiagnosisPage() {
  const hydrated = useHydrated();
  const product = useAppStore((s) => s.product);
  const readiness = useAppStore((s) => s.readiness);
  const diagnosis = useAppStore((s) => s.diagnosis);
  const loading = useAppStore((s) => s.diagnosisLoading);
  const run = useAppStore((s) => s.runDiagnosisAction);

  if (!hydrated) return <p className="text-sm text-ink-muted">读取本地数据…</p>;

  if (!product || !readiness) {
    return (
      <EmptyState
        title="还没有导入商品"
        description="市场准备度检查和诊断都基于你填写的商品数据。先导入一个商品，或直接使用 Demo 商品。"
        actionHref="/intake"
        actionLabel="去导入商品"
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Step 2-3 · Market Readiness & Diagnosis"
        title="市场准备度与美国市场诊断"
        description="先判断这个产品现在是否值得推广，再谈内容和渠道。所有洞察都标注了证据等级。"
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
                ${product.price} · 毛利率 {grossMargin(product)}% · 单件毛利 ${unitProfit(product)} ·{" "}
                {product.currentPlatform.join(" / ") || "未填写平台"}
              </p>
            </div>
          </div>
          <ReadinessBadge status={readiness.status} />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">{readiness.summary}</p>
      </Card>

      <Card className="mb-6">
        <SectionTitle title="五项准备度检查" hint="任何一项为「阻断」都不代表不能测试，但代表你必须知道自己在赌什么。" />
        <div className="divide-y divide-line">
          {readiness.checks.map((c) => (
            <div key={c.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:gap-6">
              <div className="sm:w-44 sm:shrink-0">
                <p className="text-[13px] font-medium text-ink">{c.label}</p>
                <div className="mt-1 flex items-center gap-2">
                  <CheckDot state={c.state} />
                  <EvidenceTag level={c.evidence} compact />
                </div>
              </div>
              <div>
                <p className="text-[13px] font-medium text-ink">{c.headline}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{c.detail}</p>
              </div>
            </div>
          ))}
        </div>
        {readiness.risks.length > 0 ? (
          <div className="mt-5">
            <Callout tone="warn" title="继续之前必须知道的风险">
              <ul className="mt-1 space-y-1">
                {readiness.risks.map((r) => (
                  <li key={r}>· {r}</li>
                ))}
              </ul>
            </Callout>
          </div>
        ) : null}
      </Card>

      {!diagnosis ? (
        <Card>
          <SectionTitle
            title="运行美国市场诊断"
            hint="系统会基于你填写的字段和品类模板生成 Persona、购买路径与信息翻译。这不是真实市场调研。"
          />
          <Button onClick={run} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                正在生成诊断…
              </>
            ) : (
              <>
                Run Diagnosis
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </>
            )}
          </Button>
          {loading ? (
            <div className="mt-5 space-y-2">
              {["读取商品字段", "匹配品类消费者模型", "生成信息翻译与渠道评分"].map((s) => (
                <div key={s} className="flex items-center gap-2 text-[13px] text-ink-muted">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-line-strong" />
                  {s}
                </div>
              ))}
            </div>
          ) : null}
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="rounded-lg border border-line bg-surface px-4 py-3">
            <EvidenceLegend />
          </div>

          <Card>
            <SectionTitle title="需求判断" />
            <ul className="space-y-2.5">
              {diagnosis.demandSummary.map((d) => (
                <li key={d.text} className="flex items-start gap-2">
                  <EvidenceTag level={d.evidence} compact />
                  <span className="text-[13px] leading-relaxed text-ink-soft">{d.text}</span>
                </li>
              ))}
            </ul>
          </Card>

          {diagnosis.personas.map((p) => (
            <PersonaCard key={p.name} persona={p} />
          ))}

          <Card>
            <SectionTitle title="购买路径" hint="从触发到下单，每一步都可能是你真正的瓶颈。" />
            <ol className="space-y-3">
              {diagnosis.purchasePath.map((s, i) => (
                <li key={s.stage} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-surface-muted text-[11px] font-medium text-ink-soft tabular-nums">
                    {i + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-medium text-ink">{s.stage}</p>
                      <EvidenceTag level={s.evidence} compact />
                    </div>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-ink-soft">{s.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <SectionTitle
              title="信息翻译：工厂语言 → 消费者语言"
              hint="左边是你现在写的，右边是美国买家能听懂的。右边的表达仍需广告或内容验证。"
            />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line">
                    <th className="pb-2 text-[12px] font-medium tracking-wide text-ink-muted">
                      中国卖家常用表达
                    </th>
                    <th className="pb-2 text-[12px] font-medium tracking-wide text-ink-muted">
                      美国消费者表达
                    </th>
                    <th className="pb-2 text-[12px] font-medium tracking-wide text-ink-muted">
                      为什么要改
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {diagnosis.translations.map((t) => (
                    <tr key={t.from}>
                      <td className="w-1/4 py-3 pr-4 align-top text-[13px] text-ink-muted line-through decoration-line-strong">
                        {t.from}
                      </td>
                      <td className="w-1/3 py-3 pr-4 align-top text-[13px] font-medium text-ink">
                        {t.to}
                      </td>
                      <td className="py-3 align-top text-[13px] leading-relaxed text-ink-soft">
                        {t.why}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <SectionTitle
              title="竞品假设"
              hint="V1 使用品类模板推断，不是真实竞品数据。上线前请自己核对价格与定位。"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {diagnosis.competitors.map((c) => (
                <div key={c.name} className="rounded-lg border border-line p-4">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[13px] font-semibold text-ink">{c.name}</h4>
                    <EvidenceTag level={c.evidence} compact />
                  </div>
                  <dl className="mt-3 space-y-2">
                    <KeyValue label="定位" value={c.positioning} />
                    <KeyValue label="价格带" value={c.priceBand} />
                    <KeyValue label="他们没做好的" value={c.gap} />
                  </dl>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle title="必须由实验回答的问题" />
            <ul className="space-y-2">
              {diagnosis.openQuestions.map((q) => (
                <li key={q} className="flex items-start gap-2">
                  <EvidenceTag level="test_required" compact />
                  <span className="text-[13px] leading-relaxed text-ink-soft">{q}</span>
                </li>
              ))}
            </ul>
          </Card>

          <div className="flex flex-wrap items-center gap-3">
            <LinkButton href="/strategy">
              下一步：查看渠道路由
            </LinkButton>
            <Button variant="secondary" onClick={run} disabled={loading}>
              {loading ? "重新生成中…" : "重新运行诊断"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
