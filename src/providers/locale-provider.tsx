"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

import {
  dictionaries,
  isLocale,
  type Dictionary,
  type Locale,
} from "@/common/i18n/dictionaries";

const STORAGE_KEY = "meetta-talent-os-locale";
const LOCALE_EVENT = "meetta-locale-change";

type LocaleContextValue = {
  dictionary: Dictionary;
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(
    subscribeToLocale,
    getStoredLocale,
    getServerLocale,
  );

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      dictionary: dictionaries[locale],
      setLocale(nextLocale) {
        window.localStorage.setItem(STORAGE_KEY, nextLocale);
        window.dispatchEvent(new Event(LOCALE_EVENT));
      },
    }),
    [locale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

function getStoredLocale(): Locale {
  const savedLocale = window.localStorage.getItem(STORAGE_KEY);
  return isLocale(savedLocale) ? savedLocale : "en";
}

function getServerLocale(): Locale {
  return "en";
}

function subscribeToLocale(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(LOCALE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(LOCALE_EVENT, onStoreChange);
  };
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used within LocaleProvider");
  return context;
}
