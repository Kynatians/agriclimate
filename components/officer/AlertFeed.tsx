"use client";

import * as React from "react";
import { Alert } from "@/lib/dal/types";
import { useUiStore } from "@/lib/stores/ui";
import { MetricBadge } from "@/components/shared/MetricBadge";
import { useTranslation } from "@/lib/i18n/client";
import { AlertTriangle, Clock, Send, ShieldAlert, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertFeedProps {
  alerts: Alert[];
  onAnnotateAlert: (alert: Alert) => void;
  className?: string;
}

export function AlertFeed({ alerts, onAnnotateAlert, className }: AlertFeedProps) {
  const { t, getLocalized } = useTranslation();
  const dispatchedAlerts = useUiStore((state) => state.dispatchedAlerts);

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex items-center justify-between text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-2">
        <span className="flex items-center gap-1.5">
          <ShieldAlert className="h-3.5 w-3.5" />
          Active Incident Alerts
        </span>
        <span className="rounded-full bg-[var(--status-danger-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--status-danger)]">
          {alerts.length} live
        </span>
      </div>

      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
        {alerts.length === 0 ? (
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 text-center text-xs text-[var(--fg-muted)]">
            No active emergency alerts in Kurigram District.
          </div>
        ) : (
          alerts.map((alert) => {
            const isDispatched = dispatchedAlerts.some(
              (d) => d.id === alert.id || (d.blockId === alert.blockId && d.type === alert.type)
            );

            return (
              <div
                key={alert.id}
                className={cn(
                  "rounded-xl border p-3 shadow-xs transition-all space-y-2",
                  isDispatched
                    ? "border-[var(--status-success)]/40 bg-[var(--status-success-bg)]/10"
                    : "border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)]"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <MetricBadge severity={alert.severity}>
                      {alert.severity}
                    </MetricBadge>
                    <span className="text-[10px] font-mono text-[var(--fg-muted)] uppercase">
                      {alert.type}
                    </span>
                    {isDispatched && (
                      <span className="flex items-center gap-1 rounded-md bg-[var(--status-success-bg)] px-1.5 py-0.2 text-[9px] font-bold text-[var(--status-success)] font-mono">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        Dispatched
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[10px] font-mono text-[var(--fg-muted)]">
                    <Clock className="h-3 w-3" />
                    <span>{alert.leadTimeHours}h lead</span>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-[var(--fg-primary)] leading-snug">
                    {getLocalized(alert.headline)}
                  </h5>
                  <p className="mt-0.5 text-[11px] text-[var(--fg-secondary)] line-clamp-2 leading-relaxed">
                    {getLocalized(alert.detail)}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[var(--border-subtle)]/60 text-[10px]">
                  <span className="font-mono text-[var(--fg-muted)]">
                    Target: {alert.blockId}
                  </span>

                  <button
                    type="button"
                    onClick={() => onAnnotateAlert(alert)}
                    className={cn(
                      "flex items-center gap-1 rounded-md px-2 py-1 font-bold text-white shadow-xs active:scale-95 transition-all cursor-pointer",
                      isDispatched
                        ? "bg-[var(--status-success)] hover:bg-[var(--status-success)]/90"
                        : "bg-[var(--primary)] hover:bg-[var(--primary-hover)]"
                    )}
                  >
                    <Send className="h-2.5 w-2.5" />
                    <span>{isDispatched ? "Broadcast Active" : "Annotate : SMS"}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
