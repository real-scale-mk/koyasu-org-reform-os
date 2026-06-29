import { z } from "zod";

export const phenomenonScoresSchema = z.object({
  urgency: z.number().int().min(1).max(5),
  impact: z.number().int().min(1).max(5),
  depth: z.number().int().min(1).max(5),
  accountability: z.number().int().min(1).max(5),
  transformationProgress: z.number().int().min(1).max(5),
  psychologicalSafety: z.number().int().min(1).max(5),
});

export const phenomenonSchema = z.object({
  id: z.string(),
  category: z.string(),
  label: z.string(),
  note: z.string(),
  scores: phenomenonScoresSchema,
  comment: z.string().optional(),
  pane3Highlight: z.array(z.string()),
});

export const structureNodeSchema = z.object({
  id: z.string(),
  type: z.enum(["phenomenon", "cause", "structure", "leverage"]),
  label: z.string(),
  hypothesis: z.boolean().optional(),
  x: z.number(),
  y: z.number(),
});

export const structureEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  kind: z.enum(["reinforce", "inhibit"]),
  strength: z.enum([
    "primary",
    "secondary",
    "hypothesis",
    "leverage",
    "leverage-weak",
  ]),
});

export const nextActionRowSchema = z.object({
  stakeholder: z.string(),
  question: z.string(),
  intent: z.string(),
});

export const nextActionSchema = z.object({
  leverageLabel: z.string(),
  rows: z.array(nextActionRowSchema),
});

export const orgTransformationCaseSchema = z.object({
  caseName: z.string(),
  toolName: z.string(),
  phenomena: z.array(phenomenonSchema),
  structureNodes: z.array(structureNodeSchema),
  structureEdges: z.array(structureEdgeSchema),
  primaryPath: z.array(z.string()),
  nextActionsByPhenomenonId: z.record(z.string(), nextActionSchema),
  learnings: z.array(z.string()),
});

export type PhenomenonScores = z.infer<typeof phenomenonScoresSchema>;
export type Phenomenon = z.infer<typeof phenomenonSchema>;
export type StructureNode = z.infer<typeof structureNodeSchema>;
export type StructureEdge = z.infer<typeof structureEdgeSchema>;
export type NextActionRow = z.infer<typeof nextActionRowSchema>;
export type NextAction = z.infer<typeof nextActionSchema>;
export type OrgTransformationCase = z.infer<typeof orgTransformationCaseSchema>;

export const DEFAULT_PHENOMENON_ID = "young-turnover";

/** レーダー表示用（変革推進度は高いほど良い → 危険度は 6 - score） */
export function radarRiskValue(
  key: keyof Pick<
    PhenomenonScores,
    "accountability" | "transformationProgress" | "psychologicalSafety"
  >,
  scores: PhenomenonScores,
): number {
  if (key === "transformationProgress") {
    return 6 - scores.transformationProgress;
  }
  return scores[key];
}

export function scoreToMapX(depth: number): number {
  return 10 + ((depth - 1) / 4) * 80;
}

export function scoreToMapY(impact: number): number {
  return 90 - ((impact - 1) / 4) * 80;
}

export function urgencyToRadius(urgency: number): number {
  return urgency * 3 + 5;
}

export function structureNodesEmphasized(scores: PhenomenonScores): boolean {
  return scores.depth >= 4;
}
