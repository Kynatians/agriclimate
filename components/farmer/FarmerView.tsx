"use client";

import * as React from "react";
import { Block, BlockMetrics, Alert, CropRecommendation, IrrigationPlan } from "@/lib/dal/types";
import { useUiStore } from "@/lib/stores/ui";
import { useTranslation } from "@/lib/i18n/client";
import { BottomNav, FarmerTab } from "./BottomNav";
import { WeatherCard } from "./WeatherCard";
import { CropConditionCard } from "./CropConditionCard";
import { AlertCard } from "./AlertCard";
import { HomeActionTiles } from "./HomeActionTiles";
import { CalendarTeaserCard } from "./CalendarTeaserCard";
import { CropRecommendationModal } from "./CropRecommendationModal";
import { FarmerBlockMap } from "./FarmerBlockMap";
import { CropCalendarView } from "./CropCalendarView";
import { AlertsListView } from "./AlertsListView";
import { VoiceFab } from "./VoiceFab";
import { Sparkles, MapPin, Droplets, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FarmerViewProps {
  blocks: Block[];
  metricsMap: Record<string, BlockMetrics>;
  alerts: Alert[];
  recommendationsMap: Record<string, CropRecommendation[]>;
  irrigationPlan?: IrrigationPlan;
}

export function FarmerView({
  blocks,
  metricsMap,
  alerts,
  recommendationsMap,
  irrigationPlan,
}: FarmerViewProps) {
  const { t, getLocalized } = useTranslation();
  const { selectedBlockId, setSelectedBlockId } = useUiStore();
  const [activeTab, setActiveTab] = React.useState<FarmerTab>("home");
  const [isRecoOpen, setIsRecoOpen] = React.useState(false);
  const [isIrrigationOpen, setIsIrrigationOpen] = React.useState(false);

  // Active block
  const currentBlockId = selectedBlockId || (blocks[0] ? blocks[0].id : "blk_kurigram_01");
  const currentBlock = blocks.find((b) => b.id === currentBlockId) || blocks[0];
  const currentMetrics = metricsMap[currentBlockId] || Object.values(metricsMap)[0];
  const currentRecos = recommendationsMap[currentBlockId] || [];

  // Active block alerts
  const blockAlerts = alerts.filter(
    (a) => a.blockId === currentBlockId || a.blockId === "all"
  );
  const topAlert = blockAlerts[0] || alerts[0];

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-2xl bg-[var(--bg-app)] pb-24 text-[var(--fg-primary)]">
      {/* Top Header / Farm Context Bar */}
      <header className="sticky top-14 z-20 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)]">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                {t("farmer.myFarmBlock", "Active Field Block")}
              </span>
              <div className="flex items-center gap-1.5">
                <select
                  value={currentBlockId}
                  onChange={(e) => setSelectedBlockId(e.target.value)}
                  className="font-bold text-sm bg-transparent border-none text-[var(--fg-primary)] focus:outline-hidden cursor-pointer"
                  aria-label="Select farm block"
                >
                  {blocks.map((blk) => (
                    <option key={blk.id} value={blk.id} className="text-black bg-white dark:text-white dark:bg-zinc-900">
                      {blk.name} ({blk.subDistrict})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick "What to Plant?" trigger */}
          <button
            type="button"
            onClick={() => setIsRecoOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[var(--primary-hover)] active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t("farmer.whatToPlant", "What to plant?")}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area by Tab */}
      <main className="p-4 sm:p-6 space-y-5">
        {activeTab === "home" && (
          <div className="space-y-4">
            {/* Urgent Alert Banner (if any) */}
            {topAlert && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCard
                  alert={topAlert}
                  onView={() => setActiveTab("alerts")}
                />
              </div>
            )}

            {/* Weather & Soil Anomaly Card */}
            {currentMetrics && (
              <WeatherCard
                metrics={currentMetrics}
                blockName={currentBlock ? currentBlock.name : "Kurigram"}
              />
            )}

            {/* Crop Condition & Satellite Telemetry Card */}
            {currentMetrics && (
              <CropConditionCard
                metrics={currentMetrics}
                block={currentBlock}
              />
            )}

            {/* Action Tiles (Irrigation & Soil Nutrition) */}
            {currentMetrics && (
              <div
                onClick={() => setIsIrrigationOpen(true)}
                className="cursor-pointer"
              >
                <HomeActionTiles metrics={currentMetrics} />
              </div>
            )}

            {/* Calendar Window Teaser */}
            <CalendarTeaserCard
              onViewCalendar={() => setActiveTab("calendar")}
            />
          </div>
        )}

        {activeTab === "map" && (
          <div className="animate-in fade-in duration-200">
            <FarmerBlockMap
              blocks={blocks}
              metricsMap={metricsMap}
              userBlockId={currentBlockId}
            />
          </div>
        )}

        {activeTab === "calendar" && (
          <div className="animate-in fade-in duration-200">
            <CropCalendarView />
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="animate-in fade-in duration-200">
            <AlertsListView alerts={alerts} />
          </div>
        )}
      </main>

      {/* Bottom Floating Voice Action Button (VoiceFab) */}
      <VoiceFab />

      {/* Persistent Bottom Tab Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        alertCount={blockAlerts.length}
      />

      {/* "What to Plant?" Crop Recommendation Modal */}
      <CropRecommendationModal
        open={isRecoOpen}
        onOpenChange={setIsRecoOpen}
        recommendations={currentRecos}
        blockName={currentBlock ? currentBlock.name : undefined}
      />

      {/* Irrigation Detail Dialog */}
      <Dialog open={isIrrigationOpen} onOpenChange={setIsIrrigationOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--status-info-bg)] text-[var(--status-info)]">
                <Droplets className="h-4 w-4" />
              </div>
              <DialogTitle className="text-base font-bold">
                {t("farmer.irrigationSchedule", "7-Day Irrigation Advisory")}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Optimized solar pump schedule based on NASA root-zone moisture deficit
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-3">
              <div className="flex items-center justify-between font-bold text-sm">
                <span>Recommendation:</span>
                <span className="text-[var(--status-info)]">
                  {currentMetrics && currentMetrics.cwsi > 0.6 ? "Evening Pumping" : "Normal Rotation"}
                </span>
              </div>
              <p className="mt-1 text-[var(--fg-secondary)] leading-relaxed">
                Run solar pump for 2 hours between 17:30 and 19:30. Avoid high midday evaporation window (11:00 to 14:00) to preserve fuel and water table.
              </p>
            </div>

            {irrigationPlan && (
              <div className="space-y-2 border-t border-[var(--border-subtle)] pt-2">
                <span className="font-semibold text-[var(--fg-muted)]">Block Pumping Allocation:</span>
                {(() => {
                  const deployment = irrigationPlan.deployments.find((d) => d.targetBlockId === currentBlockId);
                  return (
                    <>
                      <div className="flex items-center justify-between text-xs">
                        <span>Allocated Hours:</span>
                        <span className="font-mono font-bold">
                          {deployment ? `${deployment.estimatedCoverageHours} hrs/cycle` : "2.0 hrs/cycle"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>Sequence Priority:</span>
                        <span className="font-mono font-bold">
                          {deployment ? `Rank #${deployment.suggestedSequence}` : "Standard Rotation"}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={() => setIsIrrigationOpen(false)}>
              {t("common.close", "Understood")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
