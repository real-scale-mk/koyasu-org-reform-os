import {
  type InterventionStructureId,
  resolveInterventionStructure,
} from "@/lib/koyasu/intervention-structures";
import { formatPriorityStars } from "@/lib/koyasu/phenomenon-diagnostics";

export type StrategyRating = 1 | 2 | 3 | 4 | 5;

export const STRATEGY_COMPARISON_AXES = [
  { key: "polarisContribution", label: "POLARISへの貢献" },
  { key: "impactImprovement", label: "Impact改善効果" },
  { key: "rippleEffect", label: "波及効果" },
  { key: "breakthroughFeasibility", label: "突破可能性" },
  { key: "requiredCommitment", label: "必要覚悟" },
  { key: "timeRequired", label: "時間" },
  { key: "sideEffects", label: "副作用" },
] as const;

export type StrategyComparisonScores = Record<
  (typeof STRATEGY_COMPARISON_AXES)[number]["key"],
  StrategyRating
>;

export type ReformStrategyCandidate = {
  id: string;
  label: string;
  scores: StrategyComparisonScores;
};

export type ReformStrategyDesign = {
  structureId: InterventionStructureId;
  candidates: ReformStrategyCandidate[];
  adoptedStrategyId: string;
  adoptionReason: string;
  breakthroughPoint: string;
  babySteps: [string, string, string, string];
};

export type ResolvedReformStrategyDesign = ReformStrategyDesign & {
  structureLabel: string;
  adoptedStrategy: ReformStrategyCandidate;
  candidatesWithLabels: Array<
    ReformStrategyCandidate & { priorityLabel: string; isAdopted: boolean }
  >;
};

const DEFAULT_SCORES: StrategyComparisonScores = {
  polarisContribution: 3,
  impactImprovement: 3,
  rippleEffect: 3,
  breakthroughFeasibility: 3,
  requiredCommitment: 3,
  timeRequired: 3,
  sideEffects: 2,
};

const REFORM_STRATEGY_DESIGNS: Record<
  InterventionStructureId,
  ReformStrategyDesign
