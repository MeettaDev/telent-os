"use client";
import { useRef, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkspacePageHeader } from "@/common/components/WorkspacePageHeader";
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
  const hydrated = useStudentsStore((state) => state.hydrated);
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<StudentFilter>("all");
  const [adding, setAdding] = useState(false);
  const addButton = useRef<HTMLButtonElement>(null);
  if (!hydrated) return <PageSkeleton />;
  return (
    <main id="main-content">
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
              <span className="sr-only">{t.search}</span>
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t.search}
                className="pl-10"
              />
            </label>
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={(event) => {
                addButton.current = event.currentTarget;
                setAdding(true);
              }}
            >
              <Plus aria-hidden="true" />
              {t.addStudent}
            </Button>
          </>
        }
        toolbar={
          <StudentsToolbar
            filter={filter}
            onFilterChange={setFilter}
            students={students}
          />
        }
      />
      <div className="px-4 pb-10 md:px-6 xl:px-8">
        <StudentsTable
          students={filterStudents(students, query, filter)}
          resetKey={filter + ":" + query.trim().toLowerCase()}
        />
      </div>
      {adding && (
        <AddStudentDialog
          onClose={() => setAdding(false)}
          returnFocus={() => addButton.current?.focus()}
        />
      )}
    </main>
  );
}
