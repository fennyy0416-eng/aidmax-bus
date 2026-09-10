---
date: 2026-08-29
topic: us-market-growth-os-v1
status: ready-for-implementation
---

# 美国市场增长操作系统 V1

## 给 Claude Code 的任务

请根据本文档构建一个可以在本地运行、可以完整点击测试的 Web App V1。

V1 不是静态 landing page，也不是只有聊天框的 AI Demo。用户必须能够从「导入商品」开始，完成一次产品诊断，看到渠道选择依据，生成 SEO、Meta Ads、TikTok 三类执行资产，并在结果页决定批准、修改或暂停。

第一版使用 seed demo data 和 mock AI engine，不接真实平台 API。所有界面文案默认使用简体中文，保留 `SEO`、`Meta Ads`、`TikTok`、`Shopify`、`CTR`、`CPC`、`ROAS` 等标准英文术语。

## 一句话定位

面向已经在 Amazon 或 TikTok Shop 出单、准备建立 Shopify 独立站的中国跨境卖家，帮助他们理解美国消费者，选择正确的推广渠道，并把策略转化为可以执行和迭代的营销实验。

## 核心原则

这不是「一键生成所有营销内容」的软件。

产品必须遵循以下顺序：

```text
导入产品
→ 判断是否值得推广
→ 诊断美国市场与购买路径
→ 决定主渠道和辅助渠道
→ 生成各渠道实验
→ 用户批准
→ 模拟执行结果
→ 给出继续、修改或停止建议
```

不同产品必须得到不同的渠道组合。系统不能默认让所有产品同时平均投入 SEO、Meta Ads 和 TikTok。

## 目标用户

### V1 首要用户

- 中国跨境卖家
- 已经在 Amazon 或 TikTok Shop 有至少一个产生过订单的 SKU
- 正在建立或已经拥有 Shopify 独立站
- 不熟悉美国消费者的购买动机、内容表达和渠道选择
- 害怕长期受制于平台流量、费用、规则和客户数据限制
- 愿意投入小额预算验证独立站获客，但不知道先做什么

### 暂不服务

- 完全没有产品、没有供应链的新手
- 希望软件替代选品、物流、库存和客服的卖家
- 大型品牌的复杂跨国营销团队
- 只需要批量生成低质量 SEO 文章或视频的人

## 用户要解决的核心问题

1. 这个产品在美国是否存在可验证的需求？
2. 谁最可能购买，购买场景是什么？
3. 卖家现在使用的是工厂语言，还是消费者语言？
4. 应该优先做 SEO、Meta Ads 还是 TikTok？
5. 每个渠道第一轮具体测试什么？
6. 哪些信号代表继续投入，哪些信号代表应该停止？

## 产品边界

### V1 能解决

- 产品与市场信息结构化
- 美国消费者 Persona 与购买场景假设
- 竞品和差异化展示（V1 使用 mock 数据）
- 渠道优先级与预算分配建议
- SEO 页面/关键词计划
- Meta Ads 测试计划及广告素材草稿
- TikTok Hook、脚本和 Shot List
- 30 天实验日历
- 模拟结果分析与下一步决策

### V1 不能解决

- 证明真实市场需求
- 保证广告盈利或内容爆量
- 自动修复产品质量、价格、毛利、物流、库存和客服问题
- 自动创建真实 Meta Campaign
- 自动发布 TikTok 视频
- 自动发布 Shopify 页面
- 抓取受限平台数据或绕过平台政策

界面必须明确区分：`事实`、`推断`、`待验证假设`。

## V1 核心闭环

### Step 1：导入商品

用户可以选择：

- 粘贴 Amazon 商品链接
- 粘贴 TikTok Shop 商品链接
- 手动输入
- 使用 Demo 商品

V1 不需要真实抓取链接。粘贴链接后允许用户确认或补充以下字段：

- 商品名称
- 商品类别
- 售价
- 单件落地成本
- 当前销售平台
- 月订单区间
- Review 数量与评分
- 三个当前卖点
- 商品图片
- Shopify 是否已上线
- 每月可测试预算

预置 Demo 商品：`NomadLeak Magnetic Travel Containers`，一套适合旅行携带护肤品的磁吸防漏分装瓶。

### Step 2：市场准备度检查

系统先判断是否适合进入推广阶段，不要直接生成内容。

显示五项检查：

- 毛利空间
- 现有销量证据
- 评论与信任证据
- 产品差异是否可展示
- 独立站基础是否具备

输出状态：

- `Ready to Test`
- `Test with Caution`
- `Not Ready`

如果为 `Not Ready`，仍可继续 Demo，但必须显示风险原因。例如：毛利不足以支持 Meta Ads、商品优势无法在视频中展示、独立站缺少退换货与信任元素。

### Step 3：美国市场诊断

结果页必须包含：

#### 美国消费者 Persona

- 主要 Persona
- 次要 Persona
- 购买触发场景
- 主要焦虑
- 当前替代方案
- 不购买的原因

#### 信息翻译

用左右对比呈现：

