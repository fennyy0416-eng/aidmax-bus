import type { Product, Strength, TranslationPair } from "./types";

export const DEMO_PRODUCT: Product = {
  id: "demo-nomadleak",
  name: "NomadLeak Magnetic Travel Containers",
  category: "travel-accessories",
  price: 34,
  landedCost: 9.6,
  currentPlatform: ["Amazon", "TikTok Shop"],
  monthlyOrderRange: "300-600",
  reviewCount: 214,
  rating: 4.5,
  sellingPoints: [
    "食品级硅胶材质，六件套装",
    "多功能磁吸设计，可自由拼接",
    "TSA 合规容量，通过防漏测试",
  ],
  imageEmoji: "🧴",
  imageAlt: "一组可磁吸拼接的旅行分装瓶",
  shopifyStatus: "building",
  monthlyTestBudget: 1500,
  visualDemo: "high",
  searchDemand: "medium",
  createdAt: 0,
};

export const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "travel-accessories", label: "旅行配件 Travel Accessories" },
  { value: "beauty", label: "美妆个护 Beauty & Personal Care" },
  { value: "home", label: "家居收纳 Home & Organization" },
  { value: "kitchen", label: "厨房用具 Kitchen" },
  { value: "pet", label: "宠物用品 Pet Supplies" },
  { value: "fitness", label: "运动健身 Fitness" },
  { value: "baby", label: "母婴 Baby & Kids" },
  { value: "electronics", label: "消费电子配件 Electronics Accessories" },
  { value: "apparel", label: "服饰 Apparel" },
  { value: "other", label: "其他 Other" },
];

export interface CategoryProfile {
  label: string;
  /** 该品类在美国是否天然适合短视频演示 */
  visualDemo: Strength;
  /** 该品类是否有稳定的主动搜索需求 */
  searchDemand: Strength;
  primaryPersona: {
    name: string;
    snapshot: string;
    triggers: string[];
    anxieties: string[];
    alternatives: string[];
    objections: string[];
  };
  secondaryPersona: {
    name: string;
    snapshot: string;
    triggers: string[];
    anxieties: string[];
    alternatives: string[];
    objections: string[];
  };
  demandNotes: string[];
  purchasePath: { stage: string; description: string }[];
  competitorShape: { name: string; positioning: string; priceBand: string; gap: string }[];
  seoSeeds: {
    transactional: string[];
    problemAware: string[];
    comparison: string[];
    notWorthWriting: string[];
  };
  tiktokScenes: {
    problem: string;
    demo: string;
    transformation: string;
    setting: string;
  };
}

const GENERIC: CategoryProfile = {
  label: "通用消费品",
  visualDemo: "medium",
  searchDemand: "medium",
  primaryPersona: {
    name: "Practical Buyer（务实型美国消费者，30-45 岁）",
    snapshot:
      "在 Amazon 买过同类便宜货，用得不满意，愿意为「真的能解决问题」多付一点钱，但不接受讲不清楚差别的溢价。",
    triggers: [
      "上一次使用旧方案时踩了一个具体的坑",
      "在 TikTok / Reels 上刷到一条把问题演示出来的视频",
      "换季、搬家、送礼等有明确时间点的场景",
    ],
    anxieties: [
      "又是一个便宜的白牌，用两次就坏",
      "退货流程麻烦，钱要不回来",
      "买回来发现和家里已有的东西没差别",
    ],
    alternatives: [
      "Amazon 上 $10-15 的同类白牌",
      "先用家里现成的东西凑合",
      "Target / Walmart 线下随手买",
    ],
    objections: [
      "看不出为什么比 Amazon 上便宜一半的贵这么多",
      "没听过这个品牌，独立站不敢下单",
      "不确定尺寸/规格适不适合自己",
    ],
  },
  secondaryPersona: {
    name: "Gift Buyer（送礼型买家）",
    snapshot: "不是自己用，为家人朋友挑一个「看起来有心意、开箱好看」的实用礼物，价格敏感度更低。",
    triggers: ["生日、节日、乔迁、毕业等送礼节点", "看到成套/礼盒化的产品呈现"],
    anxieties: ["送出去对方用不上", "包装看起来廉价"],
    alternatives: ["礼品卡", "Amazon 上的礼盒套装"],
    objections: ["不确定收礼人是否已经有类似的", "配送来不及"],
  },
  demandNotes: [
    "该品类在美国属于「已存在需求」，竞争点不是有没有人要，而是能不能说清差异。",
    "首轮验证的重点是「问题表达」是否能被识别，而不是产品参数是否领先。",
  ],
  purchasePath: [
    { stage: "触发", description: "遇到具体问题，或刷到把问题演示出来的内容" },
    { stage: "对比", description: "去 Amazon / Google 比价，看评论找踩坑证据" },
    { stage: "信任", description: "在独立站找退换货政策、真实评价、发货时效" },
    { stage: "下单", description: "价格锚点清晰、风险被消除后完成购买" },
  ],
  competitorShape: [
    {
      name: "Amazon 白牌集群",
      positioning: "低价、参数堆砌、无品牌记忆",
      priceBand: "$9 - $18",
      gap: "没有人负责解释「为什么便宜的那个会让你出问题」",
    },
    {
      name: "美国本土 DTC 品牌",
      positioning: "生活方式叙事、包装与摄影强",
      priceBand: "$38 - $65",
      gap: "价格偏高，功能演示反而弱",
    },
  ],
  seoSeeds: {
    transactional: ["best {keyword} 2026", "buy {keyword} online", "{keyword} set"],
    problemAware: ["how to stop {problem}", "why does {problem} happen", "{problem} fix"],
    comparison: ["{brand} vs amazon {keyword}", "are expensive {keyword} worth it"],
    notWorthWriting: [
      "「{keyword} 的 10 个小知识」这类没有购买意图的泛化博客",
      "行业趋势 / 市场规模类文章，带不来第一批订单",
    ],
  },
  tiktokScenes: {
    problem: "用户用旧方案踩坑的真实瞬间",
    demo: "把产品放在最极端的使用条件下做一次实拍验证",
    transformation: "从混乱状态到整理好状态的前后对比",
    setting: "家里真实场景，手机竖屏实拍，不要影棚感",
  },
};

