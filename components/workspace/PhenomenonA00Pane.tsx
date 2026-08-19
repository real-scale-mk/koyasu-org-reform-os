"use client";

import { cn } from "@/lib/utils";
import {
  IMPORTANCE_VALUES,
  STATUS_VALUES,
  type Pane1Intake,
  type Phenomenon,
} from "@/lib/koyasu/schema";
import {
  InlineFieldRow,
  InlineSelectField,
  InlineTextareaField,
  InlineTextField,
  SectionLabel,
} from "@/components/primitives";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { AddItemDialog } from "@/components/workspace/AddItemDialog";
import { LevelBadge } from "@/components/workspace/LevelBadge";
import { Pane1Toggle } from "@/components/workspace/Pane1Toggle";
import { PhenomenonDiagnosticSections } from "@/components/workspace/PhenomenonDiagnosticSections";
import { ArrowRight, ChevronDown, Plus } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import {
  sortPhenomenaForDisplay,
  type PhenomenonId,
} from "@/lib/koyasu/phenomenon-workspace-data";

const paneSectionLabelClass =
  "h-auto px-2 py-1 text-sm font-bold text-sidebar-foreground";

/** V1 静的問い返し（localStorage 非保存・AI API 非接続） */
const AI_PROBE_PRIMARY = [
  "問題を自分の役割として引き受けない",
  "責任を他者・他部門へ移す",
  "上司や管理職が、面倒な問題への関与や意思決定を避ける",
  "立場の弱い人や外注先へ実務負担が集中する",
] as const;

const AI_PROBE_MORE = [
  "上位者の意向を読み、問題提起や反対意見を控える「忖度」が起きる",
  "失敗や低評価を避ける自己防衛が優先される",
  "問題を指摘した人が、そのまま処理まで背負わされる",
  "波風を立てないことが、問題解決より優先される",
] as const;

const SURFACE_SLOT_COUNT = 3;
const SUMMARY_PREVIEW_MAX = 72;

function previewText(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "（未入力）";
  if (trimmed.length <= SUMMARY_PREVIEW_MAX) return trimmed;
  return `${trimmed.slice(0, SUMMARY_PREVIEW_MAX)}…`;
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
      <p className="text-xs leading-relaxed text-sidebar-foreground">
        {previewText(value)}
      </p>
    </div>
  );
}

type PhenomenonA00PaneProps = {
  toolName: string;
  caseA00: string;
  phenomenonCasePolaris: string;
  phenomenonTargetState: string;
  phenomena: Phenomenon[];
  selectedPhenomenonId: string;
  pane1Intake: Pane1Intake;
  intakeFormKey: number;
  onSelectPhenomenon: (id: string) => void;
  onUpdateCaseA00: (value: string) => void;
  onUpdatePane1Intake: (patch: Partial<Pane1Intake>) => void;
  onUpdatePhenomenon: (
    id: string,
    patch: Partial<
      Pick<Phenomenon, "target_state" | "importance" | "status" | "memo">
    >,
  ) => void;
  onAddPhenomenon: (label: string) => void;
};

