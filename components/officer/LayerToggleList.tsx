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
  const { activeLayers, activeLayerId, setActiveLayer, toggleLayer } = useUiStore();

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
          <Layers className="h-3.5 w-3.5 text-[var(--primary)]" />
          GIS Satellite Overlays
        </span>
        <span className="text-[10px] font-mono text-[var(--fg-muted)]">
          {activeLayers.length} of {layerKeys.length} visible
        </span>
      </div>

      <div className="space-y-1.5">
        {layerKeys.map((layerId) => {
          const layer = MAP_LAYERS[layerId];
          const isVisible = activeLayers.includes(layerId);
          const isViewing = activeLayerId === layerId && isVisible;

          return (
            <div
              key={layerId}
              onClick={() => setActiveLayer(layerId)}
              className={cn(
                "group flex w-full items-center justify-between rounded-xl border p-2 text-left transition-all cursor-pointer select-none",
                isViewing
                  ? "border-[var(--primary)] bg-[var(--primary-subtle)] text-[var(--fg-primary)] shadow-sm ring-1 ring-[var(--primary)]/40"
                  : isVisible
                  ? "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--fg-primary)] hover:border-[var(--border-strong)]"
                  : "border-[var(--border-subtle)]/60 bg-[var(--bg-surface-subtle)]/50 text-[var(--fg-muted)] opacity-70 hover:opacity-100 hover:border-[var(--border-strong)]"
              )}
              role="button"
              tabIndex={0}
              aria-pressed={isViewing}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveLayer(layerId);
                }
              }}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLayer(layerId);
                  }}
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs transition-colors cursor-pointer",
                    isViewing
                      ? "bg-[var(--primary)] text-white shadow-xs"
                      : isVisible
                      ? "bg-[var(--primary-subtle)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"
                      : "bg-[var(--bg-surface)] text-[var(--fg-muted)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--fg-secondary)]"
                  )}
                  title={isVisible ? `Hide ${layer.shortName}` : `Show ${layer.shortName}`}
                  aria-label={`Toggle visibility of ${layer.shortName}`}
                >
                  {isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>

                <div className="truncate min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold leading-tight truncate">
                      {layer.shortName}
                    </span>
                    {isViewing && (
                      <span className="rounded-sm bg-[var(--primary)] px-1 py-0.2 text-[8px] font-mono font-bold text-white uppercase tracking-wider">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[var(--fg-muted)] truncate">
                    {layer.source}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-1.5">
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-[9px] font-mono font-semibold uppercase",
                    isViewing
                      ? "bg-[var(--primary)]/20 text-[var(--primary)] font-bold"
                      : isVisible
                      ? "bg-[var(--bg-surface-subtle)] text-[var(--fg-secondary)]"
                      : "text-[var(--fg-muted)]"
                  )}
                >
                  {isViewing ? "VIEWING" : isVisible ? "ON" : "OFF"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