> = {
  meetings: {
    structureId: "meetings",
    candidates: [
      {
        id: "visibility",
        label: "責任の見える化",
        scores: {
          polarisContribution: 4,
          impactImprovement: 4,
          rippleEffect: 3,
          breakthroughFeasibility: 5,
          requiredCommitment: 2,
          timeRequired: 2,
          sideEffects: 1,
        },
      },
      {
        id: "meeting-rules",
        label: "会議ルール標準化",
        scores: {
          polarisContribution: 5,
          impactImprovement: 5,
          rippleEffect: 4,
          breakthroughFeasibility: 4,
          requiredCommitment: 3,
          timeRequired: 3,
          sideEffects: 2,
        },
      },
      {
        id: "decision-process",
        label: "意思決定プロセス変更",
        scores: {
          polarisContribution: 5,
          impactImprovement: 4,
          rippleEffect: 5,
          breakthroughFeasibility: 2,
          requiredCommitment: 5,
          timeRequired: 5,
          sideEffects: 3,
        },
      },
      {
        id: "manager-education",
        label: "管理職教育",
        scores: {
          polarisContribution: 4,
          impactImprovement: 3,
          rippleEffect: 4,
          breakthroughFeasibility: 3,
          requiredCommitment: 4,
          timeRequired: 4,
          sideEffects: 2,
        },
      },
      {
        id: "evaluation-link",
        label: "評価制度との連携",
        scores: {
          polarisContribution: 5,
          impactImprovement: 4,
          rippleEffect: 5,
          breakthroughFeasibility: 2,
          requiredCommitment: 5,
          timeRequired: 5,
          sideEffects: 4,
        },
      },
    ],
    adoptedStrategyId: "meeting-rules",
    adoptionReason:
      "突破可能性と Impact 改善のバランスが最良。一つの会議から試行でき、成功体験を積みやすいため。",
    breakthroughPoint: "一つの会議だけで試す（定例会1本に決裁者明示ルールを適用）",
    babySteps: [
      "会議責任者を明確化",
      "会議ルール試行",
      "部門展開",
      "評価制度へ反映",
    ],
  },
  accountability: {
    structureId: "accountability",
    candidates: [
      {
        id: "role-clarity",
        label: "役割・責任の明文化",
        scores: {
          polarisContribution: 5,
          impactImprovement: 5,
          rippleEffect: 4,
          breakthroughFeasibility: 4,
          requiredCommitment: 3,
          timeRequired: 3,
          sideEffects: 2,
        },
      },
      {
        id: "escalation-rules",
        label: "エスカレーション基準の統一",
        scores: {
          polarisContribution: 4,
          impactImprovement: 4,
          rippleEffect: 3,
          breakthroughFeasibility: 5,
          requiredCommitment: 2,
          timeRequired: 2,
          sideEffects: 1,
        },
      },
      {
        id: "decision-matrix",
        label: "決裁権限マトリクス",
        scores: {
          polarisContribution: 5,
          impactImprovement: 4,
          rippleEffect: 5,
          breakthroughFeasibility: 2,
          requiredCommitment: 5,
          timeRequired: 5,
          sideEffects: 3,
        },
      },
      {
        id: "manager-coaching",
        label: "管理職コーチング",
        scores: {
          polarisContribution: 4,
          impactImprovement: 3,
          rippleEffect: 4,
          breakthroughFeasibility: 3,
          requiredCommitment: 4,
          timeRequired: 4,
          sideEffects: 2,
        },
      },
    ],
    adoptedStrategyId: "escalation-rules",
    adoptionReason:
      "一つの係・一つの案件から試せる。責任分界を可視化し、他構造への波及も見込めるため。",
    breakthroughPoint: "一人の課長と、一つの越境問題でエスカレーション基準を試行する",
    babySteps: [
      "エスカレーション基準を1枚に整理",
      "1案件で試行・振り返り",
      "関連部門へ横展開",
      "全社基準として定着",
    ],
  },
  evaluation: {
    structureId: "evaluation",
    candidates: [
      {
        id: "growth-metrics",
        label: "育成・挑戦の評価指標追加",
        scores: {
          polarisContribution: 5,
          impactImprovement: 4,
          rippleEffect: 4,
          breakthroughFeasibility: 3,
          requiredCommitment: 4,
          timeRequired: 4,
          sideEffects: 3,
        },
      },
      {
        id: "360-feedback",
        label: "360度フィードバック試行",
        scores: {
          polarisContribution: 4,
          impactImprovement: 3,
          rippleEffect: 3,
          breakthroughFeasibility: 4,
          requiredCommitment: 3,
          timeRequired: 3,
          sideEffects: 2,
        },
      },
      {
        id: "proposal-incentive",
        label: "提案・越境協力インセンティブ",
        scores: {
          polarisContribution: 5,
          impactImprovement: 5,
          rippleEffect: 5,
          breakthroughFeasibility: 2,
          requiredCommitment: 5,
          timeRequired: 5,
          sideEffects: 4,
        },
      },
    ],
    adoptedStrategyId: "growth-metrics",
    adoptionReason:
      "評価制度全体の改定より先に、指標追加から着手できる。現場の成功体験を作りやすいため。",
    breakthroughPoint: "一つの部門で、育成・挑戦の評価観点を試験導入する",
    babySteps: [
      "評価観点ドラフト作成",
      "1部門で試行評価",
      "他部門へ展開",
      "全社評価制度へ統合",
    ],
  },
  development: {
    structureId: "development",
    candidates: [
      {
        id: "ojt-plus",
        label: "OJT＋振り返り定着",
        scores: {
          polarisContribution: 4,
          impactImprovement: 4,
          rippleEffect: 3,
          breakthroughFeasibility: 5,
          requiredCommitment: 2,
          timeRequired: 2,
          sideEffects: 1,
        },
      },
      {
        id: "knowledge-base",
        label: "暗黙知のナレッジ化",
        scores: {
          polarisContribution: 5,
          impactImprovement: 4,
          rippleEffect: 4,
          breakthroughFeasibility: 3,
          requiredCommitment: 3,
          timeRequired: 4,
          sideEffects: 2,
        },
      },
      {
        id: "successor-plan",
        label: "後継者計画の可視化",
        scores: {
          polarisContribution: 4,
          impactImprovement: 3,
          rippleEffect: 4,
          breakthroughFeasibility: 3,
          requiredCommitment: 4,
          timeRequired: 4,
          sideEffects: 2,
        },
      },
    ],
    adoptedStrategyId: "ojt-plus",
    adoptionReason:
      "既存 OJT に小さな仕組みを足すだけで始められる。一つの係から成功事例を作れるため。",
    breakthroughPoint: "一つの係で、OJT後の15分振り返りを4週間試す",
    babySteps: [
      "振り返りテンプレート作成",
      "1係で4週間試行",
      "成功パターンを横展開",
      "育成構造として定着",
    ],
  },
  information: {
    structureId: "information",
    candidates: [
      {
        id: "cross-dept-forum",
        label: "部門横断フォーラム",
        scores: {
          polarisContribution: 4,
          impactImprovement: 3,
          rippleEffect: 4,
          breakthroughFeasibility: 4,
          requiredCommitment: 3,
          timeRequired: 3,
          sideEffects: 2,
        },
      },
      {
        id: "issue-board",
        label: "越境問題ボード",
        scores: {
          polarisContribution: 4,
          impactImprovement: 4,
          rippleEffect: 3,
          breakthroughFeasibility: 5,
          requiredCommitment: 2,
          timeRequired: 2,
          sideEffects: 1,
        },
      },
      {
        id: "info-routing",
        label: "情報ルーティングルール",
        scores: {
          polarisContribution: 5,
          impactImprovement: 4,
          rippleEffect: 5,
          breakthroughFeasibility: 2,
          requiredCommitment: 4,
          timeRequired: 4,
          sideEffects: 3,
        },
      },
    ],
    adoptedStrategyId: "issue-board",
    adoptionReason:
      "物理的な可視化から始められる。一つの越境問題で「止める役」を試せるため。",
    breakthroughPoint: "一つの越境問題をボードに載せ、止める役を1週間試す",
    babySteps: [
      "ボードとルールを1枚で定義",
      "1件の越境問題で試行",
      "関連部門へ拡大",
      "情報構造として定着",
    ],
  },
};

