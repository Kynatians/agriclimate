import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMetric(val: number, decimals: number = 1): string {
  if (Number.isNaN(val) || val === null || val === undefined) return "-";
  return val.toFixed(decimals);
}

export function formatAnomaly(val: number, unit: string = ""): string {
  if (Number.isNaN(val) || val === null || val === undefined) return "-";
  const prefix = val > 0 ? "+" : "";
  return `${prefix}${val.toFixed(1)}${unit}`;
}

export function formatDate(isoStr: string, locale: string = "en"): string {
  try {
    const d = new Date(isoStr);
    return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  } catch {
    return isoStr;
  }
}
