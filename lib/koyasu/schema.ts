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

export const caseStorageSchema = z.object({
  case_a00: z.string(),
  selected_phenomenon_id: z.string(),
  phenomena: z.array(phenomenonSchema),
});

export type CaseStorage = z.infer<typeof caseStorageSchema>;

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
