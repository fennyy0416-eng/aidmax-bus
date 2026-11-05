/**
 * 确定性 mock engine：不调用任何 AI API。
 * 所有输出都由商品字段 + 品类模板推导，同样的输入必然得到同样的输出。
 */
import { DEMO_PRODUCT, DEMO_TRANSLATIONS, getCategoryProfile } from "./demo-data";
import type {
  CalendarTask,
  CampaignAsset,
  Channel,
  ChannelAllocation,
  Diagnosis,
  Insight,
  LearningReport,
  Product,
  ReadinessCheck,
  ReadinessReport,
  ScenarioKey,
  Strategy,
  TranslationPair,
} from "./types";

const round5 = (n: number) => Math.max(0, Math.min(100, Math.round(n / 5) * 5));
const money = (n: number) => Math.max(0, Math.round(n));

export function grossMargin(product: Product) {
  if (product.price <= 0) return 0;
  return Math.round(((product.price - product.landedCost) / product.price) * 100);
}

export function unitProfit(product: Product) {
  return Math.round((product.price - product.landedCost) * 10) / 10;
}

function orderMidpoint(range: string): number {
  const nums = range.match(/\d+/g)?.map(Number) ?? [];
  if (nums.length === 0) return 0;
  if (nums.length === 1) return nums[0];
  return (nums[0] + nums[1]) / 2;
}

/* ------------------------------------------------------------------ */
/* Step 2 市场准备度                                                    */
/* ------------------------------------------------------------------ */

export function computeReadiness(product: Product): ReadinessReport {
  const margin = grossMargin(product);
  const profit = unitProfit(product);
  const orders = orderMidpoint(product.monthlyOrderRange);
  const checks: ReadinessCheck[] = [];

  checks.push(
    margin >= 60 && profit >= 15
      ? {
          id: "margin",
          label: "毛利空间",
          state: "pass",
          headline: `毛利率 ${margin}%，单件毛利 $${profit}`,
          detail: "可以支撑一轮付费测试的获客成本，允许在前期用亏损换学习。",
          evidence: "observed",
        }
      : margin >= 45 || profit >= 10
        ? {
            id: "margin",
            label: "毛利空间",
            state: "warn",
            headline: `毛利率 ${margin}%，单件毛利 $${profit}`,
            detail:
              "付费流量容错很小。Meta Ads 首轮 CPA 必须压在单件毛利以内，否则每一单都是亏的。",
            evidence: "observed",
          }
        : {
            id: "margin",
            label: "毛利空间",
            state: "fail",
            headline: `毛利率 ${margin}%，单件毛利 $${profit}`,
            detail:
              "毛利不足以支持 Meta Ads 冷启动。先解决价格结构或组合销售，再谈投放。",
            evidence: "observed",
          },
  );

  checks.push(
    orders >= 200
      ? {
          id: "sales",
          label: "现有销量证据",
          state: "pass",
          headline: `月订单约 ${product.monthlyOrderRange} 单`,
          detail: `已经在 ${product.currentPlatform.join(" / ") || "现有平台"} 出单，说明产品本身可被购买，不是零验证。`,
          evidence: "observed",
        }
      : orders >= 50
        ? {
            id: "sales",
            label: "现有销量证据",
            state: "warn",
            headline: `月订单约 ${product.monthlyOrderRange} 单`,
            detail: "有出单但样本偏小，平台流量和独立站流量的购买动机可能完全不同。",
            evidence: "observed",
          }
        : {
            id: "sales",
            label: "现有销量证据",
            state: "fail",
            headline: `月订单约 ${product.monthlyOrderRange || "未填写"}`,
            detail: "缺少真实成交证据，此时做独立站获客等于同时验证产品和渠道两件事。",
            evidence: "observed",
          },
  );

  checks.push(
    product.reviewCount >= 100 && product.rating >= 4.2
      ? {
          id: "trust",
          label: "评论与信任证据",
          state: "pass",
          headline: `${product.reviewCount} 条评论，评分 ${product.rating}`,
          detail: "评论量足够搬运到独立站作为社会证明，可直接用于广告与产品页。",
          evidence: "observed",
        }
      : product.reviewCount >= 30
        ? {
            id: "trust",
            label: "评论与信任证据",
            state: "warn",
            headline: `${product.reviewCount} 条评论，评分 ${product.rating}`,
            detail: "信任证据偏薄，独立站需要补退换货承诺、真实使用图和 UGC。",
            evidence: "observed",
          }
        : {
            id: "trust",
            label: "评论与信任证据",
            state: "fail",
            headline: `${product.reviewCount} 条评论，评分 ${product.rating || "无"}`,
            detail: "几乎没有社会证明，冷流量在独立站下单的阻力会非常大。",
            evidence: "observed",
          },
  );

  checks.push(
    product.visualDemo === "high"
      ? {
          id: "differentiation",
          label: "产品差异是否可展示",
          state: "pass",
          headline: "差异可以在 15 秒内被看见",
          detail: "适合用演示型内容验证，不需要靠长文案解释。",
          evidence: "inferred",
        }
      : product.visualDemo === "medium"
        ? {
            id: "differentiation",
            label: "产品差异是否可展示",
            state: "warn",
            headline: "差异需要对比才能看出来",
            detail: "必须设计明确的对照组镜头（旧方案 vs 本产品），否则内容会沦为普通展示。",
            evidence: "inferred",
          }
        : {
            id: "differentiation",
            label: "产品差异是否可展示",
            state: "fail",
            headline: "商品优势无法在视频中展示",
            detail: "在视觉渠道很难建立溢价理由，应优先考虑搜索意图与详情页说服。",
            evidence: "inferred",
          },
  );

  checks.push(
    product.shopifyStatus === "live"
      ? {
          id: "site",
          label: "独立站基础",
          state: "pass",
          headline: "Shopify 已上线",
          detail: "可以直接承接流量，但仍需检查退换货、运费门槛与信任元素。",
          evidence: "observed",
        }
      : product.shopifyStatus === "building"
        ? {
            id: "site",
            label: "独立站基础",
            state: "warn",
            headline: "Shopify 建设中",
            detail:
              "在站点缺少退换货政策与信任元素之前投付费流量，等于花钱买跳出率。第一周必须先补完。",
            evidence: "observed",
          }
        : {
            id: "site",
            label: "独立站基础",
            state: "fail",
            headline: "尚无独立站",
            detail: "没有落地页，付费流量无处可去。先完成产品页再谈渠道预算。",
            evidence: "observed",
          },
  );

  const fails = checks.filter((c) => c.state === "fail").length;
  const warns = checks.filter((c) => c.state === "warn").length;
  const status = fails > 0 ? (fails >= 2 ? "not_ready" : "caution") : warns >= 2 ? "caution" : "ready";

  const risks = checks
    .filter((c) => c.state !== "pass")
    .map((c) => `${c.label}：${c.detail}`);

  const summary =
    status === "ready"
      ? "基础条件具备，可以进入小额测试阶段。第一轮目标是验证信息表达，不是追求 ROAS。"
      : status === "caution"
        ? "可以测试，但必须带着限制条件测。先补齐下方风险项，再考虑加预算。"
        : "现在不适合放大投放。继续 Demo 可以帮你看清路径，但先解决下方阻断项。";

  return { status, summary, risks, checks, grossMarginPercent: margin, unitProfit: profit };
}

