"use client";

/**
 * 小安式 組織改革OS — 4ペイン Workspace
 *
 * Pane1: 現象とA00（Sidebar）
 * Pane2: 構造分析
 * Pane3: レバレッジと打ち手
 * Pane4: 学びと成果
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  DEFAULT_PHENOMENON_ID,
  type KoyasuCaseSeed,
  type Phenomenon,
} from "@/lib/koyasu/schema";
import {
  loadCaseStorage,
  loadLearningStorage,
  saveCaseStorage,
  saveLearningStorage,
} from "@/lib/koyasu/storage";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { KoyasuGlobalHeader } from "@/components/workspace/KoyasuGlobalHeader";
import { LearningOutcomePane } from "@/components/workspace/LearningOutcomePane";
import { LeverageActionPane } from "@/components/workspace/LeverageActionPane";
import { PhenomenonA00Pane } from "@/components/workspace/PhenomenonA00Pane";
import { StructureAnalysisPane } from "@/components/workspace/StructureAnalysisPane";

type WorkspaceProps = {
  seed: KoyasuCaseSeed;
};

function useDebouncedEffect(
  effect: () => void,
  deps: React.DependencyList,
  delayMs = 400,
) {
  useEffect(() => {
    const timer = window.setTimeout(effect, delayMs);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounced snapshot
  }, deps);
}

export function Workspace({ seed }: WorkspaceProps) {
  const initialCase = useMemo(() => loadCaseStorage(seed), [seed]);
  const initialLearning = useMemo(() => loadLearningStorage(seed), [seed]);

  const [caseA00, setCaseA00] = useState(initialCase.case_a00);
  const [selectedPhenomenonId, setSelectedPhenomenonId] = useState(
    initialCase.selected_phenomenon_id,
  );
  const [phenomena, setPhenomena] = useState<Phenomenon[]>(
    initialCase.phenomena,
  );
  const [insightsByPhenomenonId, setInsightsByPhenomenonId] = useState(
    initialLearning.insightsByPhenomenonId,
  );
  const [skillCandidatesByPhenomenonId, setSkillCandidatesByPhenomenonId] =
    useState(initialLearning.skillCandidatesByPhenomenonId);
  const [pane4Open, setPane4Open] = useState(true);

  const casePersistReady = useRef(false);
  const learningPersistReady = useRef(false);

  useDebouncedEffect(
    () => {
      if (!casePersistReady.current) {
        casePersistReady.current = true;
        return;
      }
      saveCaseStorage({
        case_a00: caseA00,
        selected_phenomenon_id: selectedPhenomenonId,
        phenomena,
      });
    },
    [caseA00, selectedPhenomenonId, phenomena],
  );

  useDebouncedEffect(
    () => {
      if (!learningPersistReady.current) {
        learningPersistReady.current = true;
        return;
      }
      saveLearningStorage({
        insightsByPhenomenonId,
        skillCandidatesByPhenomenonId,
      });
    },
    [insightsByPhenomenonId, skillCandidatesByPhenomenonId],
  );

  const selectedPhenomenon = useMemo(
    () =>
      phenomena.find((p) => p.id === selectedPhenomenonId) ??
      phenomena.find((p) => p.id === DEFAULT_PHENOMENON_ID) ??
      phenomena[0],
    [phenomena, selectedPhenomenonId],
  );

  const relevanceMap = useMemo(
    () =>
      seed.relevanceByPhenomenonId[selectedPhenomenon?.id ?? ""] ??
      seed.relevanceByPhenomenonId[DEFAULT_PHENOMENON_ID] ??
      {},
    [seed.relevanceByPhenomenonId, selectedPhenomenon?.id],
  );

  const leverage = useMemo(
    () =>
      seed.leverageByPhenomenonId[selectedPhenomenon?.id ?? ""] ??
      seed.leverageByPhenomenonId[DEFAULT_PHENOMENON_ID],
    [seed.leverageByPhenomenonId, selectedPhenomenon?.id],
  );

  const outcomeSeed = useMemo(
    () =>
      seed.outcomesByPhenomenonId[selectedPhenomenon?.id ?? ""] ??
      seed.outcomesByPhenomenonId[DEFAULT_PHENOMENON_ID],
    [seed.outcomesByPhenomenonId, selectedPhenomenon?.id],
  );

  const selectPhenomenon = useCallback((id: string) => {
    setSelectedPhenomenonId(id);
  }, []);

  const updateCaseA00 = useCallback((value: string) => {
    setCaseA00(value);
  }, []);

  const updatePhenomenon = useCallback(
    (
      id: string,
      patch: Partial<
        Pick<Phenomenon, "target_state" | "importance" | "status" | "memo">
      >,
    ) => {
      setPhenomena((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      );
    },
    [],
  );

  const addPhenomenon = useCallback((label: string) => {
    const id = `phenomenon-${Date.now()}`;
    const next: Phenomenon = {
      id,
      label,
      target_state: "",
      importance: "中",
      status: "未着手",
      memo: "",
    };
    setPhenomena((prev) => [...prev, next]);
    setSelectedPhenomenonId(id);
    setInsightsByPhenomenonId((prev) => ({ ...prev, [id]: [] }));
    setSkillCandidatesByPhenomenonId((prev) => ({ ...prev, [id]: [] }));
  }, []);

  const updateInsight = useCallback(
    (index: number, value: string) => {
      const id = selectedPhenomenon?.id;
      if (!id) return;
      setInsightsByPhenomenonId((prev) => {
        const items = [...(prev[id] ?? [])];
        items[index] = value;
        return { ...prev, [id]: items };
      });
    },
    [selectedPhenomenon?.id],
  );

  const updateSkillCandidate = useCallback(
    (index: number, value: string) => {
      const id = selectedPhenomenon?.id;
      if (!id) return;
      setSkillCandidatesByPhenomenonId((prev) => {
        const items = [...(prev[id] ?? [])];
        items[index] = value;
        return { ...prev, [id]: items };
      });
    },
    [selectedPhenomenon?.id],
  );

  const addInsight = useCallback(() => {
    const id = selectedPhenomenon?.id;
    if (!id) return;
    setInsightsByPhenomenonId((prev) => ({
      ...prev,
      [id]: [...(prev[id] ?? []), ""],
    }));
  }, [selectedPhenomenon?.id]);

  const addSkillCandidate = useCallback(() => {
    const id = selectedPhenomenon?.id;
    if (!id) return;
    setSkillCandidatesByPhenomenonId((prev) => ({
      ...prev,
      [id]: [...(prev[id] ?? []), ""],
    }));
  }, [selectedPhenomenon?.id]);

  const togglePane4 = useCallback(() => {
    setPane4Open((v) => !v);
  }, []);

  if (!selectedPhenomenon || !leverage || !outcomeSeed) {
    return null;
  }

  return (
    <SidebarProvider
      defaultOpen
      className="h-screen w-full overflow-hidden bg-background text-foreground"
    >
      <PhenomenonA00Pane
        toolName={seed.toolName}
        caseA00={caseA00}
        phenomena={phenomena}
        selectedPhenomenonId={selectedPhenomenonId}
        onSelectPhenomenon={selectPhenomenon}
        onUpdateCaseA00={updateCaseA00}
        onUpdatePhenomenon={updatePhenomenon}
        onAddPhenomenon={addPhenomenon}
      />
      <SidebarInset className="flex min-w-0 flex-col bg-background">
        <KoyasuGlobalHeader
          caseName={seed.caseName}
          selectedPhenomenonLabel={selectedPhenomenon.label}
        />
        <div className="flex min-h-0 flex-1">
          <StructureAnalysisPane
            selectedPhenomenon={selectedPhenomenon}
            perspectives={seed.perspectives}
            perspectiveDetails={seed.perspectiveDetails}
            relevanceMap={relevanceMap}
          />
          <LeverageActionPane
            selectedPhenomenon={selectedPhenomenon}
            leverage={leverage}
          />
          <LearningOutcomePane
            selectedPhenomenon={selectedPhenomenon}
            executionResults={outcomeSeed.executionResults}
            outcomes={outcomeSeed.outcomes}
            insights={insightsByPhenomenonId[selectedPhenomenon.id] ?? []}
            skillCandidates={
              skillCandidatesByPhenomenonId[selectedPhenomenon.id] ?? []
            }
            placeholder={outcomeSeed.placeholder ?? false}
            pane4Open={pane4Open}
            onTogglePane4={togglePane4}
            onUpdateInsight={updateInsight}
            onUpdateSkillCandidate={updateSkillCandidate}
            onAddInsight={addInsight}
            onAddSkillCandidate={addSkillCandidate}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
