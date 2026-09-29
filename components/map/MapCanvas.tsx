"use client";

import * as React from "react";
import { Block, BlockMetrics } from "@/lib/dal/types";
import { useUiStore, LayerId } from "@/lib/stores/ui";
import { MAP_LAYERS, getBlockFillColor } from "@/lib/map/layers";
import { MapLegend } from "./MapLegend";
import { MapControls } from "./MapControls";
import { BlockTooltip } from "./BlockTooltip";
import { cn } from "@/lib/utils";

interface MapCanvasProps {
  blocks: Block[];
  metricsMap: Record<string, BlockMetrics>;
  className?: string;
  onBlockSelect?: (blockId: string) => void;
}

export function MapCanvas({
  blocks,
  metricsMap,
  className,
  onBlockSelect,
}: MapCanvasProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);

  const {
    activeLayers,
    selectedBlockId,
    setSelectedBlockId,
    hoveredBlockId,
    setHoveredBlockId,
    layerOpacities,
  } = useUiStore();

  const [tooltipState, setTooltipState] = React.useState<{
    block: Block;
    x: number;
    y: number;
  } | null>(null);

  // Zoom and pan state
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

  const activeLayerId: LayerId = activeLayers[0] || "ndvi";
  const opacity = layerOpacities[activeLayerId] ?? 0.75;

  // Geographic bounds calculation for projection
  // Kurigram coordinates: Lon approx 89.5 to 89.9, Lat approx 25.6 to 26.05
  const bounds = React.useMemo(() => {
    let minLon = 89.5, maxLon = 89.9, minLat = 25.6, maxLat = 26.05;
    if (blocks.length > 0) {
      const allCoords = blocks.flatMap((b) => b.geometry.coordinates[0]);
      minLon = Math.min(...allCoords.map((c) => c[0])) - 0.02;
      maxLon = Math.max(...allCoords.map((c) => c[0])) + 0.02;
      minLat = Math.min(...allCoords.map((c) => c[1])) - 0.02;
      maxLat = Math.max(...allCoords.map((c) => c[1])) + 0.02;
    }
    return { minLon, maxLon, minLat, maxLat };
  }, [blocks]);

  // Project lon/lat to SVG 800x600 coordinate space
  const project = React.useCallback(
    (lon: number, lat: number) => {
      const width = 800;
      const height = 650;
      const x = ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * width;
      // Invert Y because latitude goes South -> North
      const y = height - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height;
      return [x, y];
    },
    [bounds]
  );

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.75));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click drags
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
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
          // Draw dark or light background
          context.fillStyle = "#0f172a";
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          const pngUrl = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.href = pngUrl;
          downloadLink.download = `kurigram-${activeLayerId}-${Date.now()}.png`;
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

  const handleBlockClick = (block: Block) => {
    const nextId = selectedBlockId === block.id ? null : block.id;
    setSelectedBlockId(nextId);
    if (onBlockSelect && nextId) {
      onBlockSelect(nextId);
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
      {/* Background satellite grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b22_1px,transparent_1px),linear-gradient(to_bottom,#1e293b22_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* SVG GIS Layer rendering */}
      <svg
        ref={svgRef}
        viewBox="0 0 800 650"
        className="h-full w-full"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "center center",
          transition: isDragging ? "none" : "transform 150ms ease-out",
        }}
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* District outline / Char lands background */}
        <g id="district-base" className="pointer-events-none">
          {blocks.map((block) => {
            const points = block.geometry.coordinates[0]
              .map((c) => project(c[0], c[1]).join(","))
              .join(" ");
            return (
              <polygon
                key={`base-${block.id}`}
                points={points}
                fill="#0f172a"
                stroke="#1e293b"
                strokeWidth="3"
                strokeLinejoin="round"
              />
            );
          })}
        </g>

        {/* Choropleth Polygon Layers */}
        <g id="choropleth-polygons">
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
                <polygon
                  points={points}
                  fill={fillColor}
                  fillOpacity={opacity}
                  stroke={isSelected ? "#3b82f6" : isHovered ? "#93c5fd" : "#334155"}
                  strokeWidth={isSelected ? "4" : isHovered ? "2.5" : "1.2"}
                  strokeLinejoin="round"
                  filter={isSelected ? "url(#glow)" : undefined}
                  style={{ transition: "fill 300ms ease-out, stroke 150ms ease-out" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBlockClick(block);
                  }}
                  onMouseEnter={(e) => {
                    setHoveredBlockId(block.id);
                    if (containerRef.current) {
                      const rect = containerRef.current.getBoundingClientRect();
                      setTooltipState({
                        block,
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                      });
                    }
                  }}
                  onMouseMove={(e) => {
                    if (containerRef.current) {
                      const rect = containerRef.current.getBoundingClientRect();
                      setTooltipState({
                        block,
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                      });
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredBlockId(null);
                    setTooltipState(null);
                  }}
                />

                {/* Centroid Label */}
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={cn(
                    "pointer-events-none font-sans font-bold text-[10px] select-none",
                    isSelected ? "fill-white font-extrabold" : "fill-slate-300"
                  )}
                  style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
                >
                  {block.name}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Map Header / Active Layer Banner */}
      <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)]/90 px-3 py-1.5 shadow-md backdrop-blur-md">
        <span className="h-2 w-2 rounded-full bg-[var(--primary)] animate-pulse" />
        <span className="text-xs font-bold text-[var(--fg-primary)]">
          Kurigram District GIS
        </span>
        <span className="text-[10px] text-[var(--fg-muted)] font-mono">
          Layer: {MAP_LAYERS[activeLayerId]?.shortName}
        </span>
      </div>

      {/* Floating Map Controls (Top Right) */}
      <div className="absolute right-4 top-4 z-20">
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
      <div className="absolute bottom-4 left-4 z-20 max-w-xs">
        <MapLegend activeLayerId={activeLayerId} />
      </div>

      {/* Hover Tooltip */}
      {tooltipState && (
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
