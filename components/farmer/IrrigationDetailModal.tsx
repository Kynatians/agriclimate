"use client";

import * as React from "react";
import { Droplets, Zap, Clock, ShieldCheck, MapIcon, ArrowRight } from "lucide-react";
import { BlockMetrics, IrrigationPlan } from "@/lib/dal/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

interface IrrigationDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metrics?: BlockMetrics;
  currentBlockId: string;
  irrigationPlan?: IrrigationPlan;
  onJumpToMap?: () => void;
}

export function IrrigationDetailModal({
  open,
  onOpenChange,
  metrics,
  currentBlockId,
  irrigationPlan,
  onJumpToMap,
}: IrrigationDetailModalProps) {
  const { t } = useTranslation();

  const isStressed = metrics && metrics.cwsi > 0.6;
  const deployment = irrigationPlan?.deployments.find((d) => d.targetBlockId === currentBlockId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-2 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--status-info-bg)] text-[var(--status-info)] shrink-0">
              <Droplets className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-[var(--fg-primary)]">
                {t("farmer.irrigationSchedule", "Precision Irrigation & Solar Pumping")}
              </DialogTitle>
              <DialogDescription className="text-xs text-[var(--fg-muted)]">
                Optimized pump schedule based on NASA SMAP root-zone moisture deficit
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3.5 py-2 text-xs">
          {/* Main Status & Guidance */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-3.5 space-y-2">
            <div className="flex items-center justify-between font-bold text-sm">
              <span className="text-[var(--fg-primary)]">Field Moisture Status:</span>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs font-mono",
                isStressed
                  ? "bg-[var(--status-danger-bg)] text-[var(--status-danger)]"
                  : "bg-[var(--status-success-bg)] text-[var(--status-success)]"
              )}>
                {isStressed ? "Deficit: Evening Pumping Required" : "Moisture Adequate"}
              </span>
            </div>

            <p className="text-[var(--fg-secondary)] leading-relaxed">
              {isStressed
                ? "Root-zone soil deficit detected at 24% VWC. Run solar pump for 2 hours between 17:30 and 19:30 to avoid midday evaporative loss."
                : "Soil moisture is currently sufficient across the root zone. Standard rotational pumping will keep crop healthy."}
            </p>
          </div>

          {/* Solar Pump Operating Protocol Breakdown */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3.5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--fg-primary)]">
              <Zap className="h-4 w-4 text-[var(--primary)]" />
              <span>Solar Pump Operating Protocol</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-surface-subtle)]">
                <span className="font-medium text-[var(--fg-secondary)]">Recommended Time:</span>
                <span className="font-mono font-bold text-[var(--status-info)]">17:30 – 19:30 (Evening)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-surface-subtle)]">
                <span className="font-medium text-[var(--fg-secondary)]">Avoid Peak Heat Window:</span>
                <span className="font-mono font-bold text-[var(--status-danger)]">11:00 – 14:00 (Evaporative Loss)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-surface-subtle)]">
                <span className="font-medium text-[var(--fg-secondary)]">Estimated Fuel Savings:</span>
                <span className="font-mono font-bold text-[var(--status-success)]">3.2 Liters Diesel / cycle</span>
              </div>
            </div>
          </div>

          {/* Block Pumping Allocation */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-3.5 space-y-2">
            <span className="font-bold text-[var(--fg-primary)] block text-xs">
              Shared Solar Asset Allocation (Upazila Schedule):
            </span>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--border-subtle)]/60">
              <span className="text-[var(--fg-secondary)]">Allocated Hours:</span>
              <span className="font-mono font-bold text-[var(--fg-primary)]">
                {deployment ? `${deployment.estimatedCoverageHours} hrs/cycle` : "2.0 hrs/cycle"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--fg-secondary)]">Sequence Priority:</span>
              <span className="font-mono font-bold text-[var(--primary)]">
                {deployment ? `Rank #${deployment.suggestedSequence}` : "Standard Rotation"}
              </span>
            </div>
          </div>

          {/* Quick Jump Action */}
          {onJumpToMap && (
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onJumpToMap();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--primary-subtle)] text-[var(--primary)] font-bold hover:bg-[var(--primary-subtle)]/70 transition-colors text-xs cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <MapIcon className="h-4 w-4" />
                View Soil Saturation on GIS Map
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-[var(--border-subtle)]">
          <Button onClick={() => onOpenChange(false)} variant="outline" className="cursor-pointer">
            {t("common.close", "Understood")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
