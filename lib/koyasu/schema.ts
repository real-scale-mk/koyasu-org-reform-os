import { z } from "zod";

export const DEFAULT_PHENOMENON_ID = "young-turnover";

export const IMPORTANCE_VALUES = ["高", "中", "低"] as const;
export const STATUS_VALUES = ["未着手", "分析中", "介入中", "完了"] as const;
export const RELEVANCE_VALUES = ["高", "中", "低"] as const;

export type Importance = (typeof IMPORTANCE_VALUES)[number];
export type PhenomenonStatus = (typeof STATUS_VALUES)[number];
export type Relevance = (typeof RELEVANCE_VALUES)[number];

export const phenomenonSchema = z.object({
  id: z.string(),
  label: z.string(),
  target_state: z.string(),
  importance: z.enum(IMPORTANCE_VALUES),
  status: z.enum(STATUS_VALUES),
  memo: z.string(),
});

export type Phenomenon = z.infer<typeof phenomenonSchema>;

export const perspectiveSchema = z.object({
  id: z.string(),
  label: z.string(),
  summary: z.string(),
});

export type Perspective = z.infer<typeof perspectiveSchema>;

export const perspectiveDetailSchema = z.object({
  viewpoint: z.string(),
  questions: z.array(z.string()),
  examplesByPhenomenonId: z.record(z.string(), z.string()),
});

export type PerspectiveDetail = z.infer<typeof perspectiveDetailSchema>;

export const actionSchema = z.object({
  id: z.string(),
  label: z.string(),
  why: z.string(),
  summary: z.string(),
});

export type Action = z.infer<typeof actionSchema>;

export const leverageSchema = z.object({
  label: z.string(),
  connection: z.string(),
  actions: z.array(actionSchema),
  placeholder: z.boolean().optional(),
});

export type Leverage = z.infer<typeof leverageSchema>;

export const outcomeSeedSchema = z.object({
  executionResults: z.array(z.string()),
  outcomes: z.array(z.string()),
  insights: z.array(z.string()),
  skillCandidates: z.array(z.string()),
  placeholder: z.boolean().optional(),
});

export type OutcomeSeed = z.infer<typeof outcomeSeedSchema>;

export const koyasuCaseSeedSchema = z.object({
  toolName: z.string(),
  caseName: z.string(),
  case_a00: z.string(),
  selected_phenomenon_id: z.string(),
  phenomena: z.array(phenomenonSchema),
  perspectives: z.array(perspectiveSchema),
  perspectiveDetails: z.record(z.string(), perspectiveDetailSchema),
  relevanceByPhenomenonId: z.record(
    z.string(),
    z.record(z.string(), z.enum(RELEVANCE_VALUES)),
  ),
  leverageByPhenomenonId: z.record(z.string(), leverageSchema),
  outcomesByPhenomenonId: z.record(z.string(), outcomeSeedSchema),
});

export type KoyasuCaseSeed = z.infer<typeof koyasuCaseSeedSchema>;

/**
 * Pane1 V1 取込データ（違和感 → 現象整理 → AS IS / TO BE → GAP → 案件化）。
 * 意味上の順序: AS IS と TO BE を決め、その差が GAP。
 * A00（case_a00）はここには含めない。
 */
export const DEFAULT_PANE1_INTAKE = {
  discomfort: "",
  core_phenomenon: "",
  surface_phenomena: [] as string[],
  facts: "",
  hypotheses: "",
  as_is: "",
  to_be: "",
  gap: "",
  case_name: "",
  target_org: "",
  target_context: "",
  stakeholders: "",
  scope_in: "",
  scope_out: "",
};

export const pane1IntakeSchema = z.object({
  discomfort: z.string().default(""),
  core_phenomenon: z.string().default(""),
  // 想定最大3件。超過分は切り捨てて旧データの parse 失敗を避ける
  surface_phenomena: z
    .array(z.string())
    .default([])
    .transform((items) => items.slice(0, 3)),
  facts: z.string().default(""),
  hypotheses: z.string().default(""),
  as_is: z.string().default(""),
  to_be: z.string().default(""),
  gap: z.string().default(""),
  case_name: z.string().default(""),
  target_org: z.string().default(""),
  target_context: z.string().default(""),
  stakeholders: z.string().default(""),
  scope_in: z.string().default(""),
  scope_out: z.string().default(""),
});

