"use client";

import { type ReactNode, useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import {
  type Pane1Intake,
  type Pane2Hypothesis,
  type Pane2Step1,
  type Perspective,
  type PerspectiveDetail,
  type Phenomenon,
  type Relevance,
} from "@/lib/koyasu/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { InlineTextareaField, SectionLabel } from "@/components/primitives";
import { LevelBadge } from "@/components/workspace/LevelBadge";
import { MeetingStructureDiagram } from "@/components/workspace/MeetingStructureDiagram";
import { type PrimaryInterventionContext } from "@/lib/koyasu/phenomenon-diagnostics";
import {
  getStructureFormingElements,
  hasStructureMapDiagram,
  type StructureFormingElement,
} from "@/lib/koyasu/structure-forming-elements";
import { ArrowDown } from "lucide-react";

type StructureAnalysisPaneProps = {
  selectedPhenomenon: Phenomenon;
  pane1Intake: Pane1Intake;
  pane2Step1: Pane2Step1;
  pane2FormKey: number;
  primaryIntervention: PrimaryInterventionContext;
  perspectives: Perspective[];
  perspectiveDetails: Record<string, PerspectiveDetail>;
  relevanceMap: Record<string, Relevance>;
  onUpdatePane2Hypothesis: (
    index: number,
    patch: Partial<Pane2Hypothesis>,
  ) => void;
};

function AnalysisSection({
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

export function StructureAnalysisPane({
  selectedPhenomenon,
  pane1Intake,
  pane2Step1,
  pane2FormKey,
  primaryIntervention,
  perspectives,
  perspectiveDetails: _perspectiveDetails,
  relevanceMap,
  onUpdatePane2Hypothesis,
}: StructureAnalysisPaneProps) {
  const [mapOpenForElementId, setMapOpenForElementId] = useState<string | null>(
    null,
  );

  const structure = primaryIntervention.structure;
  const showStructureMap = hasStructureMapDiagram(structure.id);

  const formingElements = useMemo(
    () => getStructureFormingElements(structure.id, perspectives, relevanceMap),
    [structure.id, perspectives, relevanceMap],
  );

  const mapElement = mapOpenForElementId
    ? formingElements.find((element) => element.id === mapOpenForElementId)
    : null;

  return (
    <>
      <section className="flex min-w-0 flex-[1.1] flex-col border-r border-border bg-muted/30">
        <header className="flex h-auto min-h-12 shrink-0 flex-col justify-center gap-0.5 border-b border-border px-4 py-2">
          <h2 className="text-sm font-semibold text-conclusion">構造分析</h2>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            介入本丸構造を理解し、本質を見抜くための分析ワークスペース
          </p>
        </header>

        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-3 p-4">
            <p className="text-[11px] text-muted-foreground">
              フォーカス：
              <span className="font-medium text-foreground">
                {selectedPhenomenon.label}
              </span>
            </p>

            <p className="text-[10px] leading-relaxed text-muted-foreground">
              Pane1 介入本丸構造 → ① 構造の説明 → ② 見抜く問い → ③
              形成要素 → ④ 構造マップ
            </p>

            <AnalysisSection
              title="Pane2 Step1 | Pane1からの受け渡し"
              description="Pane1 で整理した現象と GAP を参照しながら、原因を決め打ちせずに構造仮説を立てます。"
            >
              <div className="flex flex-col gap-3">
                <Card size="sm" className="border-primary/30 bg-primary/5">
                  <CardContent className="flex flex-col gap-3 p-3">
                    <div className="flex flex-col gap-1">
                      <SectionLabel
                        tone="conclusion"
                        className="text-xs normal-case tracking-normal"
                      >
                        核となる現象
                      </SectionLabel>
                      <p className="text-sm leading-relaxed text-foreground">
                        {pane1Intake.core_phenomenon || "Pane1でまだ未記入です"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <SectionLabel
                        tone="conclusion"
                        className="text-xs normal-case tracking-normal"
                      >
                        GAP
                      </SectionLabel>
                      <p className="text-sm leading-relaxed text-foreground">
                        {pane1Intake.gap || "Pane1でまだ未記入です"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/30 bg-card">
                  <CardContent className="flex flex-col gap-2 p-3">
                    <p className="text-base font-semibold leading-snug text-conclusion">
                      なぜ、このGAPが繰り返し生まれるのか？
                    </p>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      ここでは「誰が悪いか」を急いで決めず、人・制度・関係性の
                      構造から仮説を置き、あとで検証する前提で整理します。
                    </p>
                  </CardContent>
                </Card>

                <div className="flex flex-col gap-3">
                  {pane2Step1.hypotheses.map((hypothesis, index) => (
                    <StructuralHypothesisCard
                      key={`pane2-hypothesis-${index}-${pane2FormKey}`}
                      index={index}
                      hypothesis={hypothesis}
                      onUpdate={onUpdatePane2Hypothesis}
                    />
                  ))}
                </div>
              </div>
            </AnalysisSection>

            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="flex flex-col gap-1 p-3 pb-2">
                <CardTitle className="text-sm text-conclusion">
                  Pane1 介入本丸構造：{structure.label}
                </CardTitle>
                <p className="text-[11px] text-muted-foreground">
                  {structure.summary}
                </p>
              </CardHeader>
            </Card>

            <FlowStep label="① この構造とは何か" />

            <AnalysisSection
              title="① この構造とは何か"
              description="介入本丸構造の説明"
            >
              <Card>
                <CardContent className="flex flex-col gap-2 p-3">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {structure.viewpoint}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    選定理由：{primaryIntervention.selectionReason}
                  </p>
                </CardContent>
              </Card>
            </AnalysisSection>

            <FlowStep label="② 構造を見抜く問い" />

            <AnalysisSection
              title="② 構造を見抜く問い"
              description="現場で構造の本質を見抜くための問い"
            >
              <ul className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-3">
                {structure.questions.map((q) => (
                  <li
                    key={q}
                    className="text-sm leading-relaxed text-muted-foreground"
                  >
                    · {q}
                  </li>
                ))}
              </ul>
            </AnalysisSection>

            <FlowStep label="③ 構造を形成する要素" />

            <AnalysisSection
              title="③ 構造を形成する要素"
              description="この本丸構造を構成している要素"
            >
              <div className="flex flex-col gap-3">
                {formingElements.map((element) => (
                  <FormingElementCard
                    key={element.id}
                    element={element}
                    showStructureMap={showStructureMap}
                    onOpenMap={() => setMapOpenForElementId(element.id)}
                  />
                ))}
              </div>
            </AnalysisSection>

            <Separator />
          </div>
        </ScrollArea>
      </section>

      <Sheet
        open={mapOpenForElementId !== null}
        onOpenChange={(open) => {
          if (!open) setMapOpenForElementId(null);
        }}
      >
        <SheetContent
          side="right"
          className={cn(
            "w-full",
            showStructureMap ? "sm:max-w-xl" : "sm:max-w-md",
          )}
        >
          <SheetHeader>
            <SheetTitle className="text-conclusion">構造マップ</SheetTitle>
            <SheetDescription>
              {showStructureMap
                ? `${structure.label}${mapElement ? ` × ${mapElement.label}` : ""}`
                : mapElement
                  ? `${structure.label} × ${mapElement.label}`
                  : structure.label}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-3 px-4 pb-6">
            {showStructureMap ? (
              <MeetingStructureDiagram highlightElementId={mapOpenForElementId} />
            ) : (
              <>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Version2ではここで構造図（図解）が表示されます。
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {structure.label}を構成する「{mapElement?.label ?? "—"}
                  」の関係性を、視覚的に把握する領域です。
                </p>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function StructuralHypothesisCard({
  index,
  hypothesis,
  onUpdate,
}: {
  index: number;
  hypothesis: Pane2Hypothesis;
  onUpdate: (index: number, patch: Partial<Pane2Hypothesis>) => void;
}) {
  return (
    <Card size="sm">
      <CardHeader className="flex flex-col gap-1 p-3 pb-2">
        <CardTitle className="text-sm text-conclusion">
          仮説 {index + 1}
        </CardTitle>
        <p className="text-[11px] text-muted-foreground">
          必要なら空欄のままでも構いません。最大3つまで整理できます。
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-3 pt-0">
        <div className="flex flex-col gap-1">
          <SectionLabel
            tone="conclusion"
            className="text-xs normal-case tracking-normal"
          >
            構造仮説
          </SectionLabel>
          <InlineTextareaField
            value={hypothesis.structural_hypothesis}
            onSave={(value) =>
              onUpdate(index, {
                structural_hypothesis: value,
              })
            }
            ariaLabel={`Pane2 構造仮説 ${index + 1}`}
            placeholder="例: 会議で意思決定が閉じず、現場のやり直しが恒常化している"
          />
        </div>

        <div className="flex flex-col gap-1">
          <SectionLabel
            tone="conclusion"
            className="text-xs normal-case tracking-normal"
          >
            そう考える根拠
          </SectionLabel>
          <InlineTextareaField
            value={hypothesis.evidence}
            onSave={(value) =>
              onUpdate(index, {
                evidence: value,
              })
            }
            ariaLabel={`Pane2 根拠 ${index + 1}`}
            placeholder="Pane1 の事実、現場で見た繰り返し、関係者の発言など"
          />
        </div>

        <div className="flex flex-col gap-1">
          <SectionLabel
            tone="conclusion"
            className="text-xs normal-case tracking-normal"
          >
            まだ確認したいこと
          </SectionLabel>
          <InlineTextareaField
            value={hypothesis.follow_up_question}
            onSave={(value) =>
              onUpdate(index, {
                follow_up_question: value,
              })
            }
            ariaLabel={`Pane2 確認したいこと ${index + 1}`}
            placeholder="次に誰へ何を確認すると、この仮説の精度が上がるか"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function FormingElementCard({
  element,
  showStructureMap,
  onOpenMap,
}: {
  element: StructureFormingElement;
  showStructureMap: boolean;
  onOpenMap: () => void;
}) {
  return (
    <Card className={cn(element.relevance === "低" && "opacity-60")}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 p-3 pb-2">
        <div className="flex min-w-0 flex-col gap-1">
          <CardTitle className="text-sm text-conclusion">{element.label}</CardTitle>
          <p className="text-[11px] text-muted-foreground">{element.summary}</p>
        </div>
        <LevelBadge level={element.relevance} prefix="関連" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2 p-3 pt-0">
        <p className="text-[10px] text-muted-foreground">④ 構造マップを見る</p>
        <Button variant="outline" size="sm" onClick={onOpenMap}>
          構造マップを見る
        </Button>
        {!showStructureMap ? (
          <p className="text-[10px] text-muted-foreground">
            Version2で図解を表示予定
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
