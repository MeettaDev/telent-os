"use client";

import { Menu } from "lucide-react";

import { AppSidebar } from "@/common/components/AppSidebar";
import type { Dictionary } from "@/common/i18n/dictionaries";
import { useAppShellStore } from "@/common/stores/app-shell-store";
import { Text } from "@/components/ui/typography";
import { useLocale } from "@/providers/locale-provider";

type SidebarTitleKey = keyof Dictionary["sidebar"];

export function PlaceholderPage({ titleKey }: { titleKey: SidebarTitleKey }) {
  const { dictionary } = useLocale();
  const toggleMobileSidebar = useAppShellStore(
    (state) => state.toggleMobileSidebar,
  );

  return (
    <div className="flex min-h-dvh bg-[#f6f8f5] dark:bg-background">
      <AppSidebar />
      <main
        id="main-content"
        className="min-w-0 flex-1 px-4 py-7 md:px-7 md:py-9 xl:px-8"
      >
        <div className="mx-auto max-w-[1480px]">
          <div className="flex items-center gap-3">
            <button
              aria-label={dictionary.sidebar.open}
              className="flex size-10 cursor-pointer items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 lg:hidden"
              onClick={toggleMobileSidebar}
              type="button"
            >
              <Menu className="size-4" />
            </button>
            <Text as="h1" variant="page-title">
              {dictionary.sidebar[titleKey]}
            </Text>
          </div>
        </div>
      </main>
    </div>
  );
}
