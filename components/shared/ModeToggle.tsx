"use client";

import * as React from "react";
import { User, Shield } from "lucide-react";
import { useUiStore, AppMode } from "@/lib/stores/ui";
import { getSession } from "@/lib/auth/mock-session";
import { PermissionDialog } from "./PermissionDialog";
import { useTranslation } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

export function ModeToggle({ className }: { className?: string }) {
  const mode = useUiStore((state) => state.mode);
  const setMode = useUiStore((state) => state.setMode);
  const [permissionOpen, setPermissionOpen] = React.useState(false);
  const { t } = useTranslation();

  const handleModeSelect = (targetMode: AppMode) => {
    if (targetMode === "officer") {
      const session = getSession();
      if (session.role === "farmer") {
        setPermissionOpen(true);
        return;
      }
    }
    setMode(targetMode);
  };

  return (
    <>
      <div
        role="group"
        aria-label="Application Mode Switcher"
        className={cn(
          "inline-flex h-9 items-center rounded-lg bg-[var(--bg-surface-subtle)] p-0.5 border border-[var(--border-subtle)] shadow-xs",
          className
        )}
      >
        <button
          type="button"
          onClick={() => handleModeSelect("farmer")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all cursor-pointer",
            mode === "farmer"
              ? "bg-[var(--bg-surface)] text-[var(--primary)] shadow-xs ring-1 ring-[var(--border-subtle)]"
              : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
          )}
          aria-pressed={mode === "farmer"}
        >
          <User className="h-3.5 w-3.5" />
          <span>{t("app.farmerMode", "Farmer")}</span>
        </button>

        <button
          type="button"
          onClick={() => handleModeSelect("officer")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all cursor-pointer",
            mode === "officer"
              ? "bg-[var(--bg-surface)] text-[var(--primary)] shadow-xs ring-1 ring-[var(--border-subtle)]"
              : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
          )}
          aria-pressed={mode === "officer"}
        >
          <Shield className="h-3.5 w-3.5" />
          <span>{t("app.officerMode", "Officer")}</span>
        </button>
      </div>

      <PermissionDialog
        open={permissionOpen}
        onOpenChange={setPermissionOpen}
        onAuthorizedSwitch={() => setMode("officer")}
      />
    </>
  );
}
