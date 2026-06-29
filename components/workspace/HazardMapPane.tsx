"use client";

import { cn } from "@/lib/utils";
import {
  type Phenomenon,
  scoreToMapX,
  scoreToMapY,
  urgencyToRadius,
  radarRiskValue,
} from "@/lib/org-transformation/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

type HazardMapPaneProps = {
  phenomena: Phenomenon[];
  selectedPhenomenonId: string;
};

const QUADRANTS = [
  { x: 25, y: 75, label: "局所現象" },
  { x: 25, y: 25, label: "重要だが解きやすい" },
  { x: 75, y: 75, label: "根深いが限定的" },
  { x: 75, y: 25, label: "本質問題" },
] as const;

const RADAR_AXES = [
  { key: "accountability" as const, label: "責任明確性" },
  { key: "transformationProgress" as const, label: "変革推進度" },
  { key: "psychologicalSafety" as const, label: "心理的安全性" },
] as const;

function accountabilityStatus(score: number): {
  label: string;
  emphasis: "danger" | "normal";
} {
  if (score >= 4) return { label: "危険", emphasis: "danger" };
  if (score >= 3) return { label: "注意", emphasis: "normal" };
  return { label: "良好", emphasis: "normal" };
}

function psychologicalSafetyStatus(score: number): { label: string } {
  if (score >= 4) return { label: "注意" };
  if (score >= 3) return { label: "注意" };
  return { label: "良好" };
}

function transformationProgressStatus(score: number): { label: string } {
  if (score <= 2) return { label: "低い" };
  if (score === 3) return { label: "中" };
  return { label: "高い" };
}

