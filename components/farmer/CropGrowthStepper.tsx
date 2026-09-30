"use client";

import * as React from "react";
import { Sprout, Leaf, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CropGrowthStepperProps {
  cropName: string;
  cropStage?: string | null;
  ndviValue: number;
  ndviBaseline: number;
  nutrientTitle: string;
  nutrientShortTip: string;
  className?: string;
}

export function CropGrowthStepper({
  cropName,
  cropStage = "Tillering",
  ndviValue,
  ndviBaseline,
  nutrientTitle,
  nutrientShortTip,
  className,
}: CropGrowthStepperProps) {
  // Stages in rice lifecycle
  const stages = [
    { id: "sowing", label: "Seedling", bn: "চারা", days: "0–20d" },
    { id: "tillering", label: "Tillering", bn: "কুশি", days: "21–55d" },
    { id: "flowering", label: "Panicle", bn: "থোড়", days: "56–85d" },
    { id: "harvest", label: "Harvest", bn: "কর্তন", days: "86–115d" },
  ];

  // Current active index
  const stageLower = (cropStage || "tillering").toLowerCase();
  let activeIndex = 1; // Default tillering
  if (stageLower.includes("sow") || stageLower.includes("seed")) activeIndex = 0;
  else if (stageLower.includes("tiller") || stageLower.includes("veg")) activeIndex = 1;
  else if (stageLower.includes("flower") || stageLower.includes("panicle") || stageLower.includes("boot")) activeIndex = 2;
  else if (stageLower.includes("harv") || stageLower.includes("matur") || stageLower.includes("ripen")) activeIndex = 3;

  // NDVI vigor assessment
  const isVigorous = ndviValue >= 0.50;
  const isDeficit = ndviValue < ndviBaseline - 0.04;

  return (
    <div className={cn("space-y-3", className)}>
      {/* 4-Stage Crop Growth Timeline Stepper */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]/70 p-3">
        <div className="flex items-center justify-between text-xs mb-2.5">
          <div className="flex items-center gap-1.5 font-bold text-[var(--fg-primary)]">
            <Sprout className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Growth Stage Journey</span>
          </div>
          <span className="text-[10px] font-mono font-bold text-[var(--primary)] bg-[var(--primary-subtle)] px-2 py-0.5 rounded-full">
            Day 34 of 115
          </span>
        </div>

        {/* Stepper Graphic */}
        <div className="relative flex items-center justify-between">
          {/* Continuous Connecting Line */}
          <div className="absolute left-4 right-4 top-3.5 h-0.5 bg-[var(--border-subtle)] -z-0" />
          <div
            className="absolute left-4 top-3.5 h-0.5 bg-emerald-500 transition-all duration-700 -z-0"
            style={{ width: `${(activeIndex / (stages.length - 1)) * 90}%` }}
          />

          {stages.map((stg, i) => {
            const isCompleted = i < activeIndex;
            const isCurrent = i === activeIndex;

            return (
              <div key={stg.id} className="relative z-1 flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-bold font-mono transition-all",
                    isCurrent
                      ? "border-emerald-500 bg-emerald-500 text-white shadow-md scale-110 ring-4 ring-emerald-500/20"
                      : isCompleted
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--fg-muted)]"
                  )}
                >
                  {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-bold mt-1",
                    isCurrent ? "text-[var(--primary)]" : "text-[var(--fg-muted)]"
                  )}
                >
                  {stg.label}
                </span>
                <span className="text-[8px] text-[var(--fg-muted)]">{stg.bn}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaf Chlorophyll Vigor & Action Prescription */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]/70 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {/* Visual Leaf Indicator with Dynamic Greenness */}
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl transition-all shadow-xs",
                isVigorous
                  ? "bg-emerald-600 text-white"
                  : isDeficit
                  ? "bg-amber-500 text-white"
                  : "bg-emerald-500/80 text-white"
              )}
            >
              <Leaf className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase tracking-wider block">
                Canopy Chlorophyll Vigor
              </span>
              <span className="text-xs font-bold text-[var(--fg-primary)]">
                {isVigorous ? "Strong Photosynthesis (Green)" : isDeficit ? "Nitrogen Deficit (Yellowing)" : "Normal Canopy Growth"}
              </span>
            </div>
          </div>

          <span
            className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full font-mono uppercase",
              isVigorous
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
            )}
          >
            NDVI {ndviValue.toFixed(2)}
          </span>
        </div>

        {/* Prescription Box with Fertilizer/Action Icon */}
        <div className="mt-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2.5">
          <div className="flex items-start gap-2">
            <span className="text-base shrink-0">🌿</span>
            <div>
              <h4 className="text-xs font-bold text-[var(--fg-primary)] leading-tight">
                {nutrientTitle}
              </h4>
              <p className="text-[11px] text-[var(--fg-secondary)] mt-0.5 leading-snug">
                {nutrientShortTip}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-[var(--primary)] font-bold">
                <Clock className="h-3 w-3" />
                <span>Best applied before 10:00 AM on moist soil</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
