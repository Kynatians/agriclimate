"use client";

import * as React from "react";
import { Layers, ArrowRight, Check } from "lucide-react";
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
              Kurigram Regional Field Radar
            </h4>
            <span className="text-[11px] text-[var(--fg-muted)]">
              Quick Block Switcher • Satellite Soil Moisture Watch
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-3.5">
        {blocks.map((block) => {
          const m = metricsMap[block.id];
          const isSelected = block.id === activeBlockId;
          const isCritical = m && (m.cwsi > 0.65 || m.floodScore > 0.65 || m.soilMoistureSurface.value < 25);
          const isStressed = m && (m.cwsi > 0.5 || m.soilMoistureSurface.value < 30);

          const statusColor = isCritical
            ? "border-[var(--status-danger)]/60 bg-[var(--status-danger-bg)]/20 text-[var(--status-danger)]"
            : isStressed
            ? "border-[var(--status-warning)]/60 bg-[var(--status-warning-bg)]/20 text-[var(--status-warning)]"
            : "border-[var(--status-success)]/60 bg-[var(--status-success-bg)]/20 text-[var(--status-success)]";

          return (
            <button
              key={block.id}
              type="button"
              onClick={() => onSelectBlock(block.id)}
              className={cn(
                "relative flex flex-col justify-between p-2.5 rounded-xl border text-left transition-all hover:scale-102 cursor-pointer",
                isSelected
                  ? "border-[var(--primary)] bg-[var(--primary-subtle)]/50 ring-2 ring-[var(--primary)]/30"
                  : "border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]/60 hover:bg-[var(--bg-surface-subtle)]"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[var(--fg-muted)] truncate max-w-[70px]">
                  {block.subDistrict}
                </span>
                {isSelected && (
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--primary)] text-white text-[9px]">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                )}
              </div>

              <div className="font-bold text-xs text-[var(--fg-primary)] truncate mt-1">
                {block.name}
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] font-mono pt-1 border-t border-[var(--border-subtle)]/50">
                <span className="text-[var(--fg-muted)]">
                  {m ? `${m.soilMoistureSurface.value.toFixed(0)}%` : "-"}
                </span>
                <span className={cn("font-bold px-1 rounded text-[9px]", statusColor)}>
                  {isCritical ? "DEFICIT" : isStressed ? "WATCH" : "SAFE"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
