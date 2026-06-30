import {
  type InterventionStructureId,
  resolveInterventionStructure,
} from "@/lib/koyasu/intervention-structures";

export const PAIN_LEVEL_LABELS = [
  "ほぼなし",
  "弱い",
  "中程度",
  "強い",
  "甚大",
] as const;

export const MATURITY_LEVEL_LABELS = [
  "知らない",
  "知っている",
  "理解している",
  "実践している",
  "文化になっている",
] as const;

export const IMPACT_STAKEHOLDERS = [
  { key: "customer", label: "顧客" },
  {
    key: "committed",
    label: "本気社員",
    description: "会社を良くしたい社員",
  },
  { key: "general", label: "一般社員" },
  { key: "manager", label: "管理職" },
  { key: "company", label: "会社" },
  { key: "future", label: "将来" },
] as const;

export const POLARIS_REALIZATION_SECTION_TITLE = "POLARIS実現力診断";

export const POLARIS_CAPABILITIES = [
  { key: "calling", label: "Mission・Vision推進力" },
  { key: "valueCreation", label: "Value体現力" },
  { key: "accountability", label: "責任当事者力" },
  { key: "growth", label: "成長取組力" },
  { key: "futureChoice", label: "未来選択力" },
] as const;

export type PainLevel = 1 | 2 | 3 | 4 | 5;
export type MaturityLevel = 1 | 2 | 3 | 4 | 5;
export type ImpactStakeholderKey =
  (typeof IMPACT_STAKEHOLDERS)[number]["key"];
export type PolarisCapabilityKey =
  (typeof POLARIS_CAPABILITIES)[number]["key"];

export type StakeholderImpact = {
  level: PainLevel;
  reason: string;
};

export type CapabilityMaturity = {
  level: MaturityLevel;
  comment: string;
};

/** 介入優先度（5=最高 ★★★★★）。将来は診断結果から算出 */
export type InterventionPriority = 1 | 2 | 3 | 4 | 5;

export type InterventionCandidateStructure = {
  structureId: InterventionStructureId;
  /** MVP: 静的優先度。将来 computeInterventionPriorities() で上書き可能 */
  priority: InterventionPriority;
  rationale: string;
};

/** 将来拡張: Impact / POLARIS実現力診断から優先度を算出する入力 */
export type InterventionPriorityInputs = {
  impactByStakeholder: Record<ImpactStakeholderKey, StakeholderImpact>;
  polarisMaturityByCapability: Record<PolarisCapabilityKey, CapabilityMaturity>;
};

export type PhenomenonDiagnostic = {
  impactByStakeholder: Record<ImpactStakeholderKey, StakeholderImpact>;
  polarisMaturityByCapability: Record<PolarisCapabilityKey, CapabilityMaturity>;
  interventionCandidateStructures: InterventionCandidateStructure[];
  /** 本丸選定理由。structureId は interventionCandidateStructures の No.1 から導出 */
  primaryInterventionStructure: {
    selectionReason: string;
  };
};

export type ResolvedInterventionCandidate = InterventionCandidateStructure & {
  rank: number;
  label: string;
  summary: string;
  priorityLabel: string;
};

export type PhenomenonDiagnosticFlow = PhenomenonDiagnostic & {
  primaryStructureDetail: ReturnType<typeof resolveInterventionStructure>;
  primaryCandidate: ResolvedInterventionCandidate;
  interventionCandidatesResolved: ResolvedInterventionCandidate[];
};

const defaultImpactEntry = (reason: string): StakeholderImpact => ({
  level: 2,
  reason,
});

const defaultMaturityEntry = (comment: string): CapabilityMaturity => ({
  level: 1,
  comment,
});

const DEFAULT_DIAGNOSTIC: PhenomenonDiagnostic = {
  impactByStakeholder: {
    customer: defaultImpactEntry("診断データ準備中"),
    committed: defaultImpactEntry("診断データ準備中"),
    general: defaultImpactEntry("診断データ準備中"),
    manager: defaultImpactEntry("診断データ準備中"),
    company: defaultImpactEntry("診断データ準備中"),
    future: defaultImpactEntry("診断データ準備中"),
  },
  polarisMaturityByCapability: {
    calling: defaultMaturityEntry("診断データ準備中"),
    valueCreation: defaultMaturityEntry("診断データ準備中"),
    accountability: defaultMaturityEntry("診断データ準備中"),
    growth: defaultMaturityEntry("診断データ準備中"),
    futureChoice: defaultMaturityEntry("診断データ準備中"),
  },
  interventionCandidateStructures: [],
  primaryInterventionStructure: {
    selectionReason: "診断データが揃うと表示されます",
  },
};

