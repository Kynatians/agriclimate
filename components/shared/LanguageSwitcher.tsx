"use client";

import * as React from "react";
import { Globe } from "lucide-react";
import { useTranslation } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useTranslation();

  return (
    <div className={cn("flex items-center gap-1 bg-[var(--bg-surface-subtle)] p-0.5 rounded-lg border border-[var(--border-subtle)] text-xs font-medium", className)}>
      <div className="flex items-center px-1.5 text-[var(--fg-muted)]">
        <Globe className="h-3.5 w-3.5" />
      </div>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn(
          "px-2 py-1 rounded-md transition-all cursor-pointer",
          locale === "en"
            ? "bg-[var(--bg-surface)] text-[var(--fg-primary)] font-semibold shadow-xs"
            : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
        )}
        aria-label="Switch language to English"
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale("bn")}
        className={cn(
          "px-2 py-1 rounded-md transition-all cursor-pointer",
          locale === "bn"
            ? "bg-[var(--bg-surface)] text-[var(--fg-primary)] font-semibold shadow-xs"
            : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
        )}
        aria-label="Switch language to Bengali"
      >
        বাং
      </button>
    </div>
  );
}
