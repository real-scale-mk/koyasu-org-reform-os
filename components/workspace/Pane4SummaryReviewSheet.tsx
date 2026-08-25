"use client";

import { type ReactNode } from "react";

import {
  PANE4_SUMMARY_FUTURE_AI_NOTE,
  PANE4_SUMMARY_LEARNING_MEMO_NOTE,
  buildPane4SummaryReview,
  type Pane4SummaryReviewInput,
  type Pane4SummaryVerificationItem,
} from "@/lib/koyasu/pane4-summary-review";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { SectionLabel } from "@/components/primitives";

type Pane4SummaryReviewSheetProps = Pane4SummaryReviewInput & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function ReviewSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <SectionLabel tone="conclusion" className="tracking-normal normal-case">
        {title}
      </SectionLabel>
      {children}
    </section>
  );
}

function LineList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item) => (
        <li key={item} className="leading-relaxed text-foreground">
          {item}
        </li>
      ))}
    </ul>
  );
}

function MemoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-muted-foreground">{label}</p>
      <p className="leading-relaxed text-foreground">{value}</p>
    </div>
  );
}

function VerificationList({
  items,
}: {
  items: Pane4SummaryVerificationItem[];
}) {
  return (
    <Card size="sm" className="border-border bg-card">
      <CardContent className="flex flex-col gap-2 p-3">
        {items.map((item, index) => (
          <div key={item.label} className="flex flex-col gap-2">
            {index > 0 ? <Separator /> : null}
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground">{item.label}</p>
              <Badge variant={item.tone} size="xs">
                {item.status}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function Pane4SummaryReviewSheet({
  open,
  onOpenChange,
  pane4V1,
  pane3Step3,
  pane2Hypotheses,
  selectedHypothesisIndexes,
}: Pane4SummaryReviewSheetProps) {
  const model = buildPane4SummaryReview({
    pane4V1,
    pane3Step3,
    pane2Hypotheses,
    selectedHypothesisIndexes,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[95vw] overflow-y-auto data-[side=right]:w-[95vw] data-[side=right]:sm:max-w-none"
      >
        <SheetHeader>
          <SheetTitle className="text-conclusion">
            今回の実践を総括する
          </SheetTitle>
          <SheetDescription>
            今回の1件から言えることと、まだ言えないことを分けます
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-6">
          <Card size="sm" className="border-border bg-muted/30">
            <CardContent className="flex flex-col gap-1.5 p-3">
              <SectionLabel
                tone="conclusion"
                className="tracking-normal normal-case"
              >
                今回のレビューコメント
              </SectionLabel>
              <p className="leading-relaxed text-foreground">
                {model.encouragement}
              </p>
            </CardContent>
          </Card>

          <ReviewSection title="1. 今回確認できたこと">
            <LineList items={model.confirmed} />
          </ReviewSection>

          <ReviewSection title="2. まだ断定できないこと">
            <LineList items={model.unconfirmed} />
          </ReviewSection>

          <ReviewSection title="3. 留意すべきポイント">
            <LineList items={model.cautions} />
          </ReviewSection>

          <ReviewSection title="4. 今回の戻り先と見直し対象">
            <Card size="sm" className="border-border bg-card">
              <CardContent className="flex flex-col gap-2 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-conclusion">
                    {model.returnDestination.destination}
                  </CardTitle>
                  <Badge
                    variant={
                      model.returnDestination.selected ? "default" : "outline"
                    }
                    size="xs"
                  >
                    {model.returnDestination.selected ? "決定済み" : "未決定"}
                  </Badge>
                </div>
                <p className="leading-relaxed text-foreground">
                  {model.returnDestination.action}
                </p>
                <Separator />
                <MemoRow
                  label="最終判断"
                  value={model.returnDestination.finalDecision}
                />
                <MemoRow
                  label="最終判断の理由"
                  value={model.returnDestination.finalReason}
                />
              </CardContent>
            </Card>
          </ReviewSection>

          <ReviewSection title="5. 今回の戦訓 / 次に確かめること">
            <div className="flex flex-col gap-2">
              <MemoRow label="今回の戦訓" value={model.learningMemo.lesson} />
              <MemoRow
                label="成立条件・注意点"
                value={model.learningMemo.conditions}
              />
              <MemoRow
                label="次に確かめたいこと"
                value={model.learningMemo.nextValidation}
              />
              <p className="leading-relaxed text-muted-foreground">
                {PANE4_SUMMARY_LEARNING_MEMO_NOTE}
              </p>
            </div>
          </ReviewSection>

          <ReviewSection title="6. 今回どこまで検証できたか">
            <VerificationList items={model.verification} />
          </ReviewSection>

          <p className="leading-relaxed text-muted-foreground">
            {PANE4_SUMMARY_FUTURE_AI_NOTE}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