export type Pane1Intake = z.infer<typeof pane1IntakeSchema>;

export const DEFAULT_PANE2_STEP1_HYPOTHESES = [
  {
    structural_hypothesis: "",
    evidence: "",
    follow_up_question: "",
  },
  {
    structural_hypothesis: "",
    evidence: "",
    follow_up_question: "",
  },
  {
    structural_hypothesis: "",
    evidence: "",
    follow_up_question: "",
  },
] as const;

export const pane2HypothesisSchema = z.object({
  structural_hypothesis: z.string().default(""),
  evidence: z.string().default(""),
  follow_up_question: z.string().default(""),
});

export type Pane2Hypothesis = z.infer<typeof pane2HypothesisSchema>;

export const pane2Step1Schema = z.object({
  hypotheses: z
    .array(pane2HypothesisSchema)
    .default([...DEFAULT_PANE2_STEP1_HYPOTHESES])
    .transform((items) =>
      [...items, ...DEFAULT_PANE2_STEP1_HYPOTHESES]
        .slice(0, 3)
        .map((item) => pane2HypothesisSchema.parse(item)),
    ),
});

export type Pane2Step1 = z.infer<typeof pane2Step1Schema>;

export const RESPONSIBILITY_CHAIN_STEPS = [
  { id: "1", label: "問題発見" },
  { id: "2", label: "起票・共有" },
  { id: "3", label: "推進責任者決定" },
  { id: "4", label: "実務担当決定" },
  { id: "5", label: "支援・意思決定" },
  { id: "6", label: "対策実行" },
  { id: "7", label: "完了確認" },
  { id: "8", label: "効果確認・再発防止" },
] as const;

export const RESPONSIBILITY_CHAIN_TRANSITIONS = [
  "1-2",
  "2-3",
  "3-4",
  "4-5",
  "5-6",
  "6-7",
  "7-8",
] as const;

export type ResponsibilityChainTransitionId =
  (typeof RESPONSIBILITY_CHAIN_TRANSITIONS)[number];

/** 断絶の参考例（固定回答ではない） */
export const RESPONSIBILITY_CHAIN_BREAK_EXAMPLES: Record<
  ResponsibilityChainTransitionId,
  string
> = {
  "1-2": "問題は見えているが、起票・共有に乗らない",
  "2-3": "共有したが推進責任者が決まらない",
  "3-4": "推進責任者はいるが、担当・範囲・期限が曖昧",
  "4-5": "現場支援・意思決定・障壁除去が不足",
  "5-6": "意思決定が遅れ、実行が止まる",
  "6-7": "実行はあるが完了基準の確認がない",
  "7-8": "効果確認・再発防止の追跡がない",
};

export const pane2ChainBreakSchema = z.object({
  transition_id: z.enum(RESPONSIBILITY_CHAIN_TRANSITIONS),
  memo: z.string().default(""),
});

export type Pane2ChainBreak = z.infer<typeof pane2ChainBreakSchema>;

export const DEFAULT_PANE2_STEP2 = {
  breaks: [] as Pane2ChainBreak[],
};

export const pane2Step2Schema = z.object({
  breaks: z
    .array(pane2ChainBreakSchema)
    .default([])
    .transform((items) => {
      const byTransition = new Map<ResponsibilityChainTransitionId, Pane2ChainBreak>();
      for (const item of items) {
        const parsed = pane2ChainBreakSchema.parse(item);
        byTransition.set(parsed.transition_id, parsed);
      }
      return RESPONSIBILITY_CHAIN_TRANSITIONS.filter((id) =>
        byTransition.has(id),
      ).map((id) => byTransition.get(id)!);
    }),
});

export type Pane2Step2 = z.infer<typeof pane2Step2Schema>;

/** Pane2-Step3: 説明力 / 介入可能性（未選択は空文字） */
export const PANE2_RATING_VALUES = ["高", "中", "低"] as const;
export type Pane2Rating = (typeof PANE2_RATING_VALUES)[number];
export type Pane2RatingOrEmpty = Pane2Rating | "";

export const pane2RatingSchema = z
  .union([z.enum(PANE2_RATING_VALUES), z.literal("")])
  .default("");

