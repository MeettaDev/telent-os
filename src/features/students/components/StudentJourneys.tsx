"use client";
import { useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspacePageHeader } from "@/common/components/WorkspacePageHeader";
import { WorkspaceSearchInput } from "@/common/components/WorkspaceSearchInput";
import { PageSkeleton } from "@/common/components/PageSkeleton";
import { StudentsTable } from "@/features/students/components/StudentsTable";
import { StudentsToolbar } from "@/features/students/components/StudentsToolbar";
import { AddStudentDialog } from "@/features/students/components/AddStudentDialog";
import {
  filterStudents,
  type StudentFilter,
} from "@/features/students/lib/student-workflow";
import { useStudentsStore } from "@/features/students/stores/students-store";
import { useLocale } from "@/providers/locale-provider";

export function StudentJourneys({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const { dictionary } = useLocale();
  const t = dictionary.studentWorkspace;
  const students = useStudentsStore((state) => state.students);
  const history = useStudentsStore((state) => state.history);
  const hydrated = useStudentsStore((state) => state.hydrated);
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<StudentFilter>("all");
  const [adding, setAdding] = useState(false);
  const addButton = useRef<HTMLButtonElement>(null);
  const visible = useMemo(
    () => filterStudents(students, query, filter, history),
    [students, query, filter, history],
  );
  if (!hydrated) return <PageSkeleton />;
  return (
    <main id="main-content" className="flex h-dvh min-h-min flex-col">
      <WorkspacePageHeader
        title={
          <span className="text-[clamp(1.375rem,3vw,1.875rem)] tracking-normal">
            {t.title}
          </span>
        }
        actions={
          <div className="flex w-full flex-wrap items-center gap-3 sm:gap-4">
            <div className="min-w-0 basis-full sm:w-70 sm:basis-auto">
              <WorkspaceSearchInput
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t.search}
              />
            </div>
            <Button
              type="button"
              ref={addButton}
              className="h-11 w-full rounded-full px-6 text-lg sm:w-auto"
              onClick={() => setAdding(true)}
            >
              <Plus aria-hidden="true" />
              {t.addStudent}
            </Button>
          </div>
        }
        toolbar={
          <StudentsToolbar
            filter={filter}
            onFilterChange={setFilter}
            students={students}
          />
        }
      />
      <div className="flex min-h-48 flex-1 flex-col px-4 pb-4 md:px-6 xl:px-8">
        <StudentsTable
          students={visible}
          resetKey={
            filter + ":" + query.trim().toLowerCase() + ":" + students.length
          }
        />
      </div>
      {adding && (
        <AddStudentDialog
          onClose={() => setAdding(false)}
          onSaved={() => {
            setQuery("");
            setFilter("all");
          }}
          returnFocus={() => addButton.current?.focus()}
        />
      )}
    </main>
  );
}
