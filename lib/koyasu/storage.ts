import {
  caseStorageSchema,
  DEFAULT_PANE1_INTAKE,
  DEFAULT_PANE2_STEP1_HYPOTHESES,
  DEFAULT_PANE2_STEP2,
  DEFAULT_PANE2_STEP3,
  DEFAULT_PANE3_STEP1,
  learningStorageSchema,
  type CaseStorage,
  type CaseStorageWrite,
  type KoyasuCaseSeed,
  type LearningStorage,
  type Pane1Intake,
} from "@/lib/koyasu/schema";

export const CASE_STORAGE_KEY = "koyasu:case:v1";
export const LEARNING_STORAGE_KEY = "koyasu:learning:v1";

function readJson<T>(
  key: string,
  parse: (value: unknown) => T | null,
): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

function parseCaseStorage(value: unknown): CaseStorage | null {
  const result = caseStorageSchema.safeParse(value);
  return result.success ? result.data : null;
}

function readStoredCase(): CaseStorage | null {
  return readJson(CASE_STORAGE_KEY, parseCaseStorage);
}

export function loadCaseStorage(seed: KoyasuCaseSeed): CaseStorage {
  const stored = readStoredCase();

  if (!stored) {
    return {
      case_a00: seed.case_a00,
      selected_phenomenon_id: seed.selected_phenomenon_id,
      phenomena: seed.phenomena,
      pane1_intake: DEFAULT_PANE1_INTAKE,
      pane2_step1: {
        hypotheses: [...DEFAULT_PANE2_STEP1_HYPOTHESES],
      },
      pane2_step2: DEFAULT_PANE2_STEP2,
      pane2_step3: DEFAULT_PANE2_STEP3,
      pane3_step1: DEFAULT_PANE3_STEP1,
    };
  }

  const seedById = new Map(seed.phenomena.map((p) => [p.id, p]));
  const mergedPhenomena = stored.phenomena.map((storedPhenomenon) => {
    const base = seedById.get(storedPhenomenon.id);
    return base ? { ...base, ...storedPhenomenon } : storedPhenomenon;
  });
  const storedIds = new Set(stored.phenomena.map((p) => p.id));
  for (const phenomenon of seed.phenomena) {
    if (!storedIds.has(phenomenon.id)) mergedPhenomena.push(phenomenon);
  }

  return {
    case_a00: stored.case_a00,
    selected_phenomenon_id: stored.selected_phenomenon_id,
    phenomena: mergedPhenomena,
    pane1_intake: stored.pane1_intake,
    pane2_step1: stored.pane2_step1,
    pane2_step2: stored.pane2_step2,
    pane2_step3: stored.pane2_step3,
    pane3_step1: stored.pane3_step1,
  };
}

export function loadLearningStorage(seed: KoyasuCaseSeed): LearningStorage {
  const stored = readJson(LEARNING_STORAGE_KEY, (value) => {
    const result = learningStorageSchema.safeParse(value);
    return result.success ? result.data : null;
  });

  const insightsByPhenomenonId: Record<string, string[]> = {};
  const skillCandidatesByPhenomenonId: Record<string, string[]> = {};

  for (const phenomenon of seed.phenomena) {
    const outcome = seed.outcomesByPhenomenonId[phenomenon.id];
    insightsByPhenomenonId[phenomenon.id] =
      stored?.insightsByPhenomenonId[phenomenon.id] ??
      outcome?.insights ??
      [];
    skillCandidatesByPhenomenonId[phenomenon.id] =
      stored?.skillCandidatesByPhenomenonId[phenomenon.id] ??
      outcome?.skillCandidates ??
      [];
  }

  return { insightsByPhenomenonId, skillCandidatesByPhenomenonId };
}

/**
 * pane1_intake 省略時は既存 localStorage の値を維持し、無ければ default。
 * pane2_step1 / pane2_step2 / pane2_step3 / pane3_step1 も同様に維持し、
 * 既存ワークスペース保存との後方互換を保つ。
 */
export function saveCaseStorage(data: CaseStorageWrite): void {
  if (typeof window === "undefined") return;

  const existing = readStoredCase();
  const pane1_intake: Pane1Intake =
    data.pane1_intake ?? existing?.pane1_intake ?? DEFAULT_PANE1_INTAKE;
  const pane2_step1 =
    data.pane2_step1 ??
    existing?.pane2_step1 ?? {
      hypotheses: [...DEFAULT_PANE2_STEP1_HYPOTHESES],
    };
  const pane2_step2 =
    data.pane2_step2 ?? existing?.pane2_step2 ?? DEFAULT_PANE2_STEP2;
  const pane2_step3 =
    data.pane2_step3 ?? existing?.pane2_step3 ?? DEFAULT_PANE2_STEP3;
  const pane3_step1 =
    data.pane3_step1 ?? existing?.pane3_step1 ?? DEFAULT_PANE3_STEP1;

  const next: CaseStorage = {
    case_a00: data.case_a00,
    selected_phenomenon_id: data.selected_phenomenon_id,
    phenomena: data.phenomena,
    pane1_intake,
    pane2_step1,
    pane2_step2,
    pane2_step3,
    pane3_step1,
  };

  window.localStorage.setItem(CASE_STORAGE_KEY, JSON.stringify(next));
}

export function saveLearningStorage(data: LearningStorage): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(data));
}
