"use client";

import { cn } from "@/lib/utils";

type MeetingStructureDiagramProps = {
  highlightElementId?: string | null;
  className?: string;
};

type DiagramNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  role: "core" | "element";
};

const NODES: DiagramNode[] = [
  {
    id: "core",
    label: "会議構造",
    x: 160,
    y: 36,
    width: 112,
    height: 36,
    role: "core",
  },
  {
    id: "accountability",
    label: "責任の曖昧さ",
    x: 48,
    y: 108,
    width: 96,
    height: 32,
    role: "element",
  },
  {
    id: "meeting-rules",
    label: "会議運営ルール",
    x: 224,
    y: 108,
    width: 96,
    height: 32,
    role: "element",
  },
  {
    id: "information-sharing",
    label: "情報共有",
    x: 48,
    y: 188,
    width: 96,
    height: 32,
    role: "element",
  },
  {
    id: "manager-behavior",
    label: "管理職行動",
    x: 224,
    y: 188,
    width: 96,
    height: 32,
    role: "element",
  },
  {
    id: "outcome",
    label: "持ち帰り・実行遅延",
    x: 160,
    y: 260,
    width: 120,
    height: 32,
    role: "core",
  },
];

const EDGES: Array<{ from: string; to: string; dashed?: boolean }> = [
  { from: "accountability", to: "core" },
  { from: "meeting-rules", to: "core" },
  { from: "information-sharing", to: "core", dashed: true },
  { from: "manager-behavior", to: "core" },
  { from: "core", to: "outcome" },
  { from: "accountability", to: "outcome", dashed: true },
  { from: "manager-behavior", to: "outcome", dashed: true },
];

function nodeById(id: string) {
  return NODES.find((node) => node.id === id);
}

function edgePoints(from: DiagramNode, to: DiagramNode) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const x1 = from.x + (dx > 0 ? from.width / 2 : dx < 0 ? -from.width / 2 : 0);
  const y1 = from.y + (dy > 0 ? from.height / 2 : dy < 0 ? -from.height / 2 : 0);
  const x2 = to.x + (dx > 0 ? -to.width / 2 : dx < 0 ? to.width / 2 : 0);
  const y2 = to.y + (dy > 0 ? -to.height / 2 : dy < 0 ? to.height / 2 : 0);
  return { x1, y1, x2, y2 };
}

function DiagramNodeShape({
  node,
  highlighted,
}: {
  node: DiagramNode;
  highlighted: boolean;
}) {
  const left = node.x - node.width / 2;
  const top = node.y - node.height / 2;

  return (
    <g opacity={highlighted ? 1 : 0.55}>
      <rect
        x={left}
        y={top}
        width={node.width}
        height={node.height}
        rx={6}
        className={cn(
          node.role === "core"
            ? "fill-primary/10 stroke-primary"
            : "fill-card stroke-border",
          highlighted && node.role === "element" && "stroke-primary",
        )}
        strokeWidth={highlighted ? 1.4 : 1}
      />
      <text
        x={node.x}
        y={node.y + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        className={cn(
          "text-[11px] font-medium",
          node.role === "core" ? "fill-primary" : "fill-foreground",
        )}
      >
        {node.label}
      </text>
    </g>
  );
}

export function MeetingStructureDiagram({
  highlightElementId,
  className,
}: MeetingStructureDiagramProps) {
  const highlightIds = new Set<string>(
    highlightElementId ? [highlightElementId, "core", "outcome"] : ["core"],
  );

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <svg
        viewBox="0 0 320 300"
        className="mx-auto w-full"
        role="img"
        aria-label="会議構造の構成要素と因果関係を示す構造図"
      >
        <defs>
          <marker
            id="meeting-map-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8 Z" className="fill-muted-foreground" />
          </marker>
        </defs>

        {EDGES.map((edge) => {
          const from = nodeById(edge.from);
          const to = nodeById(edge.to);
          if (!from || !to) return null;
          const { x1, y1, x2, y2 } = edgePoints(from, to);
          const active =
            highlightElementId === null ||
            highlightElementId === undefined ||
            (highlightIds.has(edge.from) && highlightIds.has(edge.to));

          return (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              className="text-muted-foreground"
              strokeWidth={active ? 1.2 : 0.8}
              strokeDasharray={edge.dashed ? "4 3" : undefined}
              opacity={active ? 0.85 : 0.35}
              markerEnd="url(#meeting-map-arrow)"
            />
          );
        })}

        {NODES.map((node) => (
          <DiagramNodeShape
            key={node.id}
            node={node}
            highlighted={
              highlightElementId === null ||
              highlightElementId === undefined ||
              highlightIds.has(node.id)
            }
          />
        ))}
      </svg>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        会議構造は、責任の曖昧さ・運営ルール・情報共有・管理職行動が相互に作用し、
        「決めない会議」と「持ち帰り」として現れる。
      </p>
    </div>
  );
}
