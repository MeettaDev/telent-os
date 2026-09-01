"use client";

import { useMemo, useState } from "react";

import { AppSidebar } from "@/common/components/AppSidebar";
import { AppHeader } from "@/common/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import { JourneyStageSummary } from "@/features/students/components/JourneyStageSummary";
import { StudentsTable } from "@/features/students/components/StudentsTable";
import {
  StudentsToolbar,
  type StudentFilter,
} from "@/features/students/components/StudentsToolbar";
import { students } from "@/features/students/mocks/students-data";
import { useLocale } from "@/providers/locale-provider";

export function StudentJourneys({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const { dictionary, locale } = useLocale();
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<StudentFilter>("all");

  const visibleStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return students.filter((student) => {
      const matchesQuery =
        !normalizedQuery ||
        [student.name, student.plan, student.school, student.id].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        );
      const matchesFilter =
        filter === "all" ||
        (filter === "unclaimed"
          ? student.unclaimed
          : student.health === filter);

      return matchesQuery && matchesFilter;
    });
  }, [filter, query]);

  return (
    <div className="flex min-h-dvh bg-[#f6f8f5] dark:bg-background">
      <AppSidebar />
      <div className="min-w-0 flex-1">
        <AppHeader />
        <main
          id="main-content"
          className="mx-auto max-w-full px-4 pb-12 pt-7 md:px-7 md:pb-14 md:pt-9 xl:px-8"
        >
          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row">
            <div>
              <Text as="h1" variant="page-title">
                {dictionary.students.title}
              </Text>
              <Text className="mt-1" variant="description">
                {dictionary.students.description}
              </Text>
            </div>
            <Button className="h-12 min-w-44" variant="app-primary">
              {dictionary.students.addCase}
            </Button>
          </div>
          <div className="mt-7">
            <JourneyStageSummary dictionary={dictionary} />
          </div>
          <div className="mt-6">
            <StudentsToolbar
              dictionary={dictionary}
              filter={filter}
              initialQuery={initialQuery}
              onFilterChange={setFilter}
              onSearchChange={setQuery}
            />
          </div>
          <div className="mt-5">
            <StudentsTable
              dictionary={dictionary}
              locale={locale}
              students={visibleStudents}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