function InterventionIndicators({ selected }: { selected: Phenomenon }) {
  const accountability = accountabilityStatus(selected.scores.accountability);
  const psychological = psychologicalSafetyStatus(
    selected.scores.psychologicalSafety,
  );
  const transformation = transformationProgressStatus(
    selected.scores.transformationProgress,
  );

  const items = [
    {
      name: "責任明確性",
      status: accountability.label,
      emphasis: accountability.emphasis,
    },
    {
      name: "心理的安全性",
      status: psychological.label,
      emphasis: "normal" as const,
    },
    {
      name: "変革推進度",
      status: transformation.label,
      emphasis: "normal" as const,
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        {items.map((item) => (
          <Card
            key={item.name}
            size="sm"
            className={cn(
              item.emphasis === "danger" &&
                "border-destructive/40 bg-destructive/5",
            )}
          >
            <CardContent className="flex flex-col gap-1 p-2">
              <p className="text-[11px] text-muted-foreground">{item.name}</p>
              <p
                className={cn(
                  "text-sm font-semibold",
                  item.emphasis === "danger"
                    ? "text-destructive"
                    : "text-foreground",
                )}
              >
                {item.status}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex flex-col items-center gap-1 opacity-60">
        <p className="text-[10px] text-muted-foreground">参考（レーダー）</p>
        <RadarChart selected={selected} compact />
      </div>
    </div>
  );
}

function RadarChart({
  selected,
  compact = false,
}: {
  selected: Phenomenon;
  compact?: boolean;
}) {
  const cx = 80;
  const cy = 80;
  const maxR = 55;
  const angles = [-90, 30, 150].map((deg) => (deg * Math.PI) / 180);

  const values = RADAR_AXES.map(({ key }) =>
    radarRiskValue(key, selected.scores),
  );
  const points = values
    .map((v, i) => {
      const r = (v / 5) * maxR;
      const a = angles[i];
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 160 160"
      className={cn("mx-auto", compact ? "size-24" : "size-40")}
      aria-hidden
    >
      {[1, 2, 3, 4, 5].map((level) => (
        <polygon
          key={level}
          points={angles
            .map((a) => {
              const r = (level / 5) * maxR;
              return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
            })
            .join(" ")}
          fill="none"
          stroke="currentColor"
          className="text-border"
          strokeWidth="0.5"
        />
      ))}
      {angles.map((a, i) => (
        <line
          key={RADAR_AXES[i].label}
          x1={cx}
          y1={cy}
          x2={cx + maxR * Math.cos(a)}
          y2={cy + maxR * Math.sin(a)}
          stroke="currentColor"
          className="text-border"
          strokeWidth="0.5"
        />
      ))}
      <polygon
        points={points}
        fill="currentColor"
        className="text-primary/20"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {RADAR_AXES.map(({ label }, i) => {
        const a = angles[i];
        const lx = cx + (maxR + 14) * Math.cos(a);
        const ly = cy + (maxR + 14) * Math.sin(a);
        return (
          <text
            key={label}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground text-[7px]"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

export function HazardMapPane({
  phenomena,
  selectedPhenomenonId,
}: HazardMapPaneProps) {
  const selected =
    phenomena.find((p) => p.id === selectedPhenomenonId) ?? phenomena[0];

  return (
    <section className="flex min-w-0 flex-[1.1] flex-col border-r border-border bg-card">
      <header className="flex h-12 shrink-0 items-center border-b border-border px-3">
        <h2 className="text-sm font-semibold text-foreground">
          組織ハザードマップ
        </h2>
      </header>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 p-3">
          <Card size="sm">
            <CardHeader className="pb-2">
              <CardTitle>2×2 優先度マップ</CardTitle>
            </CardHeader>
            <CardContent>
              <svg
                viewBox="0 0 100 100"
                className="aspect-square w-full"
                role="img"
                aria-label="組織ハザード2乘2マップ"
              >
                <rect
                  x="5"
                  y="5"
                  width="90"
                  height="90"
                  fill="none"
                  stroke="currentColor"
                  className="text-border"
                  strokeWidth="0.5"
                />
                <line
                  x1="50"
                  y1="5"
                  x2="50"
                  y2="95"
                  stroke="currentColor"
                  className="text-border"
                  strokeWidth="0.5"
                  strokeDasharray="2 2"
                />
                <line
                  x1="5"
                  y1="50"
                  x2="95"
                  y2="50"
                  stroke="currentColor"
                  className="text-border"
                  strokeWidth="0.5"
                  strokeDasharray="2 2"
                />
                <rect
                  x="50"
                  y="5"
                  width="45"
                  height="45"
                  className="fill-destructive/5"
                />
                {QUADRANTS.map((q) => (
                  <text
                    key={q.label}
                    x={q.x}
                    y={q.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={cn(
                      "fill-muted-foreground text-[3.5px]",
                      q.label === "本質問題" && "fill-destructive font-medium",
                    )}
                  >
                    {q.label}
                  </text>
                ))}
                <text
                  x="50"
                  y="98"
                  textAnchor="middle"
                  className="fill-muted-foreground text-[3px]"
                >
                  根深さ → 構造改革が必要
                </text>
                <text
                  x="2"
                  y="50"
                  textAnchor="middle"
                  transform="rotate(-90 2 50)"
                  className="fill-muted-foreground text-[3px]"
                >
                  影響範囲 → 全社
                </text>
                {phenomena.map((p) => {
                  const x = scoreToMapX(p.scores.depth);
                  const y = scoreToMapY(p.scores.impact);
                  const r = urgencyToRadius(p.scores.urgency) / 4;
                  const isSelected = p.id === selectedPhenomenonId;
                  return (
                    <g key={p.id}>
                      {isSelected && (
                        <circle
                          cx={x}
                          cy={y}
                          r={r + 2.5}
                          fill="none"
                          stroke="currentColor"
                          className="text-destructive"
                          strokeWidth="1"
                        />
                      )}
                      <circle
                        cx={x}
                        cy={y}
                        r={r}
                        className={cn(
                          isSelected
                            ? "fill-destructive"
                            : "fill-primary/60",
                        )}
                      />
                      {isSelected && (
                        <text
                          x={x}
                          y={y - r - 2}
                          textAnchor="middle"
                          className="fill-destructive text-[3.5px] font-medium"
                        >
                          {p.label}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader className="pb-2">
              <CardTitle>
                介入しやすさ（{selected.label}）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InterventionIndicators selected={selected} />
            </CardContent>
          </Card>

          {selected.comment ? (
            <Card size="sm">
              <CardHeader className="pb-2">
                <CardTitle>特筆コメント</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {selected.comment}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </ScrollArea>
    </section>
  );
}