/** 現象ごとの改革戦略（structure テンプレートの上書き。将来: 案件×現象で保存） */
const REFORM_STRATEGY_BY_PHENOMENON_ID: Record<string, ReformStrategyDesign> = {
  "young-turnover": REFORM_STRATEGY_DESIGNS.meetings,
  "indecisive-meetings": {
    ...REFORM_STRATEGY_DESIGNS.meetings,
    adoptedStrategyId: "visibility",
    adoptionReason:
      "現象と直結する「決裁者明示」から始め、持ち帰り構造を可視化できるため。",
    breakthroughPoint: "定例会1本だけ、決裁者をホワイトボードに書いて試す",
    babySteps: [
      "決裁者明示ルールを1会議で試行",
      "持ち帰り理由の記録",
      "他会議へ横展開",
      "評価制度へ反映",
    ],
  },
  "major-order-loss": REFORM_STRATEGY_DESIGNS.evaluation,
  "defect-frequency": {
    structureId: "accountability",
    candidates: [
      {
        id: "role-clarity",
        label: "役割・責任の明文化",
        scores: {
          polarisContribution: 5,
          impactImprovement: 5,
          rippleEffect: 4,
          breakthroughFeasibility: 4,
          requiredCommitment: 3,
          timeRequired: 3,
          sideEffects: 2,
        },
      },
      {
        id: "escalation-rules",
        label: "エスカレーション基準の統一",
        scores: {
          polarisContribution: 4,
          impactImprovement: 4,
          rippleEffect: 3,
          breakthroughFeasibility: 5,
          requiredCommitment: 2,
          timeRequired: 2,
          sideEffects: 1,
        },
      },
      {
        id: "recurrence-review",
        label: "再発防止レビュー定着",
        scores: {
          polarisContribution: 4,
          impactImprovement: 4,
          rippleEffect: 3,
          breakthroughFeasibility: 4,
          requiredCommitment: 3,
          timeRequired: 3,
          sideEffects: 2,
        },
      },
    ],
    adoptedStrategyId: "role-clarity",
    adoptionReason:
      "再発責任の所在が曖昧なため、一つの不具合カテゴリで責任分界から着手する。",
    breakthroughPoint: "一つの不具合カテゴリで、責任者と報告ラインを1枚に整理する",
    babySteps: [
      "責任分界シート作成",
      "1カテゴリで試行",
      "再発防止レビューに組込",
      "全社品質基準へ展開",
    ],
  },
  "defect-resolution-delay": {
    structureId: "accountability",
    candidates: [
      {
        id: "escalation-rules",
        label: "エスカレーション基準の統一",
        scores: {
          polarisContribution: 5,
          impactImprovement: 5,
          rippleEffect: 4,
          breakthroughFeasibility: 5,
          requiredCommitment: 2,
          timeRequired: 2,
          sideEffects: 1,
        },
      },
      {
        id: "decision-matrix",
        label: "決裁権限マトリクス",
        scores: {
          polarisContribution: 4,
          impactImprovement: 4,
          rippleEffect: 4,
          breakthroughFeasibility: 2,
          requiredCommitment: 5,
          timeRequired: 5,
          sideEffects: 3,
        },
      },
      {
        id: "information",
        label: "横断情報共有ルール",
        scores: {
          polarisContribution: 3,
          impactImprovement: 4,
          rippleEffect: 3,
          breakthroughFeasibility: 4,
          requiredCommitment: 3,
          timeRequired: 3,
          sideEffects: 2,
        },
      },
    ],
    adoptedStrategyId: "escalation-rules",
    adoptionReason:
      "解決滞留の主因は判断基準の不明確さ。一案件から基準試行が最も早い。",
    breakthroughPoint: "長期化している1件の不具合で、エスカレーション基準を試す",
    babySteps: [
      "エスカレーション基準を1枚化",
      "1案件で試行・計測",
      "関連部門へ横展開",
      "全社基準として定着",
    ],
  },
  "manager-distrust": {
    structureId: "accountability",
    candidates: [
      {
        id: "manager-coaching",
        label: "管理職コーチング",
        scores: {
          polarisContribution: 5,
          impactImprovement: 4,
          rippleEffect: 4,
          breakthroughFeasibility: 4,
          requiredCommitment: 4,
          timeRequired: 4,
          sideEffects: 2,
        },
      },
      {
        id: "role-clarity",
        label: "役割・責任の明文化",
        scores: {
          polarisContribution: 4,
          impactImprovement: 4,
          rippleEffect: 3,
          breakthroughFeasibility: 4,
          requiredCommitment: 3,
          timeRequired: 3,
          sideEffects: 2,
        },
      },
      {
        id: "evaluation-link",
        label: "信頼行動の評価連動",
        scores: {
          polarisContribution: 4,
          impactImprovement: 3,
          rippleEffect: 5,
          breakthroughFeasibility: 2,
          requiredCommitment: 5,
          timeRequired: 5,
          sideEffects: 4,
        },
      },
    ],
    adoptedStrategyId: "manager-coaching",
    adoptionReason:
      "信頼回復は管理職の対話行動から。一人の課長と試行し成功体験を作る。",
    breakthroughPoint: "一人の課長と、1on1で「報告しやすさ」を4週間試す",
    babySteps: [
      "1on1対話ガイド作成",
      "1課長で4週間試行",
      "成功パターンを横展開",
      "管理職評価へ反映",
    ],
  },
};