/* ------------------------------------------------------------------ */
/* Step 3 美国市场诊断                                                  */
/* ------------------------------------------------------------------ */

function translateSellingPoint(point: string, product: Product): TranslationPair {
  const rules: { test: RegExp; to: string; why: string }[] = [
    {
      test: /硅胶|材质|食品级|不锈钢|abs|材料/i,
      to: "Made to survive the way you actually pack, not just a spec sheet",
      why: "材质是工厂语言。美国买家关心的是它在真实使用场景里会不会出问题。",
    },
    {
      test: /磁吸|模块|拼接|多功能|可折叠/i,
      to: "Everything snaps together into one thing you can grab and go",
      why: "把结构描述翻译成使用后的画面，读者才能在 3 秒内看懂。",
    },
    {
      test: /防漏|密封|不漏/i,
      to: "No leaks, no ruined clothes, no cleaning your bag at the hotel",
      why: "功能承诺要落到「避免了什么损失」，损失比参数更有说服力。",
    },
    {
      test: /套装|件套|组合/i,
      to: "One complete set — nothing else to buy before your trip",
      why: "件数是规格，「不用再补买」才是买家想要的确定性。",
    },
    {
      test: /便携|轻便|小巧|旅行/i,
      to: "Fits the space you actually have, not the space you wish you had",
      why: "尺寸描述换成空间焦虑，更贴近真实决策。",
    },
    {
      test: /认证|合规|通过|测试|tsa|fda/i,
      to: "Checked against the rules that get things confiscated",
      why: "合规是入场券。要说明它帮买家避免了什么具体麻烦。",
    },
  ];
  const hit = rules.find((r) => r.test.test(point));
  return {
    from: point,
    to:
      hit?.to ??
      `Solves the exact moment ${product.category.replace(/-/g, " ")} buyers complain about`,
    why:
      hit?.why ??
      "这条卖点还停留在产品视角。改写成买家在什么场景下会因此松一口气，才是消费者语言。",
  };
}

