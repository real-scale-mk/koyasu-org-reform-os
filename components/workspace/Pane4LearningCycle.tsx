"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { Pane4SummaryReviewSheet } from "@/components/workspace/Pane4SummaryReviewSheet";

import {
  PANE3_STEP3_DEFAULT_PROPOSALS,
  PANE3_STEP3_FIELD_DEFS,
  PANE3_STEP3_STUMBLE_OBSERVATION_POINTS,
  PANE4_V1_EXECUTION_STATUS_LABELS,
  PANE4_V1_EXECUTION_STATUS_VALUES,
  PANE4_V1_HYPOTHESIS_REVIEW_STATUS_LABELS,
  PANE4_V1_HYPOTHESIS_REVIEW_STATUS_VALUES,
  PANE4_V1_FINAL_DECISION_LABELS,
  PANE4_V1_FINAL_DECISION_VALUES,
  PANE4_V1_LENS_STATUS_LABELS,
  PANE4_V1_LENS_STATUS_VALUES,
  PANE4_V1_NEXT_DIRECTION_LABELS,
  PANE4_V1_NEXT_DIRECTION_VALUES,
  PANE4_V1_RETURN_DESTINATION_DEFS,
  PANE4_V1_RETURN_DESTINATION_VALUES,
  PANE4_V1_REVIEW_LENS_DEFS,
  type Pane2Hypothesis,
  type Pane3Step3,
  type Pane3Step3Backing,
  type Pane3Step3Field,
  type Pane4V1,
  type Pane4V1ExecutionStatus,
  type Pane4V1FinalDecision,
  type Pane4V1HypothesisReviewStatus,
  type Pane4V1LensStatus,
  type Pane4V1MultiPerspectivePatch,
  type Pane4V1NextDirection,
  type Pane4V1ReturnDestination,
  type Pane4V1Review,
} from "@/lib/koyasu/schema";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { InlineTextareaField, SectionLabel } from "@/components/primitives";

type Pane4LearningCycleProps = {
  pane3Step3: Pane3Step3;
  pane2Hypotheses: Pane2Hypothesis[];
  selectedHypothesisIndexes: number[];
  pane4V1: Pane4V1;
  pane4FormKey: number;
  onUpdateStep1: (patch: Partial<Pane4V1["step1"]>) => void;
  onUpdateStep2: (patch: Partial<Pane4V1["step2"]>) => void;
  onUpdateStep3: (patch: Partial<Pane4V1["step3"]>) => void;
  onUpdateReview: (index: number, patch: Partial<Pane4V1Review>) => void;
  onUpdateStep5: (patch: Partial<Pane4V1["step5"]>) => void;
  onUpdateResistance: (
    patch: Partial<Pane4V1["resistance_observation"]>,
  ) => void;
  onUpdateMultiPerspectiveReview: (patch: Pane4V1MultiPerspectivePatch) => void;
  onUpdateLearningMemo: (patch: Partial<Pane4V1["learning_memo"]>) => void;
};

function displayBabyStepField(
  field: Pane3Step3Field,
  proposal: string,
): string {
  const value = field.value.trim();
  if (value) return value;
  if (field.adopted_default) return proposal;
  return "Pane3でまだ未決定です";
}

function backingStatusLabel(backing: Pane3Step3Backing): string {
  return backing.status === "confirmed" ? "確認済み" : "未確認";
}

