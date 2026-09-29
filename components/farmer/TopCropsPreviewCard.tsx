"use client";

import * as React from "react";
import { Sparkles, ArrowRight, TrendingUp, Calendar, Clock, DollarSign } from "lucide-react";
import { CropRecommendation } from "@/lib/dal/types";
import { useTranslation } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

interface TopCropsPreviewCardProps {
  recommendations: CropRecommendation[];
  onOpenModal: () => void;
  className?: string;
}

export function TopCropsPreviewCard({
  recommendations,
  onOpenModal,
  className,
}: TopCropsPreviewCardProps) {
  const { t, getLocalized } = useTranslation();
  const topThree = recommendations.slice(0, 3);

  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-xs transition-all hover:border-[var(--primary)]/60",
        className
      )}
    >
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]/70">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-[var(--fg-primary)] leading-tight">
              {t("farmer.whatToPlant", "Top Crop Recommendations")}
            </h4>
            <span className="text-xs text-[var(--fg-muted)]">
              Ranked by Crop Suitability Score (CSS 0-100)
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenModal}
          className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>View All ({recommendations.length})</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-2.5 my-3.5">
        {topThree.map((reco, idx) => {
          const { crop, css } = reco;
          const scoreColor =
            css >= 80
              ? "text-[var(--status-success)] bg-[var(--status-success-bg)] border-[var(--status-success)]/40"
              : css >= 65
              ? "text-[var(--status-warning)] bg-[var(--status-warning-bg)] border-[var(--status-warning)]/40"
              : "text-[var(--status-danger)] bg-[var(--status-danger-bg)] border-[var(--status-danger)]/40";

          return (
            <div
              key={crop.id}
              onClick={onOpenModal}
              className="group flex items-center justify-between p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]/60 hover:bg-[var(--bg-surface-subtle)] hover:border-[var(--primary)]/50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--bg-surface)] text-xs font-mono font-bold text-[var(--fg-muted)] border border-[var(--border-subtle)]">
                  #{idx + 1}
                </span>
                <div>
                  <h5 className="text-sm font-bold text-[var(--fg-primary)] group-hover:text-[var(--primary)] transition-colors">
                    {getLocalized(crop.name)}
                  </h5>
                  <div className="flex items-center gap-2 text-[11px] text-[var(--fg-muted)]">
                    <span>{crop.category}</span>
                    <span>•</span>
                    <span>{crop.daysToHarvest.early}-{crop.daysToHarvest.late}d</span>
                    <span>•</span>
                    <span className="text-[var(--status-success)] font-medium">
                      ROI ${crop.roiPerHectare.min}-${crop.roiPerHectare.max}/ha
                    </span>
                  </div>
                </div>
              </div>

              <div className={cn("flex flex-col items-center justify-center rounded-lg border px-2.5 py-1 font-mono", scoreColor)}>
                <span className="text-[9px] font-bold uppercase tracking-wider">CSS</span>
                <span className="text-sm font-extrabold leading-none">{css}</span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onOpenModal}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--bg-surface-subtle)] py-2 text-xs font-bold text-[var(--primary)] border border-[var(--border-subtle)] hover:bg-[var(--primary-subtle)] transition-all cursor-pointer"
      >
        <span>Explore Detailed Agronomic Suitability</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
