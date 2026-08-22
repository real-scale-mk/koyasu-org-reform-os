"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import {
  PANE3_STEP2_ROLE_DEFS,
  PANE3_STEP2_ROLE_DEFAULT_PROPOSALS,
  type Pane3Step2,
  type Pane3Step2RoleFields,
  type Pane3Step2RoleId,
} from "@/lib/koyasu/schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { InlineTextareaField, SectionLabel } from "@/components/primitives";

type Pane3RoleDesignStepProps = {
  firstEntryScene: string;
  pane3Step2: Pane3Step2;
  pane3FormKey: number;
  onUpdateRole: (
    roleId: Pane3Step2RoleId,
    patch: Partial<Pane3Step2RoleFields>,
  ) => void;
};

function RoleProposalCard({
  roleId,
  label,
  fields,
  pane3FormKey,
  onUpdate,
}: {
  roleId: Pane3Step2RoleId;
  label: string;
  fields: Pane3Step2RoleFields;
  pane3FormKey: number;
  onUpdate: (patch: Partial<Pane3Step2RoleFields>) => void;
}) {
  const proposal = PANE3_STEP2_ROLE_DEFAULT_PROPOSALS[roleId];
  const hasSupplement = fields.supplement.trim().length > 0;
  const [supplementOpen, setSupplementOpen] = useState(hasSupplement);
  const adoptButtonLabel = fields.adopted_default
    ? hasSupplement
      ? "✓ 補足・修正を含めて進める"
      : "✓ 基本案で進める"
    : hasSupplement
      ? "補足・修正を含めて進める"
      : "この基本案で進める";

  return (
    <Card size="sm" className="border-border bg-card">
      <CardHeader className="flex flex-col gap-1 p-3 pb-2">
        <CardTitle className="text-sm text-conclusion">{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5 p-3 pt-0">
        <dl className="flex flex-col gap-1.5">
          <div className="flex flex-col gap-0.5">
            <dt className="text-[10px] text-muted-foreground">基本案</dt>
            <dd className="text-[11px] leading-relaxed text-foreground">
              {proposal.basic}
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-[10px] text-muted-foreground">完了条件</dt>
            <dd className="text-[11px] leading-relaxed text-foreground">
              {proposal.completion}
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-[10px] text-muted-foreground">
              必要な支援・権限
            </dt>
            <dd className="text-[11px] leading-relaxed text-foreground">
              {proposal.support}
            </dd>
          </div>
        </dl>

        <div className="flex flex-col gap-1">
          <Button
            type="button"
            variant={fields.adopted_default ? "default" : "outline"}
            size="sm"
            className="w-full"
            aria-pressed={fields.adopted_default}
            onClick={() => onUpdate({ adopted_default: true })}
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
                key={`pane3-s2-supplement-${roleId}-${pane3FormKey}`}
                value={fields.supplement}
                onSave={(supplement) => onUpdate({ supplement })}
                ariaLabel={`Pane3 Step2 ${label} 補足・修正`}
                placeholder="基本案から変えたい点、現場固有の条件など"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

export function Pane3RoleDesignStep({
  firstEntryScene,
  pane3Step2,
  pane3FormKey,
  onUpdateRole,
}: Pane3RoleDesignStepProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <SectionLabel
          tone="conclusion"
          className="text-sm normal-case tracking-normal"
        >
          Pane3 Step2 | 誰が何を引き受けるか
        </SectionLabel>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          今回、最初に手を入れる場面について、4つの役割で引き受けを整理します（人名は不要）。
        </p>
        <Card size="sm" className="border-border bg-muted/30">
          <CardContent className="flex flex-col gap-0.5 p-3">
            <SectionLabel
              tone="conclusion"
              className="text-xs normal-case tracking-normal"
            >
              今回、役割を設計する場面
            </SectionLabel>
            <p className="text-[11px] leading-relaxed text-foreground">
              {firstEntryScene}
            </p>
          </CardContent>
        </Card>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          以下の基本案は出発点の提案です。正解ではありません。必要に応じて補足・修正してください。
        </p>
        <Card size="sm" className="border-primary/30 bg-primary/5">
          <CardContent className="p-3">
            <p className="text-[11px] leading-relaxed text-foreground">
              責任を明確にするだけでは不十分です。必要な権限・支援・完了条件もセットで確認します。
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {PANE3_STEP2_ROLE_DEFS.map((role) => (
          <RoleProposalCard
            key={role.id}
            roleId={role.id}
            label={role.label}
            fields={pane3Step2.roles[role.id]}
            pane3FormKey={pane3FormKey}
            onUpdate={(patch) => onUpdateRole(role.id, patch)}
          />
        ))}
      </div>
    </section>
  );
}
