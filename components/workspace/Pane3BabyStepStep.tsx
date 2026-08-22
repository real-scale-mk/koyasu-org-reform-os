"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import {
  PANE3_STEP2_ROLE_DEFS,
  PANE3_STEP3_BACKING_PROPOSAL,
  PANE3_STEP3_DEFAULT_PROPOSALS,
  PANE3_STEP3_FIELD_DEFS,
  PANE3_STEP3_STUMBLE_OBSERVATION_POINTS,
  type Pane3Step1,
  type Pane3Step2,
  type Pane3Step3,
  type Pane3Step3Backing,
  type Pane3Step3BackingStatus,
  type Pane3Step3Field,
  type Pane3Step3FieldId,
} from "@/lib/koyasu/schema";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { InlineTextareaField, SectionLabel } from "@/components/primitives";

const SUCCESS_CRITERIA_HINT =
  "最終成果（再発率・文化変容など）ではなく、このBABY STEPを1件実行できたか（記録・共有・支援責任者の明示）を書きます。";

type Pane3BabyStepStepProps = {
  firstEntryScene: string;
  toBe: string;
  pane3Step1: Pane3Step1;
  pane3Step2: Pane3Step2;
  pane3Step3: Pane3Step3;
  pane3FormKey: number;
  primaryHypothesisIndex: number;
  onUpdateField: (
    fieldId: Pane3Step3FieldId,
    patch: Partial<Pane3Step3Field>,
  ) => void;
  onUpdateBacking: (patch: Partial<Pane3Step3Backing>) => void;
};

