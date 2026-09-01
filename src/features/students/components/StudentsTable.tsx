"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

import type { Dictionary, Locale } from "@/common/i18n/dictionaries";
import { Pagination } from "@/common/components/Pagination";
import { Text } from "@/components/ui/typography";
import type { Student, StudentHealth } from "@/features/students/types/student";

const healthStyles: Record<StudentHealth, string> = {
  atRisk: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  needsAttention:
    "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  onTrack:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
};

export function StudentsTable({
  dictionary,
  locale,
  students,
}: {
  dictionary: Dictionary;
  locale: Locale;
  students: Student[];
}) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const totalStudents = 42;
  const totalPages = Math.ceil(totalStudents / pageSize);
  const firstStudent = (currentPage - 1) * pageSize + 1;
  const lastStudent = Math.min(currentPage * pageSize, totalStudents);

  return (
    <section className="surface overflow-hidden">
      <div className="overflow-x-auto px-3 sm:px-5">
        <table className="w-full min-w-[70rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-border text-[11px] font-semibold uppercase text-[#626a63]">
              <th className="w-[18%] px-2 py-5">
                {dictionary.students.student}
              </th>
              <th className="w-[19%] px-2 py-5">
                {dictionary.students.publishedPlan}
              </th>
              <th className="w-[15%] px-2 py-5">
                {dictionary.students.stageSupport}
              </th>
              <th className="w-[20%] px-2 py-5">
                {dictionary.students.currentAction}
              </th>
              <th className="w-[11%] px-2 py-5">
                {dictionary.students.actorOwner}
              </th>
              <th className="w-[9%] px-2 py-5">
                {dictionary.students.deadline}
              </th>
              <th className="px-2 py-5">{dictionary.students.health}</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr
                aria-label={`${dictionary.students.student}: ${student.name}`}
                className={`group cursor-pointer border-b border-border outline-none last:border-0 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${index === 0 ? "bg-primary-tint/70" : "hover:bg-muted/50"}`}
                key={student.id}
                onClick={() => router.push(`/students/${student.id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ")
                    router.push(`/students/${student.id}`);
                }}
                role="link"
                tabIndex={0}
              >
                <td className="relative px-2 py-4">
                  {index === 0 && (
                    <span className="absolute inset-y-2 -left-0 w-1 rounded-full bg-primary" />
                  )}
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-tint text-xs font-semibold text-primary-hover">
                      {student.initials}
                    </span>
                    <div>
                      <Text className="font-semibold">{student.name}</Text>
                      <Text variant="caption" className="mt-0.5">
                        {student.id}
                      </Text>
                    </div>
                  </div>
                </td>
                <td className="px-2 py-4">
                  <Text className="font-semibold text-primary-hover">
                    {student.plan}
                  </Text>
                  <Text variant="caption" className="mt-1">
                    {student.school}
                  </Text>
                </td>
                <td className="px-2 py-4">
                  <span className="inline-flex rounded-full bg-primary-tint px-3 py-1 text-xs font-semibold text-primary-hover">
                    {
                      dictionary.students[
                        student.stage as keyof typeof dictionary.students
                      ]
                    }
                  </span>
                  <Text variant="caption" className="mt-2">
                    {dictionary.students[student.support]}
                  </Text>
                </td>
                <td className="px-2 py-4">
                  <Text className="font-semibold">{student.action}</Text>
                </td>
                <td className="px-2 py-4">
                  <Text>{student.actor}</Text>
                  <Text
                    variant="caption"
                    className={`mt-1 ${student.unclaimed ? "font-semibold text-destructive" : ""}`}
                  >
                    {student.unclaimed
                      ? dictionary.students.notClaimed
                      : (student.owner ?? dictionary.students.ownerNA)}
                  </Text>
                </td>
                <td className="px-2 py-4">
                  <Text
                    className={
                      student.deadline <= getCurrentIsoDate()
                        ? "font-semibold text-destructive"
                        : "font-semibold"
                    }
                  >
                    {formatDeadline(dictionary, locale, student.deadline)}
                  </Text>
                </td>
                <td className="px-2 py-4">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${healthStyles[student.health]}`}
                    >
                      {dictionary.students[student.health]}
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {students.length === 0 ? (
        <Text className="px-6 py-14 text-center" variant="description">
          {dictionary.students.noResults}
        </Text>
      ) : (
        <footer className="flex flex-col gap-4 border-t border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <Text className="text-sm font-medium" variant="caption">
            {dictionary.students.showing
              .replace("{start}", String(firstStudent))
              .replace("{end}", String(lastStudent))
              .replace("{total}", "42")}
          </Text>
          <Pagination
            currentPage={currentPage}
            nextLabel={dictionary.students.nextPage}
            onPageChange={setCurrentPage}
            paginationLabel={dictionary.students.pagination}
            previousLabel={dictionary.students.previousPage}
            totalPages={totalPages}
          />
        </footer>
      )}
    </section>
  );
}

function formatDeadline(
  dictionary: Dictionary,
  locale: Locale,
  deadline: Student["deadline"],
) {
  if (deadline === getCurrentIsoDate()) return dictionary.students.today;
  return new Intl.DateTimeFormat(locale === "my" ? "my-MM" : "en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${deadline}T00:00:00Z`));
}

function getCurrentIsoDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
