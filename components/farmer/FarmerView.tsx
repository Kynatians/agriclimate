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
import { FarmPulseBanner } from "./FarmPulseBanner";
import { DailyDecisionsGrid } from "./DailyDecisionsGrid";
import { PlanningAheadSection } from "./PlanningAheadSection";
import { RegionalRadarSummary } from "./RegionalRadarSummary";
import { TelemetryDetailModal } from "./TelemetryDetailModal";
import { WeatherDetailModal } from "./WeatherDetailModal";
import { CropCareDetailModal } from "./CropCareDetailModal";
import { IrrigationDetailModal } from "./IrrigationDetailModal";
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
  const {
    selectedBlockId,
    setSelectedBlockId,
    farmerTab: activeTab,
    setFarmerTab: setActiveTab,
    addDispatchedAlert,
    dismissedAlertIds,
    dismissAlert,
  } = useUiStore();
  const [isRecoOpen, setIsRecoOpen] = React.useState(false);
  const [isIrrigationOpen, setIsIrrigationOpen] = React.useState(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = React.useState(false);
  const [isWeatherOpen, setIsWeatherOpen] = React.useState(false);
  const [isCropCareOpen, setIsCropCareOpen] = React.useState(false);

  // Active block
  const currentBlockId = selectedBlockId || (blocks[0] ? blocks[0].id : "blk_kurigram_01");
  const currentBlock = blocks.find((b) => b.id === currentBlockId) || blocks[0];
  const currentMetrics = metricsMap[currentBlockId] || Object.values(metricsMap)[0];
  const currentRecos = recommendationsMap[currentBlockId] || [];

  // Dispatched alerts from the Officer Panel (Zustand store)
  const dispatchedFromStore = useUiStore((state) => state.dispatchedAlerts);

  // Sync dispatched alerts from server API on mount
  React.useEffect(() => {
    fetch("/api/alerts/dispatch")
      .then((res) => res.json())
      .then((data: Alert[]) => {
        if (Array.isArray(data)) {
          data.forEach((alert) => {
            if (alert.isOfficerDispatched) {
              addDispatchedAlert(alert);
            }
          });
        }
      })
      .catch(() => {});
  }, [addDispatchedAlert]);

  // In Farmer View, ONLY alerts dispatched by the Officer Panel are shown
  const officerAlerts = React.useMemo(() => {
    const map = new Map<string, Alert>();

    // 1. Initial alerts from server marked as dispatched by the officer
    alerts.forEach((a) => {
      if (a.isOfficerDispatched === true) {
        map.set(a.id, a);
      }
    });

    // 2. Dispatched alerts from the officer panel
    dispatchedFromStore.forEach((a) => {
      if (a.isOfficerDispatched === true) {
        map.set(a.id, a);
      }
    });

    return Array.from(map.values());
  }, [alerts, dispatchedFromStore]);

  // Active block alerts: ONLY officer-dispatched alerts targeted to this block or district-wide 'all'
  // excluding alerts dismissed by the user
  const blockAlerts = officerAlerts.filter(
    (a) =>
      !dismissedAlertIds.includes(a.id) &&
      (a.blockId === currentBlockId || a.blockId === "all")
  );
  const topAlert = blockAlerts[0] || null;

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
            {/* 1. Farm Pulse & Official Alert Banner (High-Level Summary) */}
            <FarmPulseBanner
              metrics={currentMetrics}
              activeAlert={topAlert}
              officerAlertsCount={officerAlerts.filter((a) => !dismissedAlertIds.includes(a.id)).length}
              blockName={currentBlock?.name}
              onViewAlerts={() => setActiveTab("alerts")}
              onDismissAlert={(id) => dismissAlert(id)}
              onOpenTelemetry={() => setIsTelemetryOpen(true)}
            />

            {/* 2. Today's 3 Key Farming Decisions (Water, Weather, Crop Care) */}
            {currentMetrics && (
              <DailyDecisionsGrid
                metrics={currentMetrics}
                block={currentBlock}
                onOpenIrrigation={() => setIsIrrigationOpen(true)}
                onOpenWeather={() => setIsWeatherOpen(true)}
                onOpenCropCare={() => setIsCropCareOpen(true)}
              />
            )}

            {/* 3. Planning Ahead & Next Season Companion */}
            <PlanningAheadSection
              recommendations={currentRecos}
              onOpenCalendar={() => setActiveTab("calendar")}
              onOpenRecommendations={() => setIsRecoOpen(true)}
            />

            {/* 4. Regional Field Radar & Quick Block Switcher */}
            <RegionalRadarSummary
              blocks={blocks}
              metricsMap={metricsMap}
              activeBlockId={currentBlockId}
              onSelectBlock={(id) => setSelectedBlockId(id)}
              onOpenMapTab={() => setActiveTab("map")}
            />
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
            <AlertsListView alerts={officerAlerts} />
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

      {/* Precision Irrigation & Solar Pumping Detail Dialog */}
      <IrrigationDetailModal
        open={isIrrigationOpen}
        onOpenChange={setIsIrrigationOpen}
        metrics={currentMetrics}
        currentBlockId={currentBlockId}
        irrigationPlan={irrigationPlan}
        onJumpToMap={() => setActiveTab("map")}
      />

      {/* NASA Satellite Telemetry Detail Dialog */}
      {currentMetrics && (
        <TelemetryDetailModal
          open={isTelemetryOpen}
          onOpenChange={setIsTelemetryOpen}
          metrics={currentMetrics}
          blockName={currentBlock?.name}
        />
      )}

      {/* 7-Day Weather & Atmospheric Forecast Dialog */}
      {currentMetrics && (
        <WeatherDetailModal
          open={isWeatherOpen}
          onOpenChange={setIsWeatherOpen}
          metrics={currentMetrics}
          blockName={currentBlock?.name}
        />
      )}

      {/* Crop Health & Multi-Spectral Telemetry Dialog */}
      {currentMetrics && (
        <CropCareDetailModal
          open={isCropCareOpen}
          onOpenChange={setIsCropCareOpen}
          metrics={currentMetrics}
          block={currentBlock}
        />
      )}
    </div>
  );
}
