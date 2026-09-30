"use client";

import * as React from "react";
import {
  Droplets,
  Sun,
  Sprout,
  ArrowRight,
  Zap,
  Clock,
  Sparkles,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";
import { Block, BlockMetrics, TimeSeriesPoint } from "@/lib/dal/types";
import { useTranslation } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { SoilStrataVisual } from "./SoilStrataVisual";
import { SolarPumpingDial } from "./SolarPumpingDial";
import { WeatherHorizonStrip } from "./WeatherHorizonStrip";
import { CropGrowthStepper } from "./CropGrowthStepper";

interface DailyDecisionsGridProps {
  metrics: BlockMetrics;
  block?: Block;
  timeSeries?: TimeSeriesPoint[];
  onOpenIrrigation: () => void;
  onOpenWeather: () => void;
  onOpenCropCare: () => void;
  className?: string;
}

export function DailyDecisionsGrid({
  metrics,
  block,
  timeSeries,
  onOpenIrrigation,
  onOpenWeather,
  onOpenCropCare,
  className,
}: DailyDecisionsGridProps) {
  const { t } = useTranslation();

  // Water calculations
  const needsIrrigation = metrics.soilMoistureSurface.anomaly < -3.0 || metrics.cwsi > 0.6;
  const soilMoisture = metrics.soilMoistureSurface.value;
  const rootZoneMoisture = metrics.soilMoistureRootZone?.value ?? (soilMoisture + 4);

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
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6", className)}>
      {/* 1. Water & Solar Pumping Decision Card */}
      <div
        onClick={onOpenIrrigation}
        className={cn(
          "group relative flex flex-col justify-between rounded-2xl border-2 p-4 sm:p-5 shadow-xs transition-all hover:shadow-md cursor-pointer",
          needsIrrigation
            ? "border-[var(--status-danger)]/50 bg-[var(--bg-surface)] hover:border-[var(--status-danger)]"
            : "border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--primary)]/70"
        )}
      >
        <div className="space-y-3.5">
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

            <span className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase font-mono bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Zap className="h-3 w-3" />
              Solar Free
            </span>
          </div>

          {/* Visual Soil Strata Cross-Section Gauge */}
          <SoilStrataVisual
            surfaceMoisture={soilMoisture}
            rootZoneMoisture={rootZoneMoisture}
            needsIrrigation={needsIrrigation}
          />

          {/* Visual Solar Pumping Daylight Ribbon */}
          <SolarPumpingDial
            needsIrrigation={needsIrrigation}
            recommendedHours="17:30 – 19:30"
            durationHours={2}
            dieselSavedLiters={3.2}
          />
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
        className="group relative flex flex-col justify-between rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-5 shadow-xs transition-all hover:border-[var(--primary)]/70 hover:shadow-md cursor-pointer"
      >
        <div className="space-y-3.5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]/70">
            <div className="flex items-center gap-2.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 transition-transform group-hover:scale-105">
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

          {/* Visual Weather Horizon & Temperature Thermometer Strip */}
          <WeatherHorizonStrip
            currentTemp={metrics.lst}
            precip7dForecast={metrics.precip7dForecast}
            rainProb={rainProb}
          />
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
        className="group relative flex flex-col justify-between rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-5 shadow-xs transition-all hover:border-[var(--primary)]/70 hover:shadow-md cursor-pointer"
      >
        <div className="space-y-3.5">
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
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : isStressed
                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
              )}
            >
              {isHealthy ? "Healthy" : isStressed ? "Deficit" : "Watch"}
            </span>
          </div>

          {/* Visual 4-Stage Crop Growth Stepper & Leaf Chlorophyll Vigor */}
          <CropGrowthStepper
            cropName={block?.primaryCrop || "Boro Rice"}
            cropStage={block?.cropStage}
            ndviValue={metrics.ndvi.value}
            ndviBaseline={metrics.ndvi.baseline}
            nutrientTitle={nutrientTitle}
            nutrientShortTip={nutrientShortTip}
          />
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

