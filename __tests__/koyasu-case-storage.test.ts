import { describe, expect, it } from "vitest";

import {
  caseStorageSchema,
  DEFAULT_PANE1_INTAKE,
} from "@/lib/koyasu/schema";

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

describe("caseStorageSchema pane1_intake 後方互換", () => {
  it("旧 koyasu:case:v1（pane1_intake なし）でも safeParse 成功する", () => {
    const result = caseStorageSchema.safeParse(legacyCaseV1);
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.case_a00).toBe(legacyCaseV1.case_a00);
    expect(result.data.selected_phenomenon_id).toBe(
      legacyCaseV1.selected_phenomenon_id,
    );
    expect(result.data.phenomena).toEqual(legacyCaseV1.phenomena);
    expect(result.data.pane1_intake).toEqual(DEFAULT_PANE1_INTAKE);
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