export function runDiagnosis(product: Product): Diagnosis {
  const profile = getCategoryProfile(product.category);
  const isDemo = product.id === DEMO_PRODUCT.id;

  const ev = (text: string, evidence: Insight["evidence"]): Insight => ({ text, evidence });

  const demandSummary: Insight[] = [
    ev(
      `卖家已在 ${product.currentPlatform.join(" / ") || "现有平台"} 产生 ${product.monthlyOrderRange || "未知"} 月订单，评分 ${product.rating}（${product.reviewCount} 条评论）。`,
      "observed",
    ),
    ...profile.demandNotes.map((n) => ev(n, "inferred")),
    ev(
      `独立站冷流量是否愿意以 $${product.price} 购买，目前没有任何数据支持，必须由第一轮实验回答。`,
      "test_required",
    ),
  ];

  const toInsights = (arr: string[], level: Insight["evidence"]) =>
    arr.map((t) => ev(t, level));

  const personas: Diagnosis["personas"] = [
    {
      name: profile.primaryPersona.name,
      role: "primary",
      snapshot: profile.primaryPersona.snapshot,
      triggers: toInsights(profile.primaryPersona.triggers, "inferred"),
      anxieties: toInsights(profile.primaryPersona.anxieties, "inferred"),
      alternatives: toInsights(profile.primaryPersona.alternatives, "inferred"),
      objections: toInsights(profile.primaryPersona.objections, "test_required"),
    },
    {
      name: profile.secondaryPersona.name,
      role: "secondary",
      snapshot: profile.secondaryPersona.snapshot,
      triggers: toInsights(profile.secondaryPersona.triggers, "inferred"),
      anxieties: toInsights(profile.secondaryPersona.anxieties, "inferred"),
      alternatives: toInsights(profile.secondaryPersona.alternatives, "inferred"),
      objections: toInsights(profile.secondaryPersona.objections, "test_required"),
    },
  ];

  const translations = isDemo
    ? DEMO_TRANSLATIONS
    : product.sellingPoints.filter(Boolean).map((p) => translateSellingPoint(p, product));

  return {
    generatedAt: Date.now(),
    demandSummary,
    personas,
    purchasePath: profile.purchasePath.map((s, i) => ({
      ...s,
      evidence: i === 0 ? "inferred" : i === profile.purchasePath.length - 1 ? "test_required" : "inferred",
    })),
    translations,
    competitors: profile.competitorShape.map((c) => ({ ...c, evidence: "inferred" as const })),
    openQuestions: [
      `美国买家是否愿意为「${translations[0]?.to ?? "核心价值"}」支付 $${product.price}？`,
      "第一次点击广告的人，是被问题打动，还是被产品外观打动？",
      "拒绝购买的主要理由是价格，还是「看不出和便宜货的差别」？",
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Step 4 渠道路由                                                      */
/* ------------------------------------------------------------------ */

interface Driver {
  label: string;
  points: number;
  note: string;
}

function tiktokDrivers(product: Product): Driver[] {
  const d: Driver[] = [];
  d.push({
    label: "差异可视化程度",
    points: product.visualDemo === "high" ? 35 : product.visualDemo === "medium" ? 20 : 5,
    note:
      product.visualDemo === "high"
        ? "核心价值可以在一个镜头里被看见，这是短视频渠道最重要的前提。"
        : product.visualDemo === "medium"
          ? "需要对照组才能看出差别，内容制作难度上升。"
          : "很难用画面说清差异，短视频会变成无差别展示。",
  });
  d.push({
    label: "价格与冲动购买",
    points: product.price < 40 ? 20 : product.price < 80 ? 12 : 5,
    note: `$${product.price} ${product.price < 40 ? "落在刷到即可下单的价格带" : product.price < 80 ? "需要多一层信任才会转化" : "属于考虑型购买，短视频更适合种草而非直接成交"}。`,
  });
  const margin = grossMargin(product);
  d.push({
    label: "毛利可承受的内容试错成本",
    points: margin >= 60 ? 15 : margin >= 45 ? 10 : margin >= 30 ? 5 : 0,
    note: `毛利率 ${margin}%，${margin >= 60 ? "可以承受多条素材试错" : margin >= 30 ? "试错次数受限，需要更谨慎地选题" : "几乎没有试错空间"}。`,
  });
  const onTikTok = product.currentPlatform.some((p) => /tiktok/i.test(p));
  d.push({
    label: "平台内已有基础",
    points: onTikTok ? 10 : 0,
    note: onTikTok
      ? "已在 TikTok Shop 出单，账号、素材与受众理解可以复用。"
      : "尚未在 TikTok 生态出单，需要从零积累账号权重。",
  });
  d.push({ label: "基础分", points: 5, note: "该渠道的最低起评分。" });
  return d;
}

function metaDrivers(product: Product): Driver[] {
  const profit = unitProfit(product);
  const d: Driver[] = [];
  d.push({
    label: "单件毛利能否覆盖付费获客",
    points: profit >= 20 ? 22 : profit >= 12 ? 14 : profit >= 6 ? 7 : 0,
    note: `单件毛利 $${profit}，${profit >= 20 ? "允许 CPA 在 $15-20 区间试错" : profit >= 12 ? "CPA 必须压在 $10 以内" : "付费获客几乎必然亏损"}。`,
  });
  d.push({
    label: "社会证明储备",
    points: product.reviewCount >= 200 && product.rating >= 4.3 ? 15 : product.reviewCount >= 50 ? 9 : 3,
    note: `${product.reviewCount} 条评论 / ${product.rating} 分，${product.reviewCount >= 200 ? "可以直接作为广告素材与落地页信任元素" : "信任元素不足，冷流量转化会被压低"}。`,
  });
  d.push({
    label: "Retargeting 流量池",
    points: product.shopifyStatus === "live" ? 15 : product.shopifyStatus === "building" ? 5 : 0,
    note:
      product.shopifyStatus === "live"
        ? "站点已上线，可累积 Pixel 数据支撑再营销。"
        : product.shopifyStatus === "building"
          ? "站点未上线，Pixel 无数据，Retargeting 需要等待前置流量。"
          : "没有站点就没有再营销对象。",
  });
  d.push({
    label: "胜出素材储备",
    points: 0,
    note: "目前没有任何经过验证的素材。Meta 冷启动依赖素材命中率，先在低成本渠道找到胜出角度更划算。",
  });
  d.push({
    label: "预算规模",
    points: product.monthlyTestBudget >= 2000 ? 10 : product.monthlyTestBudget >= 1000 ? 6 : 2,
    note: `月测试预算 $${product.monthlyTestBudget}，${product.monthlyTestBudget >= 2000 ? "足以同时跑多个广告组" : "只够跑单一广告组，结论会更慢"}。`,
  });
  d.push({ label: "基础分", points: 3, note: "该渠道的最低起评分。" });
  return d;
}

function seoDrivers(product: Product): Driver[] {
  const d: Driver[] = [];
  d.push({
    label: "主动搜索需求",
    points: product.searchDemand === "high" ? 28 : product.searchDemand === "medium" ? 16 : 6,
    note:
      product.searchDemand === "high"
        ? "买家会主动搜索这个问题，高意图流量值得提前布局。"
        : product.searchDemand === "medium"
          ? "存在搜索需求，但集中在少量高意图词，不需要大规模内容。"
          : "几乎没有人主动搜索，内容只能靠推荐流分发。",
  });
  d.push({
    label: "站点基础",
    points: product.shopifyStatus === "live" ? 14 : product.shopifyStatus === "building" ? 6 : 2,
    note:
      product.shopifyStatus === "live"
        ? "已有可被索引的站点结构。"
        : "站点尚未上线，SEO 的复利要等站点完成后才开始计算。",
  });
  d.push({
    label: "客单价与决策周期",
    points: product.price >= 60 ? 12 : product.price >= 30 ? 7 : 3,
    note: `$${product.price} ${product.price >= 60 ? "属于会先搜索对比再下单的价格带" : "决策链条短，搜索行为不密集"}。`,
  });
  d.push({
    label: "可复用的内容素材",
    points: product.reviewCount >= 100 ? 5 : 2,
    note: `${product.reviewCount} 条评论可以拆成 FAQ 与对比页内容。`,
  });
  d.push({
    label: "见效周期惩罚",
    points: -10,
    note: "SEO 通常需要 8-12 周才有稳定自然流量，与「30 天内验证渠道」的目标直接冲突。",
  });
  d.push({ label: "基础分", points: 3, note: "该渠道的最低起评分。" });
  return d;
}

const CHANNEL_LABEL: Record<Channel, string> = {
  tiktok: "TikTok",
  meta: "Meta Ads",
  seo: "SEO",
};

export function routeChannels(product: Product): Strategy {
  const raw: { channel: Channel; drivers: Driver[] }[] = [
    { channel: "tiktok", drivers: tiktokDrivers(product) },
    { channel: "meta", drivers: metaDrivers(product) },
    { channel: "seo", drivers: seoDrivers(product) },
  ];

  const scored = raw
    .map((r) => ({
      channel: r.channel,
      drivers: r.drivers,
      score: round5(r.drivers.reduce((s, d) => s + d.points, 0)),
    }))
    .sort((a, b) => b.score - a.score);

  const gap = scored[0].score - scored[1].score;
  const split: [number, number, number] = gap >= 20 ? [70, 20, 10] : gap >= 10 ? [60, 25, 15] : [50, 30, 20];
  const roles: ChannelAllocation["role"][] = ["primary", "supporting", "deferred"];

  const invalidation: Record<Channel, string> = {
    tiktok:
      "如果三条不同角度的创意都拿不到 3 秒完播率 30% 以上，说明「问题表达」假设被证伪，应该换渠道或先改产品页。",
    meta: `如果 7 天内 CPC 持续高于 $1.5 且 Add to Cart 率低于 1%，说明 $${product.price} 的价格表达没有被接受，应停止加预算。`,
    seo: "如果高意图词的实际排名 8 周内进不了前 20，说明该词竞争强度被低估，应把资源退回到付费渠道。",
  };

  const firstTest: Record<Channel, string> = {
    tiktok: "同一产品，三个不同 Hook 角度，各 1 条，观察哪个角度留人。",
    meta: "单一广告组，宽泛受众，用 TikTok 胜出角度改编成静态与视频各一版。",
    seo: "只做产品页 + 一个对比页，不批量写文章。",
  };

  const allocations: ChannelAllocation[] = scored.map((s, i) => {
    const rationale = s.drivers
      .filter((d) => d.label !== "基础分")
      .sort((a, b) => Math.abs(b.points) - Math.abs(a.points))
      .slice(0, 3)
      .map((d) => `${d.label}（${d.points >= 0 ? "+" : ""}${d.points}）：${d.note}`);
    return {
      channel: s.channel,
      score: s.score,
      budgetPercent: split[i],
      role: roles[i],
      rationale,
      scoreDrivers: s.drivers,
      invalidationCondition: invalidation[s.channel],
      firstTest: firstTest[s.channel],
    };
  });

  const primary = allocations[0];
  const supporting = allocations[1];
  const deferred = allocations[2];

  return {
    generatedAt: Date.now(),
    headline: `主渠道 ${CHANNEL_LABEL[primary.channel]}（${primary.score} 分），辅助 ${CHANNEL_LABEL[supporting.channel]}，暂缓 ${CHANNEL_LABEL[deferred.channel]}。`,
    allocations,
    sequencing: [
      `第 1-2 周把预算和精力集中在 ${CHANNEL_LABEL[primary.channel]}，目标是找到一个能留住人的表达角度，不是出单。`,
      `${CHANNEL_LABEL[supporting.channel]} 只承接已经被验证过的角度，避免同时在两个渠道做冷启动。`,
      `${CHANNEL_LABEL[deferred.channel]} 本轮只做最小必要动作，不投入内容产能。`,
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Step 5 执行资产                                                      */
/* ------------------------------------------------------------------ */

let assetSeq = 0;
const nextId = (prefix: string) => `${prefix}-${(assetSeq += 1)}`;

function budgetFor(product: Product, strategy: Strategy, channel: Channel) {
  const a = strategy.allocations.find((x) => x.channel === channel);
  return money((product.monthlyTestBudget * (a?.budgetPercent ?? 0)) / 100);
}

function tiktokAssets(product: Product, strategy: Strategy): CampaignAsset[] {
  const profile = getCategoryProfile(product.category);
  const scenes = profile.tiktokScenes;
  const monthly = budgetFor(product, strategy, "tiktok");
  const now = Date.now();

  const base = {
    channel: "tiktok" as Channel,
    group: "TikTok 创意",
    status: "draft" as const,
    requiresSpendApproval: false,
    updatedAt: now,
  };

  return [
    {
      ...base,
      id: nextId("tt"),
      title: "创意 A ｜ Problem-first：先让人看见损失",
      subtitle: "验证「问题表达」是否足够扎心",
      hypothesis: "美国买家会因为「怕出事」而停下来，而不是因为产品好看。",
      successSignal: "3 秒完播率 ≥ 30%，评论里出现「this happened to me」类共鸣。",
      failSignal: "3 秒完播率 < 20%，评论集中在与产品无关的话题。",
      budgetNote: `素材制作与少量加热，本月该渠道预算 $${monthly}`,
      fields: [
        {
          key: "hook",
          label: "前 3 秒 Hook",
          type: "text",
          editable: true,
          value: `I stopped ${scenes.problem.includes("乳液") ? "packing lotion" : "using my old setup"} after this happened.`,
          hint: "可编辑。Hook 必须在 3 秒内说清「谁会有麻烦」。",
        },
        {
          key: "script",
          label: "20-30 秒脚本",
          type: "list",
          editable: true,
          value: [
            `0-3s：${scenes.problem}，画面先给损失，不给产品。`,
            "3-8s：口播「这不是运气差，是because的结构问题」，指出旧方案的缺陷点。",
            `8-18s：切到 ${product.name}，把同样的场景重做一遍，展示结果不同。`,
            `18-26s：一句话点出差异（不念参数），给出 $${product.price} 的价格与成套构成。`,
            "26-30s：CTA + 屏幕字幕，引导点击主页链接。",
          ],
        },
        {
          key: "shots",
          label: "Shot List",
          type: "list",
          editable: false,
          value: [
            `镜头 1：${scenes.setting}，中景手持`,
            "镜头 2：损失特写（脏掉/坏掉/乱掉的那一刻）",
            "镜头 3：产品出现，俯拍平铺",
            "镜头 4：同场景重演，结果对比",
            "镜头 5：手持产品对镜头，收尾",
          ],
        },
        {
          key: "captions",
          label: "屏幕字幕",
          type: "list",
          editable: false,
          value: ["This ruined a $90 shirt.", "It wasn't bad luck.", "Same trip. Different result."],
        },
        { key: "cta", label: "CTA", type: "text", editable: true, value: "Link in bio — see the leak test." },
      ],
    },
    {
      ...base,
      id: nextId("tt"),
      title: "创意 B ｜ Demonstration-first：先做一次极端验证",
      subtitle: "验证「演示可信度」是否能替代文案说服",
      hypothesis: "把产品放在最极端条件下演示一次，比任何参数描述更能建立溢价理由。",
      successSignal: "平均观看时长 ≥ 12 秒，出现「does it really work」类追问。",
      failSignal: "观看时长 < 8 秒，或评论认为演示是摆拍。",
      budgetNote: `素材制作与少量加热，本月该渠道预算 $${monthly}`,
      fields: [
        {
          key: "hook",
          label: "前 3 秒 Hook",
          type: "text",
          editable: true,
          value: "Let's see if this actually holds. No cuts.",
          hint: "可编辑。演示型 Hook 要承诺一次「不剪辑」的验证。",
        },
        {
          key: "script",
          label: "20-30 秒脚本",
          type: "list",
          editable: true,
          value: [
            "0-3s：产品已在手中，直接宣布要做的测试，不做自我介绍。",
            `3-12s：${scenes.demo}，全程一镜到底。`,
            "12-20s：展示结果特写（纸巾/桌面/内衬保持干净）。",
            "20-27s：说明这个结果对使用者意味着什么，不念材质参数。",
            "27-30s：CTA。",
          ],
        },
        {
          key: "shots",
          label: "Shot List",
          type: "list",
          editable: false,
          value: [
            "镜头 1：桌面平铺，自然光，无剪辑",
            "镜头 2：极端操作过程（倒置/挤压/甩动）",
            "镜头 3：结果特写",
            "镜头 4：产品与旧方案并排",
          ],
        },
        {
          key: "captions",
          label: "屏幕字幕",
          type: "list",
          editable: false,
          value: ["No edits.", "Upside down. Squeezed. Shaken.", "Still dry."],
        },
        { key: "cta", label: "CTA", type: "text", editable: true, value: "Full test on the site." },
      ],
    },
    {
      ...base,
      id: nextId("tt"),
      title: "创意 C ｜ Transformation-first：先给结果画面",
      subtitle: "验证「结果画面」能否带来收藏与分享",
      hypothesis: "买家想要的不是产品，而是整理好之后的那个状态。",
      successSignal: "收藏率 ≥ 2%，分享量高于其他两条。",
      failSignal: "收藏率 < 0.8%，说明结果画面没有吸引力。",
      budgetNote: `素材制作与少量加热，本月该渠道预算 $${monthly}`,
      fields: [
        {
          key: "hook",
          label: "前 3 秒 Hook",
          type: "text",
          editable: true,
          value: "From this mess to this in 40 seconds.",
          hint: "可编辑。转变型 Hook 要在 3 秒内给出「之后」的画面。",
        },
        {
          key: "script",
          label: "20-30 秒脚本",
          type: "list",
          editable: true,
          value: [
            "0-3s：混乱状态全景，语速快。",
            `3-10s：${scenes.transformation} 的过程加速镜头。`,
            "10-20s：整理完成后的静态展示，慢下来给细节。",
            "20-27s：一句话说明为什么这个状态可以持续，而不是拍完就乱。",
            "27-30s：CTA。",
          ],
        },
        {
          key: "shots",
          label: "Shot List",
          type: "list",
          editable: false,
          value: ["镜头 1：混乱全景", "镜头 2：加速整理过程", "镜头 3：成品俯拍", "镜头 4：装入包中收尾"],
        },
        {
          key: "captions",
          label: "屏幕字幕",
          type: "list",
          editable: false,
          value: ["Before.", "After.", "It stays like this."],
        },
        { key: "cta", label: "CTA", type: "text", editable: true, value: "Shop the set — link in bio." },
      ],
    },
  ];
}

function metaAssets(product: Product, strategy: Strategy): CampaignAsset[] {
  const monthly = budgetFor(product, strategy, "meta");
  const prospectingDaily = Math.max(5, money((monthly * 0.6) / 30));
  const retargetingDaily = Math.max(3, money((monthly * 0.4) / 30));
  const profit = unitProfit(product);
  const now = Date.now();
  const base = { channel: "meta" as Channel, status: "draft" as const, updatedAt: now };

  return [
    {
      ...base,
      id: nextId("meta"),
      group: "Meta Campaign",
      title: "Prospecting Campaign 草案",
      subtitle: "冷启动，只验证角度，不追 ROAS",
      hypothesis: "在 TikTok 被验证过的角度，可以在 Meta 以更低 CPC 触达同一类人群。",
      successSignal: "7 天内 CPC ≤ $1.2 且 Landing Page View → Add to Cart ≥ 3%。",
      failSignal: `7 天内花费达到 $${money(prospectingDaily * 7)} 但 Add to Cart < 5 次。`,
      requiresSpendApproval: true,
      budgetNote: `日预算 $${prospectingDaily}，7 天上限 $${money(prospectingDaily * 7)}`,
      fields: [
        { key: "objective", label: "Campaign Objective", type: "text", editable: false, value: "Sales / Conversions（优化目标先设为 Add to Cart，样本量不足时不要直接优化 Purchase）" },
        {
          key: "audience",
          label: "受众假设",
          type: "list",
          editable: true,
          value: [
            "Broad：US，25-45，无兴趣定向，交给算法找人（对照组）",
            `Interest：与「${getCategoryProfile(product.category).label}」相关的兴趣词组合`,
            "Lookalike：暂不开，Pixel 数据不足时 LLA 没有意义",
          ],
        },
        { key: "placements", label: "版位", type: "text", editable: false, value: "Advantage+ Placements，但排除 Audience Network（垃圾流量占比高）" },
        { key: "budget", label: "日预算", type: "text", editable: true, value: `$${prospectingDaily}/天` },
        {
          key: "stopRules",
          label: "7 天停止规则",
          type: "list",
          editable: false,
          value: [
            `单件毛利只有 $${profit}，CPA 超过 $${money(profit)} 即视为不可持续，立即停。`,
            "花完 $" + money(prospectingDaily * 7) + " 仍无 Add to Cart：停投，回到落地页与价格表达。",
            "CTR < 0.6%：素材问题，换素材而不是加预算。",
            "任何情况下不自动加预算，加预算必须重新走审批。",
          ],
        },
      ],
    },
    {
      ...base,
      id: nextId("meta"),
      group: "Meta Campaign",
      title: "Retargeting Campaign 草案",
      subtitle: "只放大已经被验证过的兴趣人群",
      hypothesis: "看过内容但没下单的人，缺的是信任证据而不是新的卖点。",
      successSignal: "Retargeting ROAS 高于 Prospecting，且 CPA 低于单件毛利。",
      failSignal: "受众规模长期不足 1000 人，说明前端流量还不够，不应继续开这组。",
      requiresSpendApproval: true,
      budgetNote: `日预算 $${retargetingDaily}，前置条件：站点 Pixel 有 ≥ 1000 次 Landing Page View`,
      fields: [
        { key: "objective", label: "Campaign Objective", type: "text", editable: false, value: "Sales / Conversions，优化 Purchase" },
        {
          key: "audience",
          label: "受众假设",
          type: "list",
          editable: true,
          value: [
            "站点访客 30 天，排除已购买",
            "TikTok / IG 视频观看 ≥ 50% 的人群 14 天",
            "Add to Cart 未结账 7 天（优先级最高）",
          ],
        },
        { key: "budget", label: "日预算", type: "text", editable: true, value: `$${retargetingDaily}/天` },
        {
          key: "stopRules",
          label: "7 天停止规则",
          type: "list",
          editable: false,
          value: [
            "受众 < 1000 人时不开启，避免频次过高。",
            "频次 > 4 且无转化：暂停，先改落地页。",
            "不得把 Retargeting 的 ROAS 当作整体获客效率对外汇报。",
          ],
        },
      ],
    },
    {
      ...base,
      id: nextId("meta"),
      group: "Meta 文案",
      title: "Primary Text ×3 与 Headline ×3",
      subtitle: "三条文案对应三个不同角度，不是同一句话的改写",
      hypothesis: "问题型文案的点击率会高于功能型文案。",
      successSignal: "三条文案中至少一条 CTR ≥ 1%，且明显高于其余两条。",
      failSignal: "三条文案 CTR 都在 0.5% 上下，说明角度全都没打中。",
      requiresSpendApproval: false,
      fields: [
        {
          key: "primaryTexts",
          label: "Primary Text（可编辑）",
          type: "list",
          editable: true,
          hint: "可编辑。每条对应一个不同角度：损失 / 验证 / 结果。",
          value: [
            "A（损失角度）：One leaked bottle can cost more than the whole set. This one doesn't.",
            "B（验证角度）：We turned it upside down, squeezed it, and shook it. Still dry. Watch the test.",
            "C（结果角度）：Your whole routine in one stack, packed in under a minute.",
          ],
        },
        {
          key: "headlines",
          label: "Headline（可编辑）",
          type: "list",
          editable: true,
          value: [
            "Leak-tested, not just leak-proof",
            `The $${product.price} set that replaces the $${Math.max(8, Math.round(product.price * 0.3))} one you keep rebuying`,
            "Packed in one minute. Stays that way.",
          ],
        },
        {
          key: "note",
          label: "使用规则",
          type: "multiline",
          editable: false,
          value:
            "不要在文案中承诺 ROAS、销量或「爆款」。所有数字必须来自实测。价格对比只能引用你自己可验证的价格。",
        },
      ],
    },
    {
      ...base,
      id: nextId("meta"),
      group: "Meta 素材",
      title: "Visual Brief ×2",
      subtitle: "一版静态，一版视频改编",
      hypothesis: "静态图能以更低成本复用 TikTok 的胜出角度。",
      successSignal: "静态版 CPM 低于视频版且 CTR 不低于视频版的 70%。",
      failSignal: "两版都无法把观众带到落地页（LPV/Click < 60%）。",
      requiresSpendApproval: false,
      fields: [
        {
          key: "visualA",
          label: "Visual A：对比静态图",
          type: "multiline",
          editable: false,
          value:
            "左：旧方案造成的混乱/损失现场；右：使用本产品后的整齐状态。中间一条细分割线，不加任何滤镜。字数控制在 6 个单词以内，文字压在图片下三分之一。",
        },
        {
          key: "visualB",
          label: "Visual B：演示视频改编（9:16 + 1:1 两版）",
          type: "multiline",
          editable: false,
          value:
            "直接使用 TikTok 创意 B 的原素材，前 2 秒加一层静态封面帧，保留原声，加英文硬字幕。不要重新配音成广告腔。",
        },
      ],
    },
  ];
}

function seoAssets(product: Product, strategy: Strategy): CampaignAsset[] {
  const profile = getCategoryProfile(product.category);
  const seeds = profile.seoSeeds;
  const keyword = product.category.replace(/-/g, " ");
  const fill = (arr: string[]) =>
    arr.map((s) => s.replace(/\{keyword\}/g, keyword).replace(/\{brand\}/g, product.name.split(" ")[0]).replace(/\{problem\}/g, `${keyword} problems`));
  const now = Date.now();
  const base = { channel: "seo" as Channel, status: "draft" as const, requiresSpendApproval: false, updatedAt: now };
  const monthly = budgetFor(product, strategy, "seo");

  return [
    {
      ...base,
      id: nextId("seo"),
      group: "SEO 关键词",
      title: "关键词簇：Transactional / Problem-aware / Comparison",
      subtitle: "只保留高意图词，不做泛流量",
      hypothesis: "高意图词的转化价值远高于泛流量，前 30 天不需要规模。",
      successSignal: "产品页与对比页在 8 周内进入目标词前 20。",
      failSignal: "8 周后仍无任何词进入前 50，说明该词竞争强度被低估。",
      budgetNote: `本月该渠道预算 $${monthly}（主要是内容制作时间成本）`,
      fields: [
        { key: "transactional", label: "Transactional（现在就想买）", type: "list", editable: false, value: fill(seeds.transactional) },
        { key: "problem", label: "Problem-aware（有问题还没想到方案）", type: "list", editable: false, value: fill(seeds.problemAware) },
        { key: "comparison", label: "Comparison（正在比价）", type: "list", editable: false, value: fill(seeds.comparison) },
        {
          key: "caveat",
          label: "证据说明",
          type: "multiline",
          editable: false,
          value:
            "以上关键词为基于品类的推断，未接入任何搜索量数据源。上线前请用 Google Search Console 或关键词工具核实真实搜索量与竞争度。",
        },
      ],
    },
    {
      ...base,
      id: nextId("seo"),
      group: "SEO 页面",
      title: "产品页 Title 与 Meta Description",
      subtitle: "第一优先级，先于任何博客文章",
      hypothesis: "产品页本身就是最高意图的落地页，优先级高于内容营销。",
      successSignal: "产品页自然点击率 ≥ 2%，跳出率低于同站平均。",
      failSignal: "产品页无法在品牌词上排第一，说明索引或结构有问题。",
      fields: [
        {
          key: "title",
          label: "Page Title（可编辑，≤ 60 字符）",
          type: "text",
          editable: true,
          value: `${product.name} — Leak-Tested Travel Set`.slice(0, 60),
        },
        {
          key: "metaDescription",
          label: "Meta Description（可编辑，≤ 155 字符）",
          type: "multiline",
          editable: true,
          value: `Upside down, squeezed, shaken — still dry. A ${product.sellingPoints.length}-piece set built to keep your bag clean. $${product.price}, free US returns.`.slice(0, 155),
        },
        {
          key: "onPage",
          label: "页面必备模块",
          type: "list",
          editable: false,
          value: [
            "首屏：一张演示图 + 一句结果型承诺，不放参数表",
            "第二屏：与便宜替代方案的对比表",
            `第三屏：${product.reviewCount} 条评论中的真实引用（需搬运并注明来源平台）`,
            "第四屏：退换货与配送时效（美国买家的主要下单阻力）",
            "FAQ Schema：覆盖尺寸、合规、清洗、退货四类问题",
          ],
        },
      ],
    },
    {
      ...base,
      id: nextId("seo"),
      group: "SEO 页面",
      title: "对比页 Brief",
      subtitle: "承接比价流量，优先级仅次于产品页",
      hypothesis: "比价阶段的人最容易被差异化演示说服。",
      successSignal: "对比页进入目标对比词前 20，且到产品页的点击率 ≥ 15%。",
      failSignal: "对比页有排名但跳出率 > 80%，说明对比维度选错了。",
      fields: [
        { key: "target", label: "目标关键词", type: "text", editable: true, value: fill(seeds.comparison)[0] ?? `${keyword} comparison` },
        {
          key: "outline",
          label: "内容结构",
          type: "list",
          editable: false,
          value: [
            "H1：直接回答对比问题，不绕圈",
            "对比表：价格 / 关键差异 / 失败场景 / 使用寿命",
            "一段实测记录（照片 + 条件说明），这是本页唯一的护城河",
            "明确写出「什么情况下你不需要买我们的」——诚实会提高转化",
            "结尾 CTA 指向产品页",
          ],
        },
        { key: "wordCount", label: "篇幅建议", type: "text", editable: false, value: "900-1300 词，重点在表格和实测图，不堆字数" },
      ],
    },
    {
      ...base,
      id: nextId("seo"),
      group: "SEO 内容",
      title: "支持型文章 Brief ×2",
      subtitle: "只写能被产品页接住的问题型内容",
      hypothesis: "problem-aware 流量可以通过内链导向产品页。",
      successSignal: "两篇文章合计带来 ≥ 100 次自然访问，且内链点击率 ≥ 8%。",
      failSignal: "有流量但没有任何人进入产品页，说明选题与产品无关。",
      fields: [
        {
          key: "articleA",
          label: `文章 A：${fill(seeds.problemAware)[0] ?? "问题型选题 A"}`,
          type: "multiline",
          editable: true,
          value:
            "结构：先描述问题发生的具体场景 → 解释成因（物理/使用习惯）→ 给出三种解决方案（其中一种是本产品）→ 结尾内链到对比页。必须先给出不花钱的解决办法，否则读者会立刻识别为软文。",
        },
        {
          key: "articleB",
          label: `文章 B：${fill(seeds.problemAware)[1] ?? "问题型选题 B"}`,
          type: "multiline",
          editable: true,
          value:
            "结构：清单式，按使用场景分组 → 每组给出判断标准 → 在最相关的一组自然引入本产品 → 内链到产品页。控制在 800 词以内。",
        },
      ],
    },
    {
      ...base,
      id: nextId("seo"),
      group: "SEO 内容",
      title: "内链方案与「现在不值得写」清单",
      subtitle: "本轮明确不做的事情",
      hypothesis: "限制内容数量比增加内容数量更能加快验证速度。",
      successSignal: "本轮 SEO 产出不超过 4 个页面，且每个页面都有明确的意图归属。",
      failSignal: "开始批量产出没有内链归属的文章。",
      fields: [
        {
          key: "internalLinks",
          label: "Internal Link 建议",
          type: "list",
          editable: false,
          value: [
            "文章 A / B → 对比页（锚文本用问题词，不用品牌词）",
            "对比页 → 产品页（锚文本包含具体差异，如 leak-tested set）",
            "产品页 → FAQ / 退换货页（降低下单阻力）",
            "首页 → 对比页（把比价流量当作主要入口之一）",
          ],
        },
        {
          key: "notNow",
          label: "现在不值得写",
          type: "list",
          editable: false,
          value: [
            ...fill(seeds.notWorthWriting),
            "任何没有明确搜索意图归属的品牌故事页",
            "30 篇泛化博客：在验证之前，内容数量只会稀释你的判断",
          ],
        },
      ],
    },
  ];
}

export function generateAssets(product: Product, strategy: Strategy): CampaignAsset[] {
  assetSeq = 0;
  const byChannel: Record<Channel, CampaignAsset[]> = {
    tiktok: tiktokAssets(product, strategy),
    meta: metaAssets(product, strategy),
    seo: seoAssets(product, strategy),
  };
  // 按渠道角色排序：主渠道的资产排在前面
  return strategy.allocations.flatMap((a) => byChannel[a.channel]);
}

/* ------------------------------------------------------------------ */
/* Step 6 30 天实验日历                                                 */
/* ------------------------------------------------------------------ */

export function buildCalendar(
  product: Product,
  strategy: Strategy,
  assets: CampaignAsset[],
): CalendarTask[] {
  const tt = assets.filter((a) => a.channel === "tiktok");
  const metaProspecting = assets.find((a) => a.title.includes("Prospecting"));
  const metaRetargeting = assets.find((a) => a.title.includes("Retargeting"));
  const metaCopy = assets.find((a) => a.group === "Meta 文案");
  const seoProduct = assets.find((a) => a.title.includes("产品页 Title"));
  const seoCompare = assets.find((a) => a.title.includes("对比页"));
  const seoArticles = assets.find((a) => a.title.includes("支持型文章"));
  const metaMonthly = budgetFor(product, strategy, "meta");
  const tiktokMonthly = budgetFor(product, strategy, "tiktok");

  const tasks: CalendarTask[] = [
    {
      id: "w1-site",
      week: 1,
      title:
        product.shopifyStatus === "live"
          ? "检查产品页信任元素：退换货、配送时效、评论搬运"
          : "上线产品页最小可用版本（含退换货与配送说明）",
      owner: "卖家本人",
      channel: "ops",
      budget: 0,
      successMetric: "产品页可访问，退换货与配送信息在首屏两次点击内可见",
      baseStatus: "planned",
    },
    {
      id: "w1-seo-product",
      week: 1,
      title: "上线产品页 Title / Meta Description 与 FAQ 模块",
      owner: "卖家本人",
      channel: "seo",
      budget: 0,
      successMetric: "品牌词可被索引，FAQ Schema 校验通过",
      assetId: seoProduct?.id,
      baseStatus: "planned",
    },
    ...tt.map((a, i) => ({
      id: `w1-tt-${i}`,
      week: 1 as const,
      title: `拍摄并发布 ${a.title.split("｜")[0].trim()}`,
      owner: "内容负责人",
      channel: "tiktok" as const,
      budget: Math.round(tiktokMonthly / 3),
      successMetric: a.successSignal,
      assetId: a.id,
      baseStatus: "planned" as const,
    })),
    {
      id: "w2-pick",
      week: 2,
      title: "对比三条创意数据，选出胜出 Hook（只选一个）",
      owner: "卖家本人",
      channel: "tiktok",
      budget: 0,
      successMetric: "有一条 3 秒完播率明显高于其余两条（差距 ≥ 8 个百分点）",
      baseStatus: "planned",
    },
    {
      id: "w2-meta-copy",
      week: 2,
      title: "把胜出角度改写成 Meta 文案与素材",
      owner: "内容负责人",
      channel: "meta",
      budget: 0,
      successMetric: "3 条 Primary Text 均来自已验证角度，而不是新编的卖点",
      assetId: metaCopy?.id,
      baseStatus: "planned",
    },
    {
      id: "w2-meta-launch",
      week: 2,
      title: "启动 Meta Prospecting 小额测试（需要单独批准花费）",
      owner: "卖家本人",
      channel: "meta",
      budget: Math.round(metaMonthly * 0.6),
      successMetric: metaProspecting?.successSignal ?? "CPC ≤ $1.2",
      assetId: metaProspecting?.id,
      baseStatus: "blocked",
    },
    {
      id: "w3-retarget",
      week: 3,
      title: "开启 Retargeting（前置条件：Landing Page View ≥ 1000）",
      owner: "卖家本人",
      channel: "meta",
      budget: Math.round(metaMonthly * 0.4),
      successMetric: metaRetargeting?.successSignal ?? "Retargeting CPA 低于单件毛利",
      assetId: metaRetargeting?.id,
      baseStatus: "blocked",
    },
    {
      id: "w3-pdp",
      week: 3,
      title: "根据前两周的评论与跳出数据迭代产品页",
      owner: "卖家本人",
      channel: "ops",
      budget: 0,
      successMetric: "至少修改一处价格表达或信任证明，并记录修改前后的 Add to Cart 率",
      baseStatus: "planned",
    },
    {
      id: "w3-seo-compare",
      week: 3,
      title: "上线对比页",
      owner: "内容负责人",
      channel: "seo",
      budget: 0,
      successMetric: "对比页上线并从首页与文章内链指向",
      assetId: seoCompare?.id,
      baseStatus: "planned",
    },
    {
      id: "w4-articles",
      week: 4,
      title: "发布两篇支持型文章并完成内链",
      owner: "内容负责人",
      channel: "seo",
      budget: 0,
      successMetric: "两篇文章均有指向对比页或产品页的内链",
      assetId: seoArticles?.id,
      baseStatus: "planned",
    },
    {
      id: "w4-review",
      week: 4,
      title: "复盘：写下哪个假设成立、哪个被证伪，决定 Scale / Iterate / Stop",
      owner: "卖家本人",
      channel: "ops",
      budget: 0,
      successMetric: "每个渠道都有一条明确结论，而不是「再看看」",
      baseStatus: "planned",
    },
  ];

  return tasks;
}

/* ------------------------------------------------------------------ */
/* Step 8 模拟学习闭环                                                  */
/* ------------------------------------------------------------------ */

export function buildLearningReport(scenario: ScenarioKey, product: Product): LearningReport {
  const profit = unitProfit(product);

  if (scenario === "A") {
    return {
      scenario: "A",
      title: "Scenario A：TikTok Hook 胜出，但转化卡在产品页",
      narrative:
        "演示型创意（创意 B）的 3 秒完播率明显高于其他两条，说明「问题表达」这个假设成立。但点击进站后 Add to Cart 偏低，问题从内容转移到了产品页的信任与价格表达。",
      metrics: [
        { label: "创意 B 3 秒完播率", value: "38%", delta: "高于其他两条 14 个百分点", tone: "good" },
        { label: "落地页点击率", value: "2.4%", delta: "达到预期区间", tone: "good" },
        { label: "Add to Cart 率", value: "1.1%", delta: "低于 3% 的目标线", tone: "bad" },
        { label: "Meta CPC", value: "$0.94", delta: "低于 $1.2 上限", tone: "good" },
        { label: "模拟 CPA", value: `$${money(profit * 1.4)}`, delta: `高于单件毛利 $${profit}`, tone: "bad" },
      ],
      hypotheses: [
        {
          hypothesis: "美国买家会因为「怕出事」而停下来看完演示。",
          verdict: "supported",
          evidence: "创意 B 的完播率与评论中的追问都指向演示可信度被接受。",
        },
        {
          hypothesis: `买家愿意在独立站以 $${product.price} 下单。`,
          verdict: "rejected",
          evidence: "点击充足但 Add to Cart 偏低，价格与信任证据没有在产品页被解决。",
        },
        {
          hypothesis: "Retargeting 可以补足首轮转化。",
          verdict: "inconclusive",
          evidence: "受众规模尚未达到 1000 人，样本不足以判断。",
        },
      ],
      decision: "iterate",
      decisionReason:
        "内容侧的假设已经被验证，继续加预算只会把更多流量倒进一个转化不成立的页面。应该保留胜出 Hook，先修产品页。",
      nextActions: [
        "保留创意 B 的 Hook，只重拍结尾 5 秒，把价格表达从「$34 六件套」改成「一次买齐，不用再补买」。",
        "在产品页首屏加入演示视频与实测图，把 TikTok 的信任证据搬到站内。",
        `补充退换货承诺与配送时效，这是 Add to Cart 到 Checkout 之间最大的阻力。`,
        "Prospecting 预算维持不变，等产品页改完后再对比 Add to Cart 率。",
      ],
      doNotDo: [
        "不要在这个阶段增加 Meta 日预算。",
        "不要因为一条创意跑得好就批量生产同类内容。",
        "不要用 Retargeting 的数据来证明整体获客效率。",
      ],
    };
  }

  return {
    scenario: "B",
    title: "Scenario B：有播放没点击，产品差异尚未被识别",
    narrative:
      "三条创意都拿到了播放，但点击率持续偏低，评论集中在「这和普通的有什么不同」。这不是内容分发问题，而是差异化本身没有被证明。",
    metrics: [
      { label: "三条创意平均播放", value: "12,400", delta: "分发正常", tone: "neutral" },
      { label: "平均点击率", value: "0.4%", delta: "远低于 1% 的目标线", tone: "bad" },
      { label: "评论中「有什么不同」类提问占比", value: "34%", delta: "最高频的一类评论", tone: "bad" },
      { label: "Add to Cart", value: "3 次", delta: "样本不足以判断转化", tone: "bad" },
      { label: "模拟 CPA", value: "无法计算", delta: "转化样本太少", tone: "neutral" },
    ],
    hypotheses: [
      {
        hypothesis: "美国买家能在 3 秒内看出这个产品和便宜替代品的差别。",
        verdict: "rejected",
        evidence: "评论中最高频的提问就是「与普通款有什么不同」，说明差异没有被传达。",
      },
      {
        hypothesis: "问题表达足够扎心，可以驱动点击。",
        verdict: "rejected",
        evidence: "三个不同角度的创意点击率没有显著差异，说明问题不在角度选择上。",
      },
      {
        hypothesis: "内容分发能力不足是主要瓶颈。",
        verdict: "rejected",
        evidence: "播放量正常，瓶颈在从看到点这一步。",
      },
    ],
    decision: "stop",
    decisionReason:
      "在差异化没有被证明之前继续加预算或批量生成内容，只会用更多花费重复同一个失败。应该暂停投放，先解决「差异如何被看见」。",
    nextActions: [
      "拍一条只有一个目的的对照视频：同一场景，普通替代品 vs 本产品，一次拍完不剪辑。",
      "把评论里「有什么不同」的原话整理成 10 条，逐条在产品页回答。",
      "如果对照视频仍然拿不到点击，说明这个差异对美国买家不构成购买理由，应重新考虑定价或产品组合。",
      "本轮不再新增创意数量，只做这一条对照实验。",
    ],
    doNotDo: [
      "不要加 Meta 预算。",
      "不要批量生成 SEO 文章来「先积累内容」。",
      "不要把播放量当作产品被接受的证据。",
    ],
  };
}
