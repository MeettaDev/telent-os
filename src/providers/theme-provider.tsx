"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

const STORAGE_KEY = "meetta-talent-os-theme";
const THEME_EVENT = "meetta-theme-change";

export type Theme = "light" | "dark";
type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getStoredTheme,
    getServerTheme,
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme(nextTheme) {
        window.localStorage.setItem(STORAGE_KEY, nextTheme);
        window.dispatchEvent(new Event(THEME_EVENT));
      },
      toggleTheme() {
        const nextTheme = theme === "light" ? "dark" : "light";
        window.localStorage.setItem(STORAGE_KEY, nextTheme);
        window.dispatchEvent(new Event(THEME_EVENT));
      },
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

function getStoredTheme(): Theme {
  const savedTheme = window.localStorage.getItem(STORAGE_KEY);
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getServerTheme(): Theme {
  return "light";
}

function subscribeToTheme(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(THEME_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(THEME_EVENT, onStoreChange);
  };
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
