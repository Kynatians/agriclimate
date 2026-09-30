"use client";

import * as React from "react";
import {
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  Download,
  Layers,
  Sliders,
  RotateCcw,
  Globe,
  AlertTriangle,
  Flame,
  Waves,
  ShieldAlert,
  MapPin,
  Check,
} from "lucide-react";
import { useUiStore, LayerId, MapBasemap } from "@/lib/stores/ui";
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
  const {
    layerOpacities,
    setLayerOpacity,
    mapBasemap,
    setMapBasemap,
    showDisasterZones,
    toggleDisasterZones,
    showAlertBeacons,
    toggleAlertBeacons,
    showBlockBoundaries,
    toggleBlockBoundaries,
  } = useUiStore();

  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showOpacitySlider, setShowOpacitySlider] = React.useState(false);
  const [showBasemapMenu, setShowBasemapMenu] = React.useState(false);
  const [showLayersMenu, setShowLayersMenu] = React.useState(false);

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
    <div className={cn("flex flex-col gap-2 z-30 select-none", className)}>
      {/* Basemap Switcher Button & Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowBasemapMenu(!showBasemapMenu);
            setShowLayersMenu(false);
            setShowOpacitySlider(false);
          }}
          className={cn(
            "flex items-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)]/95 px-2.5 py-2 shadow-lg backdrop-blur-md transition-all cursor-pointer text-xs font-semibold",
            showBasemapMenu
              ? "border-[var(--primary)] text-[var(--primary)] ring-2 ring-[var(--primary)]/30"
              : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-surface)]"
          )}
          aria-label="Change OpenStreetMap basemap style"
          title="OpenStreetMap Basemap Mode"
        >
          <Globe className="h-4 w-4 text-[var(--primary)]" />
          <span className="capitalize hidden sm:inline">
            {mapBasemap === "osm" ? "OpenStreetMap" : mapBasemap}
          </span>
        </button>

        {showBasemapMenu && (
          <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-2 shadow-2xl backdrop-blur-xl">
            <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--fg-muted)] border-b border-[var(--border-subtle)] mb-1">
              OpenStreetMap Mode
            </div>

            <button
              type="button"
              onClick={() => {
                setMapBasemap("osm");
                setShowBasemapMenu(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors cursor-pointer",
                mapBasemap === "osm"
                  ? "bg-[var(--primary-subtle)] font-bold text-[var(--primary)]"
                  : "text-[var(--fg-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--fg-primary)]"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🗺️</span>
                <div className="text-left">
                  <div className="leading-tight">OpenStreetMap</div>
                  <div className="text-[10px] text-[var(--fg-muted)] font-normal">
                    Standard OSM Cartography
                  </div>
                </div>
              </div>
              {mapBasemap === "osm" && <Check className="h-4 w-4 shrink-0" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setMapBasemap("satellite");
                setShowBasemapMenu(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors cursor-pointer",
                mapBasemap === "satellite"
                  ? "bg-[var(--primary-subtle)] font-bold text-[var(--primary)]"
                  : "text-[var(--fg-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--fg-primary)]"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🛰️</span>
                <div className="text-left">
                  <div className="leading-tight">OSM Satellite</div>
                  <div className="text-[10px] text-[var(--fg-muted)] font-normal">
                    High-Res World Imagery
                  </div>
                </div>
              </div>
              {mapBasemap === "satellite" && <Check className="h-4 w-4 shrink-0" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setMapBasemap("hybrid");
                setShowBasemapMenu(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors cursor-pointer",
                mapBasemap === "hybrid"
                  ? "bg-[var(--primary-subtle)] font-bold text-[var(--primary)]"
                  : "text-[var(--fg-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--fg-primary)]"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🌐</span>
                <div className="text-left">
                  <div className="leading-tight">OSM Hybrid</div>
                  <div className="text-[10px] text-[var(--fg-muted)] font-normal">
                    Satellite + OSM Roads/Labels
                  </div>
                </div>
              </div>
              {mapBasemap === "hybrid" && <Check className="h-4 w-4 shrink-0" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setMapBasemap("topo");
                setShowBasemapMenu(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors cursor-pointer",
                mapBasemap === "topo"
                  ? "bg-[var(--primary-subtle)] font-bold text-[var(--primary)]"
                  : "text-[var(--fg-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--fg-primary)]"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">⛰️</span>
                <div className="text-left">
                  <div className="leading-tight">OpenTopoMap</div>
                  <div className="text-[10px] text-[var(--fg-muted)] font-normal">
                    Topographic Contours
                  </div>
                </div>
              </div>
              {mapBasemap === "topo" && <Check className="h-4 w-4 shrink-0" />}
            </button>
          </div>
        )}
      </div>

      {/* Layer Toggles Menu (Areas, Disasters, Alerts) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowLayersMenu(!showLayersMenu);
            setShowBasemapMenu(false);
            setShowOpacitySlider(false);
          }}
          className={cn(
            "flex items-center justify-center rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)]/95 p-2 shadow-lg backdrop-blur-md transition-all cursor-pointer",
            showLayersMenu
              ? "border-[var(--primary)] text-[var(--primary)] ring-2 ring-[var(--primary)]/30"
              : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-surface)]"
          )}
          aria-label="Toggle map features and hazard overlays"
          title="Map Overlays & Feature Toggles"
        >
          <Layers className="h-4 w-4" />
        </button>

        {showLayersMenu && (
          <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-2.5 shadow-2xl backdrop-blur-xl space-y-1.5">
            <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--fg-muted)] border-b border-[var(--border-subtle)] mb-1">
              Visual Overlays
            </div>

            {/* Areas / Blocks toggle */}
            <button
              type="button"
              onClick={toggleBlockBoundaries}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer",
                showBlockBoundaries
                  ? "bg-[var(--primary-subtle)] font-bold text-[var(--primary)]"
                  : "text-[var(--fg-muted)] hover:bg-[var(--bg-surface-subtle)]"
              )}
            >
              <span className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                <span>Agricultural Areas</span>
              </span>
              <span className="text-[10px] font-mono uppercase">{showBlockBoundaries ? "ON" : "OFF"}</span>
            </button>

            {/* Disaster Zones toggle */}
            <button
              type="button"
              onClick={toggleDisasterZones}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer",
                showDisasterZones
                  ? "bg-amber-500/10 font-bold text-amber-600 dark:text-amber-400"
                  : "text-[var(--fg-muted)] hover:bg-[var(--bg-surface-subtle)]"
              )}
            >
              <span className="flex items-center gap-2">
                <Waves className="h-3.5 w-3.5 text-cyan-500" />
                <span>Disaster Hazard Zones</span>
              </span>
              <span className="text-[10px] font-mono uppercase">{showDisasterZones ? "ON" : "OFF"}</span>
            </button>

            {/* Alert Beacons toggle */}
            <button
              type="button"
              onClick={toggleAlertBeacons}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer",
                showAlertBeacons
                  ? "bg-rose-500/10 font-bold text-rose-600 dark:text-rose-400"
                  : "text-[var(--fg-muted)] hover:bg-[var(--bg-surface-subtle)]"
              )}
            >
              <span className="flex items-center gap-2">
                <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
                <span>Active Alert Beacons</span>
              </span>
              <span className="text-[10px] font-mono uppercase">{showAlertBeacons ? "ON" : "OFF"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Navigation & Zoom control cluster */}
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
        {onResetView && (
          <button
            type="button"
            onClick={onResetView}
            className="p-2 text-[var(--fg-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--fg-primary)] transition-colors cursor-pointer border-b border-[var(--border-subtle)]"
            aria-label="Reset map view"
            title="Reset to Kurigram Bounds"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
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
          onClick={() => {
            setShowOpacitySlider(!showOpacitySlider);
            setShowBasemapMenu(false);
            setShowLayersMenu(false);
          }}
          className={cn(
            "rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)]/95 p-2 shadow-md backdrop-blur-md transition-colors cursor-pointer",
            showOpacitySlider
              ? "text-[var(--primary)] border-[var(--primary)]"
              : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
          )}
          aria-label="Toggle layer opacity slider"
          title="Satellite Telemetry Blend Opacity"
        >
          <Sliders className="h-4 w-4" />
        </button>

        {showOpacitySlider && (
          <div className="absolute right-0 top-12 z-50 w-48 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] p-3 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--fg-muted)] mb-1.5">
              <span>Telemetry Blend</span>
              <span className="font-mono font-bold text-[var(--fg-primary)]">
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
            <div className="flex justify-between text-[9px] text-[var(--fg-muted)] mt-1">
              <span>Satellite</span>
              <span>Telemetry</span>
            </div>
          </div>
        )}
      </div>

      {/* Export PNG Screenshot button */}
      <button
        type="button"
        onClick={onExportPng}
        className="rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)]/95 p-2 text-[var(--fg-secondary)] shadow-md backdrop-blur-md hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--fg-primary)] transition-colors cursor-pointer"
        aria-label="Export map PNG screenshot"
        title="Export High-Res GIS PNG"
      >
        <Download className="h-4 w-4" />
      </button>
    </div>
  );
}
