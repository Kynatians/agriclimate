"use client";

import * as React from "react";
import { Sparkles, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CropRecoCard } from "./CropRecoCard";
import { CropRecommendation } from "@/lib/dal/types";
import { useTranslation } from "@/lib/i18n/client";

interface CropRecommendationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recommendations: CropRecommendation[];
  blockName?: string;
}

export function CropRecommendationModal({
  open,
  onOpenChange,
  recommendations,
  blockName,
}: CropRecommendationModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                {t("farmer.whatToPlant", "What to plant next?")}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Deterministic Crop Suitability Scores for {blockName || "your land"} based on soil moisture and satellite telemetry
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {recommendations.length === 0 ? (
            <div className="py-8 text-center text-sm text-[var(--fg-muted)]">
              Loading agronomic crop recommendations...
            </div>
          ) : (
            recommendations.map((reco, idx) => (
              <CropRecoCard
                key={reco.crop.id}
                reco={reco}
                defaultCollapsed={idx !== 0} // Expand top ranked crop by default
              />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
