"use client";

import { AppHeader } from "@/common/components/AppHeader";
import { AppSidebar } from "@/common/components/AppSidebar";
import { useMockUser } from "@/common/auth/mock-auth";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import { ActionQueue } from "@/features/dashboard/components/ActionQueue";
import { CaseHealthPanel } from "@/features/dashboard/components/CaseHealthPanel";
import { ConsultationsPanel } from "@/features/dashboard/components/ConsultationsPanel";
import { QuickActionsPanel } from "@/features/dashboard/components/QuickActionsPanel";
import { SummaryMetrics } from "@/features/dashboard/components/SummaryMetrics";
import { useLocale } from "@/providers/locale-provider";

export function MyWorkDashboard() {
  const user = useMockUser();
  const { dictionary } = useLocale();

  return (
    <div className="flex min-h-dvh bg-[#f6f8f5] dark:bg-background">
      <AppSidebar />
      <div className="min-w-0 flex-1">
        <AppHeader />
        <main
          id="main-content"
          className="mx-auto max-w-full px-4 pb-12 pt-7 md:px-7 md:pb-14 md:pt-9 xl:px-8"
        >
          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-start">
            <div>
              <Text as="h1" variant="page-title">
                {dictionary.dashboard.title.replace(
                  "{username}",
                  user.username,
                )}
              </Text>
              <Text variant="description" className="mt-1">
                {dictionary.dashboard.description}
              </Text>
            </div>
            <Button variant="outline" className="min-w-52 text-primary-hover">
              {dictionary.dashboard.createCase}
            </Button>
          </div>
          <div className="mt-8">
            <SummaryMetrics dictionary={dictionary} />
          </div>
          <div className="mt-8 grid items-start gap-5 xl:grid-cols-[minmax(0,2.15fr)_minmax(19rem,1fr)]">
            <ActionQueue dictionary={dictionary} />
            <aside className="grid gap-5">
              <ConsultationsPanel dictionary={dictionary} />
              <CaseHealthPanel dictionary={dictionary} />
              <QuickActionsPanel dictionary={dictionary} />
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
