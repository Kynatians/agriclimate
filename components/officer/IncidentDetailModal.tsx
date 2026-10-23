"use client";

import * as React from "react";
import { Alert, Block, BlockMetrics } from "@/lib/dal/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MetricBadge } from "@/components/shared/MetricBadge";
import { useTranslation } from "@/lib/i18n/client";
import { useUiStore } from "@/lib/stores/ui";
import { cn } from "@/lib/utils";
import {
  ShieldAlert,
  Send,
  Clock,
  MapPin,
  Droplets,
  Sun,
  Flame,
  Waves,
  Wind,
  Users,
  Sprout,
  Satellite,
  CheckCircle2,
  AlertTriangle,
  Compass,
  FileCheck2,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";

interface IncidentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alert: Alert | null;
  block?: Block | null;
  metrics?: BlockMetrics | null;
  isDispatched?: boolean;
  onApproveAndBroadcast: (alert: Alert) => void;
}

export function IncidentDetailModal({
  open,
  onOpenChange,
  alert,
  block,
  metrics,
  isDispatched = false,
  onApproveAndBroadcast,
}: IncidentDetailModalProps) {
  const { getLocalized, locale } = useTranslation();
  const setSelectedBlockId = useUiStore((state) => state.setSelectedBlockId);
  const setOfficerTab = useUiStore((state) => state.setOfficerTab);

  if (!alert) return null;

  const handleLocateBlock = () => {
    if (alert.blockId) {
      setSelectedBlockId(alert.blockId);
      setOfficerTab("map");
      onOpenChange(false);
    }
  };

  const handleProceedToApprove = () => {
    onOpenChange(false);
    onApproveAndBroadcast(alert);
  };

  // Determine hazard icon & color
  const getHazardIcon = () => {
    switch (alert.type) {
      case "flood":
        return {
          icon: <Waves className="h-5 w-5 text-blue-500" />,
          bg: "bg-blue-500/10 border-blue-500/20 text-blue-500",
          name: "Flash Flood Hazard",
        };
      case "drought":
        return {
          icon: <Sun className="h-5 w-5 text-amber-500" />,
          bg: "bg-amber-500/10 border-amber-500/20 text-amber-500",
          name: "Agricultural Drought Hazard",
        };
      case "fire":
        return {
          icon: <Flame className="h-5 w-5 text-rose-500" />,
          bg: "bg-rose-500/10 border-rose-500/20 text-rose-500",
          name: "Thermal / Stubble Fire Hazard",
        };
      case "waterlogging":
        return {
          icon: <Droplets className="h-5 w-5 text-cyan-500" />,
          bg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-500",
          name: "Waterlogging Hazard",
        };
      case "cyclone":
        return {
          icon: <Wind className="h-5 w-5 text-purple-500" />,
          bg: "bg-purple-500/10 border-purple-500/20 text-purple-500",
          name: "Severe Cyclone / Storm Hazard",
        };
      default:
        return {
          icon: <ShieldAlert className="h-5 w-5 text-emerald-500" />,
          bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
          name: "Environmental Hazard",
        };
    }
  };

  const hazard = getHazardIcon();

  // Mitigation protocols based on alert type
  const getMitigationProtocols = () => {
    switch (alert.type) {
      case "flood":
        return [
          "Elevate harvested grain sacks and paddy seed stocks onto elevated platforms or community shelters.",
          "Clear drainage canal silt and inspect char embankment sluice gates immediately.",
          "Prepare emergency boat transport for livestock in low-lying floodplain char areas.",
        ];
      case "drought":
        return [
          "Mobilize solar pump clusters for urgent supplementary root-zone irrigation.",
          "Advise night or dawn irrigation to minimize high-temperature evaporative water loss.",
          "Apply organic straw mulch around standing crops to preserve existing sub-surface moisture.",
        ];
      case "fire":
        return [
          "Establish 3-meter cleared firebreak buffers around dry straw mounds and char farm boundaries.",
          "Verify community shallow tube-well pumps and reserve water containers are filled.",
          "Suspend mid-day open burning and field brush clearance until wind velocity subsides.",
        ];
      default:
        return [
          "Monitor daily satellite and weather radar updates through the Upazila agricultural portal.",
          "Coordinate with local Lead Farmers (Sub-Assistant Agricultural Officers - SAAO).",
          "Distribute protective crop inputs and ensure community drainage paths remain unobstructed.",
        ];
    }
  };

  const protocols = getMitigationProtocols();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 text-[var(--fg-primary)] bg-[var(--bg-surface)] border-[var(--border-subtle)] shadow-xl">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-[var(--border-subtle)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl border shrink-0",
                  hazard.bg
                )}
              >
                {hazard.icon}
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold leading-snug">
                  Incident Alert Verification & Pre-Approval
                </DialogTitle>
                <DialogDescription className="text-xs text-[var(--fg-muted)] flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="font-mono">ID: {alert.id}</span>
                  <span>•</span>
                  <span>Target: {block?.name || alert.blockId}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {alert.leadTimeHours}h lead window
                  </span>
                </DialogDescription>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <MetricBadge severity={alert.severity}>
                {alert.severity} priority
              </MetricBadge>
              {isDispatched && (
                <span className="flex items-center gap-1 rounded-full bg-[var(--status-success-bg)] px-2 py-0.5 text-[9px] font-bold text-[var(--status-success)] font-mono border border-[var(--status-success)]/30">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  Dispatched
                </span>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-1 text-xs">
          {/* Key Facts Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-2.5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[var(--fg-muted)] flex items-center gap-1">
                <ShieldAlert className="h-3 w-3 text-amber-500" />
                Hazard Type
              </span>
              <p className="font-bold text-[11px] text-[var(--fg-primary)] capitalize">
                {alert.type}
              </p>
              <span className="text-[9px] text-[var(--fg-muted)] block">
                {hazard.name}
              </span>
            </div>

            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-2.5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[var(--fg-muted)] flex items-center gap-1">
                <Clock className="h-3 w-3 text-blue-500" />
                Action Window
              </span>
              <p className="font-bold text-[11px] text-[var(--fg-primary)]">
                {alert.leadTimeHours} Hours
              </p>
              <span className="text-[9px] text-[var(--fg-muted)] block">
                Advance Warning
              </span>
            </div>

            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-2.5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[var(--fg-muted)] flex items-center gap-1">
                <Users className="h-3 w-3 text-emerald-500" />
                Farmer Impact
              </span>
              <p className="font-bold text-[11px] text-[var(--fg-primary)]">
                {block?.farmerCount ? block.farmerCount.toLocaleString() : "3,420"}
              </p>
              <span className="text-[9px] text-[var(--fg-muted)] block">
                Registered in Zone
              </span>
            </div>

            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-2.5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[var(--fg-muted)] flex items-center gap-1">
                <FileCheck2 className="h-3 w-3 text-purple-500" />
                Review Status
              </span>
              <p
                className={cn(
                  "font-bold text-[11px] capitalize",
                  isDispatched ? "text-[var(--status-success)]" : "text-amber-500"
                )}
              >
                {isDispatched ? "Broadcasting" : "Pending Officer Approval"}
              </p>
              <span className="text-[9px] text-[var(--fg-muted)] block">
                {isDispatched ? "Active in field" : "Requires Sign-off"}
              </span>
            </div>
          </div>

          {/* Full Narrative & Advisory Bulletin */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--fg-primary)] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Official Alert Headline & Narrative
              </span>
              <span className="text-[10px] font-mono text-[var(--fg-muted)]">
                {locale === "bn" ? "বাংলা সংস্করণ" : "English & Bangla"}
              </span>
            </div>

            <div className="space-y-1.5 bg-[var(--bg-surface)] p-3 rounded-lg border border-[var(--border-subtle)]">
              <h4 className="font-bold text-xs text-[var(--fg-primary)] leading-snug">
                {getLocalized(alert.headline)}
              </h4>
              <p className="text-xs text-[var(--fg-secondary)] leading-relaxed">
                {getLocalized(alert.detail)}
              </p>

              {/* Bilingual dual view if available */}
              {alert.detail?.bn && alert.detail?.en && locale !== "bn" && (
                <div className="pt-2 mt-2 border-t border-[var(--border-subtle)]/60 text-[11px] text-[var(--fg-muted)] font-bengali">
                  <span className="font-semibold block text-[10px] text-[var(--fg-muted)] uppercase mb-0.5">
                    বাংলা অনুবাদ (Bangla Translation):
                  </span>
                  {alert.detail.bn}
                </div>
              )}
            </div>

            {/* Timestamps Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-[var(--fg-muted)] font-mono pt-1">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Issued: {new Date(alert.issuedAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Expires: {new Date(alert.expiresAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Live Telemetry & Satellite Remote Sensing Triggers */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Satellite className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-xs font-bold text-[var(--fg-primary)]">
                  Ground Telemetry & Satellite Triggers
                </span>
              </div>
              <span className="text-[10px] text-[var(--fg-muted)] font-mono">
                As of: {metrics?.asOf || "Live"}
              </span>
            </div>

            {metrics ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {/* Metric 1: Soil Moisture */}
                <div className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-0.5">
                  <span className="text-[10px] text-[var(--fg-muted)] block">
                    Surface Soil Moisture
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono font-bold text-xs">
                      {metrics.soilMoistureSurface.value.toFixed(1)}%
                    </span>
                    <span
                      className={cn(
                        "text-[9px] font-mono",
                        metrics.soilMoistureSurface.anomaly < 0
                          ? "text-[var(--status-danger)]"
                          : "text-[var(--status-success)]"
                      )}
                    >
                      {metrics.soilMoistureSurface.anomaly > 0 ? "+" : ""}
                      {metrics.soilMoistureSurface.anomaly.toFixed(1)}%
                    </span>
                  </div>
                  <span className="text-[9px] text-[var(--fg-muted)]">
                    Root: {metrics.soilMoistureRootZone.value.toFixed(1)}% VWC
                  </span>
                </div>

                {/* Metric 2: Water Stress CWSI */}
                <div className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-0.5">
                  <span className="text-[10px] text-[var(--fg-muted)] block">
                    Water Stress (CWSI)
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span
                      className={cn(
                        "font-mono font-bold text-xs",
                        metrics.cwsi > 0.6
                          ? "text-[var(--status-danger)]"
                          : metrics.cwsi > 0.4
                          ? "text-[var(--status-warning)]"
                          : "text-[var(--status-success)]"
                      )}
                    >
                      {(metrics.cwsi * 100).toFixed(0)}%
                    </span>
                    <span className="text-[9px] text-[var(--fg-muted)]">
                      {metrics.cwsi > 0.6 ? "Critical" : metrics.cwsi > 0.4 ? "Moderate" : "Normal"}
                    </span>
                  </div>
                  <span className="text-[9px] text-[var(--fg-muted)]">
                    Index 0.0 - 1.0 scale
                  </span>
                </div>

                {/* Metric 3: Rain Forecast or Flood Score */}
                <div className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-0.5">
                  <span className="text-[10px] text-[var(--fg-muted)] block">
                    {alert.type === "flood" ? "Flood Risk (FSS)" : "7-Day Rain Forecast"}
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span
                      className={cn(
                        "font-mono font-bold text-xs",
                        alert.type === "flood" && metrics.floodScore > 0.7
                          ? "text-[var(--status-danger)]"
                          : "text-[var(--fg-primary)]"
                      )}
                    >
                      {alert.type === "flood"
                        ? `${(metrics.floodScore * 100).toFixed(0)}%`
                        : `${metrics.precip7dForecast.toFixed(1)} mm`}
                    </span>
                    <span className="text-[9px] text-[var(--fg-muted)] font-mono">
                      {alert.type === "flood" ? "Inundation" : `${metrics.precip7dActual.toFixed(0)}mm past`}
                    </span>
                  </div>
                  <span className="text-[9px] text-[var(--fg-muted)]">
                    {alert.type === "flood" ? "Runoff Risk" : "IMERG precipitation"}
                  </span>
                </div>

                {/* Metric 4: Thermal LST / FRP or NDVI */}
                <div className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-0.5">
                  <span className="text-[10px] text-[var(--fg-muted)] block">
                    {alert.type === "fire" ? "Thermal Power (FRP)" : "Surface Temp (LST)"}
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono font-bold text-xs">
                      {alert.type === "fire"
                        ? `${metrics.thermalFrp ?? 14.5} MW`
                        : `${metrics.lst.toFixed(1)} °C`}
                    </span>
                    <span className="text-[9px] text-[var(--fg-muted)]">
                      NDVI: {metrics.ndvi.value.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-[9px] text-[var(--fg-muted)]">
                    {alert.type === "fire" ? "VIIRS Fire Peak" : "Thermal sensor"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[var(--fg-muted)] italic py-2">
                Telemetry telemetry snapshot currently synchronizing with NASA FIRMS & SMAP sensors.
              </p>
            )}

            {/* Sensor Data Provenance Footnote */}
            <div className="flex items-center gap-1.5 text-[9px] text-[var(--fg-muted)] pt-1">
              <span className="font-semibold">Satellite Sources:</span>
              <span>NASA SMAP L3, Sentinel-1 SAR (Inundation), Sentinel-2 MSI (NDVI), GPM IMERG, NASA FIRMS VIIRS</span>
            </div>
          </div>

          {/* Block Agricultural Context & Location */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--fg-primary)] flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                Target Block Demographics & Assets
              </span>
              <button
                type="button"
                onClick={handleLocateBlock}
                className="flex items-center gap-1 text-[10px] font-semibold text-[var(--primary)] hover:underline cursor-pointer"
              >
                <Compass className="h-3 w-3" />
                <span>Locate on GIS Map</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                <span className="text-[10px] text-[var(--fg-muted)] block">Block & Upazila</span>
                <span className="font-bold text-[var(--fg-primary)]">
                  {block?.name || alert.blockId}
                </span>
                <span className="text-[9px] text-[var(--fg-muted)] block">
                  {block?.subDistrict ? `${block.subDistrict} Upazila` : "Kurigram District"}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                <span className="text-[10px] text-[var(--fg-muted)] block">Standing Crop</span>
                <span className="font-bold text-[var(--fg-primary)] capitalize">
                  {block?.primaryCrop ? block.primaryCrop.replace(/_/g, " ") : "Boro Rice"}
                </span>
                <span className="text-[9px] text-[var(--fg-muted)] block capitalize">
                  Stage: {block?.cropStage || "Vegetative"}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                <span className="text-[10px] text-[var(--fg-muted)] block">Available Solar Assets</span>
                <span className="font-bold text-[var(--fg-primary)]">
                  {block?.pumpAssetCount ?? 4} Solar Pump Units
                </span>
                <span className="text-[9px] text-[var(--fg-muted)] block">
                  Eligible for emergency dispatch
                </span>
              </div>
            </div>
          </div>

          {/* Standard Operating Mitigation Advice */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-3.5 space-y-2">
            <span className="text-xs font-bold text-[var(--fg-primary)] flex items-center gap-1.5">
              <Sprout className="h-3.5 w-3.5 text-emerald-500" />
              Recommended Field Mitigation Protocols
            </span>
            <ul className="space-y-1.5 pl-1">
              {protocols.map((protocol, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-[var(--fg-secondary)] leading-relaxed">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--primary-subtle)] text-[var(--primary)] font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{protocol}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Officer Dispatched Record if Already Handled */}
          {isDispatched && (
            <div className="p-3 rounded-xl border border-[var(--status-success)]/40 bg-[var(--status-success-bg)]/20 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[var(--status-success)]">
                <CheckCircle2 className="h-4 w-4" />
                <span>Incident Advisory Previously Dispatched</span>
              </div>
              <p className="text-[11px] text-[var(--fg-secondary)]">
                {alert.officerNote
                  ? `Officer Note: "${alert.officerNote}"`
                  : "Advisory active across farmer SMS and IVR channels."}
              </p>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2 pt-3 border-t border-[var(--border-subtle)]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto text-xs cursor-pointer"
          >
            Close
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleProceedToApprove}
            className={cn(
              "w-full sm:w-auto gap-2 font-bold text-xs py-2 px-4 shadow-sm cursor-pointer",
              isDispatched
                ? "bg-[var(--status-success)] hover:bg-[var(--status-success)]/90 text-white"
                : "bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"
            )}
          >
            <Send className="h-3.5 w-3.5" />
            <span>
              {isDispatched ? "Re-broadcast / Update SMS Advisory" : "Approve & Broadcast SMS Advisory"}
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
