"use client";

import * as React from "react";
import { Block, BlockMetrics, DistrictSummary, Alert, CropRecommendation, TimeSeriesPoint, IrrigationPlan } from "@/lib/dal/types";
import { useUiStore } from "@/lib/stores/ui";
import { FarmerView } from "@/components/farmer/FarmerView";
import { OfficerShell } from "@/components/officer/OfficerShell";

interface AppModeSwitchProps {
  blocks: Block[];
  metricsMap: Record<string, BlockMetrics>;
  summary: DistrictSummary;
  alerts: Alert[];
  recommendationsMap: Record<string, CropRecommendation[]>;
  timeSeriesMap: Record<string, TimeSeriesPoint[]>;
  irrigationPlan: IrrigationPlan;
}

export function AppModeSwitch({
  blocks,
  metricsMap,
  summary,
  alerts,
  recommendationsMap,
  timeSeriesMap,
  irrigationPlan,
}: AppModeSwitchProps) {
  const mode = useUiStore((state) => state.mode);

  return (
    <div className="w-full">
      {mode === "farmer" ? (
        <FarmerView
          blocks={blocks}
          metricsMap={metricsMap}
          alerts={alerts}
          recommendationsMap={recommendationsMap}
          irrigationPlan={irrigationPlan}
        />
      ) : (
        <OfficerShell
          blocks={blocks}
          metricsMap={metricsMap}
          summary={summary}
          alerts={alerts}
          timeSeriesMap={timeSeriesMap}
        />
      )}
    </div>
  );
}
