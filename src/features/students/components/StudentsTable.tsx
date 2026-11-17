"use client";
import Link from "next/link";
import { Pagination, usePagination } from "@/common/components/Pagination";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  ActorBadge,
  OwnerAvatar,
} from "@/features/students/components/StudentStatus";
import { dateLabel } from "@/features/students/lib/student-workflow";
import type { Student } from "@/features/students/types/student";
import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";

export function StudentsTable({
  students,
  resetKey,
}: {
  students: Student[];
  resetKey: string;
}) {
  const { dictionary, locale } = useLocale();
  const t = dictionary.studentWorkspace;
  const { pageRows, pagination } = usePagination(students, resetKey);
  return (
    <Card>
      <CardContent className="p-4 lg:p-6">
        <Table aria-label={t.title} className="min-w-5xl" compact>
          <TableHeader>
            <TableRow>
              {(
                [
                  "student",
                  "school",
                  "journey",
                  "now",
                  "turn",
                  "nextCheck",
                  "owner",
                ] as const
              ).map((key) => (
                <TableHead key={key}>{t.columns[key]}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="w-52">
                  <Link
                    href={"/students/" + student.id}
                    className="rounded-sm font-semibold hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {student.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t.contacts[student.contact]}
                  </p>
                </TableCell>
                <TableCell className="w-52">
                  <p className="font-semibold">
                    {student.school === "Kunjang University College"
                      ? "Kunjang Univ. College"
                      : student.school || t.intake.notDecided}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {dateLabel(student.start, locale, t.today, t.noDate, true)}
                  </p>
                </TableCell>
                <TableCell className="w-32">
                  <div
                    role="img"
                    aria-label={t.journeyLabel.replace(
                      "{step}",
                      String(student.journeyStep),
                    )}
                    className="grid grid-cols-6 gap-1"
                  >
                    {Array.from({ length: 6 }, (_, index) => (
                      <span
                        key={index}
                        className={cn(
                          "h-1.5 min-w-3 rounded-full",
                          index < student.journeyStep - 1
                            ? "bg-emerald-700"
                            : index === student.journeyStep - 1
                              ? "bg-primary"
                              : "bg-border",
                        )}
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell className="min-w-56">
                  <p className="font-semibold">
                    {student.now === "custom"
                      ? student.customAction
                      : t.now[student.now].title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {student.intake && student.now === "none"
                      ? t.intake.statuses[student.intake.consultation.status]
                      : t.now[student.now].detail}
                  </p>
                </TableCell>
                <TableCell>
                  <ActorBadge actor={student.turn} />
                </TableCell>
                <TableCell
                  className={cn(
                    "whitespace-nowrap font-semibold",
                    !student.nextCheck && "text-destructive",
                  )}
                >
                  {dateLabel(student.nextCheck, locale, t.today, t.noDate)}
                </TableCell>
                <TableCell>
                  <OwnerAvatar owner={student.owner} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination {...pagination} tableLabel={t.title} />
        {students.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {t.empty}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
