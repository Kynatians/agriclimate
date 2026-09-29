"use client";

import * as React from "react";
import { Home, Map, Calendar, AlertTriangle } from "lucide-react";
import { useTranslation } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

export type FarmerTab = "home" | "map" | "calendar" | "alerts";

interface BottomNavProps {
  activeTab: FarmerTab;
  onTabChange: (tab: FarmerTab) => void;
  alertCount?: number;
  className?: string;
}

export function BottomNav({
  activeTab,
  onTabChange,
  alertCount = 0,
  className,
}: BottomNavProps) {
  const { t } = useTranslation();

  const tabs: { id: FarmerTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: "home",
      label: t("nav.home", "Home"),
      icon: <Home className="h-5 w-5" />,
    },
    {
      id: "map",
      label: t("nav.map", "Map"),
      icon: <Map className="h-5 w-5" />,
    },
    {
      id: "calendar",
      label: t("nav.calendar", "Calendar"),
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      id: "alerts",
      label: t("nav.alerts", "Alerts"),
      icon: <AlertTriangle className="h-5 w-5" />,
      badge: alertCount,
    },
  ];

  return (
    <nav
      aria-label="Farmer Navigation Bar"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-30 flex h-16 w-full items-center justify-around border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2 shadow-lg backdrop-blur-md md:hidden",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center py-1 transition-all min-h-[48px] cursor-pointer",
              isActive
                ? "text-[var(--primary)] font-bold"
                : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
            )}
            aria-selected={isActive}
            role="tab"
          >
            <div className="relative">
              {tab.icon}
              {tab.badge && tab.badge > 0 ? (
                <span className="absolute -top-1 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--status-danger)] px-1 text-[9px] font-bold text-white shadow-xs">
                  {tab.badge}
                </span>
              ) : null}
            </div>
            <span className="text-[11px] font-medium tracking-tight mt-0.5">
              {tab.label}
            </span>
            {isActive && (
              <span className="absolute bottom-0 h-0.5 w-8 rounded-full bg-[var(--primary)]" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
