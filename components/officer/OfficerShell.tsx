"use client";

import * as React from "react";
import { Block, BlockMetrics, DistrictSummary, Alert, TimeSeriesPoint } from "@/lib/dal/types";
import { useUiStore } from "@/lib/stores/ui";
import { ControlPanel } from "./ControlPanel";
import { DataPanel } from "./DataPanel";
import { MapCanvas } from "@/components/map/MapCanvas";
import { AlertComposer } from "./AlertComposer";
import { ReportModal } from "./ReportModal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sliders, Map as MapIcon, BarChart3 } from "lucide-react";

interface OfficerShellProps {
  blocks: Block[];
  metricsMap: Record<string, BlockMetrics>;
  summary: DistrictSummary;
  alerts: Alert[];
  timeSeriesMap?: Record<string, TimeSeriesPoint[]>;
}

export function OfficerShell({
  blocks,
  metricsMap,
  summary,
  alerts,
  timeSeriesMap = {},
}: OfficerShellProps) {
  const {
    selectedBlockId,
    setSelectedBlockId,
    officerTab: mobileTab,
    setOfficerTab: setMobileTab,
  } = useUiStore();

  const [composerOpen, setComposerOpen] = React.useState(false);
  const [reportOpen, setReportOpen] = React.useState(false);
  const [activeAlertToAnnotate, setActiveAlertToAnnotate] = React.useState<Alert | null>(null);
  const [activeBlockForAlert, setActiveBlockForAlert] = React.useState<Block | null>(null);

  const handleOpenComposer = (alert?: Alert) => {
    setActiveAlertToAnnotate(alert || null);
    setActiveBlockForAlert(null);
    setComposerOpen(true);
  };

  const handleSendBlockAlert = (block: Block) => {
    setActiveBlockForAlert(block);
    setActiveAlertToAnnotate(null);
    setComposerOpen(true);
  };

  return (
    <div className="relative flex h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-[var(--bg-app)]">
      {/* Desktop 3-Column Cockpit Layout (>= 1024px) */}
      <div className="hidden lg:flex h-full w-full">
        {/* Left Column: Control Panel (340px) */}
        <div className="w-[340px] shrink-0 h-full">
          <ControlPanel
            alerts={alerts}
            onOpenReport={() => setReportOpen(true)}
            onOpenComposer={handleOpenComposer}
          />
        </div>

        {/* Center Column: Interactive GIS MapCanvas (flex-1) */}
        <div className="flex-1 h-full relative">
          <MapCanvas
            blocks={blocks}
            metricsMap={metricsMap}
            alerts={alerts}
            onBlockSelect={(id) => setSelectedBlockId(id)}
            onAlertSelect={handleOpenComposer}
          />
        </div>

        {/* Right Column: Data Panel & Telemetry Detail (360px) */}
        <div className="w-[360px] shrink-0 h-full">
          <DataPanel
            summary={summary}
            blocks={blocks}
            metricsMap={metricsMap}
            timeSeriesMap={timeSeriesMap}
            onSendAlert={handleSendBlockAlert}
          />
        </div>
      </div>

      {/* Mobile / Tablet Tabbed Cockpit (< 1024px) */}
      <div className="flex lg:hidden flex-col h-full w-full">
        <Tabs
          value={mobileTab}
          onValueChange={(val) => setMobileTab(val as "map" | "control" | "data")}
          className="flex flex-col h-full w-full"
        >
          {/* Top Mobile Viewport Tab Switcher */}
          <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2 py-1.5 shrink-0">
            <TabsList className="grid grid-cols-3 w-full h-9">
              <TabsTrigger value="control" className="text-xs gap-1.5">
                <Sliders className="h-3.5 w-3.5" />
                <span>Controls</span>
              </TabsTrigger>
              <TabsTrigger value="map" className="text-xs gap-1.5">
                <MapIcon className="h-3.5 w-3.5" />
                <span>GIS Map</span>
              </TabsTrigger>
              <TabsTrigger value="data" className="text-xs gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Telemetry</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab 1: Control Panel */}
          <TabsContent value="control" className="flex-1 overflow-y-auto m-0">
            <ControlPanel
              alerts={alerts}
              onOpenReport={() => setReportOpen(true)}
              onOpenComposer={handleOpenComposer}
            />
          </TabsContent>

          {/* Tab 2: Map Canvas */}
          <TabsContent value="map" className="flex-1 relative m-0">
            <MapCanvas
              blocks={blocks}
              metricsMap={metricsMap}
              alerts={alerts}
              onBlockSelect={(id) => {
                setSelectedBlockId(id);
                setMobileTab("data"); // auto-switch to data tab when block is clicked
              }}
              onAlertSelect={handleOpenComposer}
            />
          </TabsContent>

          {/* Tab 3: Data Panel */}
          <TabsContent value="data" className="flex-1 overflow-y-auto m-0">
            <DataPanel
              summary={summary}
              blocks={blocks}
              metricsMap={metricsMap}
              timeSeriesMap={timeSeriesMap}
              onSendAlert={handleSendBlockAlert}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Alert Composer Modal */}
      <AlertComposer
        open={composerOpen}
        onOpenChange={setComposerOpen}
        prefillAlert={activeAlertToAnnotate}
        prefillBlock={activeBlockForAlert}
        blocks={blocks}
      />

      {/* District Report Modal */}
      <ReportModal
        open={reportOpen}
        onOpenChange={setReportOpen}
        summary={summary}
        blocks={blocks}
        metricsMap={metricsMap}
      />
    </div>
  );
}
