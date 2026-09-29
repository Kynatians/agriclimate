"use client";

import * as React from "react";
import { Calendar, Droplets, Sun, AlertTriangle, CheckCircle2, ChevronRight, Sparkles, Clock, Compass } from "lucide-react";
import { useTranslation } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

interface CropCalendarStage {
  stage: string;
  window: string;
  status: "completed" | "active" | "upcoming";
  riskLabel: string;
  riskSeverity: "low" | "medium" | "high";
  irrigationAction: string;
  solarMetric: string;
  advisoryNote: string;
}

const DEMO_CALENDAR_STAGES: CropCalendarStage[] = [
  {
    stage: "Seedbed Preparation & Sowing",
    window: "Oct 14 – Oct 24",
    status: "active",
    riskLabel: "Low Risk Window (83% Safe)",
    riskSeverity: "low",
    irrigationAction: "Light pre-sowing soaking (25mm equivalent)",
    solarMetric: "18.5 MJ/m² • 26°C avg soil temp",
    advisoryNote: "Optimum daytime solar irradiance with favorable soil temperature for maximum germination rate. Avoid cold night exposure.",
  },
  {
    stage: "Transplanting & Seedling Establishment",
    window: "Nov 01 – Nov 12",
    status: "upcoming",
    riskLabel: "Moderate Monsoon Tail Risk",
    riskSeverity: "medium",
    irrigationAction: "Maintain 2–3 cm standing water depth",
    solarMetric: "17.2 MJ/m² • 23°C avg air temp",
    advisoryNote: "Clear drainage furrows prior to transplanting to prevent seedling dislodgement from sudden convective showers.",
  },
  {
    stage: "Active Tillering & Vegetative Growth",
    window: "Nov 20 – Dec 15",
    status: "upcoming",
    riskLabel: "Cool Night Thermal Advisory",
    riskSeverity: "low",
    irrigationAction: "Scheduled solar pump irrigation every 5 days",
    solarMetric: "16.0 MJ/m² • 18°C night low",
    advisoryNote: "Apply first top-dress urea split during active tillering in moist soil conditions. Keep soil well-aerated between waterings.",
  },
  {
    stage: "Panicle Initiation & Flowering",
    window: "Jan 05 – Jan 25",
    status: "upcoming",
    riskLabel: "Critical Water Stress Window",
    riskSeverity: "high",
    irrigationAction: "Mandatory continuous irrigation (5 cm depth)",
    solarMetric: "15.4 MJ/m² • High evaporative sensitivity",
    advisoryNote: "Paddy is acutely sensitive to moisture deficit during pollination. Soil drying causes spikelet sterility and major yield drops.",
  },
  {
    stage: "Ripening & Harvesting Window",
    window: "Feb 20 – Mar 10",
    status: "upcoming",
    riskLabel: "Low Risk Dry Winter Harvest",
    riskSeverity: "low",
    irrigationAction: "Cease all irrigation 10 days before harvest",
    solarMetric: "19.8 MJ/m² • Favorable drying sunshine",
    advisoryNote: "Dry field conditions facilitate rapid grain moisture equilibration. Harvest when 85% of panicles turn golden brown.",
  },
];