export const PHENOMENON_DIAGNOSTICS: Record<string, PhenomenonDiagnostic> = {
  "young-turnover": {
    impactByStakeholder: {
      customer: { level: 3, reason: "品質・納期リスクの増加" },
      committed: { level: 5, reason: "離職を考え始める" },
      general: { level: 3, reason: "育成負荷の増大" },
      manager: { level: 4, reason: "育成成果が見えにくい" },
      company: { level: 5, reason: "採用・教育コストの累積" },
      future: { level: 5, reason: "技術・知見の断絶" },
    },
    polarisMaturityByCapability: {
      calling: {
        level: 2,
        comment: "改善意欲はあるが越境提案が止まる",
      },
      valueCreation: {
        level: 2,
        comment: "部門内改善に留まりがち",
      },
      accountability: {
        level: 1,
        comment: "決裁者が曖昧で持ち帰りが常態化",
      },
      growth: {
        level: 2,
        comment: "育成機会はあるが評価に結びつかない",
      },
      futureChoice: {
        level: 1,
        comment: "中長期投資より短期成果が優先",
      },
    },
    interventionCandidateStructures: [
      {
        structureId: "meetings",
        priority: 5,
        rationale: "決めない会議が離職トリガーとして顕在化",
      },
      {
        structureId: "accountability",
        priority: 4,
        rationale: "責任当事者力が最低水準。管理職・本気社員 Impact が高い",
      },
      {
        structureId: "evaluation",
        priority: 3,
        rationale: "育成・挑戦が評価に反映されず離職意向へ",
      },
      {
        structureId: "development",
        priority: 2,
        rationale: "成長実感不足が若手離職に直結",
      },
      {
        structureId: "information",
        priority: 1,
        rationale: "部門間連携不足が問題の持ち越しを助長",
      },
    ],
    primaryInterventionStructure: {
      selectionReason:
        "責任の所在が曖昧になり、決めない・持ち帰る・若手が疲弊する連鎖の起点になっているため。",
    },
  },
  "major-order-loss": {
    impactByStakeholder: {
      customer: { level: 4, reason: "提案力・信頼の低下" },
      committed: { level: 4, reason: "勝てる手応えがない" },
      general: { level: 2, reason: "間接的なプレッシャー" },
      manager: { level: 4, reason: "説明責任の増大" },
      company: { level: 5, reason: "売上計画とのギャップ拡大" },
      future: { level: 4, reason: "市場ポジションの後退" },
    },
    polarisMaturityByCapability: {
      calling: { level: 2, comment: "顧客課題への当事者意識が弱い" },
      valueCreation: { level: 2, comment: "提案の差別化が不十分" },
      accountability: { level: 2, comment: "受注判断の責任が分散" },
      growth: { level: 1, comment: "提案スキル育成が後回し" },
      futureChoice: { level: 2, comment: "大型案件への投資判断が遅い" },
    },
    interventionCandidateStructures: [
      {
        structureId: "evaluation",
        priority: 5,
        rationale: "存在価値生成力と顧客 Impact のギャップ",
      },
      {
        structureId: "accountability",
        priority: 4,
        rationale: "受注判断の責任所在が曖昧",
      },
      {
        structureId: "information",
        priority: 3,
        rationale: "部門横断の提案連携が弱い",
      },
    ],
    primaryInterventionStructure: {
      selectionReason:
        "提案力や挑戦が評価に結びつかず、大型案件で勝てない手応えが現場に広がっているため。",
    },
  },
  "defect-frequency": {
    impactByStakeholder: {
      customer: { level: 5, reason: "品質クレーム・信頼低下" },
      committed: { level: 3, reason: "再発対応の徒労感" },
      general: { level: 3, reason: "品質対応工数の増加" },
      manager: { level: 3, reason: "再発責任の曖昧さ" },
      company: { level: 4, reason: "品質コストの増大" },
      future: { level: 3, reason: "改善学習の蓄積不足" },
    },
    polarisMaturityByCapability: {
      calling: { level: 2, comment: "再発防止への当事者意識が弱い" },
      valueCreation: { level: 3, comment: "品質改善は部門内で回る" },
      accountability: { level: 2, comment: "再発責任の所在が不明確" },
      growth: { level: 2, comment: "学習からの仕組み化が不足" },
      futureChoice: { level: 1, comment: "根本対策より暫定対応が優先" },
    },
    interventionCandidateStructures: [
      {
        structureId: "accountability",
        priority: 5,
        rationale: "品質責任の所在が曖昧",
      },
      {
        structureId: "development",
        priority: 4,
        rationale: "再発防止の学習構造が未整備",
      },
      {
        structureId: "information",
        priority: 3,
        rationale: "不具合情報の横断共有が不足",
      },
    ],
    primaryInterventionStructure: {
      selectionReason:
        "再発責任の所在が曖昧で、対症対応が繰り返され顧客 Impact が拡大しているため。",
    },
  },
  "defect-resolution-delay": {
    impactByStakeholder: {
      customer: { level: 5, reason: "解決待ちによる機会損失" },
      committed: { level: 3, reason: "暫定対応の積み上げ疲弊" },
      general: { level: 2, reason: "間接的な工数増" },
      manager: { level: 4, reason: "エスカレーション判断の負荷" },
      company: { level: 4, reason: "技術負債の増大" },
      future: { level: 3, reason: "根本対策の先送り" },
    },
    polarisMaturityByCapability: {
      calling: { level: 2, comment: "根本原因への当事者意識が弱い" },
      valueCreation: { level: 2, comment: "横断協力が機能しない" },
      accountability: { level: 2, comment: "エスカレーション基準が不明" },
      growth: { level: 2, comment: "原因究明の学習が不足" },
      futureChoice: { level: 1, comment: "暫定対応が常態化" },
    },
    interventionCandidateStructures: [
      {
        structureId: "accountability",
        priority: 5,
        rationale: "エスカレーション基準と責任分界",
      },
      {
        structureId: "information",
        priority: 4,
        rationale: "横断原因究明の情報共有不足",
      },
      {
        structureId: "meetings",
        priority: 3,
        rationale: "判断会議の滞留",
      },
    ],
    primaryInterventionStructure: {
      selectionReason:
        "エスカレーション基準が不明で解決が滞留し、顧客・管理職への痛みが連鎖しているため。",
    },
  },
  "manager-distrust": {
    impactByStakeholder: {
      customer: { level: 2, reason: "間接的な品質・対応リスク" },
      committed: { level: 5, reason: "信頼低下で本音が出ない" },
      general: { level: 4, reason: "報告・相談の萎縮" },
      manager: { level: 4, reason: "現場との距離拡大" },
      company: { level: 4, reason: "問題の早期発見が遅れる" },
      future: { level: 4, reason: "改善提案の枯渇" },
    },
    polarisMaturityByCapability: {
      calling: { level: 2, comment: "管理職への期待と現実のギャップ" },
      valueCreation: { level: 2, comment: "越境改善の後押し不足" },
      accountability: { level: 1, comment: "管理職の責任行動が不明確" },
      growth: { level: 2, comment: "対話による学習機会不足" },
      futureChoice: { level: 1, comment: "信頼回復の投資が未着手" },
    },
    interventionCandidateStructures: [
      {
        structureId: "accountability",
        priority: 5,
        rationale: "管理職行動と責任当事者力の低さ",
      },
      {
        structureId: "evaluation",
        priority: 4,
        rationale: "管理職評価と現場信頼の乖離",
      },
      {
        structureId: "development",
        priority: 3,
        rationale: "管理職の対話・育成スキル不足",
      },
    ],
    primaryInterventionStructure: {
      selectionReason:
        "管理職の責任行動が不明確で、本気社員の信頼低下と報告萎縮が進んでいるため。",
    },
  },
  "indecisive-meetings": {
    impactByStakeholder: {
      customer: { level: 3, reason: "対応速度の低下" },
      committed: { level: 4, reason: "提案が宙に浮く" },
      general: { level: 3, reason: "次アクション不明" },
      manager: { level: 5, reason: "決裁責任の押し付け合い" },
      company: { level: 4, reason: "実行速度の低下" },
      future: { level: 4, reason: "越境問題の放置" },
    },
    polarisMaturityByCapability: {
      calling: { level: 2, comment: "会議改善への当事者意識はある" },
      valueCreation: { level: 2, comment: "横断問題の止め方が弱い" },
      accountability: { level: 1, comment: "決裁者明示が機能していない" },
      growth: { level: 2, comment: "会議設計の学習が不足" },
      futureChoice: { level: 2, comment: "決裁ルール整備の試行開始" },
    },
    interventionCandidateStructures: [
      {
        structureId: "meetings",
        priority: 5,
        rationale: "管理職 Impact 最大。決裁・持ち帰りが常態化",
      },
      {
        structureId: "accountability",
        priority: 4,
        rationale: "責任構造と会議構造が連動",
      },
      {
        structureId: "information",
        priority: 3,
        rationale: "決裁事項の事前共有不足",
      },
    ],
    primaryInterventionStructure: {
      selectionReason:
        "決裁者が明示されず持ち帰りが常態化し、実行速度と越境問題の放置につながっているため。",
    },
  },
};

