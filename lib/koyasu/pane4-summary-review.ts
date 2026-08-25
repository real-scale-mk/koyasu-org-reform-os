import {
  PANE4_V1_EXECUTION_STATUS_LABELS,
  PANE4_V1_FINAL_DECISION_LABELS,
  PANE4_V1_RETURN_DESTINATION_DEFS,
  PANE4_V1_REVIEW_LENS_DEFS,
  type Pane2Hypothesis,
  type Pane3Step3,
  type Pane4V1,
  type Pane4V1HypothesisReviewStatusOrEmpty,
} from "@/lib/koyasu/schema";

export const PANE4_SUMMARY_UNCONFIRMED_DEFAULT =
  "今回の1件だけでは再現性・適用範囲までは判断できません。";

export const PANE4_SUMMARY_LEARNING_MEMO_NOTE =
  "これは1回の実践から得たLearning Memoです。複数回で再現性と適用条件が確認された段階でSKILL Candidateとして扱います。";

export const PANE4_SUMMARY_FUTURE_AI_NOTE =
  "将来は、Pane1〜4のFact・仮説・実行結果・戦訓をAIが横断的にレビューし、多視点サブエージェントの反証を含めた総括コメントへ発展させる構想です。";

export type Pane4SummaryReviewInput = {
  pane4V1: Pane4V1;
  pane3Step3: Pane3Step3;
  pane2Hypotheses: Pane2Hypothesis[];
  selectedHypothesisIndexes: number[];
};

export type Pane4SummaryVerificationTone = "default" | "secondary" | "outline";

export type Pane4SummaryVerificationItem = {
  label: string;
  status: string;
  tone: Pane4SummaryVerificationTone;
};

export type Pane4SummaryReviewModel = {
  encouragement: string;
  confirmed: string[];
  unconfirmed: string[];
  cautions: string[];
  returnDestination: {
    selected: boolean;
    destination: string;
    action: string;
    finalDecision: string;
    finalReason: string;
  };
  learningMemo: {
    lesson: string;
    conditions: string;
    nextValidation: string;
  };
  verification: Pane4SummaryVerificationItem[];
};