| 中国卖家常用表达 | 美国消费者表达 |
|---|---|
| 食品级硅胶、六件套 | Stop lotion explosions inside your carry-on |
| 多功能磁吸设计 | Your entire routine snaps into one compact stack |

#### 证据边界

每条洞察标记：

- `Observed`：来自用户输入或已有销售数据
- `Inferred`：系统根据类别推断
- `Test Required`：需要广告或内容实验验证

### Step 4：渠道路由

系统给 SEO、Meta Ads、TikTok 分配 0–100 的适合度评分，但不能用虚假的科学精度。评分必须配原因。

Demo 商品的默认建议：

- TikTok：70%，主获客和创意测试
- Meta Ads：20%，Retargeting 和胜出素材放大
- SEO：10%，先完成产品页与少量高意图页面

显示：

- 主渠道
- 辅助渠道
- 暂缓渠道
- 建议预算比例
- 为什么
- 哪个假设一旦被证伪就需要换渠道

用户可以调整预算比例，但合计必须为 100%。

### Step 5：生成执行资产

#### TikTok 模块

至少生成三个不同 Hook，而不是同一脚本改写：

1. Problem-first：行李箱中的乳液泄漏
2. Demonstration-first：倒置、挤压、防漏演示
3. Transformation-first：凌乱化妆包变成磁吸旅行套装

每个创意包含：

- 前 3 秒 Hook
- 20–30 秒完整脚本
- Shot List
- 屏幕字幕
- CTA
- 该创意要验证的假设
- 成功/失败判断指标

#### Meta Ads 模块

至少包含：

- Prospecting Campaign 草案
- Retargeting Campaign 草案
- 3 个 Primary Text
- 3 个 Headline
- 2 个 Visual Brief
- 受众假设
- 日预算
- 7 天停止规则

不得承诺 ROAS。指标使用可编辑的实验阈值。

#### SEO 模块

至少包含：

- 关键词簇：Transactional / Problem-aware / Comparison
- 一个产品页 Title 与 Meta Description
- 一个对比页 Brief
- 两篇支持型文章 Brief
- Internal Link 建议
- 哪些内容现在不值得写

不要生成 30 篇泛化博客。V1 强调高意图和少量验证。

### Step 6：30 天实验日历

按周展示：

- Week 1：基础页面与三个 TikTok 创意
- Week 2：选择胜出 Hook，启动小额 Meta 测试
- Week 3：Retargeting 与产品页迭代
- Week 4：复盘，决定 Scale / Iterate / Stop

每项任务包含：负责人、渠道、状态、预算、成功指标。

### Step 7：审批中心

V1 的权限原则：

- AI 可以生成内容与建议
- 用户必须批准所有发布动作
- 任何涉及广告花费的动作必须单独确认
- 默认不能自动增加预算

每张资产卡提供：

- `Approve`
- `Request Changes`
- `Pause`

点击后更新状态并显示在实验日历中。

### Step 8：模拟学习闭环

提供两个 seed 结果场景，用户可切换：

#### Scenario A：TikTok Hook 胜出

- 防漏演示的 3-second hold 明显更高
- 有点击但 Add to Cart 偏低
- 系统建议：保留 Hook，修改产品页信任证明与价格表达

#### Scenario B：产品尚未准备好

- 三种创意都有播放，点击率持续偏低
- 用户评论集中询问「与普通分装瓶有什么不同」
- 系统建议：暂停加预算，先加强差异化演示，不要继续批量生成内容

最终输出三个决策之一：

- `Scale`
- `Iterate`
- `Stop`

决策必须附带证据和下一步动作。

## 页面与导航

### 1. Dashboard

- 当前商品
- Market Readiness
- 主渠道
- 本月测试预算
- 待审批资产
- 当前实验
- 最新决策建议

### 2. Product Intake

- 链接/手动输入
- 完整商品表单
- Demo 商品入口

### 3. Market Diagnosis

- Persona
- 购买场景
- 信息翻译
- 竞品假设
- 事实/推断/待验证标签

### 4. Channel Strategy

- 三渠道评分
- 主次渠道解释
- 可调整预算分配
- 关键假设

### 5. Creative Studio

Tabs：

- TikTok
- Meta Ads
- SEO

每张卡可以查看、编辑和送审。

### 6. Experiment Calendar

- 30 天周视图
- 任务状态
- 预算和指标

### 7. Approval Center

- 待批准
- 已批准
- 要求修改
- 已暂停

### 8. Learning Report

- 模拟 Performance 数据
- 哪个假设成立/失败
- Scale / Iterate / Stop
- 下一轮建议

## 必须实现的交互

1. 点击 `Use Demo Product` 自动填入完整 Demo 数据。
2. 提交商品后进入 Market Readiness。
3. 点击 `Run Diagnosis` 后显示带 loading 状态的诊断结果。
4. 用户可以调整渠道预算，系统实时校验总和是否为 100%。
5. 点击 `Generate Campaign` 生成三个渠道的资产卡。
6. 用户可以编辑至少一条 TikTok Hook 和一条 Meta Ad 文案。
7. 用户可以 Approve、Request Changes 或 Pause 资产。
8. 资产状态同步到 30 天实验日历。
9. 用户可以切换两个模拟 Performance 场景。
10. Learning Report 根据场景显示不同的决策和理由。
11. 用户可以从头重新开始一次诊断。