export const DEFAULT_PANE2_STEP3_EVALUATION = {
  explanatory_power: "" as Pane2RatingOrEmpty,
  intervene_ability: "" as Pane2RatingOrEmpty,
  priority_reason: "",
};

export const DEFAULT_PANE2_STEP3_EVALUATIONS = [
  { ...DEFAULT_PANE2_STEP3_EVALUATION },
  { ...DEFAULT_PANE2_STEP3_EVALUATION },
  { ...DEFAULT_PANE2_STEP3_EVALUATION },
] as const;

export const pane2Step3EvaluationSchema = z.object({
  explanatory_power: pane2RatingSchema,
  intervene_ability: pane2RatingSchema,
  priority_reason: z.string().default(""),
});

export type Pane2Step3Evaluation = z.infer<typeof pane2Step3EvaluationSchema>;

export const DEFAULT_PANE2_STEP3 = {
  evaluations: [
    { ...DEFAULT_PANE2_STEP3_EVALUATION },
    { ...DEFAULT_PANE2_STEP3_EVALUATION },
    { ...DEFAULT_PANE2_STEP3_EVALUATION },
  ],
  selected_for_pane3: [] as number[],
};

export const pane2Step3Schema = z.object({
  evaluations: z
    .array(pane2Step3EvaluationSchema)
    .default([...DEFAULT_PANE2_STEP3_EVALUATIONS])
    .transform((items) =>
      [...items, ...DEFAULT_PANE2_STEP3_EVALUATIONS]
        .slice(0, 3)
        .map((item) => pane2Step3EvaluationSchema.parse(item)),
    ),
  // 仮説 index 0..2。最大2件・重複除去（順序は入力順を維持）
  selected_for_pane3: z
    .array(z.number().int())
    .default([])
    .transform((items) => {
      const seen = new Set<number>();
      const next: number[] = [];
      for (const item of items) {
        if (item < 0 || item > 2 || seen.has(item)) continue;
        seen.add(item);
        next.push(item);
        if (next.length >= 2) break;
      }
      return next;
    }),
});

export type Pane2Step3 = z.infer<typeof pane2Step3Schema>;

export const caseStorageSchema = z.object({
  case_a00: z.string(),
  selected_phenomenon_id: z.string(),
  phenomena: z.array(phenomenonSchema),
  // 旧 koyasu:case:v1 に無い場合は default（全体の safeParse を落とさない）
  pane1_intake: pane1IntakeSchema.default(DEFAULT_PANE1_INTAKE),
  pane2_step1: pane2Step1Schema.default({
    hypotheses: [...DEFAULT_PANE2_STEP1_HYPOTHESES],
  }),
  pane2_step2: pane2Step2Schema.default(DEFAULT_PANE2_STEP2),
  pane2_step3: pane2Step3Schema.default(DEFAULT_PANE2_STEP3),
});

export type CaseStorage = z.infer<typeof caseStorageSchema>;

/** Workspace 等、pane1/pane2 の省略書き込み時も storage 側で保持/default する */
export type CaseStorageWrite = Omit<
  CaseStorage,
  "pane1_intake" | "pane2_step1" | "pane2_step2" | "pane2_step3"
> & {
  pane1_intake?: Pane1Intake;
  pane2_step1?: Pane2Step1;
  pane2_step2?: Pane2Step2;
  pane2_step3?: Pane2Step3;
};

export const learningStorageSchema = z.object({
  insightsByPhenomenonId: z.record(z.string(), z.array(z.string())),
  skillCandidatesByPhenomenonId: z.record(z.string(), z.array(z.string())),
});

export type LearningStorage = z.infer<typeof learningStorageSchema>;

const RELEVANCE_ORDER: Record<Relevance, number> = {
  高: 0,
  中: 1,
  低: 2,
};

export function sortPerspectivesByRelevance(
  perspectives: Perspective[],
  relevanceMap: Record<string, Relevance>,
): Perspective[] {
  return [...perspectives].sort(
    (a, b) =>
      (RELEVANCE_ORDER[relevanceMap[a.id] ?? "低"] ?? 2) -
      (RELEVANCE_ORDER[relevanceMap[b.id] ?? "低"] ?? 2),
  );
}
