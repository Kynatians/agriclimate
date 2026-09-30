"use client";

import * as React from "react";
import { Calendar, Sparkles, ArrowRight, CheckCircle2, ChevronRight, Coins, Clock, Star } from "lucide-react";
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
        {/* 1. Sowing Window Companion Card with Visual Timeline Ribbon */}
        <div
          onClick={onOpenCalendar}
          className="group flex flex-col justify-between rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-5 shadow-xs transition-all hover:border-[var(--primary)] hover:shadow-md cursor-pointer"
        >
          <div>
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
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      <CheckCircle2 className="h-3 w-3" />
                      83% Germination Safety
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-[var(--fg-primary)] mt-0.5">
                    Sow Boro Rice: Oct 14–19
                  </h4>
                  <p className="text-xs text-[var(--fg-secondary)] mt-0.5">
                    Low rainfall volatility forecast during root establishment.
                  </p>
                </div>
              </div>

              <div className="flex items-center text-[var(--primary)] shrink-0 pt-1">
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Visual Sowing Window Timeline Ribbon */}
            <div className="mt-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]/70 p-2.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-[var(--fg-muted)] mb-1">
                <span>Oct 01</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <Star className="h-2.5 w-2.5 fill-current" />
                  Best Window (5 Days)
                </span>
                <span>Oct 31</span>
              </div>
              <div className="relative h-3 w-full rounded-full bg-[var(--bg-surface)] overflow-hidden border border-[var(--border-subtle)] flex items-center">
                {/* Early Buffer */}
                <div className="h-full w-[40%] bg-[var(--bg-surface-subtle)]" />
                {/* Ideal Window (Oct 14-19) */}
                <div className="h-full w-[25%] bg-emerald-500 animate-pulse shadow-xs" />
                {/* Late Buffer */}
                <div className="h-full w-[35%] bg-[var(--bg-surface-subtle)]" />
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono mt-1 text-[var(--fg-muted)]">
                <span>Wait for moisture</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Starts in 14 Days</span>
                <span>Late frost risk</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]/70 text-xs font-bold text-[var(--primary)]">
            <span>Explore Month-by-Month Calendar</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* 2. Crop Recommendation Companion Card with Circular Score Ring */}
        <div
          onClick={onOpenRecommendations}
          className="group flex flex-col justify-between rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-5 shadow-xs transition-all hover:border-[var(--primary)] hover:shadow-md cursor-pointer"
        >
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Visual Circular CSS Score Badge */}
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono font-extrabold text-sm border-2 border-emerald-500/40 group-hover:scale-105 transition-transform shrink-0">
                  <span>91</span>
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white text-[8px] font-bold">
                    #1
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                      {t("farmer.whatToPlant", "What to plant next?")}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-1.5 py-0.2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      CSS 91/100
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-[var(--fg-primary)] mt-0.5">
                    {topCropReco ? `#1 Top Pick: ${getLocalized(topCropReco.crop.name)}` : "Recommended Crop Varieties"}
                  </h4>
                  <p className="text-xs text-[var(--fg-secondary)] mt-0.5">
                    Fast-maturing legume with high drought tolerance.
                  </p>
                </div>
              </div>

              <div className="flex items-center text-[var(--primary)] shrink-0 pt-1">
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Visual Value Metrics Pills */}
            <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]/70 p-2 font-mono">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Coins className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[9px] text-[var(--fg-muted)] block">Est. Profit Return</span>
                  <strong className="text-[var(--fg-primary)] text-xs">$480–$700/ha</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]/70 p-2 font-mono">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[9px] text-[var(--fg-muted)] block">Fast Maturity</span>
                  <strong className="text-[var(--fg-primary)] text-xs">60–72 Days</strong>
                </div>
              </div>
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