const TRAVEL: CategoryProfile = {
  ...GENERIC,
  label: "旅行配件",
  visualDemo: "high",
  searchDemand: "medium",
  primaryPersona: {
    name: "Frequent Flyer Maya（28-40 岁，美国城市白领，每年飞 6 次以上）",
    snapshot:
      "每次出差前一晚才收拾行李，随身行李里装满护肤品，被 TSA 3-1-1 规则和漏液问题反复折磨。刷 TikTok，认 packing hacks 类内容。",
    triggers: [
      "上一次出差乳液在行李箱里爆开，弄脏了衣服",
      "刷到 packing / travel hack 视频，看到一个更整齐的方案",
      "下一次旅行日期已经定了，出发前 1-2 周集中采购",
    ],
    anxieties: [
      "分装瓶漏液，毁掉行李箱里的衣服和电子设备",
      "过安检时被要求丢弃，白买",
      "瓶子太小不够用，或者太大不合规",
    ],
    alternatives: [
      "Amazon 上 $8-12 的普通硅胶分装瓶",
      "酒店的小样和试用装",
      "Muji / Target 单独买的空瓶",
    ],
    objections: [
      "$34 买几个塑料瓶太贵了，Amazon 上 $10 就有",
      "磁吸听起来像噱头，不知道实际有什么用",
      "没听过这个牌子，怕质量和图片不符",
    ],
  },
  secondaryPersona: {
    name: "Gift & Bundle Buyer（为伴侣/朋友买旅行礼物的人）",
    snapshot: "找一个 $30-50 价位、开箱好看、实用性强的旅行礼物，看重成套感和包装。",
    triggers: ["节日、蜜月、毕业旅行", "看到成套磁吸拼接的开箱画面"],
    anxieties: ["送出去对方已经有了", "看起来像廉价赠品"],
    alternatives: ["旅行洗漱包", "Amazon 礼盒套装"],
    objections: ["不确定对方用不用护肤品", "包装照片看不清"],
  },
  demandNotes: [
    "美国旅行分装瓶是成熟需求，TSA 3-1-1 规则本身就是稳定的问题来源。",
    "该品类内容化程度高：packing hacks、travel essentials 是 TikTok 长期存在的内容池。",
    "价格带竞争激烈，$30+ 必须靠「防漏演示 + 系统化收纳」建立溢价理由。",
  ],
  purchasePath: [
    { stage: "触发", description: "旅行日期确定，或经历一次漏液事故" },
    { stage: "发现", description: "TikTok / Reels 的 packing 内容，或 Amazon 搜索 travel bottles" },
    { stage: "对比", description: "对比 Amazon 白牌价格，找防漏的实拍证据" },
    { stage: "信任", description: "看退换货政策、评论数量、发货时效" },
    { stage: "下单", description: "在出发前 1-2 周完成购买，配送时效是硬约束" },
  ],
  competitorShape: [
    {
      name: "Amazon 白牌硅胶分装瓶",
      positioning: "低价、六件套、参数描述",
      priceBand: "$8 - $14",
      gap: "从不演示「漏了会怎样」，也没有收纳系统概念",
    },
    {
      name: "Cadence（美国 DTC 磁吸旅行容器）",
      positioning: "生活方式品牌、模块化、社媒声量强",
      priceBand: "$14/单个，套装 $60+",
      gap: "单价高，成套购买门槛大，适合作为价格锚点对比",
    },
    {
      name: "Muji / Target 通用空瓶",
      positioning: "线下随手买、极简",
      priceBand: "$3 - $8",
      gap: "无防漏承诺，无收纳结构",
    },
  ],
  seoSeeds: {
    transactional: [
      "leak proof travel bottles for toiletries",
      "magnetic travel container set",
      "tsa approved travel bottles 3.4 oz",
    ],
    problemAware: [
      "how to keep lotion from leaking in luggage",
      "why do travel bottles leak on planes",
      "how to pack skincare in a carry on",
    ],
    comparison: [
      "cadence capsules vs silicone travel bottles",
      "are magnetic travel containers worth it",
      "best travel bottles vs amazon cheap set",
    ],
    notWorthWriting: [
      "「旅行必备清单 50 件」这类宽泛清单文，流量不精准且竞争激烈",
      "航空公司行李政策科普，跟购买决策距离太远",
    ],
  },
  tiktokScenes: {
    problem: "打开行李箱，乳液爆开糊在白 T 恤上",
    demo: "装满乳液后倒置、挤压、甩动，纸巾放在瓶口验证不漏",
    transformation: "散乱的化妆包 → 磁吸拼成一摞塞进随身包",
    setting: "卧室地板 + 打开的行李箱，手机竖屏自然光",
  },
};

