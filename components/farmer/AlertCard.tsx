import * as React from "react";
import { AlertTriangle, Clock, ChevronRight, X, ShieldAlert, Radio, Send } from "lucide-react";
import { Alert } from "@/lib/dal/types";
import { MetricBadge } from "@/components/shared/MetricBadge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

interface AlertCardProps {
  alert: Alert;
  onView?: (alert: Alert) => void;
  onDismiss?: (alertId: string) => void;
  className?: string;
}

export function AlertCard({ alert, onView, onDismiss, className }: AlertCardProps) {
  const { t, getLocalized } = useTranslation();

  const isDrought = alert.type === "drought";
  const isFlood = alert.type === "flood" || alert.type === "waterlogging";

  const cardBorder = alert.severity === "high"
    ? "border-2 border-[var(--status-danger)]/70 bg-[var(--status-danger-bg)]/20"
    : "border border-[var(--status-warning)]/70 bg-[var(--status-warning-bg)]/20";

  return (
    <div
      className={cn(
        "relative flex flex-col gap-3 rounded-2xl p-5 shadow-xs transition-all",
        cardBorder,
        className
      )}
    >
      {/* Official Officer Dispatch Banner Header */}
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)]/60 pb-2.5">
        <div className="flex items-center gap-1.5">
          <ShieldAlert className="h-4 w-4 text-[var(--status-danger)]" />
          <span className="text-[11px] font-bold tracking-tight text-[var(--fg-primary)]">
            {alert.dispatchedBy || "Official Advisory • Upazila Agriculture Office (DAE)"}
          </span>
        </div>
        {alert.channels && alert.channels.length > 0 && (
          <span className="flex items-center gap-1 rounded-md bg-[var(--bg-surface)] px-2 py-0.5 text-[9px] font-mono font-bold text-[var(--fg-muted)] border border-[var(--border-subtle)] uppercase">
            <Radio className="h-2.5 w-2.5 text-[var(--primary)]" />
            {alert.channels.join(" · ")}
          </span>
        )}
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--status-danger-bg)] text-[var(--status-danger)]">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <MetricBadge severity={alert.severity}>
                {alert.severity}
              </MetricBadge>
              <span className="flex items-center gap-1 text-xs font-mono font-medium text-[var(--fg-secondary)]">
                <Clock className="h-3.5 w-3.5" />
                {alert.leadTimeHours}h lead time
              </span>
            </div>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={() => onDismiss(alert.id)}
            className="rounded-lg p-1.5 text-[var(--fg-muted)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--fg-primary)] transition-all cursor-pointer"
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div>
        <h4 className="text-base sm:text-lg font-bold text-[var(--fg-primary)] leading-snug">
          {getLocalized(alert.headline)}
        </h4>
        <p className="mt-1 text-sm text-[var(--fg-secondary)] leading-relaxed">
          {getLocalized(alert.detail)}
        </p>
      </div>

      {/* Officer Custom Note Callout (if added by officer during dispatch) */}
      {alert.officerNote && (
        <div className="rounded-xl border border-[var(--primary)]/30 bg-[var(--primary-subtle)]/30 p-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[var(--primary)] uppercase tracking-wider text-[10px] mb-1">
            <Send className="h-3 w-3" />
            Officer Advisory Note
          </div>
          <p className="text-[var(--fg-primary)] leading-relaxed font-medium">
            "{alert.officerNote}"
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
        {onView && (
          <Button
            size="sm"
            onClick={() => onView(alert)}
            className="flex-1 gap-1 text-xs font-semibold"
          >
            {t("farmer.viewDetails", "View Advisory Details")}
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
        {onDismiss && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDismiss(alert.id)}
            className="text-xs"
          >
            {t("farmer.dismiss", "Dismiss")}
          </Button>
        )}
      </div>
    </div>
  );
}
