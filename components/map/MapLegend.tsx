"use client";

import * as React from "react";
import { LayerId, useUiStore } from "@/lib/stores/ui";
import { MAP_LAYERS } from "@/lib/map/layers";
import { Waves, Flame, ShieldAlert, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapLegendProps {
  activeLayerId: LayerId;
  className?: string;
}

export function MapLegend({ activeLayerId, className }: MapLegendProps) {
  const { showDisasterZones, showAlertBeacons } = useUiStore();
  const [expanded, setExpanded] = React.useState(true);

  const layer = MAP_LAYERS[activeLayerId] || MAP_LAYERS.ndvi;

  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)]/95 shadow-xl backdrop-blur-md text-xs transition-all select-none overflow-hidden",
        className
      )}
    >
      {/* Header bar with collapse toggle */}
      <div
        className="flex items-center justify-between gap-2 p-2.5 bg-[var(--bg-surface-subtle)]/60 border-b border-[var(--border-subtle)] cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-bold text-[var(--fg-primary)] truncate text-xs">
            {layer.shortName}
          </span>
          <span className="font-mono text-[10px] text-[var(--fg-muted)]">
            ({layer.unit})
          </span>
        </div>
        <button
          type="button"
          className="text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
          aria-label={expanded ? "Collapse legend" : "Expand legend"}
        >
          {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="p-3 space-y-3">
          {/* Active Layer Gradient Bar */}
          <div>
            <div className="flex h-2.5 w-full rounded-md overflow-hidden border border-[var(--border-subtle)] shadow-inner">
              {layer.stops.map((stop, idx) => (
                <div
                  key={idx}
                  className="flex-1"
                  style={{ backgroundColor: stop.color }}
                  title={`${stop.label} (${stop.value})`}
                />
              ))}
            </div>

            {/* Gradient min / max labels */}
            <div className="flex justify-between text-[10px] text-[var(--fg-secondary)] mt-1 font-mono">
              <span>{layer.stops[0].label}</span>
              <span>{layer.stops[layer.stops.length - 1].label}</span>
            </div>
            <div className="text-[9px] text-[var(--fg-muted)] truncate mt-0.5">
              Source: {layer.source}
            </div>
          </div>

          {/* Disaster Hazard & Alert Beacons Key */}
          {(showDisasterZones || showAlertBeacons) && (
            <div className="pt-2 border-t border-[var(--border-subtle)]/70 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                Active Map Indicators
              </div>

              {showDisasterZones && (
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-medium">
                    <span className="h-2.5 w-2.5 rounded-sm bg-cyan-500/40 border border-cyan-400 shadow-xs" />
                    <span>Flood Inundation</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                    <span className="h-2.5 w-2.5 rounded-sm bg-amber-500/40 border border-amber-400 shadow-xs" />
                    <span>Drought Deficit</span>
                  </div>
                </div>
              )}

              {showAlertBeacons && (
                <div className="flex items-center gap-3 text-[10px] pt-1">
                  <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600" />
                    </span>
                    <span>High Alert</span>
                  </span>
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>Advisory</span>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
