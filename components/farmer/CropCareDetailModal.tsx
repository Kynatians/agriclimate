"use client";

import * as React from "react";
import { Sprout, Leaf, Clock } from "lucide-react";
import { Block, BlockMetrics } from "@/lib/dal/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CropConditionCard } from "./CropConditionCard";
import { useTranslation } from "@/lib/i18n/client";

interface CropCareDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metrics: BlockMetrics;
  block?: Block;
}

export function CropCareDetailModal({
  open,
  onOpenChange,
  metrics,
  block,
}: CropCareDetailModalProps) {
  const { t } = useTranslation();

  // Nutrient recommendation calculation
  let compoundTip = "Apply balanced organic compost (200kg/ha) to support field recovery and soil microbe vitality.";
  let nutrientTitle = "Organic Compost Balancing";
  if (metrics.ndvi.value < metrics.ndvi.baseline - 0.05) {
    compoundTip = "Satellite chlorophyll deficit detected. Apply urea 50kg/ha top-dress before upcoming forecasted light rain.";
    nutrientTitle = "Nitrogen Deficit Top-Dress";
  } else if (metrics.soilMoistureSurface.value > 40) {
    compoundTip = "High saturation: split-dose potassium silicate recommended to reinforce stalk strength and prevent root rot.";
    nutrientTitle = "Potassium Silicate Fortification";
  } else if (metrics.cwsi > 0.65) {
    compoundTip = "Elevated thermal water stress: apply seaweed bio-stimulant foliar spray at dusk to minimize heat shock.";
    nutrientTitle = "Heat Stress Bio-Stimulant";
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-2 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] shrink-0">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-[var(--fg-primary)]">
                {t("farmer.cropHealth", "Crop Multi-Spectral Telemetry & Nutrient Care")}
              </DialogTitle>
              <DialogDescription className="text-xs text-[var(--fg-muted)]">
                MODIS + Landsat vegetation index and tailored agronomic fertilizer schedule
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Full Crop Condition Card */}
          <CropConditionCard
            metrics={metrics}
            block={block}
            className="border-none shadow-none p-0 bg-transparent hover:border-transparent"
          />

          {/* Full Agronomic Fertilizer & Nutrient Guidance Callout */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--fg-primary)]">
                <Leaf className="h-4 w-4 text-[var(--primary)]" />
                <span>Agronomic Advisory: {nutrientTitle}</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-[var(--primary-subtle)] text-[var(--primary)] px-2 py-0.5 rounded font-bold">
                Recommended Action
              </span>
            </div>

            <p className="text-xs text-[var(--fg-secondary)] leading-relaxed">
              {compoundTip}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]/60 text-[11px] text-[var(--fg-muted)]">
              <span className="flex items-center gap-1 font-medium text-[var(--fg-secondary)]">
                <Clock className="h-3 w-3 text-[var(--primary)]" />
                Best application time: In moist soil before 10:00 AM
              </span>
              <span className="font-mono font-bold text-[var(--primary)]">Standard Dose</span>
            </div>
          </div>
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
