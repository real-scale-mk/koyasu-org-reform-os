import { type ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
  getPhenomenonDiagnosticFlow,
  IMPACT_STAKEHOLDERS,
  MATURITY_LEVEL_LABELS,
  PAIN_LEVEL_LABELS,
  POLARIS_CAPABILITIES,
  POLARIS_REALIZATION_SECTION_TITLE,
  type MaturityLevel,
  type PainLevel,
  type StakeholderImpact,
  type CapabilityMaturity,
} from "@/lib/koyasu/phenomenon-diagnostics";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SectionLabel } from "@/components/primitives";
import { ArrowDown } from "lucide-react";

type PhenomenonDiagnosticSectionsProps = {
  phenomenonId: string;
};

function DiagnosticSection({
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
        <SectionLabel tone="sidebar" className="normal-case tracking-normal">
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

function FiveStepIndicator({
  value,
  labels,
  tone,
  ariaLabel,
}: {
  value: PainLevel | MaturityLevel;
  labels: readonly string[];
  tone: "pain" | "maturity";
  ariaLabel: string;
}) {
  const activeClass =
    tone === "pain"
      ? value >= 4
        ? "bg-destructive/80"
        : value >= 3
          ? "bg-signal-medium"
          : "bg-signal-low"
      : value >= 4
        ? "bg-primary"
        : value >= 3
          ? "bg-primary/60"
          : "bg-muted-foreground/35";

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div
        className="flex gap-0.5"
        role="img"
        aria-label={`${ariaLabel}: ${labels[value - 1]}（${value}/5）`}
      >
        {([1, 2, 3, 4, 5] as const).map((step) => (
          <div
            key={step}
            className={cn(
              "h-1.5 flex-1 rounded-sm",
              step <= value ? activeClass : "bg-muted",
            )}
          />
        ))}
      </div>
      <span className="truncate text-[10px] text-muted-foreground">
        {labels[value - 1]}
      </span>
    </div>
  );
}

function ScaleLegend({ labels }: { labels: readonly string[] }) {
  return (
    <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
      {labels.map((label, index) => (
        <span key={label}>
          {index + 1}.{label}
        </span>
      ))}
    </div>
  );
}

function ImpactByStakeholderTable({
  impactByStakeholder,
}: {
  impactByStakeholder: Record<
    (typeof IMPACT_STAKEHOLDERS)[number]["key"],
    StakeholderImpact
  >;
}) {
  return (
    <div className="flex flex-col gap-2">
      <ScaleLegend labels={PAIN_LEVEL_LABELS} />
      <dl className="flex flex-col gap-2.5">
        {IMPACT_STAKEHOLDERS.map((stakeholder) => {
          const { key, label } = stakeholder;
          const description =
            "description" in stakeholder ? stakeholder.description : undefined;
          const impact = impactByStakeholder[key];
          return (
            <div
              key={key}
              className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-start gap-2"
            >
              <dt className="flex flex-col gap-0.5 pt-0.5">
                <span className="text-xs font-medium text-sidebar-foreground">
                  {label}
                </span>
                {description ? (
                  <span className="text-[9px] leading-tight text-muted-foreground">
                    {description}
                  </span>
                ) : null}
              </dt>
              <dd className="flex flex-col gap-1">
                <FiveStepIndicator
                  value={impact.level}
                  labels={PAIN_LEVEL_LABELS}
                  tone="pain"
                  ariaLabel={`${label}への痛み`}
                />
                <p className="text-[10px] leading-relaxed text-muted-foreground">
                  {impact.reason}
                </p>
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

function PolarisMaturityTable({
  polarisMaturityByCapability,
}: {
  polarisMaturityByCapability: Record<
    (typeof POLARIS_CAPABILITIES)[number]["key"],
    CapabilityMaturity
  >;
}) {
  return (
    <div className="flex flex-col gap-2">
      <ScaleLegend labels={MATURITY_LEVEL_LABELS} />
      <dl className="flex flex-col gap-2.5">
        {POLARIS_CAPABILITIES.map(({ key, label }) => {
          const maturity = polarisMaturityByCapability[key];
          return (
            <div key={key} className="flex flex-col gap-1">
              <dt className="text-xs font-medium leading-snug text-sidebar-foreground">
                {label}
              </dt>
              <dd className="flex flex-col gap-1">
                <FiveStepIndicator
                  value={maturity.level}
                  labels={MATURITY_LEVEL_LABELS}
                  tone="maturity"
                  ariaLabel={label}
                />
                <p className="text-[10px] leading-relaxed text-muted-foreground">
                  {maturity.comment}
                </p>
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

function PriorityStars({ priorityLabel }: { priorityLabel: string }) {
  return (
    <span
      className="shrink-0 font-mono text-[11px] tracking-tight text-primary"
      aria-hidden
    >
      {priorityLabel}
    </span>
  );
}

function InterventionCandidateList({
  candidates,
}: {
  candidates: Array<{
    rank: number;
    structureId: string;
    label: string;
    priorityLabel: string;
    rationale: string;
  }>;
}) {
  return (
    <ul className="flex flex-col gap-1.5">
      {candidates.map((candidate) => {
        const isPrimary = candidate.rank === 1;
        return (
          <li
            key={candidate.structureId}
            className={cn(
              "flex flex-col gap-1 rounded-lg border p-2.5",
              isPrimary
                ? "border-primary/40 bg-primary/5"
                : "border-border bg-muted/30",
            )}
          >
            <div className="flex items-center gap-2">
              <PriorityStars priorityLabel={candidate.priorityLabel} />
              <span className="text-xs font-medium text-sidebar-foreground">
                {candidate.label}
              </span>
            </div>
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              {candidate.rationale}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

export function PhenomenonDiagnosticSections({
  phenomenonId,
}: PhenomenonDiagnosticSectionsProps) {
  const flow = getPhenomenonDiagnosticFlow(phenomenonId);

  return (
    <div className="flex flex-col gap-3">
      <Separator />
      <p className="text-[10px] leading-relaxed text-muted-foreground">
        現象 → Impact → {POLARIS_REALIZATION_SECTION_TITLE} → 介入候補構造 → No.1 →
        介入本丸構造 → Pane2
      </p>

      <DiagnosticSection
        title="Impact（痛み）"
        description="誰がどれだけ痛んでいるか"
      >
        <Card size="sm" className="rounded-lg bg-card">
          <CardContent className="p-3">
            <ImpactByStakeholderTable
              impactByStakeholder={flow.impactByStakeholder}
            />
          </CardContent>
        </Card>
      </DiagnosticSection>

      <FlowStep label={POLARIS_REALIZATION_SECTION_TITLE} />

      <DiagnosticSection
        title={POLARIS_REALIZATION_SECTION_TITLE}
        description="組織のあるべき姿との距離"
      >
        <Card size="sm" className="rounded-lg bg-card">
          <CardContent className="p-3">
            <PolarisMaturityTable
              polarisMaturityByCapability={flow.polarisMaturityByCapability}
            />
          </CardContent>
        </Card>
      </DiagnosticSection>

      <FlowStep label="介入候補構造" />

      <DiagnosticSection
        title="介入候補構造"
        description="優先度順に改善すべき構造を一覧（★5=最優先）"
      >
        <Card size="sm" className="rounded-lg bg-card">
          <CardContent className="p-3">
            <InterventionCandidateList
              candidates={flow.interventionCandidatesResolved}
            />
          </CardContent>
        </Card>
      </DiagnosticSection>

      <FlowStep label="No.1" />

      <DiagnosticSection
        title="今回の介入本丸構造"
        description="介入候補構造の優先度 No.1（Pane2 へ送る）"
      >
        <Card
          size="sm"
          className="rounded-lg border-primary/40 bg-primary/5 ring-1 ring-primary/20"
        >
          <CardContent className="flex flex-col gap-2 p-3">
            <div className="flex items-center gap-2">
              <PriorityStars
                priorityLabel={flow.primaryCandidate.priorityLabel}
              />
              <p className="text-sm font-semibold text-sidebar-foreground">
                今回の介入本丸構造：{flow.primaryStructureDetail.label}
              </p>
            </div>
            <p className="text-[10px] text-muted-foreground">
              介入候補構造の No.1 から選定
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              理由：{flow.primaryInterventionStructure.selectionReason}
            </p>
          </CardContent>
        </Card>
      </DiagnosticSection>

      <Separator />
    </div>
  );
}
