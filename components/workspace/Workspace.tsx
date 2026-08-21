"use client";

/**
 * 小安式 組織改革OS — 4ペイン Workspace
 *
 * Pane1: 診断ワークスペース
 * Pane2: 構造分析
 * Pane3: 改革戦略設計
 * Pane4: SKILL資産化
 */

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  DEFAULT_PANE1_INTAKE,
  DEFAULT_PANE2_STEP1_HYPOTHESES,
  DEFAULT_PANE2_STEP2,
  DEFAULT_PANE2_STEP3,
  DEFAULT_PANE3_STEP1,
  DEFAULT_PHENOMENON_ID,
  type KoyasuCaseSeed,
  type Pane1Intake,
  type Pane2Hypothesis,
  type Pane2Step1,
  type Pane2Step2,
  type Pane2Step3,
  type Pane2Step3Evaluation,
  type Pane3Step1,
  type Pane3Step1Entry,
  type Phenomenon,
  type ResponsibilityChainTransitionId,
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
  // 初回レンダーは常に seed のみ（SSR / hydration で localStorage を読まない）
  const [caseA00, setCaseA00] = useState(seed.case_a00);
  const [selectedPhenomenonId, setSelectedPhenomenonId] = useState(
    seed.selected_phenomenon_id,
  );
  const [phenomena, setPhenomena] = useState<Phenomenon[]>(seed.phenomena);
  const [pane1Intake, setPane1Intake] =
    useState<Pane1Intake>(DEFAULT_PANE1_INTAKE);
  const [pane2Step1, setPane2Step1] = useState<Pane2Step1>({
    hypotheses: [...DEFAULT_PANE2_STEP1_HYPOTHESES],
  });
  const [pane2Step2, setPane2Step2] = useState<Pane2Step2>(DEFAULT_PANE2_STEP2);
  const [pane2Step3, setPane2Step3] = useState<Pane2Step3>(DEFAULT_PANE2_STEP3);
  const [pane3Step1, setPane3Step1] = useState<Pane3Step1>(DEFAULT_PANE3_STEP1);
  // Inline* は defaultValue のため、復元後に key を更新してリマウントする
  const [intakeFormKey, setIntakeFormKey] = useState(0);
  const [pane2FormKey, setPane2FormKey] = useState(0);
  const [pane3FormKey, setPane3FormKey] = useState(0);
  const [pane4Open, setPane4Open] = useState(true);
  const [casePersistReady, setCasePersistReady] = useState(false);

  useEffect(() => {
    const stored = loadCaseStorage(seed);
    // mount 後コールバックで反映（初回レンダーは seed のまま hydration を一致させる）
    const id = window.setTimeout(() => {
      setCaseA00(stored.case_a00);
      setSelectedPhenomenonId(stored.selected_phenomenon_id);
      setPhenomena(stored.phenomena);
      setPane1Intake(stored.pane1_intake);
      setPane2Step1(stored.pane2_step1);
      setPane2Step2(stored.pane2_step2);
      setPane2Step3(stored.pane2_step3);
      setPane3Step1(stored.pane3_step1);
      setIntakeFormKey((key) => key + 1);
      setPane2FormKey((key) => key + 1);
      setPane3FormKey((key) => key + 1);
      setCasePersistReady(true);
    }, 0);
    return () => {
      window.clearTimeout(id);
      setCasePersistReady(false);
    };
  }, [seed]);

  useDebouncedEffect(
    () => {
      if (!casePersistReady) {
        return;
      }
      saveCaseStorage({
        case_a00: caseA00,
        selected_phenomenon_id: selectedPhenomenonId,
        phenomena,
        pane1_intake: pane1Intake,
        pane2_step1: pane2Step1,
        pane2_step2: pane2Step2,
        pane2_step3: pane2Step3,
        pane3_step1: pane3Step1,
      });
    },
    [
      caseA00,
      selectedPhenomenonId,
      phenomena,
      pane1Intake,
      pane2Step1,
      pane2Step2,
      pane2Step3,
      pane3Step1,
      casePersistReady,
    ],
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

  const updatePane1Intake = useCallback((patch: Partial<Pane1Intake>) => {
    setPane1Intake((prev) => ({ ...prev, ...patch }));
  }, []);

  const updatePane2Hypothesis = useCallback(
    (index: number, patch: Partial<Pane2Hypothesis>) => {
      setPane2Step1((prev) => ({
        hypotheses: prev.hypotheses.map((hypothesis, currentIndex) =>
          currentIndex === index ? { ...hypothesis, ...patch } : hypothesis,
        ),
      }));
    },
    [],
  );

  const togglePane2ChainBreak = useCallback(
    (transitionId: ResponsibilityChainTransitionId) => {
      setPane2Step2((prev) => {
        const existing = prev.breaks.find(
          (item) => item.transition_id === transitionId,
        );
        if (existing) {
          return {
            breaks: prev.breaks.filter(
              (item) => item.transition_id !== transitionId,
            ),
          };
        }
        return {
          breaks: [...prev.breaks, { transition_id: transitionId, memo: "" }],
        };
      });
    },
    [],
  );

  const updatePane2ChainBreakMemo = useCallback(
    (transitionId: ResponsibilityChainTransitionId, memo: string) => {
      setPane2Step2((prev) => ({
        breaks: prev.breaks.map((item) =>
          item.transition_id === transitionId ? { ...item, memo } : item,
        ),
      }));
    },
    [],
  );

  const updatePane2Step3Evaluation = useCallback(
    (index: number, patch: Partial<Pane2Step3Evaluation>) => {
      setPane2Step3((prev) => ({
        ...prev,
        evaluations: prev.evaluations.map((evaluation, currentIndex) =>
          currentIndex === index ? { ...evaluation, ...patch } : evaluation,
        ),
      }));
    },
    [],
  );

  const togglePane2Step3Pane3Selection = useCallback((index: number) => {
    setPane2Step3((prev) => {
      const alreadySelected = prev.selected_for_pane3.includes(index);
      if (alreadySelected) {
        return {
          ...prev,
          selected_for_pane3: prev.selected_for_pane3.filter(
            (item) => item !== index,
          ),
        };
      }
      if (prev.selected_for_pane3.length >= 2) {
        return prev;
      }
      return {
        ...prev,
        selected_for_pane3: [...prev.selected_for_pane3, index],
      };
    });
  }, []);

  const updatePane3Step1Entry = useCallback(
    (index: number, patch: Partial<Pane3Step1Entry>) => {
      setPane3Step1((prev) => ({
        entries: prev.entries.map((entry, currentIndex) =>
          currentIndex === index ? { ...entry, ...patch } : entry,
        ),
      }));
    },
    [],
  );

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
        pane1Intake={pane1Intake}
        intakeFormKey={intakeFormKey}
        onSelectPhenomenon={selectPhenomenon}
        onUpdateCaseA00={updateCaseA00}
        onUpdatePane1Intake={updatePane1Intake}
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
            pane1Intake={pane1Intake}
            pane2Step1={pane2Step1}
            pane2Step2={pane2Step2}
            pane2Step3={pane2Step3}
            pane2FormKey={pane2FormKey}
            primaryIntervention={primaryIntervention}
            perspectives={seed.perspectives}
            perspectiveDetails={seed.perspectiveDetails}
            relevanceMap={relevanceMap}
            onUpdatePane2Hypothesis={updatePane2Hypothesis}
            onTogglePane2ChainBreak={togglePane2ChainBreak}
            onUpdatePane2ChainBreakMemo={updatePane2ChainBreakMemo}
            onUpdatePane2Step3Evaluation={updatePane2Step3Evaluation}
            onTogglePane2Step3Pane3Selection={togglePane2Step3Pane3Selection}
          />
          <ReformStrategyDesignPane
            selectedPhenomenon={selectedPhenomenon}
            primaryIntervention={primaryIntervention}
            design={reformStrategyDesign}
            pane1Intake={pane1Intake}
            pane2Hypotheses={pane2Step1.hypotheses}
            pane2Step3={pane2Step3}
            pane3Step1={pane3Step1}
            pane3FormKey={pane3FormKey}
            onUpdatePane3Entry={updatePane3Step1Entry}
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
