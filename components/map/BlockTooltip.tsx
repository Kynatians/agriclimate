"use client";

import * as React from "react";
import { Block, BlockMetrics } from "@/lib/dal/types";
import { LayerId } from "@/lib/stores/ui";
import { MAP_LAYERS } from "@/lib/map/layers";
import { SourceLabel } from "@/components/shared/SourceLabel";
import { cn } from "@/lib/utils";

interface BlockTooltipProps {
  block: Block;
  metrics?: BlockMetrics;
  activeLayerId: LayerId;
  x: number;
  y: number;
}

export function BlockTooltip({
  block,
  metrics,
  activeLayerId,
  x,
  y,
}: BlockTooltipProps) {
  const layer = MAP_LAYERS[activeLayerId] || MAP_LAYERS.ndvi;
  const activeValue = metrics ? layer.getValue(metrics) : null;
  const formattedActive = activeValue !== null ? layer.formatValue(activeValue) : "N/A";

  return (
    <div
      className={cn(
        "pointer-events-none absolute z-50 min-w-[200px] rounded-xl border-2 border-[var(--border-strong)] bg-[var(--bg-surface)] p-3 shadow-xl backdrop-blur-md transition-all text-xs"
      )}
      style={{
        left: `${x + 12}px`,
        top: `${y + 12}px`,
      }}
    >
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-1.5 mb-1.5">
        <div>
          <span className="text-[10px] uppercase font-mono text-[var(--fg-muted)]">
            {block.subDistrict}
          </span>
          <h5 className="font-bold text-sm text-[var(--fg-primary)] leading-tight">
            {block.name}
          </h5>
        </div>
        <span className="rounded-md bg-[var(--bg-surface-subtle)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--fg-secondary)]">
          {block.farmerCount} farmers
        </span>
      </div>

      {/* Active Layer Value */}
      <div className="flex items-center justify-between py-1">
        <span className="text-[var(--fg-muted)]">{layer.shortName}:</span>
        <span className="font-mono font-bold text-[var(--primary)] text-sm">
          {formattedActive}
        </span>
      </div>

      {/* Secondary Indices */}
      {metrics && (
        <div className="grid grid-cols-2 gap-2 border-t border-[var(--border-subtle)]/60 pt-1.5 text-[11px] font-mono">
          <div>
            <span className="text-[var(--fg-muted)] block text-[9px]">NDVI Value</span>
            <span className="font-bold">{metrics.ndvi.value.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-[var(--fg-muted)] block text-[9px]">CWSI Stress</span>
            <span className="font-bold">{metrics.cwsi.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-[var(--fg-muted)] block text-[9px]">Soil Moisture</span>
            <span className="font-bold">{metrics.soilMoistureSurface.value.toFixed(0)}%</span>
          </div>
          <div>
            <span className="text-[var(--fg-muted)] block text-[9px]">Crop Stage</span>
            <span className="font-bold capitalize">{block.cropStage || "Growth"}</span>
          </div>
        </div>
      )}

      {metrics && metrics.sources && metrics.sources[0] && (
        <div className="mt-2 border-t border-[var(--border-subtle)]/60 pt-1">
          <SourceLabel source={metrics.sources[0]} />
        </div>
      )}
    </div>
  );
}
