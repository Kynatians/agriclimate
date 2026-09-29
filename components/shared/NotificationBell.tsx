"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import { AlertsSheet } from "./AlertsSheet";
import { Alert } from "@/lib/dal/types";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  alerts?: Alert[];
  className?: string;
}

export function NotificationBell({ alerts = [], className }: NotificationBellProps) {
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const unreadCount = alerts.filter((a) => a.severity === "high" || a.severity === "medium").length;

  return (
    <>
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--fg-secondary)] transition-all hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--fg-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] cursor-pointer",
          className
        )}
        aria-label={`Climate Alerts: ${unreadCount} active alerts`}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--status-danger)] px-1 text-[10px] font-bold text-white shadow-xs animate-in zoom-in-50">
            {unreadCount}
          </span>
        )}
      </button>

      <AlertsSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        alerts={alerts}
      />
    </>
  );
}
