"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, Clock, Calendar, DollarSign, TrendingUp, CheckCircle, AlertTriangle, Sprout } from "lucide-react";
import { CropRecommendation } from "@/lib/dal/types";
import { useTranslation } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

interface CropRecoCardProps {
  reco: CropRecommendation;
  defaultCollapsed?: boolean;
  className?: string;
}

export function CropRecoCard({
  reco,
  defaultCollapsed = true,
  className,
}: CropRecoCardProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const { t, getLocalized } = useTranslation();
  const { crop, css, whyThisLand, riskNote, bestHarvestWindow } = reco;

  // Score badge color
  const scoreColor =
    css >= 80
      ? "bg-[var(--status-success-bg)] text-[var(--status-success)] border-[var(--status-success)]/40"
      : css >= 65
      ? "bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning)]/40"
      : "bg-[var(--status-danger-bg)] text-[var(--status-danger)] border-[var(--status-danger)]/40";

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xs transition-all hover:border-[var(--primary)]",
        className
      )}
    >
      {/* Header bar: Name + CSS Score + Toggle */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between p-4 sm:p-5 text-left transition-colors hover:bg-[var(--bg-surface-subtle)] cursor-pointer"
        aria-expanded={!collapsed}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)]">
            <Sprout className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-bold text-[var(--fg-primary)] leading-tight">
              {getLocalized(crop.name)}
            </h4>
            <span className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider">
              {crop.category}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={cn("flex flex-col items-center justify-center rounded-xl border px-3 py-1 font-mono", scoreColor)}>
            <span className="text-[10px] font-bold uppercase tracking-wider">CSS Score</span>
            <span className="text-xl font-extrabold">{css}</span>
          </div>

          <div className="text-[var(--fg-muted)]">
            {collapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
          </div>
        </div>
      </button>

      {/* Expanded Details Body */}
      {!collapsed && (
        <div className="border-t border-[var(--border-subtle)] p-4 sm:p-5 space-y-4 animate-in fade-in-50 duration-200">
          {/* Key Agronomic KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="flex flex-col rounded-xl bg-[var(--bg-surface-subtle)] p-3 border border-[var(--border-subtle)]/50">
              <div className="flex items-center gap-1 text-[11px] text-[var(--fg-muted)] font-medium mb-1">
                <Clock className="h-3.5 w-3.5 text-[var(--primary)]" />
                <span>{t("farmer.daysToHarvest", "Days to Harvest")}</span>
              </div>
              <span className="text-sm font-bold font-mono text-[var(--fg-primary)]">
                {crop.daysToHarvest.early}-{crop.daysToHarvest.late} days
              </span>
            </div>

            <div className="flex flex-col rounded-xl bg-[var(--bg-surface-subtle)] p-3 border border-[var(--border-subtle)]/50">
              <div className="flex items-center gap-1 text-[11px] text-[var(--fg-muted)] font-medium mb-1">
                <Calendar className="h-3.5 w-3.5 text-[var(--status-info)]" />
                <span>{t("farmer.harvestWindow", "Harvest Window")}</span>
              </div>
              <span className="text-xs font-bold font-mono text-[var(--fg-primary)] truncate">
                {bestHarvestWindow.start} to {bestHarvestWindow.end}
              </span>
            </div>

            <div className="flex flex-col rounded-xl bg-[var(--bg-surface-subtle)] p-3 border border-[var(--border-subtle)]/50">
              <div className="flex items-center gap-1 text-[11px] text-[var(--fg-muted)] font-medium mb-1">
                <DollarSign className="h-3.5 w-3.5 text-[var(--status-success)]" />
                <span>{t("farmer.estimatedRoi", "Estimated ROI")}</span>
              </div>
              <span className="text-sm font-bold font-mono text-[var(--fg-primary)]">
                ${crop.roiPerHectare.min}-${crop.roiPerHectare.max} /ha
              </span>
            </div>

            <div className="flex flex-col rounded-xl bg-[var(--bg-surface-subtle)] p-3 border border-[var(--border-subtle)]/50">
              <div className="flex items-center gap-1 text-[11px] text-[var(--fg-muted)] font-medium mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-[var(--status-warning)]" />
                <span>{t("farmer.marketDemand", "Market Demand")}</span>
              </div>
              <span className="text-sm font-bold uppercase text-[var(--primary)]">
                {crop.marketDemand}
              </span>
            </div>
          </div>

          {/* "Why this land?" Section */}
          <div className="rounded-xl border border-[var(--status-success)]/30 bg-[var(--status-success-bg)]/20 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--status-success)] mb-1">
              <CheckCircle className="h-4 w-4" />
              <span>{t("farmer.whyThisLand", "Why this land?")}</span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--fg-primary)] leading-relaxed">
              {getLocalized(whyThisLand)}
            </p>
          </div>

          {/* Conditional Risk Note */}
          {riskNote && (
            <div className="rounded-xl border border-[var(--status-warning)]/40 bg-[var(--status-warning-bg)]/20 p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--status-warning)] mb-1">
                <AlertTriangle className="h-4 w-4" />
                <span>{t("farmer.riskNote", "Risk Note")}</span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--fg-secondary)] leading-relaxed">
                {getLocalized(riskNote)}
              </p>
            </div>
          )}

          {/* Agronomic Guidance */}
          <div className="text-xs text-[var(--fg-muted)] pt-1 italic">
            Note: {getLocalized(crop.notes)}
          </div>
        </div>
      )}
    </div>
  );
}
