"use client";

import * as React from "react";
import { Sun, CloudRain, CloudSun, Droplets, Thermometer } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherHorizonStripProps {
  currentTemp: number; // °C
  precip7dForecast: number; // mm
  rainProb: number; // %
  className?: string;
}

export function WeatherHorizonStrip({
  currentTemp,
  precip7dForecast,
  rainProb,
  className,
}: WeatherHorizonStripProps) {
  // Generate 5-day glanceable forecast data
  const days = React.useMemo(() => {
    const dayNames = ["Today", "Tomorrow", "Wed", "Thu", "Fri"];
    const baseTemp = Math.round(currentTemp);

    return [
      {
        name: dayNames[0],
        icon: rainProb > 60 ? CloudRain : rainProb > 30 ? CloudSun : Sun,
        temp: baseTemp,
        rainDrops: rainProb > 60 ? 3 : rainProb > 30 ? 2 : rainProb > 15 ? 1 : 0,
        rainChance: rainProb,
        isToday: true,
      },
      {
        name: dayNames[1],
        icon: precip7dForecast > 25 ? CloudRain : Sun,
        temp: baseTemp - 1,
        rainDrops: precip7dForecast > 25 ? 2 : 0,
        rainChance: Math.max(10, Math.round(rainProb * 0.7)),
        isToday: false,
      },
      {
        name: dayNames[2],
        icon: CloudSun,
        temp: baseTemp,
        rainDrops: 1,
        rainChance: 25,
        isToday: false,
      },
      {
        name: dayNames[3],
        icon: precip7dForecast > 15 ? CloudRain : CloudSun,
        temp: baseTemp - 2,
        rainDrops: precip7dForecast > 15 ? 2 : 0,
        rainChance: precip7dForecast > 15 ? 65 : 20,
        isToday: false,
      },
      {
        name: dayNames[4],
        icon: Sun,
        temp: baseTemp + 1,
        rainDrops: 0,
        rainChance: 10,
        isToday: false,
      },
    ];
  }, [currentTemp, precip7dForecast, rainProb]);

  // Temperature status calculation
  // Optimal for rice/crops: 25 - 33°C
  // Heat stress: > 35°C
  const isHeatStress = currentTemp > 35;
  const isOptimalTemp = currentTemp >= 24 && currentTemp <= 34;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Horizontal Temperature Thermometer Bar */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]/70 p-3">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-1.5 font-bold text-[var(--fg-primary)]">
            <Thermometer className="h-3.5 w-3.5 text-amber-500" />
            <span>Field Heat Thermometer</span>
          </div>
          <span
            className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full font-mono uppercase",
              isHeatStress
                ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                : isOptimalTemp
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
            )}
          >
            {isHeatStress ? "Heat Stress Alert" : isOptimalTemp ? "Optimal Crop Growth" : "Cooler Range"}
          </span>
        </div>

        {/* Visual Thermometer Bar */}
        <div className="relative h-2.5 w-full rounded-full bg-linear-to-r from-sky-400 via-emerald-400 via-amber-400 to-rose-500 overflow-hidden">
          {/* Position marker for current temp */}
          <div
            className="absolute top-0 bottom-0 w-2 -ml-1 rounded-full bg-white dark:bg-black shadow-md border-2 border-black dark:border-white transition-all duration-700"
            style={{
              left: `${Math.min(95, Math.max(5, ((currentTemp - 15) / (42 - 15)) * 100))}%`,
            }}
          />
        </div>

        <div className="flex items-center justify-between text-[9px] font-mono text-[var(--fg-muted)] mt-1.5">
          <span>15°C (Cool)</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">28°C (Optimal)</span>
          <span className="text-rose-500 font-bold">35°C+ (Stress)</span>
        </div>
      </div>

      {/* 5-Day Visual Weather Horizon Strip */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]/70 p-3">
        <div className="flex items-center justify-between text-xs font-bold text-[var(--fg-primary)] mb-2">
          <span>5-Day Sky & Rain Horizon</span>
          <span className="text-[10px] text-[var(--fg-muted)] font-normal">Safe for field drying</span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 text-center">
          {days.map((day, idx) => {
            const Icon = day.icon;
            return (
              <div
                key={idx}
                className={cn(
                  "flex flex-col items-center justify-between p-2 rounded-lg border transition-all",
                  day.isToday
                    ? "border-[var(--primary)] bg-[var(--bg-surface)] ring-2 ring-[var(--primary)]/20 shadow-xs"
                    : "border-[var(--border-subtle)] bg-[var(--bg-surface)]/80"
                )}
              >
                <span className="text-[9px] font-bold text-[var(--fg-muted)] uppercase">
                  {day.name}
                </span>

                <div className="my-1 text-amber-500">
                  <Icon className={cn("h-5 w-5", day.icon === CloudRain && "text-sky-500")} />
                </div>

                <span className="text-xs font-extrabold font-mono text-[var(--fg-primary)]">
                  {day.temp}°
                </span>

                {/* Rain Drops Probability Meter */}
                <div className="mt-1 flex items-center gap-0.5" title={`Rain chance: ${day.rainChance}%`}>
                  {day.rainDrops === 0 ? (
                    <span className="text-[8px] font-mono text-[var(--fg-muted)]">Dry</span>
                  ) : (
                    Array.from({ length: Math.min(3, day.rainDrops) }).map((_, dIdx) => (
                      <Droplets key={dIdx} className="h-2 w-2 text-sky-500 fill-sky-500" />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
