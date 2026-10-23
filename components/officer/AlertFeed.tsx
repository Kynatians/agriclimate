"use client";

import * as React from "react";
import { Alert, Block, BlockMetrics } from "@/lib/dal/types";
import { useUiStore } from "@/lib/stores/ui";
import { MetricBadge } from "@/components/shared/MetricBadge";
import { useTranslation } from "@/lib/i18n/client";
import { Clock, Send, ShieldAlert, CheckCircle2, Eye, Info } from "lucide-react";
import { IncidentDetailModal } from "./IncidentDetailModal";
import { cn } from "@/lib/utils";

interface AlertFeedProps {
  alerts: Alert[];
  blocks?: Block[];
  metricsMap?: Record<string, BlockMetrics>;
  onAnnotateAlert: (alert: Alert) => void;
  className?: string;
}

export function AlertFeed({
  alerts,
  blocks = [],
  metricsMap = {},
  onAnnotateAlert,
  className,
}: AlertFeedProps) {
  const { getLocalized } = useTranslation();
  const dispatchedAlerts = useUiStore((state) => state.dispatchedAlerts);

  const [inspectingAlert, setInspectingAlert] = React.useState<Alert | null>(null);

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
            const block = blocks.find((b) => b.id === alert.blockId);
            const alertMetrics = metricsMap[alert.blockId];

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

                <div
                  onClick={() => setInspectingAlert(alert)}
                  className="cursor-pointer group/headline"
                  title="Click to check incident telemetry and details before approving"
                >
                  <h5 className="text-xs font-bold text-[var(--fg-primary)] group-hover/headline:text-[var(--primary)] transition-colors leading-snug">
                    {getLocalized(alert.headline)}
                  </h5>
                  <p className="mt-0.5 text-[11px] text-[var(--fg-secondary)] line-clamp-2 leading-relaxed">
                    {getLocalized(alert.detail)}
                  </p>
                </div>

                {/* Telemetry teaser tag if metrics exist */}
                {alertMetrics && (
                  <div className="flex items-center gap-2 text-[10px] text-[var(--fg-muted)] font-mono bg-[var(--bg-surface-subtle)] px-2 py-1 rounded-md">
                    <span>Soil: {alertMetrics.soilMoistureSurface.value.toFixed(0)}%</span>
                    <span>•</span>
                    <span>CWSI: {(alertMetrics.cwsi * 100).toFixed(0)}%</span>
                    <span>•</span>
                    <span>Rain: {alertMetrics.precip7dForecast.toFixed(0)}mm</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-[var(--border-subtle)]/60 text-[10px]">
                  <span
                    className="font-mono text-[var(--fg-muted)] truncate max-w-[120px]"
                    title={block ? `${block.name} (${block.subDistrict})` : alert.blockId}
                  >
                    Target: {block ? block.name : alert.blockId}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Check Details button before approving */}
                    <button
                      type="button"
                      onClick={() => setInspectingAlert(alert)}
                      className="flex items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] px-2 py-1 font-semibold text-[var(--fg-primary)] hover:bg-[var(--bg-surface)] hover:border-[var(--border-strong)] transition-all cursor-pointer"
                      title="Inspect incident telemetry, satellite triggers, and mitigation advice before approving"
                    >
                      <Eye className="h-3 w-3 text-[var(--fg-muted)]" />
                      <span>Details</span>
                    </button>

                    {/* Approve / Broadcast SMS Advisory button */}
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
              </div>
            );
          })
        )}
      </div>

      {/* Incident Detail Modal for checking facts & telemetry before approving */}
      <IncidentDetailModal
        open={!!inspectingAlert}
        onOpenChange={(open) => {
          if (!open) setInspectingAlert(null);
        }}
        alert={inspectingAlert}
        block={inspectingAlert ? blocks.find((b) => b.id === inspectingAlert.blockId) : undefined}
        metrics={inspectingAlert ? metricsMap[inspectingAlert.blockId] : undefined}
        isDispatched={
          inspectingAlert
            ? dispatchedAlerts.some(
                (d) =>
                  d.id === inspectingAlert.id ||
                  (d.blockId === inspectingAlert.blockId && d.type === inspectingAlert.type)
              )
            : false
        }
        onApproveAndBroadcast={(alert) => {
          setInspectingAlert(null);
          onAnnotateAlert(alert);
        }}
      />
    </div>
  );
}
