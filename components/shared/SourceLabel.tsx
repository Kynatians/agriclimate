import * as React from "react";
import { DataSourceRef } from "@/lib/dal/types";
import { cn } from "@/lib/utils";

interface SourceLabelProps {
  source?: DataSourceRef | string | null;
  className?: string;
}

export function SourceLabel({ source, className }: SourceLabelProps) {
  if (!source) return null;

  if (typeof source === "string") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 font-mono text-[10px] tracking-tight text-[var(--fg-muted)]",
          className
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] shrink-0" />
        <span className="font-semibold text-[var(--fg-secondary)]">{source}</span>
      </span>
    );
  }

  // Format timestamp concisely e.g. 08:42 UTC
  let timeStr = "";
  try {
    const d = new Date(source.lastUpdate);
    timeStr = `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")} UTC`;
  } catch {
    timeStr = source.lastUpdate;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono text-[10px] tracking-tight text-[var(--fg-muted)]",
        className
      )}
      title={`Data Provenance: ${source.dataset} (${source.resolution}) updated at ${source.lastUpdate}`}
    >
      <span className="font-medium text-[var(--fg-secondary)]">{source.dataset}</span>
      <span>·</span>
      <span>{source.resolution}</span>
      <span>·</span>
      <span>{timeStr}</span>
    </span>
  );
}