const DEFAULT_DESIGN: ReformStrategyDesign = {
  structureId: "accountability",
  candidates: [
    {
      id: "placeholder",
      label: "（準備中）",
      scores: DEFAULT_SCORES,
    },
  ],
  adoptedStrategyId: "placeholder",
  adoptionReason: "改革戦略データは準備中です",
  breakthroughPoint: "（準備中）",
  babySteps: ["（準備中）", "—", "—", "—"],
};

export function getReformStrategyDesign(
  phenomenonId: string,
  structureId: InterventionStructureId,
): ResolvedReformStrategyDesign {
  const design =
    REFORM_STRATEGY_BY_PHENOMENON_ID[phenomenonId] ??
    REFORM_STRATEGY_DESIGNS[structureId] ??
    DEFAULT_DESIGN;
  const structure = resolveInterventionStructure(design.structureId);
  const adoptedStrategy =
    design.candidates.find((c) => c.id === design.adoptedStrategyId) ??
    design.candidates[0];

  const candidatesWithLabels = design.candidates.map((candidate) => ({
    ...candidate,
    priorityLabel: formatPriorityStars(
      computeOverallScore(candidate.scores) as StrategyRating,
    ),
    isAdopted: candidate.id === design.adoptedStrategyId,
  }));

  return {
    ...design,
    structureLabel: structure.label,
    adoptedStrategy,
    candidatesWithLabels,
  };
}

/** 将来: 比較軸から総合スコアを算出。MVP では簡易平均 */
function computeOverallScore(scores: StrategyComparisonScores): StrategyRating {
  const values = Object.values(scores);
  const sum = values.reduce((acc, v) => acc + v, 0);
  const avg = Math.round(sum / values.length);
  return Math.min(5, Math.max(1, avg)) as StrategyRating;
}

export function formatStrategyRating(rating: StrategyRating): string {
  return formatPriorityStars(rating);
}
