"use client";

import * as React from "react";
import Link from "next/link";
import { Sprout, Sun, Moon } from "lucide-react";
import { ModeToggle } from "./ModeToggle";
import { NotificationBell } from "./NotificationBell";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useUiStore } from "@/lib/stores/ui";
import { getSession } from "@/lib/auth/mock-session";
import { Alert } from "@/lib/dal/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/client";

interface TopBarProps {
  alerts?: Alert[];
  className?: string;
}

export function TopBar({ alerts = [], className }: TopBarProps) {
  const { t } = useTranslation();
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const session = getSession();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 sm:px-6 shadow-xs backdrop-blur-md",
        className
      )}
    >
      {/* Brand & Platform Identity */}
      <Link
        href="/"
        className="group flex items-center gap-3 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-lg"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)] text-[var(--primary-fg)] shadow-xs transition-transform group-hover:scale-105">
          <Sprout className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold tracking-tight text-[var(--fg-primary)]">
              {t("app.title", "AgriClimate")}
            </span>
            <span className="hidden sm:inline-block rounded bg-[var(--primary-subtle)] px-1.5 py-0.2 text-[10px] font-semibold text-[var(--primary)] uppercase font-mono">
              NASA Remote Sensing
            </span>
          </div>
          <span className="hidden md:inline-block text-[11px] text-[var(--fg-muted)] leading-none">
            Kurigram Climate Resilience Pilot
          </span>
        </div>
      </Link>

      {/* Center: Mode Switcher */}
      <div className="flex items-center">
        <ModeToggle />
      </div>

      {/* Right: Controls & Profile */}
      <div className="flex items-center gap-2">
        <LanguageSwitcher />

        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--fg-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--fg-primary)] transition-all cursor-pointer"
          aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
        >
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>

        <NotificationBell alerts={alerts} />

        <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-[var(--border-subtle)]">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary-subtle)] text-[var(--primary)] text-xs font-bold font-mono">
            {session.name.charAt(0)}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-medium text-[var(--fg-primary)] truncate max-w-[120px]">
              {session.name}
            </span>
            <span className="text-[10px] text-[var(--fg-muted)] uppercase tracking-wider font-mono">
              {session.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
