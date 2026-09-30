"use client";

import * as React from "react";
import {
  CheckCircle2,
  ShieldCheck,
  Satellite,
  ArrowRight,
  Bell,
  Volume2,
  VolumeX,
  Droplets,
  Sun,
  CloudRain,
  Sparkles,
} from "lucide-react";
import { BlockMetrics, Alert } from "@/lib/dal/types";
import { AlertCard } from "./AlertCard";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

interface FarmPulseBannerProps {
  metrics?: BlockMetrics;
  activeAlert?: Alert | null;
  officerAlertsCount: number;
  blockName?: string;
  onViewAlerts: () => void;
  onDismissAlert?: (alertId: string) => void;
  onOpenTelemetry: () => void;
  className?: string;
}

export function FarmPulseBanner({
  metrics,
  activeAlert,
  officerAlertsCount,
  blockName = "Chilmari South",
  onViewAlerts,
  onDismissAlert,
  onOpenTelemetry,
  className,
}: FarmPulseBannerProps) {
  const { t, locale } = useTranslation();
  const [isPlayingAudio, setIsPlayingAudio] = React.useState(false);

  // Audio Speech Synthesis for Farmers
  const handlePlayVoice = () => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported on this browser.");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const isBn = locale === "bn";
    const textToSpeak = isBn
      ? `কৃষি আবহাওয়া পরামর্শ। ${blockName} ব্লকের অবস্থা স্বাভাবিক। মাটির আর্দ্রতা ${
          metrics ? metrics.soilMoistureSurface.value.toFixed(0) : "২৫"
        } শতাংশ। তাপমাত্রা ${metrics ? metrics.lst.toFixed(0) : "৩৩"} ডিগ্রি সেলসিয়াস। আজ বিকেলে সৌর পাম্প দিয়ে সেচ দেওয়ার পরামর্শ দেওয়া হলো।`
      : `AgriClimate field advisory for ${blockName}. Field condition is monitored and stable. Soil moisture is at ${
          metrics ? metrics.soilMoistureSurface.value.toFixed(0) : "25"
        } percent. Surface temperature is ${
          metrics ? metrics.lst.toFixed(0) : "33"
        } degrees Celsius. Solar pumping is recommended between 5:30 and 7:30 PM.`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = isBn ? "bn-BD" : "en-US";
    utterance.rate = 0.95;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {activeAlert ? (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCard
            alert={activeAlert}
            onView={onViewAlerts}
            onDismiss={onDismissAlert}
          />
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-[var(--bg-surface)] to-emerald-500/5 p-4 sm:p-6 shadow-xs transition-all">
          {/* Subtle agricultural background watermarks */}
          <div className="pointer-events-none absolute -right-6 -bottom-6 opacity-5 dark:opacity-10 text-emerald-600">
            <Sparkles className="h-44 w-44" />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-1">
            {/* Left: Living Status Emblem & Narrative */}
            <div className="flex items-start gap-4">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md ring-4 ring-emerald-500/20">
                <CheckCircle2 className="h-8 w-8" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-extrabold text-[var(--fg-primary)] tracking-tight">
                    Field Status: Normal & Healthy
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase font-mono border border-emerald-500/30">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    DAE Kurigram Active Watch
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[var(--fg-secondary)] mt-1 max-w-2xl leading-relaxed">
                  No emergency flood or weather warnings for <strong>{blockName}</strong>. 
                  Soil root-zone is stable. Solar power generation conditions are optimal today.
                </p>

                {/* Glanceable 3-Instrument Mini Strip */}
                {metrics && (
                  <div className="flex flex-wrap items-center gap-2.5 mt-3">
                    {/* 1. Soil Hydration Mini Instrument */}
                    <div className="flex items-center gap-1.5 rounded-xl bg-[var(--bg-surface)] px-3 py-1.5 border border-[var(--border-subtle)] shadow-xs">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400">
                        <Droplets className="h-3.5 w-3.5" />
                      </div>
                      <div className="text-[11px] leading-tight font-mono">
                        <span className="text-[var(--fg-muted)] block text-[9px]">Soil Hydration</span>
                        <strong className="text-[var(--fg-primary)]">
                          {metrics.soilMoistureSurface.value.toFixed(0)}% VWC
                        </strong>
                      </div>
                    </div>

                    {/* 2. Temperature Mini Instrument */}
                    <div className="flex items-center gap-1.5 rounded-xl bg-[var(--bg-surface)] px-3 py-1.5 border border-[var(--border-subtle)] shadow-xs">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500">
                        <Sun className="h-3.5 w-3.5" />
                      </div>
                      <div className="text-[11px] leading-tight font-mono">
                        <span className="text-[var(--fg-muted)] block text-[9px]">Field Temp</span>
                        <strong className="text-[var(--fg-primary)]">
                          {metrics.lst.toFixed(0)}°C
                        </strong>
                      </div>
                    </div>

                    {/* 3. Rain Forecast Mini Instrument */}
                    <div className="flex items-center gap-1.5 rounded-xl bg-[var(--bg-surface)] px-3 py-1.5 border border-[var(--border-subtle)] shadow-xs">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        <CloudRain className="h-3.5 w-3.5" />
                      </div>
                      <div className="text-[11px] leading-tight font-mono">
                        <span className="text-[var(--fg-muted)] block text-[9px]">7-Day Rain</span>
                        <strong className="text-[var(--fg-primary)]">
                          {metrics.precip7dForecast.toFixed(0)} mm
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Audio Narration & NASA Satellite Telemetry Actions */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[var(--border-subtle)]">
              {/* One-Tap Voice Narration Button for Farmers */}
              <button
                type="button"
                onClick={handlePlayVoice}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer",
                  isPlayingAudio
                    ? "bg-rose-500 text-white animate-pulse"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 hover:scale-102"
                )}
              >
                {isPlayingAudio ? (
                  <>
                    <VolumeX className="h-4 w-4" />
                    <span>থামান (Stop Audio)</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4" />
                    <span>🔊 শুনুন (Listen to Today)</span>
                  </>
                )}
              </button>

              {officerAlertsCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onViewAlerts}
                  className="text-xs h-9 gap-1.5 cursor-pointer rounded-xl border-[var(--border-subtle)] bg-[var(--bg-surface)]"
                >
                  <Bell className="h-3.5 w-3.5 text-amber-500" />
                  <span>Advisories ({officerAlertsCount})</span>
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={onOpenTelemetry}
                className="text-xs h-9 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-subtle)] text-[var(--fg-primary)] border border-[var(--border-subtle)] shadow-xs gap-1.5 cursor-pointer rounded-xl"
              >
                <Satellite className="h-3.5 w-3.5 text-[var(--primary)]" />
                <span className="hidden sm:inline">NASA Satellite</span>
                <span>Telemetry (5)</span>
                <ArrowRight className="h-3 w-3 text-[var(--fg-muted)]" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