export function formatPriorityStars(priority: InterventionPriority): string {
  const filled = "★".repeat(priority);
  const empty = "☆".repeat(5 - priority);
  return `${filled}${empty}`;
}

export function sortInterventionCandidates(
  candidates: InterventionCandidateStructure[],
): InterventionCandidateStructure[] {
  return [...candidates].sort((a, b) => b.priority - a.priority);
}

/** 将来: Impact / POLARIS実現力診断から候補ごとの priority を算出 */
export function computeInterventionPriorities(
  _inputs: InterventionPriorityInputs,
  candidates: InterventionCandidateStructure[],
): InterventionCandidateStructure[] {
  return candidates;
}

export function resolveInterventionCandidates(
  diagnostic: PhenomenonDiagnostic,
): ResolvedInterventionCandidate[] {
  const ranked = sortInterventionCandidates(
    diagnostic.interventionCandidateStructures,
  );
  return ranked.map((candidate, index) => {
    const detail = resolveInterventionStructure(candidate.structureId);
    return {
      ...candidate,
      rank: index + 1,
      label: detail.label,
      summary: detail.summary,
      priorityLabel: formatPriorityStars(candidate.priority),
    };
  });
}

export function getPhenomenonDiagnostic(
  phenomenonId: string,
): PhenomenonDiagnostic {
  return PHENOMENON_DIAGNOSTICS[phenomenonId] ?? DEFAULT_DIAGNOSTIC;
}

