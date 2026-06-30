"use client";

import { type ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
  formatStrategyRating,
  STRATEGY_COMPARISON_AXES,
  type ResolvedReformStrategyDesign,
  type StrategyComparisonScores,
  type StrategyRating,
} from "@/lib/koyasu/reform-strategies";
import { type Phenomenon } from "@/lib/koyasu/schema";
import { type PrimaryInterventionContext } from "@/lib/koyasu/phenomenon-diagnostics";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SectionLabel } from "@/components/primitives";
import { ArrowDown } from "lucide-react";

type ReformStrategyDesignPaneProps = {
  selectedPhenomenon: Phenomenon;
  primaryIntervention: PrimaryInterventionContext;
  design: ResolvedReformStrategyDesign;
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

export function ReformStrategyDesignPane({
  selectedPhenomenon,
  primaryIntervention,
  design,
}: ReformStrategyDesignPaneProps) {
  return (
    <section className="flex min-w-0 flex-[1.4] flex-col bg-background">
      <header className="flex h-12 shrink-0 flex-col justify-center gap-0.5 border-b border-border px-4">
        <h2 className="text-sm font-semibold text-conclusion">改革戦略設計</h2>
        <p className="text-[11px] text-muted-foreground">
          介入本丸構造からの戦略設計
        </p>
      </header>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 p-4">
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

          <Separator />
        </div>
      </ScrollArea>
    </section>
  );
}

/** @deprecated LeverageActionPane からの移行用エイリアス */
export const LeverageActionPane = ReformStrategyDesignPane;
