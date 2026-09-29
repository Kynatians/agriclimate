"use client";

import * as React from "react";
import { Mic, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

export function VoiceFab({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false);
  const { t } = useTranslation();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-fg)] shadow-lg transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--primary)]/30 cursor-pointer",
          className
        )}
        aria-label="Voice Query & Audio Advisory"
        title="Tap to speak (Feature Preview)"
      >
        <Mic className="h-6 w-6" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-subtle)] text-[var(--primary)] mb-2">
              <Sparkles className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center">
              {t("farmer.voiceTitle", "Voice Advisory Interface")}
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-[var(--fg-secondary)] leading-relaxed">
              {t(
                "farmer.voiceDesc",
                "Voice recognition in Bengali and regional dialects, NLP intent parsing, and audio text-to-speech are planned for the production mobile deployment."
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-3 text-xs text-[var(--fg-secondary)] space-y-2">
            <span className="font-semibold text-[var(--fg-primary)] block">Planned Voice Commands:</span>
            <ul className="list-disc pl-4 space-y-1 font-mono text-[11px]">
              <li>"আমার মাঠের মাটির অবস্থা কী?" (Reads soil moisture status)</li>
              <li>"কবে বৃষ্টি হতে পারে?" (Reads 7-day precipitation forecast)</li>
              <li>"কোন সার দেওয়া দরকার?" (Reads nutrient advisory)</li>
              <li>"বন্যার কোনো সতর্কতা আছে?" (Reads active hazard warnings)</li>
            </ul>
          </div>

          <DialogFooter>
            <Button className="w-full" onClick={() => setOpen(false)}>
              {t("common.close", "Got it")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
