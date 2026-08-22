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

/**
 * Pane3-Step1: 優先仮説ごとの本丸候補 / 最初の一手候補 / なぜここから。
 * hypotheses index（0..2）と対応。未選択仮説のエントリも保持して復元を安定させる。
 * 旧 shape（leverage_point / why）は parse 時に新フィールドへ移行する。
 */
export const DEFAULT_PANE3_STEP1_ENTRY = {
  structural_core_candidate: "",
  first_entry_candidate: "",
  why_start_here: "",
};

export const DEFAULT_PANE3_STEP1_ENTRIES = [
  { ...DEFAULT_PANE3_STEP1_ENTRY },
  { ...DEFAULT_PANE3_STEP1_ENTRY },
  { ...DEFAULT_PANE3_STEP1_ENTRY },
] as const;

export const DEFAULT_PANE3_STEP1 = {
  entries: [
    { ...DEFAULT_PANE3_STEP1_ENTRY },
    { ...DEFAULT_PANE3_STEP1_ENTRY },
    { ...DEFAULT_PANE3_STEP1_ENTRY },
  ],
};

const pane3Step1EntryInputSchema = z.object({
  structural_core_candidate: z.string().optional(),
  first_entry_candidate: z.string().optional(),
  why_start_here: z.string().optional(),
  // 旧 koyasu:case:v1 Pane3-Step1（混在意味の単一フィールド）
  leverage_point: z.string().optional(),
  why: z.string().optional(),
});

export const pane3Step1EntrySchema = pane3Step1EntryInputSchema.transform(
  (item) => ({
    // 旧 leverage_point は「小さな変化」寄りだったため、最初の一手へ寄せる
    structural_core_candidate: item.structural_core_candidate ?? "",
    first_entry_candidate:
      item.first_entry_candidate ?? item.leverage_point ?? "",
    why_start_here: item.why_start_here ?? item.why ?? "",
  }),
);

export type Pane3Step1Entry = z.infer<typeof pane3Step1EntrySchema>;

export const pane3Step1Schema = z.object({
  entries: z
    .array(pane3Step1EntryInputSchema)
    .default([...DEFAULT_PANE3_STEP1_ENTRIES])
    .transform((items) =>
      [...items, ...DEFAULT_PANE3_STEP1_ENTRIES]
        .slice(0, 3)
        .map((item) => pane3Step1EntrySchema.parse(item)),
    ),
});

export type Pane3Step1 = z.infer<typeof pane3Step1Schema>;

/**
 * Pane3-Step2: 「最初に手を入れる場面」向けの4役割設計（基本案採用 + 補足・修正）。
 * `roles` が正本。`entries` は後方互換（entries[0] に roles をミラー）。
 */
export const PANE3_STEP2_ROLE_DEFS = [
  {
    id: "discovery",
    label: "発見・起票者",
    ownsPlaceholder: "例: 現場でつまずきを見つけ、起票まで持っていく",
    donePlaceholder: "例: 起票が記録され、推進責任者に渡った",
    supportPlaceholder: "例: 起票テンプレへのアクセス、指摘しても安全な空気",
  },
  {
    id: "driver",
    label: "推進責任者",
    ownsPlaceholder: "例: 場面を前に進め、詰まりを外す責任を持つ",
    donePlaceholder: "例: 実務担当が着手できる状態まで決めた",
    supportPlaceholder: "例: 部門横断の調整権限、スポンサーへのエスカレ経路",
  },
  {
    id: "practitioner",
    label: "実務担当",
    ownsPlaceholder: "例: 決められた手順をその場で実行する",
    donePlaceholder: "例: 合意した完了物（記録・通知など）を出した",
    supportPlaceholder: "例: 手順の明確さ、作業時間の確保、失敗しても責められない枠",
  },
  {
    id: "supporter",
    label: "支援・承認者",
    ownsPlaceholder: "例: 必要な承認・資源・後押しを出す",
    donePlaceholder: "例: 承認または支援の可否を期限内に返した",
    supportPlaceholder: "例: 判断材料の事前共有、承認の裁量範囲の明示",
  },
] as const;

export type Pane3Step2RoleId = (typeof PANE3_STEP2_ROLE_DEFS)[number]["id"];

export const DEFAULT_PANE3_STEP2_ROLE_FIELDS = {
  adopted_default: false,
  supplement: "",
  owns: "",
  completion_criteria: "",
  support_authority: "",
};

/** Pane3-Step2: 4役割の静的な基本案（正解ではない出発点） */
export const PANE3_STEP2_ROLE_DEFAULT_PROPOSALS: Record<
  Pane3Step2RoleId,
  { basic: string; completion: string; support: string }
