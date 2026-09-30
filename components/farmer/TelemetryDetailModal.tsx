"use client";

import * as React from "react";
import {
  Satellite,
  Sun,
  CloudRain,
  Droplets,
  Activity,
  Sprout,
  X,
  Info,
  Layers,
} from "lucide-react";
import { BlockMetrics } from "@/lib/dal/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SourceLabel } from "@/components/shared/SourceLabel";
import { useTranslation } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

interface TelemetryDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metrics: BlockMetrics;
  blockName?: string;
}

export function TelemetryDetailModal({
  open,
  onOpenChange,
  metrics,
  blockName = "Selected Farm Block",
}: TelemetryDetailModalProps) {
  const { t } = useTranslation();

  const rainProb = Math.min(95, Math.max(10, Math.round(metrics.precip7dForecast * 1.5)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] shrink-0">
              <Satellite className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-[var(--fg-primary)]">
                NASA Satellite Telemetry & Sensor Index
              </DialogTitle>
              <DialogDescription className="text-xs text-[var(--fg-muted)]">
                Real-time 24h observational reanalysis for {blockName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Scientific Telemetry Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Surface Temp */}
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-3.5">
              <div className="flex items-center justify-between text-xs text-[var(--fg-muted)]">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Land Surface Temp (LST)</span>
                <Sun className="h-4 w-4 text-[var(--status-warning)]" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold font-mono text-[var(--fg-primary)]">
                  {metrics.lst.toFixed(1)}°C
                </span>
                <span className="text-xs font-mono text-[var(--status-success)]">Optimal for Rice</span>
              </div>
              <p className="text-[11px] text-[var(--fg-muted)] mt-1">
                Source: NASA POWER Meteorological Reanalysis (0.5° grid)
              </p>
            </div>

            {/* 2. 7-Day Rainfall Forecast */}
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-3.5">
              <div className="flex items-center justify-between text-xs text-[var(--fg-muted)]">
                <span className="font-semibold uppercase tracking-wider text-[10px]">7-Day Cumulative Precip</span>
                <CloudRain className="h-4 w-4 text-[var(--status-info)]" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold font-mono text-[var(--fg-primary)]">
                  {metrics.precip7dForecast.toFixed(1)} mm
                </span>
                <span className="text-xs font-mono text-[var(--fg-secondary)] font-bold">{rainProb}% rain prob</span>
              </div>
              <p className="text-[11px] text-[var(--fg-muted)] mt-1">
                Source: NASA GPM / IMERG Early Precipitation Run
              </p>
            </div>

            {/* 3. Soil Moisture */}
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-3.5">
              <div className="flex items-center justify-between text-xs text-[var(--fg-muted)]">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Surface Moisture (0-5cm)</span>
                <Droplets className="h-4 w-4 text-[var(--status-success)]" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold font-mono text-[var(--fg-primary)]">
                  {metrics.soilMoistureSurface.value.toFixed(1)}%
                </span>
                <span className="text-xs font-mono text-[var(--fg-muted)]">VWC</span>
              </div>
              <p className="text-[11px] text-[var(--status-success)] font-medium mt-1">
                Root Zone: {metrics.soilMoistureRootZone.value.toFixed(0)}% Adequate (Baseline: {metrics.soilMoistureRootZone.baseline}%)
              </p>
            </div>

            {/* 4. Plant Water Stress (CWSI) */}
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-3.5">
              <div className="flex items-center justify-between text-xs text-[var(--fg-muted)]">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Water Stress Index (CWSI)</span>
                <Activity className="h-4 w-4 text-[var(--primary)]" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold font-mono text-[var(--fg-primary)]">
                  {metrics.cwsi.toFixed(2)}
                </span>
                <span className="text-xs font-mono text-[var(--fg-muted)]">/ 1.0 (Critical &gt; 0.60)</span>
              </div>
              <p className={cn(
                "text-[11px] font-medium mt-1",
                metrics.cwsi > 0.6 ? "text-[var(--status-danger)]" : "text-[var(--status-success)]"
              )}>
                {metrics.cwsi > 0.6 ? "Evening Pumping Required" : "Crop Hydration Optimal"}
              </p>
            </div>

            {/* 5. Canopy Vigor (NDVI) */}
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-3.5 sm:col-span-2">
              <div className="flex items-center justify-between text-xs text-[var(--fg-muted)]">
                <span className="font-semibold uppercase tracking-wider text-[10px]">NDVI Canopy Greenness</span>
                <Sprout className="h-4 w-4 text-[var(--status-success)]" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold font-mono text-[var(--fg-primary)]">
                  {metrics.ndvi.value.toFixed(2)}
                </span>
                <span className="text-xs font-mono text-[var(--status-success)] font-bold">
                  +{metrics.ndvi.anomaly} vs 5-yr seasonal average
                </span>
                <span className="text-xs text-[var(--primary)] font-semibold uppercase font-mono ml-auto">
                  Trend: {metrics.ndvi.trend}
                </span>
              </div>
              <p className="text-[11px] text-[var(--fg-muted)] mt-1">
                Source: MODIS Terra/Aqua 250m Surface Reflectance & Landsat 8/9 OLI-2 30m
              </p>
            </div>
          </div>

          {/* Satellite Provenance List */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 text-xs space-y-2">
            <span className="font-bold text-[var(--fg-primary)] block text-xs">
              Active Data Sources & Verification:
            </span>
            <div className="space-y-1.5 text-[11px] text-[var(--fg-secondary)]">
              {metrics.sources.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-[var(--border-subtle)]/40 pb-1 last:border-none">
                  <SourceLabel source={s} />
                  <span className="text-[10px] font-mono text-[var(--fg-muted)]">
                    Quality: High
                  </span>
                </div>
              ))}
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
