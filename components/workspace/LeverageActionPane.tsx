"use client";

import { type ReactNode, useState } from "react";
import { ArrowDown, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  formatStrategyRating,
  STRATEGY_COMPARISON_AXES,
  type ResolvedReformStrategyDesign,
  type StrategyComparisonScores,
  type StrategyRating,
} from "@/lib/koyasu/reform-strategies";
import {
  DEFAULT_PANE3_STEP1_ENTRY,
  type Pane1Intake,
  type Pane2Hypothesis,
  type Pane2Step3,
  type Pane3Step1,
  type Pane3Step1Entry,
  type Pane3Step2,
  type Pane3Step2RoleFields,
  type Pane3Step2RoleId,
  type Pane3Step3,
  type Pane3Step3Backing,
  type Pane3Step3Field,
  type Pane3Step3FieldId,
  type Phenomenon,
} from "@/lib/koyasu/schema";
import { type PrimaryInterventionContext } from "@/lib/koyasu/phenomenon-diagnostics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { InlineTextareaField, SectionLabel } from "@/components/primitives";
import { Pane3RoleDesignStep } from "@/components/workspace/Pane3RoleDesignStep";
import { Pane3BabyStepStep } from "@/components/workspace/Pane3BabyStepStep";
import { StructuralHypothesisMap } from "@/components/workspace/StructuralHypothesisMap";

type ReformStrategyDesignPaneProps = {
  selectedPhenomenon: Phenomenon;
  primaryIntervention: PrimaryInterventionContext;
  design: ResolvedReformStrategyDesign;
  pane1Intake: Pane1Intake;
  pane2Hypotheses: Pane2Hypothesis[];
  pane2Step3: Pane2Step3;
  pane3Step1: Pane3Step1;
  pane3Step2: Pane3Step2;
  pane3Step3: Pane3Step3;
  pane3FormKey: number;
  onUpdatePane3Entry: (
    index: number,
    patch: Partial<Pane3Step1Entry>,
  ) => void;
  onUpdatePane3Step2Role: (
    roleId: Pane3Step2RoleId,
    patch: Partial<Pane3Step2RoleFields>,
  ) => void;
  onUpdatePane3Step3Field: (
    fieldId: Pane3Step3FieldId,
    patch: Partial<Pane3Step3Field>,
  ) => void;
  onUpdatePane3Step3Backing: (patch: Partial<Pane3Step3Backing>) => void;
};