export function CropCalendarView({ className }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Top Header Card */}
      <div className="rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-[var(--border-subtle)]/70 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary-subtle)] text-[var(--primary)] shrink-0">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-[var(--fg-primary)] leading-tight">
                  Seasonal Crop Calendar & Climate Risk Horizons
                </h3>
                <span className="rounded-full bg-[var(--status-success-bg)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--status-success)] border border-[var(--status-success)]/30">
                  Rabi 2026/27
                </span>
              </div>
              <span className="text-xs text-[var(--fg-muted)]">
                Boro Rice Production Cycle (Kurigram Agro-Ecological Zone • 20-Year NASA Reanalysis)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-[var(--bg-surface-subtle)] px-3 py-1.5 text-xs font-mono text-[var(--fg-secondary)] border border-[var(--border-subtle)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--status-success)]" />
              <span>Climate Safety: <strong>83% Favorable</strong></span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-[var(--primary-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--primary)]">
              <Clock className="h-3.5 w-3.5" />
              <span>Current Stage: Seedbed Sowing</span>
            </div>
          </div>
        </div>

        {/* Horizontal Visual Season Step Tracker across the top */}
        <div className="my-5 overflow-x-auto pb-2">
          <div className="flex items-center justify-between min-w-[650px] gap-2">
            {DEMO_CALENDAR_STAGES.map((s, idx) => {
              const isActive = s.status === "active";
              return (
                <div key={s.stage} className="flex-1 flex flex-col items-center text-center relative">
                  {idx !== 0 && (
                    <div
                      className={cn(
                        "absolute right-1/2 left-[-50%] top-3.5 h-1 -translate-y-1/2 z-0",
                        idx === 1 ? "bg-[var(--primary)]" : "bg-[var(--border-subtle)]"
                      )}
                    />
                  )}
                  <div
                    className={cn(
                      "relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold font-mono transition-all",
                      isActive
                        ? "bg-[var(--primary)] text-white ring-4 ring-[var(--primary)]/20 shadow-xs"
                        : "bg-[var(--bg-surface-subtle)] text-[var(--fg-muted)] border border-[var(--border-strong)]"
                    )}
                  >
                    {idx + 1}
                  </div>
                  <span className={cn(
                    "text-[11px] font-bold mt-1.5 max-w-[120px] leading-tight",
                    isActive ? "text-[var(--primary)]" : "text-[var(--fg-secondary)]"
                  )}>
                    {s.stage.split("&")[0]}
                  </span>
                  <span className="text-[10px] text-[var(--fg-muted)] font-mono mt-0.5">
                    {s.window}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Responsive Grid of Detailed Stage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {DEMO_CALENDAR_STAGES.map((stage, idx) => {
          const isCurrent = stage.status === "active";
          const riskColor =
            stage.riskSeverity === "high"
              ? "bg-[var(--status-danger-bg)] text-[var(--status-danger)] border-[var(--status-danger)]/40"
              : stage.riskSeverity === "medium"
              ? "bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning)]/40"
              : "bg-[var(--status-success-bg)] text-[var(--status-success)] border-[var(--status-success)]/40";

          return (
            <div
              key={stage.stage}
              className={cn(
                "flex flex-col justify-between rounded-2xl p-5 border-2 transition-all",
                isCurrent
                  ? "border-[var(--primary)] bg-[var(--bg-surface)] shadow-md ring-2 ring-[var(--primary)]/20"
                  : "border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xs hover:border-[var(--primary)]/40"
              )}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-lg text-xs font-mono font-bold",
                      isCurrent ? "bg-[var(--primary)] text-white" : "bg-[var(--bg-surface-subtle)] text-[var(--fg-muted)]"
                    )}>
                      #{idx + 1}
                    </span>
                    <h4 className="text-base font-bold text-[var(--fg-primary)] leading-tight">
                      {stage.stage}
                    </h4>
                  </div>

                  {isCurrent && (
                    <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider shrink-0">
                      Active
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[var(--fg-secondary)] mb-3">
                  <Calendar className="h-3.5 w-3.5 text-[var(--primary)]" />
                  <span>{stage.window}</span>
                </div>

                {/* Risk Level Badge */}
                <div className="mb-3">
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold", riskColor)}>
                    {stage.riskSeverity === "high" ? (
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <span>{stage.riskLabel}</span>
                  </span>
                </div>

                {/* Scheduled Actions */}
                <div className="space-y-2 text-xs pt-3 border-t border-[var(--border-subtle)]/70">
                  <div className="flex items-start gap-2 text-[var(--fg-secondary)]">
                    <Droplets className="h-4 w-4 text-[var(--status-info)] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[var(--fg-primary)]">Irrigation Action:</strong>
                      <div className="mt-0.5 text-[var(--fg-secondary)]">{stage.irrigationAction}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-[var(--fg-secondary)]">
                    <Sun className="h-4 w-4 text-[var(--status-warning)] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[var(--fg-primary)]">NASA Weather Metric:</strong>
                      <div className="mt-0.5 font-mono text-[var(--fg-muted)]">{stage.solarMetric}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agronomic advisory note */}
              <div className="mt-4 rounded-xl bg-[var(--bg-surface-subtle)] p-3 text-xs text-[var(--fg-secondary)] leading-relaxed border border-[var(--border-subtle)]/60">
                {stage.advisoryNote}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
