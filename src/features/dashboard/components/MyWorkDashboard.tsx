"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AppSidebar } from "@/common/components/AppSidebar";
import { WorkspacePageHeader } from "@/common/components/WorkspacePageHeader";
import { Button } from "@/components/ui/button";
import { WorkspaceSearchInput } from "@/common/components/WorkspaceSearchInput";
import { ActionQueue } from "@/features/dashboard/components/ActionQueue";
import { SummaryMetrics } from "@/features/dashboard/components/SummaryMetrics";
import { AddStudentDialog } from "@/features/students/components/AddStudentDialog";
import { useStudentsStore } from "@/features/students/stores/students-store";
import { useLocale } from "@/providers/locale-provider";
import styles from "@/common/components/workspace.module.css";

export function MyWorkDashboard() {
  const { dictionary } = useLocale();
  const router = useRouter();
  const t = dictionary.today;
  const [adding, setAdding] = useState(false);
  const addButton = useRef<HTMLButtonElement>(null);
  const hydrated = useStudentsStore((state) => state.hydrated);

  return (
    <div
      className={`${styles.palette} flex min-h-dvh bg-background text-foreground`}
    >
      <AppSidebar inset />
      <main id="main-content" className="min-w-0 flex-1">
        <WorkspacePageHeader
          title={
            <>
              <span className="sr-only">{t.title} · </span>
              <time
                dateTime="2026-10-01"
                className="text-[clamp(1.375rem,3vw,1.875rem)] tracking-normal whitespace-pre-wrap"
              >
                {t.date}
              </time>
            </>
          }
          actions={
            <div className="flex w-full flex-wrap items-center gap-3 sm:gap-4">
              <form
                action="/students"
                className="min-w-0 basis-full sm:w-70 sm:basis-auto"
              >
                <WorkspaceSearchInput
                  name="search"
                  enterKeyHint="search"
                  placeholder={t.searchPlaceholder}
                />
              </form>
              <Button
                ref={addButton}
                type="button"
                disabled={!hydrated}
                onClick={() => setAdding(true)}
                className="h-11 w-full rounded-full px-6 text-lg sm:w-auto"
              >
                <Plus aria-hidden="true" />
                {t.addStudent}
              </Button>
            </div>
          }
        />
        <div className="space-y-5 px-4 pb-10 md:px-6 xl:px-8">
          <SummaryMetrics dictionary={dictionary} />
          <ActionQueue dictionary={dictionary} />
        </div>
        {adding && (
          <AddStudentDialog
            onClose={() => setAdding(false)}
            onSaved={() => router.push("/students")}
            returnFocus={() => addButton.current?.focus()}
          />
        )}
      </main>
    </div>
  );
}
