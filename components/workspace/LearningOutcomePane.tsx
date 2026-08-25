"use client";

import { useState, type ReactNode } from "react";
import { ArrowDown, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { type ResolvedSkillAssetization } from "@/lib/koyasu/skill-assetization";
import {
  type Pane2Hypothesis,
  type Pane3Step3,
  type Pane4V1,
  type Pane4V1MultiPerspectivePatch,
  type Pane4V1Review,
  type Phenomenon,
} from "@/lib/koyasu/schema";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SectionLabel } from "@/components/primitives";
import { Pane4LearningCycle } from "@/components/workspace/Pane4LearningCycle";
import { Pane4Toggle } from "@/components/workspace/Pane4Toggle";

type SkillAssetizationPaneProps = {
  selectedPhenomenon: Phenomenon;
  assetization: ResolvedSkillAssetization;
  pane2Hypotheses: Pane2Hypothesis[];
  selectedHypothesisIndexes: number[];
  pane3Step3: Pane3Step3;
  pane4V1: Pane4V1;
  pane4FormKey: number;
  pane4Open: boolean;
  onTogglePane4: () => void;
  onUpdatePane4Step1: (patch: Partial<Pane4V1["step1"]>) => void;
  onUpdatePane4Step2: (patch: Partial<Pane4V1["step2"]>) => void;
  onUpdatePane4Step3: (patch: Partial<Pane4V1["step3"]>) => void;
  onUpdatePane4Review: (index: number, patch: Partial<Pane4V1Review>) => void;
  onUpdatePane4Step5: (patch: Partial<Pane4V1["step5"]>) => void;
  onUpdatePane4Resistance: (
    patch: Partial<Pane4V1["resistance_observation"]>,
  ) => void;
  onUpdatePane4MultiPerspectiveReview: (
    patch: Pane4V1MultiPerspectivePatch,
  ) => void;
  onUpdatePane4LearningMemo: (patch: Partial<Pane4V1["learning_memo"]>) => void;
};

function AssetSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2 px-4 py-3">
      <div className="flex flex-col gap-0.5">
        <SectionLabel tone="conclusion" className="normal-case tracking-normal">
          ■ {title}
        </SectionLabel>
        {description ? (
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function FlowStep({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-4 py-0.5">
      <ArrowDown className="size-3 text-muted-foreground/60" aria-hidden />
      {label ? (
        <span className="text-[10px] text-muted-foreground">{label}</span>
      ) : null}
    </div>
  );
}

function FactList({ items, emptyLabel }: { items: string[]; emptyLabel: string }) {
  if (items.length === 0) {
    return <p className="text-xs text-muted-foreground">{emptyLabel}</p>;
  }
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-lg border border-border bg-muted/30 px-2.5 py-2 text-xs leading-relaxed text-foreground"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function InsightList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="text-xs leading-relaxed text-muted-foreground"
        >
          · {item}
        </li>
      ))}
    </ul>
  );
}

