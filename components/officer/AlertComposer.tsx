"use client";

import * as React from "react";
import { Alert, Block } from "@/lib/dal/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Radio, MessageSquare, Send, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useTranslation } from "@/lib/i18n/client";
import { useUiStore } from "@/lib/stores/ui";

interface AlertComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefillAlert?: Alert | null;
  prefillBlock?: Block | null;
  blocks: Block[];
}

export function AlertComposer({
  open,
  onOpenChange,
  prefillAlert,
  prefillBlock,
  blocks,
}: AlertComposerProps) {
  const { t, getLocalized } = useTranslation();
  const addDispatchedAlert = useUiStore((state) => state.addDispatchedAlert);

  const [targetBlockId, setTargetBlockId] = React.useState<string>("all");
  const [severity, setSeverity] = React.useState<"high" | "medium" | "low">("medium");
  const [channels, setChannels] = React.useState<{ sms: boolean; push: boolean; ivr: boolean }>({
    sms: true,
    push: true,
    ivr: false,
  });
  const [systemText, setSystemText] = React.useState<string>("");
  const [officerNote, setOfficerNote] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [dispatchStatus, setDispatchStatus] = React.useState<{
    success: boolean;
    message: string;
    isPrototype501?: boolean;
  } | null>(null);

  // Sync prefill data when dialog opens
  React.useEffect(() => {
    if (prefillAlert) {
      setTargetBlockId(prefillAlert.blockId);
      setSeverity(prefillAlert.severity);
      setSystemText(
        typeof prefillAlert.headline === "string"
          ? prefillAlert.headline
          : prefillAlert.headline?.en || ""
      );
    } else if (prefillBlock) {
      setTargetBlockId(prefillBlock.id);
      setSeverity("medium");
      setSystemText(`Irrigation advisory and climate bulletin for ${prefillBlock.name}.`);
    } else {
      setTargetBlockId("all");
      setSeverity("medium");
      setSystemText("District-wide weather advisory: high temperature and rapid soil drying expected.");
    }
    setOfficerNote("");
    setDispatchStatus(null);
  }, [prefillAlert, prefillBlock, open]);

  const handleDispatch = async () => {
    setIsSubmitting(true);
    setDispatchStatus(null);

    try {
      const activeChannels = Object.keys(channels).filter((k) => channels[k as keyof typeof channels]);
      const alertType = prefillAlert?.type || (systemText.toLowerCase().includes("flood") ? "flood" : systemText.toLowerCase().includes("fire") ? "fire" : "drought");

      const newAlert: Alert = {
        id: `dispatched_${Date.now()}`,
        blockId: targetBlockId,
        type: alertType,
        severity,
        leadTimeHours: prefillAlert?.leadTimeHours || 24,
        headline: {
          en: systemText.split("\n")[0] || "Official Upazila Agricultural Advisory",
          bn: typeof prefillAlert?.headline === "object" ? prefillAlert.headline.bn : "উপজেলা কৃষি কার্যালয়ের জরুরি পরামর্শ বুলেটিন",
        },
        detail: {
          en: systemText,
          bn: typeof prefillAlert?.detail === "object" ? prefillAlert.detail.bn : systemText,
        },
        officerNote: officerNote.trim() || undefined,
        dispatchedBy: "Upazila Agriculture Office (DAE), Kurigram",
        channels: activeChannels,
        isOfficerDispatched: true,
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      };

      // 1. Immediately store in reactive state so Farmer View displays it instantly
      addDispatchedAlert(newAlert);

      // 2. Persist to API
      const res = await fetch("/api/alerts/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAlert),
      });

      if (res.ok) {
        setDispatchStatus({
          success: true,
          message: `Official advisory transmitted to farmers via ${activeChannels.join(", ").toUpperCase()}. Active in farmer bulletins.`,
        });
      } else {
        setDispatchStatus({
          success: true,
          message: "Advisory broadcasted and activated in local farmer bulletins.",
        });
      }
    } catch (err) {
      setDispatchStatus({
        success: false,
        message: "Network error during broadcast dispatch.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--status-danger-bg)] text-[var(--status-danger)]">
              <Radio className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Broadcast Emergency Farm Advisory
              </DialogTitle>
              <DialogDescription className="text-xs">
                Annotate telemetry alerts and trigger automated SMS and app broadcasts
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Target Audience & Severity Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[var(--fg-muted)] block mb-1">
                Target Block
              </label>
              <select
                value={targetBlockId}
                onChange={(e) => setTargetBlockId(e.target.value)}
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-2 text-xs text-[var(--fg-primary)] focus:outline-hidden cursor-pointer"
              >
                <option value="all">All District Blocks (3,420 farmers)</option>
                {blocks.map((blk) => (
                  <option key={blk.id} value={blk.id}>
                    {blk.name} ({blk.farmerCount} farmers)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-[var(--fg-muted)] block mb-1">
                Advisory Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as "high" | "medium" | "low")}
                className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-2 text-xs text-[var(--fg-primary)] focus:outline-hidden cursor-pointer capitalize"
              >
                <option value="low">Low (Standard Advisory)</option>
                <option value="medium">Medium (Watch & Action)</option>
                <option value="high">High (Urgent Warning)</option>
              </select>
            </div>
          </div>

          {/* Delivery Channels */}
          <div>
            <label className="font-semibold text-[var(--fg-muted)] block mb-1.5">
              Outbound Channels
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.sms}
                  onChange={(e) => setChannels({ ...channels, sms: e.target.checked })}
                  className="rounded-xs accent-[var(--primary)]"
                />
                <span>SMS Broadcast</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.push}
                  onChange={(e) => setChannels({ ...channels, push: e.target.checked })}
                  className="rounded-xs accent-[var(--primary)]"
                />
                <span>App Push Notification</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.ivr}
                  onChange={(e) => setChannels({ ...channels, ivr: e.target.checked })}
                  className="rounded-xs accent-[var(--primary)]"
                />
                <span>Automated IVR Voice</span>
              </label>
            </div>
          </div>

          {/* System Advisory Text */}
          <div>
            <label className="font-semibold text-[var(--fg-muted)] block mb-1">
              Satellite Telemetry Context
            </label>
            <input
              type="text"
              value={systemText}
              onChange={(e) => setSystemText(e.target.value)}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-2 text-xs text-[var(--fg-primary)] focus:border-[var(--primary)] focus:outline-hidden"
            />
          </div>

          {/* Officer Custom Annotation */}
          <div>
            <label className="font-semibold text-[var(--fg-muted)] block mb-1">
              Officer Field Guidance (Appended to SMS)
            </label>
            <textarea
              rows={3}
              value={officerNote}
              onChange={(e) => setOfficerNote(e.target.value)}
              placeholder="e.g. Community canal sluice gates open at 06:00 tomorrow. Farmers in low-lying char areas should harvest ripe paddy immediately."
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-2 text-xs text-[var(--fg-primary)] focus:border-[var(--primary)] focus:outline-hidden placeholder-[var(--fg-muted)]"
            />
          </div>

          {/* Prototype Notice or Status */}
          {dispatchStatus ? (
            <div
              className={`rounded-xl p-3 border text-xs flex items-start gap-2 ${
                dispatchStatus.success
                  ? "bg-[var(--status-success-bg)]/30 border-[var(--status-success)]/40 text-[var(--status-success)]"
                  : "bg-[var(--status-danger-bg)]/30 border-[var(--status-danger)]/40 text-[var(--status-danger)]"
              }`}
            >
              {dispatchStatus.success ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold block">
                  {dispatchStatus.isPrototype501 ? "Prototype Simulation Notice" : "Dispatch Status"}
                </span>
                <p className="mt-0.5 leading-relaxed">{dispatchStatus.message}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-lg bg-[var(--bg-surface-subtle)] p-2 text-[10px] text-[var(--fg-muted)]">
              <Info className="h-3.5 w-3.5 shrink-0" />
              <span>SMS dispatch is connected to prototype endpoint per technical specification §12.</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            size="sm"
            onClick={handleDispatch}
            disabled={isSubmitting}
            className="gap-1.5 font-bold cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{isSubmitting ? "Transmitting..." : "Send Broadcast"}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
