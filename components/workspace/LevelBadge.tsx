import { type Relevance } from "@/lib/koyasu/schema";
import { Badge } from "@/components/ui/badge";

export type SignalLevel = Relevance;

const LEVEL_VARIANT = {
  高: "signal-high",
  中: "signal-medium",
  低: "signal-low",
} as const;

type LevelBadgeProps = {
  level: SignalLevel;
  prefix?: string;
};

export function LevelBadge({ level, prefix }: LevelBadgeProps) {
  const label = prefix ? `${prefix}：${level}` : level;
  return <Badge variant={LEVEL_VARIANT[level]}>{label}</Badge>;
}

export function levelBadgeVariant(level: SignalLevel) {
  return LEVEL_VARIANT[level];
}