function SkillList({
  skills,
  variant = "default",
}: {
  skills: Array<{ id: string; label: string }>;
  variant?: "default" | "accumulated";
}) {
  if (skills.length === 0) {
    return <p className="text-xs text-muted-foreground">（準備中）</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {skills.map((skill) => (
        <li
          key={skill.id}
          className={cn(
            "flex flex-col gap-1 rounded-lg border p-2.5",
            variant === "accumulated"
              ? "border-primary/40 bg-primary/5"
              : "border-border bg-muted/30",
          )}
        >
          <Badge variant={variant === "accumulated" ? "default" : "outline"}>
            {skill.id}
          </Badge>
          <span className="text-xs leading-relaxed text-foreground">
            {skill.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function SkillAssetizationPane({
  selectedPhenomenon,
  assetization,
  pane2Hypotheses,
  selectedHypothesisIndexes,
  pane3Step3,
  pane4V1,
  pane4FormKey,
  pane4Open,
  onTogglePane4,
  onUpdatePane4Step1,
  onUpdatePane4Step2,
  onUpdatePane4Step3,
  onUpdatePane4Review,
  onUpdatePane4Step5,
  onUpdatePane4Resistance,
  onUpdatePane4MultiPerspectiveReview,
  onUpdatePane4LearningMemo,
}: SkillAssetizationPaneProps) {
  const isPlaceholder = assetization.placeholder ?? false;
  const [legacyOpen, setLegacyOpen] = useState(false);

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-l border-border bg-background",
        "overflow-hidden transition-[width] duration-200 ease-linear",
        pane4Open ? "w-[320px]" : "w-12",
      )}
    >
      {pane4Open ? (
        <>
          <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <h2 className="truncate text-sm font-semibold text-conclusion">
                学びと成果
              </h2>
              <p className="truncate text-[10px] text-muted-foreground">
                実行から学び、次のGAPへ
              </p>
            </div>
            <Pane4Toggle open={pane4Open} onToggle={onTogglePane4} />
          </header>

          <ScrollArea className="min-h-0 flex-1">
            <p className="px-3 pt-3 text-[10px] text-muted-foreground">
              フォーカス：
              <span className="font-medium text-foreground">
                {selectedPhenomenon.label}
              </span>
            </p>

            <Pane4LearningCycle
              pane3Step3={pane3Step3}
              pane2Hypotheses={pane2Hypotheses}
              selectedHypothesisIndexes={selectedHypothesisIndexes}
              pane4V1={pane4V1}
              pane4FormKey={pane4FormKey}
              onUpdateStep1={onUpdatePane4Step1}
              onUpdateStep2={onUpdatePane4Step2}
              onUpdateStep3={onUpdatePane4Step3}
              onUpdateReview={onUpdatePane4Review}
              onUpdateStep5={onUpdatePane4Step5}
              onUpdateResistance={onUpdatePane4Resistance}
              onUpdateMultiPerspectiveReview={
                onUpdatePane4MultiPerspectiveReview
              }
              onUpdateLearningMemo={onUpdatePane4LearningMemo}
            />

            <div className="px-3 pb-3">
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
                        SKILL資産化（参考）
                      </SectionLabel>
                      <p className="text-[10px] text-muted-foreground">
                        経験 → 知恵 → SKILL → OS（本格実装はまだ）
                      </p>
                    </div>
                    <ChevronDown
                      aria-hidden
                      className="size-4 shrink-0 text-muted-foreground transition-transform in-data-[panel-open]:rotate-180"
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t border-border">
                      <p className="px-4 pt-2 text-[10px] leading-relaxed text-muted-foreground">
                        改革実行 → Fact → Result → Insight → SKILL → OS蓄積
                      </p>
                      {isPlaceholder ? (
                        <AssetSection title="準備中">
                          <p className="text-xs text-muted-foreground">
                            この現象の SKILL
                            資産化データは準備中です。若手離職で一気通貫の流れを確認できます。
                          </p>
                        </AssetSection>
                      ) : (
                        <>
                          <AssetSection title="改革実行">
                            <Card
                              size="sm"
                              className="border-primary/30 bg-primary/5"
                            >
                              <CardContent className="p-2.5">
                                <p className="text-xs text-muted-foreground">
                                  Pane3 で設計した戦略に基づく実行フェーズ
                                </p>
                              </CardContent>
                            </Card>
                          </AssetSection>

                          <FlowStep label="実行結果（Fact）" />

                          <AssetSection
                            title="実行結果（Fact）"
                            description="今回実際に実施したこと（事実のみ）"
                          >
                            <FactList
                              items={assetization.facts}
                              emptyLabel="実行結果は未登録です"
                            />
                          </AssetSection>

                          <FlowStep label="成果（Result）" />

                          <AssetSection
                            title="成果（Result）"
                            description="改革によって起こった変化"
                          >
                            <FactList
                              items={assetization.results}
                              emptyLabel="成果は未登録です"
                            />
                          </AssetSection>

                          <FlowStep label="気付き（Insight）" />

                          <AssetSection
                            title="気付き（Insight）"
                            description="今回最も重要だった学び"
                          >
                            <InsightList items={assetization.insights} />
                          </AssetSection>

                          <FlowStep label="組織改革SKILL" />

                          <AssetSection
                            title="組織改革SKILL"
                            description="再利用可能な SKILL へ変換"
                          >
                            <SkillList skills={assetization.orgReformSkills} />
                          </AssetSection>

                          <FlowStep label="OSへ蓄積" />

                          <AssetSection
                            title="今回OSへ蓄積されたSKILL"
                            description="次の改革で再利用する知識資産"
                          >
                            <SkillList
                              skills={assetization.accumulatedSkills}
                              variant="accumulated"
                            />
                          </AssetSection>
                        </>
                      )}
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </div>

            <Separator className="my-2" />
          </ScrollArea>
        </>
      ) : (
        <div className="flex h-12 shrink-0 items-center justify-center border-b border-border">
          <Pane4Toggle open={pane4Open} onToggle={onTogglePane4} />
        </div>
      )}
    </aside>
  );
}

/** @deprecated LearningOutcomePane からの移行用エイリアス */
export const LearningOutcomePane = SkillAssetizationPane;
