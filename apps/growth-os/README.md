# US Market Growth OS · V1

面向已经在 Amazon / TikTok Shop 出单、准备做 Shopify 独立站的中国跨境卖家的美国市场增长操作系统。

V1 使用 seed demo data 与**确定性 mock engine**：不调用任何 AI API，不抓取 Amazon，不接 Shopify / Meta / TikTok API。
所有市场数据仅用于演示决策逻辑，不构成真实市场研究。

需求文档见 [`docs/spec-us-market-growth-os-v1.md`](./docs/spec-us-market-growth-os-v1.md)。

## 本地启动

```bash
cd apps/growth-os
npm install
npm run dev          # http://localhost:3000
```

生产构建：

```bash
npm run build
npm run start        # 默认 3000，可用 PORT=3100 npm run start
```

## 测试 Demo 的准确路径

1. 打开 `http://localhost:3000/` → 点击 **使用 Demo 商品**（或先去 `/intake` 点 **Use Demo Product** 再提交）。
2. `/diagnosis`：看五项 Market Readiness 检查（Demo 商品 = `Ready to Test`）→ 点 **Run Diagnosis**。
3. `/strategy`：查看三渠道评分（Demo 默认 TikTok 70% / Meta Ads 20% / SEO 10%）→ 拖动滑块试一下 100% 校验 → 点 **Generate Campaign**。
4. `/studio`：切 TikTok / Meta Ads / SEO 三个 tab → 编辑一条 TikTok Hook 和一条 Meta Primary Text → Approve / Request Changes / Pause。
5. `/calendar`：确认资产状态已同步到 30 天日历。
6. `/approvals`：按状态分组查看；批准涉及花费的 Campaign 时会有单独二次确认。
7. `/report`：切换 Scenario A / B，看两个不同的决策（Iterate vs Stop）。
8. 刷新浏览器：商品、编辑内容与审批状态仍然保留（localStorage）。
9. 侧边栏 **重新开始一次诊断** 可以清空状态从头再来。

## 已实现

- **Step 1 导入商品**：Amazon / TikTok Shop 链接（仅记录来源，不抓取）、手动输入、Demo 商品一键填充；完整商品表单 + 两个可选渠道信号。
- **Step 2 市场准备度**：毛利空间、销量证据、评论与信任、差异可展示性、独立站基础五项检查，输出 `Ready to Test` / `Test with Caution` / `Not Ready` 与风险说明。
- **Step 3 美国市场诊断**：主/次 Persona（触发场景、焦虑、替代方案、不购买原因）、购买路径、工厂语言 → 消费者语言对照表、竞品假设、待验证问题；每条洞察带 `事实 / 推断 / 待验证` 标签。
- **Step 4 渠道路由**：SEO / Meta Ads / TikTok 各自 0–100 适合度评分（四舍五入到 5 分刻度，避免假装精确），每一分都有可展开的加减分明细；主 / 辅助 / 暂缓角色、预算比例、失效条件（哪个假设被证伪就该换渠道）；预算可调，实时校验合计 = 100%。
- **Step 5 执行资产**：TikTok 三个不同角度创意（Problem / Demonstration / Transformation，各含 Hook、脚本、Shot List、字幕、CTA、假设与成败指标）；Meta Prospecting + Retargeting 草案、3 条 Primary Text、3 条 Headline、2 个 Visual Brief、受众假设、日预算、7 天停止规则；SEO 三类关键词簇、产品页 Title/Meta Description、对比页 Brief、两篇支持型文章 Brief、内链方案与「现在不值得写」清单。
- **Step 6 30 天实验日历**：按周展示，含负责人、渠道、状态、预算、成功指标；状态与审批实时同步。
- **Step 7 审批中心**：Approve / Request Changes（可写具体意见）/ Pause / 退回草稿；涉及广告花费的动作单独二次确认，系统不会自动加预算或自动投放。
- **Step 8 模拟学习闭环**：Scenario A（TikTok Hook 胜出，转化卡在产品页）与 Scenario B（有播放没点击，差异未被识别）产出不同的假设结论与 `Scale / Iterate / Stop` 决策，附证据与下一步动作。
- 8 个页面（Dashboard / Intake / Diagnosis / Strategy / Studio / Calendar / Approvals / Report）、localStorage 持久化、桌面优先且手机端可完成核心流程。
- 不同商品会得到不同的渠道组合：Demo 商品 → TikTok 70 / Meta 20 / SEO 10；一个「高客单价、差异难演示、有搜索需求」的商品 → SEO 50 / Meta 30 / TikTok 20。

