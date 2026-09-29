"use client";

import * as React from "react";
import { WifiOff } from "lucide-react";
import { useTranslation } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

interface OfflineBannerProps {
  lastSync?: string;
  className?: string;
}

export function OfflineBanner({ lastSync = "Today, 06:00 UTC", className }: OfflineBannerProps) {
  const [isOffline, setIsOffline] = React.useState(false);
  const { t } = useTranslation();

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== "undefined") {
      setIsOffline(!window.navigator.onLine);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      }
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center justify-center gap-2 bg-[var(--status-warning-bg)] px-4 py-2 text-xs font-medium text-[var(--status-warning)] border-b border-[var(--status-warning)]/30 transition-all",
        className
      )}
    >
      <WifiOff className="h-4 w-4 shrink-0 text-current" />
      <span>{t("app.offlineNotice", "Offline Mode: viewing cached satellite intelligence")}</span>
      <span className="opacity-80">({t("app.lastSync", "Last synced")}: {lastSync})</span>
    </div>
  );
}
