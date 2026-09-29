"use client";

import * as React from "react";
import { Alert } from "@/lib/dal/types";
import { useUiStore, SeverityFilter, CropFilter, PeriodFilter } from "@/lib/stores/ui";
import { LayerToggleList } from "./LayerToggleList";
import { AlertFeed } from "./AlertFeed";
import { FileText, Send, Radio, Filter, MapPin } from "lucide-react";
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
