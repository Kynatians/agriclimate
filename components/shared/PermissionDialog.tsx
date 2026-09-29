"use client";

import * as React from "react";
import { ShieldAlert, UserCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { setSessionRole } from "@/lib/auth/mock-session";
import { useUiStore } from "@/lib/stores/ui";

interface PermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthorizedSwitch: () => void;
}

export function PermissionDialog({
  open,
  onOpenChange,
  onAuthorizedSwitch,
}: PermissionDialogProps) {
  const handleElevateRole = () => {
    setSessionRole("officer");
    onOpenChange(false);
    onAuthorizedSwitch();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--status-warning-bg)] text-[var(--status-warning)] mb-2">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center">Officer Role Required</DialogTitle>
          <DialogDescription className="text-center text-sm text-[var(--fg-muted)]">
            The Officer Control Panel is configured for registered Upazila and District Agricultural Extension Officers (DAE). Standard farmer accounts do not possess district-level dispatch permissions.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] p-3 text-xs text-[var(--fg-secondary)]">
          <p className="font-semibold text-[var(--fg-primary)] mb-1">Prototype Evaluation Seam:</p>
          <p>
            For demonstration purposes, you can switch your active session role from <span className="font-mono font-medium">farmer</span> to <span className="font-mono font-medium">officer</span> below to inspect the full three-column GIS cockpit.
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Stay in Farmer View
          </Button>
          <Button onClick={handleElevateRole} className="gap-2">
            <UserCheck className="h-4 w-4" />
            Switch as Officer (Demo)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
