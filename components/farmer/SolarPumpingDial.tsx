"use client";

import * as React from "react";
import { Sun, Zap, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface SolarPumpingDialProps {
  needsIrrigation: boolean;
  recommendedHours?: string;
  durationHours?: number;
  dieselSavedLiters?: number;
  className?: string;
}

export function SolarPumpingDial({
  needsIrrigation,
  recommendedHours = "17:30 – 19:30",
  durationHours = 2,
  dieselSavedLiters = 3.2,
  className,
}: SolarPumpingDialProps) {
  return (
    <div className={cn("rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]/70 p-3", className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--fg-primary)]">
          <Sun className="h-3.5 w-3.5 text-amber-500" />
          <span>Solar Pumping Window</span>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
          <Zap className="h-2.5 w-2.5" />
          Saves {dieselSavedLiters}L Diesel
        </span>
      </div>

      {/* Visual Daytime Sunlight Ribbon */}
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2.5">
        <div className="flex items-center justify-between text-[10px] text-[var(--fg-muted)] font-mono mb-1.5">
          <span>🌅 06:00 (Dawn)</span>
          <span className="text-amber-500 font-bold">☀️ 12:00 (Peak Sun)</span>
          <span>🌇 19:30 (Dusk)</span>
        </div>

        {/* 24-hr Bar with Highlighted Solar Run Window */}
        <div className="relative h-5 w-full rounded-md bg-[var(--bg-surface-subtle)] overflow-hidden flex items-center border border-[var(--border-subtle)]">
          {/* Morning Sun Zone */}
          <div className="h-full w-[35%] bg-amber-400/10 flex items-center justify-center text-[8px] font-mono text-[var(--fg-muted)]">
            Morning Solar
          </div>
          {/* Midday Heat (Avoid Pumping) */}
          <div className="h-full w-[40%] bg-amber-500/20 flex items-center justify-center text-[8px] font-mono text-amber-700 dark:text-amber-400">
            Midday Heat Loss
          </div>
          {/* Recommended Evening Solar Pumping Window */}
          <div
            className={cn(
              "h-full w-[25%] flex items-center justify-center text-[9px] font-bold font-mono transition-all animate-pulse",
              needsIrrigation
                ? "bg-emerald-500 text-white shadow-xs"
                : "bg-emerald-500/30 text-emerald-700 dark:text-emerald-300"
            )}
          >
            {needsIrrigation ? "PUMP" : "OFF"}
          </div>
        </div>

        {/* Action Callout */}
        <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]/60 text-xs">
          {needsIrrigation ? (
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500 text-white shrink-0">
                <Clock className="h-3.5 w-3.5" />
              </span>
              <div>
                <span className="font-bold text-[var(--fg-primary)] block leading-tight">
                  Run Pump: {recommendedHours}
                </span>
                <span className="text-[10px] text-[var(--fg-muted)]">
                  {durationHours} Hours solar pumping before sunset
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </span>
              <div>
                <span className="font-bold text-[var(--fg-primary)] block leading-tight">
                  No Pumping Needed Today
                </span>
                <span className="text-[10px] text-[var(--fg-muted)]">
                  Groundwater preserved • Next check in 48h
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
