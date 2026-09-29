"use client";

import * as React from "react";
import { LayerId } from "@/lib/stores/ui";
import { MAP_LAYERS } from "@/lib/map/layers";
import { cn } from "@/lib/utils";

interface MapLegendProps {
  activeLayerId: LayerId;
  className?: string;
}

export function MapLegend({ activeLayerId, className }: MapLegendProps) {
  const layer = MAP_LAYERS[activeLayerId] || MAP_LAYERS.ndvi;

  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)]/90 p-3 shadow-md backdrop-blur-md text-xs",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-1.5 mb-2">
        <span className="font-bold text-[var(--fg-primary)] truncate">
          {layer.shortName}
        </span>
        <span className="font-mono text-[10px] text-[var(--fg-muted)]">
          {layer.unit}
        </span>
      </div>

      {/* Color stop gradient bar */}
      <div className="flex h-3 w-full rounded-md overflow-hidden border border-[var(--border-subtle)]">
        {layer.stops.map((stop, idx) => (
          <div
            key={idx}
            className="flex-1"
            style={{ backgroundColor: stop.color }}
            title={`${stop.label} (${stop.value})`}
          />
        ))}
      </div>

      {/* Legend Stop Labels */}
      <div className="flex justify-between text-[10px] text-[var(--fg-secondary)] mt-1 font-mono">
        <span>{layer.stops[0].label}</span>
        <span>{layer.stops[layer.stops.length - 1].label}</span>
      </div>

      <div className="mt-1 text-[9px] text-[var(--fg-muted)] truncate">
        Src: {layer.source}
      </div>
    </div>
  );
}
