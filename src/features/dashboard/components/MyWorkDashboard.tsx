"use client";

import { Plus, Search } from "lucide-react";
import { AppSidebar } from "@/common/components/AppSidebar";
import { WorkspacePageHeader } from "@/common/components/WorkspacePageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActionQueue } from "@/features/dashboard/components/ActionQueue";
import { AppActivityPanel } from "@/features/dashboard/components/AppActivityPanel";
import { SummaryMetrics } from "@/features/dashboard/components/SummaryMetrics";
import { WaitingPanel } from "@/features/dashboard/components/WaitingPanel";
import { useLocale } from "@/providers/locale-provider";

export function MyWorkDashboard() {
  const { dictionary } = useLocale();
  const t = dictionary.today;

  return (
    <div className="flex min-h-dvh bg-background">
      <AppSidebar />
      <main id="main-content" className="min-w-0 flex-1">
        <WorkspacePageHeader
          title={t.title}
          description={t.description}
          actions={
            <>
              <label className="relative min-w-0 basis-full sm:w-80 sm:flex-1 sm:basis-auto">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-3 size-4 text-muted-foreground"
                />
                <span className="sr-only">{t.searchPlaceholder}</span>
                <Input
                  type="search"
                  placeholder={t.searchPlaceholder}
                  className="pl-10"
                />
              </label>
              <Button type="button" className="w-full sm:w-auto">
                <Plus aria-hidden="true" />
                {t.addStudent}
              </Button>
            </>
          }
        />
        <div className="space-y-5 px-4 pb-10 md:px-6 xl:px-8">
          <SummaryMetrics dictionary={dictionary} />
          <ActionQueue dictionary={dictionary} />
          <div className="grid items-start gap-4 xl:grid-cols-2">
            <WaitingPanel dictionary={dictionary} />
            <AppActivityPanel dictionary={dictionary} />
          </div>
        </div>
      </main>
    </div>
  );
}
