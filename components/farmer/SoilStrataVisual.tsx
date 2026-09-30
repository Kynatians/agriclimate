"use client";

import * as React from "react";
import { Droplets, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SoilStrataVisualProps {
  surfaceMoisture: number; // % VWC
  rootZoneMoisture?: number; // % VWC
  needsIrrigation: boolean;
  className?: string;
}

export function SoilStrataVisual({
  surfaceMoisture,
  rootZoneMoisture = surfaceMoisture + 4,
  needsIrrigation,
  className,
}: SoilStrataVisualProps) {
  // Determine hydration zone:
  // < 22%: Deficit/Thirsty (Red)
  // 22% - 38%: Ideal/Comfort (Green)
  // > 38%: Saturated/Wet (Blue)
  const isDeficit = rootZoneMoisture < 23 || needsIrrigation;
  const isSaturated = rootZoneMoisture > 38;
  const isIdeal = !isDeficit && !isSaturated;

  const moisturePercent = Math.min(100, Math.max(10, Math.round(rootZoneMoisture * 2.2)));

  return (
    <div className={cn("rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]/70 p-3", className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--fg-primary)]">
          <Droplets className="h-3.5 w-3.5 text-[var(--status-info)]" />
          <span>Soil Hydration Depth Gauge</span>
        </div>
        <span
          className={cn(
            "flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono uppercase",
            isDeficit
              ? "bg-[var(--status-danger-bg)] text-[var(--status-danger)] border border-[var(--status-danger)]/30"
              : isIdeal
              ? "bg-[var(--status-success-bg)] text-[var(--status-success)] border border-[var(--status-success)]/30"
              : "bg-[var(--status-info-bg)] text-[var(--status-info)] border border-[var(--status-info)]/30"
          )}
        >
          {isDeficit ? (
            <>
              <AlertCircle className="h-2.5 w-2.5" /> Thirsty Soil
            </>
          ) : isIdeal ? (
            <>
              <CheckCircle2 className="h-2.5 w-2.5" /> Optimal Moisture
            </>
          ) : (
            <>
              <Droplets className="h-2.5 w-2.5" /> Heavy Wet
            </>
          )}
        </span>
      </div>

      {/* Cross-section Visual Meter */}
      <div className="relative overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2.5 space-y-2">
        {/* Topsoil Layer (0 - 5 cm) */}
        <div>
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="font-medium text-[var(--fg-muted)]">Topsoil (0–5 cm)</span>
            <span className="font-mono font-bold text-[var(--fg-secondary)]">{surfaceMoisture.toFixed(0)}% VWC</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-amber-950/10 dark:bg-amber-100/10 overflow-hidden relative">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                surfaceMoisture < 20
                  ? "bg-amber-600"
                  : surfaceMoisture <= 35
                  ? "bg-emerald-500"
                  : "bg-sky-500"
              )}
              style={{ width: `${Math.min(100, Math.max(10, surfaceMoisture * 2.3))}%` }}
            />
          </div>
        </div>

        {/* Root-Zone Layer (5 - 20 cm) with Root Illustration */}
        <div className="pt-1 border-t border-[var(--border-subtle)]/60">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="font-medium text-[var(--fg-muted)] flex items-center gap-1">
              <span>🌾 Root-Zone (5–20 cm)</span>
            </span>
            <span className="font-mono font-bold text-[var(--fg-primary)]">{rootZoneMoisture.toFixed(0)}% VWC</span>
          </div>
          <div className="h-3 w-full rounded-full bg-amber-950/15 dark:bg-amber-100/15 overflow-hidden relative">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                isDeficit
                  ? "bg-rose-500"
                  : isIdeal
                  ? "bg-emerald-500"
                  : "bg-sky-500"
              )}
              style={{ width: `${moisturePercent}%` }}
            />
          </div>
        </div>

        {/* 3-Zone Reference Scale */}
        <div className="flex items-center justify-between text-[9px] font-mono text-[var(--fg-muted)] pt-0.5 px-0.5">
          <span className="text-rose-500 font-bold">● Dry (&lt;22%)</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">● Ideal (25-38%)</span>
          <span className="text-sky-600 dark:text-sky-400 font-bold">● Saturated (&gt;38%)</span>
        </div>
      </div>
    </div>
  );
}
