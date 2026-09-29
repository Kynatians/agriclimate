import * as React from "react";
import { Sprout, Activity, AlertCircle, CheckCircle2 } from "lucide-react";
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

  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm transition-all hover:border-[var(--primary)]",
        className
      )}
    >
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]/70">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)]">
            <Sprout className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--fg-primary)] leading-tight">
              {t("farmer.cropHealth", "Crop Condition")}
            </h3>
            <span className="text-xs text-[var(--fg-muted)]">MODIS & Landsat Telemetry</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider">
          {isHealthy ? (
            <span className="inline-flex items-center gap-1 text-[var(--status-success)] bg-[var(--status-success-bg)] px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Healthy
            </span>
          ) : isStressed ? (
            <span className="inline-flex items-center gap-1 text-[var(--status-danger)] bg-[var(--status-danger-bg)] px-2.5 py-0.5 rounded-full">
              <AlertCircle className="h-3.5 w-3.5" />
              Water Deficit
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[var(--status-warning)] bg-[var(--status-warning-bg)] px-2.5 py-0.5 rounded-full">
              <Activity className="h-3.5 w-3.5" />
              Moderate Stress
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 my-4">
        <div className="flex flex-col rounded-xl bg-[var(--bg-surface-subtle)] p-3 border border-[var(--border-subtle)]/60">
          <span className="text-xs font-semibold text-[var(--fg-secondary)]">NDVI Index</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono text-[var(--fg-primary)]">
              {metrics.ndvi.value.toFixed(2)}
            </span>
            <span className="text-xs text-[var(--fg-muted)]">
              ({metrics.ndvi.anomaly >= 0 ? `+${metrics.ndvi.anomaly}` : metrics.ndvi.anomaly})
            </span>
          </div>
          <span className="text-[11px] font-medium text-[var(--primary)] uppercase tracking-wider mt-0.5">
            Trend: {metrics.ndvi.trend}
          </span>
        </div>

        <div className="flex flex-col rounded-xl bg-[var(--bg-surface-subtle)] p-3 border border-[var(--border-subtle)]/60">
          <span className="text-xs font-semibold text-[var(--fg-secondary)]">Water Stress (CWSI)</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono text-[var(--fg-primary)]">
              {metrics.cwsi.toFixed(2)}
            </span>
            <span className="text-xs text-[var(--fg-muted)]">/ 1.0</span>
          </div>
          <span className="text-[11px] font-medium text-[var(--fg-muted)] mt-0.5">
            {metrics.cwsi > 0.6 ? "Irrigation Recommended" : "Adequate Water"}
          </span>
        </div>
      </div>

      {ndviSource && (
        <div className="pt-2 border-t border-[var(--border-subtle)]/60 flex items-center justify-between">
          <SourceLabel source={ndviSource} />
        </div>
      )}
    </div>
  );
}
