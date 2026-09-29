import * as React from "react";
import { Droplets, Leaf } from "lucide-react";
import { BlockMetrics } from "@/lib/dal/types";
import { useTranslation } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

interface HomeActionTilesProps {
  metrics: BlockMetrics;
  className?: string;
}

export function HomeActionTiles({ metrics, className }: HomeActionTilesProps) {
  const { t } = useTranslation();

  const needsIrrigation = metrics.soilMoistureSurface.anomaly < -3.0 || metrics.cwsi > 0.6;

  // Derive nutrient recommendation from telemetry
  let compoundTip = "Apply balanced organic compost (200kg/ha) to support field recovery.";
  if (metrics.ndvi.value < metrics.ndvi.baseline - 0.05) {
    compoundTip = "Nitrogen deficit detected. Apply urea 50kg/ha before upcoming light rain.";
  } else if (metrics.soilMoistureSurface.value > 40) {
    compoundTip = "High saturation: split-dose potassium silicate recommended to prevent root decay.";
  } else if (metrics.cwsi > 0.65) {
    compoundTip = "High water stress: apply seaweed bio-stimulant foliar spray at dusk.";
  }

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3", className)}>
      {/* Irrigation Action Tile */}
      <div className="flex flex-col justify-between rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-xs transition-all hover:border-[var(--primary)]">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--status-info-bg)] text-[var(--status-info)]">
            <Droplets className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)]">
              {t("farmer.irrigationNeeded", "Irrigation")}
            </h4>
            <span className="text-sm font-bold text-[var(--fg-primary)]">
              {needsIrrigation ? t("farmer.neededToday", "Needed Today") : "Adequate Water"}
            </span>
          </div>
        </div>

        <p className="mt-2 text-xs text-[var(--fg-secondary)] leading-relaxed">
          {needsIrrigation
            ? "Root-zone soil deficit at 24% VWC. Apply 2.5 hours solar pump irrigation to prevent wilting."
            : "Soil moisture is currently sufficient. No emergency pumping required for the next 48 hours."}
        </p>
      </div>

      {/* Compound Action Tile */}
      <div className="flex flex-col justify-between rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-xs transition-all hover:border-[var(--primary)]">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--status-success-bg)] text-[var(--status-success)]">
            <Leaf className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)]">
              {t("farmer.compoundTip", "Compound Advisory")}
            </h4>
            <span className="text-sm font-bold text-[var(--fg-primary)]">
              Nutrient Timing
            </span>
          </div>
        </div>

        <p className="mt-2 text-xs text-[var(--fg-secondary)] leading-relaxed">
          {compoundTip}
        </p>
      </div>
    </div>
  );
}