function clip(text: string, max = 40): string {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max)}…`;
}

function filled(text: string): boolean {
  return text.trim().length > 0;
}

function hypothesisLabel(hypotheses: Pane2Hypothesis[], index: number): string {
  const raw = hypotheses[index]?.structural_hypothesis.trim() ?? "";
  return raw || "Pane2でまだ未記入です";
}

function selectedReviews(input: Pane4SummaryReviewInput): Array<{
  index: number;
  label: string;
  status: Pane4V1HypothesisReviewStatusOrEmpty;
}> {
  return input.selectedHypothesisIndexes
    .filter((index) => index >= 0 && index < 3)
    .map((index) => ({
      index,
      label: hypothesisLabel(input.pane2Hypotheses, index),
      status: input.pane4V1.step4.reviews[index]?.status ?? "",
    }));
}

function summarizeHypothesisStatus(
  reviews: ReturnType<typeof selectedReviews>,
): string {
  if (reviews.length === 0) return "未判断";
  const statuses = reviews.map((review) => review.status);
  if (statuses.some((status) => status === "needs_revision")) return "見直し";
  if (statuses.some((status) => status === "partially_supported")) {
    return "一部支持";
  }
  if (statuses.some((status) => status === "undecided" || status === "")) {
    return "未判断";
  }
  if (statuses.every((status) => status === "supported")) return "支持";
  return "未判断";
}

function buildConfirmed(input: Pane4SummaryReviewInput): string[] {
  const { pane4V1, pane3Step3 } = input;
  const items: string[] = [];
  const execution = pane4V1.step2.execution_status;

  if (execution) {
    items.push(
      `今回の1件では、BABY STEPが「${PANE4_V1_EXECUTION_STATUS_LABELS[execution]}」ことが確認された。`,
    );
  }
  if (filled(pane4V1.step2.what_was_achieved)) {
    items.push(
      `得られたこととして、${clip(pane4V1.step2.what_was_achieved)}の可能性が示された。`,
    );
  }
  if (filled(pane4V1.step3.what_worked)) {
    items.push(
      `うまく機能したこととして、${clip(pane4V1.step3.what_worked)}の可能性が示された。`,
    );
  }

  for (const review of selectedReviews(input)) {
    if (review.status !== "supported") continue;
    items.push(
      `構造仮説「${clip(review.label, 24)}」は、今回の1件では支持された可能性が示された。`,
    );
  }

  if (pane3Step3.backing.status === "confirmed") {
    items.push("後ろ盾は確認済みとして記録されている。");
  }

  if (pane4V1.multi_perspective_review.final_decision === "keep") {
    items.push("最終判断は、当初の戻り先で進める、としている。");
  }

  if (items.length === 0) {
    return ["今回の記録からは、確認できた事実がまだ十分に整理されていません。"];
  }
  return items;
}

function buildUnconfirmed(input: Pane4SummaryReviewInput): string[] {
  const { pane4V1 } = input;
  const items: string[] = [];

  for (const review of selectedReviews(input)) {
    if (review.status === "partially_supported") {
      items.push(
        `構造仮説「${clip(review.label, 24)}」は、今回の1件では一部支持にとどまり、断定はできない。`,
      );
    } else if (review.status === "undecided" || review.status === "") {
      items.push(
        `構造仮説「${clip(review.label, 24)}」は、今回の1件ではまだ判断できない。`,
      );
    } else if (review.status === "needs_revision") {
      items.push(
        `構造仮説「${clip(review.label, 24)}」は、見直しが必要と記録されている。`,
      );
    }
  }

  if (filled(pane4V1.step3.new_gap)) {
    items.push(
      `新たに見えたGAP（${clip(pane4V1.step3.new_gap)}）は、今回の1件だけでは範囲を断定できない。`,
    );
  }
  if (filled(pane4V1.learning_memo.next_validation)) {
    items.push(
      `次に確かめたいこと（${clip(pane4V1.learning_memo.next_validation)}）は、まだ未検証である。`,
    );
  }

  if (items.length === 0) return [PANE4_SUMMARY_UNCONFIRMED_DEFAULT];
  return items;
}

function buildCautions(input: Pane4SummaryReviewInput): string[] {
  const { pane4V1 } = input;
  const items: string[] = [];

  if (filled(pane4V1.step3.what_blocked)) {
    items.push(`止まった／迷った点: ${clip(pane4V1.step3.what_blocked)}`);
  }
  if (filled(pane4V1.step2.unexpected)) {
    items.push(`想定外: ${clip(pane4V1.step2.unexpected)}`);
  }
  if (filled(pane4V1.resistance_observation.observed)) {
    items.push(`抵抗・懸念: ${clip(pane4V1.resistance_observation.observed)}`);
  }
  if (filled(pane4V1.resistance_observation.background)) {
    items.push(
      `抵抗の背景: ${clip(pane4V1.resistance_observation.background)}`,
    );
  }

  for (const lens of PANE4_V1_REVIEW_LENS_DEFS) {
    const review = pane4V1.multi_perspective_review[lens.id];
    if (review.status !== "reconsider") continue;
    const detail = filled(review.comment)
      ? `${lens.label}（${clip(review.comment, 32)}）`
      : lens.label;
    items.push(`多視点レビューで再考が必要: ${detail}`);
  }

  if (filled(pane4V1.learning_memo.conditions)) {
    items.push(`成立条件・注意点: ${clip(pane4V1.learning_memo.conditions)}`);
  }

  if (items.length === 0) {
    return [
      "今回の記録では、次の試行で特に見るべき留意点はまだ入力されていません。",
    ];
  }
  return items;
}

function buildReturnDestination(
  input: Pane4SummaryReviewInput,
): Pane4SummaryReviewModel["returnDestination"] {
  const destinationId = input.pane4V1.step5.return_destination;
  const def = PANE4_V1_RETURN_DESTINATION_DEFS.find(
    (item) => item.id === destinationId,
  );
  const finalDecision = input.pane4V1.multi_perspective_review.final_decision;

  return {
    selected: Boolean(def),
    destination: def?.destination ?? "未選択",
    action: def?.action ?? "戻り先はまだ選ばれていません",
    finalDecision: finalDecision
      ? PANE4_V1_FINAL_DECISION_LABELS[finalDecision]
      : "未入力",
    finalReason: filled(input.pane4V1.multi_perspective_review.final_reason)
      ? input.pane4V1.multi_perspective_review.final_reason.trim()
      : "未入力",
  };
}

function emptyOr(text: string): string {
  return filled(text) ? text.trim() : "未入力";
}

function verificationTone(status: string): Pane4SummaryVerificationTone {
  if (status === "一部支持" || status === "一部" || status === "見直し") {
    return "secondary";
  }
  if (
    status === "未判断" ||
    status === "未確認" ||
    status === "未試行" ||
    status === "未実行" ||
    status === "未入力" ||
    status === "未決定" ||
    status === "まだ早い"
  ) {
    return "outline";
  }
  return "default";
}

function buildVerification(
  input: Pane4SummaryReviewInput,
): Pane4SummaryVerificationItem[] {
  const { pane4V1, pane3Step3 } = input;
  const execution = pane4V1.step2.execution_status;
  const babyStepStatus =
    execution === "done"
      ? "実行できた"
      : execution === "partial"
        ? "一部"
        : "未実行";
  const interventionStatus =
    execution === "done" || execution === "partial" ? "今回試行済み" : "未試行";
  const nextGapStatus =
    filled(pane4V1.step5.next_gap) || filled(pane4V1.step3.new_gap)
      ? "抽出済み"
      : "未入力";
  const returnStatus = pane4V1.step5.return_destination ? "決定済み" : "未決定";
  const memoStatus = filled(pane4V1.learning_memo.lesson)
    ? "記録済み"
    : "未入力";
  const backingStatus =
    pane3Step3.backing.status === "confirmed" ? "確認済み" : "未確認";
  const hypothesisStatus = summarizeHypothesisStatus(selectedReviews(input));

  const rows: Array<[string, string]> = [
    ["構造仮説", hypothesisStatus],
    ["介入設計", interventionStatus],
    ["役割・後ろ盾", backingStatus],
    ["BABY STEP", babyStepStatus],
    ["次のGAP", nextGapStatus],
    ["戻り先", returnStatus],
    ["戦訓", memoStatus],
    ["SKILL化", "まだ早い"],
  ];

  return rows.map(([label, status]) => ({
    label,
    status,
    tone: verificationTone(status),
  }));
}

function buildEncouragement(input: Pane4SummaryReviewInput): string {
  const { pane4V1 } = input;
  const execution = pane4V1.step2.execution_status;
  const executed = execution === "done" || execution === "partial";
  const worked = pane4V1.step3.what_worked.trim();
  const blocked = pane4V1.step3.what_blocked.trim();
  const resistance = pane4V1.resistance_observation.observed.trim();
  const hasCaution =
    filled(blocked) ||
    filled(resistance) ||
    PANE4_V1_REVIEW_LENS_DEFS.some(
      (lens) =>
        pane4V1.multi_perspective_review[lens.id].status === "reconsider",
    );
  const hasAnyInput =
    Boolean(execution) ||
    filled(pane4V1.step1.what_was_done) ||
    filled(worked) ||
    filled(pane4V1.learning_memo.lesson) ||
    Boolean(pane4V1.step5.return_destination);

  if (!hasAnyInput) {
    return "今回の記録はまだ途中です。Fact・Result・戦訓を埋めたうえでこのレビューを開くと、確認できたこととまだ言えないことが分かれます。";
  }

  if (execution === "not_done") {
    return "今回はBABY STEPを実行できなかった、という記録です。失敗ではなく学習データです。次の一手では、小さく実行できたかどうかを先に確かめることに価値があります。";
  }

  if (pane4V1.multi_perspective_review.final_decision === "reconsider") {
    return "多視点レビューのあと、戻り先を再検討する判断が残っています。今回の1件で分かったことと、まだ言えないことを分けたうえで、戻る深さを決めることに価値があります。";
  }

  if (executed && filled(worked) && hasCaution) {
    const cautionSource = blocked || resistance;
    return `今回のBABY STEPでは、${clip(worked)}という動きの可能性が確認できました。一方で、${clip(cautionSource)}という点はまだ留意点です。次の一手では成功を広げるだけでなく、どの条件で崩れるのかを確認することにも価値があります。`;
  }

  if (executed && filled(worked)) {
    return `今回の1件では、${clip(worked)}の可能性が示されました。再現性や適用範囲はまだ未検証です。次のBABY STEPで、同じことが別の条件でも起きるか見ることに価値があります。`;
  }

  if (pane4V1.step5.return_destination === "next_baby_step") {
    return "方向は次の実験へ進む、という判断です。今回の1件を成功の証明にせず、次のBABY STEPで適用条件を確かめることに価値があります。";
  }

  return "今回の実践では、入力されたFactとResultを学習データとして残せています。1件の結果で正しさを断定せず、次に見るべき条件を決めることに価値があります。";
}

export function buildPane4SummaryReview(
  input: Pane4SummaryReviewInput,
): Pane4SummaryReviewModel {
  return {
    encouragement: buildEncouragement(input),
    confirmed: buildConfirmed(input),
    unconfirmed: buildUnconfirmed(input),
    cautions: buildCautions(input),
    returnDestination: buildReturnDestination(input),
    learningMemo: {
      lesson: emptyOr(input.pane4V1.learning_memo.lesson),
      conditions: emptyOr(input.pane4V1.learning_memo.conditions),
      nextValidation: emptyOr(input.pane4V1.learning_memo.next_validation),
    },
    verification: buildVerification(input),
  };
}
