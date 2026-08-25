import { describe, expect, it } from "vitest";

import {
  caseStorageSchema,
  DEFAULT_PANE1_INTAKE,
  DEFAULT_PANE2_STEP1_HYPOTHESES,
  DEFAULT_PANE2_STEP2,
  DEFAULT_PANE2_STEP3,
  DEFAULT_PANE3_STEP1,
  DEFAULT_PANE3_STEP1_ENTRY,
  DEFAULT_PANE3_STEP2,
  DEFAULT_PANE3_STEP2_ROLE_FIELDS,
  DEFAULT_PANE3_STEP3,
  DEFAULT_PANE3_STEP3_BACKING,
  DEFAULT_PANE3_STEP3_FIELD,
  DEFAULT_PANE4_V1,
  type KoyasuCaseSeed,
} from "@/lib/koyasu/schema";
import { loadCaseStorage, saveCaseStorage } from "@/lib/koyasu/storage";

const legacyCaseV1 = {
  case_a00: "自律的に改善が回り、技術と人が継承される製造現場",
  selected_phenomenon_id: "young-turnover",
  phenomena: [
    {
      id: "young-turnover",
      label: "若手離職",
      target_state: "3年定着率が業界平均以上",
      importance: "高",
      status: "分析中",
      memo: "既存メモ",
    },
  ],
};

const seed: KoyasuCaseSeed = {
  toolName: "小安式 組織改革OS",
  caseName: "テスト案件",
  case_a00: "seed A00",
  selected_phenomenon_id: "young-turnover",
  phenomena: legacyCaseV1.phenomena,
  perspectives: [],
  perspectiveDetails: {},
  relevanceByPhenomenonId: {},
  leverageByPhenomenonId: {},
  outcomesByPhenomenonId: {},
};