## 数据模型建议

```ts
type EvidenceLevel = "observed" | "inferred" | "test_required";
type Channel = "seo" | "meta" | "tiktok";
type AssetStatus = "draft" | "pending" | "approved" | "changes_requested" | "paused";
type Decision = "scale" | "iterate" | "stop";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  landedCost: number;
  currentPlatform: string[];
  monthlyOrderRange: string;
  reviewCount: number;
  rating: number;
  sellingPoints: string[];
  shopifyStatus: "none" | "building" | "live";
  monthlyTestBudget: number;
}

interface ChannelAllocation {
  channel: Channel;
  score: number;
  budgetPercent: number;
  role: "primary" | "supporting" | "deferred";
  rationale: string[];
  invalidationCondition: string;
}

interface CampaignAsset {
  id: string;
  channel: Channel;
  title: string;
  hypothesis: string;
  content: Record<string, unknown>;
  status: AssetStatus;
}
```

## 视觉方向

避免做成通用的紫色 AI Dashboard。

设计关键词：

- 专业、清晰、像增长团队的工作台
- Warm white 背景
- Deep charcoal / ink 主色
- Sage green 表示已验证或健康状态
- Clay / amber 表示风险与待验证
- 卡片有足够留白，不堆满图表
- 使用线性图标，不使用 emoji 作为功能图标
- 数据图只用于帮助决策，不为装饰

桌面端优先，同时保证手机端可以完成核心流程。

## 技术实现边界

Claude Code 可以选择成熟、简单的前端栈。建议：

- Next.js
- TypeScript
- Tailwind CSS
- Zustand 或 React Context
- Lucide icons
- 数据保存在 localStorage
- mock engine 使用确定性 TypeScript 函数，不调用付费 AI API

如果当前目录已经存在项目，则遵循已有技术栈，不要无理由重建。

第一版不需要：

- 登录注册
- 数据库
- Stripe
- 真实 Amazon 抓取
- Shopify OAuth
- Meta Marketing API
- TikTok API
- 自动发布
- 多租户
- 复杂权限系统

## 建议文件结构

```text
app/
  page.tsx
  intake/page.tsx
  diagnosis/page.tsx
  strategy/page.tsx
  studio/page.tsx
  calendar/page.tsx
  approvals/page.tsx
  report/page.tsx
components/
  app-shell.tsx
  status-badge.tsx
  evidence-tag.tsx
  channel-allocation.tsx
  asset-card.tsx
  metric-card.tsx
lib/
  demo-data.ts
  mock-engine.ts
  types.ts
  store.ts
```

这只是建议，可根据框架版本合理调整。

## V1 验收标准

V1 只有同时满足以下条件才算完成：

- 可以本地启动，无运行时错误。
- 有完整 Demo 商品，不需要用户先准备数据。
- 用户可以从导入商品一路走到 Learning Report。
- 三个渠道得到不同权重与不同角色。
- TikTok、Meta、SEO 输出不是同一段文案的重复改写。
- 每项建议明确标记事实、推断或待验证假设。
- 广告花费和发布动作必须经过用户确认。
- 两个 Performance 场景产生不同的下一步决策。
- 浏览器刷新后，当前商品和审批状态仍然保留。
- 至少完成一次生产构建检查。
- 至少人工点击一次完整 happy path，并修复发现的问题。

## 不可接受的结果

- 只有 landing page，没有产品流程。
- 只有聊天输入框，没有结构化诊断。
- 默认建议三个渠道平均投入。
- 用无法解释的 87/100 等评分假装科学结论。
- 输出大量泛化博客标题，却没有实验优先级。
- 把 mock 数据描述成真实市场研究。
- 宣称能够保证销量、ROAS 或爆款。
- 未经批准自动花费广告预算。

## V1 成功标准

找 5 位符合目标画像的跨境卖家完成 Demo，不先解释功能，观察他们能否独立完成任务。

至少验证：

- 4/5 能独立走完核心流程。
- 3/5 认为渠道建议改变了自己原来的推广顺序。
- 3/5 愿意把自己的真实商品输入系统。
- 至少 2/5 愿意使用生成的一个实验投入真实小额预算。

这些是产品验证阈值，不是已经实现的市场结果。

## 后续版本候选项

只有完成卖家测试后再决定：

- Shopify 数据接入
- Meta Ads 草稿创建
- TikTok 内容发布
- Google Search Console
- 真实竞品研究
- 多语言 Creative
- 团队审批
- 自动预算优化

不要在 V1 提前实现这些功能。

## 开发交付要求

Claude Code 完成后必须提供：

1. 本地启动命令。
2. 测试 Demo 的准确路径。
3. 已实现功能清单。
4. 尚未实现功能清单。
5. build/lint/test 结果。
6. 完整 happy path 的手工验证记录。

