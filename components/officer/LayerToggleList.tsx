"use client";

import * as React from "react";
import { useUiStore, LayerId } from "@/lib/stores/ui";
import { MAP_LAYERS } from "@/lib/map/layers";
import { Layers, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayerToggleListProps {
  className?: string;
}

export function LayerToggleList({ className }: LayerToggleListProps) {
  const { activeLayers, toggleLayer } = useUiStore();

  const layerKeys: LayerId[] = [
    "ndvi",
    "soilMoisture",
    "floodRisk",
    "cropHealth",
    "precipForecast",
    "pumpRouting",
    "fireEvents",
  ];

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-2">
        <span className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5" />
          GIS Satellite Overlays
        </span>
        <span className="text-[10px] font-mono text-[var(--fg-muted)]">
          {activeLayers.length} active
        </span>
      </div>

      <div className="space-y-1.5">
        {layerKeys.map((layerId) => {
          const layer = MAP_LAYERS[layerId];
          const isActive = activeLayers.includes(layerId);

          return (
            <button
              key={layerId}
              type="button"
              onClick={() => toggleLayer(layerId)}
              className={cn(
                "flex w-full items-center justify-between rounded-xl border p-2.5 text-left transition-all cursor-pointer",
                isActive
                  ? "border-[var(--primary)] bg-[var(--primary-subtle)] text-[var(--fg-primary)] shadow-xs"
                  : "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--fg-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--fg-primary)]"
              )}
              aria-pressed={isActive}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs",
                    isActive
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--bg-surface-subtle)] text-[var(--fg-muted)]"
                  )}
                >
                  {isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </div>

                <div className="truncate">
                  <div className="text-xs font-bold leading-tight truncate">
                    {layer.shortName}
                  </div>
                  <div className="text-[10px] text-[var(--fg-muted)] truncate">
                    {layer.source}
                  </div>
                </div>
              </div>

              <span
                className={cn(
                  "ml-2 shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-mono font-semibold uppercase",
                  isActive
                    ? "bg-[var(--primary)]/20 text-[var(--primary)]"
                    : "text-[var(--fg-muted)]"
                )}
              >
                {isActive ? "ON" : "OFF"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
