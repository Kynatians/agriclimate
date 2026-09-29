import * as React from "react";
import { CloudRain, Sun, Droplets } from "lucide-react";
import { BlockMetrics } from "@/lib/dal/types";
import { SourceLabel } from "@/components/shared/SourceLabel";
import { useTranslation } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

interface WeatherCardProps {
  metrics: BlockMetrics;
  blockName?: string;
  className?: string;
}

export function WeatherCard({ metrics, blockName, className }: WeatherCardProps) {
  const { t } = useTranslation();

  // Determine rain probability approx from forecast
  const rainProb = Math.min(95, Math.max(10, Math.round(metrics.precip7dForecast * 1.5)));

  // Plain language soil condition
  const soilMoisture = metrics.soilMoistureSurface.value;
  let soilSummaryKey = "status.optimal";
  let soilSummaryColor = "text-[var(--status-success)]";
  if (soilMoisture < 28) {
    soilSummaryKey = "status.deficit";
    soilSummaryColor = "text-[var(--status-danger)]";
  } else if (soilMoisture > 42) {
    soilSummaryKey = "status.surplus";
    soilSummaryColor = "text-[var(--status-warning)]";
  }

  const precipSource = metrics.sources.find((s) => s.metric === "precip");

  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm transition-all hover:border-[var(--primary)]",
        className
      )}
    >
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]/70">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--status-warning-bg)] text-[var(--status-warning)]">
            <Sun className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--fg-primary)] leading-tight">
              {t("farmer.todayWeather", "Today's Weather")}
            </h3>
            <span className="text-xs text-[var(--fg-muted)]">NASA POWER Satellite Reanalysis</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-3xl font-extrabold tracking-tight text-[var(--fg-primary)] font-mono">
            {metrics.lst.toFixed(0)}°C
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 my-4">
        {/* Rain Forecast */}
        <div className="flex flex-col rounded-xl bg-[var(--bg-surface-subtle)] p-3 border border-[var(--border-subtle)]/60">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--fg-secondary)] mb-1">
            <CloudRain className="h-4 w-4 text-[var(--status-info)]" />
            <span>{t("farmer.rainProb", "Rain Probability")}</span>
          </div>
          <span className="text-2xl font-bold font-mono text-[var(--fg-primary)]">
            {rainProb}%
          </span>
          <span className="text-[11px] text-[var(--fg-muted)] mt-0.5">
            {metrics.precip7dForecast.toFixed(0)}mm in 7 days
          </span>
        </div>

        {/* Plain Language Soil Condition */}
        <div className="flex flex-col rounded-xl bg-[var(--bg-surface-subtle)] p-3 border border-[var(--border-subtle)]/60">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--fg-secondary)] mb-1">
            <Droplets className="h-4 w-4 text-[var(--status-success)]" />
            <span>{t("farmer.soilCondition", "Soil Moisture")}</span>
          </div>
          <span className={cn("text-2xl font-bold font-mono", soilSummaryColor)}>
            {soilMoisture.toFixed(0)}%
          </span>
          <span className={cn("text-xs font-semibold uppercase tracking-wider mt-0.5", soilSummaryColor)}>
            {t(soilSummaryKey, "Adequate")}
          </span>
        </div>
      </div>

      {precipSource && (
        <div className="pt-2 border-t border-[var(--border-subtle)]/60 flex items-center justify-between">
          <SourceLabel source={precipSource} />
        </div>
      )}
    </div>
  );
}
