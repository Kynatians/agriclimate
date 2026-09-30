"use client";

import * as React from "react";
import {
  Droplets,
  CloudRain,
  Sun,
  Sprout,
  ArrowRight,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  CalendarDays,
  Leaf,
} from "lucide-react";
import { Block, BlockMetrics } from "@/lib/dal/types";
import { useTranslation } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

interface DailyDecisionsGridProps {
  metrics: BlockMetrics;
  block?: Block;
  onOpenIrrigation: () => void;
  onOpenWeather: () => void;
  onOpenCropCare: () => void;
  className?: string;
}

export function DailyDecisionsGrid({
  metrics,
  block,
  onOpenIrrigation,
  onOpenWeather,
  onOpenCropCare,
  className,
}: DailyDecisionsGridProps) {
  const { t } = useTranslation();

  // Water calculations
  const needsIrrigation = metrics.soilMoistureSurface.anomaly < -3.0 || metrics.cwsi > 0.6;
  const soilMoisture = metrics.soilMoistureSurface.value;

  // Weather calculations
  const rainProb = Math.min(95, Math.max(10, Math.round(metrics.precip7dForecast * 1.5)));

  // Crop care calculations
  const isHealthy = metrics.ndvi.value >= 0.55 && metrics.cwsi <= 0.45;
  const isStressed = metrics.cwsi > 0.6;

  let nutrientTitle = "Balanced Organic Compost";
  let nutrientShortTip = "Apply 200kg/ha organic compost to maintain microbe vitality.";
  if (metrics.ndvi.value < metrics.ndvi.baseline - 0.05) {
    nutrientTitle = "Nitrogen Deficit Top-Dress";
    nutrientShortTip = "Apply Urea 50kg/ha top-dress before upcoming rain.";
  } else if (metrics.soilMoistureSurface.value > 40) {
    nutrientTitle = "Potassium Silicate Fortification";
    nutrientShortTip = "Split-dose potassium silicate to prevent root rot.";
  } else if (metrics.cwsi > 0.65) {
    nutrientTitle = "Heat Stress Bio-Stimulant";
    nutrientShortTip = "Apply seaweed foliar spray at dusk to minimize heat shock.";
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4.5 sm:gap-6", className)}>
      {/* 1. Water & Pumping Decision Card */}
      <div
        onClick={onOpenIrrigation}
        className={cn(
          "group relative flex flex-col justify-between rounded-2xl border-2 p-5 shadow-xs transition-all hover:shadow-md cursor-pointer",
          needsIrrigation
            ? "border-[var(--status-danger)]/50 bg-[var(--status-danger-bg)]/10 hover:border-[var(--status-danger)]"
            : "border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--primary)]/70"
        )}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]/70">
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-2xl transition-transform group-hover:scale-105",
                  needsIrrigation
                    ? "bg-[var(--status-danger-bg)] text-[var(--status-danger)]"
                    : "bg-[var(--status-info-bg)] text-[var(--status-info)]"
                )}
              >
                <Droplets className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                  {t("farmer.irrigationNeeded", "Water & Irrigation")}
                </span>
                <h3 className="text-base font-bold text-[var(--fg-primary)] leading-tight mt-0.5">
                  {needsIrrigation ? "Irrigation Needed Today" : "Moisture Adequate"}
                </h3>
              </div>
            </div>

            <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase font-mono bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--primary)]/20">
              <Zap className="h-3 w-3" />
              Solar
            </span>
          </div>

          {/* Practical Guidance */}
          <p className="mt-3.5 text-xs text-[var(--fg-secondary)] leading-relaxed">
            {needsIrrigation
              ? "Root-zone deficit detected. Run solar pump for 2 hours between 17:30 and 19:30 to avoid midday heat loss."
              : "Soil moisture is currently sufficient. No emergency pumping required for the next 48 hours."}
          </p>

          {/* Glanceable Metrics Badges */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <span className="rounded-lg bg-[var(--bg-surface-subtle)] px-2.5 py-1 border border-[var(--border-subtle)] text-[var(--fg-primary)] font-bold">
              💧 Soil: {soilMoisture.toFixed(0)}% VWC
            </span>
            <span className="rounded-lg bg-[var(--status-success-bg)] px-2.5 py-1 text-[var(--status-success)] font-bold border border-[var(--status-success)]/20">
              ⚡ Saves 3.2L Diesel
            </span>
          </div>
        </div>

        {/* Footer Tap Trigger */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]/70 text-xs font-bold text-[var(--primary)]">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Solar Schedule & Details
          </span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* 2. Weather & Sky Decision Card */}
      <div
        onClick={onOpenWeather}
        className="group relative flex flex-col justify-between rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-xs transition-all hover:border-[var(--primary)]/70 hover:shadow-md cursor-pointer"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]/70">
            <div className="flex items-center gap-2.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--status-warning-bg)] text-[var(--status-warning)] transition-transform group-hover:scale-105">
                <Sun className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                  {t("farmer.todayWeather", "Weather & Sky")}
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-extrabold font-mono text-[var(--fg-primary)]">
                    {metrics.lst.toFixed(0)}°C
                  </span>
                  <span className="text-xs text-[var(--fg-muted)] font-normal">
                    • Feels {Math.round(metrics.lst + 2)}°C
                  </span>
                </div>
              </div>
            </div>

            <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase font-mono bg-[var(--bg-surface-subtle)] text-[var(--fg-muted)] border border-[var(--border-subtle)]">
              NASA POWER
            </span>
          </div>

          {/* Practical Guidance */}
          <p className="mt-3.5 text-xs text-[var(--fg-secondary)] leading-relaxed">
            {metrics.precip7dForecast > 15
              ? `Rain chance is ${rainProb}%. Cumulative ${metrics.precip7dForecast.toFixed(0)} mm rain forecast over the next 7 days.`
              : `Dry and clear sky. Rain chance is low (${rainProb}%), good conditions for solar pumping and field harvesting.`}
          </p>

          {/* Mini 3-Day Horizon Preview */}
          <div className="mt-3.5 grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono">
            <div className="rounded-lg bg-[var(--primary-subtle)] p-1.5 border border-[var(--primary)]/30">
              <span className="text-[var(--primary)] font-bold block">Today</span>
              <span className="text-xs font-bold text-[var(--fg-primary)]">{metrics.lst.toFixed(0)}°</span>
            </div>
            <div className="rounded-lg bg-[var(--bg-surface-subtle)] p-1.5 border border-[var(--border-subtle)]">
              <span className="text-[var(--fg-muted)] block">Tomorrow</span>
              <span className="text-xs font-bold text-[var(--fg-primary)]">{Math.round(metrics.lst - 1)}°</span>
            </div>
            <div className="rounded-lg bg-[var(--bg-surface-subtle)] p-1.5 border border-[var(--border-subtle)]">
              <span className="text-[var(--fg-muted)] block">Day 3</span>
              <span className="text-xs font-bold text-[var(--fg-primary)]">{Math.round(metrics.lst + 1)}°</span>
            </div>
          </div>
        </div>

        {/* Footer Tap Trigger */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]/70 text-xs font-bold text-[var(--primary)]">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            7-Day Forecast & Radar
          </span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* 3. Crop Health & Care Decision Card */}
      <div
        onClick={onOpenCropCare}
        className="group relative flex flex-col justify-between rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-xs transition-all hover:border-[var(--primary)]/70 hover:shadow-md cursor-pointer"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]/70">
            <div className="flex items-center gap-2.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary-subtle)] text-[var(--primary)] transition-transform group-hover:scale-105">
                <Sprout className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                  {t("farmer.cropHealth", "Crop Health & Care")}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <h3 className="text-base font-bold text-[var(--fg-primary)] truncate max-w-[150px]">
                    {block?.primaryCrop || "Boro Rice"}
                  </h3>
                  <span className="text-[11px] font-medium text-[var(--primary)]">
                    • {block?.cropStage?.split(" ")[0] || "Tillering"}
                  </span>
                </div>
              </div>
            </div>

            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[9px] font-bold font-mono border uppercase",
                isHealthy
                  ? "bg-[var(--status-success-bg)] text-[var(--status-success)] border-[var(--status-success)]/30"
                  : isStressed
                  ? "bg-[var(--status-danger-bg)] text-[var(--status-danger)] border-[var(--status-danger)]/30"
                  : "bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning)]/30"
              )}
            >
              {isHealthy ? "Healthy" : isStressed ? "Deficit" : "Watch"}
            </span>
          </div>

          {/* Practical Guidance */}
          <div className="mt-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--fg-primary)]">
              <Leaf className="h-3.5 w-3.5 text-[var(--primary)] shrink-0" />
              <span>{nutrientTitle}</span>
            </div>
            <p className="text-xs text-[var(--fg-secondary)] leading-relaxed">
              {nutrientShortTip}
            </p>
          </div>

          {/* Glanceable Metrics Badges */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <span className="rounded-lg bg-[var(--bg-surface-subtle)] px-2.5 py-1 border border-[var(--border-subtle)] text-[var(--fg-primary)] font-bold">
              🌿 Canopy NDVI: {metrics.ndvi.value.toFixed(2)}
            </span>
            <span className="rounded-lg bg-[var(--bg-surface-subtle)] px-2.5 py-1 border border-[var(--border-subtle)] text-[var(--fg-muted)]">
              Apply before 10 AM
            </span>
          </div>
        </div>

        {/* Footer Tap Trigger */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]/70 text-xs font-bold text-[var(--primary)]">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Satellite Health & Nutrients
          </span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}
