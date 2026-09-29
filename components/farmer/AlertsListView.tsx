"use client";

import * as React from "react";
import { Alert } from "@/lib/dal/types";
import { AlertCard } from "./AlertCard";
import { useTranslation } from "@/lib/i18n/client";
import { Filter, Search, BellOff, ShieldAlert } from "lucide-react";
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

  return (
    <div className={cn("space-y-6 pb-20", className)}>
      <header className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--status-danger-bg)] text-[var(--status-danger)]">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--fg-primary)] tracking-tight">
              {t("alerts.title", "Climate Risk Alerts")}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--fg-secondary)]">
              {t("alerts.subtitle", "Active advisories for drought, flood surges, and soil moisture stress")}
            </p>
          </div>
        </div>

        {/* Filter controls */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]" />
            <input
              type="text"
              placeholder={t("alerts.searchPlaceholder", "Search advisories...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] pl-9 pr-3 text-sm text-[var(--fg-primary)] placeholder-[var(--fg-muted)] focus:border-[var(--primary)] focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-[var(--fg-secondary)]">
              <Filter className="h-3.5 w-3.5" />
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

      {/* Alerts list */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bg-surface-subtle)] text-[var(--fg-muted)]">
              <BellOff className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-bold text-[var(--fg-primary)]">
              {t("alerts.noneFound", "No active alerts matching your criteria")}
            </h3>
            <p className="mt-1 text-xs text-[var(--fg-secondary)] max-w-sm">
              {t("alerts.noneFoundDetail", "Soil and climate metrics in this block remain within seasonal tolerance bands.")}
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onView={(item) => setActiveAlert(item)}
              onDismiss={handleDismiss}
            />
          ))
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!activeAlert} onOpenChange={(open) => !open && setActiveAlert(null)}>
        <DialogContent className="max-w-lg">
          {activeAlert && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center rounded-md bg-[var(--status-danger-bg)] px-2 py-0.5 text-xs font-semibold text-[var(--status-danger)]">
                    {activeAlert.type.toUpperCase()}
                  </span>
                  <span className="text-xs text-[var(--fg-muted)] font-mono">
                    Lead time: {activeAlert.leadTimeHours}h
                  </span>
                </div>
                <DialogTitle className="text-xl font-bold">
                  {getLocalized(activeAlert.headline)}
                </DialogTitle>
                <DialogDescription className="text-sm text-[var(--fg-secondary)]">
                  {getLocalized(activeAlert.detail)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2 text-sm text-[var(--fg-primary)]">
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-4">
                  <h4 className="font-semibold text-xs text-[var(--fg-secondary)] uppercase tracking-wider mb-2">
                    {t("alerts.recommendedAction", "Recommended Action for Farmers")}
                  </h4>
                  <p className="text-sm leading-relaxed">
                    {activeAlert.type === "drought"
                      ? "Conserve topsoil moisture immediately through mulching. Shift supplemental irrigation to late evening hours to cut evaporative loss by up to 35%."
                      : activeAlert.type === "flood" || activeAlert.type === "waterlogging"
                      ? "Clear field perimeter drainage bunds immediately. Elevate harvested seed stock and postpone chemical top-dressing until inundation recedes."
                      : "Monitor local drainage outlets and reinforce crop bed ridges."}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] border-t border-[var(--border-subtle)] pt-3">
                  <span>Issued: {new Date(activeAlert.issuedAt).toLocaleDateString()}</span>
                  <span>Affects Block: {activeAlert.blockId}</span>
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