function LearningStep({
  step,
  title,
  description,
  defaultOpen = true,
  children,
}: {
  step: string;
  title: string;
  description: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card size="sm" className="rounded-lg">
        <CollapsibleTrigger
          nativeButton={false}
          render={
            <div
              className={cn(
                "group/step flex cursor-pointer items-start justify-between gap-2 p-3",
                "rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              )}
            />
          }
        >
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <SectionLabel
              tone="conclusion"
              className="text-xs tracking-normal normal-case"
            >
              {step} {title}
            </SectionLabel>
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
          <ChevronDown
            aria-hidden
            className="size-4 shrink-0 text-muted-foreground transition-transform in-data-[panel-open]:rotate-180"
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="flex flex-col gap-2.5 border-t border-border p-3 pt-2.5">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function ExtraSection({
  title,
  description,
  defaultOpen = false,
  children,
}: {
  title: string;
  description: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card size="sm" className="rounded-lg">
        <CollapsibleTrigger
          nativeButton={false}
          render={
            <div
              className={cn(
                "group/extra flex cursor-pointer items-start justify-between gap-2 p-3",
                "rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              )}
            />
          }
        >
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <SectionLabel
              tone="conclusion"
              className="text-xs tracking-normal normal-case"
            >
              {title}
            </SectionLabel>
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
          <ChevronDown
            aria-hidden
            className="size-4 shrink-0 text-muted-foreground transition-transform in-data-[panel-open]:rotate-180"
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="flex flex-col gap-2.5 border-t border-border p-3 pt-2.5">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function ReferenceBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <div className="text-[11px] leading-relaxed text-foreground">
        {children}
      </div>
    </div>
  );
}

export function Pane4LearningCycle({
  pane3Step3,
  pane2Hypotheses,
  selectedHypothesisIndexes,
  pane4V1,
  pane4FormKey,
  onUpdateStep1,
  onUpdateStep2,
  onUpdateStep3,
  onUpdateReview,
  onUpdateStep5,
  onUpdateResistance,
  onUpdateMultiPerspectiveReview,
  onUpdateLearningMemo,
}: Pane4LearningCycleProps) {
  const [summaryReviewOpen, setSummaryReviewOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-3 px-3 py-3">
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          Fact → Result → Insight / GAP → 仮説見直し → 次の一手 → Pane2 /
          Pane3へフィードバック
        </p>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          うまくいかなかったことも、構造を理解するための学習データです。成功を証明する場所ではありません。
        </p>

        <LearningStep
          step="Step1"
          title="Fact"
          description="実際に何が起きたか（評価ではなく事実）"
        >
          <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/30 p-2.5">
            <SectionLabel
              tone="conclusion"
              className="text-xs tracking-normal normal-case"
            >
              今回試したBABY STEP
            </SectionLabel>
            {PANE3_STEP3_FIELD_DEFS.map((field) => {
              const stored = pane3Step3[field.id];
              return (
                <ReferenceBlock key={field.id} label={field.label}>
                  <p>
                    {displayBabyStepField(
                      stored,
                      PANE3_STEP3_DEFAULT_PROPOSALS[field.id],
                    )}
                  </p>
                  {stored.supplement.trim() ? (
                    <p className="text-[10px] text-muted-foreground">
                      補足: {stored.supplement.trim()}
                    </p>
                  ) : null}
                </ReferenceBlock>
              );
            })}
          </div>

          <p className="text-[10px] leading-relaxed text-muted-foreground">
            ここでは評価ではなく、実際に起きた事実を記録します。
          </p>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] text-muted-foreground">
              A. 実際に何を実施したか
            </p>
            <InlineTextareaField
              key={`pane4-s1-done-${pane4FormKey}`}
              value={pane4V1.step1.what_was_done}
              onSave={(what_was_done) => onUpdateStep1({ what_was_done })}
              ariaLabel="Pane4 Step1 実際に何を実施したか"
              placeholder="1〜2文で。予定どおり実施した事実だけを書く"
            />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] text-muted-foreground">
              B. 予定と違ったことはあったか
            </p>
            <InlineTextareaField
              key={`pane4-s1-diff-${pane4FormKey}`}
              value={pane4V1.step1.what_differed}
              onSave={(what_differed) => onUpdateStep1({ what_differed })}
              ariaLabel="Pane4 Step1 予定と違ったこと"
              placeholder="実施者・タイミング・範囲など、予定との差があれば1〜2文"
            />
          </div>
        </LearningStep>

        <LearningStep
          step="Step2"
          title="Result"
          description="BABY STEPそのものが実行できたか"
        >
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            再発率や文化変容などの大きな成果は、ここでは求めません。
          </p>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] text-muted-foreground">実行状態</p>
            <ToggleGroup
              value={
                pane4V1.step2.execution_status
                  ? [pane4V1.step2.execution_status]
                  : []
              }
              onValueChange={(next) => {
                const selected = next[0];
                onUpdateStep2({
                  execution_status:
                    selected &&
                    (
                      PANE4_V1_EXECUTION_STATUS_VALUES as readonly string[]
                    ).includes(selected)
                      ? (selected as Pane4V1ExecutionStatus)
                      : "",
                });
              }}
              variant="outline"
              size="sm"
              orientation="vertical"
              className="w-full"
              aria-label="Pane4 Step2 実行状態"
            >
              {PANE4_V1_EXECUTION_STATUS_VALUES.map((status) => (
                <ToggleGroupItem key={status} value={status} className="w-full">
                  {PANE4_V1_EXECUTION_STATUS_LABELS[status]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] text-muted-foreground">A. 何ができたか</p>
            <InlineTextareaField
              key={`pane4-s2-achieved-${pane4FormKey}`}
              value={pane4V1.step2.what_was_achieved}
              onSave={(what_was_achieved) =>
                onUpdateStep2({ what_was_achieved })
              }
              ariaLabel="Pane4 Step2 何ができたか"
              placeholder="今回のBABY STEPで実際にできたこと（1〜2文）"
            />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] text-muted-foreground">
              B. 想定外に起きたこと
            </p>
            <InlineTextareaField
              key={`pane4-s2-unexpected-${pane4FormKey}`}
              value={pane4V1.step2.unexpected}
              onSave={(unexpected) => onUpdateStep2({ unexpected })}
              ariaLabel="Pane4 Step2 想定外に起きたこと"
              placeholder="想定していなかった出来事があれば1〜2文"
            />
          </div>
        </LearningStep>

        <LearningStep
          step="Step3"
          title="Insight / GAP"
          description="何が効き、何で止まったか"
        >
          <p className="text-[11px] leading-relaxed text-foreground">
            つまずきは単なる失敗ではなく、次に埋めるべきGAPを見つける材料です。
          </p>

          <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/30 p-2.5">
            <p className="text-[10px] text-muted-foreground">
              Pane3の後ろ盾・お墨付き（参照）
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge
                variant={
                  pane3Step3.backing.status === "confirmed"
                    ? "secondary"
                    : "outline"
                }
                size="xs"
              >
                {backingStatusLabel(pane3Step3.backing)}
              </Badge>
            </div>
            {pane3Step3.backing.supplement.trim() ? (
              <p className="text-[11px] leading-relaxed text-foreground">
                {pane3Step3.backing.supplement.trim()}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                補足はまだありません
              </p>
            )}
            <p className="text-[11px] leading-relaxed text-foreground">
              推進役が判断・調整を必要としたとき、組織の後ろ盾は実際に機能しましたか？
            </p>
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              専用欄は設けません。気づきは下のInsight欄に書いてください。
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-[10px] text-muted-foreground">
              観察ポイント（複数選択可）
            </p>
            <ToggleGroup
              multiple
              value={pane4V1.step3.stumble_tags}
              onValueChange={(next) => {
                const allowed = new Set<string>(
                  PANE3_STEP3_STUMBLE_OBSERVATION_POINTS,
                );
                onUpdateStep3({
                  stumble_tags: PANE3_STEP3_STUMBLE_OBSERVATION_POINTS.filter(
                    (point) => next.includes(point) && allowed.has(point),
                  ),
                });
              }}
              variant="outline"
              size="sm"
              spacing={1}
              className="flex w-full flex-wrap"
              aria-label="Pane4 Step3 つまずきの観察ポイント"
            >
              {PANE3_STEP3_STUMBLE_OBSERVATION_POINTS.map((point) => (
                <ToggleGroupItem key={point} value={point}>
                  {point}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-[10px] text-muted-foreground">
              A. うまく機能したこと
            </p>
            <InlineTextareaField
              key={`pane4-s3-worked-${pane4FormKey}`}
              value={pane4V1.step3.what_worked}
              onSave={(what_worked) => onUpdateStep3({ what_worked })}
              ariaLabel="Pane4 Step3 うまく機能したこと"
              placeholder="効いた役割・支援・判断など（1〜2文）"
            />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] text-muted-foreground">
              B. 止まった／迷った／不足したこと
            </p>
            <InlineTextareaField
              key={`pane4-s3-blocked-${pane4FormKey}`}
              value={pane4V1.step3.what_blocked}
              onSave={(what_blocked) => onUpdateStep3({ what_blocked })}
              ariaLabel="Pane4 Step3 止まった・迷った・不足したこと"
              placeholder="権限、判断待ち、役割の曖昧さなど（1〜2文）"
            />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] text-muted-foreground">
              C. 新たに見えたGAP
            </p>
            <InlineTextareaField
              key={`pane4-s3-gap-${pane4FormKey}`}
              value={pane4V1.step3.new_gap}
              onSave={(new_gap) => onUpdateStep3({ new_gap })}
              ariaLabel="Pane4 Step3 新たに見えたGAP"
              placeholder="次に埋めたい差を1〜2文で"
            />
          </div>

          <Collapsible>
            <CollapsibleTrigger
              nativeButton={true}
              render={
                <button
                  type="button"
                  className={cn(
                    "group/resistance flex w-full items-center justify-between gap-2 rounded-md px-1 py-1 text-left text-[11px] text-muted-foreground",
                    "outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                  )}
                />
              }
            >
              <span>抵抗・懸念の動き</span>
              <ChevronDown
                aria-hidden
                className="size-3.5 shrink-0 transition-transform in-data-[panel-open]:rotate-180"
              />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="flex flex-col gap-2 pt-1">
                <p className="text-[10px] leading-relaxed text-muted-foreground">
                  抵抗は、改革への妨害とは限りません。既存の利害、過去経験、不安、権限不足、改革案そのものの弱点を示す重要な観察材料でもあります。
                </p>
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] text-muted-foreground">
                    A. どんな抵抗・懸念が現れたか
                  </p>
                  <InlineTextareaField
                    key={`pane4-resistance-observed-${pane4FormKey}`}
                    value={pane4V1.resistance_observation.observed}
                    onSave={(observed) => onUpdateResistance({ observed })}
                    ariaLabel="Pane4 抵抗・懸念 どんな抵抗・懸念が現れたか"
                    placeholder="人物ラベルではなく、実際に起きた反応を1〜2文で"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] text-muted-foreground">
                    B. その背景には何がありそうか
                  </p>
                  <InlineTextareaField
                    key={`pane4-resistance-background-${pane4FormKey}`}
                    value={pane4V1.resistance_observation.background}
                    onSave={(background) => onUpdateResistance({ background })}
                    ariaLabel="Pane4 抵抗・懸念 背景"
                    placeholder="利害、過去経験、不安、権限不足など（1〜2文）"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] text-muted-foreground">
                    C. 次はどう巻き込み方を変えるか
                  </p>
                  <InlineTextareaField
                    key={`pane4-resistance-next-${pane4FormKey}`}
                    value={pane4V1.resistance_observation.engagement_next}
                    onSave={(engagement_next) =>
                      onUpdateResistance({ engagement_next })
                    }
                    ariaLabel="Pane4 抵抗・懸念 次の巻き込み方"
                    placeholder="次の実験で変える巻き込み方（1〜2文）"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </LearningStep>

        <LearningStep
          step="Step4"
          title="Hypothesis Review"
          description="今回分かった範囲で、構造仮説を見直す"
        >
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            1回のBABY
            STEPで正しい／間違いを断定する画面ではありません。説明力・介入可能性の再採点はしません。
          </p>
          {selectedHypothesisIndexes.length === 0 ? (
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Pane2
              Step3で「Pane3候補にする」を選ぶと、ここに優先構造仮説が表示されます。
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {selectedHypothesisIndexes.map(
                (hypothesisIndex, displayIndex) => {
                  const hypothesis = pane2Hypotheses[hypothesisIndex];
                  const review = pane4V1.step4.reviews[hypothesisIndex];
                  const label = hypothesis?.structural_hypothesis.trim()
                    ? hypothesis.structural_hypothesis.trim()
                    : "Pane2でまだ未記入です";
                  return (
                    <div
                      key={hypothesisIndex}
                      className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-2.5"
                    >
                      <ReferenceBlock
                        label={`優先構造仮説 ${displayIndex + 1}（参照）`}
                      >
                        {label}
                      </ReferenceBlock>
                      <div className="flex flex-col gap-1">
                        <p className="text-[10px] text-muted-foreground">
                          今回の実行結果から、この仮説をどう見るか
                        </p>
                        <ToggleGroup
                          value={review?.status ? [review.status] : []}
                          onValueChange={(next) => {
                            const selected = next[0];
                            onUpdateReview(hypothesisIndex, {
                              status:
                                selected &&
                                (
                                  PANE4_V1_HYPOTHESIS_REVIEW_STATUS_VALUES as readonly string[]
                                ).includes(selected)
                                  ? (selected as Pane4V1HypothesisReviewStatus)
                                  : "",
                            });
                          }}
                          variant="outline"
                          size="sm"
                          orientation="vertical"
                          className="w-full"
                          aria-label={`Pane4 Step4 仮説 ${displayIndex + 1} の見直し`}
                        >
                          {PANE4_V1_HYPOTHESIS_REVIEW_STATUS_VALUES.map(
                            (status) => (
                              <ToggleGroupItem
                                key={status}
                                value={status}
                                className="w-full"
                              >
                                {
                                  PANE4_V1_HYPOTHESIS_REVIEW_STATUS_LABELS[
                                    status
                                  ]
                                }
                              </ToggleGroupItem>
                            ),
                          )}
                        </ToggleGroup>
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-[10px] text-muted-foreground">
                          そう判断した根拠
                        </p>
                        <InlineTextareaField
                          key={`pane4-s4-rationale-${hypothesisIndex}-${pane4FormKey}`}
                          value={review?.rationale ?? ""}
                          onSave={(rationale) =>
                            onUpdateReview(hypothesisIndex, { rationale })
                          }
                          ariaLabel={`Pane4 Step4 仮説 ${displayIndex + 1} の根拠`}
                          placeholder="今回の実行から言えることだけを1〜2文で"
                        />
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </LearningStep>

        <LearningStep
          step="Step5"
          title="Next Step"
          description="学びを次の一手へつなげる"
        >
          <div className="flex flex-col gap-1">
            <p className="text-[10px] text-muted-foreground">
              今回の学びを受けて、次はどうするか
            </p>
            <ToggleGroup
              value={
                pane4V1.step5.next_direction
                  ? [pane4V1.step5.next_direction]
                  : []
              }
              onValueChange={(next) => {
                const selected = next[0];
                onUpdateStep5({
                  next_direction:
                    selected &&
                    (
                      PANE4_V1_NEXT_DIRECTION_VALUES as readonly string[]
                    ).includes(selected)
                      ? (selected as Pane4V1NextDirection)
                      : "",
                });
              }}
              variant="outline"
              size="sm"
              orientation="vertical"
              className="w-full"
              aria-label="Pane4 Step5 次の方向"
            >
              {PANE4_V1_NEXT_DIRECTION_VALUES.map((direction) => (
                <ToggleGroupItem
                  key={direction}
                  value={direction}
                  className="w-full"
                >
                  {PANE4_V1_NEXT_DIRECTION_LABELS[direction]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/30 p-2.5">
            <div className="flex flex-col gap-0.5">
              <p className="text-[11px] leading-relaxed text-foreground">
                今回のBABY STEPからの学びにより、どこに戻り、何を見直しますか？
              </p>
              <p className="text-[10px] leading-relaxed text-muted-foreground">
                戻る深さは、「何が違っていたのか」で決めます。次の方向を、戻り先として具体化します。
              </p>
            </div>
            <ToggleGroup
              value={
                pane4V1.step5.return_destination
                  ? [pane4V1.step5.return_destination]
                  : []
              }
              onValueChange={(next) => {
                const selected = next[0];
                onUpdateStep5({
                  return_destination:
                    selected &&
                    (
                      PANE4_V1_RETURN_DESTINATION_VALUES as readonly string[]
                    ).includes(selected)
                      ? (selected as Pane4V1ReturnDestination)
                      : "",
                });
              }}
              variant="outline"
              size="sm"
              orientation="vertical"
              spacing={1}
              className="w-full"
              aria-label="Pane4 Step5 戻り先"
            >
              {PANE4_V1_RETURN_DESTINATION_DEFS.map((option) => (
                <ToggleGroupItem
                  key={option.id}
                  value={option.id}
                  className="w-full justify-between"
                >
                  <span>{option.action}</span>
                  <Badge variant="outline" size="xs">
                    {option.destination}
                  </Badge>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <Collapsible>
              <CollapsibleTrigger
                nativeButton={true}
                render={
                  <button
                    type="button"
                    className={cn(
                      "group/return-guide flex w-full items-center justify-between gap-2 rounded-md px-1 py-1 text-left text-[11px] text-muted-foreground",
                      "outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                    )}
                  />
                }
              >
                <span>判断ガイドを見る</span>
                <ChevronDown
                  aria-hidden
                  className="size-3.5 shrink-0 transition-transform in-data-[panel-open]:rotate-180"
                />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="flex flex-col gap-1.5 pt-1">
                  <li className="text-[10px] leading-relaxed text-muted-foreground">
                    現象そのものの捉え方が違った → Pane1
                  </li>
                  <li className="text-[10px] leading-relaxed text-muted-foreground">
                    原因構造の見立てが違った → Pane2
                  </li>
                  <li className="text-[10px] leading-relaxed text-muted-foreground">
                    原因仮説は妥当だが、介入場所が違った → Pane3-Step1
                  </li>
                  <li className="text-[10px] leading-relaxed text-muted-foreground">
                    介入場所は妥当だが、誰が引き受けるか／支援・権限が違った →
                    Pane3-Step2
                  </li>
                  <li className="text-[10px] leading-relaxed text-muted-foreground">
                    方向は妥当だが、試す内容・大きさ・やり方を変えたい →
                    Pane3-Step3
                  </li>
                  <li className="text-[10px] leading-relaxed text-muted-foreground">
                    仮説も介入方向も妥当そう → 次のBABY STEP
                  </li>
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-[10px] text-muted-foreground">
              A. 次に埋めたいGAP
            </p>
            <InlineTextareaField
              key={`pane4-s5-gap-${pane4FormKey}`}
              value={pane4V1.step5.next_gap}
              onSave={(next_gap) => onUpdateStep5({ next_gap })}
              ariaLabel="Pane4 Step5 次に埋めたいGAP"
              placeholder="次のサイクルで埋めたい差（1〜2文）"
            />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] text-muted-foreground">B. 次に試す一手</p>
            <InlineTextareaField
              key={`pane4-s5-move-${pane4FormKey}`}
              value={pane4V1.step5.next_move}
              onSave={(next_move) => onUpdateStep5({ next_move })}
              ariaLabel="Pane4 Step5 次に試す一手"
              placeholder="入口だけ。詳細なBABY STEP設計はPane3へ戻る"
            />
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            次の一手に応じて、Pane2の構造仮説またはPane3の介入設計へ戻って更新します。
          </p>
        </LearningStep>

        <ExtraSection
          title="戻り先判断を多視点で見直す"
          description="体制・安定 / 改革推進 / 実務・標準"
          defaultOpen
        >
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            自分で決めた次の方向と戻り先を、3つの視点で反証します。AIは実行しません。
          </p>
          {PANE4_V1_REVIEW_LENS_DEFS.map((lens) => {
            const lensState = pane4V1.multi_perspective_review[lens.id];
            return (
              <div
                key={lens.id}
                className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-2.5"
              >
                <SectionLabel
                  tone="conclusion"
                  className="text-xs tracking-normal normal-case"
                >
                  {lens.label}
                </SectionLabel>
                <p className="text-[11px] leading-relaxed text-foreground">
                  {lens.question}
                </p>
                <ToggleGroup
                  value={lensState.status ? [lensState.status] : []}
                  onValueChange={(next) => {
                    const selected = next[0];
                    onUpdateMultiPerspectiveReview({
                      [lens.id]: {
                        status:
                          selected &&
                          (
                            PANE4_V1_LENS_STATUS_VALUES as readonly string[]
                          ).includes(selected)
                            ? (selected as Pane4V1LensStatus)
                            : "",
                      },
                    });
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  aria-label={`Pane4 多視点レビュー ${lens.label}`}
                >
                  {PANE4_V1_LENS_STATUS_VALUES.map((status) => (
                    <ToggleGroupItem key={status} value={status}>
                      {PANE4_V1_LENS_STATUS_LABELS[status]}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <InlineTextareaField
                  key={`pane4-lens-${lens.id}-${pane4FormKey}`}
                  value={lensState.comment}
                  onSave={(comment) =>
                    onUpdateMultiPerspectiveReview({
                      [lens.id]: { comment },
                    })
                  }
                  ariaLabel={`Pane4 多視点レビュー ${lens.label} コメント`}
                  placeholder="必要なら短いコメント（1〜2文）"
                />
              </div>
            );
          })}

          <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-2.5">
            <SectionLabel
              tone="conclusion"
              className="text-xs tracking-normal normal-case"
            >
              レビュー後の最終判断
            </SectionLabel>
            <ToggleGroup
              value={
                pane4V1.multi_perspective_review.final_decision
                  ? [pane4V1.multi_perspective_review.final_decision]
                  : []
              }
              onValueChange={(next) => {
                const selected = next[0];
                onUpdateMultiPerspectiveReview({
                  final_decision:
                    selected &&
                    (
                      PANE4_V1_FINAL_DECISION_VALUES as readonly string[]
                    ).includes(selected)
                      ? (selected as Pane4V1FinalDecision)
                      : "",
                });
              }}
              variant="outline"
              size="sm"
              orientation="vertical"
              className="w-full"
              aria-label="Pane4 レビュー後の最終判断"
            >
              {PANE4_V1_FINAL_DECISION_VALUES.map((decision) => (
                <ToggleGroupItem
                  key={decision}
                  value={decision}
                  className="w-full"
                >
                  {PANE4_V1_FINAL_DECISION_LABELS[decision]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <div className="flex flex-col gap-1">
              <p className="text-[10px] text-muted-foreground">
                最終判断の理由
              </p>
              <InlineTextareaField
                key={`pane4-final-reason-${pane4FormKey}`}
                value={pane4V1.multi_perspective_review.final_reason}
                onSave={(final_reason) =>
                  onUpdateMultiPerspectiveReview({ final_reason })
                }
                ariaLabel="Pane4 最終判断の理由"
                placeholder="なぜ当初の戻り先で進める／再検討するのか（1〜2文）"
              />
            </div>
          </div>
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            将来は、この3視点を独立したAIサブエージェントとして実行し、戻り先・根拠・反証可能性をレビューする構想です。今回は実装しません。
          </p>
        </ExtraSection>

        <ExtraSection
          title="今回の戦訓 / Learning Memo"
          description="1回の実践をすぐSKILL化しない"
        >
          <div className="flex flex-col gap-1">
            <p className="text-[10px] text-muted-foreground">A. 今回の戦訓</p>
            <p className="text-[11px] leading-relaxed text-foreground">
              今回の実践から、何が分かったか？
            </p>
            <InlineTextareaField
              key={`pane4-memo-lesson-${pane4FormKey}`}
              value={pane4V1.learning_memo.lesson}
              onSave={(lesson) => onUpdateLearningMemo({ lesson })}
              ariaLabel="Pane4 戦訓 今回分かったこと"
              placeholder="1回の実践から言えること（1〜3文）"
            />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] text-muted-foreground">
              B. 成立条件・注意点
            </p>
            <p className="text-[11px] leading-relaxed text-foreground">
              この学びは、どんな条件なら通用しそうか？どんな場合には通用しない可能性があるか？
            </p>
            <InlineTextareaField
              key={`pane4-memo-conditions-${pane4FormKey}`}
              value={pane4V1.learning_memo.conditions}
              onSave={(conditions) => onUpdateLearningMemo({ conditions })}
              ariaLabel="Pane4 戦訓 成立条件・注意点"
              placeholder="通用しそうな条件と、通用しない場合（1〜3文）"
            />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[10px] text-muted-foreground">
              C. 次に確かめたいこと
            </p>
            <p className="text-[11px] leading-relaxed text-foreground">
              次のBABY STEPで、何を再検証したいか？
            </p>
            <InlineTextareaField
              key={`pane4-memo-next-${pane4FormKey}`}
              value={pane4V1.learning_memo.next_validation}
              onSave={(next_validation) =>
                onUpdateLearningMemo({ next_validation })
              }
              ariaLabel="Pane4 戦訓 次に確かめたいこと"
              placeholder="次の実験で再検証したいこと（1〜3文）"
            />
          </div>
        </ExtraSection>
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          Learning Memo → 複数回で似た結果 → SKILL Candidate →
          他案件でも再現性・適用限界を確認 → Validated SKILL
        </p>
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          1回の成功をすぐSKILL化せず、複数回の実践で再現性と適用条件が確認された学びを、将来SKILL資産として蓄積します。
        </p>
        <Card size="sm" className="border-border bg-muted/30">
          <CardContent className="flex flex-col gap-2 p-3">
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              入力したFact・Result・戦訓から、今回分かったこととまだ言えないことを整理します。
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSummaryReviewOpen(true)}
            >
              総括レビューを見る
            </Button>
          </CardContent>
        </Card>
      </div>
      <Pane4SummaryReviewSheet
        open={summaryReviewOpen}
        onOpenChange={setSummaryReviewOpen}
        pane4V1={pane4V1}
        pane3Step3={pane3Step3}
        pane2Hypotheses={pane2Hypotheses}
        selectedHypothesisIndexes={selectedHypothesisIndexes}
      />
    </>
  );
}
