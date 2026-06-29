"use client";

import { cn } from "@/lib/utils";
import {
  type Phenomenon,
  type StructureEdge,
  type StructureNode,
} from "@/lib/org-transformation/schema";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

type StructureMapPaneProps = {
  nodes: StructureNode[];
  edges: StructureEdge[];
  primaryPath: string[];
  selectedPhenomenon: Phenomenon;
};

const PRIMARY_PATH_IDS = new Set(["S1", "C2", "C1", "P1"]);

function nodeSymbol(type: StructureNode["type"]): string {
  switch (type) {
    case "phenomenon":
      return "□";
    case "cause":
      return "○";
    case "structure":
      return "◇";
    case "leverage":
      return "★";
  }
}

function splitLabel(label: string, maxLen: number): string[] {
  if (label.length <= maxLen) return [label];
  const mid = Math.ceil(label.length / 2);
  for (let i = mid; i < label.length; i++) {
    if (label[i] === "・" || label[i] === "の") {
      return [label.slice(0, i + 1), label.slice(i + 1)];
    }
  }
  return [label.slice(0, maxLen), label.slice(maxLen)];
}

function isPrimaryEdge(edge: StructureEdge, primaryPath: string[]): boolean {
  const fromIdx = primaryPath.indexOf(edge.from);
  const toIdx = primaryPath.indexOf(edge.to);
  return fromIdx >= 0 && toIdx === fromIdx + 1;
}

function getNodeColorRole(
  node: StructureNode,
): "primary" | "risk" | "leverage" | "support" {
  if (node.id === "S1") return "risk";
  if (PRIMARY_PATH_IDS.has(node.id)) return "primary";
  if (node.type === "leverage") return "leverage";
  return "support";
}

function getNodeTier(node: StructureNode): "primary" | "leverage" | "support" {
  if (PRIMARY_PATH_IDS.has(node.id)) return "primary";
  if (node.type === "leverage") return "leverage";
  return "support";
}

function getNodeOpacity(
  node: StructureNode,
  highlightIds: string[],
): number {
  const tier = getNodeTier(node);
  if (tier === "support") return 0.38;
  if (!highlightIds.includes(node.id)) return 0.45;
  return 1;
}

function getEdgeOpacity(
  edge: StructureEdge,
  primaryPath: string[],
  highlightIds: string[],
): number {
  if (isPrimaryEdge(edge, primaryPath)) {
    return highlightIds.includes(edge.from) && highlightIds.includes(edge.to)
      ? 1
      : 0.35;
  }
  if (edge.from === "L1" || edge.to === "L1") {
    return highlightIds.includes("L1") ? 0.7 : 0.3;
  }
  return 0.18;
}

type LayoutNode = StructureNode & {
  tier: "primary" | "leverage" | "support";
  colorRole: "primary" | "risk" | "leverage" | "support";
  labelLines: string[];
};

function layoutNodes(nodes: StructureNode[]): LayoutNode[] {
  return nodes.map((node) => {
    const tier = getNodeTier(node);
    const colorRole = getNodeColorRole(node);
    const maxLen = tier === "primary" ? 10 : tier === "leverage" ? 8 : 7;
    return {
      ...node,
      tier,
      colorRole,
      labelLines: splitLabel(node.label, maxLen),
    };
  });
}

