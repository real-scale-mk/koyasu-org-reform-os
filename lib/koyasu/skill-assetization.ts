/**
 * SKILL資産化ワークスペース — データ構造
 *
 * 将来拡張（MVP 未実装）:
 * - Concept DB: 責任・役割・約束など重要概念の定義
 * - Skill DB: 再利用可能な改革 SKILL の永続ストア
 * - Tactics DB: 説得・面談・スポンサー形成・抵抗勢力対応など現場実践知
 */

export type OrgReformSkill = {
  id: string;
  label: string;
};

/** 将来: Concept DB エントリ */
export type ConceptDbEntry = {
  id: string;
  term: string;
  definition: string;
};

/** 将来: Skill DB エントリ */
export type SkillDbEntry = OrgReformSkill & {
  sourcePhenomenonId?: string;
  accumulatedAt?: string;
};

/** 将来: Tactics DB エントリ */
export type TacticsDbEntry = {
  id: string;
  label: string;
  context: string;
};

export type SkillAssetizationRecord = {
  facts: string[];
  results: string[];
  insights: string[];
  orgReformSkills: OrgReformSkill[];
  /** 今回 OS へ蓄積された SKILL（MVP: 静的表示） */
  accumulatedSkills: OrgReformSkill[];
  placeholder?: boolean;
};

export type ResolvedSkillAssetization = SkillAssetizationRecord & {
  adoptedReformLabel?: string;
};

const PLACEHOLDER: SkillAssetizationRecord = {
  facts: [],
  results: [],
  insights: [],
  orgReformSkills: [],
  accumulatedSkills: [],
  placeholder: true,
};

const SKILL_ASSETIZATION_BY_PHENOMENON_ID: Record<
  string,
  SkillAssetizationRecord
> = {
  "young-turnover": {
    facts: ["会議ルール試行", "責任者明確化", "1on1開始"],
    results: ["決裁時間短縮", "持ち帰り案件減少", "若手発言増加"],
    insights: [
      "責任の見える化は会議ルール変更より効果が大きかった",
      "管理職教育より先に会議構造を変える方が成果が出た",
      "BABY STEPによる成功体験が組織の抵抗感を下げた",
    ],
    orgReformSkills: [
      { id: "SK-001", label: "責任は会議中に明文化する" },
      { id: "SK-002", label: "改革はBABY STEPから始める" },
      { id: "SK-003", label: "介入本丸構造へ集中する方が部分改善より効果が高い" },
    ],
    accumulatedSkills: [
      { id: "SK-001", label: "責任は会議中に明文化する" },
      { id: "SK-002", label: "改革はBABY STEPから始める" },
      { id: "SK-003", label: "介入本丸構造へ集中する方が部分改善より効果が高い" },
    ],
  },
  "indecisive-meetings": {
    facts: ["定例会に決裁者明示ルールを導入", "持ち帰り理由の記録開始"],
    results: ["持ち帰り件数が月8件→3件に減少", "会議時間が平均15分短縮"],
    insights: [
      "ルール1つ追加より「誰が決めるか」の明示が先",
      "記録することで先送りの構造が可視化された",
    ],
    orgReformSkills: [
      { id: "SK-001", label: "責任は会議中に明文化する" },
      { id: "SK-004", label: "持ち帰りは理由を記録して構造を見る" },
    ],
    accumulatedSkills: [
      { id: "SK-001", label: "責任は会議中に明文化する" },
      { id: "SK-004", label: "持ち帰りは理由を記録して構造を見る" },
    ],
  },
  "major-order-loss": {
    facts: ["評価観点ドラフト作成", "1部門で育成・挑戦の試行評価"],
    results: ["大型案件提案数が四半期で1.3倍", "若手の提案参加率が向上"],
    insights: [
      "提案力不足はスキルより評価構造の問題だった",
      "1部門の成功が他部門の受注意欲を引き上げた",
    ],
    orgReformSkills: [
      { id: "SK-020", label: "挑戦は評価指標に明示して初めて動く" },
      { id: "SK-003", label: "介入本丸構造へ集中する方が部分改善より効果が高い" },
    ],
    accumulatedSkills: [
      { id: "SK-020", label: "挑戦は評価指標に明示して初めて動く" },
      { id: "SK-003", label: "介入本丸構造へ集中する方が部分改善より効果が高い" },
    ],
  },
  "defect-frequency": {
    facts: ["不具合カテゴリ別責任分界シート作成", "再発防止レビュー試行"],
    results: ["同型不具合の再発件数が月5件→2件", "責任者明示率が向上"],
    insights: [
      "責任分界の1枚化が再発防止より先に効いた",
      "一カテゴリに絞ると現場の抵抗が小さい",
    ],
    orgReformSkills: [
      { id: "SK-010", label: "不具合はカテゴリ単位で責任分界する" },
      { id: "SK-002", label: "改革はBABY STEPから始める" },
    ],
    accumulatedSkills: [
      { id: "SK-010", label: "不具合はカテゴリ単位で責任分界する" },
      { id: "SK-002", label: "改革はBABY STEPから始める" },
    ],
  },
  "defect-resolution-delay": {
    facts: ["エスカレーション基準1枚化", "長期化案件1件で試行"],
    results: ["解決リードタイムが平均40%短縮", "判断停滞の可視化に成功"],
    insights: [
      "基準がないと「様子見」が構造として固定される",
      "1案件の成功が他案件の判断速度を上げた",
    ],
    orgReformSkills: [
      { id: "SK-011", label: "エスカレーション基準は1枚で試す" },
      { id: "SK-003", label: "介入本丸構造へ集中する方が部分改善より効果が高い" },
    ],
    accumulatedSkills: [
      { id: "SK-011", label: "エスカレーション基準は1枚で試す" },
      { id: "SK-003", label: "介入本丸構造へ集中する方が部分改善より効果が高い" },
    ],
  },
  "manager-distrust": {
    facts: ["1on1対話ガイド作成", "1名の課長で4週間試行"],
    results: ["部下の相談件数が自己申告で2倍", "会議での発言が増加"],
    insights: [
      "信頼回復は制度より対話頻度が先",
      "成功した課長の行動が他管理職の手本になった",
    ],
    orgReformSkills: [
      { id: "SK-012", label: "信頼回復は1on1の質から始める" },
      { id: "SK-002", label: "改革はBABY STEPから始める" },
    ],
    accumulatedSkills: [
      { id: "SK-012", label: "信頼回復は1on1の質から始める" },
      { id: "SK-002", label: "改革はBABY STEPから始める" },
    ],
  },
};

export function getSkillAssetization(
  phenomenonId: string,
): ResolvedSkillAssetization {
  const record =
    SKILL_ASSETIZATION_BY_PHENOMENON_ID[phenomenonId] ?? PLACEHOLDER;
  return { ...record };
}

/** 将来: 実行結果・成果から SKILL を自動抽出 */
export function extractSkillsFromExperience(
  _record: SkillAssetizationRecord,
): OrgReformSkill[] {
  return [];
}

/** 将来: Skill DB へ永続化 */
export function persistToSkillDb(_skills: SkillDbEntry[]): void {
  // MVP: 未実装
}
