"use client";

import { useMemo } from "react";
import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import {
  ActorBadge,
  OwnerAvatar,
} from "@/features/students/components/StudentStatus";
import { dateLabel } from "@/features/students/lib/student-workflow";
import type { Student } from "@/features/students/types/student";
import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";

const cell =
  "block min-w-0 p-0 leading-5 xl:table-cell xl:px-2 xl:py-3.5 xl:first:pl-5 xl:last:pr-5";
const caption = "mt-0.5 text-xs leading-normal text-muted-foreground";

export function StudentsTable({
  students,
  resetKey,
}: {
  students: Student[];
  resetKey: string;
}) {
  const { dictionary, locale } = useLocale();
  const t = dictionary.studentWorkspace;
  const columns = useMemo(() => {
    const columns: DataTableColumn<Student>[] = [
      {
        id: "student",
        header: t.columns.student,
        meta: { width: "20.25%", cellClassName: "row-start-1" },
        cell: ({ row: { original: student } }) => (
          <>
            <Link
              href={"/students/" + student.id}
              className="rounded-sm font-semibold hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {student.name}
            </Link>
            <p className={caption}>{t.contacts[student.contact]}</p>
          </>
        ),
      },
      {
        id: "school",
        header: t.columns.school,
        meta: { width: "20.9%", cellClassName: "col-span-2 row-start-2" },
        cell: ({ row: { original: student } }) => (
          <>
            <p className="font-medium wrap-anywhere">
              {student.school === "Kunjang University College"
                ? "Kunjang Univ. College"
                : student.school || t.intake.notDecided}
            </p>
            <p className={caption}>
              {dateLabel(student.start, locale, t.today, t.noDate, true)}
            </p>
          </>
        ),
      },
      {
        id: "journey",
        header: t.columns.journey,
        meta: { width: "12.9%", cellClassName: "col-span-2 row-start-3" },
        cell: ({ row: { original: student } }) => {
          const label = t.journeyLabel.replace(
            "{step}",
            String(student.journeyStep),
          );
          return (
            <>
              <div
                role="img"
                aria-label={label}
                className="grid max-w-29 grid-cols-6 gap-1"
              >
                {Array.from({ length: 6 }, (_, index) => (
                  <span
                    key={index}
                    className={cn(
                      "h-1.5 rounded-full",
                      index < student.journeyStep
                        ? "bg-emerald-700"
                        : "bg-[#d9d9e0] dark:bg-border",
                    )}
                  />
                ))}
              </div>
              <p className={caption} aria-hidden="true">
                {label}
              </p>
            </>
          );
        },
      },
      {
        id: "now",
        header: t.columns.now,
        meta: { width: "17.5%", cellClassName: "col-span-2 row-start-4" },
        cell: ({ row: { original: student } }) => (
          <>
            <p className="font-semibold wrap-anywhere">
              {student.now === "custom"
                ? student.customAction
                : t.now[student.now].title}
            </p>
            <p
              className={cn(
                caption,
                (student.now === "mofa" || student.turn === "noOne") &&
                  "text-destructive",
              )}
            >
              {student.intake && student.now === "none"
                ? t.intake.statuses[student.intake.consultation.status]
                : t.now[student.now].detail}
            </p>
          </>
        ),
      },
      {
        id: "turn",
        header: t.columns.turn,
        meta: {
          width: "10.3%",
          cellClassName:
            "row-start-5 self-center [&_[data-slot=badge]]:rounded-full [&_[data-slot=badge]]:text-xs",
        },
        cell: ({ row }) => <ActorBadge actor={row.original.turn} />,
      },
      {
        id: "nextCheck",
        header: t.columns.nextCheck,
        meta: {
          width: "10.3%",
          cellClassName:
            "col-start-2 row-start-5 self-center text-right whitespace-nowrap font-semibold xl:text-left",
        },
        cell: ({ row: { original: student } }) => (
          <span className={cn(!student.nextCheck && "text-destructive")}>
            {dateLabel(student.nextCheck, locale, t.today, t.noDate)}
          </span>
        ),
      },
      {
        id: "owner",
        header: t.columns.owner,
        meta: {
          cellClassName:
            "col-start-2 row-start-1 justify-self-end [&>span]:size-7 [&>span]:text-xs",
        },
        cell: ({ row }) => <OwnerAvatar owner={row.original.owner} />,
      },
    ];

    return columns.map((column) => ({
      ...column,
      meta: {
        ...column.meta,
        headerClassName: cn(
          "wrap-anywhere xl:table-cell xl:px-2 xl:py-3 xl:first:pl-5 xl:last:pr-5",
          column.id === "student"
            ? "block px-5 py-3"
            : "sr-only p-0 xl:not-sr-only",
        ),
        cellClassName: cn(cell, column.meta?.cellClassName),
      },
    }));
  }, [locale, t]);

  return (
    <DataTable
      columns={columns}
      data={students}
      resetKey={resetKey}
      label={t.title}
      empty={t.empty}
      tableClassName="block table-fixed text-[15px] xl:table xl:[&>tbody]:table-row-group"
      headerClassName="sticky top-0 z-10 block bg-[color-mix(in_srgb,var(--muted)_50%,var(--card))] xl:table-header-group"
      rowClassName="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 px-5 py-3.5 xl:table-row xl:p-0"
    />
  );
}
