"use client";

import { cn } from "@/lib/utils";
import {
  type NextAction,
  type Phenomenon,
} from "@/lib/org-transformation/schema";
import { Pane4Toggle } from "@/components/workspace/Pane4Toggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

type NextActionPaneProps = {
  selectedPhenomenon: Phenomenon;
  nextAction: NextAction;
  learnings: string[];
  pane4Open: boolean;
  onTogglePane4: () => void;
};

export function NextActionPane({
  selectedPhenomenon,
  nextAction,
  learnings,
  pane4Open,
  onTogglePane4,
}: NextActionPaneProps) {
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
            <h2 className="flex-1 truncate text-sm font-semibold text-foreground">
              次の一手
            </h2>
            <Pane4Toggle open={pane4Open} onToggle={onTogglePane4} />
          </header>

          <ScrollArea className="min-h-0 flex-1">
            <div className="flex flex-col gap-4 p-3">
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                フォーカス：
                <span className="font-medium text-foreground">
                  {selectedPhenomenon.label}
                </span>
                — レバレッジ：★ {nextAction.leverageLabel}
              </p>

              <div className="flex flex-col gap-3">
                {nextAction.rows.map((row) => (
                  <div
                    key={`${row.stakeholder}-${row.intent}`}
                    className="flex flex-col gap-1 rounded-lg border border-border bg-card p-3"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {row.stakeholder}
                    </p>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      {row.question}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      ねらい：{row.intent}
                    </p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  今回の学び
                </h3>
                <ul className="flex flex-col gap-2">
                  {learnings.map((item) => (
                    <li
                      key={item}
                      className="text-[11px] leading-relaxed text-muted-foreground"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
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
