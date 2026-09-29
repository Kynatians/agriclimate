"use client";

import * as React from "react";
import { Sprout, Activity, AlertCircle, CheckCircle2, Waves, Layers } from "lucide-react";
import { Block, BlockMetrics } from "@/lib/dal/types";
import { SourceLabel } from "@/components/shared/SourceLabel";
import { useTranslation } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

interface CropConditionCardProps {
  metrics: BlockMetrics;
  block?: Block;
  className?: string;
}

export function CropConditionCard({ metrics, block, className }: CropConditionCardProps) {
  const { t } = useTranslation();

  const isStressed = metrics.cwsi > 0.6;
  const isHealthy = metrics.ndvi.value >= 0.55 && metrics.cwsi <= 0.45;

  const ndviSource = metrics.sources.find((s) => s.metric === "ndvi");

  // Normalized percentages for progress bars
  const ndviPercent = Math.min(100, Math.max(0, Math.round(metrics.ndvi.value * 100)));
  const cwsiPercent = Math.min(100, Math.max(0, Math.round(metrics.cwsi * 100)));
  const rootZonePercent = Math.min(100, Math.max(0, Math.round(metrics.soilMoistureRootZone.value)));

  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-xs transition-all hover:border-[var(--primary)]/60",
        className
      )}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--border-subtle)]/70 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary-subtle)] text-[var(--primary)] shrink-0">
            <Sprout className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-[var(--fg-primary)] leading-tight">
                {t("farmer.cropHealth", "Crop Condition & Multi-Spectral Telemetry")}
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider font-mono border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--fg-muted)]">
                MODIS + Landsat
              </span>
            </div>
            <span className="text-xs text-[var(--fg-muted)]">
              Field Crop: <strong className="text-[var(--fg-primary)]">{block?.primaryCrop || "Boro Rice"}</strong> • Growth Stage: <strong className="text-[var(--primary)]">{block?.cropStage || "Vegetative (Tillering)"}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isHealthy ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--status-success)] bg-[var(--status-success-bg)] px-3 py-1 rounded-full border border-[var(--status-success)]/30">
              <CheckCircle2 className="h-4 w-4" />
              Healthy Vigor
            </span>
          ) : isStressed ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--status-danger)] bg-[var(--status-danger-bg)] px-3 py-1 rounded-full border border-[var(--status-danger)]/30">
              <AlertCircle className="h-4 w-4" />
              Water Deficit Warning
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--status-warning)] bg-[var(--status-warning-bg)] px-3 py-1 rounded-full border border-[var(--status-warning)]/30">
              <Activity className="h-4 w-4" />
              Moderate Stress Watch
            </span>
          )}
        </div>
      </div>

      {/* Multi-Spectral Gauges & Bars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 my-4">
        {/* NDVI Vegetation Index Card */}
        <div className="flex flex-col justify-between rounded-xl bg-[var(--bg-surface-subtle)] p-3.5 border border-[var(--border-subtle)]/60">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--fg-secondary)]">NDVI Greenness Index</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] font-mono">
                {metrics.ndvi.trend}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-3xl font-extrabold font-mono text-[var(--fg-primary)]">
                {metrics.ndvi.value.toFixed(2)}
              </span>
              <span className="text-xs font-mono font-medium text-[var(--status-success)]">
                ({metrics.ndvi.anomaly >= 0 ? `+${metrics.ndvi.anomaly}` : metrics.ndvi.anomaly} vs 5-yr avg)
              </span>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-[var(--fg-muted)] mb-1 font-mono">
              <span>Fallow (0.2)</span>
              <span>Dense Canopy (0.8)</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border-subtle)]">
              <div
                className="h-full rounded-full bg-[var(--status-success)] transition-all duration-500"
                style={{ width: `${ndviPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* CWSI Water Stress Index Card */}
        <div className="flex flex-col justify-between rounded-xl bg-[var(--bg-surface-subtle)] p-3.5 border border-[var(--border-subtle)]/60">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--fg-secondary)]">Plant Water Stress (CWSI)</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)] font-mono">
                {metrics.cwsi > 0.6 ? "Irrigate" : "Adequate"}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-3xl font-extrabold font-mono text-[var(--fg-primary)]">
                {metrics.cwsi.toFixed(2)}
              </span>
              <span className="text-xs font-mono text-[var(--fg-muted)]">
                / 1.0 (Critical &gt; 0.60)
              </span>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-[var(--fg-muted)] mb-1 font-mono">
              <span>Hydrated (0.0)</span>
              <span>Severe Wilting (1.0)</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border-subtle)]">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  metrics.cwsi > 0.6 ? "bg-[var(--status-danger)]" : metrics.cwsi > 0.4 ? "bg-[var(--status-warning)]" : "bg-[var(--status-info)]"
                )}
                style={{ width: `${cwsiPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Root-Zone Moisture Layer Card */}
        <div className="flex flex-col justify-between rounded-xl bg-[var(--bg-surface-subtle)] p-3.5 border border-[var(--border-subtle)]/60">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--fg-secondary)]">Root-Zone Soil Reserve</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--status-info)] font-mono">
                NASA SMAP L3
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-3xl font-extrabold font-mono text-[var(--fg-primary)]">
                {metrics.soilMoistureRootZone.value.toFixed(0)}%
              </span>
              <span className="text-xs font-mono text-[var(--fg-muted)]">
                VWC (Baseline: {metrics.soilMoistureRootZone.baseline}%)
              </span>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-[var(--fg-muted)] mb-1 font-mono">
              <span>Dry Wilting (15%)</span>
              <span>Field Capacity (45%)</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border-subtle)]">
              <div
                className="h-full rounded-full bg-[var(--status-info)] transition-all duration-500"
                style={{ width: `${rootZonePercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Agronomic Telemetry Interpretation Strip */}
      <div className="rounded-xl border border-[var(--border-subtle)]/70 bg-[var(--bg-surface-subtle)]/40 p-3 mb-3 text-xs leading-relaxed text-[var(--fg-secondary)] flex items-start gap-2.5">
        <Layers className="h-4 w-4 text-[var(--primary)] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[var(--fg-primary)]">Satellite Canopy Health Assessment: </strong>
          {isHealthy
            ? "Vigorous photosynthetic activity observed across 30m Landsat pixel grids. Crop canopy chlorophyll absorption is high with minimal evaporative stress."
            : isStressed
            ? "Elevated leaf surface thermal anomaly detected. Stomatal closure observed due to root-zone moisture deficit. Supplemental irrigation recommended."
            : "Vegetative development is stable with normal biomass accumulation for the current stage. Monitor upcoming rainfall window."}
        </div>
      </div>

      {/* Provenance Footer */}
      {ndviSource && (
        <div className="pt-3 border-t border-[var(--border-subtle)]/60 flex items-center justify-between text-xs">
          <SourceLabel source={ndviSource} />
          <span className="text-[10px] text-[var(--fg-muted)] font-mono">
            Flood Risk Score: {(metrics.floodScore * 100).toFixed(0)}% (Low)
          </span>
        </div>
      )}
    </div>
  );
}
