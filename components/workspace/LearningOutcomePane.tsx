"use client";

import { cn } from "@/lib/utils";
import { type Phenomenon } from "@/lib/koyasu/schema";
import { InlineTextareaField } from "@/components/primitives";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pane4Section } from "@/components/workspace/Pane4Section";
import { Pane4Toggle } from "@/components/workspace/Pane4Toggle";
import { Plus } from "lucide-react";

type LearningOutcomePaneProps = {
  selectedPhenomenon: Phenomenon;
  executionResults: string[];
  outcomes: string[];
  insights: string[];
  skillCandidates: string[];
  placeholder: boolean;
  pane4Open: boolean;
  onTogglePane4: () => void;
  onUpdateInsight: (index: number, value: string) => void;
  onUpdateSkillCandidate: (index: number, value: string) => void;
  onAddInsight: () => void;
  onAddSkillCandidate: () => void;
};

function StaticList({ items, emptyLabel }: { items: string[]; emptyLabel: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item} className="text-sm leading-relaxed text-muted-foreground">
          · {item}
        </li>
      ))}
    </ul>
  );
}

function EditableList({
  items,
  ariaPrefix,
  onUpdate,
  onAdd,
  addLabel,
}: {
  items: string[];
  ariaPrefix: string;
  onUpdate: (index: number, value: string) => void;
  onAdd: () => void;
  addLabel: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">未入力</p>
      ) : (
        items.map((item, index) => (
          <InlineTextareaField
            key={`${ariaPrefix}-${index}`}
            value={item}
            onSave={(v) => onUpdate(index, v)}
            ariaLabel={`${ariaPrefix} ${index + 1}`}
          />
        ))
      )}
      <Button variant="outline" size="sm" onClick={onAdd}>
        <Plus />
        {addLabel}
      </Button>
    </div>
  );
}

export function LearningOutcomePane({
  selectedPhenomenon,
  executionResults,
  outcomes,
  insights,
  skillCandidates,
  placeholder,
  pane4Open,
  onTogglePane4,
  onUpdateInsight,
  onUpdateSkillCandidate,
  onAddInsight,
  onAddSkillCandidate,
}: LearningOutcomePaneProps) {
  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-l border-border bg-background",
        "overflow-hidden transition-[width] duration-200 ease-linear",
        pane4Open ? "w-[320px]" : "w-12",
      )}
    >
      {pane4Open ? (
        <>
          <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
            <h2 className="flex-1 truncate text-sm font-semibold text-conclusion">
              学びと成果
            </h2>
            <Pane4Toggle open={pane4Open} onToggle={onTogglePane4} />
          </header>

          <ScrollArea className="min-h-0 flex-1">
            <p className="px-5 pt-4 text-[11px] text-muted-foreground">
              フォーカス：
              <span className="font-medium text-foreground">
                {selectedPhenomenon.label}
              </span>
            </p>

            {placeholder ? (
              <Pane4Section title="準備中">
                <p className="text-sm text-muted-foreground">
                  この現象の学び・成果データは準備中です。気づきと SKILL
                  化候補は編集・保存できます。
                </p>
              </Pane4Section>
            ) : (
              <>
                <Pane4Section title="1. 実行結果">
                  <StaticList
                    items={executionResults}
                    emptyLabel="実行結果は未登録です"
                  />
                </Pane4Section>
                <Pane4Section title="2. 成果">
                  <StaticList items={outcomes} emptyLabel="成果は未登録です" />
                </Pane4Section>
              </>
            )}

            <Pane4Section title={placeholder ? "気づき" : "3. 気づき"}>
              <EditableList
                items={insights}
                ariaPrefix="気づき"
                onUpdate={onUpdateInsight}
                onAdd={onAddInsight}
                addLabel="気づきを追加"
              />
            </Pane4Section>

            <Pane4Section title={placeholder ? "SKILL化候補" : "4. SKILL化候補"}>
              <EditableList
                items={skillCandidates}
                ariaPrefix="SKILL化候補"
                onUpdate={onUpdateSkillCandidate}
                onAdd={onAddSkillCandidate}
                addLabel="SKILL化候補を追加"
              />
            </Pane4Section>
          </ScrollArea>
        </>
      ) : (
        <div className="flex h-12 shrink-0 items-center justify-center border-b border-border">
          <Pane4Toggle open={pane4Open} onToggle={onTogglePane4} />
        </div>
      )}
    </aside>
  );
}
