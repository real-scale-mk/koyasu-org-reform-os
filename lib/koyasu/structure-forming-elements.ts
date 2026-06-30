import type { InterventionStructureId } from "@/lib/koyasu/intervention-structures";
import type { Perspective, Relevance } from "@/lib/koyasu/schema";
import { sortPerspectivesByRelevance } from "@/lib/koyasu/schema";

export type StructureFormingElement = {
  id: string;
  label: string;
  summary: string;
  relevance: Relevance;
};

/** 会議構造を構成する要素（本丸構造の分解） */
export const MEETING_STRUCTURE_FORMING_ELEMENTS: StructureFormingElement[] = [
  {
    id: "accountability",
    label: "責任の曖昧さ",
    summary: "誰が決め・誰が動くか",
    relevance: "高",
  },
  {
    id: "meeting-rules",
    label: "会議運営ルール",
    summary: "アジェンダ・決裁事項・持ち帰り基準",
    relevance: "高",
  },
  {
    id: "information-sharing",
    label: "情報共有",
    summary: "決裁に必要な情報の事前配布",
    relevance: "中",
  },
  {
    id: "manager-behavior",
    label: "管理職行動",
    summary: "決裁者明示と会議後フォロー",
    relevance: "高",
  },
];

export function getStructureFormingElements(
  structureId: InterventionStructureId,
  perspectives: Perspective[],
  relevanceMap: Record<string, Relevance>,
): StructureFormingElement[] {
  if (structureId === "meetings") {
    return MEETING_STRUCTURE_FORMING_ELEMENTS;
  }

  return sortPerspectivesByRelevance(perspectives, relevanceMap).map(
    (perspective) => ({
      id: perspective.id,
      label: perspective.label,
      summary: perspective.summary,
      relevance: relevanceMap[perspective.id] ?? "低",
    }),
  );
}

export function hasStructureMapDiagram(structureId: InterventionStructureId) {
  return structureId === "meetings";
}
