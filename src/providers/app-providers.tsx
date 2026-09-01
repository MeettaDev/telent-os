"use client";

import { Toaster } from "sonner";

import { FlashToastListener } from "@/common/components/FlashToastListener";
import { QueryProvider } from "@/providers/query-provider";
import { LocaleProvider } from "@/providers/locale-provider";
import { ThemeProvider } from "@/providers/theme-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <LocaleProvider>
          {children}
          <FlashToastListener />
          <Toaster
            closeButton
            position="top-center"
            richColors
            toastOptions={{
              classNames: {
                closeButton: "!left-auto !right-[-8px] !top-[-8px]",
              },
            }}
          />
        </LocaleProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
