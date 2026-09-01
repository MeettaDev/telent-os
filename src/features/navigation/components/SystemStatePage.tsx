"use client";

import { CircleAlert, FileQuestion, RotateCcw } from "lucide-react";
import Link from "next/link";

import { AppHeader } from "@/common/components/AppHeader";
import { AppSidebar } from "@/common/components/AppSidebar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";

type SystemStatePageProps = {
  kind: "error" | "notFound";
  onRetry?: () => void;
};

export function SystemStatePage({ kind, onRetry }: SystemStatePageProps) {
  const { dictionary } = useLocale();
  const content = dictionary.systemStates[kind];
  const isError = kind === "error";
  const Icon = isError ? CircleAlert : FileQuestion;

  return (
    <div className="flex min-h-dvh bg-background">
      <AppSidebar />
      <div className="min-w-0 flex-1">
        <AppHeader />
        <main
          id="main-content"
          className="grid min-h-[calc(100dvh-4.5rem)] place-items-center px-4 py-12 md:px-8"
        >
          <section
            className="surface w-full max-w-xl overflow-hidden text-center"
            aria-labelledby="system-state-title"
          >
            <div className="h-1.5 bg-primary" />
            <div className="px-6 py-10 sm:px-10 sm:py-12">
              <div
                className={cn(
                  "mx-auto grid size-16 place-items-center rounded-2xl",
                  isError
                    ? "bg-red-50 text-destructive dark:bg-red-950/30"
                    : "bg-primary-tint text-primary-hover",
                )}
              >
                <Icon className="size-7" aria-hidden="true" strokeWidth={1.8} />
              </div>
              <Text
                className="mt-6 font-semibold uppercase tracking-[0.12em] text-primary-hover"
                variant="caption"
              >
                {content.eyebrow}
              </Text>
              <Text
                as="h1"
                className="mt-2"
                id="system-state-title"
                variant="page-title"
              >
                {content.title}
              </Text>
              <Text className="mx-auto mt-3 max-w-md" variant="description">
                {content.description}
              </Text>
              <div className="mt-8 flex flex-col-reverse justify-center gap-3 sm:flex-row">
                <Link
                  className={buttonVariants({
                    variant: isError ? "outline" : "app-primary",
                  })}
                  href="/"
                >
                  {dictionary.systemStates.backToDashboard}
                </Link>
                {onRetry && (
                  <Button onClick={onRetry} type="button" variant="app-primary">
                    <RotateCcw aria-hidden="true" />
                    {dictionary.systemStates.tryAgain}
                  </Button>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
