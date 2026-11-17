"use client";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/providers/locale-provider";
import { students as fixtures } from "@/features/students/mocks/students-data";
import type { StudentFilter } from "@/features/students/lib/student-workflow";
import type { Student } from "@/features/students/types/student";
import { cn } from "@/lib/utils";

const counts = { all: 24, meetta: 7, student: 12, office: 5, noOne: 1 };
export function StudentsToolbar({
  filter,
  onFilterChange,
  students,
}: {
  filter: StudentFilter;
  onFilterChange: (filter: StudentFilter) => void;
  students: Student[];
}) {
  const { dictionary } = useLocale();
  const t = dictionary.studentWorkspace;
  return (
    <nav aria-label={t.title} className="flex flex-wrap gap-2">
      {(Object.keys(counts) as StudentFilter[]).map((key) => {
        const count =
          counts[key] +
          (key === "all"
            ? students.length - fixtures.length
            : students.filter((s) => s.turn === key).length -
              fixtures.filter((s) => s.turn === key).length);
        return (
          <Button
            key={key}
            type="button"
            variant="outline"
            aria-pressed={key === filter}
            onClick={() => onFilterChange(key)}
            className={cn(
              "h-9 rounded-full px-4 text-sm",
              key === filter
                ? "border-foreground bg-foreground text-background hover:bg-foreground/90"
                : "text-foreground/80",
            )}
          >
            {t.filters[key]} <span className="tabular-nums">{count}</span>
          </Button>
        );
      })}
    </nav>
  );
}
