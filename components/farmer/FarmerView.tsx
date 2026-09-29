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
import { TopCropsPreviewCard } from "./TopCropsPreviewCard";
import { RegionalRadarPreview } from "./RegionalRadarPreview";
import { CropRecommendationModal } from "./CropRecommendationModal";
import { FarmerBlockMap } from "./FarmerBlockMap";
import { CropCalendarView } from "./CropCalendarView";
import { AlertsListView } from "./AlertsListView";
import { VoiceFab } from "./VoiceFab";
import {
  Sparkles,
  MapPin,
  Droplets,
  Home,
  Map as MapIcon,
  Calendar,
  AlertTriangle,
  Sun,
  CloudRain,
  Sprout,
  Activity,
  CheckCircle2,
  Clock,
  Zap,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const { t } = useTranslation();
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

  const rainProb = currentMetrics ? Math.min(95, Math.max(10, Math.round(currentMetrics.precip7dForecast * 1.5))) : 50;

  return (
    <div className="min-h-screen w-full bg-[var(--bg-app)] pb-24 md:pb-12 text-[var(--fg-primary)]">
      {/* Top Sticky Full-Width Farm Context & Navigation Bar */}
      <header className="sticky top-14 z-20 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 px-4 sm:px-6 lg:px-8 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Left: Active Farm Block Selector */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                  {t("farmer.myFarmBlock", "Active Field Block")}
                </span>
                <span className="rounded-full bg-[var(--primary-subtle)] px-2 py-0.2 text-[9px] font-bold text-[var(--primary)] uppercase font-mono">
                  {currentBlock?.subDistrict || "Kurigram"}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <select
                  value={currentBlockId}
                  onChange={(e) => setSelectedBlockId(e.target.value)}
                  className="font-bold text-base sm:text-lg bg-transparent border-none text-[var(--fg-primary)] focus:outline-hidden cursor-pointer p-0"
                  aria-label="Select farm block"
                >
                  {blocks.map((blk) => (
                    <option key={blk.id} value={blk.id} className="text-black bg-white dark:text-white dark:bg-zinc-900">
                      {blk.name} ({blk.subDistrict})
                    </option>
                  ))}
                </select>
                <span className="hidden sm:inline-block text-xs text-[var(--fg-muted)]">
                  • {currentBlock?.farmerCount} Farmers • {currentBlock?.primaryCrop || "Rice"}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Desktop Navigation Tabs (>= md) */}
          <nav
            aria-label="Desktop Tab Navigation"
            className="hidden md:flex items-center gap-1 rounded-xl bg-[var(--bg-surface-subtle)] p-1 border border-[var(--border-subtle)]"
          >
            <button
              type="button"
              onClick={() => setActiveTab("home")}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer",
                activeTab === "home"
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-surface)]"
              )}
            >
              <Home className="h-4 w-4" />
              <span>{t("nav.home", "Overview")}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("map")}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer",
                activeTab === "map"
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-surface)]"
              )}
            >
              <MapIcon className="h-4 w-4" />
              <span>{t("nav.map", "Field Radar & Map")}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("calendar")}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer",
                activeTab === "calendar"
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-surface)]"
              )}
            >
              <Calendar className="h-4 w-4" />
              <span>{t("nav.calendar", "Crop Calendar")}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("alerts")}
              className={cn(
                "relative flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer",
                activeTab === "alerts"
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-surface)]"
              )}
            >
              <AlertTriangle className="h-4 w-4" />
              <span>{t("nav.alerts", "Risk Advisories")}</span>
              {blockAlerts.length > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--status-danger)] px-1 text-[9px] font-bold text-white">
                  {blockAlerts.length}
                </span>
              )}
            </button>
          </nav>

          {/* Right: Quick Action Triggers */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsIrrigationOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--fg-primary)] hover:bg-[var(--bg-surface)] hover:border-[var(--primary)]/50 transition-all cursor-pointer"
            >
              <Droplets className="h-3.5 w-3.5 text-[var(--status-info)]" />
              <span className="hidden sm:inline">{t("farmer.irrigationSchedule", "Irrigation Advisory")}</span>
              <span className="sm:hidden">Pumping</span>
            </button>

            <button
              type="button"
              onClick={() => setIsRecoOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[var(--primary-hover)] active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t("farmer.whatToPlant", "What to plant?")}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area - Full Width Responsive Container */}
      <main className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === "home" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Quick Telemetry Ribbon: 5 key metrics across the full screen */}
            {currentMetrics && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {/* 1. Air & Surface Temp */}
                <div className="rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-[var(--fg-muted)]">
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Surface Temp</span>
                    <Sun className="h-4 w-4 text-[var(--status-warning)]" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--fg-primary)]">
                      {currentMetrics.lst.toFixed(0)}°C
                    </span>
                    <span className="text-xs font-mono text-[var(--status-success)]">Optimal</span>
                  </div>
                  <span className="text-[11px] text-[var(--fg-muted)] block mt-0.5 truncate">
                    NASA POWER Satellite
                  </span>
                </div>

                {/* 2. 7-Day Rainfall Forecast */}
                <div className="rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-[var(--fg-muted)]">
                    <span className="font-semibold uppercase tracking-wider text-[10px]">7-Day Rain</span>
                    <CloudRain className="h-4 w-4 text-[var(--status-info)]" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--fg-primary)]">
                      {currentMetrics.precip7dForecast.toFixed(0)} mm
                    </span>
                    <span className="text-xs font-mono text-[var(--fg-secondary)] font-bold">{rainProb}% rain</span>
                  </div>
                  <span className="text-[11px] text-[var(--fg-muted)] block mt-0.5 truncate">
                    GPM / IMERG Reanalysis
                  </span>
                </div>

                {/* 3. Soil Moisture */}
                <div className="rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-[var(--fg-muted)]">
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Soil Moisture</span>
                    <Droplets className="h-4 w-4 text-[var(--status-success)]" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--fg-primary)]">
                      {currentMetrics.soilMoistureSurface.value.toFixed(0)}%
                    </span>
                    <span className="text-xs font-mono text-[var(--fg-muted)]">VWC</span>
                  </div>
                  <span className="text-[11px] text-[var(--status-success)] font-medium block mt-0.5 truncate">
                    Root Zone: {currentMetrics.soilMoistureRootZone.value.toFixed(0)}% Adequate
                  </span>
                </div>

                {/* 4. Plant Water Stress (CWSI) */}
                <div className="rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-[var(--fg-muted)]">
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Water Stress</span>
                    <Activity className="h-4 w-4 text-[var(--primary)]" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--fg-primary)]">
                      {currentMetrics.cwsi.toFixed(2)}
                    </span>
                    <span className="text-xs font-mono text-[var(--fg-muted)]">/ 1.0</span>
                  </div>
                  <span className={cn(
                    "text-[11px] font-medium block mt-0.5 truncate",
                    currentMetrics.cwsi > 0.6 ? "text-[var(--status-danger)]" : "text-[var(--status-success)]"
                  )}>
                    {currentMetrics.cwsi > 0.6 ? "Evening Pumping Req." : "Hydration Optimal"}
                  </span>
                </div>

                {/* 5. Crop Vigor (NDVI) */}
                <div className="rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-xs col-span-2 sm:col-span-1">
                  <div className="flex items-center justify-between text-xs text-[var(--fg-muted)]">
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Canopy Vigor</span>
                    <Sprout className="h-4 w-4 text-[var(--status-success)]" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--fg-primary)]">
                      {currentMetrics.ndvi.value.toFixed(2)}
                    </span>
                    <span className="text-xs font-mono text-[var(--status-success)] font-bold">
                      +{currentMetrics.ndvi.anomaly}
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--primary)] font-medium block mt-0.5 truncate uppercase">
                    Trend: {currentMetrics.ndvi.trend}
                  </span>
                </div>
              </div>
            )}

            {/* Main Multi-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left / Primary Column (7 or 8 cols): Detailed Telemetry & Regional Radar */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-6">
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

                {/* Crop Condition & Multi-Spectral Telemetry Card */}
                {currentMetrics && (
                  <CropConditionCard
                    metrics={currentMetrics}
                    block={currentBlock}
                  />
                )}

                {/* Regional Radar & Quick Block Switcher */}
                <RegionalRadarPreview
                  blocks={blocks}
                  metricsMap={metricsMap}
                  activeBlockId={currentBlockId}
                  onSelectBlock={(id) => setSelectedBlockId(id)}
                  onOpenMapTab={() => setActiveTab("map")}
                />
              </div>

              {/* Right / Advisory Column (5 or 4 cols): Actionable Guidance & Agronomic Recommendations */}
              <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                {/* Action Tiles (Solar Irrigation & Soil Nutrition) */}
                {currentMetrics && (
                  <HomeActionTiles
                    metrics={currentMetrics}
                    onOpenIrrigation={() => setIsIrrigationOpen(true)}
                  />
                )}

                {/* Top Crop Recommendations Preview Card */}
                {currentRecos.length > 0 && (
                  <TopCropsPreviewCard
                    recommendations={currentRecos}
                    onOpenModal={() => setIsRecoOpen(true)}
                  />
                )}

                {/* Calendar Window Teaser */}
                <CalendarTeaserCard
                  onViewCalendar={() => setActiveTab("calendar")}
                />

                {/* Solar Pumping Protocol Card */}
                <div className="rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-xs">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)]">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--fg-primary)] leading-tight">
                        Solar Pump Operating Window
                      </h4>
                      <span className="text-[11px] text-[var(--fg-muted)]">
                        NASA Root-Zone Deficit Optimization
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-[var(--fg-secondary)]">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-surface-subtle)]">
                      <span className="font-medium">Recommended Time:</span>
                      <span className="font-mono font-bold text-[var(--status-info)]">17:30 – 19:30 (Evening)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-surface-subtle)]">
                      <span className="font-medium">Avoid Evaporative Window:</span>
                      <span className="font-mono font-bold text-[var(--status-danger)]">11:00 – 14:00 (Peak Heat)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-surface-subtle)]">
                      <span className="font-medium">Estimated Fuel Savings:</span>
                      <span className="font-mono font-bold text-[var(--status-success)]">3.2 Liters Diesel / cycle</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "map" && (
          <div className="animate-in fade-in duration-200">
            <FarmerBlockMap
              blocks={blocks}
              metricsMap={metricsMap}
              userBlockId={currentBlockId}
              onSelectUserBlock={(id) => setSelectedBlockId(id)}
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

      {/* Floating Voice Action Button (VoiceFab) */}
      <VoiceFab />

      {/* Persistent Bottom Tab Navigation (Mobile < md only) */}
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
