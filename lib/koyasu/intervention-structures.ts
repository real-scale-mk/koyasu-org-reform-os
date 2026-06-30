/**
 * 介入候補構造のカタログ。
 * Pane1 の診断結果 → Pane2 の分析対象として ID で受け渡す。
 */
export const INTERVENTION_STRUCTURE_IDS = [
  "accountability",
  "meetings",
  "evaluation",
  "development",
  "information",
] as const;

export type InterventionStructureId =
  (typeof INTERVENTION_STRUCTURE_IDS)[number];

export type InterventionStructureDetail = {
  id: InterventionStructureId;
  label: string;
  summary: string;
  viewpoint: string;
  questions: string[];
};

export const INTERVENTION_STRUCTURES: Record<
  InterventionStructureId,
  InterventionStructureDetail
> = {
  accountability: {
    id: "accountability",
    label: "責任構造",
    summary: "誰が決め・誰が動くかの所在",
    viewpoint:
      "責任の所在が曖昧だと、会議で決めず持ち帰りが増え、越境問題が放置される。",
    questions: [
      "会議で決裁者は明示されているか",
      "持ち帰りが常態化していないか",
      "越境問題の止め方は決まっているか",
    ],
  },
  meetings: {
    id: "meetings",
    label: "会議構造",
    summary: "決裁と持ち帰りのパターン",
    viewpoint:
      "会議の設計が、決裁と実行の速度を左右する。決めない会議は責任構造の症状として現れる。",
    questions: [
      "会議の目的と決裁事項は事前に共有されているか",
      "持ち帰りの理由は構造的か",
      "会議後のフォローは誰が担うか",
    ],
  },
  evaluation: {
    id: "evaluation",
    label: "評価構造",
    summary: "育成・挑戦が評価に反映されるか",
    viewpoint:
      "評価制度が、挑戦と育成を後押しするか阻害するかを見る。短期成果偏重は離職・逸注につながる。",
    questions: [
      "育成・越境協力は評価に反映されるか",
      "失敗から学ぶ行動は許容されているか",
      "短期成果だけが強調されていないか",
    ],
  },
  development: {
    id: "development",
    label: "育成構造",
    summary: "ベテラン知見の継承と成長機会",
    viewpoint:
      "育成機会と OJT 以外の伝承手段が不足すると、若手離職と技術断絶が進む。",
    questions: [
      "OJT以外の伝承手段はあるか",
      "暗黙知を言語化する時間は確保されているか",
      "後継者育成は計画されているか",
    ],
  },
  information: {
    id: "information",
    label: "情報構造",
    summary: "部門間の連携と情報共有",
    viewpoint:
      "情報が部門内に閉じると、他人事化と問題の持ち越しが起き、改善サイクルが止まる。",
    questions: [
      "他部門の問題を「自分ごと」にできる関係があるか",
      "越境問題を止める役割は誰か",
      "情報共有の場は機能しているか",
    ],
  },
};

export function resolveInterventionStructure(
  id: InterventionStructureId,
): InterventionStructureDetail {
  return INTERVENTION_STRUCTURES[id];
}
