"use client";

import * as React from "react";
import { Block, BlockMetrics, PumpRequest, PumpRequestStatus } from "@/lib/dal/types";
import { useUiStore } from "@/lib/stores/ui";
import { MetricBadge } from "@/components/shared/MetricBadge";
import { PumpRequestReviewModal } from "./PumpRequestReviewModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Zap,
  RotateCw,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  Eye,
  Check,
  X,
  Droplets,
} from "lucide-react";

interface PumpRequestQueueProps {
  blocks: Block[];
  metricsMap: Record<string, BlockMetrics>;
  className?: string;
}

export function PumpRequestQueue({
  blocks,
  metricsMap,
  className,
}: PumpRequestQueueProps) {
  const pumpRequests = useUiStore((state) => state.pumpRequests);
  const addPumpRequest = useUiStore((state) => state.addPumpRequest);
  const updatePumpRequest = useUiStore((state) => state.updatePumpRequest);

  const [filter, setFilter] = React.useState<"all" | PumpRequestStatus>("all");
  const [selectedRequest, setSelectedRequest] = React.useState<PumpRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isResolving, setIsResolving] = React.useState(false);

  // Sync all pump requests from server on mount
  React.useEffect(() => {
    fetch("/api/pump-requests")
      .then((res) => res.json())
      .then((data: PumpRequest[]) => {
        if (Array.isArray(data)) {
          data.forEach((req) => addPumpRequest(req));
        }
      })
      .catch(() => {});
  }, [addPumpRequest]);

  const pendingCount = React.useMemo(() => {
    return pumpRequests.filter((r) => r.status === "pending").length;
  }, [pumpRequests]);

  const filteredRequests = React.useMemo(() => {
    if (filter === "all") return pumpRequests;
    return pumpRequests.filter((r) => r.status === filter);
  }, [pumpRequests, filter]);

  const handleResolve = async (
    id: string,
    status: "approved" | "rejected",
    note?: string
  ) => {
    setIsResolving(true);
    try {
      const res = await fetch(`/api/pump-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          officerNote: note,
          resolvedBy: "Upazila Agriculture Office (DAE), Kurigram",
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.request) {
          updatePumpRequest(id, json.request);
        } else {
          updatePumpRequest(id, {
            status,
            resolvedAt: new Date().toISOString(),
            officerNote: note,
          });
        }
      }
    } catch (err) {
      console.error("Failed to resolve pump request:", err);
    } finally {
      setIsResolving(false);
    }
  };

  const handleOpenReview = (request: PumpRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-3 space-y-2.5",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--fg-primary)]">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/10 text-amber-500">
            <Zap className="h-3.5 w-3.5" />
          </div>
          <span>Pump Requests</span>
          {pendingCount > 0 && (
            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white animate-pulse">
              {pendingCount}
            </span>
          )}
        </div>

        <span className="text-[10px] font-mono text-[var(--fg-muted)]">
          {filteredRequests.length} total
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="grid grid-cols-4 gap-1 p-0.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[10px]">
        {(["all", "pending", "approved", "rejected"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={cn(
              "py-1 px-1.5 rounded-md font-semibold capitalize text-center transition-all cursor-pointer truncate",
              filter === tab
                ? "bg-[var(--primary)] text-white shadow-2xs font-bold"
                : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-2 max-h-[260px] overflow-y-auto pr-0.5">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-4 text-xs text-[var(--fg-muted)] italic">
            No {filter !== "all" ? filter : ""} requests in queue.
          </div>
        ) : (
          filteredRequests.map((req) => {
            const reqMetrics = metricsMap[req.requesterBlockId];
            return (
              <div
                key={req.id}
                className={cn(
                  "rounded-lg border p-2.5 text-xs space-y-1.5 transition-all bg-[var(--bg-surface)]",
                  req.status === "pending"
                    ? "border-amber-500/30 hover:border-amber-500/60"
                    : "border-[var(--border-subtle)]"
                )}
              >
                {/* Top Row: Type & Status */}
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-[11px] text-[var(--fg-primary)] flex items-center gap-1 truncate">
                    {req.type === "new_pump" ? (
                      <>
                        <Zap className="h-3 w-3 text-amber-500 shrink-0" />
                        <span className="truncate">New Pump Allocation</span>
                      </>
                    ) : (
                      <>
                        <RotateCw className="h-3 w-3 text-blue-500 shrink-0" />
                        <span className="truncate">
                          Transfer → {req.targetBlockName || req.targetBlockId}
                        </span>
                      </>
                    )}
                  </span>
                  <MetricBadge
                    severity={
                      req.status === "approved"
                        ? "optimal"
                        : req.status === "rejected"
                        ? "high"
                        : "warning"
                    }
                    className="text-[9px] px-1.5 py-0 shrink-0"
                  >
                    {req.status}
                  </MetricBadge>
                </div>

                {/* Block & Deficit Telemetry info */}
                <div className="flex items-center justify-between text-[10px] text-[var(--fg-secondary)]">
                  <span className="font-medium truncate">{req.requesterBlockName}</span>
                  {reqMetrics && (
                    <span className="font-mono text-[var(--fg-muted)] shrink-0">
                      CWSI: {(reqMetrics.cwsi * 100).toFixed(0)}% • Soil:{" "}
                      {reqMetrics.soilMoistureSurface.value.toFixed(0)}%
                    </span>
                  )}
                </div>

                {/* Farmer Stated Reason */}
                <p className="text-[10px] text-[var(--fg-muted)] line-clamp-2 italic bg-[var(--bg-surface-subtle)] p-1.5 rounded border border-[var(--border-subtle)]/60">
                  "{req.reason}"
                </p>

                {/* Officer note if resolved */}
                {req.officerNote && (
                  <div className="text-[9px] text-[var(--primary)] font-medium bg-[var(--primary-subtle)]/40 p-1 rounded">
                    Note: {req.officerNote}
                  </div>
                )}

                {/* Actions Row */}
                <div className="flex items-center justify-between pt-1 border-t border-[var(--border-subtle)]/40">
                  <span className="text-[9px] font-mono text-[var(--fg-muted)]">
                    {new Date(req.requestedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenReview(req)}
                      className="flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-semibold border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-subtle)] text-[var(--fg-primary)] transition-all cursor-pointer"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Review</span>
                    </button>

                    {req.status === "pending" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleResolve(req.id, "approved")}
                          disabled={isResolving}
                          title="Quick Approve"
                          className="flex h-5 w-5 items-center justify-center rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResolve(req.id, "rejected")}
                          disabled={isResolving}
                          title="Quick Reject"
                          className="flex h-5 w-5 items-center justify-center rounded border border-[var(--status-danger)]/50 text-[var(--status-danger)] hover:bg-[var(--status-danger-bg)] transition-all cursor-pointer disabled:opacity-50"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detailed Review Modal */}
      <PumpRequestReviewModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        request={selectedRequest}
        requesterMetrics={
          selectedRequest ? metricsMap[selectedRequest.requesterBlockId] : undefined
        }
        targetMetrics={
          selectedRequest && selectedRequest.targetBlockId
            ? metricsMap[selectedRequest.targetBlockId]
            : undefined
        }
        onResolve={handleResolve}
        isResolving={isResolving}
      />
    </div>
  );
}
