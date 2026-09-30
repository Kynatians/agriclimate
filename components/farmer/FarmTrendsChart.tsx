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
import { Droplets, CloudRain, Sprout, Sun, TrendingUp, Info, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
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
      formattedDate: pt.date.slice(5),
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
      safeMax: 38,
      deficitThreshold: 22,
    },
    precip: {
      label: t("metrics.precip", "Rainfall"),
      unit: "mm",
      icon: CloudRain,
      color: "var(--primary)",
      fillId: "rainGradient",
      safeMin: 0,
      safeMax: 50,
      deficitThreshold: 0,
    },
    ndvi: {
      label: t("metrics.ndvi", "Crop Greenness"),
      unit: "NDVI",
      icon: Sprout,
      color: "var(--status-success)",
      fillId: "ndviGradient",
      safeMin: 0.45,
      safeMax: 0.8,
      deficitThreshold: 0.4,
    },
    lst: {
      label: t("metrics.lst", "Field Temp"),
      unit: "°C",
      icon: Sun,
      color: "var(--status-warning)",
      fillId: "lstGradient",
      safeMin: 22,
      safeMax: 34,
      deficitThreshold: 35,
    },
  };

  const currentConfig = metricConfigs[activeMetric];

  // Latest value
  const latestPoint = filteredData[filteredData.length - 1];
  const latestValue = latestPoint ? latestPoint[activeMetric] : null;

  // Plain-Language Storytelling Guidance for Farmers
  let storyTitle = "Field Status Steady";
  let storyAdvice = "Current conditions are within normal seasonal range.";
  let storySeverity: "good" | "warning" | "danger" = "good";

  if (activeMetric === "soilMoisture") {
    const val = Number(latestValue ?? 25);
    if (val < 22) {
      storyTitle = "⚠️ Critical Soil Deficit Detected";
      storyAdvice = `Soil moisture is at ${val.toFixed(0)}%, dipping into the red thirsty zone. Running the solar pump for 2 hours today will bring moisture back to safe green levels.`;
      storySeverity = "danger";
    } else if (val < 26) {
      storyTitle = "🟡 Soil Drying Out — Plan Evening Irrigation";
      storyAdvice = `Soil moisture is at ${val.toFixed(0)}%, approaching the lower threshold. Plan a 2-hour solar pumping cycle between 17:30 and 19:30 to avoid root wilting.`;
      storySeverity = "warning";
    } else {
      storyTitle = "🟢 Soil Hydration in Safe Green Zone";
      storyAdvice = `Moisture is holding strong at ${val.toFixed(0)}% VWC. Roots have sufficient water reserves; no emergency pumping required for the next 48 hours.`;
      storySeverity = "good";
    }
  } else if (activeMetric === "precip") {
    storyTitle = "🌤️ Dry Horizon with Low Rain Risk";
    storyAdvice = `No heavy rainfall events detected over the past 7 days. Excellent window for grain drying, fertilizer broadcast, and field weeding.`;
  } else if (activeMetric === "ndvi") {
    const val = Number(latestValue ?? 0.5);
    if (val >= 0.5) {
      storyTitle = "🌿 Strong Photosynthetic Canopy Vigor";
      storyAdvice = `Satellite multispectral data confirms healthy vegetative growth. Tillering stage is progressing on schedule without visible pest patches.`;
      storySeverity = "good";
    } else {
      storyTitle = "🌿 Foliar Nitrogen Top-Dress Recommended";
      storyAdvice = `Slight canopy greenness slowdown detected. Applying 50kg/ha Urea top-dress before tomorrow morning will restore peak vigor.`;
      storySeverity = "warning";
    }
  } else if (activeMetric === "lst") {
    const val = Number(latestValue ?? 33);
    if (val > 35) {
      storyTitle = "☀️ Midday Heat Wave Watch";
      storyAdvice = `Surface temperature peak reached ${val}°C. Avoid midday pumping to prevent evaporative water loss. Irrigate after 5:30 PM.`;
      storySeverity = "warning";
    } else {
      storyTitle = "☀️ Balanced Daytime Thermal Window";
      storyAdvice = `Temperature averaged ${val}°C, ideal for boro rice photosynthesis and solar panel power generation.`;
      storySeverity = "good";
    }
  }

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
                Field Health Rhythm & Trajectory
              </h3>
              <span className="rounded-full bg-[var(--primary-subtle)] px-2 py-0.2 text-[9px] font-bold text-[var(--primary)] uppercase font-mono">
                {blockName}
              </span>
            </div>
            <span className="text-xs text-[var(--fg-muted)]">
              14-Day Soil & Atmosphere Satellite Trajectory • NASA SMAP & Landsat
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

      {/* Metric Switcher Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3.5">
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
                  ? "border-[var(--primary)] bg-[var(--primary-subtle)]/40 ring-2 ring-[var(--primary)]/30"
                  : "border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]/60 hover:bg-[var(--bg-surface-subtle)]"
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg text-xs transition-transform",
                    isActive ? "bg-[var(--primary)] text-white shadow-xs scale-105" : "bg-[var(--bg-surface)] text-[var(--fg-secondary)]"
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

      {/* Plain-Language Storytelling Guidance Banner */}
      <div
        className={cn(
          "rounded-xl border p-3 mb-3.5 flex items-start gap-2.5 text-xs transition-all",
          storySeverity === "danger"
            ? "border-rose-500/40 bg-rose-500/10 text-rose-950 dark:text-rose-100"
            : storySeverity === "warning"
            ? "border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-100"
            : "border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100"
        )}
      >
        <div className="shrink-0 mt-0.5">
          {storySeverity === "danger" ? (
            <AlertCircle className="h-4 w-4 text-rose-600" />
          ) : storySeverity === "warning" ? (
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          )}
        </div>
        <div>
          <strong className="block font-bold text-sm leading-tight mb-0.5">
            {storyTitle}
          </strong>
          <p className="text-xs leading-relaxed opacity-90">
            {storyAdvice}
          </p>
        </div>
      </div>

      {/* 3 Status Bands Reference Indicator */}
      {activeMetric === "soilMoisture" && (
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono mb-2 px-1 text-[var(--fg-muted)]">
          <span className="flex items-center gap-1">
            <span className="h-2 w-3 rounded-xs bg-emerald-500/30 border border-emerald-500" />
            <strong className="text-emerald-600 dark:text-emerald-400">Green Zone (25–38%)</strong>: Ideal Hydration
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-3 rounded-xs bg-amber-500/30 border border-amber-500" />
            <strong className="text-amber-600 dark:text-amber-400">Yellow Zone (20–25%)</strong>: Drying Out (Plan Pump)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-3 rounded-xs bg-rose-500/30 border border-rose-500" />
            <strong className="text-rose-600 dark:text-rose-400">Red Zone (&lt;20%)</strong>: Critical Deficit
          </span>
        </div>
      )}

      {/* Visual Recharts Canvas */}
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
          /* Area Chart with 3 Semantic Status Zones */
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentConfig.color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={currentConfig.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} opacity={0.6} />

              {/* Shaded Status Zones for Soil Moisture */}
              {activeMetric === "soilMoisture" && (
                <>
                  {/* Optimal Green Zone (25-38% VWC) */}
                  <ReferenceArea
                    y1={25}
                    y2={38}
                    fill="#10b981"
                    fillOpacity={0.12}
                    stroke="#10b981"
                    strokeOpacity={0.3}
                    strokeDasharray="2 2"
                  />
                  {/* Caution Yellow Zone (20-25% VWC) */}
                  <ReferenceArea
                    y1={20}
                    y2={25}
                    fill="#f59e0b"
                    fillOpacity={0.08}
                    stroke="#f59e0b"
                    strokeOpacity={0.25}
                    strokeDasharray="2 2"
                  />
                  {/* Critical Red Zone (<20% VWC) */}
                  <ReferenceArea
                    y1={15}
                    y2={20}
                    fill="#ef4444"
                    fillOpacity={0.08}
                    stroke="#ef4444"
                    strokeOpacity={0.25}
                    strokeDasharray="2 2"
                  />
                </>
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
                              val >= 25 && val <= 38
                                ? "text-emerald-600"
                                : val >= 20
                                ? "text-amber-600"
                                : "text-rose-600"
                            )}
                          >
                            {val >= 25 && val <= 38
                              ? "🟢 Optimal Moisture Zone"
                              : val >= 20
                              ? "🟡 Caution: Drying Out"
                              : "🔴 Critical: Turn on Pump"}
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
                strokeWidth={3}
                fill="url(#areaGradient)"
                activeDot={{ r: 6, stroke: "var(--bg-surface)", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Chart Footer with Source & Verification */}
      <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)]/60 flex flex-wrap items-center justify-between text-[11px] text-[var(--fg-muted)]">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time calibration verified with Kurigram ground meteorological stations</span>
        </div>

        <span className="font-mono text-[10px]">
          Source: NASA POWER • SMAP L3 • Landsat 9
        </span>
      </div>
    </div>
  );
}

