"use client";

import * as React from "react";
import { Block, BlockMetrics, DistrictSummary, Alert, CropRecommendation, TimeSeriesPoint, IrrigationPlan } from "@/lib/dal/types";
import { useUiStore, initStoreSync, restoreStateFromUrl } from "@/lib/stores/ui";
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
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const cleanup = initStoreSync();
    setMounted(true);
    return cleanup;
  }, []);

  const fromUrl = React.useMemo(() => {
    if (typeof window !== "undefined") {
      return restoreStateFromUrl();
    }
    return null;
  }, []);

  const currentMode = mounted ? mode : (fromUrl?.mode || mode);

  return (
    <div className="w-full">
      {currentMode === "farmer" ? (
        <FarmerView
          blocks={blocks}
          metricsMap={metricsMap}
          alerts={alerts}
          recommendationsMap={recommendationsMap}
          timeSeriesMap={timeSeriesMap}
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