## 尚未实现（V1 明确不做）

- 真实 Amazon / TikTok Shop 链接抓取，真实竞品与搜索量数据。
- Shopify OAuth、Meta Marketing API、TikTok API、自动创建 Campaign、自动发布内容。
- 登录注册、数据库、多租户、团队协作与复杂权限、Stripe。
- 真实 Performance 数据接入（当前只有两个 seed 场景）、自动预算优化、多语言 Creative。
- 图片上传（商品图用一个占位符号代替）。

## 技术栈

Next.js 16（App Router）· TypeScript · Tailwind CSS v4 · Zustand（persist → localStorage）· lucide-react。
Mock engine 是纯 TypeScript 确定性函数：`src/lib/mock-engine.ts`，同样的输入必然得到同样的输出。

```
src/
  app/{page,intake,diagnosis,strategy,studio,calendar,approvals,report}
  components/{app-shell,asset-card,channel-allocation,evidence-tag,metric-card,status-badge,ui}
  lib/{types,demo-data,mock-engine,store}
```

## 校验结果

- `npx tsc --noEmit`：通过，无错误。
- `npm run lint`：通过，无 error / warning。
- `npm run build`：成功，9 个路由全部静态预渲染。
- Happy path 浏览器点击验证：21 步全部通过，控制台无报错。

### Happy path 验证记录

| # | 验证项 | 结果 |
|---|---|---|
| 1 | Dashboard 空状态渲染 | 通过 |
| 2 | 点击 `Use Demo Product` 自动填入完整 Demo 数据 | 通过 |
| 3 | 提交商品后进入 Market Readiness（Demo = Ready to Test） | 通过 |
| 4 | `Run Diagnosis` 显示 loading 状态 | 通过 |
| 5 | 诊断结果含 Persona / 购买路径 / 信息翻译 / 证据标签 | 通过 |
| 6 | 渠道路由三档权重 = TikTok 70% / Meta 20% / SEO 10% | 通过 |
| 7 | 预算合计 ≠ 100% 时实时校验并禁用保存 | 通过 |
| 8 | 恢复系统建议后合计回到 100% | 通过 |
| 9 | `Generate Campaign` 生成 TikTok 3 / Meta 4 / SEO 5 张资产卡 | 通过 |
| 10 | 编辑 TikTok Hook 并保存 | 通过 |
| 11 | 编辑 Meta Primary Text 并保存 | 通过 |
| 12 | 批准涉及广告花费的 Campaign 时弹出单独确认 | 通过 |
| 13 | Request Changes 记录修改意见 | 通过 |
| 14 | Pause SEO 资产 | 通过 |
| 15 | 资产状态同步到 30 天实验日历 | 通过 |
| 16 | 审批中心分组过滤 | 通过 |
| 17 | Scenario A / B 产生不同决策（Iterate / Stop） | 通过 |
| 18 | 刷新后商品、编辑内容与审批状态保留 | 通过 |
| 19 | 手机端（390×844）可完成导航与核心页面浏览 | 通过 |
| 20 | 可以从头重新开始一次诊断 | 通过 |
| 21 | 换一个商品得到不同渠道组合（SEO 50 / Meta 30 / TikTok 20） | 通过 |
