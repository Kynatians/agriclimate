"use client";

import * as React from "react";
import { Block, BlockMetrics, TimeSeriesPoint } from "@/lib/dal/types";
import { StatTile } from "@/components/shared/StatTile";
import { TrendSparkline } from "@/components/shared/TrendSparkline";
import { SourceLabel } from "@/components/shared/SourceLabel";
import { MetricBadge } from "@/components/shared/MetricBadge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Radio, Save, Sprout, Droplets, CloudRain, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlockDetailProps {
  block: Block;
  metrics: BlockMetrics;
  timeSeries?: TimeSeriesPoint[];
  onBack: () => void;
  onSendAlert: (block: Block) => void;
  className?: string;
}

export function BlockDetail({
  block,
  metrics,
  timeSeries = [],
  onBack,
  onSendAlert,
  className,
}: BlockDetailProps) {
  const [officerNote, setOfficerNote] = React.useState("");
  const [noteSaved, setNoteSaved] = React.useState(false);

  const handleSaveNote = () => {
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  // Sparkline data from timeSeries or fallback
  const ndviTrend = timeSeries.map((p) => p.ndvi);
  const moistureTrend = timeSeries.map((p) => p.soilMoisture);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Back button & Block Header */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] hover:underline mb-2 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to District Overview</span>
        </button>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-3.5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono text-[var(--fg-muted)]">
                {block.subDistrict}, Kurigram
              </span>
              <h3 className="text-lg font-bold text-[var(--fg-primary)] leading-tight">
                {block.name}
              </h3>
            </div>
            <MetricBadge severity={metrics.cwsi > 0.6 ? "medium" : "low"}>
              {metrics.cwsi > 0.6 ? "Water Stress" : "Normal"}
            </MetricBadge>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[var(--border-subtle)]/70 pt-2 text-center text-xs">
            <div>
              <span className="text-[10px] text-[var(--fg-muted)] block">Primary Crop</span>
              <span className="font-bold text-[var(--fg-primary)] capitalize">
                {block.primaryCrop || "Rice"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[var(--fg-muted)] block">Growth Stage</span>
              <span className="font-bold text-[var(--fg-primary)] capitalize">
                {block.cropStage || "Vegetative"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[var(--fg-muted)] block">Registered</span>
              <span className="font-bold font-mono text-[var(--fg-primary)]">
                {block.farmerCount} farmers
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Metric Tiles */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)]">
          Live Telemetry & Anomaly Tracking
        </h4>

        <div className="grid grid-cols-2 gap-2.5">
          <StatTile
            label="Vegetation (NDVI)"
            value={metrics.ndvi.value.toFixed(2)}
            unit="NDVI"
            anomaly={metrics.ndvi.anomaly}
            source="MODIS 250m"
          />

          <StatTile
            label="Root Zone Moisture"
            value={`${metrics.soilMoistureRootZone.value.toFixed(1)}%`}
            unit="VWC"
            anomaly={metrics.soilMoistureRootZone.anomaly}
            source="SMAP L4"
          />

          <StatTile
            label="Plant Stress (CWSI)"
            value={metrics.cwsi.toFixed(2)}
            unit="index"
            source="ECOSTRESS"
          />

          <StatTile
            label="Flood Score (FSS)"
            value={metrics.floodScore.toFixed(2)}
            unit="index"
            source="IMERG + SRTM"
          />
        </div>
      </div>

      {/* 30-Day Trend Sparklines */}
      {timeSeries.length > 0 && (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[var(--fg-muted)] uppercase tracking-wider text-[10px]">
              30-Day Telemetry Trend
            </span>
            <span className="font-mono text-[10px] text-[var(--fg-muted)]">Daily cadence</span>
          </div>

          <div className="space-y-2 pt-1">
            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-[var(--fg-muted)]">NDVI Trajectory</span>
                <span className="font-mono font-bold text-[var(--status-success)]">
                  {metrics.ndvi.value.toFixed(2)}
                </span>
              </div>
              <TrendSparkline points={timeSeries} metric="ndvi" color="#16a34a" height={36} />
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-[var(--fg-muted)]">Soil Moisture Trend</span>
                <span className="font-mono font-bold text-[var(--status-info)]">
                  {metrics.soilMoistureRootZone.value.toFixed(1)}%
                </span>
              </div>
              <TrendSparkline points={timeSeries} metric="soilMoisture" color="#2563eb" height={36} />
            </div>
          </div>
        </div>
      )}

      {/* Agronomic Guidance */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-3 text-xs space-y-1">
        <span className="font-bold text-[var(--fg-primary)] block">Compound Recommendation:</span>
        <p className="text-[var(--fg-secondary)] leading-relaxed text-[11px]">
          {metrics.cwsi > 0.65
            ? "Urgent irrigation rotation required. Schedule community pump allocation for 3.5h evening run."
            : metrics.soilMoistureSurface.value > 45
            ? "Saturated field conditions. Clear peripheral drainage canals to avert root asphyxiation."
            : "Moisture and NDVI within expected bounds for seasonal crop stage. Standard observation."}
        </p>
      </div>

      {/* Officer Internal Notes */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
            Officer Field Observation Log
          </label>
          {noteSaved && (
            <span className="flex items-center gap-1 text-[10px] text-[var(--status-success)] font-semibold">
              <ShieldCheck className="h-3 w-3" /> Note logged
            </span>
          )}
        </div>

        <textarea
          rows={2}
          value={officerNote}
          onChange={(e) => setOfficerNote(e.target.value)}
          placeholder="Record ground inspection findings, pest flags, or pump status..."
          className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-2 text-xs text-[var(--fg-primary)] placeholder-[var(--fg-muted)] focus:border-[var(--primary)] focus:outline-hidden"
        />

        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSaveNote}
            className="gap-1 text-[11px] h-7 cursor-pointer"
          >
            <Save className="h-3 w-3" />
            <span>Save Observation</span>
          </Button>
        </div>
      </div>

      {/* Action Button: Broadcast Alert for this Block */}
      <Button
        onClick={() => onSendAlert(block)}
        className="w-full gap-2 text-xs font-bold shadow-xs cursor-pointer"
      >
        <Radio className="h-3.5 w-3.5" />
        <span>Dispatch Advisory to Block Farmers</span>
      </Button>

      {/* Provenance Stamp */}
      <div className="pt-2 border-t border-[var(--border-subtle)]/70">
        <SourceLabel source={metrics.sources[0] || "NASA Satellites"} />
      </div>
    </div>
  );
}
