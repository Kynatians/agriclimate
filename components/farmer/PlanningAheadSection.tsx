"use client";

import * as React from "react";
import { Calendar, Sparkles, ArrowRight, CheckCircle2, ChevronRight, TrendingUp } from "lucide-react";
import { CropRecommendation } from "@/lib/dal/types";
import { useTranslation } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

interface PlanningAheadSectionProps {
  recommendations: CropRecommendation[];
  onOpenCalendar: () => void;
  onOpenRecommendations: () => void;
  className?: string;
}

export function PlanningAheadSection({
  recommendations,
  onOpenCalendar,
  onOpenRecommendations,
  className,
}: PlanningAheadSectionProps) {
  const { t, getLocalized } = useTranslation();
  const topCropReco = recommendations[0];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--fg-muted)]">
          Planning Ahead & Next Season
        </h3>
        <span className="text-xs text-[var(--fg-muted)]">
          Climate-Optimized Windows
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Sowing Window Companion Card */}
        <div
          onClick={onOpenCalendar}
          className="group flex flex-col justify-between rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-5 shadow-xs transition-all hover:border-[var(--primary)] cursor-pointer"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary-subtle)] text-[var(--primary)] group-hover:scale-105 transition-transform shrink-0">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                    {t("farmer.calendarTeaser", "Optimal Sowing Window")}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded bg-[var(--status-success-bg)] px-1.5 py-0.2 text-[10px] font-bold text-[var(--status-success)]">
                    <CheckCircle2 className="h-3 w-3" />
                    83% safe
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-[var(--fg-primary)] mt-0.5">
                  Sow Boro Rice: Oct 14–19
                </h4>
                <p className="text-xs text-[var(--fg-secondary)] mt-0.5">
                  Low rainfall volatility predicted during germination phase.
                </p>
              </div>
            </div>

            <div className="flex items-center text-[var(--primary)] shrink-0 pt-1">
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]/70 text-xs font-bold text-[var(--primary)]">
            <span>Explore Month-by-Month Calendar</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* 2. Crop Recommendation Companion Card */}
        <div
          onClick={onOpenRecommendations}
          className="group flex flex-col justify-between rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-5 shadow-xs transition-all hover:border-[var(--primary)] cursor-pointer"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary-subtle)] text-[var(--primary)] group-hover:scale-105 transition-transform shrink-0">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                    {t("farmer.whatToPlant", "What to plant next?")}
                  </span>
                  {topCropReco && (
                    <span className="inline-flex items-center gap-1 rounded bg-[var(--status-success-bg)] px-1.5 py-0.2 text-[10px] font-bold text-[var(--status-success)] font-mono">
                      CSS {topCropReco.css}/100
                    </span>
                  )}
                </div>
                <h4 className="text-sm sm:text-base font-bold text-[var(--fg-primary)] mt-0.5">
                  {topCropReco ? `#1 Top Pick: ${getLocalized(topCropReco.crop.name)}` : "Recommended Crop Varieties"}
                </h4>
                {topCropReco && (
                  <p className="text-xs text-[var(--fg-secondary)] mt-0.5">
                    ROI ${topCropReco.crop.roiPerHectare.min}–${topCropReco.crop.roiPerHectare.max}/ha • {topCropReco.crop.daysToHarvest.early}–{topCropReco.crop.daysToHarvest.late}d to harvest
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center text-[var(--primary)] shrink-0 pt-1">
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]/70 text-xs font-bold text-[var(--primary)]">
            <span>View All ({recommendations.length}) Climate Ranked Crops</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}
