import { type ReactNode } from "react";
import { ArrowDown, ArrowRight, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Pane2-Step4: 構造仮説マップ（固定レイアウト MVP）
 * 位置の永続化はしない。将来の拡張用に静的 node/edge 配列を保持する。
 */
export type StructuralHypothesisNodeId =
  | "role-ambiguity"
  | "not-my-job"
  | "manager-support-deficit"
  | "burden-risk"
  | "responsibility-avoidance"
  | "rescuer"
  | "surface-convergence"
  | "inaction-hidden";

export type StructuralHypothesisNode = {
  id: StructuralHypothesisNodeId;
  label: string;
  route: "main" | "support" | "hub";
};

export type StructuralHypothesisEdge = {
  from: StructuralHypothesisNodeId;
  to: StructuralHypothesisNodeId;
  /** エッジ上の短い注記（ノード数を増やさずに経路を読ませる） */
  caption?: string;
  kind?: "forward" | "loop";
};

export const STRUCTURAL_HYPOTHESIS_NODES: StructuralHypothesisNode[] = [
  {
    id: "role-ambiguity",
    label: "役割・責任・完了条件の曖昧さ",
    route: "main",
  },
  {
    id: "not-my-job",
    label: "「自分の仕事ではない」が成立",
    route: "main",
  },
  {
    id: "manager-support-deficit",
    label: "管理職の支援・意思決定不足",
    route: "support",
  },
  {
    id: "burden-risk",
    label: "引き受けた人の負担・リスク増",
    route: "support",
  },
  {
    id: "responsibility-avoidance",
    label: "責任回避・他部門転嫁",
    route: "hub",
  },
  {
    id: "rescuer",
    label: "真面目な人／外注先が救済",
    route: "main",
  },
  {
    id: "surface-convergence",
    label: "問題が表面上は収束",
    route: "main",
  },
  {
    id: "inaction-hidden",
    label: "本来の不作為が顕在化しない",
    route: "main",
  },
];

export const STRUCTURAL_HYPOTHESIS_EDGES: StructuralHypothesisEdge[] = [
  { from: "role-ambiguity", to: "not-my-job" },
  { from: "not-my-job", to: "responsibility-avoidance" },
  { from: "manager-support-deficit", to: "burden-risk" },
  {
    from: "burden-risk",
    to: "responsibility-avoidance",
    caption: "「引き受けない方が合理的」",
  },
  { from: "responsibility-avoidance", to: "rescuer" },
  { from: "rescuer", to: "surface-convergence" },
  { from: "surface-convergence", to: "inaction-hidden" },
  {
    from: "inaction-hidden",
    to: "responsibility-avoidance",
    kind: "loop",
    caption: "責任回避・他部門転嫁が温存・再生成される",
  },
];

/** 表示専用の副作用ルート（永続化・schema 対象外） */
const RESCUE_SIDE_EFFECTS = [
  "負荷集中・疲弊",
  "意欲低下・やりがい喪失",
  "離職・現場力低下",
] as const;

const NODE_BY_ID = Object.fromEntries(
  STRUCTURAL_HYPOTHESIS_NODES.map((node) => [node.id, node]),
) as Record<StructuralHypothesisNodeId, StructuralHypothesisNode>;

type NodeTone = "default" | "upstream" | "hub";

function MapNodeCard({
  nodeId,
  tone = "default",
  meaning,
}: {
  nodeId: StructuralHypothesisNodeId;
  tone?: NodeTone;
  meaning?: string;
}) {
  const node = NODE_BY_ID[nodeId];
  return (
    <Card
      size="sm"
      className={cn(
        "w-full border-border bg-card",
        tone === "upstream" && "border-destructive/35 bg-destructive/10",
        tone === "hub" && "border-signal-medium/55 bg-signal-medium/25",
        tone === "default" && "bg-muted/30",
      )}
    >
      <CardContent className="flex flex-col gap-1 p-2">
        {meaning ? (
          <Badge
            variant={tone === "hub" ? "signal-medium" : "outline"}
            size="default"
          >
            {meaning}
          </Badge>
        ) : null}
        <p className="text-lg leading-snug font-medium text-foreground">
          {node.label}
        </p>
      </CardContent>
    </Card>
  );
}

function FlowArrow({
  caption,
  emphasis,
  direction = "down",
}: {
  caption?: string;
  emphasis?: "main" | "support" | "loop";
  direction?: "down" | "right";
}) {
  const Icon = direction === "right" ? ArrowRight : ArrowDown;
  return (
    <div
      className={cn(
        "flex items-center gap-1",
        direction === "down" ? "flex-col py-0.5" : "flex-row px-0.5",
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0",
          emphasis === "loop"
            ? "text-foreground/80"
            : emphasis === "support"
              ? "text-foreground/70"
              : "text-foreground/75",
        )}
        aria-hidden
        strokeWidth={2.5}
      />
      {caption ? (
        <span
          className={cn(
            "text-xs leading-snug text-muted-foreground",
            direction === "down" ? "max-w-[16rem] text-center" : "max-w-[9rem]",
          )}
        >
          {caption}
        </span>
      ) : null}
    </div>
  );
}

function RegionLabel({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "upstream" | "hub" | "secondary";
}) {
  return (
    <Badge
      variant={
        tone === "hub"
          ? "signal-medium"
          : tone === "secondary"
            ? "signal-high"
            : "outline"
      }
      size="default"
      className="w-fit"
    >
      {children}
    </Badge>
  );
}

function CompactNote({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 rounded-md border border-border bg-card px-2 py-1">
      <p className="text-xs font-medium text-conclusion">{title}</p>
      <div className="text-xs leading-snug text-muted-foreground">{children}</div>
    </div>
  );
}

function SecondaryDamageRegion() {
  return (
    <aside
      className="flex h-full flex-col gap-1.5 rounded-lg border border-signal-high/40 bg-signal-high/10 p-2"
      aria-label="救済の副作用"
    >
      <RegionLabel tone="secondary">二次被害</RegionLabel>
      <Badge variant="outline" size="default" className="w-fit">
        救済の副作用
      </Badge>
      <div className="flex flex-col gap-1">
        {RESCUE_SIDE_EFFECTS.map((label, index) => (
          <div key={label} className="flex flex-col items-stretch gap-1">
            <div className="rounded-md border border-signal-high/30 bg-card px-2 py-1.5">
              <p className="text-base leading-snug font-medium text-foreground">
                {label}
              </p>
            </div>
            {index < RESCUE_SIDE_EFFECTS.length - 1 ? (
              <div className="flex justify-center">
                <ArrowDown
                  className="size-3.5 text-signal-high/70"
                  aria-hidden
                  strokeWidth={2.5}
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <p className="mt-auto text-xs leading-snug text-muted-foreground">
        この構造を放置すると、問題の温存だけでなく、支える側の疲弊・離脱を招く
      </p>
    </aside>
  );
}

export function StructuralHypothesisMap() {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 xl:grid-cols-4">
        <CompactNote title="位置づけ">
          Step1〜3の仮説を、GAPが再生産される一本の構造として統合。確定因果ではなく、対話と事実確認で更新。「どこに最初の一手を入れるか」を見極める。
        </CompactNote>
        <CompactNote title="仮説と地図の対応">
          <ul className="flex flex-col gap-0.5">
            <li>仮説1：役割・責任・完了条件の曖昧さ → 上流の主経路</li>
            <li>仮説2：管理職の支援・意思決定不足 → 支援不足経路</li>
            <li>仮説3：救済者依存で不作為が温存される → 下流の再生産ループ</li>
          </ul>
        </CompactNote>
        <CompactNote title="この構造図の見るべき視点">
          <ul className="flex flex-col gap-0.5">
            <li>· 上流要因はどこか</li>
            <li>· 再生産ハブはどこか</li>
            <li>· 見かけ上の収束はどこか</li>
            <li>· 最初の一手はどこに入るか</li>
          </ul>
        </CompactNote>
        <CompactNote title="背景にある深層条件">
          忖度、ヒエラルキー優先、自己保全、問題提起者が報われにくい空気が、この構造を強め、介入を難しくします。
        </CompactNote>
      </div>

      <div
        className="grid grid-cols-1 gap-1.5 rounded-lg border border-border bg-muted/20 p-2 lg:grid-cols-[minmax(11rem,0.9fr)_minmax(0,2.2fr)_minmax(11rem,0.95fr)] lg:items-stretch"
        aria-label="構造仮説マップの流れ"
      >
        {/* A: 上流要因 */}
        <section className="flex flex-col gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 p-2">
          <RegionLabel tone="upstream">上流要因</RegionLabel>
          <MapNodeCard
            nodeId="role-ambiguity"
            tone="upstream"
            meaning="上流要因"
          />
          <FlowArrow caption="上流 → ハブ" emphasis="main" />
          <MapNodeCard
            nodeId="manager-support-deficit"
            tone="upstream"
            meaning="上流要因"
          />
          <FlowArrow caption="支援不足 → ハブ" emphasis="support" />
          <p className="mt-auto text-xs leading-snug text-muted-foreground">
            左の上流から中央の再生産ハブへ合流します。
          </p>
        </section>

        {/* B: 再生産構造（中央） */}
        <section className="flex min-w-0 flex-col gap-1.5 rounded-lg border border-signal-medium/45 bg-signal-medium/10 p-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <RegionLabel tone="hub">再生産構造</RegionLabel>
            <Badge variant="signal-medium" size="default">
              再生産ハブ
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-end">
            <div className="flex flex-col gap-0.5">
              <MapNodeCard nodeId="not-my-job" />
              <FlowArrow caption="責任回避へ合流" emphasis="main" />
            </div>
            <div className="hidden sm:flex sm:items-center sm:pb-6">
              <FlowArrow direction="right" emphasis="main" />
            </div>
            <div className="flex flex-col gap-0.5">
              <MapNodeCard nodeId="burden-risk" />
              <FlowArrow
                caption="「引き受けない方が合理的」"
                emphasis="support"
              />
            </div>
          </div>

          <MapNodeCard
            nodeId="responsibility-avoidance"
            tone="hub"
            meaning="再生産ハブ"
          />

          <div className="flex flex-col gap-0.5">
            <div className="flex min-w-0 flex-col items-center gap-0.5">
              <FlowArrow emphasis="main" />
              <div className="grid w-full grid-cols-1 gap-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <MapNodeCard nodeId="rescuer" />
                <div className="flex justify-center sm:justify-start">
                  <FlowArrow
                    direction="right"
                    caption="救済 → 二次被害"
                    emphasis="main"
                  />
                </div>
              </div>
              <FlowArrow emphasis="main" />
              <MapNodeCard nodeId="surface-convergence" />
              <FlowArrow emphasis="main" />
              <MapNodeCard nodeId="inaction-hidden" />
            </div>

            <p className="rounded-md border border-dashed border-border bg-card px-2 py-1 text-center text-xs leading-snug text-muted-foreground">
              救済 → 表面上収束 → 不作為が顕在化しない
              は、問題が見えにくくなる／構造を温存する流れです。
            </p>

            <div className="flex w-full flex-col items-center gap-1 rounded-md border border-dashed border-signal-medium/50 bg-card px-2 py-1">
              <RefreshCw
                className="size-4 text-signal-medium-foreground"
                aria-hidden
                strokeWidth={2.5}
              />
              <p className="text-center text-xs leading-snug text-muted-foreground">
                不作為の不可視化から
                <span className="font-medium text-foreground">
                  責任回避・他部門転嫁
                </span>
                が温存・再生成され、構造がループする
              </p>
            </div>
          </div>
        </section>

        {/* C: 二次被害 */}
        <SecondaryDamageRegion />
      </div>

      <Card size="sm" className="border-primary/30 bg-primary/5">
        <CardHeader className="flex flex-col gap-0.5 p-2 pb-1">
          <CardTitle className="text-conclusion">
            Pane3への橋渡し（表示のみ）
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 p-2 pt-0 sm:flex-row sm:items-baseline sm:gap-3">
          <p className="text-base leading-snug font-medium text-foreground">
            この構造を変えるなら、どこに最初の一手を入れるか？
          </p>
          <p className="text-xs leading-snug text-muted-foreground">
            すべてを一度に変えるのではなく、小さな介入で全体に影響を与えられるレバレッジポイントを探します。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
