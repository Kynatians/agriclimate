"use client";

import * as React from "react";
import { List, MapPin, CheckCircle2, AlertTriangle, AlertCircle, ChevronRight, Layers, Search, Droplets, Sprout, Wind, Waves, Check } from "lucide-react";
import { Block, BlockMetrics } from "@/lib/dal/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MetricBadge } from "@/components/shared/MetricBadge";
import { SourceLabel } from "@/components/shared/SourceLabel";
import { useTranslation } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FarmerBlockMapProps {
  blocks: Block[];
  metricsMap: Record<string, BlockMetrics>;
  userBlockId?: string;
  onSelectUserBlock?: (blockId: string) => void;
  className?: string;
}

type LayerMetric = "moisture" | "ndvi" | "cwsi" | "flood";

export function FarmerBlockMap({
  blocks,
  metricsMap,
  userBlockId = "blk_kurigram_01",
  onSelectUserBlock,
  className,
}: FarmerBlockMapProps) {
  const [selectedBlockId, setSelectedBlockId] = React.useState<string>(userBlockId);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"visual" | "list">("visual");
  const [activeMetric, setActiveMetric] = React.useState<LayerMetric>("moisture");
  const [filterSearch, setFilterSearch] = React.useState("");
  const { t } = useTranslation();

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) || blocks[0];
  const selectedMetrics = selectedBlock ? metricsMap[selectedBlock.id] : null;

  const handleBlockClick = (block: Block) => {
    setSelectedBlockId(block.id);
    // On mobile (< 1024px), also open bottom drawer
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setDrawerOpen(true);
    }
  };

  const filteredBlocks = React.useMemo(() => {
    if (!filterSearch.trim()) return blocks;
    const q = filterSearch.toLowerCase();
    return blocks.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.subDistrict.toLowerCase().includes(q) ||
        (b.primaryCrop && b.primaryCrop.toLowerCase().includes(q))
    );
  }, [blocks, filterSearch]);

  return (
    <div className={cn("space-y-5", className)}>
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-[var(--fg-primary)] leading-tight">
              Kurigram Regional Field Radar
            </h3>
            <span className="rounded-full bg-[var(--primary-subtle)] px-2.5 py-0.5 text-[11px] font-mono font-bold text-[var(--primary)]">
              {blocks.length} Monitored Blocks
            </span>
          </div>
          <p className="text-xs text-[var(--fg-muted)] mt-0.5">
            Compare real-time NASA satellite telemetry across district agricultural zones
          </p>
        </div>

        {/* View toggles & Metric filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Layer switcher */}
          <div className="flex items-center rounded-xl bg-[var(--bg-surface-subtle)] p-1 border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => setActiveMetric("moisture")}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer",
                activeMetric === "moisture"
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
              )}
            >
              Soil Moisture
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric("ndvi")}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer",
                activeMetric === "ndvi"
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
              )}
            >
              NDVI Greenness
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric("cwsi")}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer",
                activeMetric === "cwsi"
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
              )}
            >
              Water Stress
            </button>
          </div>

          {/* Visual vs List Switcher */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === "visual" ? "list" : "visual")}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] px-3 py-1.5 text-xs font-semibold text-[var(--fg-primary)] hover:bg-[var(--bg-surface)] transition-all cursor-pointer"
          >
            <List className="h-3.5 w-3.5 text-[var(--primary)]" />
            <span>{viewMode === "visual" ? "Table View" : "Visual Grid"}</span>
          </button>
        </div>
      </div>

      {/* Main Dual-Column Workspace on Desktop (lg:grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left/Main Column: Visual Grid or List Table */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {viewMode === "visual" ? (
            <div className="relative rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-xs">
              {/* Legend & Instructions Bar */}
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pb-3 border-b border-[var(--border-subtle)]/60">
                <span className="flex items-center gap-1.5 font-medium text-[var(--fg-secondary)]">
                  <MapPin className="h-4 w-4 text-[var(--primary)] shrink-0" />
                  <span>Click any field block to inspect live satellite telemetry</span>
                </span>
                <div className="flex items-center gap-3 text-[11px] font-medium">
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--status-success)]" /> Optimal
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--status-warning)]" /> Moderate
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--status-danger)]" /> Deficit/Risk
                  </span>
                </div>
              </div>

              {/* Responsive Block Grid: auto-fills across wide screens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {filteredBlocks.map((block) => {
                  const m = metricsMap[block.id];
                  const isUserBlock = block.id === userBlockId;
                  const isSelected = block.id === selectedBlockId;
                  const isCritical = m && (m.cwsi > 0.65 || m.floodScore > 0.65 || m.soilMoistureSurface.value < 25);
                  const isStressed = m && (m.cwsi > 0.5 || m.soilMoistureSurface.value < 30);

                  const statusColor = isCritical
                    ? "border-[var(--status-danger)]/70 bg-[var(--status-danger-bg)]/20 hover:border-[var(--status-danger)]"
                    : isStressed
                    ? "border-[var(--status-warning)]/70 bg-[var(--status-warning-bg)]/20 hover:border-[var(--status-warning)]"
                    : "border-[var(--status-success)]/70 bg-[var(--status-success-bg)]/20 hover:border-[var(--status-success)]";

                  return (
                    <button
                      key={block.id}
                      type="button"
                      onClick={() => handleBlockClick(block)}
                      className={cn(
                        "group relative flex flex-col justify-between p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer",
                        statusColor,
                        isSelected && "ring-2 ring-[var(--primary)] ring-offset-2 border-[var(--primary)] bg-[var(--primary-subtle)]/40",
                        !isSelected && "hover:shadow-md"
                      )}
                    >
                      {/* Active / Registered Tag */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                          {block.subDistrict}
                        </span>
                        {isUserBlock && (
                          <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider shadow-xs">
                            Active Farm
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-[var(--fg-primary)] group-hover:text-[var(--primary)] transition-colors leading-tight">
                          {block.name}
                        </h4>
                        <div className="text-xs text-[var(--fg-secondary)] mt-0.5">
                          {block.primaryCrop || "Rice"} • {block.cropStage || "Vegetative"}
                        </div>
                      </div>

                      {/* Display metric based on active layer filter */}
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]/60 text-xs">
                        {activeMetric === "moisture" && (
                          <>
                            <span className="text-[var(--fg-muted)]">Soil Moisture:</span>
                            <span className="font-mono font-bold text-[var(--fg-primary)]">
                              {m ? `${m.soilMoistureSurface.value.toFixed(0)}% VWC` : "-"}
                            </span>
                          </>
                        )}
                        {activeMetric === "ndvi" && (
                          <>
                            <span className="text-[var(--fg-muted)]">NDVI Index:</span>
                            <span className="font-mono font-bold text-[var(--status-success)]">
                              {m ? m.ndvi.value.toFixed(2) : "-"}
                            </span>
                          </>
                        )}
                        {activeMetric === "cwsi" && (
                          <>
                            <span className="text-[var(--fg-muted)]">Stress Index:</span>
                            <span className="font-mono font-bold text-[var(--fg-primary)]">
                              {m ? `${m.cwsi.toFixed(2)} / 1.0` : "-"}
                            </span>
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Accessible Table View */
            <div className="rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-x-auto shadow-xs">
              <table className="w-full text-left text-sm" role="table">
                <thead className="bg-[var(--bg-surface-subtle)] border-b border-[var(--border-subtle)] text-xs text-[var(--fg-muted)] uppercase font-semibold">
                  <tr>
                    <th className="p-3.5">Block Name</th>
                    <th className="p-3.5">Sub-district</th>
                    <th className="p-3.5">Primary Crop</th>
                    <th className="p-3.5">Soil Moisture</th>
                    <th className="p-3.5">Water Stress</th>
                    <th className="p-3.5">Health Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {filteredBlocks.map((block) => {
                    const m = metricsMap[block.id];
                    const isCritical = m && (m.cwsi > 0.65 || m.floodScore > 0.65);
                    const isStressed = m && m.cwsi > 0.5;
                    const isSelected = block.id === selectedBlockId;
                    return (
                      <tr
                        key={block.id}
                        onClick={() => handleBlockClick(block)}
                        className={cn(
                          "hover:bg-[var(--bg-surface-subtle)] transition-colors cursor-pointer",
                          isSelected && "bg-[var(--primary-subtle)]/30 font-semibold"
                        )}
                      >
                        <td className="p-3.5 font-bold text-[var(--fg-primary)]">
                          {block.name}
                        </td>
                        <td className="p-3.5 text-xs text-[var(--fg-muted)]">
                          {block.subDistrict}
                        </td>
                        <td className="p-3.5 text-xs text-[var(--fg-secondary)]">
                          {block.primaryCrop || "Rice"} ({block.cropStage || "Vegetative"})
                        </td>
                        <td className="p-3.5 font-mono font-medium">
                          {m ? `${m.soilMoistureSurface.value.toFixed(1)}%` : "-"}
                        </td>
                        <td className="p-3.5 font-mono font-medium">
                          {m ? m.cwsi.toFixed(2) : "-"}
                        </td>
                        <td className="p-3.5">
                          <MetricBadge severity={isCritical ? "high" : isStressed ? "medium" : "low"}>
                            {isCritical ? "Alert Deficit" : isStressed ? "Advisory" : "Healthy"}
                          </MetricBadge>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBlockClick(block);
                            }}
                            className="text-xs font-bold text-[var(--primary)] hover:underline"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Persistent Live Field Block Inspector (lg:block) */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="sticky top-32 rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-xs space-y-4">
            {selectedBlock && selectedMetrics ? (
              <>
                <div className="flex items-start justify-between pb-3 border-b border-[var(--border-subtle)]">
                  <div>
                    <span className="text-[11px] font-mono text-[var(--fg-muted)] uppercase tracking-wider">
                      {selectedBlock.subDistrict}, Kurigram
                    </span>
                    <h3 className="text-xl font-bold text-[var(--fg-primary)] leading-tight mt-0.5">
                      {selectedBlock.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[var(--fg-secondary)]">
                        {selectedBlock.farmerCount} Registered Smallholders
                      </span>
                      <span>•</span>
                      <span className="text-xs font-medium text-[var(--primary)]">
                        {selectedBlock.pumpAssetCount} Solar Pumps
                      </span>
                    </div>
                  </div>

                  <MetricBadge severity={selectedMetrics.cwsi > 0.6 ? "medium" : "low"}>
                    {selectedMetrics.cwsi > 0.6 ? "Advisory Watch" : "Optimal Conditions"}
                  </MetricBadge>
                </div>

                {/* Telemetry Metric Cards */}
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="rounded-xl bg-[var(--bg-surface-subtle)] p-3 border border-[var(--border-subtle)]/60">
                    <span className="text-[var(--fg-muted)]">Surface Moisture</span>
                    <div className="text-xl font-bold font-mono text-[var(--fg-primary)] mt-0.5">
                      {selectedMetrics.soilMoistureSurface.value.toFixed(1)}%
                    </div>
                    <span className="text-[10px] text-[var(--fg-muted)] font-mono">
                      Baseline: {selectedMetrics.soilMoistureSurface.baseline}%
                    </span>
                  </div>

                  <div className="rounded-xl bg-[var(--bg-surface-subtle)] p-3 border border-[var(--border-subtle)]/60">
                    <span className="text-[var(--fg-muted)]">Root-Zone Moisture</span>
                    <div className="text-xl font-bold font-mono text-[var(--fg-primary)] mt-0.5">
                      {selectedMetrics.soilMoistureRootZone.value.toFixed(1)}%
                    </div>
                    <span className="text-[10px] text-[var(--fg-muted)] font-mono">
                      Baseline: {selectedMetrics.soilMoistureRootZone.baseline}%
                    </span>
                  </div>

                  <div className="rounded-xl bg-[var(--bg-surface-subtle)] p-3 border border-[var(--border-subtle)]/60">
                    <span className="text-[var(--fg-muted)]">Water Stress (CWSI)</span>
                    <div className="text-xl font-bold font-mono text-[var(--fg-primary)] mt-0.5">
                      {selectedMetrics.cwsi.toFixed(2)}
                    </div>
                    <span className="text-[10px] text-[var(--fg-muted)] font-mono">
                      {selectedMetrics.cwsi > 0.6 ? "Pumping Recommended" : "Water Sufficient"}
                    </span>
                  </div>

                  <div className="rounded-xl bg-[var(--bg-surface-subtle)] p-3 border border-[var(--border-subtle)]/60">
                    <span className="text-[var(--fg-muted)]">7d Rain Outlook</span>
                    <div className="text-xl font-bold font-mono text-[var(--fg-primary)] mt-0.5">
                      {selectedMetrics.precip7dForecast.toFixed(1)} mm
                    </div>
                    <span className="text-[10px] text-[var(--fg-muted)] font-mono">
                      Past 7d: {selectedMetrics.precip7dActual.toFixed(0)} mm
                    </span>
                  </div>
                </div>

                {/* Specific Action Guidance */}
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-3 text-xs space-y-1.5">
                  <span className="font-bold text-[var(--fg-primary)] block">Field Advisory Recommendation:</span>
                  <p className="text-[var(--fg-secondary)] leading-relaxed">
                    {selectedMetrics.cwsi > 0.6
                      ? "High daytime canopy transpiration. Prioritize evening solar pumping (17:30 to 19:30) to replenish root zone without evaporative penalty."
                      : "Soil moisture and thermal conditions are optimal. Maintain field boundaries and prepare for normal top-dress schedule."}
                  </p>
                </div>

                {/* Set as Active Block Button */}
                {onSelectUserBlock && selectedBlock.id !== userBlockId && (
                  <Button
                    onClick={() => onSelectUserBlock(selectedBlock.id)}
                    className="w-full text-xs font-bold gap-1.5"
                  >
                    <Check className="h-4 w-4" />
                    <span>Switch Active Farm Block to {selectedBlock.name}</span>
                  </Button>
                )}

                {/* Provenance */}
                <div className="pt-2 border-t border-[var(--border-subtle)]/60 flex items-center justify-between text-xs">
                  <SourceLabel source={selectedMetrics.sources[0]} />
                  <span className="text-[10px] text-[var(--fg-muted)] font-mono">
                    LST: {selectedMetrics.lst.toFixed(0)}°C
                  </span>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-xs text-[var(--fg-muted)]">
                Select a block on the left to inspect its telemetry.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slide-Up Drawer for Mobile screens (< 1024px) */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="bottom" className="sm:max-w-xl mx-auto rounded-t-2xl max-h-[85vh] overflow-y-auto">
          {selectedBlock && selectedMetrics && (
            <div className="space-y-4">
              <SheetHeader className="text-left border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-[var(--fg-muted)] uppercase">
                      {selectedBlock.subDistrict}, Kurigram
                    </span>
                    <SheetTitle className="text-lg font-bold text-[var(--fg-primary)]">
                      {selectedBlock.name}
                    </SheetTitle>
                  </div>
                  <MetricBadge severity={selectedMetrics.cwsi > 0.6 ? "medium" : "low"}>
                    {selectedMetrics.cwsi > 0.6 ? "Advisory Watch" : "Optimal Conditions"}
                  </MetricBadge>
                </div>
              </SheetHeader>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-[var(--bg-surface-subtle)] p-3 border border-[var(--border-subtle)]/60">
                  <span className="text-[var(--fg-muted)]">Soil Moisture (Root Zone)</span>
                  <div className="text-xl font-bold font-mono text-[var(--fg-primary)] mt-0.5">
                    {selectedMetrics.soilMoistureRootZone.value.toFixed(1)}%
                  </div>
                </div>

                <div className="rounded-xl bg-[var(--bg-surface-subtle)] p-3 border border-[var(--border-subtle)]/60">
                  <span className="text-[var(--fg-muted)]">Water Stress (CWSI)</span>
                  <div className="text-xl font-bold font-mono text-[var(--fg-primary)] mt-0.5">
                    {selectedMetrics.cwsi.toFixed(2)}
                  </div>
                </div>

                <div className="rounded-xl bg-[var(--bg-surface-subtle)] p-3 border border-[var(--border-subtle)]/60">
                  <span className="text-[var(--fg-muted)]">Rainfall Forecast (7d)</span>
                  <div className="text-xl font-bold font-mono text-[var(--fg-primary)] mt-0.5">
                    {selectedMetrics.precip7dForecast.toFixed(1)} mm
                  </div>
                </div>

                <div className="rounded-xl bg-[var(--bg-surface-subtle)] p-3 border border-[var(--border-subtle)]/60">
                  <span className="text-[var(--fg-muted)]">Primary Crop</span>
                  <div className="text-sm font-bold text-[var(--fg-primary)] mt-1 truncate">
                    {selectedBlock.primaryCrop || "Rice"}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-3 text-xs space-y-1">
                <span className="font-semibold text-[var(--fg-primary)] block">Actionable Guidance:</span>
                <p className="text-[var(--fg-secondary)] leading-relaxed">
                  {selectedMetrics.cwsi > 0.6
                    ? "Deficit detected. Schedule supplemental irrigation before afternoon heat peak to preserve flower setting."
                    : "Moisture conditions are favorable for current growth stage. Maintain regular weeding and monitoring."}
                </p>
              </div>

              {onSelectUserBlock && selectedBlock.id !== userBlockId && (
                <Button
                  onClick={() => {
                    onSelectUserBlock(selectedBlock.id);
                    setDrawerOpen(false);
                  }}
                  className="w-full text-xs font-bold"
                >
                  Set as Active Farm Block
                </Button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
