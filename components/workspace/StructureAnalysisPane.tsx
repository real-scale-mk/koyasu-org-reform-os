"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import {
  sortPerspectivesByRelevance,
  type Perspective,
  type PerspectiveDetail,
  type Phenomenon,
  type Relevance,
} from "@/lib/koyasu/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LevelBadge } from "@/components/workspace/LevelBadge";

type StructureAnalysisPaneProps = {
  selectedPhenomenon: Phenomenon;
  perspectives: Perspective[];
  perspectiveDetails: Record<string, PerspectiveDetail>;
  relevanceMap: Record<string, Relevance>;
};

export function StructureAnalysisPane({
  selectedPhenomenon,
  perspectives,
  perspectiveDetails,
  relevanceMap,
}: StructureAnalysisPaneProps) {
  const [openPerspectiveId, setOpenPerspectiveId] = useState<string | null>(
    null,
  );

  const sorted = useMemo(
    () => sortPerspectivesByRelevance(perspectives, relevanceMap),
    [perspectives, relevanceMap],
  );

  const activeDetail = openPerspectiveId
    ? perspectiveDetails[openPerspectiveId]
    : null;
  const activePerspective = openPerspectiveId
    ? perspectives.find((p) => p.id === openPerspectiveId)
    : null;

  return (
    <>
      <section className="flex min-w-0 flex-[1.1] flex-col border-r border-border bg-muted/30">
        <header className="flex h-12 shrink-0 items-center border-b border-border px-4">
          <h2 className="text-sm font-semibold text-conclusion">構造分析</h2>
        </header>

        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-3 p-4">
            <p className="text-[11px] text-muted-foreground">
              フォーカス：
              <span className="font-medium text-foreground">
                {selectedPhenomenon.label}
              </span>
            </p>

            {sorted.map((perspective) => {
              const relevance = relevanceMap[perspective.id] ?? "低";
              return (
                <Card
                  key={perspective.id}
                  className={cn(relevance === "低" && "opacity-60")}
                >
                  <CardHeader className="flex flex-row items-start justify-between gap-2 p-3 pb-2">
                    <div className="flex min-w-0 flex-col gap-1">
                      <CardTitle className="text-sm text-conclusion">
                        {perspective.label}
                      </CardTitle>
                      <p className="text-[11px] text-muted-foreground">
                        {perspective.summary}
                      </p>
                    </div>
                    <LevelBadge level={relevance} prefix="関連" />
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOpenPerspectiveId(perspective.id)}
                    >
                      詳細を見る
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </section>

      <Sheet
        open={openPerspectiveId !== null}
        onOpenChange={(open) => {
          if (!open) setOpenPerspectiveId(null);
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-md">
          {activePerspective && activeDetail ? (
            <>
              <SheetHeader>
                <SheetTitle className="text-conclusion">
                  {activePerspective.label}
                </SheetTitle>
                <SheetDescription>{activePerspective.summary}</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4 px-4 pb-6">
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold text-conclusion">見方</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {activeDetail.viewpoint}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold text-conclusion">
                    確認する問い
                  </h3>
                  <ul className="flex flex-col gap-1.5">
                    {activeDetail.questions.map((q) => (
                      <li
                        key={q}
                        className="text-sm leading-relaxed text-muted-foreground"
                      >
                        · {q}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold text-conclusion">
                    {selectedPhenomenon.label} での例
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {activeDetail.examplesByPhenomenonId[selectedPhenomenon.id] ??
                      "（準備中）"}
                  </p>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
