"use client";

import * as React from "react";
import { Alert } from "@/lib/dal/types";
import { DisasterZone } from "@/lib/map/disasters";
import { Waves, Flame, AlertTriangle, X, Send, Eye, ShieldAlert, Users, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricBadge } from "@/components/shared/MetricBadge";
import { cn } from "@/lib/utils";

interface TacticalOverlayCardProps {
  alert?: Alert | null;
  disaster?: DisasterZone | null;
  onClose: () => void;
  onOpenComposer?: (alert: Alert) => void;
  onSelectBlock?: (blockId: string) => void;
  locale?: "en" | "bn";
  className?: string;
}

export function TacticalOverlayCard({
  alert,
  disaster,
  onClose,
  onOpenComposer,
  onSelectBlock,
  locale = "en",
  className,
}: TacticalOverlayCardProps) {
  if (!alert && !disaster) return null;

  if (alert) {
    const isHigh = alert.severity === "high";
    const headline = alert.headline[locale] || alert.headline.en;
    const detail = alert.detail[locale] || alert.detail.en;

    return (
      <div
        className={cn(
          "absolute left-4 bottom-20 z-40 max-w-sm rounded-2xl border-2 bg-[var(--bg-surface)]/95 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200",
          isHigh
            ? "border-rose-500/80 shadow-rose-950/20"
            : "border-amber-500/80 shadow-amber-950/20",
          className
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--border-subtle)] pb-2.5 mb-2.5">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white font-bold shadow-md",
                isHigh ? "bg-rose-600 animate-pulse" : "bg-amber-600"
              )}
            >
              {alert.type === "flood" && <Waves className="h-4 w-4" />}
              {alert.type === "drought" && <Flame className="h-4 w-4" />}
              {alert.type === "waterlogging" && <Waves className="h-4 w-4" />}
              {!["flood", "drought", "waterlogging"].includes(alert.type) && (
                <ShieldAlert className="h-4 w-4" />
              )}
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                  Active Alert Beacon
                </span>
                <span className="rounded-md bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-mono font-bold text-rose-600 dark:text-rose-400">
                  {alert.leadTimeHours}h Lead Time
                </span>
              </div>
              <h4 className="text-sm font-bold text-[var(--fg-primary)] leading-tight mt-0.5">
                {headline}
              </h4>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--fg-muted)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--fg-primary)] transition-colors cursor-pointer"
            aria-label="Close tactical alert card"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-[var(--fg-secondary)] leading-relaxed mb-3 line-clamp-3">
          {detail}
        </p>

        <div className="flex items-center gap-2 pt-1 border-t border-[var(--border-subtle)]/70">
          {onOpenComposer && (
            <Button
              size="sm"
              onClick={() => onOpenComposer(alert)}
              className="flex-1 text-xs font-bold gap-1.5 bg-rose-600 hover:bg-rose-700 text-white"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Compose Warning</span>
            </Button>
          )}

          {onSelectBlock && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSelectBlock(alert.blockId)}
              className="text-xs font-semibold gap-1"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Inspect</span>
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (disaster) {
    const isFlood = disaster.type === "flood";
    const headline = disaster.headline[locale] || disaster.headline.en;
    const detail = disaster.detail[locale] || disaster.detail.en;

    return (
      <div
        className={cn(
          "absolute left-4 bottom-20 z-40 max-w-sm rounded-2xl border-2 bg-[var(--bg-surface)]/95 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200",
          isFlood
            ? "border-cyan-500/80 shadow-cyan-950/20"
            : "border-amber-500/80 shadow-amber-950/20",
          className
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--border-subtle)] pb-2.5 mb-2.5">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white font-bold shadow-md",
                isFlood ? "bg-cyan-600" : "bg-amber-600"
              )}
            >
              {isFlood ? <Waves className="h-4 w-4" /> : <Flame className="h-4 w-4" />}
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                  Disaster Hazard Corridor
                </span>
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase",
                    disaster.severity === "high"
                      ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                      : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                  )}
                >
                  {disaster.severity} Risk
                </span>
              </div>
              <h4 className="text-sm font-bold text-[var(--fg-primary)] leading-tight mt-0.5">
                {disaster.name}
              </h4>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--fg-muted)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--fg-primary)] transition-colors cursor-pointer"
            aria-label="Close disaster briefing card"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Hazard Metrics Strip */}
        <div className="grid grid-cols-3 gap-2 text-center bg-[var(--bg-surface-subtle)]/70 rounded-xl p-2 mb-2.5 border border-[var(--border-subtle)]/60 text-xs">
          <div>
            <div className="text-[9px] text-[var(--fg-muted)] font-mono uppercase">Area</div>
            <div className="font-mono font-bold text-[var(--fg-primary)]">
              {(disaster.areaHectares / 1000).toFixed(1)}k ha
            </div>
          </div>
          <div>
            <div className="text-[9px] text-[var(--fg-muted)] font-mono uppercase">Farmers</div>
            <div className="font-mono font-bold text-[var(--fg-primary)]">
              {disaster.estFarmersAffected.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[9px] text-[var(--fg-muted)] font-mono uppercase">Index</div>
            <div className="font-mono font-bold text-amber-600 dark:text-amber-400 truncate">
              {disaster.keyMetricValue}
            </div>
          </div>
        </div>

        <p className="text-xs text-[var(--fg-secondary)] leading-relaxed mb-3">
          {detail}
        </p>

        <div className="flex items-center justify-between text-[11px] text-[var(--fg-muted)] pt-2 border-t border-[var(--border-subtle)]/70 font-mono">
          <span>Affected Blocks: {disaster.affectedBlocks.length}</span>
          <span className="text-[var(--primary)] font-bold">NASA GPM/SMAP AgriClimate</span>
        </div>
      </div>
    );
  }

  return null;
}
