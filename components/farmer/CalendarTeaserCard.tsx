import * as React from "react";
import { Calendar, ChevronRight, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

interface CalendarTeaserCardProps {
  onOpenCalendar?: () => void;
  onViewCalendar?: () => void;
  className?: string;
}

export function CalendarTeaserCard({ onOpenCalendar, onViewCalendar, className }: CalendarTeaserCardProps) {
  const { t } = useTranslation();
  const handleClick = onOpenCalendar || onViewCalendar;

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group flex items-center justify-between rounded-2xl border-2 border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-xs transition-all hover:border-[var(--primary)] cursor-pointer",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] group-hover:scale-105 transition-transform">
          <Calendar className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)]">
              {t("farmer.calendarTeaser", "Optimal Sowing Window")}
            </span>
            <span className="flex items-center gap-0.5 rounded bg-[var(--status-success-bg)] px-1.5 py-0.2 text-[10px] font-bold text-[var(--status-success)]">
              <CheckCircle2 className="h-3 w-3" />
              83% safe
            </span>
          </div>
          <p className="text-sm sm:text-base font-bold text-[var(--fg-primary)] mt-0.5">
            Sow Boro Rice: Oct 14–19 (Low Climate Risk)
          </p>
        </div>
      </div>

      <div className="flex items-center text-[var(--primary)] pl-2">
        <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}
