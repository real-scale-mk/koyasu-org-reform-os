"use client";

import { useState } from "react";

import { type Leverage, type Phenomenon } from "@/lib/koyasu/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star } from "lucide-react";

type LeverageActionPaneProps = {
  selectedPhenomenon: Phenomenon;
  leverage: Leverage;
};

export function LeverageActionPane({
  selectedPhenomenon,
  leverage,
}: LeverageActionPaneProps) {
  const [compareOpen, setCompareOpen] = useState(false);

  return (
    <>
      <section className="flex min-w-0 flex-[1.4] flex-col bg-background">
        <header className="flex h-12 shrink-0 items-center border-b border-border px-4">
          <h2 className="text-sm font-semibold text-conclusion">
            レバレッジと打ち手
          </h2>
        </header>

        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-4 p-4">
            <p className="text-[11px] text-muted-foreground">
              フォーカス：
              <span className="font-medium text-foreground">
                {selectedPhenomenon.label}
              </span>
            </p>

            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="flex flex-row items-start gap-2 p-3 pb-2">
                <Star className="mt-0.5 size-4 shrink-0 text-conclusion" />
                <div className="flex min-w-0 flex-col gap-1">
                  <CardTitle className="text-sm text-conclusion">
                    レバレッジ
                  </CardTitle>
                  <p className="text-sm font-semibold text-conclusion">
                    {leverage.label}
                  </p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    接続：{leverage.connection}
                  </p>
                </div>
              </CardHeader>
            </Card>

            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-conclusion">
                このレバレッジへの打ち手
              </h3>
              {leverage.actions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  打ち手データは準備中です
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {leverage.actions.map((action) => (
                    <Card key={action.id}>
                      <CardHeader className="p-3 pb-1">
                        <CardTitle className="text-sm text-conclusion">
                          {action.label}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-1 p-3 pt-0">
                        <p className="text-[11px] text-muted-foreground">
                          なぜ：{action.why}
                        </p>
                        <p className="text-[11px] leading-relaxed text-muted-foreground">
                          概要：{action.summary}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {leverage.actions.length > 0 ? (
              <Button variant="outline" onClick={() => setCompareOpen(true)}>
                打ち手を比較する
              </Button>
            ) : null}
          </div>
        </ScrollArea>
      </section>

      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-conclusion">打ち手比較</DialogTitle>
            <DialogDescription>
              {selectedPhenomenon.label} — {leverage.label}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-3">
            {leverage.actions.map((action) => (
              <Card key={action.id}>
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-sm text-conclusion">
                    {action.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 p-3 pt-0">
                  <p className="text-[11px] text-muted-foreground">
                    なぜ：{action.why}
                  </p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    概要：{action.summary}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
