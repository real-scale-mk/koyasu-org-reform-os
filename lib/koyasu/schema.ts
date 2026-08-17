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

export const caseStorageSchema = z.object({
  case_a00: z.string(),
  selected_phenomenon_id: z.string(),
  phenomena: z.array(phenomenonSchema),
  // 旧 koyasu:case:v1 に無い場合は default（全体の safeParse を落とさない）
  pane1_intake: pane1IntakeSchema.default(DEFAULT_PANE1_INTAKE),
});

export type CaseStorage = z.infer<typeof caseStorageSchema>;

/** Workspace 等、pane1_intake 未送信の書き込み用（省略時は storage 側で保持/default） */
export type CaseStorageWrite = Omit<CaseStorage, "pane1_intake"> & {
  pane1_intake?: Pane1Intake;
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
