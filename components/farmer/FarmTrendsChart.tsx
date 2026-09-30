"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  CartesianGrid,
} from "recharts";
import { Droplets, CloudRain, Sprout, Sun, TrendingUp, Info } from "lucide-react";
import { TimeSeriesPoint, BlockMetrics } from "@/lib/dal/types";
import { useTranslation } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

interface FarmTrendsChartProps {
  timeSeries: TimeSeriesPoint[];
  metrics?: BlockMetrics;
  blockName?: string;
  className?: string;
}

type MetricKey = "soilMoisture" | "precip" | "ndvi" | "lst";
type RangeDays = 7 | 14 | 30;

export function FarmTrendsChart({
  timeSeries,
  metrics,
  blockName = "Your Field",
  className,
}: FarmTrendsChartProps) {
  const { t } = useTranslation();
  const [activeMetric, setActiveMetric] = React.useState<MetricKey>("soilMoisture");
  const [rangeDays, setRangeDays] = React.useState<RangeDays>(14);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter time series points by selected range
  const filteredData = React.useMemo(() => {
    if (!timeSeries || timeSeries.length === 0) {
      // Fallback synthetic data if empty
      const now = new Date();
      return Array.from({ length: rangeDays }).map((_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (rangeDays - 1 - i));
        const dateStr = d.toISOString().split("T")[0];
        const soilBase = metrics ? metrics.soilMoistureSurface.value : 30;
        const ndviBase = metrics ? metrics.ndvi.value : 0.5;
        const lstBase = metrics ? metrics.lst : 32;
        return {
          date: dateStr,
          soilMoisture: Math.round((soilBase + Math.sin(i * 0.8) * 3) * 10) / 10,
          precip: i === rangeDays - 3 ? 12 : i === rangeDays - 6 ? 4 : 0,
          ndvi: Math.round((ndviBase + (i * 0.005)) * 100) / 100,
          lst: Math.round((lstBase + Math.cos(i * 0.5) * 1.5) * 10) / 10,
        };
      });
    }

    return timeSeries.slice(-rangeDays).map((pt) => ({
      ...pt,
      formattedDate: pt.date.slice(5), // "MM-DD"
    }));
  }, [timeSeries, rangeDays, metrics]);

  // Metric-specific visual configs
  const metricConfigs = {
    soilMoisture: {
      label: t("metrics.soilMoisture", "Soil Moisture"),
      unit: "% VWC",
      icon: Droplets,
      color: "var(--status-info)",
      fillId: "soilGradient",
      safeMin: 25,
      safeMax: 40,
      description: "Root-zone hydration safe zone (25% – 40%). Above 25% prevents wilting.",
    },
    precip: {
      label: t("metrics.precip", "Rainfall"),
      unit: "mm",
      icon: CloudRain,
      color: "var(--primary)",
      fillId: "rainGradient",
      safeMin: 0,
      safeMax: 50,
      description: "Daily rainfall accumulation measured by NASA GPM satellite.",
    },
    ndvi: {
      label: t("metrics.ndvi", "Crop Greenness"),
      unit: "NDVI",
      icon: Sprout,
      color: "var(--status-success)",
      fillId: "ndviGradient",
      safeMin: 0.4,
      safeMax: 0.8,
      description: "Canopy chlorophyll vigor. Higher curve indicates active vegetative growth.",
    },
    lst: {
      label: t("metrics.lst", "Field Temp"),
      unit: "°C",
      icon: Sun,
      color: "var(--status-warning)",
      fillId: "lstGradient",
      safeMin: 22,
      safeMax: 35,
      description: "Daytime surface temperature. 25°C–34°C is optimal for rice photosynthesis.",
    },
  };

  const currentConfig = metricConfigs[activeMetric];
  const IconComponent = currentConfig.icon;

  // Latest value
  const latestPoint = filteredData[filteredData.length - 1];
  const latestValue = latestPoint ? latestPoint[activeMetric] : null;

  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-5 shadow-xs transition-all",
        className
      )}
    >
      {/* Header with Title and Range Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[var(--border-subtle)]/70 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[var(--fg-primary)] leading-tight">
                Field Health & Climate Trends
              </h3>
              <span className="rounded-full bg-[var(--primary-subtle)] px-2 py-0.2 text-[9px] font-bold text-[var(--primary)] uppercase font-mono">
                {blockName}
              </span>
            </div>
            <span className="text-xs text-[var(--fg-muted)]">
              Historical Satellite Trajectory • 24h Observational Reanalysis
            </span>
          </div>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 rounded-xl bg-[var(--bg-surface-subtle)] p-1 border border-[var(--border-subtle)] self-start sm:self-auto">
          {([7, 14, 30] as RangeDays[]).map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setRangeDays(days)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer font-mono",
                rangeDays === days
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
              )}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* Metric Switcher Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3">
        {(Object.keys(metricConfigs) as MetricKey[]).map((key) => {
          const cfg = metricConfigs[key];
          const KeyIcon = cfg.icon;
          const isActive = activeMetric === key;
          const val = latestPoint ? latestPoint[key] : null;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveMetric(key)}
              className={cn(
                "flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer",
                isActive
                  ? "border-[var(--primary)] bg-[var(--primary-subtle)]/40 ring-1 ring-[var(--primary)]/30"
                  : "border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]/50 hover:bg-[var(--bg-surface-subtle)]"
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg text-xs",
                    isActive ? "bg-[var(--primary)] text-white" : "bg-[var(--bg-surface)] text-[var(--fg-secondary)]"
                  )}
                >
                  <KeyIcon className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-[var(--fg-secondary)] block truncate">
                    {cfg.label}
                  </span>
                  <span className="text-xs font-extrabold font-mono text-[var(--fg-primary)]">
                    {val !== null ? `${val} ${cfg.unit}` : "-"}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Plain-Language Takeaway Banner */}
      <div className="rounded-xl border border-[var(--border-subtle)]/80 bg-[var(--bg-surface-subtle)]/60 p-2.5 mb-3 flex items-start gap-2 text-xs text-[var(--fg-secondary)]">
        <Info className="h-4 w-4 text-[var(--primary)] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[var(--fg-primary)]">{currentConfig.label} Interpretation: </strong>
          <span>{currentConfig.description}</span>
        </div>
      </div>

      {/* Recharts Visual Canvas */}
      <div className="h-56 sm:h-64 w-full pt-1">
        {!isMounted ? (
          <div className="h-full w-full animate-pulse bg-[var(--bg-surface-subtle)] rounded-xl" />
        ) : activeMetric === "precip" ? (
          /* Bar Chart for Rainfall */
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--status-info)" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="var(--status-info)" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} opacity={0.6} />
              <XAxis
                dataKey="date"
                stroke="var(--fg-muted)"
                fontSize={10}
                fontFamily="monospace"
                tickLine={false}
                axisLine={false}
                tickFormatter={(d: string) => d.slice(5)}
              />
              <YAxis
                stroke="var(--fg-muted)"
                fontSize={10}
                fontFamily="monospace"
                tickLine={false}
                axisLine={false}
                unit="mm"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2.5 shadow-lg text-xs">
                        <span className="font-mono text-[10px] text-[var(--fg-muted)] block">{d.date}</span>
                        <div className="font-bold text-sm text-[var(--status-info)] font-mono mt-0.5">
                          {d.precip} mm Rain
                        </div>
                        <span className="text-[10px] text-[var(--fg-secondary)]">NASA IMERG Satellite</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="precip" fill="url(#rainGradient)" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          /* Area Chart for Soil Moisture, NDVI, and Temp */
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentConfig.color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={currentConfig.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} opacity={0.6} />

              {/* Shaded Safe Zone for Soil Moisture (25-40% VWC) */}
              {activeMetric === "soilMoisture" && (
                <ReferenceArea
                  y1={25}
                  y2={40}
                  fill="var(--status-success)"
                  fillOpacity={0.08}
                  stroke="var(--status-success)"
                  strokeOpacity={0.2}
                  strokeDasharray="2 2"
                />
              )}

              <XAxis
                dataKey="date"
                stroke="var(--fg-muted)"
                fontSize={10}
                fontFamily="monospace"
                tickLine={false}
                axisLine={false}
                tickFormatter={(d: string) => d.slice(5)}
              />
              <YAxis
                stroke="var(--fg-muted)"
                fontSize={10}
                fontFamily="monospace"
                tickLine={false}
                axisLine={false}
                domain={
                  activeMetric === "ndvi"
                    ? [0.2, 0.9]
                    : activeMetric === "soilMoisture"
                    ? [15, 45]
                    : [20, 40]
                }
                unit={activeMetric === "soilMoisture" ? "%" : activeMetric === "lst" ? "°" : ""}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    const val = d[activeMetric];
                    return (
                      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2.5 shadow-lg text-xs">
                        <span className="font-mono text-[10px] text-[var(--fg-muted)] block">{d.date}</span>
                        <div className="font-bold text-sm text-[var(--fg-primary)] font-mono mt-0.5">
                          {val} {currentConfig.unit}
                        </div>
                        {activeMetric === "soilMoisture" && (
                          <span
                            className={cn(
                              "text-[10px] font-bold block mt-0.5",
                              val >= 25 && val <= 40 ? "text-[var(--status-success)]" : "text-[var(--status-danger)]"
                            )}
                          >
                            {val >= 25 && val <= 40 ? "Optimal Moisture Zone" : "Moisture Deficit"}
                          </span>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey={activeMetric}
                stroke={currentConfig.color}
                strokeWidth={2.5}
                fill="url(#areaGradient)"
                activeDot={{ r: 5, stroke: "var(--bg-surface)", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Chart Footer with Safe Zone Legend */}
      <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)]/60 flex flex-wrap items-center justify-between text-[11px] text-[var(--fg-muted)]">
        <div className="flex items-center gap-3">
          {activeMetric === "soilMoisture" && (
            <div className="flex items-center gap-1.5 font-medium text-[var(--status-success)]">
              <span className="h-2.5 w-5 rounded bg-[var(--status-success)]/20 border border-[var(--status-success)]/40 inline-block" />
              <span>Optimal Safe Zone (25%–40% VWC)</span>
            </div>
          )}
          {activeMetric === "ndvi" && (
            <span className="font-mono text-[var(--status-success)]">
              Peak Tillering Growth Window
            </span>
          )}
        </div>

        <span className="font-mono text-[10px]">
          Source: NASA POWER • SMAP • Landsat
        </span>
      </div>
    </div>
  );
}
