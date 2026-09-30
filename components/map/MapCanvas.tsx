"use client";

import * as React from "react";
import { Block, BlockMetrics, Alert } from "@/lib/dal/types";
import { useUiStore, LayerId } from "@/lib/stores/ui";
import { MAP_LAYERS, getBlockFillColor } from "@/lib/map/layers";
import { DISASTER_ZONES, DisasterZone } from "@/lib/map/disasters";
import { getOsmMapStyle } from "@/lib/map/osm";
import { MapLegend } from "./MapLegend";
import { MapControls } from "./MapControls";
import { BlockTooltip } from "./BlockTooltip";
import { TacticalOverlayCard } from "./TacticalOverlayCard";
import { cn } from "@/lib/utils";
import { Waves, Flame, ShieldAlert, Sparkles, MapPin } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";

interface MapCanvasProps {
  blocks: Block[];
  metricsMap: Record<string, BlockMetrics>;
  alerts?: Alert[];
  className?: string;
  onBlockSelect?: (blockId: string) => void;
  onAlertSelect?: (alert: Alert) => void;
}

/**
 * Checks whether WebGL is supported in the current client browser environment.
 */
function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export function MapCanvas({
  blocks,
  metricsMap,
  alerts = [],
  className,
  onBlockSelect,
  onAlertSelect,
}: MapCanvasProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const maplibreContainerRef = React.useRef<HTMLDivElement>(null);
  const maplibreInstanceRef = React.useRef<any>(null);
  const maplibreglClassRef = React.useRef<any>(null);
  const markersRef = React.useRef<any[]>([]);
  const svgRef = React.useRef<SVGSVGElement>(null);

  const {
    activeLayers,
    activeLayerId: storeActiveLayerId,
    setActiveLayer,
    selectedBlockId,
    setSelectedBlockId,
    hoveredBlockId,
    setHoveredBlockId,
    selectedDisasterId,
    setSelectedDisasterId,
    layerOpacities,
    mapBasemap,
    showDisasterZones,
    showAlertBeacons,
    showBlockBoundaries,
    locale,
  } = useUiStore();

  const [hasWebGL, setHasWebGL] = React.useState(false);
  const [mapLoaded, setMapLoaded] = React.useState(false);
  const [zoomLevel, setZoomLevel] = React.useState<number>(10);

  // Tactical overlay inspection state
  const [activeAlertCard, setActiveAlertCard] = React.useState<Alert | null>(null);
  const [activeDisasterCard, setActiveDisasterCard] = React.useState<DisasterZone | null>(null);

  const [tooltipState, setTooltipState] = React.useState<{
    block: Block;
    x: number;
    y: number;
  } | null>(null);

  // SVG Pan/Zoom state for universal fallback
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

  const activeLayerId: LayerId = storeActiveLayerId || activeLayers[0] || "ndvi";
  const isOverlayVisible = showBlockBoundaries && (activeLayers.includes(activeLayerId) || activeLayers.length > 0);

  const baseOpacity = layerOpacities[activeLayerId] ?? 0.75;

  // Progressive reveal upon zoom:
  // At zoom >= 11, soften telemetry fill opacity proportionally so high-res OpenStreetMap / satellite photography shines through!
  const effectiveOpacity = React.useMemo(() => {
    if (!isOverlayVisible) return 0;
    const zoomScaleFactor =
      zoomLevel >= 13 ? 0.6 : zoomLevel >= 12 ? 0.72 : zoomLevel >= 11 ? 0.85 : 1.0;
    return Math.max(0.45, baseOpacity * zoomScaleFactor);
  }, [zoomLevel, baseOpacity, isOverlayVisible]);

  // Geographic bounds calculation for projection & fallback
  const bounds = React.useMemo(() => {
    let minLon = 89.45,
      maxLon = 89.92,
      minLat = 25.38,
      maxLat = 26.22;
    if (blocks.length > 0) {
      const allCoords = blocks.flatMap((b) => b.geometry.coordinates[0]);
      minLon = Math.min(...allCoords.map((c) => c[0])) - 0.02;
      maxLon = Math.max(...allCoords.map((c) => c[0])) + 0.02;
      minLat = Math.min(...allCoords.map((c) => c[1])) - 0.02;
      maxLat = Math.max(...allCoords.map((c) => c[1])) + 0.02;
    }
    return { minLon, maxLon, minLat, maxLat };
  }, [blocks]);

  // Project lon/lat to SVG 800x650 coordinate space (for fallback when !hasWebGL)
  const project = React.useCallback(
    (lon: number, lat: number) => {
      const width = 800;
      const height = 650;
      const x = ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * width;
      const y = height - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height;
      return [x, y];
    },
    [bounds]
  );

  const activeAlertsWithCentroid = React.useMemo(() => {
    return alerts
      .map((alert) => {
        const block = blocks.find((b) => b.id === alert.blockId);
        return {
          alert,
          block,
          centroid: block ? block.centroid : null,
        };
      })
      .filter((a): a is { alert: Alert; block: Block; centroid: [number, number] } => !!a.centroid);
  }, [alerts, blocks]);

  const handleBlockClick = React.useCallback(
    (block: Block) => {
      const nextId = selectedBlockId === block.id ? null : block.id;
      setSelectedBlockId(nextId);
      if (onBlockSelect && nextId) {
        onBlockSelect(nextId);
      }
    },
    [selectedBlockId, setSelectedBlockId, onBlockSelect]
  );

  const handleAlertBeaconClick = React.useCallback(
    (alert: Alert) => {
      setActiveAlertCard(alert);
      setActiveDisasterCard(null);
      setSelectedBlockId(alert.blockId);
      if (onAlertSelect) {
        onAlertSelect(alert);
      }
    },
    [onAlertSelect, setSelectedBlockId]
  );

  const handleDisasterZoneClick = React.useCallback(
    (disaster: DisasterZone) => {
      setActiveDisasterCard(disaster);
      setActiveAlertCard(null);
      setSelectedDisasterId(disaster.id);
    },
    [setSelectedDisasterId]
  );

  // Synchronize GeoJSON Land Overlays, Disasters, and Boundary Highlight lines with MapLibre GL
  const syncLayersToMap = React.useCallback(
    (map: any) => {
      if (!map || !map.isStyleLoaded()) return;

      try {
        // 1. Blocks GeoJSON Source & Choropleth Layers
        const blocksGeoJson = {
          type: "FeatureCollection" as const,
          features: blocks.map((b) => ({
            type: "Feature" as const,
            id: b.id,
            geometry: b.geometry,
            properties: {
              id: b.id,
              name: b.name,
              subDistrict: b.subDistrict,
              farmerCount: b.farmerCount,
              primaryCrop: b.primaryCrop,
              fillColor: getBlockFillColor(metricsMap[b.id], activeLayerId),
            },
          })),
        };

        if (!map.getSource("blocks-source")) {
          map.addSource("blocks-source", {
            type: "geojson",
            data: blocksGeoJson,
          });
        } else {
          (map.getSource("blocks-source") as any).setData(blocksGeoJson);
        }

        // Fill layer
        if (!map.getLayer("blocks-fill")) {
          map.addLayer({
            id: "blocks-fill",
            type: "fill",
            source: "blocks-source",
            paint: {
              "fill-color": ["get", "fillColor"],
              "fill-opacity": effectiveOpacity,
            },
            layout: {
              visibility: isOverlayVisible ? "visible" : "none",
            },
          });

          // Block click interaction
          map.on("click", "blocks-fill", (e: any) => {
            if (e.features && e.features[0]) {
              const id = e.features[0].properties.id;
              const block = blocks.find((b) => b.id === id);
              if (block) handleBlockClick(block);
            }
          });

          // Block hover tooltip
          map.on("mousemove", "blocks-fill", (e: any) => {
            if (e.features && e.features[0]) {
              const id = e.features[0].properties.id;
              const block = blocks.find((b) => b.id === id);
              if (block) {
                setHoveredBlockId(id);
                setTooltipState({
                  block,
                  x: e.point.x,
                  y: e.point.y,
                });
              }
            }
          });

          map.on("mouseleave", "blocks-fill", () => {
            map.getCanvas().style.cursor = "";
            setHoveredBlockId(null);
            setTooltipState(null);
          });

          map.on("mouseenter", "blocks-fill", () => {
            map.getCanvas().style.cursor = "pointer";
          });
        } else {
          map.setPaintProperty("blocks-fill", "fill-color", ["get", "fillColor"]);
          map.setPaintProperty("blocks-fill", "fill-opacity", effectiveOpacity);
          map.setLayoutProperty(
            "blocks-fill",
            "visibility",
            isOverlayVisible ? "visible" : "none"
          );
        }

        // Boundary lines layer
        if (!map.getLayer("blocks-line")) {
          map.addLayer({
            id: "blocks-line",
            type: "line",
            source: "blocks-source",
            paint: {
              "line-color":
                mapBasemap === "satellite" || mapBasemap === "hybrid"
                  ? "#38bdf8"
                  : "#0284c7",
              "line-width": 2.5,
              "line-opacity": showBlockBoundaries ? 0.9 : 0,
            },
            layout: {
              visibility: showBlockBoundaries ? "visible" : "none",
            },
          });
        } else {
          map.setPaintProperty(
            "blocks-line",
            "line-color",
            mapBasemap === "satellite" || mapBasemap === "hybrid"
              ? "#38bdf8"
              : "#0284c7"
          );
          map.setPaintProperty("blocks-line", "line-width", 2.5);
          map.setPaintProperty(
            "blocks-line",
            "line-opacity",
            showBlockBoundaries ? 0.9 : 0
          );
          map.setLayoutProperty(
            "blocks-line",
            "visibility",
            showBlockBoundaries ? "visible" : "none"
          );
        }

        // Selected block highlight outline layer
        if (!map.getLayer("blocks-selected-line")) {
          map.addLayer({
            id: "blocks-selected-line",
            type: "line",
            source: "blocks-source",
            paint: {
              "line-color": "#38bdf8",
              "line-width": 3.5,
              "line-opacity": 0.95,
            },
            filter: ["==", ["get", "id"], selectedBlockId || ""],
            layout: {
              visibility: selectedBlockId && showBlockBoundaries ? "visible" : "none",
            },
          });
        } else {
          map.setFilter("blocks-selected-line", ["==", ["get", "id"], selectedBlockId || ""]);
          map.setLayoutProperty(
            "blocks-selected-line",
            "visibility",
            selectedBlockId && showBlockBoundaries ? "visible" : "none"
          );
        }

        // 2. Disaster Hazard Zones GeoJSON Source & Layers
        const disastersGeoJson = {
          type: "FeatureCollection" as const,
          features: DISASTER_ZONES.map((z) => ({
            type: "Feature" as const,
            id: z.id,
            geometry: z.geometry,
            properties: {
              id: z.id,
              name: z.name,
              type: z.type,
              color: z.type === "flood" ? "#06b6d4" : "#f59e0b",
              fillColor: z.type === "flood" ? "#0891b2" : "#d97706",
            },
          })),
        };

        if (!map.getSource("disasters-source")) {
          map.addSource("disasters-source", {
            type: "geojson",
            data: disastersGeoJson,
          });
        } else {
          (map.getSource("disasters-source") as any).setData(disastersGeoJson);
        }

        if (!map.getLayer("disasters-fill")) {
          map.addLayer({
            id: "disasters-fill",
            type: "fill",
            source: "disasters-source",
            paint: {
              "fill-color": ["get", "fillColor"],
              "fill-opacity": 0.28,
            },
            layout: {
              visibility: showDisasterZones ? "visible" : "none",
            },
          });

          map.on("click", "disasters-fill", (e: any) => {
            if (e.features && e.features[0]) {
              const id = e.features[0].properties.id;
              const zone = DISASTER_ZONES.find((z) => z.id === id);
              if (zone) handleDisasterZoneClick(zone);
            }
          });

          map.on("mouseenter", "disasters-fill", () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", "disasters-fill", () => {
            map.getCanvas().style.cursor = "";
          });
        } else {
          map.setLayoutProperty(
            "disasters-fill",
            "visibility",
            showDisasterZones ? "visible" : "none"
          );
        }

        if (!map.getLayer("disasters-line")) {
          map.addLayer({
            id: "disasters-line",
            type: "line",
            source: "disasters-source",
            paint: {
              "line-color": ["get", "color"],
              "line-width": 2.2,
              "line-dasharray": [3, 2],
            },
            layout: {
              visibility: showDisasterZones ? "visible" : "none",
            },
          });
        } else {
          map.setLayoutProperty(
            "disasters-line",
            "visibility",
            showDisasterZones ? "visible" : "none"
          );
        }
      } catch (err) {
        console.warn("Error synchronizing MapLibre layers:", err);
      }
    },
    [
      blocks,
      metricsMap,
      activeLayerId,
      effectiveOpacity,
      isOverlayVisible,
      showBlockBoundaries,
      showDisasterZones,
      selectedBlockId,
      mapBasemap,
      handleBlockClick,
      handleDisasterZoneClick,
      setHoveredBlockId,
    ]
  );

  // Synchronize HTML Markers (Centroid labels, Disaster badges, Alert Beacons) with MapLibre
  const syncMarkersToMap = React.useCallback(
    (map: any) => {
      const maplibregl = maplibreglClassRef.current;
      if (!map || !maplibregl || !hasWebGL) return;

      // Clean up previous markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // 1. Block centroid title chips
      if (showBlockBoundaries) {
        blocks.forEach((block) => {
          const isSelected = selectedBlockId === block.id;
          const el = document.createElement("div");
          el.className = cn(
            "rounded-full px-2.5 py-0.5 text-[9.5px] font-bold shadow-md cursor-pointer select-none transition-all duration-200 pointer-events-auto border",
            isSelected
              ? "bg-sky-500 text-white border-white ring-2 ring-white/60 scale-105"
              : "bg-slate-900/90 text-slate-100 hover:bg-slate-800 border-white/20 hover:scale-105"
          );
          el.textContent = block.name;
          el.onclick = (e) => {
            e.stopPropagation();
            handleBlockClick(block);
          };

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat(block.centroid)
            .addTo(map);
          markersRef.current.push(marker);
        });
      }

      // 2. Disaster Zone label badges
      if (showDisasterZones) {
        DISASTER_ZONES.forEach((zone) => {
          const isFlood = zone.type === "flood";
          const isSelected = selectedDisasterId === zone.id;
          const el = document.createElement("div");
          el.className = cn(
            "rounded-full px-2.5 py-0.5 text-[9px] font-bold shadow-lg cursor-pointer select-none transition-all duration-200 pointer-events-auto border flex items-center gap-1",
            isFlood
              ? "bg-cyan-950/95 text-cyan-200 border-cyan-400 hover:bg-cyan-900"
              : "bg-amber-950/95 text-amber-200 border-amber-400 hover:bg-amber-900",
            isSelected && "ring-2 ring-white scale-110"
          );
          el.textContent = isFlood ? "🌊 Inundation" : "☀️ Drought Deficit";
          el.onclick = (e) => {
            e.stopPropagation();
            handleDisasterZoneClick(zone);
          };

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat(zone.centroid)
            .addTo(map);
          markersRef.current.push(marker);
        });
      }

      // 3. Alert Beacons
      if (showAlertBeacons) {
        activeAlertsWithCentroid.forEach(({ alert, centroid }) => {
          const isHigh = alert.severity === "high";
          const el = document.createElement("div");
          el.className =
            "relative flex items-center justify-center cursor-pointer pointer-events-auto group";
          el.style.width = "24px";
          el.style.height = "24px";
          el.innerHTML = `
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${
              isHigh ? "bg-rose-500 opacity-75" : "bg-amber-500 opacity-75"
            }"></span>
            <span class="relative inline-flex items-center justify-center rounded-full h-5 w-5 ${
              isHigh ? "bg-rose-600 shadow-rose-500/50" : "bg-amber-600 shadow-amber-500/50"
            } text-white font-bold text-[10px] shadow-lg border border-white">!</span>
          `;
          el.onclick = (e) => {
            e.stopPropagation();
            handleAlertBeaconClick(alert);
          };

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([centroid[0], centroid[1] + 0.006])
            .addTo(map);
          markersRef.current.push(marker);
        });
      }
    },
    [
      blocks,
      hasWebGL,
      showBlockBoundaries,
      showDisasterZones,
      showAlertBeacons,
      selectedBlockId,
      selectedDisasterId,
      activeAlertsWithCentroid,
      handleBlockClick,
      handleDisasterZoneClick,
      handleAlertBeaconClick,
    ]
  );

  // Up-to-date function references for asynchronous MapLibre callbacks
  const syncLayersRef = React.useRef(syncLayersToMap);
  syncLayersRef.current = syncLayersToMap;

  const syncMarkersRef = React.useRef(syncMarkersToMap);
  syncMarkersRef.current = syncMarkersToMap;

  const prevBasemapRef = React.useRef(mapBasemap);

  // Check WebGL availability on mount
  React.useEffect(() => {
    setHasWebGL(isWebGLAvailable());
  }, []);

  // 1. Initialize MapLibre GL with OpenStreetMap / Satellite
  React.useEffect(() => {
    if (!hasWebGL || !maplibreContainerRef.current) return;

    let mapInstance: any = null;

    const initMap = async () => {
      try {
        const maplibreglModule: any = await import("maplibre-gl");
        const maplibregl = maplibreglModule.default || maplibreglModule;
        maplibreglClassRef.current = maplibregl;

        // Configure static worker URL served by Next.js to prevent "Worker failed to load"
        const workerUrl =
          typeof window !== "undefined"
            ? `${window.location.origin}/maplibre/maplibre-gl-worker.mjs`
            : "/maplibre/maplibre-gl-worker.mjs";

        if (typeof maplibregl.setWorkerUrl === "function") {
          maplibregl.setWorkerUrl(workerUrl);
        }
        if (maplibregl.config) {
          maplibregl.config.WORKER_URL = workerUrl;
        }

        mapInstance = new maplibregl.Map({
          container: maplibreContainerRef.current!,
          style: getOsmMapStyle(mapBasemap) as any,
          center: [89.68, 25.75],
          zoom: 10,
          pitch: 12,
          bearing: -1,
          attributionControl: false,
        });

        // Failover safety: if worker fails in restrictive browser context, fall back to SVG overlay
        mapInstance.on("error", (e: any) => {
          const msg = e?.error?.message || (typeof e === "string" ? e : "");
          if (msg.includes("Worker failed to load") || msg.includes("worker")) {
            console.warn("MapLibre worker error detected, falling back to SVG overlay:", msg);
            setHasWebGL(false);
          }
        });

        mapInstance.addControl(
          new maplibregl.AttributionControl({ compact: true }),
          "bottom-right"
        );

        mapInstance.on("load", () => {
          maplibreInstanceRef.current = mapInstance;
          setMapLoaded(true);

          // Auto-zoom to land location on initial load
          if (blocks.length > 0) {
            mapInstance.fitBounds(
              [
                [bounds.minLon, bounds.minLat],
                [bounds.maxLon, bounds.maxLat],
              ],
              { padding: 50, duration: 1200 }
            );
          }

          syncLayersRef.current(mapInstance);
          syncMarkersRef.current(mapInstance);
        });

        // Re-synchronize custom GeoJSON layers & markers whenever map style reloads
        mapInstance.on("styledata", () => {
          if (mapInstance && mapInstance.isStyleLoaded()) {
            syncLayersRef.current(mapInstance);
            syncMarkersRef.current(mapInstance);
          }
        });

        // Zoom event listener for progressive reveal
        mapInstance.on("zoom", () => {
          const z = mapInstance.getZoom();
          if (typeof z === "number") {
            setZoomLevel(z);
          }
        });
      } catch (err) {
        console.warn("MapLibre failed to initialize, using SVG fallback:", err);
        setHasWebGL(false);
      }
    };

    initMap();

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (mapInstance) {
        mapInstance.remove();
        maplibreInstanceRef.current = null;
      }
    };
  }, [hasWebGL]);

  // 2. Auto-Zoom into selected land block location
  React.useEffect(() => {
    const map = maplibreInstanceRef.current;
    if (!map || !mapLoaded || !selectedBlockId) return;

    const block = blocks.find((b) => b.id === selectedBlockId);
    if (!block) return;

    const coords = block.geometry.coordinates[0];
    const lons = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);
    const blockBounds: [[number, number], [number, number]] = [
      [Math.min(...lons), Math.min(...lats)],
      [Math.max(...lons), Math.max(...lats)],
    ];

    map.fitBounds(blockBounds, { padding: 80, duration: 1400 });
  }, [selectedBlockId, blocks, mapLoaded]);

  // 3. Update basemap style ONLY when basemap actually changes (osm, satellite, hybrid, topo)
  React.useEffect(() => {
    const map = maplibreInstanceRef.current;
    if (!map || !mapLoaded) return;
    if (prevBasemapRef.current === mapBasemap) return;
    prevBasemapRef.current = mapBasemap;

    try {
      map.setStyle(getOsmMapStyle(mapBasemap));
    } catch (err) {
      console.warn("Failed to set basemap style:", err);
    }
  }, [mapBasemap, mapLoaded]);

  // 4. Update layers and markers when metrics, active overlay, or toggles change
  React.useEffect(() => {
    const map = maplibreInstanceRef.current;
    if (!map || !mapLoaded) return;
    syncLayersToMap(map);
    syncMarkersToMap(map);
  }, [syncLayersToMap, syncMarkersToMap, mapLoaded]);

  // Zoom / Pan handlers
  const handleZoomIn = () => {
    if (maplibreInstanceRef.current) {
      maplibreInstanceRef.current.zoomIn();
    } else {
      setZoom((z) => Math.min(z + 0.3, 4.0));
    }
  };

  const handleZoomOut = () => {
    if (maplibreInstanceRef.current) {
      maplibreInstanceRef.current.zoomOut();
    } else {
      setZoom((z) => Math.max(z - 0.3, 0.7));
    }
  };

  const handleResetView = () => {
    if (maplibreInstanceRef.current) {
      maplibreInstanceRef.current.fitBounds(
        [
          [bounds.minLon, bounds.minLat],
          [bounds.maxLon, bounds.maxLat],
        ],
        { padding: 50, duration: 1200 }
      );
    } else {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (hasWebGL) return;
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (hasWebGL) return;
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    if (hasWebGL) return;
    setIsDragging(false);
  };

  const handleExportPng = () => {
    if (!svgRef.current) return;
    try {
      const svgElement = svgRef.current;
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 1600;
        canvas.height = 1300;
        const context = canvas.getContext("2d");
        if (context) {
          context.fillStyle = "#020617";
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          const pngUrl = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.href = pngUrl;
          downloadLink.download = `kurigram-osm-${activeLayerId}-${mapBasemap}-${Date.now()}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
      };
      image.src = blobURL;
    } catch (err) {
      console.error("Failed to export PNG:", err);
    }
  };

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Interactive Agricultural Map"
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden bg-slate-950 select-none",
        isDragging ? "cursor-grabbing" : "cursor-grab",
        className
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* 1. Real OpenStreetMap Slippy Map Container */}
      {hasWebGL && (
        <div
          ref={maplibreContainerRef}
          className="absolute inset-0 h-full w-full z-0"
        />
      )}

      {/* 2. OpenStreetMap Satellite/SVG Overlay & Accessible Fallback Layer */}
      <div
        className={cn(
          "absolute inset-0 h-full w-full",
          hasWebGL ? "hidden pointer-events-none" : "z-0"
        )}
      >
        {!hasWebGL && (
          <div className="absolute inset-0 bg-[#06121e]">
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.25),rgba(255,255,255,0))]" />
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
          </div>
        )}

        <svg
          ref={svgRef}
          viewBox="0 0 800 650"
          className="h-full w-full"
          style={{
            transform: hasWebGL
              ? "none"
              : `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 150ms ease-out",
          }}
        >
          <defs>
            <filter id="area-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="flood-wave-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.02  0 0 0 0 0.7  0 0 0 0 0.9  0 0 0 0.8 0"
              />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <pattern id="flood-water-pattern" width="16" height="16" patternUnits="userSpaceOnUse">
              <path
                d="M0 8 Q 4 4, 8 8 T 16 8"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                opacity="0.4"
              />
              <path
                d="M0 14 Q 4 10, 8 14 T 16 14"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="1.2"
                opacity="0.3"
              />
            </pattern>

            <pattern id="drought-thermal-pattern" width="12" height="12" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="12" y2="12" stroke="#f59e0b" strokeWidth="1.2" opacity="0.35" />
              <line x1="12" y1="0" x2="0" y2="12" stroke="#ef4444" strokeWidth="0.8" opacity="0.25" />
            </pattern>
          </defs>

          {/* 1. DISASTER HAZARD LAYER */}
          {showDisasterZones && (
            <g id="disaster-zones" className={hasWebGL ? "pointer-events-none" : "pointer-events-auto"}>
              {DISASTER_ZONES.map((zone) => {
                const points = zone.geometry.coordinates[0]
                  .map((c) => project(c[0], c[1]).join(","))
                  .join(" ");

                const [cx, cy] = project(zone.centroid[0], zone.centroid[1]);
                const isFlood = zone.type === "flood";
                const isSelected = selectedDisasterId === zone.id;

                return (
                  <g key={zone.id} className="cursor-pointer group">
                    <polygon
                      points={points}
                      fill={isFlood ? "url(#flood-water-pattern)" : "url(#drought-thermal-pattern)"}
                      stroke={isFlood ? "#06b6d4" : "#f59e0b"}
                      strokeWidth={isSelected ? "3.5" : "2"}
                      strokeDasharray={isFlood ? "6 3" : "4 2"}
                      filter="url(#flood-wave-glow)"
                      className="transition-all hover:stroke-white duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDisasterZoneClick(zone);
                      }}
                    />

                    {isFlood && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="24"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        opacity="0.6"
                        className="animate-ping origin-center pointer-events-none"
                      />
                    )}

                    <g
                      transform={`translate(${cx}, ${cy})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDisasterZoneClick(zone);
                      }}
                      className="cursor-pointer"
                    >
                      <rect
                        x="-52"
                        y="-12"
                        width="104"
                        height="24"
                        rx="12"
                        fill={isFlood ? "#083344" : "#451a03"}
                        stroke={isFlood ? "#38bdf8" : "#fbbf24"}
                        strokeWidth="1.5"
                        className="shadow-md"
                      />
                      <text
                        x="0"
                        y="1"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="font-sans font-bold text-[9px] fill-white select-none pointer-events-none"
                      >
                        {isFlood ? "🌊 Inundation" : "☀️ Drought Deficit"}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          )}

          {/* 2. AGRICULTURAL AREA OVERLAYS & PROGRESSIVE DETAIL REVEAL */}
          {showBlockBoundaries && (
            <g id="choropleth-polygons" className={hasWebGL ? "pointer-events-none" : "pointer-events-auto"}>
              {blocks.map((block) => {
                const isSelected = selectedBlockId === block.id;
                const isHovered = hoveredBlockId === block.id;
                const metrics = metricsMap[block.id];
                const fillColor = getBlockFillColor(metrics, activeLayerId);

                const points = block.geometry.coordinates[0]
                  .map((c) => project(c[0], c[1]).join(","))
                  .join(" ");

                const [cx, cy] = project(block.centroid[0], block.centroid[1]);

                return (
                  <g key={block.id} className="cursor-pointer">
                    {!hasWebGL && (
                      <polygon
                        points={points}
                        fill={fillColor}
                        fillOpacity={effectiveOpacity}
                        stroke={
                          isSelected
                            ? "#38bdf8"
                            : isHovered
                            ? "#93c5fd"
                            : "rgba(255, 255, 255, 0.45)"
                        }
                        strokeWidth={isSelected ? "3.5" : isHovered ? "2.5" : "1.2"}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        filter={isSelected ? "url(#area-glow)" : undefined}
                        style={{ transition: "fill 300ms ease-out, stroke 150ms ease-out" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBlockClick(block);
                        }}
                      />
                    )}

                    {/* Centroid Land Title Chip */}
                    <g
                      transform={`translate(${cx}, ${cy})`}
                      className="pointer-events-none select-none"
                    >
                      <rect
                        x="-48"
                        y="-10"
                        width="96"
                        height="20"
                        rx="10"
                        fill="rgba(15, 23, 42, 0.88)"
                        stroke={isSelected ? "#38bdf8" : "rgba(255, 255, 255, 0.25)"}
                        strokeWidth={isSelected ? "1.5" : "0.75"}
                      />
                      <text
                        x="0"
                        y="1"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className={cn(
                          "font-sans font-bold text-[9px] select-none",
                          isSelected ? "fill-sky-300 font-extrabold" : "fill-slate-100"
                        )}
                      >
                        {block.name}
                      </text>

                      {/* Revealed Upon Zoom: Detailed Crop & Farmer Count Badge */}
                      {zoomLevel >= 11 && (
                        <g transform="translate(0, 15)">
                          <rect
                            x="-42"
                            y="-6"
                            width="84"
                            height="14"
                            rx="7"
                            fill="rgba(2, 6, 23, 0.92)"
                            stroke="rgba(56, 189, 248, 0.4)"
                            strokeWidth="0.75"
                          />
                          <text
                            x="0"
                            y="1"
                            textAnchor="middle"
                            dominantBaseline="central"
                            className="font-sans font-semibold text-[7.5px] fill-emerald-300 select-none"
                          >
                            🌾 {block.primaryCrop || "Rice"} • {block.farmerCount}f
                          </text>
                        </g>
                      )}
                    </g>
                  </g>
                );
              })}
            </g>
          )}

          {/* 3. TACTICAL ALERT BEACONS LAYER */}
          {showAlertBeacons && (
            <g id="alert-beacons" className="pointer-events-auto">
              {activeAlertsWithCentroid.map(({ alert, block, centroid }) => {
                const [cx, cy] = project(centroid[0], centroid[1]);
                const isHigh = alert.severity === "high";

                return (
                  <g
                    key={`alert-${alert.id}`}
                    transform={`translate(${cx}, ${cy - 18})`}
                    className="cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAlertBeaconClick(alert);
                    }}
                  >
                    <circle
                      cx="0"
                      cy="0"
                      r="16"
                      fill="none"
                      stroke={isHigh ? "#f43f5e" : "#f59e0b"}
                      strokeWidth="1.5"
                      opacity="0.75"
                      className="animate-ping origin-center"
                    />
                    <circle
                      cx="0"
                      cy="0"
                      r="10"
                      fill={isHigh ? "#e11d48" : "#d97706"}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="shadow-lg filter drop-shadow(0 0 6px rgba(225,29,72,0.8))"
                    />
                    <text
                      x="0"
                      y="1"
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="font-sans font-bold text-[8px] fill-white select-none pointer-events-none"
                    >
                      !
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      </div>

      {/* Map Header / Active Layer & OpenStreetMap Status Banner */}
      <div className="absolute left-4 top-4 z-30 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)]/95 px-3 py-1.5 shadow-xl backdrop-blur-md">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--primary)]" />
        </span>
        <span className="text-xs font-bold text-[var(--fg-primary)]">
          Kurigram District GIS
        </span>
        <span className="text-[10px] text-[var(--fg-muted)] font-mono border-l border-[var(--border-subtle)] pl-2">
          Layer: {isOverlayVisible ? MAP_LAYERS[activeLayerId]?.shortName : `${MAP_LAYERS[activeLayerId]?.shortName} (Hidden)`}
        </span>
        <span className="rounded-md bg-[var(--primary-subtle)] px-1.5 py-0.5 text-[9px] font-mono font-bold text-[var(--primary)] capitalize">
          {mapBasemap === "osm" ? "OpenStreetMap" : `${mapBasemap} Imagery`}
        </span>

        {/* Revealed details badge upon zoom */}
        <div className="flex items-center gap-1 rounded-md bg-sky-500/10 px-2 py-0.5 text-[9px] font-mono font-semibold text-sky-600 dark:text-sky-400 border border-sky-500/20">
          <Sparkles className="h-2.5 w-2.5" />
          <span>
            {zoomLevel >= 12
              ? "High-Res Ground Imagery & Sub-Plot Lines"
              : zoomLevel >= 11
              ? "Detailed Crop & Farmer Assets Revealed"
              : "Regional Field Telemetry"}
          </span>
        </div>
      </div>

      {/* Floating Map Controls (Top Right) */}
      <div className="absolute right-4 top-4 z-30">
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetView={handleResetView}
          onExportPng={handleExportPng}
          activeLayerId={activeLayerId}
          containerRef={containerRef}
        />
      </div>

      {/* Dynamic Map Legend (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-30 max-w-xs">
        <MapLegend activeLayerId={activeLayerId} />
      </div>

      {/* Tactical Detail Overlay Card (Alert or Disaster) */}
      {(activeAlertCard || activeDisasterCard) && (
        <TacticalOverlayCard
          alert={activeAlertCard}
          disaster={activeDisasterCard}
          locale={locale}
          onClose={() => {
            setActiveAlertCard(null);
            setActiveDisasterCard(null);
          }}
          onOpenComposer={(alert) => {
            if (onAlertSelect) onAlertSelect(alert);
          }}
          onSelectBlock={(blockId) => {
            setSelectedBlockId(blockId);
            if (onBlockSelect) onBlockSelect(blockId);
          }}
        />
      )}

      {/* Hover Telemetry Tooltip */}
      {tooltipState && !activeAlertCard && !activeDisasterCard && (
        <BlockTooltip
          block={tooltipState.block}
          metrics={metricsMap[tooltipState.block.id]}
          activeLayerId={activeLayerId}
          x={tooltipState.x}
          y={tooltipState.y}
        />
      )}
    </div>
  );
}
