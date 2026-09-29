"use client";

import * as React from "react";
import { Plus, Minus, Maximize2, Minimize2, Download, Layers, Sliders } from "lucide-react";
import { useUiStore, LayerId } from "@/lib/stores/ui";
import { cn } from "@/lib/utils";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView?: () => void;
  onExportPng: () => void;
  activeLayerId: LayerId;
  containerRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onResetView,
  onExportPng,
  activeLayerId,
  containerRef,
  className,
}: MapControlsProps) {
  const { layerOpacities, setLayerOpacity } = useUiStore();
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showOpacitySlider, setShowOpacitySlider] = React.useState(false);

  const opacity = layerOpacities[activeLayerId] ?? 0.75;

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn("Fullscreen toggle failed:", err);
    }
  };

  React.useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Zoom / Fullscreen group */}
      <div className="flex flex-col rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)]/95 shadow-md backdrop-blur-md overflow-hidden">
        <button
          type="button"
          onClick={onZoomIn}
          className="p-2 text-[var(--fg-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--fg-primary)] transition-colors cursor-pointer border-b border-[var(--border-subtle)]"
          aria-label="Zoom in"
          title="Zoom In"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onZoomOut}
          className="p-2 text-[var(--fg-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--fg-primary)] transition-colors cursor-pointer border-b border-[var(--border-subtle)]"
          aria-label="Zoom out"
          title="Zoom Out"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-2 text-[var(--fg-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--fg-primary)] transition-colors cursor-pointer"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Opacity control popup toggle */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowOpacitySlider(!showOpacitySlider)}
          className={cn(
            "rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)]/95 p-2 shadow-md backdrop-blur-md transition-colors cursor-pointer",
            showOpacitySlider
              ? "text-[var(--primary)] border-[var(--primary)]"
              : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
          )}
          aria-label="Toggle layer opacity slider"
          title="Layer Opacity"
        >
          <Sliders className="h-4 w-4" />
        </button>

        {showOpacitySlider && (
          <div className="absolute right-0 top-12 z-40 w-44 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-3 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--fg-muted)] mb-1">
              <span>Layer Opacity</span>
              <span className="font-mono text-[var(--fg-primary)]">
                {Math.round(opacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={opacity}
              onChange={(e) => setLayerOpacity(activeLayerId, parseFloat(e.target.value))}
              className="w-full accent-[var(--primary)] cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Export PNG Screenshot button */}
      <button
        type="button"
        onClick={onExportPng}
        className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)]/95 p-2 text-[var(--fg-secondary)] shadow-md backdrop-blur-md hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--fg-primary)] transition-colors cursor-pointer"
        aria-label="Export map PNG screenshot"
        title="Export PNG Screenshot"
      >
        <Download className="h-4 w-4" />
      </button>
    </div>
  );
}
