"use client";

import {
  PANE2_RATING_VALUES,
  type Pane2Hypothesis,
  type Pane2Rating,
  type Pane2RatingOrEmpty,
  type Pane2Step3,
  type Pane2Step3Evaluation,
} from "@/lib/koyasu/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { InlineTextareaField, SectionLabel } from "@/components/primitives";

type HypothesisPriorityStepProps = {
  hypotheses: Pane2Hypothesis[];
  pane2Step3: Pane2Step3;
  pane2FormKey: number;
  onUpdateEvaluation: (
    index: number,
    patch: Partial<Pane2Step3Evaluation>,
  ) => void;
  onTogglePane3Selection: (index: number) => void;
};

const QUADRANT_LEGEND = [
  {
    axes: "説明力高 × 介入可能性高",
    meaning: "最優先候補",
  },
  {
    axes: "説明力高 × 介入可能性低",
    meaning: "重要だが中長期",
  },
  {
    axes: "説明力低 × 介入可能性高",
    meaning: "小さく試す候補",
  },
  {
    axes: "説明力低 × 介入可能性低",
    meaning: "今回は後回し",
  },
] as const;

function RatingToggle({
  label,
  hint,
  value,
  ariaLabel,
  onChange,
}: {
  label: string;
  hint?: string;
  value: Pane2RatingOrEmpty;
  ariaLabel: string;
  onChange: (next: Pane2RatingOrEmpty) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col gap-0.5">
        <SectionLabel
          tone="conclusion"
          className="text-xs normal-case tracking-normal"
        >
          {label}
        </SectionLabel>
        {hint ? (
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
      <ToggleGroup
        value={value ? [value] : []}
        onValueChange={(next) => {
          const selected = next[0];
          onChange(
            selected &&
              (PANE2_RATING_VALUES as readonly string[]).includes(selected)
              ? (selected as Pane2Rating)
              : "",
          );
        }}
        variant="outline"
        size="sm"
        aria-label={ariaLabel}
      >
        {PANE2_RATING_VALUES.map((rating) => (
          <ToggleGroupItem key={rating} value={rating} aria-label={rating}>
            {rating}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

export function HypothesisPriorityStep({
  hypotheses,
  pane2Step3,
  pane2FormKey,
  onUpdateEvaluation,
  onTogglePane3Selection,
}: HypothesisPriorityStepProps) {
  const selected = pane2Step3.selected_for_pane3;
  const selectionFull = selected.length >= 2;

  return (
    <div className="flex flex-col gap-3">
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col gap-2 p-3">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            各仮説を「説明力」と「介入可能性」で見立て、Pane3
            で介入を考える候補を最大2つまで選びます。数値採点ではなく、現場感覚の整理です。
          </p>
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            介入可能性は「変えやすさ」だけではありません。権限・スポンサーの支え・上司による止め・忖度や上下関係の空気・提案者／実行者が不利になるかも含めて判断します。
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {pane2Step3.evaluations.map((evaluation, index) => {
          const hypothesis = hypotheses[index];
          const isSelected = selected.includes(index);
          const selectionDisabled = selectionFull && !isSelected;
          const summary =
            hypothesis?.structural_hypothesis.trim() ||
            "（Step1でまだ未記入）";

          return (
            <Card key={`pane2-step3-${index}-${pane2FormKey}`} size="sm">
              <CardHeader className="flex flex-col gap-1.5 p-3 pb-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <CardTitle className="text-sm text-conclusion">
                    仮説 {index + 1}
                  </CardTitle>
                  <Button
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    disabled={selectionDisabled}
                    aria-pressed={isSelected}
                    aria-label={`仮説 ${index + 1} をPane3候補にする`}
                    onClick={() => onTogglePane3Selection(index)}
                  >
                    {isSelected ? "Pane3候補に選択中" : "Pane3候補にする"}
                  </Button>
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {summary}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 p-3 pt-0">
                <div className="flex flex-wrap gap-4">
                  <RatingToggle
                    label="説明力"
                    hint="この仮説なしでは GAP を説明しにくいか"
                    value={evaluation.explanatory_power}
                    ariaLabel={`仮説 ${index + 1} の説明力`}
                    onChange={(explanatory_power) =>
                      onUpdateEvaluation(index, { explanatory_power })
                    }
                  />
                  <RatingToggle
                    label="介入可能性"
                    hint="権限・スポンサー・止められやすさ・忖度／不利も含む"
                    value={evaluation.intervene_ability}
                    ariaLabel={`仮説 ${index + 1} の介入可能性`}
                    onChange={(intervene_ability) =>
                      onUpdateEvaluation(index, { intervene_ability })
                    }
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <SectionLabel
                    tone="conclusion"
                    className="text-xs normal-case tracking-normal"
                  >
                    優先理由
                  </SectionLabel>
                  <InlineTextareaField
                    key={`pane2-step3-reason-${index}-${pane2FormKey}`}
                    value={evaluation.priority_reason}
                    onSave={(priority_reason) =>
                      onUpdateEvaluation(index, { priority_reason })
                    }
                    ariaLabel={`Pane2 優先理由 ${index + 1}`}
                    placeholder="1〜2文で。なぜ今この仮説を優先するか／後回しか"
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Pane3で介入を考える仮説：{selected.length}/2
        {selectionFull
          ? "（上限です。外してから別の仮説を選べます）"
          : "（1つでも可。3つ全部は選べません）"}
      </p>

      <Card size="sm" className="border-border bg-muted/30">
        <CardHeader className="flex flex-col gap-0.5 p-3 pb-1.5">
          <CardTitle className="text-xs text-conclusion">
            見立ての目安（凡例）
          </CardTitle>
          <p className="text-[10px] text-muted-foreground">
            チャートではなく、優先感の共有用です。
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 p-3 pt-0">
          {QUADRANT_LEGEND.map((item) => (
            <p
              key={item.axes}
              className="text-[10px] leading-relaxed text-muted-foreground"
            >
              <span className="font-medium text-foreground">{item.axes}</span>
              {" = "}
              {item.meaning}
            </p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
