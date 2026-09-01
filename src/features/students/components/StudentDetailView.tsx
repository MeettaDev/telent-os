"use client";

import { useState } from "react";
import Link from "next/link";

import { AppHeader } from "@/common/components/AppHeader";
import { AppSidebar } from "@/common/components/AppSidebar";
import { Text } from "@/components/ui/typography";
import { FilesActivityTab } from "@/features/students/components/FilesActivityTab";
import { JourneyProgress } from "@/features/students/components/JourneyProgress";
import { PlanConsultationTab } from "@/features/students/components/PlanConsultationTab";
import { ProcessTab } from "@/features/students/components/ProcessTab";
import { StudentDetailHeader } from "@/features/students/components/StudentDetailHeader";
import { StudentOverview } from "@/features/students/components/StudentOverview";
import type { StudentDetail } from "@/features/students/types/student";
import { useLocale } from "@/providers/locale-provider";

export function StudentDetailView({ student }: { student: StudentDetail }) {
  const { dictionary } = useLocale();
  const tabs = [
    "overview",
    "planConsultation",
    "process",
    "filesActivity",
  ] as const;
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("overview");

  return (
    <div className="flex min-h-dvh bg-[#f6f8f5] dark:bg-background">
      <AppSidebar />
      <div className="min-w-0 flex-1">
        <AppHeader />
        <main
          id="main-content"
          className="mx-auto max-w-full px-4 pb-12 pt-6 md:px-7 xl:px-8"
        >
          <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2">
            <Link
              className="text-sm text-muted-foreground hover:text-primary-hover"
              href="/students"
            >
              {dictionary.studentDetail.breadcrumb}
            </Link>
            <span className="text-muted-foreground">/</span>
            <Text className="font-medium">{student.name}</Text>
          </nav>
          <StudentDetailHeader dictionary={dictionary} student={student} />
          <JourneyProgress
            activeStage={student.stage}
            dictionary={dictionary}
          />
          <nav
            aria-label="Student sections"
            className="surface mt-5 flex gap-2 overflow-x-auto p-1.5"
            role="tablist"
          >
            {tabs.map((tab) => (
              <button
                aria-controls={`student-tab-${tab}`}
                aria-selected={activeTab === tab}
                className={`min-w-36 cursor-pointer rounded-lg px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${activeTab === tab ? "bg-primary-tint font-semibold text-primary-hover" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                id={`student-tab-trigger-${tab}`}
                key={tab}
                onClick={() => setActiveTab(tab)}
                role="tab"
                type="button"
              >
                {dictionary.studentDetail[tab]}
              </button>
            ))}
          </nav>
          <div
            aria-labelledby={`student-tab-trigger-${activeTab}`}
            id={`student-tab-${activeTab}`}
            role="tabpanel"
          >
            {activeTab === "overview" && (
              <StudentOverview dictionary={dictionary} student={student} />
            )}
            {activeTab === "planConsultation" && (
              <div className="mt-5">
                <PlanConsultationTab
                  dictionary={dictionary}
                  student={student}
                />
              </div>
            )}
            {activeTab === "process" && (
              <div className="mt-5">
                <ProcessTab dictionary={dictionary} student={student} />
              </div>
            )}
            {activeTab === "filesActivity" && (
              <div className="mt-5">
                <FilesActivityTab dictionary={dictionary} student={student} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
