"use client";

import { Maximize2 } from "lucide-react";
import { useState } from "react";

import { TypographyPreview } from "@/components/store/typography-preview";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getStoreFontLabel,
  typographyPreviewKey,
  type TypographySettingsValue,
} from "@/lib/store/typography-config";

type TypographyPreviewPanelProps = {
  settings: TypographySettingsValue;
};

function previewSummary(settings: TypographySettingsValue) {
  if (settings.applyMode === "uniform") {
    return getStoreFontLabel(settings.uniformFont);
  }

  return "Por elemento";
}

export function TypographyPreviewPanel({ settings }: TypographyPreviewPanelProps) {
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const previewKey = typographyPreviewKey(settings);

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Pré-visualização</h2>
            <p className="text-sm text-muted-foreground">
              Atualiza em tempo real —{" "}
              <span className="font-medium text-foreground">
                {previewSummary(settings)}
              </span>
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => setFullscreenOpen(true)}
          >
            <Maximize2 className="size-4" />
            Tela cheia
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border shadow-sm">
          <div className="border-b bg-muted/40 px-3 py-2">
            <p className="text-xs text-muted-foreground">Preview · Loja</p>
          </div>
          <TypographyPreview
            key={previewKey}
            settings={settings}
            className="max-h-[720px] overflow-y-auto"
          />
        </div>
      </div>

      <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <DialogContent
          showCloseButton
          className="fixed inset-0 top-0 left-0 flex h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none p-0 sm:max-w-none"
        >
          <DialogHeader className="shrink-0 border-b px-4 py-3 text-left">
            <DialogTitle>Pré-visualização da tipografia</DialogTitle>
            <DialogDescription>
              Fonte ativa: {previewSummary(settings)} — alterações refletem ao
              mudar as opções.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto bg-muted/20">
            {fullscreenOpen ? (
              <TypographyPreview
                key={`fullscreen-${previewKey}`}
                settings={settings}
                className="min-h-full"
                size="large"
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
