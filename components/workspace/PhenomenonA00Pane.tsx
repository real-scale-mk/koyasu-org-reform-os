"use client";

import { cn } from "@/lib/utils";
import {
  IMPORTANCE_VALUES,
  STATUS_VALUES,
  type Phenomenon,
} from "@/lib/koyasu/schema";
import {
  InlineFieldRow,
  InlineSelectField,
  InlineTextareaField,
} from "@/components/primitives";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/components/ui/sidebar";
import { AddItemDialog } from "@/components/workspace/AddItemDialog";
import { LevelBadge } from "@/components/workspace/LevelBadge";
import { Pane1Toggle } from "@/components/workspace/Pane1Toggle";
import { PhenomenonDiagnosticSections } from "@/components/workspace/PhenomenonDiagnosticSections";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { sortPhenomenaForDisplay, type PhenomenonId } from "@/lib/koyasu/phenomenon-workspace-data";

const paneSectionLabelClass =
  "h-auto px-2 py-1 text-sm font-bold text-sidebar-foreground";

type PhenomenonA00PaneProps = {
  toolName: string;
  caseA00: string;
  phenomenonCasePolaris: string;
  phenomenonTargetState: string;
  phenomena: Phenomenon[];
  selectedPhenomenonId: string;
  onSelectPhenomenon: (id: string) => void;
  onUpdateCaseA00: (value: string) => void;
  onUpdatePhenomenon: (
    id: string,
    patch: Partial<
      Pick<Phenomenon, "target_state" | "importance" | "status" | "memo">
    >,
  ) => void;
  onAddPhenomenon: (label: string) => void;
};

export function PhenomenonA00Pane({
  toolName,
  caseA00,
  phenomenonCasePolaris,
  phenomenonTargetState,
  phenomena,
  selectedPhenomenonId,
  onSelectPhenomenon,
  onUpdateCaseA00,
  onUpdatePhenomenon,
  onAddPhenomenon,
}: PhenomenonA00PaneProps) {
  const [addOpen, setAddOpen] = useState(false);
  const selected = phenomena.find((p) => p.id === selectedPhenomenonId);
  const sortedPhenomena = useMemo(
    () =>
      sortPhenomenaForDisplay(
        phenomena as Array<Phenomenon & { id: PhenomenonId }>,
      ),
    [phenomena],
  );

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
          <SidebarGroup>
            <SidebarGroupLabel className={paneSectionLabelClass}>
              案件POLARIS（案件全体の目指す姿）
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-2 group-data-[collapsible=icon]:hidden">
              <Card>
                <CardHeader className="flex flex-col gap-1 p-3 pb-0">
                  <CardTitle className="text-base font-bold tracking-wide">
                    案件POLARIS
                  </CardTitle>
                  <p className="text-[11px] text-muted-foreground">
                    案件全体の目指す姿
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 p-3 pt-2">
                  <p className="text-[10px] font-medium text-muted-foreground">
                    この現象のPOLARIS視点
                  </p>
                  <p className="text-sm leading-relaxed text-sidebar-foreground">
                    {phenomenonCasePolaris}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    案件共通（編集可）
                  </p>
                  <InlineTextareaField
                    value={caseA00}
                    onSave={onUpdateCaseA00}
                    ariaLabel="案件POLARIS"
                    placeholder="案件全体の北極星（A00）を入力"
                  />
                </CardContent>
              </Card>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className={paneSectionLabelClass}>
              現象リスト
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-1">
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
                        <span className="truncate text-sm">{p.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {selected ? (
            <SidebarGroup className="group-data-[collapsible=icon]:hidden">
              <SidebarGroupLabel className={paneSectionLabelClass}>
                選択中の現象
              </SidebarGroupLabel>
              <SidebarGroupContent className="flex flex-col gap-3 px-2">
                <p className="text-base font-bold text-phenomenon-selected-foreground">
                  {selected.label}
                </p>
                <dl className="flex flex-col gap-3 text-sm">
                  <InlineFieldRow label="目指す姿 / Target State">
                    <p className="rounded-lg border border-border bg-muted/30 px-2.5 py-2 text-sm leading-relaxed text-sidebar-foreground">
                      {phenomenonTargetState}
                    </p>
                  </InlineFieldRow>
                  <InlineFieldRow label="重要度">
                    <div className="flex flex-col gap-2">
                      <LevelBadge level={selected.importance} prefix="重要度" />
                      <InlineSelectField
                        value={selected.importance}
                        options={IMPORTANCE_VALUES}
                        onSave={(v) =>
                          onUpdatePhenomenon(selected.id, {
                            importance: v as Phenomenon["importance"],
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
                      value={selected.memo}
                      onSave={(v) =>
                        onUpdatePhenomenon(selected.id, { memo: v })
                      }
                      ariaLabel="メモ"
                    />
                  </InlineFieldRow>
                </dl>
                <PhenomenonDiagnosticSections phenomenonId={selected.id} />
              </SidebarGroupContent>
            </SidebarGroup>
          ) : (
            <SidebarGroup className="group-data-[collapsible=icon]:hidden">
              <SidebarGroupContent className="px-3">
                <p className="text-sm text-muted-foreground">
                  現象を選択してください
                </p>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
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
