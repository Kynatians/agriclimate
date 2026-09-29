import * as React from "react";
import { Severity } from "@/lib/dal/types";
import { cn } from "@/lib/utils";

interface MetricBadgeProps {
  severity: Severity | "warning" | "optimal";
  children: React.ReactNode;
  className?: string;
}

export function MetricBadge({ severity, children, className }: MetricBadgeProps) {
  const styles = {
    high: "bg-[var(--status-danger-bg)] text-[var(--status-danger)] border-[var(--status-danger)]/30",
    medium: "bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning)]/30",
    low: "bg-[var(--status-success-bg)] text-[var(--status-success)] border-[var(--status-success)]/30",
    warning: "bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning)]/30",
    optimal: "bg-[var(--status-success-bg)] text-[var(--status-success)] border-[var(--status-success)]/30",
  }[severity];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider",
        styles,
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
