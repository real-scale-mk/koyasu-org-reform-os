/**
 * 案件 × 現象のワークスペースサンプルデータ。
 *
 * 将来拡張: CaseWorkspaceCatalog を DB / 保存 API と差し替え可能。
 * 現象切替時に Pane1〜4 で一貫したサンプルを参照する。
 */

export type PhenomenonWorkspaceBundle = {
  phenomenonId: string;
  /** 現象ごとの案件POLARIS（目指す姿の具体化） */
  casePolaris: string;
  /** 現象ごとの目指す姿（Target State）サンプル */
  targetState: string;
};

/** Pane1 現象リストの表示順（デモ用。データ構造は変更しない） */
export const PHENOMENON_DISPLAY_ORDER = [
  "indecisive-meetings",
  "defect-frequency",
  "major-order-loss",
  "young-turnover",
  "defect-resolution-delay",
  "manager-distrust",
] as const;

export type CaseWorkspaceCatalog = {
  caseId: string;
  caseName: string;
  /** 案件共通POLARIS（将来: 永続化・編集） */
  defaultCasePolaris: string;
  phenomenonBundles: Record<string, PhenomenonWorkspaceBundle>;
};

const PHENOMENON_BUNDLES: Record<string, PhenomenonWorkspaceBundle> = {
  "young-turnover": {
    phenomenonId: "young-turnover",
    casePolaris:
      "若手が3年以上定着し、自律的に改善が回る。技術と人が継承される製造現場",
    targetState: "若手が安心して挑戦・成長できる組織",
  },
  "major-order-loss": {
    phenomenonId: "major-order-loss",
    casePolaris:
      "大型案件を継続受注し、提案力と挑戦が評価される。市場で選ばれる製造現場",
    targetState: "顧客から継続的に選ばれる組織",
  },
  "defect-frequency": {
    phenomenonId: "defect-frequency",
    casePolaris:
      "不具合を現場で止め、再発防止の学習が回る。品質が自走する製造現場",
    targetState: "品質で信頼される製造組織",
  },
  "defect-resolution-delay": {
    phenomenonId: "defect-resolution-delay",
    casePolaris:
      "不具合を素早く解決し、顧客信頼を守る。原因究明が組織能力になる現場",
    targetState: "不具合が素早く解決され顧客信頼が守られる組織",
  },
  "manager-distrust": {
    phenomenonId: "manager-distrust",
    casePolaris:
      "管理職を信頼し、本音で相談できる。心理的安全性のある製造現場",
    targetState: "管理職を信頼し本音で相談できる組織",
  },
  "indecisive-meetings": {
    phenomenonId: "indecisive-meetings",
    casePolaris:
      "会議で決め、実行が止まらない。決裁と責任が明示される製造現場",
    targetState: "決める・実行する・振り返る文化",
  },
};

const DEFAULT_BUNDLE: PhenomenonWorkspaceBundle = {
  phenomenonId: "unknown",
  casePolaris: "（この現象のPOLARIS視点は準備中です）",
  targetState: "（準備中）",
};

/** MVP: A社単一案件。将来 caseId でルックアップ */
export const CASE_WORKSPACE_CATALOG: CaseWorkspaceCatalog = {
  caseId: "case-a-org-reform",
  caseName: "A社 — 組織改革",
  defaultCasePolaris:
    "自律的に改善が回り、技術と人が継承される製造現場",
  phenomenonBundles: PHENOMENON_BUNDLES,
};

export function getPhenomenonWorkspaceBundle(
  phenomenonId: string,
): PhenomenonWorkspaceBundle {
  return PHENOMENON_BUNDLES[phenomenonId] ?? DEFAULT_BUNDLE;
}

export function getCaseWorkspaceCatalog(): CaseWorkspaceCatalog {
  return CASE_WORKSPACE_CATALOG;
}

export function sortPhenomenaForDisplay<T extends { id: string }>(
  items: T[],
): T[] {
  const order = new Map(
    PHENOMENON_DISPLAY_ORDER.map((id, index) => [id, index]),
  );
  return [...items].sort(
    (a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999),
  );
}
