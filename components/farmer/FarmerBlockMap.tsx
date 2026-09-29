"use client";

import * as React from "react";
import { List, MapPin, CheckCircle2, AlertTriangle, AlertCircle, ChevronRight } from "lucide-react";
import { Block, BlockMetrics } from "@/lib/dal/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { MetricBadge } from "@/components/shared/MetricBadge";
import { SourceLabel } from "@/components/shared/SourceLabel";
import { useTranslation } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

interface FarmerBlockMapProps {
  blocks: Block[];
  metricsMap: Record<string, BlockMetrics>;
  userBlockId?: string;
  className?: string;
}

export function FarmerBlockMap({
  blocks,
  metricsMap,
  userBlockId = "blk_kurigram_01",
  className,
}: FarmerBlockMapProps) {
  const [selectedBlock, setSelectedBlock] = React.useState<Block | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"visual" | "list">("visual");
  const { t } = useTranslation();

  const handleBlockSelect = (block: Block) => {
    setSelectedBlock(block);
    setDrawerOpen(true);
  };

  const selectedMetrics = selectedBlock ? metricsMap[selectedBlock.id] : null;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Top Toggle: Visual Map vs Accessible List */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-[var(--fg-primary)]">
            Regional Farm Blocks
          </h3>
          <p className="text-xs text-[var(--fg-muted)]">
            Color-coded agricultural status (Kurigram District)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setViewMode(viewMode === "visual" ? "list" : "visual")}
          className="flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--fg-primary)] hover:bg-[var(--bg-surface-subtle)] transition-all cursor-pointer"
        >
          <List className="h-4 w-4" />
          <span>{viewMode === "visual" ? "Show List View" : "Show Map View"}</span>
        </button>
      </div>

      {viewMode === "visual" ? (
        /* Visual SVG Grid Map (Accessible & Responsive) */
        <div className="relative rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-6 shadow-sm overflow-hidden">
          <div className="mb-4 flex items-center justify-between text-xs text-[var(--fg-muted)]">
            <span className="flex items-center gap-1 font-medium text-[var(--fg-secondary)]">
              <MapPin className="h-4 w-4 text-[var(--primary)]" />
              Tap your field block to inspect condition summary
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-[var(--status-success)]" /> Safe</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-[var(--status-warning)]" /> Advisory</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-[var(--status-danger)]" /> Alert</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {blocks.map((block) => {
              const m = metricsMap[block.id];
              const isUserBlock = block.id === userBlockId;
              const isStressed = m && m.cwsi > 0.6;
              const isCritical = m && (m.cwsi > 0.7 || m.floodScore > 0.7);

              const statusColor = isCritical
                ? "border-[var(--status-danger)]/80 bg-[var(--status-danger-bg)]/30 hover:border-[var(--status-danger)]"
                : isStressed
                ? "border-[var(--status-warning)]/80 bg-[var(--status-warning-bg)]/30 hover:border-[var(--status-warning)]"
                : "border-[var(--status-success)]/80 bg-[var(--status-success-bg)]/30 hover:border-[var(--status-success)]";

              return (
                <button
                  key={block.id}
                  type="button"
                  onClick={() => handleBlockSelect(block)}
                  className={cn(
                    "flex flex-col justify-between p-3.5 rounded-xl border-2 text-left transition-all hover:scale-102 active:scale-98 cursor-pointer relative",
                    statusColor,
                    isUserBlock && "ring-2 ring-[var(--primary)] ring-offset-2"
                  )}
                >
                  {isUserBlock && (
                    <span className="absolute -top-2.5 left-2 rounded-full bg-[var(--primary)] px-2 py-0.2 text-[9px] font-bold text-white uppercase tracking-wider">
                      My Farm
                    </span>
                  )}
                  <div>
                    <span className="text-xs text-[var(--fg-muted)] font-mono">{block.subDistrict}</span>
                    <h4 className="text-sm font-bold text-[var(--fg-primary)] mt-0.5 leading-tight">{block.name}</h4>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]/50 text-[11px]">
                    <span className="font-mono text-[var(--fg-secondary)]">
                      {m ? `${m.soilMoistureSurface.value.toFixed(0)}% VWC` : "-"}
                    </span>
                    <span className="font-bold">
                      {isCritical ? "ALERT" : isStressed ? "WATCH" : "OPTIMAL"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Accessible List View */
        <div className="rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden">
          <table className="w-full text-left text-sm" role="table">
            <thead className="bg-[var(--bg-surface-subtle)] border-b border-[var(--border-subtle)] text-xs text-[var(--fg-muted)] uppercase">
              <tr>
                <th className="p-3">Block / Sub-district</th>
                <th className="p-3">Primary Crop</th>
                <th className="p-3">Soil Moisture</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {blocks.map((block) => {
                const m = metricsMap[block.id];
                const isCritical = m && (m.cwsi > 0.7 || m.floodScore > 0.7);
                const isStressed = m && m.cwsi > 0.6;
                return (
                  <tr
                    key={block.id}
                    onClick={() => handleBlockSelect(block)}
                    className="hover:bg-[var(--bg-surface-subtle)] transition-colors cursor-pointer"
                  >
                    <td className="p-3">
                      <div className="font-bold text-[var(--fg-primary)]">{block.name}</div>
                      <div className="text-xs text-[var(--fg-muted)]">{block.subDistrict}</div>
                    </td>
                    <td className="p-3 text-xs text-[var(--fg-secondary)]">
                      {block.primaryCrop || "Fallow"}
                    </td>
                    <td className="p-3 font-mono font-medium">
                      {m ? `${m.soilMoistureSurface.value.toFixed(1)}%` : "-"}
                    </td>
                    <td className="p-3">
                      <MetricBadge severity={isCritical ? "high" : isStressed ? "medium" : "low"}>
                        {isCritical ? "Severe Alert" : isStressed ? "Advisory" : "Healthy"}
                      </MetricBadge>
                    </td>
                    <td className="p-3 text-right">
                      <ChevronRight className="h-4 w-4 inline text-[var(--fg-muted)]" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Block Condition Slide-Up Drawer */}
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
                    {selectedMetrics.soilMoistureRootZone.value.toFixed(1)}% VWC
                  </div>
                  <span className="text-[10px] text-[var(--fg-muted)] font-mono">
                    Baseline: {selectedMetrics.soilMoistureRootZone.baseline}%
                  </span>
                </div>

                <div className="rounded-xl bg-[var(--bg-surface-subtle)] p-3 border border-[var(--border-subtle)]/60">
                  <span className="text-[var(--fg-muted)]">Plant Water Stress (CWSI)</span>
                  <div className="text-xl font-bold font-mono text-[var(--fg-primary)] mt-0.5">
                    {selectedMetrics.cwsi.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-[var(--fg-muted)] font-mono">
                    {selectedMetrics.cwsi > 0.6 ? "Irrigation Needed" : "Water Sufficient"}
                  </span>
                </div>

                <div className="rounded-xl bg-[var(--bg-surface-subtle)] p-3 border border-[var(--border-subtle)]/60">
                  <span className="text-[var(--fg-muted)]">Rainfall Forecast (7d)</span>
                  <div className="text-xl font-bold font-mono text-[var(--fg-primary)] mt-0.5">
                    {selectedMetrics.precip7dForecast.toFixed(0)} mm
                  </div>
                  <span className="text-[10px] text-[var(--fg-muted)] font-mono">
                    Past 7d: {selectedMetrics.precip7dActual.toFixed(0)} mm
                  </span>
                </div>

                <div className="rounded-xl bg-[var(--bg-surface-subtle)] p-3 border border-[var(--border-subtle)]/60">
                  <span className="text-[var(--fg-muted)]">Primary Crop & Stage</span>
                  <div className="text-sm font-bold text-[var(--fg-primary)] mt-1 truncate">
                    {selectedBlock.primaryCrop || "Rice"}
                  </div>
                  <span className="text-[10px] text-[var(--primary)] uppercase font-semibold">
                    Stage: {selectedBlock.cropStage || "Vegetative"}
                  </span>
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

              <div className="pt-2 border-t border-[var(--border-subtle)]/60 flex items-center justify-between text-xs">
                <SourceLabel source={selectedMetrics.sources[0]} />
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
