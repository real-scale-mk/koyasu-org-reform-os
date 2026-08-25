import { describe, expect, it } from "vitest";

import {
  PANE4_SUMMARY_UNCONFIRMED_DEFAULT,
  buildPane4SummaryReview,
} from "@/lib/koyasu/pane4-summary-review";
import {
  DEFAULT_PANE2_STEP1_HYPOTHESES,
  DEFAULT_PANE3_STEP3,
  DEFAULT_PANE4_V1,
  PANE3_STEP3_DEFAULT_PROPOSALS,
  pane3Step3Schema,
  pane4V1Schema,
} from "@/lib/koyasu/schema";

const emptyInput = {
  pane4V1: pane4V1Schema.parse(DEFAULT_PANE4_V1),
  pane3Step3: pane3Step3Schema.parse(DEFAULT_PANE3_STEP3),
  pane2Hypotheses: DEFAULT_PANE2_STEP1_HYPOTHESES.map((item) => ({ ...item })),
  selectedHypothesisIndexes: [] as number[],
};

describe("buildPane4SummaryReview", () => {
  it("未入力では default の未検証文と SKILL化=まだ早い を返す", () => {
    const model = buildPane4SummaryReview(emptyInput);

    expect(model.confirmed).toEqual([
      "今回の記録からは、確認できた事実がまだ十分に整理されていません。",
    ]);
    expect(model.unconfirmed).toEqual([PANE4_SUMMARY_UNCONFIRMED_DEFAULT]);
    expect(model.learningMemo.lesson).toBe("未入力");
    expect(model.returnDestination.selected).toBe(false);
    expect(model.returnDestination.destination).toBe("未選択");
    expect(model.encouragement).toContain("今回の記録はまだ途中です");
    expect(model.verification).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "構造仮説", status: "未判断" }),
        expect.objectContaining({ label: "介入設計", status: "未試行" }),
        expect.objectContaining({ label: "役割・後ろ盾", status: "未確認" }),
        expect.objectContaining({ label: "BABY STEP", status: "未実行" }),
        expect.objectContaining({ label: "次のGAP", status: "未入力" }),
        expect.objectContaining({ label: "戻り先", status: "未決定" }),
        expect.objectContaining({ label: "戦訓", status: "未入力" }),
        expect.objectContaining({ label: "SKILL化", status: "まだ早い" }),
      ]),
    );
  });

  it("入力済みの1件から確認・未検証・戻り先・戦訓を組み立てる", () => {
    const model = buildPane4SummaryReview({
      pane4V1: pane4V1Schema.parse({
        ...DEFAULT_PANE4_V1,
        step2: {
          execution_status: "partial",
          what_was_achieved: "期限は決まった",
          unexpected: "支援者が不在だった",
        },
        step3: {
          stumble_tags: ["権限不足"],
          what_worked: "記録フォーマットは使えた",
          what_blocked: "部門間の判断が止まった",
          new_gap: "支援者不在時の代替経路",
        },
        step4: {
          reviews: [
            {
              status: "partially_supported",
              rationale: "持ち帰りが再現した",
            },
            ...DEFAULT_PANE4_V1.step4.reviews.slice(1),
          ],
        },
        step5: {
          next_direction: "revise_baby_step",
          next_gap: "判断待ちを解消する経路",
          next_move: "支援者不在時の代理を先に決める",
          return_destination: "pane3_step2",
        },
        resistance_observation: {
          observed: "期限を決める案に慎重論が出た",
          background: "過去に責任だけ増えた経験がある",
          engagement_next: "支援者を先に明示してから巻き込む",
        },
        multi_perspective_review: {
          ...DEFAULT_PANE4_V1.multi_perspective_review,
          stability: {
            status: "ok",
            comment: "1件試行の負荷は許容範囲",
          },
          final_decision: "keep",
          final_reason: "戻り先はPane3-Step2のままでよい",
        },
        learning_memo: {
          lesson: "後ろ盾が無いと期限が閉じない",
          conditions: "管理職が同席する会議では通用しやすい",
          next_validation: "支援者不在時でも役割が残るか見る",
        },
      }),
      pane3Step3: pane3Step3Schema.parse({
        ...DEFAULT_PANE3_STEP3,
        what_to_try: {
          adopted_default: true,
          supplement: "",
          value: PANE3_STEP3_DEFAULT_PROPOSALS.what_to_try,
        },
        backing: {
          status: "confirmed",
          supplement: "工場長が部門間調整を担う",
        },
      }),
      pane2Hypotheses: [
        {
          structural_hypothesis: "決裁者が曖昧なため持ち帰りが再生産される",
          evidence: "持ち帰りが繰り返される",
          follow_up_question: "誰が最終判断を持っているか",
        },
        ...DEFAULT_PANE2_STEP1_HYPOTHESES.slice(1),
      ],
      selectedHypothesisIndexes: [0],
    });

    expect(model.confirmed.join("\n")).toContain("一部実行できた");
    expect(model.confirmed.join("\n")).toContain("記録フォーマットは使えた");
    expect(model.confirmed.join("\n")).toContain("後ろ盾は確認済み");
    expect(model.confirmed.join("\n")).toContain("当初の戻り先で進める");
    expect(model.confirmed.join("\n")).not.toMatch(/成功した/);

    expect(model.unconfirmed.join("\n")).toContain("一部支持にとどまり");
    expect(model.unconfirmed.join("\n")).toContain("支援者不在時の代替経路");
    expect(model.unconfirmed.join("\n")).toContain(
      "支援者不在時でも役割が残るか見る",
    );

    expect(model.cautions.join("\n")).toContain("部門間の判断が止まった");
    expect(model.cautions.join("\n")).toContain("期限を決める案に慎重論が出た");
    expect(model.cautions.join("\n")).toContain(
      "管理職が同席する会議では通用しやすい",
    );

    expect(model.returnDestination).toMatchObject({
      selected: true,
      destination: "Pane3-Step2",
      action: "役割・権限・後ろ盾を見直す",
      finalDecision: "当初の戻り先で進める",
      finalReason: "戻り先はPane3-Step2のままでよい",
    });

    expect(model.learningMemo.lesson).toBe("後ろ盾が無いと期限が閉じない");
    expect(model.encouragement).toContain("記録フォーマットは使えた");
    expect(model.encouragement).toContain("どの条件で崩れるのか");

    expect(model.verification).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "構造仮説", status: "一部支持" }),
        expect.objectContaining({ label: "介入設計", status: "今回試行済み" }),
        expect.objectContaining({ label: "役割・後ろ盾", status: "確認済み" }),
        expect.objectContaining({ label: "BABY STEP", status: "一部" }),
        expect.objectContaining({ label: "次のGAP", status: "抽出済み" }),
        expect.objectContaining({ label: "戻り先", status: "決定済み" }),
        expect.objectContaining({ label: "戦訓", status: "記録済み" }),
        expect.objectContaining({ label: "SKILL化", status: "まだ早い" }),
      ]),
    );
  });

  it("未実行・再検討・次の実験で後押しコメントのパターンが分かれる", () => {
    const notDone = buildPane4SummaryReview({
      ...emptyInput,
      pane4V1: pane4V1Schema.parse({
        ...DEFAULT_PANE4_V1,
        step2: {
          ...DEFAULT_PANE4_V1.step2,
          execution_status: "not_done",
        },
      }),
    });
    expect(notDone.encouragement).toContain("実行できなかった");

    const reconsider = buildPane4SummaryReview({
      ...emptyInput,
      pane4V1: pane4V1Schema.parse({
        ...DEFAULT_PANE4_V1,
        step1: {
          ...DEFAULT_PANE4_V1.step1,
          what_was_done: "役割を記録した",
        },
        multi_perspective_review: {
          ...DEFAULT_PANE4_V1.multi_perspective_review,
          final_decision: "reconsider",
        },
      }),
    });
    expect(reconsider.encouragement).toContain("戻り先を再検討する");

    const nextStep = buildPane4SummaryReview({
      ...emptyInput,
      pane4V1: pane4V1Schema.parse({
        ...DEFAULT_PANE4_V1,
        step2: {
          ...DEFAULT_PANE4_V1.step2,
          execution_status: "done",
        },
        step5: {
          ...DEFAULT_PANE4_V1.step5,
          return_destination: "next_baby_step",
        },
      }),
    });
    expect(nextStep.encouragement).toContain("次の実験へ進む");
    expect(nextStep.returnDestination.destination).toBe("次のBABY STEP");
  });

  it("構造仮説の検証バッジは見直しを優先する", () => {
    const model = buildPane4SummaryReview({
      ...emptyInput,
      pane2Hypotheses: [
        {
          structural_hypothesis: "仮説A",
          evidence: "",
          follow_up_question: "",
        },
        {
          structural_hypothesis: "仮説B",
          evidence: "",
          follow_up_question: "",
        },
        {
          structural_hypothesis: "仮説C",
          evidence: "",
          follow_up_question: "",
        },
      ],
      selectedHypothesisIndexes: [0, 1],
      pane4V1: pane4V1Schema.parse({
        ...DEFAULT_PANE4_V1,
        step4: {
          reviews: [
            { status: "supported", rationale: "" },
            { status: "needs_revision", rationale: "" },
            { status: "undecided", rationale: "" },
          ],
        },
      }),
    });

    expect(
      model.verification.find((item) => item.label === "構造仮説")?.status,
    ).toBe("見直し");
    expect(model.unconfirmed.join("\n")).toContain("見直しが必要");
  });
});
