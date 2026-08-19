"use client";

import { ArrowRight, Unlink } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  RESPONSIBILITY_CHAIN_BREAK_EXAMPLES,
  RESPONSIBILITY_CHAIN_STEPS,
  RESPONSIBILITY_CHAIN_TRANSITIONS,
  type Pane2Step2,
  type ResponsibilityChainTransitionId,
} from "@/lib/koyasu/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InlineTextareaField, SectionLabel } from "@/components/primitives";

type ResponsibilityChainBreaksProps = {
  pane2Step2: Pane2Step2;
  pane2FormKey: number;
  onToggleBreak: (transitionId: ResponsibilityChainTransitionId) => void;
  onUpdateBreakMemo: (
    transitionId: ResponsibilityChainTransitionId,
    memo: string,
  ) => void;
};

function transitionLabel(transitionId: ResponsibilityChainTransitionId): string {
  const [from, to] = transitionId.split("-");
  const fromStep = RESPONSIBILITY_CHAIN_STEPS.find((step) => step.id === from);
  const toStep = RESPONSIBILITY_CHAIN_STEPS.find((step) => step.id === to);
  return `${fromStep?.label ?? from} → ${toStep?.label ?? to}`;
}

export function ResponsibilityChainBreaks({
  pane2Step2,
  pane2FormKey,
  onToggleBreak,
  onUpdateBreakMemo,
}: ResponsibilityChainBreaksProps) {
  const selectedBreaks = pane2Step2.breaks;

  return (
    <div className="flex flex-col gap-3">
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col gap-3 p-3">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            8段階の業務プロセスをたどり、どの接続点で連鎖が切れているかを選びます（個人の責任ではなく、プロセスの断絶として記録）。
          </p>

          <div className="flex flex-wrap items-stretch gap-2">
            {RESPONSIBILITY_CHAIN_STEPS.map((step, index) => {
              const transitionId = RESPONSIBILITY_CHAIN_TRANSITIONS[index];
              const isSelected = selectedBreaks.some(
                (item) => item.transition_id === transitionId,
              );

              return (
                <div
                  key={step.id}
                  className="flex min-w-[7.5rem] flex-1 flex-col items-stretch gap-1.5"
                >
                  <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted/30 p-2">
                    <Badge variant="outline" className="w-fit">
                      {step.id}
                    </Badge>
                    <p className="text-xs leading-snug text-foreground">
                      {step.label}
                    </p>
                  </div>

                  {transitionId ? (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <ArrowRight className="size-3 shrink-0" aria-hidden />
                      </div>
                      <Button
                        type="button"
                        variant={isSelected ? "destructive" : "outline"}
                        size="sm"
                        className={cn(
                          "h-auto min-h-8 w-full whitespace-normal px-2 py-1.5 text-left text-[11px] leading-snug",
                          isSelected && "border-destructive/40",
                        )}
                        aria-pressed={isSelected}
                        aria-label={`${transitionLabel(transitionId)} に断絶がある`}
                        onClick={() => onToggleBreak(transitionId)}
                      >
                        <Unlink className="size-3 shrink-0" aria-hidden />
                        ここに断絶がある
                      </Button>
                      <p className="text-[10px] leading-relaxed text-muted-foreground">
                        参考: {RESPONSIBILITY_CHAIN_BREAK_EXAMPLES[transitionId]}
                      </p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedBreaks.length > 0 ? (
        <div className="flex flex-col gap-2">
          <SectionLabel
            tone="conclusion"
            className="text-xs normal-case tracking-normal"
          >
            選んだ断絶点のメモ
          </SectionLabel>
          {selectedBreaks.map((item) => (
            <Card key={`${item.transition_id}-${pane2FormKey}`} size="sm">
              <CardContent className="flex flex-col gap-1.5 p-3">
                <p className="text-xs font-medium text-conclusion">
                  {transitionLabel(item.transition_id)}
                </p>
                <InlineTextareaField
                  key={`pane2-break-memo-${item.transition_id}-${pane2FormKey}`}
                  value={item.memo}
                  onSave={(memo) => onUpdateBreakMemo(item.transition_id, memo)}
                  ariaLabel={`Pane2 断絶メモ ${item.transition_id}`}
                  placeholder="例: 起票はSlackで流れるが、推進責任者の指名が会議で先送りになる"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground">
          断絶点を1つ以上選ぶと、ここに短いメモ欄が表示されます。
        </p>
      )}
    </div>
  );
}
