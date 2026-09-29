"use client";

import * as React from "react";
import { Alert } from "@/lib/dal/types";
import { AlertCard } from "./AlertCard";
import { useTranslation } from "@/lib/i18n/client";
import { Filter, Search, BellOff, ShieldAlert, AlertTriangle, Droplets, Waves, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AlertsListViewProps {
  alerts: Alert[];
  className?: string;
  onDismissAlert?: (id: string) => void;
}

export function AlertsListView({
  alerts,
  className,
  onDismissAlert,
}: AlertsListViewProps) {
  const { t, getLocalized } = useTranslation();
  const [selectedSeverity, setSelectedSeverity] = React.useState<string>("all");
  const [selectedType, setSelectedType] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [dismissedIds, setDismissedIds] = React.useState<Set<string>>(new Set());
  const [activeAlert, setActiveAlert] = React.useState<Alert | null>(null);

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
    if (onDismissAlert) {
      onDismissAlert(id);
    }
  };

  const filteredAlerts = React.useMemo(() => {
    return alerts.filter((alert) => {
      if (dismissedIds.has(alert.id)) return false;
      if (selectedSeverity !== "all" && alert.severity !== selectedSeverity) return false;
      if (selectedType !== "all" && alert.type !== selectedType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const headline = (getLocalized(alert.headline) || "").toLowerCase();
        const detail = (getLocalized(alert.detail) || "").toLowerCase();
        if (!headline.includes(q) && !detail.includes(q)) return false;
      }
      return true;
    });
  }, [alerts, dismissedIds, selectedSeverity, selectedType, searchQuery, getLocalized]);

  const highSeverityCount = alerts.filter((a) => !dismissedIds.has(a.id) && a.severity === "high").length;
  const droughtCount = alerts.filter((a) => !dismissedIds.has(a.id) && a.type === "drought").length;
  const floodCount = alerts.filter((a) => !dismissedIds.has(a.id) && (a.type === "flood" || a.type === "waterlogging")).length;

  return (
    <div className={cn("space-y-6 pb-12", className)}>
      {/* Top Header Card */}
      <header className="rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]/70">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--status-danger-bg)] text-[var(--status-danger)] shrink-0">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--fg-primary)] tracking-tight">
                {t("alerts.title", "Climate Risk Alerts & Direct Advisories")}
              </h1>
              <p className="text-xs sm:text-sm text-[var(--fg-secondary)] mt-0.5">
                {t("alerts.subtitle", "Active deterministic advisories for drought, root-zone deficits, and flood surges")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[var(--status-danger-bg)] px-3 py-1 text-xs font-mono font-bold text-[var(--status-danger)] border border-[var(--status-danger)]/30">
              {alerts.length - dismissedIds.size} Active Advisories
            </span>
          </div>
        </div>

        {/* Quick Summary Stat Badges across the top */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-3 rounded-xl bg-[var(--bg-surface-subtle)] p-3 border border-[var(--border-subtle)]">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bg-surface)] text-[var(--primary)] font-bold">
              {alerts.length - dismissedIds.size}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--fg-muted)] tracking-wider block">Total Active</span>
              <span className="text-xs font-bold text-[var(--fg-primary)]">Dispatched</span>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-[var(--status-danger-bg)]/30 p-3 border border-[var(--status-danger)]/30">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--status-danger-bg)] text-[var(--status-danger)] font-bold">
              {highSeverityCount}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--status-danger)] tracking-wider block">High Severity</span>
              <span className="text-xs font-bold text-[var(--fg-primary)]">Urgent Action</span>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-[var(--bg-surface-subtle)] p-3 border border-[var(--border-subtle)]">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--status-warning-bg)] text-[var(--status-warning)] font-bold">
              {droughtCount}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--fg-muted)] tracking-wider block">Moisture Deficits</span>
              <span className="text-xs font-bold text-[var(--fg-primary)]">Drought Risk</span>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-[var(--bg-surface-subtle)] p-3 border border-[var(--border-subtle)]">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--status-info-bg)] text-[var(--status-info)] font-bold">
              {floodCount}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--fg-muted)] tracking-wider block">Water Surges</span>
              <span className="text-xs font-bold text-[var(--fg-primary)]">Inundation</span>
            </div>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]" />
            <input
              type="text"
              placeholder={t("alerts.searchPlaceholder", "Search advisories, blocks, or hazards...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] pl-9 pr-3 text-xs sm:text-sm text-[var(--fg-primary)] placeholder-[var(--fg-muted)] focus:border-[var(--primary)] focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-[var(--fg-secondary)] mr-1">
              <Filter className="h-3.5 w-3.5 text-[var(--primary)]" />
              <span>{t("alerts.severity", "Severity")}:</span>
            </div>
            {(["all", "high", "medium", "low"] as const).map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setSelectedSeverity(sev)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition-all cursor-pointer",
                  selectedSeverity === sev
                    ? "bg-[var(--primary)] text-white shadow-xs"
                    : "bg-[var(--bg-surface-subtle)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                )}
              >
                {sev === "all" ? t("common.all", "All") : sev}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Alerts Responsive Multi-Column Grid */}
      <div>
        {filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-surface-subtle)] text-[var(--fg-muted)]">
              <BellOff className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-bold text-[var(--fg-primary)]">
              {t("alerts.noneFound", "No active alerts matching your criteria")}
            </h3>
            <p className="mt-1 text-xs text-[var(--fg-secondary)] max-w-sm">
              {t("alerts.noneFoundDetail", "Soil and climate metrics in this block remain within normal seasonal tolerance bands.")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onView={(item) => setActiveAlert(item)}
                onDismiss={handleDismiss}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!activeAlert} onOpenChange={(open) => !open && setActiveAlert(null)}>
        <DialogContent className="max-w-lg">
          {activeAlert && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center rounded-md bg-[var(--status-danger-bg)] px-2 py-0.5 text-xs font-bold text-[var(--status-danger)] uppercase font-mono">
                    {activeAlert.type}
                  </span>
                  <span className="text-xs text-[var(--fg-muted)] font-mono">
                    Lead time: {activeAlert.leadTimeHours}h
                  </span>
                </div>
                <DialogTitle className="text-xl font-bold">
                  {getLocalized(activeAlert.headline)}
                </DialogTitle>
                <DialogDescription className="text-sm text-[var(--fg-secondary)] leading-relaxed">
                  {getLocalized(activeAlert.detail)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2 text-sm text-[var(--fg-primary)]">
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-4">
                  <h4 className="font-bold text-xs text-[var(--primary)] uppercase tracking-wider mb-2">
                    {t("alerts.recommendedAction", "Recommended Action for Farmers")}
                  </h4>
                  <p className="text-xs sm:text-sm leading-relaxed text-[var(--fg-secondary)]">
                    {activeAlert.type === "drought"
                      ? "Conserve topsoil moisture immediately through mulching. Shift supplemental irrigation to late evening hours (17:30 - 19:30) to cut evaporative loss by up to 35%."
                      : activeAlert.type === "flood" || activeAlert.type === "waterlogging"
                      ? "Clear field perimeter drainage bunds immediately. Elevate harvested seed stock and postpone chemical top-dressing until inundation recedes."
                      : "Monitor local drainage outlets and reinforce crop bed ridges against high runoff."}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] border-t border-[var(--border-subtle)] pt-3 font-mono">
                  <span>Issued: {new Date(activeAlert.issuedAt).toLocaleDateString()}</span>
                  <span>Target: {activeAlert.blockId === "all" ? "District-Wide" : activeAlert.blockId}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setActiveAlert(null)}>
                  {t("common.close", "Close")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDismiss(activeAlert.id);
                    setActiveAlert(null);
                  }}
                >
                  {t("farmer.dismiss", "Dismiss Alert")}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