const BEAUTY: CategoryProfile = {
  ...GENERIC,
  label: "美妆个护",
  visualDemo: "high",
  searchDemand: "high",
};

const KITCHEN: CategoryProfile = {
  ...GENERIC,
  label: "厨房用具",
  visualDemo: "high",
  searchDemand: "medium",
};

const HOME: CategoryProfile = { ...GENERIC, label: "家居收纳", visualDemo: "high", searchDemand: "medium" };
const PET: CategoryProfile = { ...GENERIC, label: "宠物用品", visualDemo: "high", searchDemand: "medium" };
const FITNESS: CategoryProfile = { ...GENERIC, label: "运动健身", visualDemo: "medium", searchDemand: "high" };
const BABY: CategoryProfile = { ...GENERIC, label: "母婴", visualDemo: "medium", searchDemand: "high" };
const ELECTRONICS: CategoryProfile = {
  ...GENERIC,
  label: "消费电子配件",
  visualDemo: "medium",
  searchDemand: "high",
};
const APPAREL: CategoryProfile = { ...GENERIC, label: "服饰", visualDemo: "medium", searchDemand: "low" };

export const CATEGORY_PROFILES: Record<string, CategoryProfile> = {
  "travel-accessories": TRAVEL,
  beauty: BEAUTY,
  home: HOME,
  kitchen: KITCHEN,
  pet: PET,
  fitness: FITNESS,
  baby: BABY,
  electronics: ELECTRONICS,
  apparel: APPAREL,
  other: GENERIC,
};

export function getCategoryProfile(category: string): CategoryProfile {
  return CATEGORY_PROFILES[category] ?? GENERIC;
}

/** Demo 商品专用的高质量信息翻译对照 */
export const DEMO_TRANSLATIONS: TranslationPair[] = [
  {
    from: "食品级硅胶材质，六件套装",
    to: "Stop lotion explosions inside your carry-on",
    why: "美国买家不为材质付费，他们为「不会毁掉行李箱」这个结果付费。",
  },
  {
    from: "多功能磁吸设计，可自由拼接",
    to: "Your entire routine snaps into one compact stack",
    why: "把「功能」翻译成「收纳后的画面」，这是可以在 3 秒内看懂的价值。",
  },
  {
    from: "TSA 合规容量，通过防漏测试",
    to: "Airport-safe sizes that actually survive cabin pressure",
    why: "TSA 合规是入场券不是卖点，真正的焦虑是气压变化下会不会漏。",
  },
];
