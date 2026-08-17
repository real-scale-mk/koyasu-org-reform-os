import {
  caseStorageSchema,
  DEFAULT_PANE1_INTAKE,
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
 * Workspace が従来どおり3フィールドだけ渡しても、将来の intake を消さない。
 */
export function saveCaseStorage(data: CaseStorageWrite): void {
  if (typeof window === "undefined") return;

  const existing = readStoredCase();
  const pane1_intake: Pane1Intake =
    data.pane1_intake ?? existing?.pane1_intake ?? DEFAULT_PANE1_INTAKE;

  const next: CaseStorage = {
    case_a00: data.case_a00,
    selected_phenomenon_id: data.selected_phenomenon_id,
    phenomena: data.phenomena,
    pane1_intake,
  };

  window.localStorage.setItem(CASE_STORAGE_KEY, JSON.stringify(next));
}

export function saveLearningStorage(data: LearningStorage): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(data));
}
