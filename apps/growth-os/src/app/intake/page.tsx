"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Info, Link2, Sparkles } from "lucide-react";
import { CATEGORY_OPTIONS, DEMO_PRODUCT } from "@/lib/demo-data";
import { useAppStore, useHydrated } from "@/lib/store";
import type { Product, Strength } from "@/lib/types";
import { Button, Callout, Card, PageHeader, SectionTitle } from "@/components/ui";

const PLATFORMS = ["Amazon", "TikTok Shop", "Walmart", "eBay", "线下/批发"];
const ORDER_RANGES = ["0-50", "50-150", "150-300", "300-600", "600-1200", "1200+"];

type Source = "amazon" | "tiktok" | "manual";

interface FormState {
  name: string;
  category: string;
  price: string;
  landedCost: string;
  currentPlatform: string[];
  monthlyOrderRange: string;
  reviewCount: string;
  rating: string;
  sellingPoints: [string, string, string];
  imageEmoji: string;
  imageAlt: string;
  shopifyStatus: Product["shopifyStatus"];
  monthlyTestBudget: string;
  visualDemo: Strength;
  searchDemand: Strength;
  sourceUrl: string;
}

const EMPTY: FormState = {
  name: "",
  category: "other",
  price: "",
  landedCost: "",
  currentPlatform: [],
  monthlyOrderRange: "50-150",
  reviewCount: "",
  rating: "",
  sellingPoints: ["", "", ""],
  imageEmoji: "📦",
  imageAlt: "",
  shopifyStatus: "none",
  monthlyTestBudget: "",
  visualDemo: "medium",
  searchDemand: "medium",
  sourceUrl: "",
};

const fromDemo = (): FormState => ({
  name: DEMO_PRODUCT.name,
  category: DEMO_PRODUCT.category,
  price: String(DEMO_PRODUCT.price),
  landedCost: String(DEMO_PRODUCT.landedCost),
  currentPlatform: [...DEMO_PRODUCT.currentPlatform],
  monthlyOrderRange: DEMO_PRODUCT.monthlyOrderRange,
  reviewCount: String(DEMO_PRODUCT.reviewCount),
  rating: String(DEMO_PRODUCT.rating),
  sellingPoints: [
    DEMO_PRODUCT.sellingPoints[0],
    DEMO_PRODUCT.sellingPoints[1],
    DEMO_PRODUCT.sellingPoints[2],
  ],
  imageEmoji: DEMO_PRODUCT.imageEmoji,
  imageAlt: DEMO_PRODUCT.imageAlt,
  shopifyStatus: DEMO_PRODUCT.shopifyStatus,
  monthlyTestBudget: String(DEMO_PRODUCT.monthlyTestBudget),
  visualDemo: DEMO_PRODUCT.visualDemo,
  searchDemand: DEMO_PRODUCT.searchDemand,
  sourceUrl: "",
});

const inputClass =
  "w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink";
const labelClass = "mb-1.5 block text-[13px] font-medium text-ink";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {hint ? <p className="mt-1 text-[11px] leading-relaxed text-ink-muted">{hint}</p> : null}
    </div>
  );
}