function BabyStepFieldCard({
  fieldId,
  label,
  hint,
  fields,
  pane3FormKey,
  onUpdate,
}: {
  fieldId: Pane3Step3FieldId;
  label: string;
  hint?: string;
  fields: Pane3Step3Field;
  pane3FormKey: number;
  onUpdate: (patch: Partial<Pane3Step3Field>) => void;
}) {
  const proposal = PANE3_STEP3_DEFAULT_PROPOSALS[fieldId];
  const hasSupplement = fields.supplement.trim().length > 0;
  const [supplementOpen, setSupplementOpen] = useState(hasSupplement);
  const adoptButtonLabel = fields.adopted_default
    ? hasSupplement
      ? "✓ 補足・修正を含めて進める"
      : "✓ この案で進める"
    : hasSupplement
      ? "補足・修正を含めて進める"
      : "この案で進める";

  return (
    <Card size="sm" className="border-border bg-card">
      <CardHeader className="flex flex-col gap-1 p-3 pb-2">
        <CardTitle className="text-sm text-conclusion">{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5 p-3 pt-0">
        {hint ? (
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            {hint}
          </p>
        ) : null}

        <div className="flex flex-col gap-0.5">
          <p className="text-[10px] text-muted-foreground">基本案</p>
          <p className="text-[11px] leading-relaxed text-foreground">
            {proposal}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <Button
            type="button"
            variant={fields.adopted_default ? "default" : "outline"}
            size="sm"
            className="w-full"
            aria-pressed={fields.adopted_default}
            onClick={() =>
              onUpdate({
                adopted_default: true,
                value: fields.value.trim() || proposal,
              })
            }
          >
            {adoptButtonLabel}
          </Button>
          {fields.adopted_default ? (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="h-auto self-end"
              onClick={() => onUpdate({ adopted_default: false })}
            >
              未決定に戻す
            </Button>
          ) : null}
        </div>

        <Collapsible open={supplementOpen} onOpenChange={setSupplementOpen}>
          <CollapsibleTrigger
            nativeButton={true}
            render={
              <button
                type="button"
                className={cn(
                  "group/supplement flex w-full items-center justify-between gap-2 rounded-md px-1 py-1 text-left text-[11px] text-muted-foreground",
                  "outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                )}
              />
            }
          >
            <span>補足・修正する</span>
            <ChevronDown
              aria-hidden
              className="size-3.5 shrink-0 transition-transform in-data-[panel-open]:rotate-180"
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="flex flex-col gap-1 pt-1">
              <InlineTextareaField
                key={`pane3-s3-supplement-${fieldId}-${pane3FormKey}`}
                value={fields.supplement}
                onSave={(supplement) => onUpdate({ supplement })}
                ariaLabel={`Pane3 Step3 ${label} 補足・修正`}
                placeholder="基本案から変えたい点、現場固有の条件など（1〜2文）"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

function BabyStepPremiseSummary({
  firstEntryScene,
  pane3Step1,
  pane3Step2,
  primaryHypothesisIndex,
}: {
  firstEntryScene: string;
  pane3Step1: Pane3Step1;
  pane3Step2: Pane3Step2;
  primaryHypothesisIndex: number;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const primaryStep1 = pane3Step1.entries[primaryHypothesisIndex];

  return (
    <Card size="sm" className="border-primary/30 bg-primary/5">
      <CardContent className="flex flex-col gap-2 p-3">
        <SectionLabel
          tone="conclusion"
          className="text-xs normal-case tracking-normal"
        >
          今回のBABY STEPの前提
        </SectionLabel>
        <dl className="flex flex-col gap-1.5">
          <div className="flex flex-col gap-0.5">
            <dt className="text-[10px] text-muted-foreground">
              最初に手を入れる場面候補（Step1）
            </dt>
            <dd className="text-[11px] leading-relaxed text-foreground">
              {firstEntryScene}
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-[10px] text-muted-foreground">
              4役割の採用状況（Step2）
            </dt>
            <dd className="flex flex-wrap gap-1">
              {PANE3_STEP2_ROLE_DEFS.map((role) => {
                const adopted = pane3Step2.roles[role.id].adopted_default;
                return (
                  <Badge
                    key={role.id}
                    variant={adopted ? "secondary" : "outline"}
                    size="xs"
                  >
                    {role.label}
                    {adopted ? " 採用" : " 未決定"}
                  </Badge>
                );
              })}
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
              {primaryStep1?.structural_core_candidate.trim() ? (
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] text-muted-foreground">
                    構造上の本丸候補
                  </p>
                  <p className="text-[11px] leading-relaxed text-foreground">
                    {primaryStep1.structural_core_candidate.trim()}
                  </p>
                </div>
              ) : null}
              {primaryStep1?.why_start_here.trim() ? (
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] text-muted-foreground">
                    なぜここから始めるのか
                  </p>
                  <p className="text-[11px] leading-relaxed text-foreground">
                    {primaryStep1.why_start_here.trim()}
                  </p>
                </div>
              ) : null}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] text-muted-foreground">
                  Step2 各役割の状況
                </p>
                {PANE3_STEP2_ROLE_DEFS.map((role) => {
                  const roleFields = pane3Step2.roles[role.id];
                  return (
                    <div
                      key={role.id}
                      className="flex flex-col gap-0.5 rounded-lg border border-border bg-card p-2"
                    >
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-medium text-foreground">
                          {role.label}
                        </span>
                        {roleFields.adopted_default ? (
                          <Badge variant="secondary" size="xs">
                            基本案採用
                          </Badge>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">
                            未決定
                          </span>
                        )}
                      </div>
                      {roleFields.supplement.trim() ? (
                        <p className="text-[10px] leading-relaxed text-muted-foreground">
                          補足: {roleFields.supplement.trim()}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

function BabyStepExperimentGuardrails({
  toBe,
  backing,
  pane3FormKey,
  onUpdateBacking,
}: {
  toBe: string;
  backing: Pane3Step3Backing;
  pane3FormKey: number;
  onUpdateBacking: (patch: Partial<Pane3Step3Backing>) => void;
}) {
  const hasSupplement = backing.supplement.trim().length > 0;
  const [supplementOpen, setSupplementOpen] = useState(hasSupplement);

  return (
    <Card size="sm" className="border-border bg-card">
      <CardContent className="flex flex-col gap-3 p-3">
        <div className="flex flex-col gap-1">
          <SectionLabel
            tone="conclusion"
            className="text-xs normal-case tracking-normal"
          >
            このBABY STEPを意味ある実験にする前提
          </SectionLabel>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            改革そのものを小さくするのではなく、大きなTO BEへ向かう実行単位を小さくします。
          </p>
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            向かうTO BE → 後ろ盾のあるBABY STEP → 実行 → つまずきをGAPとして拾う
            → Pane4で評価
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted/30 p-2.5">
            <p className="text-[10px] text-muted-foreground">
              ガードレール1｜向かうTO BE
            </p>
            <p className="text-[11px] leading-relaxed text-foreground">
              {toBe.trim() || "Pane1でまだ未記入です"}
            </p>
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              BABY STEPは小さくても、向かう先そのものを小さくするわけではありません。
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-2.5">
            <p className="text-[10px] text-muted-foreground">
              ガードレール2｜後ろ盾・お墨付き
            </p>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Step2の推進責任者（誰が前に進めるか）とは別に、管理職・トップの支持と判断・調整の後ろ盾があるかを確認します。責任だけを背負わせないためです。
            </p>
            <div className="flex flex-col gap-0.5">
              <p className="text-[10px] text-muted-foreground">基本案</p>
              <p className="text-[11px] leading-relaxed text-foreground">
                {PANE3_STEP3_BACKING_PROPOSAL}
              </p>
            </div>
            <ToggleGroup
              value={[backing.status]}
              onValueChange={(next) => {
                const selected = next[0];
                if (selected === "confirmed" || selected === "unconfirmed") {
                  onUpdateBacking({
                    status: selected as Pane3Step3BackingStatus,
                  });
                }
              }}
              variant="outline"
              size="sm"
              aria-label="後ろ盾・お墨付きの確認状態"
            >
              <ToggleGroupItem value="unconfirmed">未確認</ToggleGroupItem>
              <ToggleGroupItem value="confirmed">確認済み</ToggleGroupItem>
            </ToggleGroup>
            <Collapsible open={supplementOpen} onOpenChange={setSupplementOpen}>
              <CollapsibleTrigger
                nativeButton={true}
                render={
                  <button
                    type="button"
                    className={cn(
                      "group/backing flex w-full items-center justify-between gap-2 rounded-md px-1 py-1 text-left text-[11px] text-muted-foreground",
                      "outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                    )}
                  />
                }
              >
                <span>補足する（任意）</span>
                <ChevronDown
                  aria-hidden
                  className="size-3.5 shrink-0 transition-transform in-data-[panel-open]:rotate-180"
                />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="flex flex-col gap-1 pt-1">
                  <InlineTextareaField
                    key={`pane3-s3-backing-${pane3FormKey}`}
                    value={backing.supplement}
                    onSave={(supplement) => onUpdateBacking({ supplement })}
                    ariaLabel="Pane3 Step3 後ろ盾・お墨付き 補足"
                    placeholder="誰が支持しているか、判断権限の範囲など（1〜2文）"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/30 p-2.5">
            <p className="text-[10px] text-muted-foreground">
              ガードレール3｜つまずきを次のGAPとして拾う
            </p>
            <p className="text-[11px] leading-relaxed text-foreground">
              このBABY STEPで止まったこと、迷ったこと、支援が得られなかったことは、単なる失敗ではなく、次に埋めるべきGAPとして記録します。
            </p>
            <p className="text-[10px] text-muted-foreground">
              観察ポイント（参考）
            </p>
            <div className="flex flex-wrap gap-1">
              {PANE3_STEP3_STUMBLE_OBSERVATION_POINTS.map((point) => (
                <Badge key={point} variant="outline" size="xs">
                  {point}
                </Badge>
              ))}
            </div>
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              実際のFact・Result・Insight・仮説評価はPane4で扱います。
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function Pane3BabyStepStep({
  firstEntryScene,
  toBe,
  pane3Step1,
  pane3Step2,
  pane3Step3,
  pane3FormKey,
  primaryHypothesisIndex,
  onUpdateField,
  onUpdateBacking,
}: Pane3BabyStepStepProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <SectionLabel
          tone="conclusion"
          className="text-sm normal-case tracking-normal"
        >
          Pane3 Step3 | 今回試す BABY STEP
        </SectionLabel>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          構造仮説を確かめながら、現場で小さく実行できる最小の介入を1件決めます。改革そのものを小さくするのではなく、大きなTO BEへ向かう実行単位を小さくします。
        </p>
      </div>

      <BabyStepPremiseSummary
        firstEntryScene={firstEntryScene}
        pane3Step1={pane3Step1}
        pane3Step2={pane3Step2}
        primaryHypothesisIndex={primaryHypothesisIndex}
      />

      <BabyStepExperimentGuardrails
        key={`guardrails-${pane3FormKey}`}
        toBe={toBe}
        backing={pane3Step3.backing}
        pane3FormKey={pane3FormKey}
        onUpdateBacking={onUpdateBacking}
      />

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        以下の基本案は出発点の提案です。正解ではありません。必要に応じて補足・修正してください。
      </p>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {PANE3_STEP3_FIELD_DEFS.map((field) => (
          <BabyStepFieldCard
            key={`${field.id}-${pane3FormKey}`}
            fieldId={field.id}
            label={field.label}
            hint={
              field.id === "success_criteria"
                ? SUCCESS_CRITERIA_HINT
                : undefined
            }
            fields={pane3Step3[field.id]}
            pane3FormKey={pane3FormKey}
            onUpdate={(patch) => onUpdateField(field.id, patch)}
          />
        ))}
      </div>

      <Card size="sm" className="border-border bg-muted/30">
        <CardContent className="p-3">
          <p className="text-[11px] leading-relaxed text-foreground">
            このBABY STEPは、正解を証明するためではなく、構造仮説が妥当かを小さく確かめる実験です。
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