describe("caseStorageSchema pane1/pane2 後方互換", () => {
  it("旧 koyasu:case:v1（pane1_intake / pane2_step1 なし）でも safeParse 成功する", () => {
    const result = caseStorageSchema.safeParse(legacyCaseV1);
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.case_a00).toBe(legacyCaseV1.case_a00);
    expect(result.data.selected_phenomenon_id).toBe(
      legacyCaseV1.selected_phenomenon_id,
    );
    expect(result.data.phenomena).toEqual(legacyCaseV1.phenomena);
    expect(result.data.pane1_intake).toEqual(DEFAULT_PANE1_INTAKE);
    expect(result.data.pane2_step1).toEqual({
      hypotheses: [...DEFAULT_PANE2_STEP1_HYPOTHESES],
    });
    expect(result.data.pane2_step2).toEqual(DEFAULT_PANE2_STEP2);
    expect(result.data.pane2_step3).toEqual(DEFAULT_PANE2_STEP3);
    expect(result.data.pane3_step1).toEqual(DEFAULT_PANE3_STEP1);
    expect(result.data.pane3_step2).toEqual(DEFAULT_PANE3_STEP2);
    expect(result.data.pane3_step3).toEqual(DEFAULT_PANE3_STEP3);
    expect(result.data.pane4_v1).toEqual(DEFAULT_PANE4_V1);
  });

  it("部分的な pane1_intake は欠落フィールドを default で補完する", () => {
    const result = caseStorageSchema.safeParse({
      ...legacyCaseV1,
      pane1_intake: {
        discomfort: "誰も自分の問題として動かない",
        as_is: "現状の記述",
      },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.pane1_intake.discomfort).toBe(
      "誰も自分の問題として動かない",
    );
    expect(result.data.pane1_intake.as_is).toBe("現状の記述");
    expect(result.data.pane1_intake.to_be).toBe("");
    expect(result.data.pane1_intake.gap).toBe("");
    expect(result.data.pane1_intake.core_phenomenon).toBe("");
    expect(result.data.pane1_intake.surface_phenomena).toEqual([]);
  });

  it("surface_phenomena が3件超でも parse し先頭3件に切り詰める", () => {
    const result = caseStorageSchema.safeParse({
      ...legacyCaseV1,
      pane1_intake: {
        surface_phenomena: ["a", "b", "c", "d"],
      },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.pane1_intake.surface_phenomena).toEqual(["a", "b", "c"]);
  });

  it("pane2_step1 は欠落フィールド補完と最大3件への正規化を行う", () => {
    const result = caseStorageSchema.safeParse({
      ...legacyCaseV1,
      pane2_step1: {
        hypotheses: [
          {
            structural_hypothesis: "仮説1",
          },
          {
            evidence: "根拠2",
          },
          {
            follow_up_question: "確認3",
          },
          {
            structural_hypothesis: "切り捨て対象",
          },
        ],
      },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.pane2_step1.hypotheses).toEqual([
      {
        structural_hypothesis: "仮説1",
        evidence: "",
        follow_up_question: "",
      },
      {
        structural_hypothesis: "",
        evidence: "根拠2",
        follow_up_question: "",
      },
      {
        structural_hypothesis: "",
        evidence: "",
        follow_up_question: "確認3",
      },
    ]);
  });

  it("既存フィールドを required のまま維持する（欠落で失敗）", () => {
    expect(caseStorageSchema.safeParse({}).success).toBe(false);
    expect(
      caseStorageSchema.safeParse({
        case_a00: "x",
        selected_phenomenon_id: "y",
      }).success,
    ).toBe(false);
  });
});

describe("loadCaseStorage / saveCaseStorage pane2_step1", () => {
  it("Pane2-Step1 を保存後に再読込しても pane1_intake を壊さず復元できる", () => {
    window.localStorage.clear();

    saveCaseStorage({
      case_a00: "saved A00",
      selected_phenomenon_id: "young-turnover",
      phenomena: legacyCaseV1.phenomena,
      pane1_intake: {
        ...DEFAULT_PANE1_INTAKE,
        core_phenomenon: "若手が育つ前に離職する",
        gap: "育成導線はある前提なのに、現場で機能していない",
      },
      pane2_step1: {
        hypotheses: [
          {
            structural_hypothesis: "意思決定が毎回持ち帰りになる",
            evidence: "会議後に再調整が常態化",
            follow_up_question: "誰が最終判断を持っているか",
          },
          ...DEFAULT_PANE2_STEP1_HYPOTHESES.slice(1),
        ],
      },
    });

    const loaded = loadCaseStorage(seed);
    expect(loaded.pane1_intake.core_phenomenon).toBe("若手が育つ前に離職する");
    expect(loaded.pane1_intake.gap).toBe(
      "育成導線はある前提なのに、現場で機能していない",
    );
    expect(loaded.pane2_step1.hypotheses[0]).toEqual({
      structural_hypothesis: "意思決定が毎回持ち帰りになる",
      evidence: "会議後に再調整が常態化",
      follow_up_question: "誰が最終判断を持っているか",
    });
    expect(loaded.pane2_step1.hypotheses).toHaveLength(3);
  });

  it("Pane2-Step2 の断絶点とメモを保存後に再読込しても pane1/pane2_step1 を壊さない", () => {
    window.localStorage.clear();

    saveCaseStorage({
      case_a00: "saved A00",
      selected_phenomenon_id: "young-turnover",
      phenomena: legacyCaseV1.phenomena,
      pane1_intake: {
        ...DEFAULT_PANE1_INTAKE,
        gap: "責任連鎖が成立していない",
      },
      pane2_step1: {
        hypotheses: [...DEFAULT_PANE2_STEP1_HYPOTHESES],
      },
      pane2_step2: {
        breaks: [
          { transition_id: "2-3", memo: "共有後に推進責任者が決まらない" },
          { transition_id: "5-6", memo: "意思決定が遅れ実行が止まる" },
        ],
      },
    });

    const loaded = loadCaseStorage(seed);
    expect(loaded.pane1_intake.gap).toBe("責任連鎖が成立していない");
    expect(loaded.pane2_step2.breaks).toEqual([
      { transition_id: "2-3", memo: "共有後に推進責任者が決まらない" },
      { transition_id: "5-6", memo: "意思決定が遅れ実行が止まる" },
    ]);
  });

  it("pane2_step2 省略保存時は既存 localStorage の値を維持する", () => {
    window.localStorage.clear();

    saveCaseStorage({
      case_a00: "saved A00",
      selected_phenomenon_id: "young-turnover",
      phenomena: legacyCaseV1.phenomena,
      pane2_step2: {
        breaks: [{ transition_id: "3-4", memo: "担当が曖昧" }],
      },
    });

    saveCaseStorage({
      case_a00: "saved A00",
      selected_phenomenon_id: "young-turnover",
      phenomena: legacyCaseV1.phenomena,
      pane1_intake: {
        ...DEFAULT_PANE1_INTAKE,
        core_phenomenon: "更新後",
      },
    });

    const loaded = loadCaseStorage(seed);
    expect(loaded.pane1_intake.core_phenomenon).toBe("更新後");
    expect(loaded.pane2_step2.breaks).toEqual([
      { transition_id: "3-4", memo: "担当が曖昧" },
    ]);
  });

  it("Pane2-Step3 の評価と Pane3 候補を保存後に再読込しても他ペイロードを壊さない", () => {
    window.localStorage.clear();

    saveCaseStorage({
      case_a00: "saved A00",
      selected_phenomenon_id: "young-turnover",
      phenomena: legacyCaseV1.phenomena,
      pane1_intake: {
        ...DEFAULT_PANE1_INTAKE,
        gap: "責任連鎖が成立していない",
      },
      pane2_step1: {
        hypotheses: [...DEFAULT_PANE2_STEP1_HYPOTHESES],
      },
      pane2_step2: {
        breaks: [{ transition_id: "2-3", memo: "推進責任者不在" }],
      },
      pane2_step3: {
        evaluations: [
          {
            explanatory_power: "高",
            intervene_ability: "低",
            priority_reason: "説明力は高いが権限構造で止められやすい",
          },
          {
            explanatory_power: "中",
            intervene_ability: "高",
            priority_reason: "小さく試せる",
          },
          {
            explanatory_power: "低",
            intervene_ability: "中",
            priority_reason: "",
          },
        ],
        selected_for_pane3: [0, 1],
      },
    });

    const loaded = loadCaseStorage(seed);
    expect(loaded.pane1_intake.gap).toBe("責任連鎖が成立していない");
    expect(loaded.pane2_step2.breaks).toEqual([
      { transition_id: "2-3", memo: "推進責任者不在" },
    ]);
    expect(loaded.pane2_step3.evaluations[0]).toEqual({
      explanatory_power: "高",
      intervene_ability: "低",
      priority_reason: "説明力は高いが権限構造で止められやすい",
    });
    expect(loaded.pane2_step3.selected_for_pane3).toEqual([0, 1]);
  });

  it("pane2_step3 省略保存時は既存 localStorage の値を維持する", () => {
    window.localStorage.clear();

    saveCaseStorage({
      case_a00: "saved A00",
      selected_phenomenon_id: "young-turnover",
      phenomena: legacyCaseV1.phenomena,
      pane2_step3: {
        evaluations: [
          {
            explanatory_power: "高",
            intervene_ability: "中",
            priority_reason: "維持確認",
          },
          ...DEFAULT_PANE2_STEP3.evaluations.slice(1),
        ],
        selected_for_pane3: [0],
      },
    });

    saveCaseStorage({
      case_a00: "saved A00",
      selected_phenomenon_id: "young-turnover",
      phenomena: legacyCaseV1.phenomena,
      pane2_step2: {
        breaks: [{ transition_id: "4-5", memo: "支援不足" }],
      },
    });

    const loaded = loadCaseStorage(seed);
    expect(loaded.pane2_step2.breaks).toEqual([
      { transition_id: "4-5", memo: "支援不足" },
    ]);
    expect(loaded.pane2_step3.evaluations[0].priority_reason).toBe("維持確認");
    expect(loaded.pane2_step3.selected_for_pane3).toEqual([0]);
  });

  it("pane2_step3 は selected_for_pane3 を最大2件に正規化する", () => {
    const result = caseStorageSchema.safeParse({
      ...legacyCaseV1,
      pane2_step3: {
        evaluations: DEFAULT_PANE2_STEP3.evaluations,
        selected_for_pane3: [0, 1, 2, 1, -1, 9],
      },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.pane2_step3.selected_for_pane3).toEqual([0, 1]);
  });
});

describe("loadCaseStorage / saveCaseStorage pane3_step1", () => {
  it("Pane3-Step1 を保存後に再読込しても pane1/pane2 を壊さず復元できる", () => {
    window.localStorage.clear();

    saveCaseStorage({
      case_a00: "saved A00",
      selected_phenomenon_id: "young-turnover",
      phenomena: legacyCaseV1.phenomena,
      pane1_intake: {
        ...DEFAULT_PANE1_INTAKE,
        gap: "責任連鎖が成立していない",
      },
      pane2_step3: {
        evaluations: DEFAULT_PANE2_STEP3.evaluations,
        selected_for_pane3: [0, 1],
      },
      pane3_step1: {
        entries: [
          {
            structural_core_candidate:
              "決裁・期限・担当が会議で閉じない構造",
            first_entry_candidate:
              "会議の最後に決裁者・期限・担当を記録で閉じる",
            why_start_here:
              "上流が閉じないと下流のやり直しが再生産される",
          },
          {
            structural_core_candidate: "共有後に推進責任者が決まらない断絶",
            first_entry_candidate:
              "起票後24時間以内に推進責任者を決めるルール",
            why_start_here: "共有止まりを止める接続点だから",
          },
          { ...DEFAULT_PANE3_STEP1_ENTRY },
        ],
      },
    });

    const loaded = loadCaseStorage(seed);
    expect(loaded.pane1_intake.gap).toBe("責任連鎖が成立していない");
    expect(loaded.pane2_step3.selected_for_pane3).toEqual([0, 1]);
    expect(loaded.pane3_step1.entries[0]).toEqual({
      structural_core_candidate: "決裁・期限・担当が会議で閉じない構造",
      first_entry_candidate:
        "会議の最後に決裁者・期限・担当を記録で閉じる",
      why_start_here: "上流が閉じないと下流のやり直しが再生産される",
    });
    expect(loaded.pane3_step1.entries[1].first_entry_candidate).toBe(
      "起票後24時間以内に推進責任者を決めるルール",
    );
    expect(loaded.pane3_step1.entries).toHaveLength(3);
  });

  it("pane3_step1 省略保存時は既存 localStorage の値を維持する", () => {
    window.localStorage.clear();

    saveCaseStorage({
      case_a00: "saved A00",
      selected_phenomenon_id: "young-turnover",
      phenomena: legacyCaseV1.phenomena,
      pane3_step1: {
        entries: [
          {
            structural_core_candidate: "維持される本丸",
            first_entry_candidate: "維持される最初の一手",
            why_start_here: "維持理由",
          },
          ...DEFAULT_PANE3_STEP1.entries.slice(1),
        ],
      },
    });

    saveCaseStorage({
      case_a00: "saved A00",
      selected_phenomenon_id: "young-turnover",
      phenomena: legacyCaseV1.phenomena,
      pane2_step3: {
        evaluations: DEFAULT_PANE2_STEP3.evaluations,
        selected_for_pane3: [0],
      },
    });

    const loaded = loadCaseStorage(seed);
    expect(loaded.pane2_step3.selected_for_pane3).toEqual([0]);
    expect(loaded.pane3_step1.entries[0]).toEqual({
      structural_core_candidate: "維持される本丸",
      first_entry_candidate: "維持される最初の一手",
      why_start_here: "維持理由",
    });
  });

  it("旧 koyasu:case:v1（pane3_step1 なし）でも default が補われる", () => {
    const result = caseStorageSchema.safeParse(legacyCaseV1);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.pane3_step1).toEqual(DEFAULT_PANE3_STEP1);
  });

  it("旧 leverage_point / why は新フィールドへ移行する", () => {
    const result = caseStorageSchema.safeParse({
      ...legacyCaseV1,
      pane3_step1: {
        entries: [
          {
            leverage_point: "会議の最後に決裁者・期限・担当を記録で閉じる",
            why: "上流が閉じないと下流のやり直しが再生産される",
          },
          { leverage_point: "起票後の推進責任者ルール", why: "" },
          {},
        ],
      },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.pane3_step1.entries[0]).toEqual({
      structural_core_candidate: "",
      first_entry_candidate:
        "会議の最後に決裁者・期限・担当を記録で閉じる",
      why_start_here: "上流が閉じないと下流のやり直しが再生産される",
    });
    expect(result.data.pane3_step1.entries[1]).toEqual({
      structural_core_candidate: "",
      first_entry_candidate: "起票後の推進責任者ルール",
      why_start_here: "",
    });
    expect(result.data.pane3_step1.entries[2]).toEqual(DEFAULT_PANE3_STEP1_ENTRY);
  });

  it("新フィールドがある場合は旧 leverage_point より優先する", () => {
    const result = caseStorageSchema.safeParse({
      ...legacyCaseV1,
      pane3_step1: {
        entries: [
          {
            structural_core_candidate: "本丸候補",
            first_entry_candidate: "最初の一手",
            why_start_here: "理由",
            leverage_point: "旧レバレッジは無視",
            why: "旧whyは無視",
          },
          {},
          {},
        ],
      },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.pane3_step1.entries[0]).toEqual({
      structural_core_candidate: "本丸候補",
      first_entry_candidate: "最初の一手",
      why_start_here: "理由",
    });
  });
});

describe("loadCaseStorage / saveCaseStorage pane3_step2", () => {
  it("Pane3-Step2 を保存後に再読込しても pane1/pane2/pane3_step1 を壊さず復元できる", () => {
    window.localStorage.clear();

    saveCaseStorage({
      case_a00: "saved A00",
      selected_phenomenon_id: "young-turnover",
      phenomena: legacyCaseV1.phenomena,
      pane1_intake: {
        ...DEFAULT_PANE1_INTAKE,
        gap: "責任連鎖が成立していない",
      },
      pane2_step3: {
        evaluations: DEFAULT_PANE2_STEP3.evaluations,
        selected_for_pane3: [0, 1],
      },
      pane3_step1: {
        entries: [
          {
            structural_core_candidate: "本丸",
            first_entry_candidate: "会議の最後に閉じる",
            why_start_here: "上流から",
          },
          {
            structural_core_candidate: "断絶",
            first_entry_candidate: "起票後の推進責任者ルール",
            why_start_here: "接続点",
          },
          { ...DEFAULT_PANE3_STEP1_ENTRY },
        ],
      },
      pane3_step2: {
        entries: [
          {
            roles: {
              discovery: {
                owns: "つまずきを起票する",
                completion_criteria: "起票が渡った",
                support_authority: "起票テンプレ",
              },
              driver: {
                owns: "詰まりを外す",
                completion_criteria: "実務が着手できる",
                support_authority: "横断調整権限",
              },
              practitioner: {
                owns: "手順を実行する",
                completion_criteria: "記録を出す",
                support_authority: "作業時間の確保",
              },
              supporter: {
                owns: "承認を出す",
                completion_criteria: "期限内に可否を返す",
                support_authority: "裁量範囲の明示",
              },
            },
          },
          {
            roles: {
              discovery: {
                ...DEFAULT_PANE3_STEP2_ROLE_FIELDS,
                owns: "仮説2の発見",
              },
              driver: { ...DEFAULT_PANE3_STEP2_ROLE_FIELDS },
              practitioner: { ...DEFAULT_PANE3_STEP2_ROLE_FIELDS },
              supporter: { ...DEFAULT_PANE3_STEP2_ROLE_FIELDS },
            },
          },
          {
            roles: {
              discovery: { ...DEFAULT_PANE3_STEP2_ROLE_FIELDS },
              driver: { ...DEFAULT_PANE3_STEP2_ROLE_FIELDS },
              practitioner: { ...DEFAULT_PANE3_STEP2_ROLE_FIELDS },
              supporter: { ...DEFAULT_PANE3_STEP2_ROLE_FIELDS },
            },
          },
        ],
      },
    });

    const loaded = loadCaseStorage(seed);
    expect(loaded.pane1_intake.gap).toBe("責任連鎖が成立していない");
    expect(loaded.pane3_step1.entries[0].first_entry_candidate).toBe(
      "会議の最後に閉じる",
    );
    expect(loaded.pane3_step2.entries[0].roles.discovery).toEqual({
      adopted_default: false,
      supplement: "",
      owns: "つまずきを起票する",
      completion_criteria: "起票が渡った",
      support_authority: "起票テンプレ",
    });
    expect(loaded.pane3_step2.roles.discovery).toEqual({
      adopted_default: false,
      supplement: "",
      owns: "つまずきを起票する",
      completion_criteria: "起票が渡った",
      support_authority: "起票テンプレ",
    });
    expect(loaded.pane3_step2.entries[0].roles.supporter.owns).toBe(
      "承認を出す",
    );
    expect(loaded.pane3_step2.entries[1].roles.discovery.owns).toBe(
      "仮説2の発見",
    );
    expect(loaded.pane3_step2.entries).toHaveLength(3);
  });

  it("pane3_step2 省略保存時は既存 localStorage の値を維持する", () => {
    window.localStorage.clear();

    saveCaseStorage({
      case_a00: "saved A00",
      selected_phenomenon_id: "young-turnover",
      phenomena: legacyCaseV1.phenomena,
      pane3_step2: {
        entries: [
          {
            roles: {
              discovery: {
                owns: "維持される引き受け",
                completion_criteria: "維持完了条件",
                support_authority: "維持支援",
              },
              driver: { ...DEFAULT_PANE3_STEP2_ROLE_FIELDS },
              practitioner: { ...DEFAULT_PANE3_STEP2_ROLE_FIELDS },
              supporter: { ...DEFAULT_PANE3_STEP2_ROLE_FIELDS },
            },
          },
          ...DEFAULT_PANE3_STEP2.entries.slice(1),
        ],
      },
    });

    saveCaseStorage({
      case_a00: "saved A00",
      selected_phenomenon_id: "young-turnover",
      phenomena: legacyCaseV1.phenomena,
      pane3_step1: {
        entries: [
          {
            structural_core_candidate: "別更新",
            first_entry_candidate: "場面",
            why_start_here: "理由",
          },
          ...DEFAULT_PANE3_STEP1.entries.slice(1),
        ],
      },
    });

    const loaded = loadCaseStorage(seed);
    expect(loaded.pane3_step1.entries[0].structural_core_candidate).toBe(
      "別更新",
    );
    expect(loaded.pane3_step2.entries[0].roles.discovery).toEqual({
      adopted_default: false,
      supplement: "",
      owns: "維持される引き受け",
      completion_criteria: "維持完了条件",
      support_authority: "維持支援",
    });
  });

  it("旧 koyasu:case:v1（pane3_step2 なし）でも default が補われる", () => {
    const result = caseStorageSchema.safeParse(legacyCaseV1);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.pane3_step2).toEqual(DEFAULT_PANE3_STEP2);
  });

  it("不完全な roles でも欠けた役割フィールドを default で補う", () => {
    const result = caseStorageSchema.safeParse({
      ...legacyCaseV1,
      pane3_step2: {
        entries: [
          {
            roles: {
              discovery: { owns: "発見のみ" },
            },
          },
        ],
      },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.pane3_step2.entries[0].roles.discovery).toEqual({
      adopted_default: false,
      supplement: "",
      owns: "発見のみ",
      completion_criteria: "",
      support_authority: "",
    });
    expect(result.data.pane3_step2.entries[0].roles.driver).toEqual(
      DEFAULT_PANE3_STEP2_ROLE_FIELDS,
    );
    expect(result.data.pane3_step2.entries).toHaveLength(3);
  });

  it("Pane3-Step2 の基本案採用と補足を保存後に再読込できる", () => {
    window.localStorage.clear();

    saveCaseStorage({
      case_a00: "saved A00",
      selected_phenomenon_id: "young-turnover",
      phenomena: legacyCaseV1.phenomena,
      pane3_step2: {
        roles: {
          discovery: {
            adopted_default: true,
            supplement: "起票はTeamsチャネル経由",
            owns: "",
            completion_criteria: "",
            support_authority: "",
          },
          driver: { ...DEFAULT_PANE3_STEP2_ROLE_FIELDS, adopted_default: true },
          practitioner: { ...DEFAULT_PANE3_STEP2_ROLE_FIELDS },
          supporter: { ...DEFAULT_PANE3_STEP2_ROLE_FIELDS },
        },
        entries: DEFAULT_PANE3_STEP2.entries,
      },
    });

    const loaded = loadCaseStorage(seed);
    expect(loaded.pane3_step2.roles.discovery).toEqual({
      adopted_default: true,
      supplement: "起票はTeamsチャネル経由",
      owns: "",
      completion_criteria: "",
      support_authority: "",
    });
    expect(loaded.pane3_step2.entries[0].roles.discovery).toEqual(
      loaded.pane3_step2.roles.discovery,
    );
  });
});

describe("loadCaseStorage / saveCaseStorage pane3_step3", () => {
  it("Pane3-Step3 を保存後に再読込しても pane1/pane2/pane3_step1/pane3_step2 を壊さず復元できる", () => {
    window.localStorage.clear();

    saveCaseStorage({
      case_a00: "saved A00",
      selected_phenomenon_id: "young-turnover",
      phenomena: legacyCaseV1.phenomena,
      pane3_step1: {
        entries: [
          {
            structural_core_candidate: "本丸",
            first_entry_candidate: "会議の最後に閉じる",
            why_start_here: "上流から",
          },
          ...DEFAULT_PANE3_STEP1.entries.slice(1),
        ],
      },
      pane3_step2: {
        roles: {
          discovery: {
            ...DEFAULT_PANE3_STEP2_ROLE_FIELDS,
            adopted_default: true,
          },
          driver: { ...DEFAULT_PANE3_STEP2_ROLE_FIELDS },
          practitioner: { ...DEFAULT_PANE3_STEP2_ROLE_FIELDS },
          supporter: { ...DEFAULT_PANE3_STEP2_ROLE_FIELDS },
        },
        entries: DEFAULT_PANE3_STEP2.entries,
      },
      pane3_step3: {
        ...DEFAULT_PANE3_STEP3,
        what_to_try: {
          adopted_default: true,
          supplement: "Teamsで記録",
          value: "",
        },
        who_does_it: {
          ...DEFAULT_PANE3_STEP3_FIELD,
          value: "品質管理リーダー",
        },
        when_to_do: { ...DEFAULT_PANE3_STEP3_FIELD, adopted_default: true },
        success_criteria: { ...DEFAULT_PANE3_STEP3_FIELD },
        backing: {
          status: "confirmed",
          supplement: "品質部長が支持",
        },
      },
    });

    const loaded = loadCaseStorage(seed);
    expect(loaded.pane3_step1.entries[0].first_entry_candidate).toBe(
      "会議の最後に閉じる",
    );
    expect(loaded.pane3_step2.roles.discovery.adopted_default).toBe(true);
    expect(loaded.pane3_step3.what_to_try).toEqual({
      adopted_default: true,
      supplement: "Teamsで記録",
      value: "",
    });
    expect(loaded.pane3_step3.who_does_it.value).toBe("品質管理リーダー");
    expect(loaded.pane3_step3.when_to_do.adopted_default).toBe(true);
    expect(loaded.pane3_step3.backing).toEqual({
      status: "confirmed",
      supplement: "品質部長が支持",
    });
  });

  it("pane3_step3 省略保存時は既存 localStorage の値を維持する", () => {
    window.localStorage.clear();

    saveCaseStorage({
      case_a00: "saved A00",
      selected_phenomenon_id: "young-turnover",
      phenomena: legacyCaseV1.phenomena,
      pane3_step3: {
        ...DEFAULT_PANE3_STEP3,
        what_to_try: {
          ...DEFAULT_PANE3_STEP3_FIELD,
          value: "維持される試行内容",
        },
        backing: {
          status: "confirmed",
          supplement: "維持される後ろ盾",
        },
      },
    });

    saveCaseStorage({
      case_a00: "saved A00",
      selected_phenomenon_id: "young-turnover",
      phenomena: legacyCaseV1.phenomena,
      pane3_step2: {
        roles: {
          discovery: {
            ...DEFAULT_PANE3_STEP2_ROLE_FIELDS,
            adopted_default: true,
          },
          driver: { ...DEFAULT_PANE3_STEP2_ROLE_FIELDS },
          practitioner: { ...DEFAULT_PANE3_STEP2_ROLE_FIELDS },
          supporter: { ...DEFAULT_PANE3_STEP2_ROLE_FIELDS },
        },
        entries: DEFAULT_PANE3_STEP2.entries,
      },
    });

    const loaded = loadCaseStorage(seed);
    expect(loaded.pane3_step3.what_to_try.value).toBe("維持される試行内容");
    expect(loaded.pane3_step3.backing).toEqual({
      status: "confirmed",
      supplement: "維持される後ろ盾",
    });
    expect(loaded.pane3_step2.roles.discovery.adopted_default).toBe(true);
  });

  it("旧 koyasu:case:v1（pane3_step3 なし）でも default が補われる", () => {
    const result = caseStorageSchema.safeParse(legacyCaseV1);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.pane3_step3).toEqual(DEFAULT_PANE3_STEP3);
  });

  it("不完全な pane3_step3 でも欠けたフィールドを default で補う", () => {
    const result = caseStorageSchema.safeParse({
      ...legacyCaseV1,
      pane3_step3: {
        what_to_try: { value: "試すことのみ" },
      },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.pane3_step3.what_to_try).toEqual({
      adopted_default: false,
      supplement: "",
      value: "試すことのみ",
    });
    expect(result.data.pane3_step3.who_does_it).toEqual(
      DEFAULT_PANE3_STEP3_FIELD,
    );
    expect(result.data.pane3_step3.backing).toEqual(
      DEFAULT_PANE3_STEP3_BACKING,
    );
  });
});

describe("loadCaseStorage / saveCaseStorage pane4_v1", () => {
  it("Pane4 V1 を保存後に再読込しても pane3_step3 を壊さない", () => {
    window.localStorage.clear();

    saveCaseStorage({
      case_a00: "saved A00",
      selected_phenomenon_id: "young-turnover",
      phenomena: legacyCaseV1.phenomena,
      pane3_step3: {
        ...DEFAULT_PANE3_STEP3,
        what_to_try: {
          ...DEFAULT_PANE3_STEP3_FIELD,
          value: "維持される試行",
        },
      },
      pane4_v1: {
        ...DEFAULT_PANE4_V1,
        step1: {
          what_was_done: "初動会議で役割を記録した",
          what_differed: "実務担当が代理になった",
        },
        step2: {
          execution_status: "partial",
          what_was_achieved: "期限だけ決まった",
          unexpected: "支援者が不在だった",
        },
        step3: {
          stumble_tags: ["権限不足", "判断待ち", "権限不足", "不明なタグ"],
          what_worked: "記録フォーマットは使えた",
          what_blocked: "部門間の判断が止まっていた",
          new_gap: "支援責任者が不在のときの代替経路",
        },
        step4: {
          reviews: [
            {
              status: "partially_supported",
              rationale: "決裁が閉じない場面は再現した",
            },
            { ...DEFAULT_PANE4_V1.step4.reviews[1] },
            { ...DEFAULT_PANE4_V1.step4.reviews[2] },
          ],
        },
        step5: {
          next_direction: "revise_baby_step",
          next_gap: "判断待ちを解消する経路",
          next_move: "支援者不在時の代理を先に決める",
          return_destination: "pane2",
        },
      },
    });

    const loaded = loadCaseStorage(seed);
    expect(loaded.pane3_step3.what_to_try.value).toBe("維持される試行");
    expect(loaded.pane4_v1.step1.what_was_done).toBe(
      "初動会議で役割を記録した",
    );
    expect(loaded.pane4_v1.step2.execution_status).toBe("partial");
    expect(loaded.pane4_v1.step3.stumble_tags).toEqual([
      "権限不足",
      "判断待ち",
    ]);
    expect(loaded.pane4_v1.step4.reviews[0]).toEqual({
      status: "partially_supported",
      rationale: "決裁が閉じない場面は再現した",
    });
    expect(loaded.pane4_v1.step5.next_direction).toBe("revise_baby_step");
    expect(loaded.pane4_v1.step5.return_destination).toBe("pane2");
  });

  it("pane4_v1 省略保存時は既存 localStorage の値を維持する", () => {
    window.localStorage.clear();

    saveCaseStorage({
      case_a00: "saved A00",
      selected_phenomenon_id: "young-turnover",
      phenomena: legacyCaseV1.phenomena,
      pane4_v1: {
        ...DEFAULT_PANE4_V1,
        step5: {
          ...DEFAULT_PANE4_V1.step5,
          next_gap: "維持される次のGAP",
        },
      },
    });

    saveCaseStorage({
      case_a00: "saved A00",
      selected_phenomenon_id: "young-turnover",
      phenomena: legacyCaseV1.phenomena,
      pane3_step3: {
        ...DEFAULT_PANE3_STEP3,
        what_to_try: {
          ...DEFAULT_PANE3_STEP3_FIELD,
          value: "後から保存した試行",
        },
      },
    });

    const loaded = loadCaseStorage(seed);
    expect(loaded.pane4_v1.step5.next_gap).toBe("維持される次のGAP");
    expect(loaded.pane3_step3.what_to_try.value).toBe("後から保存した試行");
  });

  it("旧 koyasu:case:v1（pane4_v1 なし）でも default が補われる", () => {
    const result = caseStorageSchema.safeParse(legacyCaseV1);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.pane4_v1).toEqual(DEFAULT_PANE4_V1);
  });

  it("不完全な pane4_v1 でも欠けたフィールドを default で補う", () => {
    const result = caseStorageSchema.safeParse({
      ...legacyCaseV1,
      pane4_v1: {
        step1: { what_was_done: "実施だけ記録" },
      },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.pane4_v1.step1).toEqual({
      what_was_done: "実施だけ記録",
      what_differed: "",
    });
    expect(result.data.pane4_v1.step2).toEqual(DEFAULT_PANE4_V1.step2);
    expect(result.data.pane4_v1.step4.reviews).toHaveLength(3);
    expect(result.data.pane4_v1.resistance_observation).toEqual(
      DEFAULT_PANE4_V1.resistance_observation,
    );
    expect(result.data.pane4_v1.multi_perspective_review).toEqual(
      DEFAULT_PANE4_V1.multi_perspective_review,
    );
    expect(result.data.pane4_v1.learning_memo).toEqual(
      DEFAULT_PANE4_V1.learning_memo,
    );
  });

  it("旧 pane4_v1.step5 に return_destination が無くても default で補う", () => {
    const result = caseStorageSchema.safeParse({
      ...legacyCaseV1,
      pane4_v1: {
        step5: {
          next_direction: "retry_same",
          next_gap: "既存のGAP",
          next_move: "既存の一手",
        },
      },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.pane4_v1.step5).toEqual({
      next_direction: "retry_same",
      return_destination: "",
      next_gap: "既存のGAP",
      next_move: "既存の一手",
    });
  });

  it("旧 pane4_v1 に抵抗観察・多視点レビュー・戦訓が無くても default で補う", () => {
    const result = caseStorageSchema.safeParse({
      ...legacyCaseV1,
      pane4_v1: {
        step1: {
          what_was_done: "実施だけ",
          what_differed: "",
        },
      },
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.pane4_v1.resistance_observation.observed).toBe("");
    expect(result.data.pane4_v1.multi_perspective_review.stability.status).toBe(
      "",
    );
    expect(result.data.pane4_v1.multi_perspective_review.final_decision).toBe(
      "",
    );
    expect(result.data.pane4_v1.learning_memo.lesson).toBe("");
  });

  it("Pane4 の抵抗観察・多視点レビュー・戦訓を保存後に再読込できる", () => {
    window.localStorage.clear();

    saveCaseStorage({
      case_a00: "saved A00",
      selected_phenomenon_id: "young-turnover",
      phenomena: legacyCaseV1.phenomena,
      pane4_v1: {
        ...DEFAULT_PANE4_V1,
        resistance_observation: {
          observed: "会議で期限を決める案に慎重論が出た",
          background: "過去に責任だけ増えた経験がある",
          engagement_next: "先に完了条件と支援者を明示してから巻き込む",
        },
        multi_perspective_review: {
          stability: {
            status: "ok",
            comment: "負荷は1件試行の範囲",
          },
          reform: {
            status: "reconsider",
            comment: "本丸を避けていないか確認したい",
          },
          standard: {
            status: "ok",
            comment: "Factの範囲で言える",
          },
          final_decision: "keep",
          final_reason: "戻り先はPane3-Step2のままでよい",
        },
        learning_memo: {
          lesson: "後ろ盾が無いと期限が閉じない",
          conditions: "管理職が同席している会議では通用しやすい",
          next_validation: "支援者不在時でも役割が残るか見る",
        },
      },
    });

    const loaded = loadCaseStorage(seed);
    expect(loaded.pane4_v1.resistance_observation.background).toBe(
      "過去に責任だけ増えた経験がある",
    );
    expect(loaded.pane4_v1.multi_perspective_review.reform.status).toBe(
      "reconsider",
    );
    expect(loaded.pane4_v1.multi_perspective_review.final_decision).toBe(
      "keep",
    );
    expect(loaded.pane4_v1.learning_memo.next_validation).toBe(
      "支援者不在時でも役割が残るか見る",
    );
  });
});