function NodeShape({
  node,
  opacity,
}: {
  node: LayoutNode;
  opacity: number;
}) {
  const { x, y, tier, colorRole } = node;
  const symbolSize =
    tier === "primary" ? 5.5 : tier === "leverage" ? 4.5 : 3.5;
  const labelY = y + symbolSize + 1.5;
  const lineHeight = tier === "primary" ? 4.2 : tier === "leverage" ? 3.6 : 3.2;
  const fontSize =
    tier === "primary" ? "text-[4.4px]" : tier === "leverage" ? "text-[3.8px]" : "text-[3px]";
  const labelAnchor =
    x <= 20 ? "start" : x >= 80 ? "end" : "middle";
  const labelX =
    labelAnchor === "start" ? x + 1 : labelAnchor === "end" ? x - 1 : x;

  return (
    <g opacity={opacity}>
      <rect
        x={x - symbolSize / 2}
        y={y - symbolSize / 2}
        width={symbolSize}
        height={symbolSize}
        rx="1"
        className={cn(
          colorRole === "primary" &&
            "fill-card stroke-foreground stroke-[0.5]",
          colorRole === "risk" &&
            "fill-destructive/15 stroke-destructive stroke-[0.6]",
          colorRole === "leverage" &&
            "fill-primary/15 stroke-primary stroke-[0.5]",
          colorRole === "support" &&
            "fill-muted/30 stroke-muted-foreground/60 stroke-[0.35]",
        )}
        strokeDasharray={colorRole === "support" ? "1 1" : undefined}
      />
      <text
        x={x}
        y={y + 0.8}
        textAnchor="middle"
        dominantBaseline="middle"
        className={cn(
          colorRole === "leverage" && "fill-primary",
          colorRole === "risk" && "fill-destructive",
          colorRole === "support" && "fill-muted-foreground/70",
          colorRole === "primary" && "fill-foreground",
          tier === "primary" ? "text-[3.8px]" : "text-[2.8px]",
        )}
      >
        {nodeSymbol(node.type)}
      </text>
      <text
        x={labelX}
        y={labelY}
        textAnchor={labelAnchor}
        className={cn(
          colorRole === "leverage" && "fill-primary",
          colorRole === "risk" && "fill-destructive font-semibold",
          colorRole === "support" && "fill-muted-foreground/70",
          colorRole === "primary" && "fill-foreground font-medium",
          fontSize,
        )}
      >
        {node.labelLines.map((line, i) => (
          <tspan
            key={`${node.id}-${line}`}
            x={labelX}
            dy={i === 0 ? 0 : lineHeight}
          >
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

function PrimaryLoopArrow({
  fromY,
  toY,
  x,
  opacity,
}: {
  fromY: number;
  toY: number;
  x: number;
  opacity: number;
}) {
  const gap = 6;
  return (
    <line
      x1={x}
      y1={fromY + gap}
      x2={x}
      y2={toY - gap}
      stroke="currentColor"
      className="text-foreground"
      strokeWidth="1.2"
      opacity={opacity}
      markerEnd="url(#arrow-primary-bold)"
    />
  );
}

export function StructureMapPane({
  nodes,
  edges,
  primaryPath,
  selectedPhenomenon,
}: StructureMapPaneProps) {
  const highlightIds = selectedPhenomenon.pane3Highlight;
  const layout = layoutNodes(nodes);
  const nodeMap = new Map(layout.map((n) => [n.id, n]));

  const primaryNodes = primaryPath
    .map((id) => nodeMap.get(id))
    .filter((n): n is LayoutNode => n !== undefined);

  const supportAndLeverage = layout.filter((n) => n.tier !== "primary");

  const primaryEdgeOpacity =
    highlightIds.includes("S1") && highlightIds.includes("P1") ? 1 : 0.4;

  const nonPrimaryEdges = edges.filter(
    (edge) => !isPrimaryEdge(edge, primaryPath),
  );

  return (
    <section className="flex min-w-0 flex-[1.4] flex-col bg-background">
      <header className="flex h-12 shrink-0 items-center border-b border-border px-3">
        <h2 className="text-sm font-semibold text-foreground">
          構造仮説マップ
        </h2>
      </header>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-3 p-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">□ 現象</Badge>
            <Badge variant="outline">○ 原因</Badge>
            <Badge variant="outline">◇ 構造</Badge>
            <Badge variant="outline">★ レバレッジ</Badge>
            <Badge variant="secondary">黒 主ループ</Badge>
            <Badge variant="secondary">赤 危険要因</Badge>
            <Badge variant="secondary">青 レバレッジ</Badge>
            <Badge variant="secondary">灰 背景仮説</Badge>
          </div>

          <Card size="sm" className="overflow-hidden">
            <CardContent className="p-3">
              <svg
                viewBox="0 0 100 92"
                className="mx-auto w-full min-h-[440px] max-w-lg"
                role="img"
                aria-label="因果ループ図。中央に主ループ、周辺に補助ノード"
              >
                <defs>
                  <marker
                    id="arrow-primary-bold"
                    markerWidth="5"
                    markerHeight="5"
                    refX="4"
                    refY="2.5"
                    orient="auto"
                  >
                    <path d="M0,0 L5,2.5 L0,5 Z" className="fill-foreground" />
                  </marker>
                  <marker
                    id="arrow-support"
                    markerWidth="4"
                    markerHeight="4"
                    refX="3.5"
                    refY="2"
                    orient="auto"
                  >
                    <path
                      d="M0,0 L4,2 L0,4 Z"
                      className="fill-muted-foreground"
                    />
                  </marker>
                  <marker
                    id="arrow-inhibit"
                    markerWidth="4"
                    markerHeight="4"
                    refX="3.5"
                    refY="2"
                    orient="auto"
                  >
                    <path d="M0,0 L4,2 L0,4 Z" className="fill-primary" />
                  </marker>
                </defs>

                <text
                  x={50}
                  y={4}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[3.2px] font-medium"
                >
                  主ループ
                </text>

                {nonPrimaryEdges.map((edge) => {
                  const from = nodeMap.get(edge.from);
                  const to = nodeMap.get(edge.to);
                  if (!from || !to) return null;
                  const opacity = getEdgeOpacity(edge, primaryPath, highlightIds);
                  const isDashed =
                    edge.strength === "hypothesis" ||
                    edge.kind === "inhibit" ||
                    getNodeTier(from) === "support";

                  return (
                    <line
                      key={`${edge.from}-${edge.to}`}
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke="currentColor"
                      className={cn(
                        edge.kind === "inhibit"
                          ? "text-primary"
                          : "text-muted-foreground",
                      )}
                      strokeWidth={edge.kind === "inhibit" ? 0.6 : 0.4}
                      strokeDasharray={isDashed ? "1.5 1.5" : undefined}
                      opacity={opacity}
                      markerEnd={
                        edge.kind === "inhibit"
                          ? "url(#arrow-inhibit)"
                          : "url(#arrow-support)"
                      }
                    />
                  );
                })}

                {primaryNodes.slice(0, -1).map((node, i) => {
                  const next = primaryNodes[i + 1];
                  return (
                    <PrimaryLoopArrow
                      key={`${node.id}-${next.id}`}
                      x={node.x}
                      fromY={node.y}
                      toY={next.y}
                      opacity={primaryEdgeOpacity}
                    />
                  );
                })}

                {supportAndLeverage.map((node) => (
                  <NodeShape
                    key={node.id}
                    node={node}
                    opacity={getNodeOpacity(node, highlightIds)}
                  />
                ))}

                {primaryNodes.map((node) => (
                  <NodeShape
                    key={node.id}
                    node={node}
                    opacity={getNodeOpacity(node, highlightIds)}
                  />
                ))}
              </svg>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader className="pb-2">
              <CardTitle>主ループ（5秒）</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                責任曖昧 → 会議での責任押付け → 育成機会・裁量不足 → 若手離職
              </p>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </section>
  );
}
