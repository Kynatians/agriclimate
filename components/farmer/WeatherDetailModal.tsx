"use client";

import * as React from "react";
import { CloudRain, Sun, X } from "lucide-react";
import { BlockMetrics } from "@/lib/dal/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WeatherCard } from "./WeatherCard";
import { useTranslation } from "@/lib/i18n/client";

interface WeatherDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metrics: BlockMetrics;
  blockName?: string;
}

export function WeatherDetailModal({
  open,
  onOpenChange,
  metrics,
  blockName = "Selected Farm Block",
}: WeatherDetailModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-2 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--status-warning-bg)] text-[var(--status-warning)] shrink-0">
              <Sun className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-[var(--fg-primary)]">
                {t("farmer.todayWeather", "Weather & Atmospheric Telemetry")}
              </DialogTitle>
              <DialogDescription className="text-xs text-[var(--fg-muted)]">
                NASA POWER 24h satellite reanalysis & 7-day rainfall projection for {blockName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2">
          <WeatherCard
            metrics={metrics}
            blockName={blockName}
            className="border-none shadow-none p-0 bg-transparent hover:border-transparent"
          />
        </div>

        <div className="flex justify-end pt-2 border-t border-[var(--border-subtle)]">
          <Button onClick={() => onOpenChange(false)} variant="outline" className="cursor-pointer">
            {t("common.close", "Done")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
