import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantClasses = {
    default:
      "border-transparent bg-[var(--primary)] text-[var(--primary-fg)] shadow-sm",
    secondary:
      "border-transparent bg-[var(--bg-surface-subtle)] text-[var(--fg-secondary)]",
    destructive:
      "border-transparent bg-[var(--status-danger-bg)] text-[var(--status-danger)] font-semibold border border-[var(--status-danger)]/30",
    success:
      "border-transparent bg-[var(--status-success-bg)] text-[var(--status-success)] font-semibold border border-[var(--status-success)]/30",
    warning:
      "border-transparent bg-[var(--status-warning-bg)] text-[var(--status-warning)] font-semibold border border-[var(--status-warning)]/30",
    outline: "text-[var(--fg-primary)] border-[var(--border-strong)]",
  }[variant];

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2",
        variantClasses,
        className
      )}
      {...props}
    />
  );
}

export { Badge };