export function getPhenomenonDiagnosticFlow(
  phenomenonId: string,
): PhenomenonDiagnosticFlow {
  const diagnostic = getPhenomenonDiagnostic(phenomenonId);
  const interventionCandidatesResolved =
    resolveInterventionCandidates(diagnostic);
  const primaryCandidate = interventionCandidatesResolved[0] ?? {
    structureId: "accountability" as InterventionStructureId,
    priority: 1 as InterventionPriority,
    rationale: "",
    rank: 1,
    label: "（準備中）",
    summary: "",
    priorityLabel: "☆☆☆☆☆",
  };
  const primaryStructureDetail = resolveInterventionStructure(
    primaryCandidate.structureId,
  );

  return {
    ...diagnostic,
    primaryStructureDetail,
    primaryCandidate,
    interventionCandidatesResolved,
  };
}

export function painLevelLabel(level: PainLevel): string {
  return PAIN_LEVEL_LABELS[level - 1];
}

export function maturityLevelLabel(level: MaturityLevel): string {
  return MATURITY_LEVEL_LABELS[level - 1];
}

/** Pane2 へ渡す介入本丸構造（現象選択に連動） */
export function getPrimaryInterventionStructureForPhenomenon(
  phenomenonId: string,
) {
  const flow = getPhenomenonDiagnosticFlow(phenomenonId);
  return {
    structure: flow.primaryStructureDetail,
    selectionReason: flow.primaryInterventionStructure.selectionReason,
    phenomenonId,
  };
}

export type PrimaryInterventionContext = ReturnType<
  typeof getPrimaryInterventionStructureForPhenomenon
>;