export default function IntakePage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const saveProduct = useAppStore((s) => s.saveProduct);
  const loadDemoProduct = useAppStore((s) => s.loadDemoProduct);
  const [source, setSource] = useState<Source>("manual");
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const useDemo = () => {
    setForm(fromDemo());
    setSource("manual");
    setIsDemo(true);
    setError(null);
  };

  const submit = () => {
    if (!form.name.trim()) return setError("请填写商品名称。");
    const price = Number(form.price);
    const cost = Number(form.landedCost);
    if (!price || price <= 0) return setError("请填写有效的售价。");
    if (Number.isNaN(cost) || cost < 0) return setError("请填写有效的单件落地成本。");
    if (cost >= price) return setError("落地成本高于或等于售价，请检查数字。");

    if (isDemo) {
      loadDemoProduct();
      router.push("/diagnosis");
      return;
    }

    saveProduct({
      name: form.name.trim(),
      category: form.category,
      price,
      landedCost: cost,
      currentPlatform: form.currentPlatform,
      monthlyOrderRange: form.monthlyOrderRange,
      reviewCount: Number(form.reviewCount) || 0,
      rating: Number(form.rating) || 0,
      sellingPoints: form.sellingPoints.map((s) => s.trim()).filter(Boolean),
      imageEmoji: form.imageEmoji || "📦",
      imageAlt: form.imageAlt || form.name,
      shopifyStatus: form.shopifyStatus,
      monthlyTestBudget: Number(form.monthlyTestBudget) || 0,
      visualDemo: form.visualDemo,
      searchDemand: form.searchDemand,
      sourceUrl: form.sourceUrl || undefined,
    });
    router.push("/diagnosis");
  };

  return (
    <div>
      <PageHeader
        eyebrow="Step 1 · Product Intake"
        title="导入商品"
        description="V1 不抓取真实链接。粘贴链接只是记录来源，下面的字段需要你确认或补充——后面所有诊断和渠道建议都由这些字段推导。"
      />

      <Card className="mb-6">
        <SectionTitle title="来源" hint="选择一种方式开始，四种方式最终都会进入同一张表单。" />
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "amazon", label: "粘贴 Amazon 链接" },
              { id: "tiktok", label: "粘贴 TikTok Shop 链接" },
              { id: "manual", label: "手动输入" },
            ] as const
          ).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setSource(s.id);
                setIsDemo(false);
              }}
              className={`rounded-lg border px-3 py-2 text-[13px] transition-colors ${
                source === s.id && !isDemo
                  ? "border-ink bg-ink text-canvas"
                  : "border-line-strong bg-surface text-ink-soft hover:bg-surface-muted"
              }`}
            >
              {s.label}
            </button>
          ))}
          <Button variant="secondary" size="sm" onClick={useDemo}>
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
            Use Demo Product
          </Button>
        </div>

        {source !== "manual" && !isDemo ? (
          <div className="mt-4">
            <Field
              label={source === "amazon" ? "Amazon 商品链接" : "TikTok Shop 商品链接"}
              hint="V1 不会抓取该链接，只作为来源记录。请继续手动确认下面的字段。"
            >
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 shrink-0 text-ink-muted" strokeWidth={1.75} />
                <input
                  className={inputClass}
                  placeholder="https://..."
                  value={form.sourceUrl}
                  onChange={(e) => set("sourceUrl", e.target.value)}
                />
              </div>
            </Field>
          </div>
        ) : null}

        {isDemo ? (
          <div className="mt-4">
            <Callout tone="good" title="已填入 Demo 商品">
              {DEMO_PRODUCT.name}：一套适合旅行携带护肤品的磁吸防漏分装瓶。你可以直接提交，也可以先修改任意字段。
            </Callout>
          </div>
        ) : null}
      </Card>

      <Card className="mb-6">
        <SectionTitle title="商品基础信息" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="商品名称">
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => {
                  set("name", e.target.value);
                  setIsDemo(false);
                }}
                placeholder="例如：NomadLeak Magnetic Travel Containers"
              />
            </Field>
          </div>
          <Field label="商品类别">
            <select
              className={inputClass}
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="商品图片（占位符号）" hint="V1 不做图片上传，用一个符号代表商品即可。">
            <input
              className={inputClass}
              value={form.imageEmoji}
              maxLength={4}
              onChange={(e) => set("imageEmoji", e.target.value)}
            />
          </Field>
          <Field label="售价（USD）">
            <input
              className={inputClass}
              inputMode="decimal"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              placeholder="34"
            />
          </Field>
          <Field label="单件落地成本（USD）" hint="含采购、头程、平台外的固定履约成本。">
            <input
              className={inputClass}
              inputMode="decimal"
              value={form.landedCost}
              onChange={(e) => set("landedCost", e.target.value)}
              placeholder="9.6"
            />
          </Field>
          <Field label="月订单区间">
            <select
              className={inputClass}
              value={form.monthlyOrderRange}
              onChange={(e) => set("monthlyOrderRange", e.target.value)}
            >
              {ORDER_RANGES.map((r) => (
                <option key={r} value={r}>
                  {r} 单 / 月
                </option>
              ))}
            </select>
          </Field>
          <Field label="每月可测试预算（USD）">
            <input
              className={inputClass}
              inputMode="decimal"
              value={form.monthlyTestBudget}
              onChange={(e) => set("monthlyTestBudget", e.target.value)}
              placeholder="1500"
            />
          </Field>
          <Field label="Review 数量">
            <input
              className={inputClass}
              inputMode="numeric"
              value={form.reviewCount}
              onChange={(e) => set("reviewCount", e.target.value)}
              placeholder="214"
            />
          </Field>
          <Field label="评分（1-5）">
            <input
              className={inputClass}
              inputMode="decimal"
              value={form.rating}
              onChange={(e) => set("rating", e.target.value)}
              placeholder="4.5"
            />
          </Field>
        </div>

        <div className="mt-5">
          <label className={labelClass}>当前销售平台</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => {
              const active = form.currentPlatform.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() =>
                    set(
                      "currentPlatform",
                      active
                        ? form.currentPlatform.filter((x) => x !== p)
                        : [...form.currentPlatform, p],
                    )
                  }
                  className={`rounded-lg border px-3 py-1.5 text-[13px] transition-colors ${
                    active
                      ? "border-ink bg-ink text-canvas"
                      : "border-line-strong bg-surface text-ink-soft hover:bg-surface-muted"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5">
          <label className={labelClass}>Shopify 独立站状态</label>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { v: "none", l: "还没有" },
                { v: "building", l: "建设中" },
                { v: "live", l: "已上线" },
              ] as const
            ).map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() => set("shopifyStatus", o.v)}
                className={`rounded-lg border px-3 py-1.5 text-[13px] transition-colors ${
                  form.shopifyStatus === o.v
                    ? "border-ink bg-ink text-canvas"
                    : "border-line-strong bg-surface text-ink-soft hover:bg-surface-muted"
                }`}
              >
                {o.l}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <SectionTitle
          title="三个当前卖点"
          hint="用你现在在 listing 上写的原话，不要提前翻译成英文——诊断的一部分就是告诉你这些话在美国是否成立。"
        />
        <div className="space-y-3">
          {form.sellingPoints.map((sp, i) => (
            <input
              key={i}
              className={inputClass}
              value={sp}
              placeholder={`卖点 ${i + 1}`}
              onChange={(e) => {
                const next = [...form.sellingPoints] as FormState["sellingPoints"];
                next[i] = e.target.value;
                set("sellingPoints", next);
              }}
            />
          ))}
        </div>
      </Card>

      <Card className="mb-6">
        <SectionTitle
          title="两个渠道信号（可选，但会直接影响渠道建议）"
          hint="这两项没有客观数据源，属于你的判断。系统会把它们标记为「推断」。"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="产品差异能否在 15 秒视频里被看见？">
            <select
              className={inputClass}
              value={form.visualDemo}
              onChange={(e) => set("visualDemo", e.target.value as Strength)}
            >
              <option value="high">可以，一个镜头就能看出来</option>
              <option value="medium">需要和旧方案对比才看得出</option>
              <option value="low">很难用画面说清楚</option>
            </select>
          </Field>
          <Field label="美国买家会主动搜索这类产品吗？">
            <select
              className={inputClass}
              value={form.searchDemand}
              onChange={(e) => set("searchDemand", e.target.value as Strength)}
            >
              <option value="high">会，有明确的搜索词</option>
              <option value="medium">有一些高意图词，但量不大</option>
              <option value="low">几乎没人主动搜</option>
            </select>
          </Field>
        </div>
      </Card>

      {error ? (
        <div className="mb-4">
          <Callout tone="warn" title="请先修正">
            {error}
          </Callout>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={submit} disabled={!hydrated}>
          提交商品，进入市场准备度检查
        </Button>
        <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
          <Info className="h-3.5 w-3.5" strokeWidth={1.75} />
          提交会覆盖当前商品并清空已有的诊断与审批状态。
        </span>
      </div>
    </div>
  );
}
