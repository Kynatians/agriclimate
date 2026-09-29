"use client";

// lib/i18n/client.ts
// Client-side i18n hook and translation resolution helper

import { useUiStore } from "@/lib/stores/ui";
import enDict from "@/locales/en.json";
import bnDict from "@/locales/bn.json";

const dictionaries = {
  en: enDict,
  bn: bnDict,
};

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKey = NestedKeyOf<typeof enDict>;

function resolveKey(obj: any, path: string): string {
  const parts = path.split(".");
  let current = obj;
  for (const p of parts) {
    if (current && typeof current === "object" && p in current) {
      current = current[p];
    } else {
      return path; // Fallback to key itself
    }
  }
  return typeof current === "string" ? current : path;
}

export function useTranslation() {
  const locale = useUiStore((state) => state.locale);
  const setLocale = useUiStore((state) => state.setLocale);

  const t = (key: string, defaultText?: string): string => {
    const dict = dictionaries[locale] || dictionaries.en;
    const resolved = resolveKey(dict, key);
    if (resolved === key && defaultText) {
      return defaultText;
    }
    return resolved;
  };

  const getLocalized = (localizedText?: Record<string, string> | null, defaultText: string = ""): string => {
    if (!localizedText) return defaultText;
    return localizedText[locale] || localizedText.en || defaultText;
  };

  return { t, locale, setLocale, getLocalized };
}
