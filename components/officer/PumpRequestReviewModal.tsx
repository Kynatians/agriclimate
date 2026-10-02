"use client";

import * as React from "react";
import { BlockMetrics, PumpRequest } from "@/lib/dal/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MetricBadge } from "@/components/shared/MetricBadge";
import { cn } from "@/lib/utils";
import {
  Zap,
  RotateCw,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Droplets,
  AlertTriangle,
  Send,
} from "lucide-react";

interface PumpRequestReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: PumpRequest | null;
  requesterMetrics?: BlockMetrics;
  targetMetrics?: BlockMetrics;
  onResolve: (id: string, status: "approved" | "rejected", note?: string) => Promise<void>;
  isResolving?: boolean;
}

export function PumpRequestReviewModal({
  open,
  onOpenChange,
  request,
  requesterMetrics,
  targetMetrics,
  onResolve,
  isResolving = false,
}: PumpRequestReviewModalProps) {
  const [officerNote, setOfficerNote] = React.useState("");

  React.useEffect(() => {
    if (request) {
      setOfficerNote(request.officerNote || "");
    }
  }, [request]);

  if (!request) return null;

  const isPending = request.status === "pending";

  const handleAction = async (status: "approved" | "rejected") => {
    await onResolve(request.id, status, officerNote.trim() || undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 text-[var(--fg-primary)] bg-[var(--bg-surface)] border-[var(--border-subtle)]">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl",
                  request.type === "new_pump"
                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                )}
              >
                {request.type === "new_pump" ? (
                  <Zap className="h-5 w-5" />
                ) : (
                  <RotateCw className="h-5 w-5" />
                )}
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold">
                  {request.type === "new_pump"
                    ? "Review Solar Pump Request"
                    : "Review Pump Transfer Request"}
                </DialogTitle>
                <DialogDescription className="text-xs text-[var(--fg-muted)] font-mono">
                  ID: {request.id} • {new Date(request.requestedAt).toLocaleString()}
                </DialogDescription>
              </div>
            </div>

            <MetricBadge
              severity={
                request.status === "approved"
                  ? "optimal"
                  : request.status === "rejected"
                  ? "high"
                  : "warning"
              }
            >
              {request.status}
            </MetricBadge>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Blocks & Satellite Telemetry Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Requester Block */}
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--fg-muted)] flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-amber-500" />
                  Origin Block:
                </span>
                <span className="font-bold text-[var(--fg-primary)]">
                  {request.requesterBlockName}
                </span>
              </div>

              {requesterMetrics ? (
                <div className="space-y-1.5 pt-2 border-t border-[var(--border-subtle)] text-xs">
                  <div className="flex justify-between">
                    <span className="text-[10px] text-[var(--fg-muted)]">Soil Moisture:</span>
                    <span className="font-mono font-bold">
                      {requesterMetrics.soilMoistureSurface.value.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-[var(--fg-muted)]">Water Stress (CWSI):</span>
                    <span
                      className={cn(
                        "font-mono font-bold",
                        requesterMetrics.cwsi > 0.6
                          ? "text-[var(--status-danger)]"
                          : requesterMetrics.cwsi > 0.4
                          ? "text-[var(--status-warning)]"
                          : "text-[var(--status-success)]"
                      )}
                    >
                      {(requesterMetrics.cwsi * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-[var(--fg-muted)]">7-Day Rain Forecast:</span>
                    <span className="font-mono">
                      {requesterMetrics.precip7dForecast.toFixed(1)} mm
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-[var(--fg-muted)] italic">No telemetry data</p>
              )}
            </div>

            {/* Target Block (if transfer) or Urgency/Deficit Info */}
            {request.type === "transfer" ? (
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--fg-muted)] flex items-center gap-1">
                    <RotateCw className="h-3.5 w-3.5 text-blue-500" />
                    Target Block:
                  </span>
                  <span className="font-bold text-[var(--fg-primary)]">
                    {request.targetBlockName || request.targetBlockId}
                  </span>
                </div>

                {targetMetrics ? (
                  <div className="space-y-1.5 pt-2 border-t border-[var(--border-subtle)] text-xs">
                    <div className="flex justify-between">
                      <span className="text-[10px] text-[var(--fg-muted)]">Soil Moisture:</span>
                      <span className="font-mono font-bold">
                        {targetMetrics.soilMoistureSurface.value.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-[var(--fg-muted)]">Water Stress (CWSI):</span>
                      <span
                        className={cn(
                          "font-mono font-bold",
                          targetMetrics.cwsi > 0.6
                            ? "text-[var(--status-danger)]"
                            : targetMetrics.cwsi > 0.4
                            ? "text-[var(--status-warning)]"
                            : "text-[var(--status-success)]"
                        )}
                      >
                        {(targetMetrics.cwsi * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-[var(--fg-muted)]">7-Day Rain Forecast:</span>
                      <span className="font-mono">
                        {targetMetrics.precip7dForecast.toFixed(1)} mm
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-[var(--fg-muted)] italic">No telemetry data</p>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-3 space-y-2">
                <span className="font-semibold text-[var(--fg-muted)] text-xs block">
                  Priority Assessment:
                </span>
                <div className="space-y-1.5 pt-2 border-t border-[var(--border-subtle)] text-xs">
                  <div className="flex justify-between">
                    <span className="text-[10px] text-[var(--fg-muted)]">Farmer Urgency:</span>
                    <span className="font-bold uppercase text-[var(--fg-primary)]">
                      {request.urgency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-[var(--fg-muted)]">Computed Deficit:</span>
                    <span className="font-mono font-bold text-amber-500">
                      {request.deficitSeverity !== undefined ? `${request.deficitSeverity}/100` : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-[var(--fg-muted)]">Equip Recommended:</span>
                    <span className="text-[var(--status-success)] font-medium">10HP Solar Array</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Farmer's Stated Reason */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-3 space-y-1.5">
            <span className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider block">
              Farmer's Field Justification
            </span>
            <p className="text-xs text-[var(--fg-primary)] leading-relaxed italic bg-[var(--bg-surface)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
              "{request.reason}"
            </p>
          </div>

          {/* Officer Response Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider block">
              Officer Directive / Dispatch Note
            </label>
            <Textarea
              value={officerNote}
              onChange={(e) => setOfficerNote(e.target.value)}
              placeholder="Enter instructions for field technician or farmer (e.g. 'Solar pump unit #04 scheduled for transport on Friday morning')..."
              className="text-xs min-h-[70px]"
              disabled={!isPending && !officerNote}
            />
          </div>

          {/* Action / Status Resolution */}
          {isPending ? (
            <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
              <Button
                type="button"
                onClick={() => handleAction("approved")}
                disabled={isResolving}
                className="flex-1 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Approve & Allocate Pump</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleAction("rejected")}
                disabled={isResolving}
                className="flex-1 gap-1.5 text-[var(--status-danger)] border-[var(--status-danger)]/40 hover:bg-[var(--status-danger-bg)] font-bold text-xs py-2 cursor-pointer"
              >
                <XCircle className="h-4 w-4" />
                <span>Reject Request</span>
              </Button>
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-xs flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-[var(--fg-primary)]">
                  Resolved by {request.resolvedBy || "Upazila Agriculture Office"}
                </span>
                {request.resolvedAt && (
                  <p className="text-[10px] text-[var(--fg-muted)] font-mono">
                    {new Date(request.resolvedAt).toLocaleString()}
                  </p>
                )}
              </div>
              <MetricBadge
                severity={
                  request.status === "approved"
                    ? "optimal"
                    : request.status === "rejected"
                    ? "high"
                    : "warning"
                }
              >
                {request.status}
              </MetricBadge>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-[var(--border-subtle)]">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            size="sm"
            className="text-xs cursor-pointer"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
