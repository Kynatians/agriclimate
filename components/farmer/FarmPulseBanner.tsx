"use client";

import * as React from "react";
import { CheckCircle2, ShieldCheck, Satellite, ArrowRight, Bell } from "lucide-react";
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
  blockName = "Your Block",
  onViewAlerts,
  onDismissAlert,
  onOpenTelemetry,
  className,
}: FarmPulseBannerProps) {
  const { t } = useTranslation();

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
        <div className="rounded-2xl border-2 border-[var(--status-success)]/30 bg-[var(--status-success-bg)]/20 p-4 sm:p-5 shadow-xs transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Status and Peace of Mind */}
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--status-success)] text-white shadow-xs">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base sm:text-lg font-bold text-[var(--fg-primary)]">
                    Field Status: Normal & Monitored
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--status-success)]/15 px-2.5 py-0.5 text-[10px] font-bold text-[var(--status-success)] uppercase font-mono">
                    <ShieldCheck className="h-3 w-3" />
                    DAE Active Watch
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--fg-secondary)] mt-0.5">
                  No emergency weather warnings issued for {blockName}. Satellite readings are within seasonal norms.
                </p>

                {metrics && (
                  <div className="flex flex-wrap items-center gap-2 mt-2 font-mono text-[11px] text-[var(--fg-muted)]">
                    <span className="rounded-md bg-[var(--bg-surface)] px-2 py-0.5 border border-[var(--border-subtle)]">
                      🌡️ Temp: <strong className="text-[var(--fg-primary)]">{metrics.lst.toFixed(0)}°C</strong>
                    </span>
                    <span className="rounded-md bg-[var(--bg-surface)] px-2 py-0.5 border border-[var(--border-subtle)]">
                      💧 Soil: <strong className="text-[var(--fg-primary)]">{metrics.soilMoistureSurface.value.toFixed(0)}%</strong>
                    </span>
                    <span className="rounded-md bg-[var(--bg-surface)] px-2 py-0.5 border border-[var(--border-subtle)]">
                      🌧️ Rain (7d): <strong className="text-[var(--fg-primary)]">{metrics.precip7dForecast.toFixed(0)} mm</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0 self-start md:self-auto pt-2 md:pt-0 border-t md:border-t-0 border-[var(--border-subtle)]/60">
              {officerAlertsCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onViewAlerts}
                  className="text-xs h-9 gap-1.5 cursor-pointer"
                >
                  <Bell className="h-3.5 w-3.5 text-[var(--status-warning)]" />
                  <span>Advisories ({officerAlertsCount})</span>
                </Button>
              )}

              <Button
                variant="default"
                size="sm"
                onClick={onOpenTelemetry}
                className="text-xs h-9 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-subtle)] text-[var(--fg-primary)] border border-[var(--border-subtle)] shadow-xs gap-1.5 cursor-pointer"
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
