import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { DataSourceRef, TimeSeriesPoint } from "@/lib/dal/types";
import { SourceLabel } from "./SourceLabel";
import { TrendSparkline } from "./TrendSparkline";
import { cn } from "@/lib/utils";

interface StatTileProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
  anomaly?: number;
  trend?: "improving" | "stable" | "declining";
  source?: DataSourceRef | string;
  points?: TimeSeriesPoint[];
  metricKey?: "ndvi" | "soilMoisture" | "precip" | "lst";
  className?: string;
}

export function StatTile({
  icon,
  label,
  value,
  unit,
  delta,
  anomaly,
  trend,
  source,
  points,
  metricKey,
  className,
}: StatTileProps) {
  const effectiveDelta = delta !== undefined ? delta : anomaly;
  const isPositiveDelta = effectiveDelta !== undefined && effectiveDelta > 0;
  const isNegativeDelta = effectiveDelta !== undefined && effectiveDelta < 0;

  // Visual trend styling based on agronomic convention
  const trendColor =
    trend === "improving"
      ? "text-[var(--status-success)] bg-[var(--status-success-bg)]"
      : trend === "declining"
      ? "text-[var(--status-danger)] bg-[var(--status-danger-bg)]"
      : "text-[var(--fg-muted)] bg-[var(--bg-surface-subtle)]";

  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3.5 shadow-xs transition-colors hover:border-[var(--border-strong)]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon && (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-surface-subtle)] text-[var(--primary)]">
              {icon}
            </div>
          )}
          <span className="text-xs font-medium text-[var(--fg-muted)] leading-tight">{label}</span>
        </div>

        {trend && (
          <span className={cn("inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider", trendColor)}>
            {trend === "improving" && <ArrowUpRight className="h-3 w-3" />}
            {trend === "declining" && <ArrowDownRight className="h-3 w-3" />}
            {trend === "stable" && <Minus className="h-3 w-3" />}
            {trend}
          </span>
        )}
      </div>

      <div className="my-2 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold tracking-tight text-[var(--fg-primary)] font-mono">
          {value}
        </span>
        {unit && <span className="text-xs font-medium text-[var(--fg-muted)]">{unit}</span>}

        {delta !== undefined && (
          <span
            className={cn(
              "ml-1.5 text-xs font-semibold font-mono",
              isNegativeDelta ? "text-[var(--status-danger)]" : isPositiveDelta ? "text-[var(--status-success)]" : "text-[var(--fg-muted)]"
            )}
          >
            {isPositiveDelta ? `+${delta.toFixed(1)}` : delta.toFixed(1)}
          </span>
        )}
      </div>

      {points && metricKey && (
        <div className="my-1">
          <TrendSparkline
            points={points}
            metric={metricKey}
            color={trend === "declining" ? "var(--status-danger)" : "var(--primary)"}
            height={28}
          />
        </div>
      )}

      {source && (
        <div className="pt-1 border-t border-[var(--border-subtle)]/60 mt-1">
          <SourceLabel source={source} />
        </div>
      )}
    </div>
  );
}
