"use client";

import * as React from "react";
import { Alert } from "@/lib/dal/types";
import { useUiStore, SeverityFilter, CropFilter, PeriodFilter } from "@/lib/stores/ui";
import { LayerToggleList } from "./LayerToggleList";
import { AlertFeed } from "./AlertFeed";
import { FileText, Send, Radio, Filter, MapPin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ControlPanelProps {
  alerts: Alert[];
  onOpenReport: () => void;
  onOpenComposer: (alert?: Alert) => void;
  className?: string;
}

export function ControlPanel({
  alerts,
  onOpenReport,
  onOpenComposer,
  className,
}: ControlPanelProps) {
  const { filters, setFilter } = useUiStore();
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [lastSyncTime, setLastSyncTime] = React.useState<string | null>(null);
  const [syncMessage, setSyncMessage] = React.useState<string | null>(null);

  const handleSyncLiveNasa = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/sync/live-nasa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true }),
      });

      if (res.ok) {
        const json = await res.json();
        const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        setLastSyncTime(timeStr);
        setSyncMessage(`Synced ${json.data?.blocksUpdated ?? 12} blocks with NASA telemetry`);
        setTimeout(() => setSyncMessage(null), 4000);
      } else {
        setSyncMessage("NASA sync failed; using cached telemetry.");
      }
    } catch {
      setSyncMessage("Network error; retained cached telemetry.");
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredAlerts = React.useMemo(() => {
    if (filters.severity === "all") return alerts;
    return alerts.filter((a) => a.severity === filters.severity);
  }, [alerts, filters.severity]);

  return (
    <aside
      className={cn(
        "flex flex-col h-full overflow-y-auto border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-5",
        className
      )}
    >
      {/* District Context Header */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--primary)] text-white">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--fg-primary)] leading-tight">
              Kurigram District Cockpit
            </h3>
            <span className="text-[10px] text-[var(--fg-muted)]">
              Rangpur Division, Bangladesh (12 Blocks)
            </span>
          </div>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          size="sm"
          onClick={() => onOpenComposer()}
          className="gap-1.5 text-xs font-bold shadow-xs cursor-pointer"
        >
          <Radio className="h-3.5 w-3.5" />
          <span>Broadcast Alert</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenReport}
          className="gap-1.5 text-xs font-bold shadow-xs cursor-pointer"
        >
          <FileText className="h-3.5 w-3.5" />
          <span>District Report</span>
        </Button>
      </div>

      {/* Live NASA Sync Action */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-2.5 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-[var(--fg-secondary)] flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[var(--status-success)] animate-pulse" />
            Live NASA Feed
          </span>
          {lastSyncTime && (
            <span className="font-mono text-[9px] text-[var(--fg-muted)]">
              {lastSyncTime}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleSyncLiveNasa}
          disabled={isSyncing}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--primary)]/40 bg-[var(--primary-subtle)] px-2.5 py-1.5 text-xs font-bold text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isSyncing && "animate-spin")} />
          <span>{isSyncing ? "Connecting NASA Feed..." : "Sync Live NASA Telemetry"}</span>
        </button>

        {syncMessage && (
          <p className="text-[10px] text-[var(--status-success)] text-center font-medium">
            {syncMessage}
          </p>
        )}
      </div>

      {/* Filter Matrix */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-3 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider">
          <Filter className="h-3.5 w-3.5" />
          Telemetry Filters
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <label className="text-[10px] font-semibold text-[var(--fg-muted)] block mb-1">
              Severity
            </label>
            <select
              value={filters.severity}
              onChange={(e) => setFilter("severity", e.target.value as SeverityFilter)}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-1 text-[11px] text-[var(--fg-primary)] focus:outline-hidden cursor-pointer"
            >
              <option value="all">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-[var(--fg-muted)] block mb-1">
              Crop Focus
            </label>
            <select
              value={filters.crop}
              onChange={(e) => setFilter("crop", e.target.value as CropFilter)}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-1 text-[11px] text-[var(--fg-primary)] focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Crops</option>
              <option value="rice">Rice</option>
              <option value="wheat">Wheat</option>
              <option value="maize">Maize</option>
              <option value="vegetable">Vegetable</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-[var(--fg-muted)] block mb-1">
              Timespan
            </label>
            <select
              value={filters.period}
              onChange={(e) => setFilter("period", e.target.value as PeriodFilter)}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-1 text-[11px] text-[var(--fg-primary)] focus:outline-hidden cursor-pointer"
            >
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Layer Toggles */}
      <LayerToggleList />

      {/* Live Alert Feed */}
      <AlertFeed
        alerts={filteredAlerts}
        onAnnotateAlert={onOpenComposer}
      />
    </aside>
  );
}