> = {
  discovery: {
    basic: "異常・不具合の事実を記録し、正式な問題対応プロセスへつなぐ",
    completion:
      "事実と影響が記録され、推進責任者へ正式に引き渡されている",
    support:
      "起票先・エスカレーション先が明確で、問題提起によって不利益を受けないこと",
  },
  driver: {
    basic:
      "問題の正面に立ち、実務担当・期限・完了条件を明確にし、進捗・調整を前へ進める",
    completion:
      "対策実行と必要な効果確認まで、責任連鎖が途切れず進んでいる",
    support: "部門間調整権限、管理職の後ろ盾、必要な資源・時間",
  },
  practitioner: {
    basic: "決められた範囲の調査・分析・対策を実行する",
    completion:
      "合意した成果物・対策が、決められた到達水準まで完了している",
    support:
      "必要情報へのアクセス、技術支援、他部門協力、判断待ちを解消する支援",
  },
  supporter: {
    basic:
      "推進責任者・実務担当が進められない障害を取り除き、必要な判断・承認・資源提供を行う",
    completion:
      "必要な判断が期限内に行われ、実行者が権限不足・調整不足で止まっていない",
    support: "決裁権、部門間調整権限、上位者へのエスカレーション手段",
  },
};

function createDefaultPane3Step2Roles() {
  return {
    discovery: { ...DEFAULT_PANE3_STEP2_ROLE_FIELDS },
    driver: { ...DEFAULT_PANE3_STEP2_ROLE_FIELDS },
    practitioner: { ...DEFAULT_PANE3_STEP2_ROLE_FIELDS },
    supporter: { ...DEFAULT_PANE3_STEP2_ROLE_FIELDS },
  };
}

export const DEFAULT_PANE3_STEP2_ENTRY = {
  roles: createDefaultPane3Step2Roles(),
};

export const DEFAULT_PANE3_STEP2_ENTRIES = [
  { roles: createDefaultPane3Step2Roles() },
  { roles: createDefaultPane3Step2Roles() },
  { roles: createDefaultPane3Step2Roles() },
] as const;

export const DEFAULT_PANE3_STEP2 = {
  roles: createDefaultPane3Step2Roles(),
  entries: [
    { roles: createDefaultPane3Step2Roles() },
    { roles: createDefaultPane3Step2Roles() },
    { roles: createDefaultPane3Step2Roles() },
  ],
};

const pane3Step2RoleFieldsSchema = z.object({
  adopted_default: z.boolean().default(false),
  supplement: z.string().default(""),
  owns: z.string().default(""),
  completion_criteria: z.string().default(""),
  support_authority: z.string().default(""),
});

const pane3Step2RolesSchema = z.object({
  discovery: pane3Step2RoleFieldsSchema.default({
    ...DEFAULT_PANE3_STEP2_ROLE_FIELDS,
  }),
  driver: pane3Step2RoleFieldsSchema.default({
    ...DEFAULT_PANE3_STEP2_ROLE_FIELDS,
  }),
  practitioner: pane3Step2RoleFieldsSchema.default({
    ...DEFAULT_PANE3_STEP2_ROLE_FIELDS,
  }),
  supporter: pane3Step2RoleFieldsSchema.default({
    ...DEFAULT_PANE3_STEP2_ROLE_FIELDS,
  }),
});

export const pane3Step2EntrySchema = z.object({
  roles: pane3Step2RolesSchema.default(createDefaultPane3Step2Roles()),
});

export type Pane3Step2RoleFields = z.infer<typeof pane3Step2RoleFieldsSchema>;
export type Pane3Step2Entry = z.infer<typeof pane3Step2EntrySchema>;

export const pane3Step2Schema = z
  .object({
    roles: pane3Step2RolesSchema.optional(),
    entries: z
      .array(
        z.object({
          roles: pane3Step2RolesSchema.optional(),
        }),
      )
      .default([...DEFAULT_PANE3_STEP2_ENTRIES])
      .transform((items) =>
        [...items, ...DEFAULT_PANE3_STEP2_ENTRIES]
          .slice(0, 3)
          .map((item) => ({
            roles: pane3Step2RolesSchema.parse(
              item.roles ?? createDefaultPane3Step2Roles(),
            ),
          })),
      ),
  })
  .transform(({ roles, entries }) => {
    const canonicalRoles = pane3Step2RolesSchema.parse(
      roles ?? entries[0]?.roles ?? createDefaultPane3Step2Roles(),
    );
    return {
      roles: canonicalRoles,
      entries: entries.map((entry, index) =>
        index === 0 ? { roles: canonicalRoles } : entry,
      ),
    };
  });

export type Pane3Step2 = z.infer<typeof pane3Step2Schema>;

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
  pane3_step1: pane3Step1Schema.default(DEFAULT_PANE3_STEP1),
  pane3_step2: pane3Step2Schema.default(DEFAULT_PANE3_STEP2),
});

export type CaseStorage = z.infer<typeof caseStorageSchema>;

/** Workspace 等、pane1/pane2/pane3 の省略書き込み時も storage 側で保持/default する */
export type CaseStorageWrite = Omit<
  CaseStorage,
  | "pane1_intake"
  | "pane2_step1"
  | "pane2_step2"
  | "pane2_step3"
  | "pane3_step1"
  | "pane3_step2"
> & {
  pane1_intake?: Pane1Intake;
  pane2_step1?: Pane2Step1;
  pane2_step2?: Pane2Step2;
  pane2_step3?: Pane2Step3;
  pane3_step1?: Pane3Step1;
  pane3_step2?: Pane3Step2;
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
