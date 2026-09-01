import en from "@/common/i18n/dictionaries/en.json";
import my from "@/common/i18n/dictionaries/my.json";

export const dictionaries = { en, my } as const;

export type Locale = keyof typeof dictionaries;
export type Dictionary = (typeof dictionaries)[Locale];

export function isLocale(value: string | null): value is Locale {
  return value === "en" || value === "my";
}
