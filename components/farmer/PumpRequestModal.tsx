"use client";

import * as React from "react";
import { Block, BlockMetrics, PumpRequest, PumpRequestType, Severity } from "@/lib/dal/types";
import { useUiStore } from "@/lib/stores/ui";
import { useTranslation } from "@/lib/i18n/client";
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
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Droplets,
  RotateCw,
  Sparkles,
} from "lucide-react";

interface PumpRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBlockId: string;
  currentBlockName: string;
  blocks: Block[];
  metrics?: BlockMetrics;
}

export function PumpRequestModal({
  open,
  onOpenChange,
  currentBlockId,
  currentBlockName,
  blocks,
  metrics,
}: PumpRequestModalProps) {
  const { t } = useTranslation();
  const pumpRequests = useUiStore((state) => state.pumpRequests);
  const addPumpRequest = useUiStore((state) => state.addPumpRequest);

  const [type, setType] = React.useState<PumpRequestType>("new_pump");
  const [targetBlockId, setTargetBlockId] = React.useState<string>("");
  const [urgency, setUrgency] = React.useState<Severity>("high");
  const [reason, setReason] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  // Available target blocks excluding current block
  const otherBlocks = React.useMemo(() => {
    return blocks.filter((b) => b.id !== currentBlockId);
  }, [blocks, currentBlockId]);

  // Set default target block if empty
  React.useEffect(() => {
    if (otherBlocks.length > 0 && !targetBlockId) {
      setTargetBlockId(otherBlocks[0].id);
    }
  }, [otherBlocks, targetBlockId]);

  // Filter previous requests for this block
  const myBlockRequests = React.useMemo(() => {
    return pumpRequests.filter(
      (r) => r.requesterBlockId === currentBlockId || r.targetBlockId === currentBlockId
    );
  }, [pumpRequests, currentBlockId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMessage(t("farmer.enterReasonError", "Please provide a reason for the pump request."));
      return;
    }
    if (type === "transfer" && !targetBlockId) {
      setErrorMessage(t("farmer.selectTargetBlockError", "Please select a target block for transfer."));
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const targetBlock = otherBlocks.find((b) => b.id === targetBlockId);
      const res = await fetch("/api/pump-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          requesterBlockId: currentBlockId,
          requesterBlockName: currentBlockName || currentBlockId,
          targetBlockId: type === "transfer" ? targetBlockId : undefined,
          targetBlockName: type === "transfer" ? targetBlock?.name : undefined,
          reason: reason.trim(),
          urgency,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit request");
      }

      addPumpRequest(data.request);
      setSubmitSuccess(true);
      setReason("");
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error submitting request";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 text-[var(--fg-primary)] bg-[var(--bg-surface)] border-[var(--border-subtle)]">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                {t("farmer.requestPumpTitle", "Request Solar Pump Allocation")}
              </DialogTitle>
              <DialogDescription className="text-xs text-[var(--fg-muted)]">
                {t(
                  "farmer.requestPumpSubtitle",
                  "Submit a solar irrigation pump deployment or transfer request to your Upazila Agricultural Officer"
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {submitSuccess && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-center gap-2.5 text-xs text-emerald-600 dark:text-emerald-400 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>
              {t(
                "farmer.requestSubmittedSuccess",
                "Your solar pump request has been submitted to the Upazila Office. Review status below."
              )}
            </span>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-xl border border-[var(--status-danger)]/30 bg-[var(--status-danger-bg)] p-3 flex items-center gap-2.5 text-xs text-[var(--status-danger)]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Request Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider block">
              {t("farmer.requestType", "Request Action")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("new_pump")}
                className={cn(
                  "flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                  type === "new_pump"
                    ? "border-[var(--primary)] bg-[var(--primary-subtle)] text-[var(--primary)] shadow-xs"
                    : "border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--fg-secondary)] hover:border-[var(--border-strong)]"
                )}
              >
                <Zap className="h-4 w-4" />
                <span>{t("farmer.requestNewPump", "New Pump Allocation")}</span>
              </button>

              <button
                type="button"
                onClick={() => setType("transfer")}
                className={cn(
                  "flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                  type === "transfer"
                    ? "border-[var(--primary)] bg-[var(--primary-subtle)] text-[var(--primary)] shadow-xs"
                    : "border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--fg-secondary)] hover:border-[var(--border-strong)]"
                )}
              >
                <RotateCw className="h-4 w-4" />
                <span>{t("farmer.transferPump", "Transfer Shared Pump")}</span>
              </button>
            </div>
          </div>

          {/* Current Block Context */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--fg-muted)]">
                {t("farmer.activeBlockLabel", "Active Requesting Block")}:
              </span>
              <span className="font-bold text-[var(--fg-primary)]">
                {currentBlockName || currentBlockId}
              </span>
            </div>

            {metrics && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-subtle)] text-xs">
                <div>
                  <span className="text-[10px] text-[var(--fg-muted)] block">
                    {t("farmer.soilMoisture", "Soil Moisture")}
                  </span>
                  <span className="font-bold font-mono text-[var(--fg-primary)]">
                    {metrics.soilMoistureSurface.value.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--fg-muted)] block">
                    {t("farmer.waterStressIndex", "Crop Water Stress (CWSI)")}
                  </span>
                  <span
                    className={cn(
                      "font-bold font-mono",
                      metrics.cwsi > 0.6
                        ? "text-[var(--status-danger)]"
                        : metrics.cwsi > 0.4
                        ? "text-[var(--status-warning)]"
                        : "text-[var(--status-success)]"
                    )}
                  >
                    {(metrics.cwsi * 100).toFixed(0)}% (
                    {metrics.cwsi > 0.6
                      ? t("farmer.severeDeficit", "Severe Deficit")
                      : metrics.cwsi > 0.4
                      ? t("farmer.moderateDeficit", "Moderate Deficit")
                      : t("farmer.adequateWater", "Adequate")})
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Transfer Target Block (Conditional) */}
          {type === "transfer" && (
            <div className="space-y-1.5 animate-in fade-in">
              <label className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider block">
                {t("farmer.targetBlockLabel", "Transfer Destination Block")}
              </label>
              <select
                value={targetBlockId}
                onChange={(e) => setTargetBlockId(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-xs font-bold text-[var(--fg-primary)] focus:outline-none focus:border-[var(--primary)] cursor-pointer"
              >
                {otherBlocks.map((blk) => (
                  <option
                    key={blk.id}
                    value={blk.id}
                    className="text-black bg-white dark:text-white dark:bg-zinc-900"
                  >
                    {blk.name} ({blk.subDistrict}) — {blk.pumpAssetCount} existing pumps
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-[var(--fg-muted)]">
                {t(
                  "farmer.transferDesc",
                  "Requesting officer re-routing of mobile solar pump equipment to adjacent agricultural block."
                )}
              </p>
            </div>
          )}

          {/* Urgency Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider block">
              {t("farmer.urgencyLevel", "Urgency Level")}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["low", "medium", "high"] as Severity[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setUrgency(lvl)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer",
                    urgency === lvl
                      ? lvl === "high"
                        ? "border-[var(--status-danger)]/50 bg-[var(--status-danger-bg)] text-[var(--status-danger)] shadow-xs"
                        : lvl === "medium"
                        ? "border-[var(--status-warning)]/50 bg-[var(--status-warning-bg)] text-[var(--status-warning)] shadow-xs"
                        : "border-[var(--status-success)]/50 bg-[var(--status-success-bg)] text-[var(--status-success)] shadow-xs"
                      : "border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-[var(--fg-secondary)]"
                  )}
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      lvl === "high"
                        ? "bg-[var(--status-danger)]"
                        : lvl === "medium"
                        ? "bg-[var(--status-warning)]"
                        : "bg-[var(--status-success)]"
                    )}
                  />
                  <span>{lvl}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reason Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider block">
              {t("farmer.reasonLabel", "Field Justification & Crop Condition")}
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t(
                "farmer.reasonPlaceholder",
                "Describe why your block requires solar pump support (e.g., paddy wilting, canal dried up, peak tillering phase...)"
              )}
              className="text-xs min-h-[75px]"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !reason.trim()}
            className="w-full gap-2 text-xs font-bold py-2.5 shadow-sm cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <RotateCw className="h-3.5 w-3.5 animate-spin" />
                <span>{t("farmer.submitting", "Transmitting to Upazila Office...")}</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>{t("farmer.submitRequest", "Submit Solar Pump Request")}</span>
              </>
            )}
          </Button>
        </form>

        {/* My Requests History */}
        <div className="pt-4 border-t border-[var(--border-subtle)] space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)] flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span>{t("farmer.requestHistory", "Previous Pump Requests for This Block")}</span>
            </h4>
            <span className="text-[10px] font-mono text-[var(--fg-muted)]">
              {myBlockRequests.length} {t("common.total", "total")}
            </span>
          </div>

          {myBlockRequests.length === 0 ? (
            <p className="text-xs text-[var(--fg-muted)] italic py-2 text-center bg-[var(--bg-surface-subtle)] rounded-xl border border-[var(--border-subtle)]">
              {t("farmer.noPastRequests", "No past pump requests submitted for this block.")}
            </p>
          ) : (
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {myBlockRequests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-2.5 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-[var(--fg-primary)]">
                      {req.type === "new_pump" ? (
                        <>
                          <Zap className="h-3.5 w-3.5 text-amber-500" />
                          <span>{t("farmer.newPump", "New Allocation")}</span>
                        </>
                      ) : (
                        <>
                          <RotateCw className="h-3.5 w-3.5 text-blue-500" />
                          <span>
                            {t("farmer.transferTo", "Transfer →")} {req.targetBlockName || req.targetBlockId}
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
                    >
                      {req.status}
                    </MetricBadge>
                  </div>

                  <p className="text-[11px] text-[var(--fg-secondary)] line-clamp-2">
                    {req.reason}
                  </p>

                  {req.officerNote && (
                    <div className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[10px] space-y-0.5">
                      <span className="font-bold text-[var(--primary)] block">
                        {t("farmer.officerResponse", "Officer Response:")}
                      </span>
                      <p className="text-[var(--fg-primary)]">{req.officerNote}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[9px] text-[var(--fg-muted)] font-mono pt-1 border-t border-[var(--border-subtle)]/40">
                    <span>
                      {new Date(req.requestedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {req.resolvedBy && <span>{req.resolvedBy}</span>}
                  </div>
                </div>
              ))}
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
            {t("common.close", "Close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
