"use client";

import { Bell, CircleHelp, Menu, Moon, Sun } from "lucide-react";

import { ParamSearchInput } from "@/common/components/ParamSearchInput";
import { useAppShellStore } from "@/common/stores/app-shell-store";
import { UserProfileMenu } from "@/common/components/UserProfileMenu";
import { useLocale } from "@/providers/locale-provider";
import { useTheme } from "@/providers/theme-provider";

export function AppHeader({
  variant = "counselor",
}: {
  variant?: "activity" | "admin" | "counselor" | "payments" | "reference";
}) {
  const { dictionary } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const toggleMobileSidebar = useAppShellStore(
    (state) => state.toggleMobileSidebar,
  );
  const searchPlaceholder =
    variant === "admin"
      ? dictionary.admin.searchPlaceholder
      : variant === "reference"
        ? dictionary.referenceRules.searchPlaceholder
        : variant === "activity"
          ? dictionary.activityLog.searchPlaceholder
          : variant === "payments"
            ? dictionary.payments.searchPlaceholder
            : dictionary.dashboard.searchPlaceholder;

  return (
    <header className="sticky top-0 z-20 flex h-[4.5rem] items-center gap-2.5 border-b border-border bg-card/95 px-4 backdrop-blur md:px-7 xl:px-8">
      <button
        aria-label={dictionary.sidebar.open}
        className="flex size-10 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted lg:hidden"
        onClick={toggleMobileSidebar}
        type="button"
      >
        <Menu className="size-4" />
      </button>
      <p className="mr-auto text-xl font-bold tracking-[-0.04em] text-primary lg:hidden">
        {dictionary.appName}
      </p>
      <ParamSearchInput
        className="hidden h-10 w-full max-w-[28rem] border border-transparent focus-within:border-primary/40 focus-within:bg-card focus-within:ring-3 md:flex"
        loadingLabel={dictionary.dashboard.searching}
        placeholder={searchPlaceholder}
      />
      <span className="ml-auto hidden rounded-full bg-primary-tint px-3 py-1 text-[11px] font-semibold uppercase text-primary-hover xl:inline">
        {variant === "admin"
          ? dictionary.admin.dataScope
          : variant === "reference"
            ? dictionary.referenceRules.headerScope
            : variant === "activity"
              ? dictionary.activityLog.headerScope
              : variant === "payments"
                ? dictionary.payments.headerScope
                : dictionary.dashboard.assignedScope}
      </span>
      <span className="hidden text-xs text-muted-foreground xl:inline">
        {variant === "admin"
          ? dictionary.admin.updated
          : dictionary.dashboard.updated}
      </span>
      <button
        aria-label={
          theme === "light"
            ? dictionary.dashboard.switchToDark
            : dictionary.dashboard.switchToLight
        }
        className="flex size-10 items-center justify-center rounded-full bg-[#f5f6f4] text-muted-foreground hover:bg-muted dark:bg-muted"
        onClick={toggleTheme}
        type="button"
      >
        {theme === "light" ? (
          <Moon className="size-4" />
        ) : (
          <Sun className="size-4" />
        )}
      </button>
      <button
        aria-label={dictionary.dashboard.help}
        className="flex size-10 items-center justify-center rounded-full bg-[#f5f6f4] text-muted-foreground hover:bg-muted dark:bg-muted"
        type="button"
      >
        <CircleHelp className="size-4" />
      </button>
      <button
        aria-label={dictionary.dashboard.notifications}
        className="group relative flex size-10 cursor-pointer items-center justify-center rounded-full border border-transparent bg-[#f5f6f4] text-muted-foreground transition-colors hover:border-primary/20 hover:bg-primary-tint hover:text-primary-hover focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25 dark:bg-muted"
        type="button"
      >
        <Bell className="size-[18px] transition-transform group-hover:-rotate-6 motion-reduce:transition-none" />
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none tabular-nums text-white ring-2 ring-card">
          {variant === "admin" ? 5 : 3}
        </span>
      </button>
      <UserProfileMenu />
    </header>
  );
}