function IntakeStep({
  step,
  title,
  description,
  defaultOpen = false,
  children,
}: {
  step: number;
  title: string;
  description?: string;
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
                "group/intake-step flex cursor-pointer items-start justify-between gap-2 p-3",
                "rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              )}
            />
          }
        >
          <div className="flex min-w-0 flex-col gap-1">
            <SectionLabel
              tone="sidebar"
              className="normal-case tracking-normal"
            >
              {step}. {title}
            </SectionLabel>
            {description ? (
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <ChevronDown
            aria-hidden
            className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform in-data-[panel-open]:rotate-180"
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="flex flex-col gap-3 border-t border-border p-3 pt-3">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export function PhenomenonA00Pane({
  toolName,
  caseA00,
  phenomenonCasePolaris,
  phenomenonTargetState,
  phenomena,
  selectedPhenomenonId,
  pane1Intake,
  intakeFormKey,
  onSelectPhenomenon,
  onUpdateCaseA00,
  onUpdatePane1Intake,
  onUpdatePhenomenon,
  onAddPhenomenon,
}: PhenomenonA00PaneProps) {
  const { setOpen: setSidebarOpen } = useSidebar();
  const [addOpen, setAddOpen] = useState(false);
  const [legacyOpen, setLegacyOpen] = useState(false);
  const [aiMoreOpen, setAiMoreOpen] = useState(false);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const selected = phenomena.find((p) => p.id === selectedPhenomenonId);
  const sortedPhenomena = useMemo(
    () =>
      sortPhenomenaForDisplay(
        phenomena as Array<Phenomenon & { id: PhenomenonId }>,
      ),
    [phenomena],
  );

  const surfaceSlots = useMemo(() => {
    return Array.from({ length: SURFACE_SLOT_COUNT }, (_, index) => {
      return pane1Intake.surface_phenomena[index] ?? "";
    });
  }, [pane1Intake.surface_phenomena]);

  const updateSurfaceSlot = (index: number, value: string) => {
    const next = Array.from({ length: SURFACE_SLOT_COUNT }, (_, i) => {
      if (i === index) return value;
      return pane1Intake.surface_phenomena[i] ?? "";
    });
    onUpdatePane1Intake({ surface_phenomena: next });
  };

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="border-r border-sidebar-border [&_[data-slot=sidebar-container]]:bg-sidebar"
      >
        <SidebarHeader className="flex h-12 flex-row items-center justify-between border-b border-sidebar-border px-2">
          <span className="truncate text-sm font-semibold group-data-[collapsible=icon]:hidden">
            {toolName}
          </span>
          <Pane1Toggle />
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel className={paneSectionLabelClass}>
              A00（北極星）
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-2">
              <Card size="sm" className="rounded-lg">
                <CardContent className="flex flex-col gap-2 p-3">
                  <p className="text-[10px] text-muted-foreground">
                    案件全体の目指す姿（常時確認）
                  </p>
                  <InlineTextareaField
                    key={`a00-${intakeFormKey}`}
                    value={caseA00}
                    onSave={onUpdateCaseA00}
                    ariaLabel="案件A00"
                    placeholder="一人ひとりが成長・使命感・誇りを持ち…"
                  />
                </CardContent>
              </Card>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel className={paneSectionLabelClass}>
              現象と違和感（入口）
            </SidebarGroupLabel>
            <SidebarGroupContent className="flex flex-col gap-2 px-2">
              <IntakeStep
                step={1}
                title="いま感じている違和感を、そのまま出す"
                description="今、その組織で『おかしい』『放置できない』と感じていることを、整理せずに書いてください。原因や解決策を決める必要はありません。"
                defaultOpen
              >
                <InlineTextareaField
                  key={`discomfort-${intakeFormKey}`}
                  value={pane1Intake.discomfort}
                  onSave={(value) =>
                    onUpdatePane1Intake({ discomfort: value })
                  }
                  ariaLabel="違和感"
                  placeholder="例：不具合が起きても誰も自分の問題として動かない"
                />
              </IntakeStep>

              <IntakeStep
                step={2}
                title="AIと一緒に整理する"
                description="候補は思考のヒントです。答えではありません。"
                defaultOpen
              >
                <p className="text-[10px] leading-relaxed text-muted-foreground">
                  AIの候補は答えではありません。あなたの仮説を整理するための材料です。
                </p>
                <ul className="flex flex-col gap-1.5">
                  {AI_PROBE_PRIMARY.map((candidate) => (
                    <li
                      key={candidate}
                      className="rounded-md border border-border bg-card px-2.5 py-2 text-xs leading-relaxed text-sidebar-foreground"
                    >
                      {candidate}
                    </li>
                  ))}
                </ul>
                <Collapsible open={aiMoreOpen} onOpenChange={setAiMoreOpen}>
                  <CollapsibleTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-full justify-between px-2 text-muted-foreground"
                      />
                    }
                  >
                    <span>
                      {aiMoreOpen ? "他の観点を閉じる" : "他の観点を見る"}
                    </span>
                    <ChevronDown
                      aria-hidden
                      className="size-4 transition-transform in-data-[panel-open]:rotate-180"
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ul className="mt-1.5 flex flex-col gap-1.5">
                      {AI_PROBE_MORE.map((candidate) => (
                        <li
                          key={candidate}
                          className="rounded-md border border-border bg-card px-2.5 py-2 text-xs leading-relaxed text-sidebar-foreground"
                        >
                          {candidate}
                        </li>
                      ))}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              </IntakeStep>

              <IntakeStep
                step={3}
                title="中心現象と表出現象"
                description="今回、特に正面から扱いたい中心的な現象を1つに絞り、表に出ている様子を最大3件で書きます。"
              >
                <div className="flex flex-col gap-3">
                  <InlineFieldRow label="中心現象">
                    <InlineTextareaField
                      key={`core-${intakeFormKey}`}
                      value={pane1Intake.core_phenomenon}
                      onSave={(value) =>
                        onUpdatePane1Intake({ core_phenomenon: value })
                      }
                      ariaLabel="中心現象"
                      placeholder="例：課題や問題を自分の役割として引き受けず、他者や他部門へ転嫁する『他人事化』が起きている"
                    />
                  </InlineFieldRow>
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-medium text-sidebar-foreground">
                      表出現象（最大3件）
                    </p>
                    {surfaceSlots.map((slot, index) => (
                      <InlineTextareaField
                        key={`surface-${index}-${intakeFormKey}`}
                        value={slot}
                        onSave={(value) => updateSurfaceSlot(index, value)}
                        ariaLabel={`表出現象 ${index + 1}`}
                        placeholder={
                          index === 0
                            ? "例：担当者・期限・完了条件が決まらず先送りされる"
                            : index === 1
                              ? "例：対策会議で責任の所在を巡る議論が続く"
                              : "例：依頼メールを送った時点で対応終了と扱う"
                        }
                      />
                    ))}
                  </div>
                </div>
              </IntakeStep>

              <IntakeStep
                step={4}
                title="事実・観察 / 仮説・解釈"
                description="事実と仮説を分けて書きます（V1は2分類のみ）。"
              >
                <div className="flex flex-col gap-3">
                  <InlineFieldRow label="事実・観察">
                    <div className="flex flex-col gap-1">
                      <p className="text-[11px] text-muted-foreground">
                        実際に見た、聞いた、記録されていること
                      </p>
                      <InlineTextareaField
                        key={`facts-${intakeFormKey}`}
                        value={pane1Intake.facts}
                        onSave={(value) =>
                          onUpdatePane1Intake({ facts: value })
                        }
                        ariaLabel="事実・観察"
                        placeholder="例：不具合対策会議で担当者と期限が決まらないまま終了した"
                      />
                    </div>
                  </InlineFieldRow>
                  <InlineFieldRow label="仮説・解釈">
                    <div className="flex flex-col gap-1">
                      <p className="text-[11px] text-muted-foreground">
                        まだ検証が必要な意味づけ、原因、因果関係
                      </p>
                      <InlineTextareaField
                        key={`hypotheses-${intakeFormKey}`}
                        value={pane1Intake.hypotheses}
                        onSave={(value) =>
                          onUpdatePane1Intake({ hypotheses: value })
                        }
                        ariaLabel="仮説・解釈"
                        placeholder="例：責任を引き受けることで失敗評価を受けることを避けている可能性がある"
                      />
                    </div>
                  </InlineFieldRow>
                </div>
              </IntakeStep>

              <IntakeStep
                step={5}
                title="AS IS / TO BE / GAP"
                description="いまの状態と目指す状態を決め、その差を GAP として捉えます。"
              >
                <div className="flex flex-col gap-3">
                  <p
                    className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground"
                    aria-hidden
                  >
                    <span>関係の見取り図:</span>
                    <span className="rounded-md border border-border bg-muted/30 px-1.5 py-0.5">
                      AS IS
                    </span>
                    <span>→</span>
                    <span className="rounded-md border border-border bg-muted/30 px-1.5 py-0.5">
                      GAP
                    </span>
                    <span>→</span>
                    <span className="rounded-md border border-border bg-muted/30 px-1.5 py-0.5">
                      TO BE
                    </span>
                  </p>

                  <InlineFieldRow label="AS IS｜いま、何が起きているか">
                    <div className="flex flex-col gap-1">
                      <p className="text-[11px] text-muted-foreground">
                        原因を決めつけず、現在の状態を具体的に整理します。
                      </p>
                      <InlineTextareaField
                        key={`as-is-${intakeFormKey}`}
                        value={pane1Intake.as_is}
                        onSave={(value) =>
                          onUpdatePane1Intake({ as_is: value })
                        }
                        ariaLabel="AS IS"
                        placeholder="例：不具合が発生しても最後まで引き受けず、依頼だけで対応を終える…"
                      />
                    </div>
                  </InlineFieldRow>

                  <InlineFieldRow label="TO BE｜どうなっていたいか">
                    <div className="flex flex-col gap-1">
                      <p className="text-[11px] text-muted-foreground">
                        誰が、どのような状態で問題に向き合えているかを描きます。
                      </p>
                      <InlineTextareaField
                        key={`to-be-${intakeFormKey}`}
                        value={pane1Intake.to_be}
                        onSave={(value) =>
                          onUpdatePane1Intake({ to_be: value })
                        }
                        ariaLabel="TO BE"
                        placeholder="例：推進責任者と実務担当者が明確になり、期限まで追跡される…"
                      />
                    </div>
                  </InlineFieldRow>

                  <InlineFieldRow label="GAP｜何が足りていないか">
                    <div className="flex flex-col gap-1">
                      <p className="text-[11px] text-muted-foreground">
                        AS IS と TO BE
                        の間にある不足・断絶を一言で捉えます（先に埋めない）。
                      </p>
                      <InlineTextareaField
                        key={`gap-${intakeFormKey}`}
                        value={pane1Intake.gap}
                        onSave={(value) => onUpdatePane1Intake({ gap: value })}
                        ariaLabel="GAP"
                        placeholder="例：『責任連鎖』が成立していない"
                      />
                    </div>
                  </InlineFieldRow>
                </div>
              </IntakeStep>

              <IntakeStep
                step={6}
                title="今回扱う案件とスコープ"
                description="ここまで整理した現象とGAPを、一つの案件として切り出します。"
              >
                <div className="flex flex-col gap-3">
                  <InlineFieldRow label="案件名">
                    <div className="flex flex-col gap-1">
                      <p className="text-[11px] text-muted-foreground">
                        現象とGAPを、今回扱う一つの案件として表します。
                      </p>
                      <InlineTextField
                        key={`case-name-${intakeFormKey}`}
                        value={pane1Intake.case_name}
                        onSave={(value) =>
                          onUpdatePane1Intake({ case_name: value })
                        }
                        ariaLabel="案件名"
                        placeholder="例：製品不具合対応における他人事化と責任連鎖の分断"
                      />
                    </div>
                  </InlineFieldRow>

                  <InlineFieldRow label="対象組織">
                    <InlineTextField
                      key={`target-org-${intakeFormKey}`}
                      value={pane1Intake.target_org}
                      onSave={(value) =>
                        onUpdatePane1Intake({ target_org: value })
                      }
                      ariaLabel="対象組織"
                      placeholder="例：約1,000名規模の製造事業部"
                    />
                  </InlineFieldRow>

                  <InlineFieldRow label="対象部門・場面">
                    <InlineTextField
                      key={`target-context-${intakeFormKey}`}
                      value={pane1Intake.target_context}
                      onSave={(value) =>
                        onUpdatePane1Intake({ target_context: value })
                      }
                      ariaLabel="対象部門・場面"
                      placeholder="例：設計・製造・品質管理／不具合発生から対策完了まで"
                    />
                  </InlineFieldRow>

                  <InlineFieldRow label="主な関係者">
                    <InlineTextField
                      key={`stakeholders-${intakeFormKey}`}
                      value={pane1Intake.stakeholders}
                      onSave={(value) =>
                        onUpdatePane1Intake({ stakeholders: value })
                      }
                      ariaLabel="主な関係者"
                      placeholder="例：推進責任者、設計・製造・品質、管理職、外注先"
                    />
                  </InlineFieldRow>

                  <InlineFieldRow label="今回扱う範囲">
                    <div className="flex flex-col gap-1">
                      <p className="text-[11px] text-muted-foreground">
                        今回の改革で、どこまでを正面から扱うかを明確にします。
                      </p>
                      <InlineTextareaField
                        key={`scope-in-${intakeFormKey}`}
                        value={pane1Intake.scope_in}
                        onSave={(value) =>
                          onUpdatePane1Intake({ scope_in: value })
                        }
                        ariaLabel="今回扱う範囲"
                        placeholder="例：不具合発見から責任者決定・実行・完了確認までの責任連鎖"
                      />
                    </div>
                  </InlineFieldRow>

                  <InlineFieldRow label="今回扱わない範囲">
                    <div className="flex flex-col gap-1">
                      <p className="text-[11px] text-muted-foreground">
                        重要でも今回は直接扱わない境界（MVPの絞り込み）。
                      </p>
                      <InlineTextareaField
                        key={`scope-out-${intakeFormKey}`}
                        value={pane1Intake.scope_out}
                        onSave={(value) =>
                          onUpdatePane1Intake({ scope_out: value })
                        }
                        ariaLabel="今回扱わない範囲"
                        placeholder="例：人事制度全体、若手離職全体、評価制度の全面改定"
                      />
                    </div>
                  </InlineFieldRow>
                </div>
              </IntakeStep>

              <Card size="sm" className="rounded-lg">
                <CardHeader className="flex flex-col gap-1 p-3 pb-0">
                  <CardTitle className="text-sm font-semibold">
                    Pane1で整理したこと
                  </CardTitle>
                  <p className="text-[10px] text-muted-foreground">
                    中心現象と GAP までの要点確認（詳細は上の各ステップ）
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col gap-2.5 p-3">
                  <SummaryItem
                    label="中心現象"
                    value={pane1Intake.core_phenomenon}
                  />
                  <SummaryItem label="AS IS" value={pane1Intake.as_is} />
                  <SummaryItem label="TO BE" value={pane1Intake.to_be} />
                  <SummaryItem label="GAP" value={pane1Intake.gap} />
                </CardContent>
              </Card>

              <Card size="sm" className="rounded-lg border-primary/30">
                <CardContent className="flex flex-col gap-3 p-3">
                  <div className="flex flex-col gap-1">
                    <SectionLabel
                      tone="sidebar"
                      className="normal-case tracking-normal"
                    >
                      なぜ、このGAPが繰り返し生まれるのか？
                    </SectionLabel>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      ここからは原因を決めつけず、GAPを生み続ける背景構造について仮説を立てます。
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setSidebarOpen(false)}
                  >
                    Pane2 構造分析へ
                    <ArrowRight />
                  </Button>
                  <p className="text-[10px] text-muted-foreground">
                    Pane1を畳み、右側の「構造分析」に集中できます（⌘B
                    でも切替可）。Pane2の中身は既存のままです。
                  </p>
                </CardContent>
              </Card>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupContent className="px-2">
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
                        tone="sidebar"
                        className="normal-case tracking-normal"
                      >
                        Pane2連動：分析対象の現象
                      </SectionLabel>
                      <p className="text-[11px] text-muted-foreground">
                        既存の現象選択（詳細分析はさらに内側）
                        {selected ? ` / 選択中: ${selected.label}` : null}
                      </p>
                    </div>
                    <ChevronDown
                      aria-hidden
                      className="size-4 shrink-0 text-muted-foreground transition-transform in-data-[panel-open]:rotate-180"
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="flex flex-col gap-3 border-t border-border p-3">
                      <div className="flex flex-col gap-1">
                        <p className="text-[10px] font-medium text-muted-foreground">
                          この現象のPOLARIS視点
                        </p>
                        <p className="text-sm leading-relaxed text-sidebar-foreground">
                          {phenomenonCasePolaris}
                        </p>
                      </div>

                      <SidebarMenu>
                        {sortedPhenomena.map((p) => {
                          const isSelected = p.id === selectedPhenomenonId;
                          return (
                            <SidebarMenuItem key={p.id}>
                              <SidebarMenuButton
                                isActive={isSelected}
                                onClick={() => onSelectPhenomenon(p.id)}
                                className={cn(
                                  "h-auto rounded-md border-l-[3px] border-transparent py-2.5",
                                  isSelected &&
                                    "border-phenomenon-selected-border bg-phenomenon-selected font-bold text-phenomenon-selected-foreground hover:bg-phenomenon-selected hover:text-phenomenon-selected-foreground data-active:bg-phenomenon-selected data-active:text-phenomenon-selected-foreground",
                                )}
                              >
                                <span className="truncate text-sm">
                                  {p.label}
                                </span>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                      </SidebarMenu>

                      {selected ? (
                        <div className="flex flex-col gap-3">
                          <CardHeader className="flex flex-col gap-1 p-0">
                            <CardTitle className="text-base font-bold text-phenomenon-selected-foreground">
                              {selected.label}
                            </CardTitle>
                          </CardHeader>
                          <dl className="flex flex-col gap-3 text-sm">
                            <InlineFieldRow label="目指す姿 / Target State">
                              <p className="rounded-lg border border-border bg-muted/30 px-2.5 py-2 text-sm leading-relaxed text-sidebar-foreground">
                                {phenomenonTargetState}
                              </p>
                            </InlineFieldRow>
                            <InlineFieldRow label="重要度">
                              <div className="flex flex-col gap-2">
                                <LevelBadge
                                  level={selected.importance}
                                  prefix="重要度"
                                />
                                <InlineSelectField
                                  value={selected.importance}
                                  options={IMPORTANCE_VALUES}
                                  onSave={(v) =>
                                    onUpdatePhenomenon(selected.id, {
                                      importance:
                                        v as Phenomenon["importance"],
                                    })
                                  }
                                  ariaLabel="重要度"
                                />
                              </div>
                            </InlineFieldRow>
                            <InlineFieldRow label="状態">
                              <InlineSelectField
                                value={selected.status}
                                options={STATUS_VALUES}
                                onSave={(v) =>
                                  onUpdatePhenomenon(selected.id, {
                                    status: v as Phenomenon["status"],
                                  })
                                }
                                ariaLabel="状態"
                              />
                            </InlineFieldRow>
                            <InlineFieldRow label="メモ">
                              <InlineTextareaField
                                key={`memo-${selected.id}-${intakeFormKey}`}
                                value={selected.memo}
                                onSave={(v) =>
                                  onUpdatePhenomenon(selected.id, { memo: v })
                                }
                                ariaLabel="メモ"
                              />
                            </InlineFieldRow>
                          </dl>
                          <Collapsible
                            open={diagnosticsOpen}
                            onOpenChange={setDiagnosticsOpen}
                          >
                            <Card size="sm" className="rounded-lg">
                              <CollapsibleTrigger
                                nativeButton={false}
                                render={
                                  <div
                                    className={cn(
                                      "group/diagnostics flex cursor-pointer items-center justify-between gap-2 p-3",
                                      "rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                                    )}
                                  />
                                }
                              >
                                <div className="flex min-w-0 flex-col gap-0.5">
                                  <SectionLabel
                                    tone="sidebar"
                                    className="normal-case tracking-normal"
                                  >
                                    詳細分析を見る
                                  </SectionLabel>
                                  <p className="text-[11px] text-muted-foreground">
                                    Impact・POLARIS成熟度・介入候補など（必要時のみ）
                                  </p>
                                </div>
                                <ChevronDown
                                  aria-hidden
                                  className="size-4 shrink-0 text-muted-foreground transition-transform in-data-[panel-open]:rotate-180"
                                />
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <CardContent className="border-t border-border p-3">
                                  <PhenomenonDiagnosticSections
                                    phenomenonId={selected.id}
                                  />
                                </CardContent>
                              </CollapsibleContent>
                            </Card>
                          </Collapsible>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          現象を選択してください
                        </p>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border p-2 group-data-[collapsible=icon]:hidden">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setAddOpen(true)}
          >
            <Plus />
            現象を追加
          </Button>
        </SidebarFooter>
      </Sidebar>

      <AddItemDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="現象を追加"
        description="現象名のみ入力します。詳細は追加後に編集できます。"
        fieldLabel="現象名"
        fieldId="phenomenon-label"
        placeholder="例：責任曖昧化"
        onAdd={onAddPhenomenon}
      />
    </>
  );
}
