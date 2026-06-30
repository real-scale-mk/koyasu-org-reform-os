"use client";

/**
 * 小安式 組織改革OS — 4ペイン Workspace
 *
 * Pane1: 診断ワークスペース
 * Pane2: 構造分析
 * Pane3: 改革戦略設計
 * Pane4: SKILL資産化
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  DEFAULT_PHENOMENON_ID,
  type KoyasuCaseSeed,
  type Phenomenon,
} from "@/lib/koyasu/schema";
import { getPrimaryInterventionStructureForPhenomenon } from "@/lib/koyasu/phenomenon-diagnostics";
import { getReformStrategyDesign } from "@/lib/koyasu/reform-strategies";
import { getSkillAssetization } from "@/lib/koyasu/skill-assetization";
import { getPhenomenonWorkspaceBundle } from "@/lib/koyasu/phenomenon-workspace-data";
import { loadCaseStorage, saveCaseStorage } from "@/lib/koyasu/storage";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { KoyasuGlobalHeader } from "@/components/workspace/KoyasuGlobalHeader";
import { SkillAssetizationPane } from "@/components/workspace/LearningOutcomePane";
import { ReformStrategyDesignPane } from "@/components/workspace/LeverageActionPane";
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

  const [caseA00, setCaseA00] = useState(initialCase.case_a00);
  const [selectedPhenomenonId, setSelectedPhenomenonId] = useState(
    initialCase.selected_phenomenon_id,
  );
  const [phenomena, setPhenomena] = useState<Phenomenon[]>(
    initialCase.phenomena,
  );
  const [pane4Open, setPane4Open] = useState(true);

  const casePersistReady = useRef(false);

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

  const primaryIntervention = useMemo(
    () =>
      getPrimaryInterventionStructureForPhenomenon(
        selectedPhenomenon?.id ?? DEFAULT_PHENOMENON_ID,
      ),
    [selectedPhenomenon?.id],
  );

  const reformStrategyDesign = useMemo(
    () =>
      getReformStrategyDesign(
        selectedPhenomenon?.id ?? DEFAULT_PHENOMENON_ID,
        primaryIntervention.structure.id,
      ),
    [selectedPhenomenon?.id, primaryIntervention.structure.id],
  );

  const phenomenonWorkspace = useMemo(
    () =>
      getPhenomenonWorkspaceBundle(
        selectedPhenomenon?.id ?? DEFAULT_PHENOMENON_ID,
      ),
    [selectedPhenomenon?.id],
  );

  const skillAssetization = useMemo(
    () => getSkillAssetization(selectedPhenomenon?.id ?? DEFAULT_PHENOMENON_ID),
    [selectedPhenomenon?.id],
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
  }, []);

  const togglePane4 = useCallback(() => {
    setPane4Open((v) => !v);
  }, []);

  if (!selectedPhenomenon) {
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
        phenomenonCasePolaris={phenomenonWorkspace.casePolaris}
        phenomenonTargetState={phenomenonWorkspace.targetState}
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
            primaryIntervention={primaryIntervention}
            perspectives={seed.perspectives}
            perspectiveDetails={seed.perspectiveDetails}
            relevanceMap={relevanceMap}
          />
          <ReformStrategyDesignPane
            selectedPhenomenon={selectedPhenomenon}
            primaryIntervention={primaryIntervention}
            design={reformStrategyDesign}
          />
          <SkillAssetizationPane
            selectedPhenomenon={selectedPhenomenon}
            assetization={skillAssetization}
            pane4Open={pane4Open}
            onTogglePane4={togglePane4}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
