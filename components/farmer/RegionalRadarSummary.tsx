"use client";

import * as React from "react";
import { Layers, ArrowRight, Check, Droplets } from "lucide-react";
import { Block, BlockMetrics } from "@/lib/dal/types";
import { cn } from "@/lib/utils";

interface RegionalRadarSummaryProps {
  blocks: Block[];
  metricsMap: Record<string, BlockMetrics>;
  activeBlockId: string;
  onSelectBlock: (blockId: string) => void;
  onOpenMapTab: () => void;
  className?: string;
}

export function RegionalRadarSummary({
  blocks,
  metricsMap,
  activeBlockId,
  onSelectBlock,
  onOpenMapTab,
  className,
}: RegionalRadarSummaryProps) {
  // Helper to get crop icon
  const getCropIcon = (cropId?: string | null) => {
    if (!cropId) return "🌾";
    const lower = cropId.toLowerCase();
    if (lower.includes("potato")) return "🥔";
    if (lower.includes("maize") || lower.includes("corn")) return "🌽";
    if (lower.includes("jute")) return "🌿";
    if (lower.includes("mung") || lower.includes("lentil") || lower.includes("pulse")) return "🌱";
    if (lower.includes("wheat")) return "🌾";
    return "🌾";
  };

  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-5 shadow-xs transition-all",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[var(--border-subtle)]/70 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] shrink-0">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--fg-primary)] leading-tight">
              Kurigram Regional Field Radar (Neighborhood Plots)
            </h4>
            <span className="text-[11px] text-[var(--fg-muted)]">
              Quick Block Switcher • Satellite Hydration & Soil Watch
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenMapTab}
          className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
        >
          <span>Open Full Interactive GIS Map</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Blocks Selector Grid / Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-3.5">
        {blocks.map((block) => {
          const m = metricsMap[block.id];
          const isSelected = block.id === activeBlockId;
          const isCritical = m && (m.cwsi > 0.65 || m.floodScore > 0.65 || m.soilMoistureSurface.value < 22);
          const isStressed = m && (m.cwsi > 0.5 || m.soilMoistureSurface.value < 26);
          const soilVal = m ? m.soilMoistureSurface.value : 25;

          const statusColor = isCritical
            ? "border-rose-500/40 bg-rose-500/15 text-rose-600 dark:text-rose-400"
            : isStressed
            ? "border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-400"
            : "border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400";

          return (
            <button
              key={block.id}
              type="button"
              onClick={() => onSelectBlock(block.id)}
              className={cn(
                "group relative flex flex-col justify-between p-3 rounded-xl border text-left transition-all hover:scale-102 cursor-pointer",
                isSelected
                  ? "border-[var(--primary)] bg-[var(--primary-subtle)]/50 ring-2 ring-[var(--primary)]/40 shadow-sm"
                  : "border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]/70 hover:bg-[var(--bg-surface-subtle)]"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-medium text-[var(--fg-muted)] truncate max-w-[70px]">
                  {block.subDistrict}
                </span>
                {isSelected ? (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--primary)] text-white text-[9px] shadow-xs">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                ) : (
                  <span className="text-xs">{getCropIcon(block.primaryCrop)}</span>
                )}
              </div>

              <div className="font-bold text-xs text-[var(--fg-primary)] truncate mt-1">
                {block.name}
              </div>

              {/* Mini Soil Water Fill Bar */}
              <div className="mt-2.5 space-y-1">
                <div className="h-1.5 w-full rounded-full bg-[var(--bg-surface)] overflow-hidden border border-[var(--border-subtle)]/60">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      isCritical ? "bg-rose-500" : isStressed ? "bg-amber-500" : "bg-emerald-500"
                    )}
                    style={{ width: `${Math.min(100, Math.max(15, soilVal * 2.5))}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono pt-0.5">
                  <span className="text-[var(--fg-muted)] flex items-center gap-0.5">
                    <Droplets className="h-2.5 w-2.5 text-sky-500" />
                    {soilVal.toFixed(0)}%
                  </span>
                  <span className={cn("font-bold px-1 rounded text-[8px] uppercase", statusColor)}>
                    {isCritical ? "DEFICIT" : isStressed ? "WATCH" : "SAFE"}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