function StrategySection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <SectionLabel tone="conclusion" className="normal-case tracking-normal">
          ■ {title}
        </SectionLabel>
        {description ? (
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function InterventionPremiseSummary({
  pane1Intake,
  selectedIndices,
  pane2Hypotheses,
  pane3Step1,
}: {
  pane1Intake: Pane1Intake;
  selectedIndices: number[];
  pane2Hypotheses: Pane2Hypothesis[];
  pane3Step1: Pane3Step1;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const primaryIndex = selectedIndices[0] ?? 0;
  const primaryStep1 =
    pane3Step1.entries[primaryIndex] ?? { ...DEFAULT_PANE3_STEP1_ENTRY };

  return (
    <Card size="sm" className="border-primary/30 bg-primary/5">
      <CardContent className="flex flex-col gap-2 p-3">
        <SectionLabel
          tone="conclusion"
          className="text-xs normal-case tracking-normal"
        >
          今回の介入前提
        </SectionLabel>
        <dl className="flex flex-col gap-1.5">
          <div className="flex flex-col gap-0.5">
            <dt className="text-[10px] text-muted-foreground">Pane1 GAP</dt>
            <dd className="text-[11px] leading-relaxed text-foreground">
              {pane1Intake.gap.trim() || "Pane1でまだ未記入です"}
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-[10px] text-muted-foreground">
              優先構造仮説（Pane2）
            </dt>
            <dd className="flex flex-col gap-0.5">
              {selectedIndices.map((index) => (
                <span
                  key={`premise-hyp-${index}`}
                  className="text-[11px] leading-relaxed text-foreground"
                >
                  {index + 1}.{" "}
                  {pane2Hypotheses[index]?.structural_hypothesis.trim() ||
                    "（未記入）"}
                </span>
              ))}
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-[10px] text-muted-foreground">
              構造上の本丸候補（Step1）
            </dt>
            <dd className="text-[11px] leading-relaxed text-foreground">
              {primaryStep1.structural_core_candidate.trim() || "（未記入）"}
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-[10px] text-muted-foreground">
              最初に手を入れる場面（Step1）
            </dt>
            <dd className="text-[11px] leading-relaxed text-foreground">
              {primaryStep1.first_entry_candidate.trim() || "（未記入）"}
            </dd>
          </div>
        </dl>

        <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
          <CollapsibleTrigger
            nativeButton={true}
            render={
              <button
                type="button"
                className={cn(
                  "group/premise flex w-full items-center justify-between gap-2 rounded-md px-1 py-1 text-left text-[11px] text-muted-foreground",
                  "outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                )}
              />
            }
          >
            <span>前提を詳しく見る</span>
            <ChevronDown
              aria-hidden
              className="size-3.5 shrink-0 transition-transform in-data-[panel-open]:rotate-180"
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="flex flex-col gap-2 border-t border-border pt-2">
              {selectedIndices.map((hypothesisIndex) => {
                const hypothesis = pane2Hypotheses[hypothesisIndex];
                const step1Entry =
                  pane3Step1.entries[hypothesisIndex] ?? {
                    ...DEFAULT_PANE3_STEP1_ENTRY,
                  };
                return (
                  <div
                    key={`premise-detail-${hypothesisIndex}`}
                    className="flex flex-col gap-1 rounded-lg border border-border bg-card p-2.5"
                  >
                    <p className="text-[10px] font-medium text-muted-foreground">
                      優先構造仮説 {hypothesisIndex + 1}
                    </p>
                    <p className="text-[11px] leading-relaxed text-foreground">
                      {hypothesis?.structural_hypothesis.trim() || "（未記入）"}
                    </p>
                    {hypothesis?.evidence.trim() ? (
                      <p className="text-[10px] leading-relaxed text-muted-foreground">
                        根拠: {hypothesis.evidence.trim()}
                      </p>
                    ) : null}
                    {hypothesis?.follow_up_question.trim() ? (
                      <p className="text-[10px] leading-relaxed text-muted-foreground">
                        確認したいこと: {hypothesis.follow_up_question.trim()}
                      </p>
                    ) : null}
                    {step1Entry.why_start_here.trim() ? (
                      <p className="text-[10px] leading-relaxed text-muted-foreground">
                        なぜここから: {step1Entry.why_start_here.trim()}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

function FlowStep({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 py-0.5">
      <ArrowDown className="size-3 text-muted-foreground/60" aria-hidden />
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

function StarRating({ rating, ariaLabel }: { rating: StrategyRating; ariaLabel: string }) {
  return (
    <span
      className="font-mono text-[10px] tracking-tight text-primary"
      role="img"
      aria-label={`${ariaLabel}: ${rating}/5`}
    >
      {formatStrategyRating(rating)}
    </span>
  );
}

function StrategyComparisonTable({
  candidates,
}: {
  candidates: ResolvedReformStrategyDesign["candidatesWithLabels"];
}) {
  return (
    <div className="flex flex-col gap-3">
      {candidates.map((candidate) => (
        <Card
          key={candidate.id}
          size="sm"
          className={cn(
            candidate.isAdopted && "border-primary/40 bg-primary/5",
          )}
        >
          <CardContent className="flex flex-col gap-2 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-conclusion">
                {candidate.label}
              </span>
              {candidate.isAdopted ? (
                <span className="text-[10px] text-muted-foreground">
                  （採用候補）
                </span>
              ) : null}
            </div>
            <dl className="flex flex-col gap-1.5">
              {STRATEGY_COMPARISON_AXES.map(({ key, label }) => (
                <div
                  key={key}
                  className="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-2"
                >
                  <dt className="text-[10px] text-muted-foreground">{label}</dt>
                  <dd>
                    <StarRating
                      rating={candidate.scores[key as keyof StrategyComparisonScores]}
                      ariaLabel={label}
                    />
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function BabyStepScenario({ steps }: { steps: [string, string, string, string] }) {
  return (
    <div className="flex flex-col gap-1">
      {steps.map((step, index) => (
        <div key={step} className="flex flex-col gap-1">
          <div className="flex flex-col gap-0.5 rounded-lg border border-border bg-muted/30 p-2.5">
            <span className="text-[10px] font-medium text-muted-foreground">
              Step{index + 1}
            </span>
            <span className="text-sm text-foreground">{step}</span>
          </div>
          {index < steps.length - 1 ? (
            <div className="flex justify-center py-0.5">
              <ArrowDown
                className="size-3 text-muted-foreground/60"
                aria-hidden
              />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function LegacyReformStrategyDetail({
  selectedPhenomenon,
  primaryIntervention,
  design,
}: {
  selectedPhenomenon: Phenomenon;
  primaryIntervention: PrimaryInterventionContext;
  design: ResolvedReformStrategyDesign;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[11px] text-muted-foreground">
        フォーカス：
        <span className="font-medium text-foreground">
          {selectedPhenomenon.label}
        </span>
      </p>

      <p className="text-[10px] leading-relaxed text-muted-foreground">
        介入本丸構造 → 改革戦略候補 → 比較評価 → 採用戦略 → 突破口 →
        BABY STEP
      </p>

      <StrategySection title="介入本丸構造">
        <Card size="sm" className="border-primary/30 bg-primary/5">
          <CardContent className="p-3">
            <p className="text-sm font-semibold text-conclusion">
              {primaryIntervention.structure.label}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {primaryIntervention.structure.summary}
            </p>
          </CardContent>
        </Card>
      </StrategySection>

      <FlowStep label="改革戦略候補" />

      <StrategySection
        title="改革戦略候補"
        description={`${design.structureLabel}に対する複数の改革戦略`}
      >
        <ul className="flex flex-col gap-1.5">
          {design.candidates.map((candidate) => (
            <li
              key={candidate.id}
              className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground"
            >
              {candidate.label}
            </li>
          ))}
        </ul>
      </StrategySection>

      <FlowStep label="比較評価" />

      <StrategySection title="比較評価" description="7軸での戦略比較">
        <StrategyComparisonTable candidates={design.candidatesWithLabels} />
      </StrategySection>

      <FlowStep label="採用戦略" />

      <StrategySection title="採用戦略" description="比較結果から選定">
        <Card
          size="sm"
          className="border-primary/40 bg-primary/5 ring-1 ring-primary/20"
        >
          <CardContent className="flex flex-col gap-2 p-3">
            <p className="text-sm font-semibold text-conclusion">
              {design.adoptedStrategy.label}
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              理由：{design.adoptionReason}
            </p>
          </CardContent>
        </Card>
      </StrategySection>

      <FlowStep label="突破口（Breakthrough Point）" />

      <StrategySection
        title="突破口（Breakthrough Point）"
        description="最初に突破すべきポイント"
      >
        <Card size="sm">
          <CardContent className="p-3">
            <p className="text-sm leading-relaxed text-foreground">
              {design.breakthroughPoint}
            </p>
          </CardContent>
        </Card>
      </StrategySection>

      <FlowStep label="BABY STEP改革シナリオ" />

      <StrategySection
        title="BABY STEP改革シナリオ"
        description="小さく始め、段階的に広げる"
      >
        <BabyStepScenario steps={design.babySteps} />
      </StrategySection>
    </div>
  );
}

function LeverageHypothesisCard({
  hypothesisIndex,
  hypothesis,
  entry,
  pane3FormKey,
  onUpdate,
}: {
  hypothesisIndex: number;
  hypothesis: Pane2Hypothesis | undefined;
  entry: Pane3Step1Entry;
  pane3FormKey: number;
  onUpdate: (patch: Partial<Pane3Step1Entry>) => void;
}) {
  const summary =
    hypothesis?.structural_hypothesis.trim() || "（Step1でまだ未記入）";

  return (
    <Card size="sm">
      <CardHeader className="flex flex-col gap-1.5 p-3 pb-2">
        <CardTitle className="text-sm text-conclusion">
          優先構造仮説 {hypothesisIndex + 1}
        </CardTitle>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {summary}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-3 pt-0">
        <div className="flex flex-col gap-1.5 rounded-lg border border-primary/30 bg-primary/5 p-2.5">
          <SectionLabel
            tone="conclusion"
            className="text-xs normal-case tracking-normal"
          >
            構造上の本丸候補
          </SectionLabel>
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            構造として変えたい本丸の候補（確定ではありません）。再生産ハブ・断絶・上流の閉じ方など。
          </p>
          <InlineTextareaField
            key={`pane3-core-${hypothesisIndex}-${pane3FormKey}`}
            value={entry.structural_core_candidate}
            onSave={(structural_core_candidate) =>
              onUpdate({ structural_core_candidate })
            }
            ariaLabel={`Pane3 構造上の本丸候補 仮説${hypothesisIndex + 1}`}
            placeholder="例: 決裁・期限・担当が会議で閉じず、下流に曖昧なまま流れる構造"
          />
        </div>

        <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/30 p-2.5">
          <SectionLabel
            tone="conclusion"
            className="text-xs normal-case tracking-normal"
          >
            最初に手を入れる場面候補
          </SectionLabel>
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            実務で小さく始める場面（本丸そのものでなくてよい）。会議・起票・引き継ぎなど具体の接点。
          </p>
          <InlineTextareaField
            key={`pane3-entry-${hypothesisIndex}-${pane3FormKey}`}
            value={entry.first_entry_candidate}
            onSave={(first_entry_candidate) =>
              onUpdate({ first_entry_candidate })
            }
            ariaLabel={`Pane3 最初に手を入れる場面候補 仮説${hypothesisIndex + 1}`}
            placeholder="例: 定例会議の最後5分で、決裁者・期限・担当を記録で閉じる"
          />
        </div>

        <div className="flex flex-col gap-1">
          <SectionLabel
            tone="conclusion"
            className="text-xs normal-case tracking-normal"
          >
            なぜ、ここから始めるのか
          </SectionLabel>
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            本丸を一気に攻めるのではなく、この最初の一手から始める理由。
          </p>
          <InlineTextareaField
            key={`pane3-why-${hypothesisIndex}-${pane3FormKey}`}
            value={entry.why_start_here}
            onSave={(why_start_here) => onUpdate({ why_start_here })}
            ariaLabel={`Pane3 なぜここから始めるのか 仮説${hypothesisIndex + 1}`}
            placeholder="例: 上流が閉じないと下流のやり直しが再生産される。まず会議の閉じ方から触れると影響が見える"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function ReformStrategyDesignPane({
  selectedPhenomenon,
  primaryIntervention,
  design,
  pane1Intake,
  pane2Hypotheses,
  pane2Step3,
  pane3Step1,
  pane3Step2,
  pane3Step3,
  pane3FormKey,
  onUpdatePane3Entry,
  onUpdatePane3Step2Role,
  onUpdatePane3Step3Field,
  onUpdatePane3Step3Backing,
}: ReformStrategyDesignPaneProps) {
  const [legacyOpen, setLegacyOpen] = useState(false);
  const [hypothesisMapOpen, setHypothesisMapOpen] = useState(false);

  const selectedIndices = pane2Step3.selected_for_pane3;
  const primaryIndex = selectedIndices[0] ?? 0;
  const primaryStep1Entry =
    pane3Step1.entries[primaryIndex] ?? { ...DEFAULT_PANE3_STEP1_ENTRY };
  const firstEntryScene =
    primaryStep1Entry.first_entry_candidate.trim() ||
    "（Step1で「最初に手を入れる場面候補」を記入するとここに表示されます）";

  return (
    <>
      <section className="flex min-w-0 flex-[1.4] flex-col bg-background">
        <header className="flex h-auto min-h-12 shrink-0 flex-col justify-center gap-0.5 border-b border-border px-4 py-2">
          <h2 className="text-sm font-semibold text-conclusion">改革戦略設計</h2>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Pane3 Step1–3 | 本丸／最初の一手、役割の引き受け、今回試す BABY STEP
          </p>
        </header>

        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-4 p-4">
            {selectedIndices.length > 0 ? (
              <InterventionPremiseSummary
                pane1Intake={pane1Intake}
                selectedIndices={selectedIndices}
                pane2Hypotheses={pane2Hypotheses}
                pane3Step1={pane3Step1}
              />
            ) : null}

            <Card size="sm" className="border-border bg-muted/30">
              <CardContent className="flex flex-col gap-2 p-3">
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  構造仮説マップで本丸と最初の一手を分けて考える（本丸 ≠
                  最初の一手でもよい）。
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setHypothesisMapOpen(true)}
                >
                  構造仮説マップを見る
                </Button>
              </CardContent>
            </Card>

            <Card size="sm" className="border-border bg-card">
              <CardContent className="p-3">
                <p className="text-[10px] leading-relaxed text-muted-foreground">
                  介入は権限・スポンサーの支え・階層／忖度・実行者が不利にならないかも踏まえて考えます（Step1では評価軸は増やしません）。
                </p>
              </CardContent>
            </Card>

            {selectedIndices.length === 0 ? (
              <Card size="sm" className="border-border bg-muted/30">
                <CardContent className="flex flex-col gap-1 p-3">
                  <p className="text-sm font-medium text-conclusion">
                    Pane2で優先仮説を選択してください
                  </p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Pane2 Step3で「Pane3候補にする」を最大2つまで選ぶと、ここに本丸／最初の一手の入力が現れます。
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {selectedIndices.map((hypothesisIndex) => {
                  const entry =
                    pane3Step1.entries[hypothesisIndex] ?? {
                      ...DEFAULT_PANE3_STEP1_ENTRY,
                    };
                  return (
                    <LeverageHypothesisCard
                      key={`selected-${hypothesisIndex}-${pane3FormKey}`}
                      hypothesisIndex={hypothesisIndex}
                      hypothesis={pane2Hypotheses[hypothesisIndex]}
                      entry={entry}
                      pane3FormKey={pane3FormKey}
                      onUpdate={(patch) =>
                        onUpdatePane3Entry(hypothesisIndex, patch)
                      }
                    />
                  );
                })}
              </div>
            )}

            {selectedIndices.length > 0 ? (
              <>
                <Separator />
                <Pane3RoleDesignStep
                  firstEntryScene={firstEntryScene}
                  pane3Step2={pane3Step2}
                  pane3FormKey={pane3FormKey}
                  onUpdateRole={onUpdatePane3Step2Role}
                />

                <Separator />

                <Pane3BabyStepStep
                  firstEntryScene={firstEntryScene}
                  toBe={pane1Intake.to_be}
                  pane3Step1={pane3Step1}
                  pane3Step2={pane3Step2}
                  pane3Step3={pane3Step3}
                  pane3FormKey={pane3FormKey}
                  primaryHypothesisIndex={primaryIndex}
                  onUpdateField={onUpdatePane3Step3Field}
                  onUpdateBacking={onUpdatePane3Step3Backing}
                />
              </>
            ) : null}

            <Separator />

            <Collapsible open={legacyOpen} onOpenChange={setLegacyOpen}>
              <Card size="sm" className="rounded-lg">
                <CollapsibleTrigger
                  nativeButton={false}
                  render={
                    <div
                      className={cn(
                        "group/legacy flex cursor-pointer items-center justify-between gap-2 p-3",
                        "rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      )}
                    />
                  }
                >
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <SectionLabel
                      tone="conclusion"
                      className="normal-case tracking-normal"
                    >
                      詳細・旧分析
                    </SectionLabel>
                    <p className="text-[11px] text-muted-foreground">
                      7軸比較・採用戦略・突破口・BABY STEP（参照用）
                    </p>
                  </div>
                  <ChevronDown
                    aria-hidden
                    className="size-4 shrink-0 text-muted-foreground transition-transform in-data-[panel-open]:rotate-180"
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="flex flex-col gap-4 border-t border-border p-3">
                    <LegacyReformStrategyDetail
                      selectedPhenomenon={selectedPhenomenon}
                      primaryIntervention={primaryIntervention}
                      design={design}
                    />
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>
        </ScrollArea>
      </section>

      <Sheet open={hypothesisMapOpen} onOpenChange={setHypothesisMapOpen}>
        <SheetContent
          side="right"
          className="w-[95vw] overflow-y-auto data-[side=right]:w-[95vw] data-[side=right]:sm:max-w-none"
        >
          <SheetHeader>
            <SheetTitle className="text-conclusion">構造仮説マップ</SheetTitle>
            <SheetDescription>
              GAPが構造として再生産される仮説の流れ（確定因果ではありません）
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-3 px-4 pb-6">
            <StructuralHypothesisMap />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

/** @deprecated LeverageActionPane からの移行用エイリアス */
export const LeverageActionPane = ReformStrategyDesignPane;
