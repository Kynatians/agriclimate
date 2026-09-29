"use client";

import * as React from "react";
import { DistrictSummary, Block } from "@/lib/dal/types";
import { StatTile } from "@/components/shared/StatTile";
import { SourceLabel } from "@/components/shared/SourceLabel";
import { Building2, Users, AlertTriangle, Droplets, Leaf, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface DistrictSummaryViewProps {
  summary: DistrictSummary;
  blocks: Block[];
  onSelectBlock: (blockId: string) => void;
  className?: string;
}

export function DistrictSummaryView({
  summary,
  blocks,
  onSelectBlock,
  className,
}: DistrictSummaryViewProps) {
  return (
    <div className={cn("space-y-5", className)}>
      {/* District Header Overview */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="rounded-md bg-[var(--primary-subtle)] px-2 py-0.5 text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider">
            Kurigram District Summary
          </span>
          <span className="text-[10px] font-mono text-[var(--fg-muted)]">
            Updated Today
          </span>
        </div>
        <h3 className="text-lg font-bold text-[var(--fg-primary)]">
          {summary.districtName?.en || "Kurigram District"}
        </h3>
        <p className="text-xs text-[var(--fg-secondary)] mt-0.5 leading-relaxed">
          Aggregated climate & agronomic telemetry across 12 monitoring blocks.
        </p>

        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[var(--border-subtle)]/70 text-center">
          <div>
            <span className="text-[10px] text-[var(--fg-muted)] block">Total Blocks</span>
            <span className="text-sm font-bold font-mono text-[var(--fg-primary)]">
              {summary.totalBlocks}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[var(--fg-muted)] block">Registered Farmers</span>
            <span className="text-sm font-bold font-mono text-[var(--fg-primary)]">
              {summary.totalFarmers.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[var(--fg-muted)] block">Active Alerts</span>
            <span className="text-sm font-bold font-mono text-[var(--status-danger)]">
              {summary.activeAlertCount?.total ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Aggregate KPI Tiles */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)]">
          District-Wide Telemetry Averages
        </h4>

        <div className="grid grid-cols-2 gap-3">
          <StatTile
            label="Avg NDVI Greenness"
            value={summary.averageNdvi?.value?.toFixed(2) ?? "0.58"}
            unit="NDVI"
            anomaly={summary.averageNdvi?.anomaly ?? 0}
            source="MODIS 250m"
          />

          <StatTile
            label="Avg Root-Zone Moisture"
            value={`${summary.averageSoilMoisture?.value?.toFixed(1) ?? "32.0"}%`}
            unit="VWC"
            anomaly={summary.averageSoilMoisture?.anomaly ?? 0}
            source="SMAP L4 9km"
          />
        </div>
      </div>

      {/* Block Roster Quick Nav */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)]">
          Monitored Field Blocks ({blocks.length})
        </h4>

        <div className="divide-y divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden">
          {blocks.map((block) => (
            <button
              key={block.id}
              type="button"
              onClick={() => onSelectBlock(block.id)}
              className="flex w-full items-center justify-between p-2.5 text-left text-xs transition-colors hover:bg-[var(--bg-surface-subtle)] cursor-pointer"
            >
              <div>
                <span className="font-bold text-[var(--fg-primary)] block">
                  {block.name}
                </span>
                <span className="text-[10px] text-[var(--fg-muted)]">
                  {block.subDistrict} · {block.primaryCrop || "Rice"}
                </span>
              </div>

              <div className="text-right">
                <span className="font-mono text-[11px] text-[var(--fg-secondary)] block">
                  {block.farmerCount} farmers
                </span>
                <span className="text-[9px] text-[var(--primary)] uppercase font-semibold">
                  Inspect &rarr;
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Provenance Stamp */}
      <div className="pt-2 border-t border-[var(--border-subtle)]/70">
        <SourceLabel source="NASA POWER + SMAP + MODIS + IMERG" />
      </div>
    </div>
  );
}
