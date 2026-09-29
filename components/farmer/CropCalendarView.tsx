"use client";

import * as React from "react";
import { Calendar, Droplets, Sun, AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

interface CropCalendarStage {
  stage: string;
  window: string;
  status: "completed" | "active" | "upcoming";
  riskLabel: string;
  riskSeverity: "low" | "medium" | "high";
  irrigationAction: string;
  advisoryNote: string;
}

const DEMO_CALENDAR_STAGES: CropCalendarStage[] = [
  {
    stage: "Seedbed Preparation & Sowing",
    window: "Oct 14 – Oct 24",
    status: "active",
    riskLabel: "Historically Low Risk Window (83% Safe)",
    riskSeverity: "low",
    irrigationAction: "Light pre-sowing soaking (25mm equivalent)",
    advisoryNote: "Optimum daytime solar irradiance (18.5 MJ/m²) with favorable soil temperature (26°C) for maximum germination rate.",
  },
  {
    stage: "Transplanting & Seedling Establishment",
    window: "Nov 01 – Nov 12",
    status: "upcoming",
    riskLabel: "Moderate Late-Monsoon Rain Risk",
    riskSeverity: "medium",
    irrigationAction: "Maintain 2–3 cm standing water depth",
    advisoryNote: "Clear drainage furrows prior to transplanting to prevent seedling dislodgement from sudden convective showers.",
  },
  {
    stage: "Active Tillering & Vegetative Growth",
    window: "Nov 20 – Dec 15",
    status: "upcoming",
    riskLabel: "Cool Night Thermal Advisory",
    riskSeverity: "low",
    irrigationAction: "Scheduled solar pump irrigation every 5 days",
    advisoryNote: "Apply first top-dress urea split during active tillering in moist soil conditions.",
  },
  {
    stage: "Panicle Initiation & Flowering",
    window: "Jan 05 – Jan 25",
    status: "upcoming",
    riskLabel: "Critical Water Stress Window",
    riskSeverity: "high",
    irrigationAction: "Mandatory continuous irrigation (5 cm depth)",
    advisoryNote: "Paddy is acutely sensitive to moisture deficit during pollination. Soil drying causes spikelet sterility.",
  },
  {
    stage: "Ripening & Harvesting Window",
    window: "Feb 20 – Mar 10",
    status: "upcoming",
    riskLabel: "Low Risk Dry Winter Harvest",
    riskSeverity: "low",
    irrigationAction: "Cease all irrigation 10 days before harvest",
    advisoryNote: "Dry field conditions facilitate mechanical harvesting and rapid grain moisture equilibration.",
  },
];

export function CropCalendarView({ className }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[var(--border-subtle)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)]">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--fg-primary)]">
                  Seasonal Crop Calendar
                </h3>
                <span className="text-xs text-[var(--fg-muted)]">
                  Boro Rice Cycle (Kurigram Agro-Ecological Zone)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto rounded-lg bg-[var(--bg-surface-subtle)] px-2.5 py-1 text-xs font-mono text-[var(--fg-secondary)] border border-[var(--border-subtle)]">
            <span className="h-2 w-2 rounded-full bg-[var(--status-success)]" />
            <span>Multi-Year NASA POWER Replay Model</span>
          </div>
        </div>

        {/* Timeline Stages */}
        <div className="mt-6 space-y-6">
          {DEMO_CALENDAR_STAGES.map((stage, idx) => {
            const isCurrent = stage.status === "active";
            const riskColor =
              stage.riskSeverity === "high"
                ? "bg-[var(--status-danger-bg)] text-[var(--status-danger)] border-[var(--status-danger)]/30"
                : stage.riskSeverity === "medium"
                ? "bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning)]/30"
                : "bg-[var(--status-success-bg)] text-[var(--status-success)] border-[var(--status-success)]/30";

            return (
              <div key={stage.stage} className="relative flex gap-4">
                {/* Vertical timeline spine */}
                {idx !== DEMO_CALENDAR_STAGES.length - 1 && (
                  <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-[var(--border-subtle)] -translate-x-1/2" />
                )}

                {/* Step badge */}
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold font-mono transition-all z-10",
                    isCurrent
                      ? "bg-[var(--primary)] text-white shadow-md ring-4 ring-[var(--primary)]/20"
                      : "bg-[var(--bg-surface-subtle)] text-[var(--fg-muted)] border border-[var(--border-strong)]"
                  )}
                >
                  {idx + 1}
                </div>

                {/* Stage Content */}
                <div
                  className={cn(
                    "flex-1 rounded-xl p-4 border transition-all",
                    isCurrent
                      ? "border-2 border-[var(--primary)] bg-[var(--bg-surface)] shadow-xs"
                      : "border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]/50"
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[var(--fg-primary)]">
                        {stage.stage}
                      </h4>
                      {isCurrent && (
                        <span className="rounded bg-[var(--primary)] px-1.5 py-0.2 text-[9px] font-bold text-white uppercase tracking-wider">
                          Current Stage
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-mono font-semibold text-[var(--fg-secondary)]">
                      {stage.window}
                    </span>
                  </div>

                  {/* Risk Badge */}
                  <div className="mb-3">
                    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold", riskColor)}>
                      {stage.riskSeverity === "high" ? (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      {stage.riskLabel}
                    </span>
                  </div>

                  {/* Scheduled Actions */}
                  <div className="space-y-1.5 text-xs text-[var(--fg-secondary)]">
                    <div className="flex items-start gap-1.5 font-medium">
                      <Droplets className="h-3.5 w-3.5 text-[var(--status-info)] shrink-0 mt-0.5" />
                      <span><strong>Irrigation:</strong> {stage.irrigationAction}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-[var(--fg-muted)]">
                      <Sun className="h-3.5 w-3.5 text-[var(--status-warning)] shrink-0 mt-0.5" />
                      <span>{stage.advisoryNote}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
