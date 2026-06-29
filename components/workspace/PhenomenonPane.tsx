"use client";

import { cn } from "@/lib/utils";
import { type Phenomenon } from "@/lib/org-transformation/schema";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Pane1Toggle } from "@/components/workspace/Pane1Toggle";

type PhenomenonPaneProps = {
  toolName: string;
  phenomena: Phenomenon[];
  selectedPhenomenonId: string;
  onSelectPhenomenon: (id: string) => void;
};

export function PhenomenonPane({
  toolName,
  phenomena,
  selectedPhenomenonId,
  onSelectPhenomenon,
}: PhenomenonPaneProps) {
  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border [&_[data-slot=sidebar-container]]:bg-sidebar"
    >
      <SidebarHeader className="flex h-12 flex-row items-center justify-between border-b border-sidebar-border px-2">
        <span className="truncate text-sm font-semibold group-data-[collapsible=icon]:hidden">
          {toolName}
        </span>
        <Pane1Toggle />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>問題現象マップ</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {phenomena.map((p) => (
                <SidebarMenuItem key={p.id}>
                  <SidebarMenuButton
                    isActive={p.id === selectedPhenomenonId}
                    onClick={() => onSelectPhenomenon(p.id)}
                    className="h-auto flex-col items-start gap-1 py-2"
                  >
                    <div className="flex w-full items-center gap-2">
                      <Badge variant="secondary">{p.category}</Badge>
                      <span
                        className={cn(
                          "truncate font-medium",
                          p.id === selectedPhenomenonId &&
                            "text-sidebar-primary-foreground",
                        )}
                      >
                        {p.label}
                      </span>
                    </div>
                    <span className="line-clamp-2 w-full text-left text-[11px] text-muted-foreground group-data-[collapsible=icon]:hidden">
                      {p.note}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
