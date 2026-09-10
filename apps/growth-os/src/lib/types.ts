export type EvidenceLevel = "observed" | "inferred" | "test_required";

export type Channel = "seo" | "meta" | "tiktok";

export type AssetStatus =
  | "draft"
  | "pending"
  | "approved"
  | "changes_requested"
  | "paused";

export type Decision = "scale" | "iterate" | "stop";

export type ReadinessStatus = "ready" | "caution" | "not_ready";

export type CheckState = "pass" | "warn" | "fail";

export type Strength = "high" | "medium" | "low";

export type ScenarioKey = "A" | "B";

export interface Product {
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
  imageEmoji: string;
  imageAlt: string;
  shopifyStatus: "none" | "building" | "live";
  monthlyTestBudget: number;
  /** 可选信号：产品差异能否在 15 秒视频里演示出来 */
  visualDemo: Strength;
  /** 可选信号：美国消费者是否会主动搜索这个品类 */
  searchDemand: Strength;
  sourceUrl?: string;
  createdAt: number;
}

export interface ReadinessCheck {
  id: string;
  label: string;
  state: CheckState;
  headline: string;
  detail: string;
  evidence: EvidenceLevel;
}

export interface ReadinessReport {
  status: ReadinessStatus;
  summary: string;
  risks: string[];
  checks: ReadinessCheck[];
  grossMarginPercent: number;
  unitProfit: number;
}

export interface Insight {
  text: string;
  evidence: EvidenceLevel;
}

export interface Persona {
  name: string;
  role: "primary" | "secondary";
  snapshot: string;
  triggers: Insight[];
  anxieties: Insight[];
  alternatives: Insight[];
  objections: Insight[];
}

export interface TranslationPair {
  from: string;
  to: string;
  why: string;
}

export interface CompetitorHypothesis {
  name: string;
  positioning: string;
  priceBand: string;
  gap: string;
  evidence: EvidenceLevel;
}

export interface Diagnosis {
  generatedAt: number;
  demandSummary: Insight[];
  personas: Persona[];
  purchasePath: { stage: string; description: string; evidence: EvidenceLevel }[];
  translations: TranslationPair[];
  competitors: CompetitorHypothesis[];
  openQuestions: string[];
}

export interface ChannelAllocation {
  channel: Channel;
  score: number;
  budgetPercent: number;
  role: "primary" | "supporting" | "deferred";
  rationale: string[];
  scoreDrivers: { label: string; points: number; note: string }[];
  invalidationCondition: string;
  firstTest: string;
}

export interface Strategy {
  generatedAt: number;
  allocations: ChannelAllocation[];
  headline: string;
  sequencing: string[];
}

export type AssetFieldType = "text" | "multiline" | "list";

export interface AssetField {
  key: string;
  label: string;
  type: AssetFieldType;
  value: string | string[];
  editable: boolean;
  hint?: string;
}

export interface CampaignAsset {
  id: string;
  channel: Channel;
  group: string;
  title: string;
  subtitle: string;
  hypothesis: string;
  successSignal: string;
  failSignal: string;
  budgetNote?: string;
  requiresSpendApproval: boolean;
  fields: AssetField[];
  status: AssetStatus;
  changeNote?: string;
  updatedAt: number;
}

export interface CalendarTask {
  id: string;
  week: 1 | 2 | 3 | 4;
  title: string;
  owner: string;
  channel: Channel | "ops";
  budget: number;
  successMetric: string;
  assetId?: string;
  baseStatus: "planned" | "blocked";
}

export interface ScenarioMetric {
  label: string;
  value: string;
  delta: string;
  tone: "good" | "bad" | "neutral";
}

export interface HypothesisResult {
  hypothesis: string;
  verdict: "supported" | "rejected" | "inconclusive";
  evidence: string;
}

export interface LearningReport {
  scenario: ScenarioKey;
  title: string;
  narrative: string;
  metrics: ScenarioMetric[];
  hypotheses: HypothesisResult[];
  decision: Decision;
  decisionReason: string;
  nextActions: string[];
  doNotDo: string[];
}
