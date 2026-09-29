"use client";

import * as React from "react";
import { Droplets, Leaf, ArrowRight, Clock, Zap } from "lucide-react";
import { BlockMetrics } from "@/lib/dal/types";
import { useTranslation } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

interface HomeActionTilesProps {
  metrics: BlockMetrics;
  onOpenIrrigation?: () => void;
  className?: string;
}

export function HomeActionTiles({ metrics, onOpenIrrigation, className }: HomeActionTilesProps) {
  const { t } = useTranslation();

  const needsIrrigation = metrics.soilMoistureSurface.anomaly < -3.0 || metrics.cwsi > 0.6;

  // Derive nutrient recommendation from telemetry
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
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4", className)}>
      {/* Irrigation Action Tile */}
      <div
        onClick={onOpenIrrigation}
        className="group flex flex-col justify-between rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-xs transition-all hover:border-[var(--primary)] hover:shadow-md cursor-pointer"
      >
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--status-info-bg)] text-[var(--status-info)] group-hover:scale-105 transition-transform">
                <Droplets className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                  {t("farmer.irrigationNeeded", "Precision Irrigation")}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={cn(
                    "text-sm font-bold",
                    needsIrrigation ? "text-[var(--status-danger)]" : "text-[var(--status-success)]"
                  )}>
                    {needsIrrigation ? "Irrigation Needed Today" : "Moisture Adequate"}
                  </span>
                </div>
              </div>
            </div>

            <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase font-mono bg-[var(--primary-subtle)] text-[var(--primary)]">
              <Zap className="h-3 w-3" />
              Solar
            </span>
          </div>

          <p className="mt-3 text-xs text-[var(--fg-secondary)] leading-relaxed">
            {needsIrrigation
              ? "Root-zone soil deficit at 24% VWC. Run solar pump for 2.0 hours between 17:30 and 19:30 to avoid midday evaporative loss."
              : "Soil moisture is currently sufficient across the root zone. No emergency pumping required for the next 48 hours."}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between pt-3 border-t border-[var(--border-subtle)] text-xs font-bold text-[var(--primary)]">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            7-Day Pumping Schedule
          </span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Compound & Fertilizer Action Tile */}
      <div className="group flex flex-col justify-between rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-xs transition-all hover:border-[var(--primary)] hover:shadow-md">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--status-success-bg)] text-[var(--status-success)] group-hover:scale-105 transition-transform">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                  {t("farmer.compoundTip", "Agronomic Advisory")}
                </h4>
                <div className="text-sm font-bold text-[var(--fg-primary)] mt-0.5">
                  {nutrientTitle}
                </div>
              </div>
            </div>

            <span className="text-[10px] font-semibold uppercase tracking-wider font-mono text-[var(--fg-muted)]">
              Telemetry
            </span>
          </div>

          <p className="mt-3 text-xs text-[var(--fg-secondary)] leading-relaxed">
            {compoundTip}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between pt-3 border-t border-[var(--border-subtle)] text-xs font-medium text-[var(--fg-muted)]">
          <span>Apply in moist soil before 10:00 AM</span>
          <span className="font-mono text-[11px] text-[var(--primary)] font-bold">Standard Dose</span>
        </div>
      </div>
    </div>
  );
}
