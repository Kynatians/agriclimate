"use client";

import * as React from "react";
import { Block, BlockMetrics, DistrictSummary } from "@/lib/dal/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, FileText, CheckCircle2, ShieldAlert } from "lucide-react";
import { SourceLabel } from "@/components/shared/SourceLabel";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: DistrictSummary;
  blocks: Block[];
  metricsMap: Record<string, BlockMetrics>;
}

export function ReportModal({
  open,
  onOpenChange,
  summary,
  blocks,
  metricsMap,
}: ReportModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader className="border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary-subtle)] text-[var(--primary)]">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">
                  Official District Climate Intelligence Report
                </DialogTitle>
                <DialogDescription className="text-xs">
                  AgriClimate NASA Telemetry Briefing · Kurigram District
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePrint}
                className="gap-1 text-xs cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print / PDF</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Printable Document Body */}
        <div className="space-y-6 py-4 text-xs text-[var(--fg-primary)] print:p-0">
          {/* Executive Header */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-mono text-[var(--primary)] font-bold">
                Ministry of Agriculture / DAE Kurigram Station
              </span>
              <h3 className="text-lg font-bold text-[var(--fg-primary)]">
                {summary.districtName?.en || "Kurigram District"} Agriculture & Climate Bulletin
              </h3>
              <p className="text-[11px] text-[var(--fg-muted)] mt-0.5">
                Report Generated: {generatedDate} · 12 Monitored Geospatial Units
              </p>
            </div>

            <div className="rounded-lg bg-[var(--bg-surface)] p-2.5 border border-[var(--border-subtle)] text-right">
              <div className="text-[10px] text-[var(--fg-muted)]">Active Risk Status</div>
              <div className="text-sm font-bold text-[var(--status-danger)]">
                {summary.activeAlertCount?.total ?? 0} Active Incident Alerts
              </div>
            </div>
          </div>

          {/* District KPI Summary Table */}
          <div className="space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-[11px] text-[var(--fg-muted)]">
              1. District-Wide Environmental Indicators
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg border border-[var(--border-subtle)] p-3 bg-[var(--bg-surface)]">
                <span className="text-[10px] text-[var(--fg-muted)] block">Avg NDVI</span>
                <span className="text-base font-bold font-mono text-[var(--fg-primary)]">
                  {summary.averageNdvi?.value?.toFixed(2) ?? "0.58"}
                </span>
                <span className="text-[10px] text-[var(--status-success)] block font-mono">
                  {(summary.averageNdvi?.anomaly ?? 0) > 0 ? "+" : ""}
                  {(summary.averageNdvi?.anomaly ?? 0).toFixed(1)}% anomaly
                </span>
              </div>

              <div className="rounded-lg border border-[var(--border-subtle)] p-3 bg-[var(--bg-surface)]">
                <span className="text-[10px] text-[var(--fg-muted)] block">Soil Moisture (Root)</span>
                <span className="text-base font-bold font-mono text-[var(--fg-primary)]">
                  {summary.averageSoilMoisture?.value?.toFixed(1) ?? "32.0"}%
                </span>
                <span className="text-[10px] text-[var(--status-warning)] block font-mono">
                  {(summary.averageSoilMoisture?.anomaly ?? 0) > 0 ? "+" : ""}
                  {(summary.averageSoilMoisture?.anomaly ?? 0).toFixed(1)}% anomaly
                </span>
              </div>

              <div className="rounded-lg border border-[var(--border-subtle)] p-3 bg-[var(--bg-surface)]">
                <span className="text-[10px] text-[var(--fg-muted)] block">Total Registered Farmers</span>
                <span className="text-base font-bold font-mono text-[var(--fg-primary)]">
                  {summary.totalFarmers.toLocaleString()}
                </span>
                <span className="text-[10px] text-[var(--fg-muted)] block">
                  12 agricultural blocks
                </span>
              </div>

              <div className="rounded-lg border border-[var(--border-subtle)] p-3 bg-[var(--bg-surface)]">
                <span className="text-[10px] text-[var(--fg-muted)] block">Primary Regional Crop</span>
                <span className="text-base font-bold text-[var(--fg-primary)]">
                  Boro Rice
                </span>
                <span className="text-[10px] text-[var(--primary)] block capitalize">
                  Flowering stage
                </span>
              </div>
            </div>
          </div>

          {/* Block Breakdown Matrix */}
          <div className="space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-[11px] text-[var(--fg-muted)]">
              2. Individual Block Telemetry Roster
            </h4>
            <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--bg-surface-subtle)] border-b border-[var(--border-subtle)] text-[10px] uppercase text-[var(--fg-muted)] font-mono">
                  <tr>
                    <th className="p-2.5">Block Name</th>
                    <th className="p-2.5">Sub-District</th>
                    <th className="p-2.5">Crop / Stage</th>
                    <th className="p-2.5">NDVI</th>
                    <th className="p-2.5">Soil Moisture</th>
                    <th className="p-2.5">CWSI</th>
                    <th className="p-2.5">Farmers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {blocks.map((block) => {
                    const m = metricsMap[block.id];
                    return (
                      <tr key={block.id} className="hover:bg-[var(--bg-surface-subtle)]/50">
                        <td className="p-2.5 font-bold text-[var(--fg-primary)]">
                          {block.name}
                        </td>
                        <td className="p-2.5 text-[var(--fg-secondary)]">
                          {block.subDistrict}
                        </td>
                        <td className="p-2.5 capitalize text-[11px]">
                          {block.primaryCrop || "Rice"} ({block.cropStage || "Vegetative"})
                        </td>
                        <td className="p-2.5 font-mono">
                          {m ? m.ndvi.value.toFixed(2) : "-"}
                        </td>
                        <td className="p-2.5 font-mono">
                          {m ? `${m.soilMoistureRootZone.value.toFixed(1)}%` : "-"}
                        </td>
                        <td className="p-2.5 font-mono">
                          {m ? m.cwsi.toFixed(2) : "-"}
                        </td>
                        <td className="p-2.5 font-mono">
                          {block.farmerCount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Provenance Stamp */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-3 text-[10px] text-[var(--fg-muted)]">
            <SourceLabel source="NASA POWER, SMAP L4, MODIS MOD13Q1, GPM IMERG" />
            <span>Kynatium Labs AgriClimate Intelligence Engine</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
