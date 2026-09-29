"use client";

import * as React from "react";
import { AlertTriangle, Clock, ChevronRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { MetricBadge } from "./MetricBadge";
import { Alert } from "@/lib/dal/types";
import { useTranslation } from "@/lib/i18n/client";
import { formatDate } from "@/lib/utils";

interface AlertsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alerts: Alert[];
  onSelectAlert?: (alert: Alert) => void;
}

export function AlertsSheet({
  open,
  onOpenChange,
  alerts,
  onSelectAlert,
}: AlertsSheetProps) {
  const { t, locale, getLocalized } = useTranslation();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col sm:max-w-md overflow-hidden">
        <SheetHeader className="border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--status-danger-bg)] text-[var(--status-danger)]">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold">
                {t("nav.alerts", "Active Climate Alerts")} ({alerts.length})
              </SheetTitle>
              <SheetDescription className="text-xs">
                Real-time hazard warnings derived from GPM and SMAP satellites
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-[var(--fg-muted)]">
              <p>No active hazard warnings for your region.</p>
              <p className="text-xs mt-1">Satellite conditions are within normal baseline.</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => {
                  if (onSelectAlert) onSelectAlert(alert);
                }}
                className="group flex flex-col gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3.5 shadow-xs transition-all hover:border-[var(--border-strong)] cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <MetricBadge severity={alert.severity}>
                    {alert.severity}
                  </MetricBadge>

                  <span className="flex items-center gap-1 text-[11px] text-[var(--fg-muted)] font-mono">
                    <Clock className="h-3 w-3" />
                    {alert.leadTimeHours}h lead time
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-[var(--fg-primary)] group-hover:text-[var(--primary)] transition-colors">
                  {getLocalized(alert.headline)}
                </h4>

                <p className="text-xs text-[var(--fg-secondary)] line-clamp-2 leading-relaxed">
                  {getLocalized(alert.detail)}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]/50 text-[10px] text-[var(--fg-muted)] font-mono">
                  <span>Issued: {formatDate(alert.issuedAt, locale)}</span>
                  <span className="flex items-center gap-0.5 text-[var(--primary)] font-medium">
                    Inspect <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
