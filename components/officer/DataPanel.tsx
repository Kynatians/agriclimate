"use client";

import * as React from "react";
import { Block, BlockMetrics, DistrictSummary, TimeSeriesPoint } from "@/lib/dal/types";
import { useUiStore } from "@/lib/stores/ui";
import { DistrictSummaryView } from "./DistrictSummaryView";
import { BlockDetail } from "./BlockDetail";
import { cn } from "@/lib/utils";

interface DataPanelProps {
  summary: DistrictSummary;
  blocks: Block[];
  metricsMap: Record<string, BlockMetrics>;
  timeSeriesMap?: Record<string, TimeSeriesPoint[]>;
  onSendAlert: (block: Block) => void;
  className?: string;
}

export function DataPanel({
  summary,
  blocks,
  metricsMap,
  timeSeriesMap = {},
  onSendAlert,
  className,
}: DataPanelProps) {
  const { selectedBlockId, setSelectedBlockId } = useUiStore();

  const selectedBlock = selectedBlockId
    ? blocks.find((b) => b.id === selectedBlockId)
    : null;
  const selectedMetrics = selectedBlockId ? metricsMap[selectedBlockId] : null;
  const selectedTimeSeries = selectedBlockId ? timeSeriesMap[selectedBlockId] || [] : [];

  return (
    <aside
      className={cn(
        "flex flex-col h-full overflow-y-auto border-l border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4",
        className
      )}
    >
      {selectedBlock && selectedMetrics ? (
        <BlockDetail
          block={selectedBlock}
          metrics={selectedMetrics}
          timeSeries={selectedTimeSeries}
          onBack={() => setSelectedBlockId(null)}
          onSendAlert={onSendAlert}
        />
      ) : (
        <DistrictSummaryView
          summary={summary}
          blocks={blocks}
          onSelectBlock={(id) => setSelectedBlockId(id)}
        />
      )}
    </aside>
  );
}
