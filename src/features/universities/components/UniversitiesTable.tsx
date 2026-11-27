"use client";

import { useMemo } from "react";
import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import type { University } from "../university-record";
import {
  applicationWindow,
  universityDate,
  UniversityStatus,
} from "./UniversityStatus";

export function UniversitiesTable({
  records,
  resetKey,
  today,
}: {
  records: University[];
  resetKey: string;
  today: string;
}) {
  const { dictionary, locale } = useLocale();
  const t = dictionary.universityWorkspace;
  const columns = useMemo<DataTableColumn<University>[]>(
    () => [
      {
        id: "school",
        header: t.columns.school,
        meta: { cellClassName: "col-span-2 min-w-0 p-0 @3xl:col-span-1" },
        cell: ({ row: { original: record } }) => {
          const count = record.programs.length;
          const programs = count
            ? (count === 1 ? t.oneProgram : t.programCount).replace(
                "{count}",
                String(count),
              )
            : "";
          return (
            <>
              <Link
                href={"/universities/" + encodeURIComponent(record.id)}
                className="text-base font-semibold after:absolute after:inset-0 focus-visible:outline-none"
              >
                {record.name}
              </Link>
              <p className="mt-1 text-xs text-muted-foreground">
                {[record.city, record.summary, programs]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </>
          );
        },
      },
      {
        id: "intake",
        header: t.columns.intake + " · " + t.columns.window,
        meta: { cellClassName: "min-w-0 p-0" },
        cell: ({ row: { original: record } }) => (
          <>
            <p className="text-base font-semibold">
              {universityDate(record.intake, locale, "month")}
            </p>
            <p
              className={cn(
                "mt-1 text-xs",
                record.opensOn || record.closesOn
                  ? "text-muted-foreground"
                  : "text-destructive",
              )}
            >
              {applicationWindow(record, locale, t, true)}
            </p>
          </>
        ),
      },
      {
        id: "requirements",
        header: t.columns.topik + " · " + t.columns.bankProof,
        meta: { cellClassName: "min-w-0 p-0" },
        cell: ({ row: { original: record } }) => (
          <>
            <p className="text-base font-semibold">
              {record.topik.startsWith("Level ")
                ? t.topikLevel.replace("{level}", record.topik.slice(6))
                : record.topik || "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {record.bankProof === "Waived"
                ? t.bankProofWaived
                : record.bankProof || "—"}
            </p>
          </>
        ),
      },
      {
        id: "verified",
        header: t.columns.checked,
        meta: { cellClassName: "min-w-0 p-0" },
        cell: ({ row: { original: record } }) => (
          <>
            <UniversityStatus record={record} today={today} />
            <p className="mt-1 text-xs text-muted-foreground">
              {record.checkedOn
                ? universityDate(record.checkedOn, locale)
                : t.pending}
            </p>
          </>
        ),
      },
      {
        id: "students",
        header: t.columns.students,
        meta: { cellClassName: "min-w-0 p-0 text-right font-semibold" },
        cell: ({ row: { original: record } }) => {
          const primary = record.assignments.filter(
            ({ backup }) => !backup,
          ).length;
          const backups = record.assignments.length - primary;
          const students = [
            primary
              ? (primary === 1 ? t.oneStudent : t.studentCount).replace(
                  "{count}",
                  String(primary),
                )
              : "",
            backups ? t.backupCount.replace("{count}", String(backups)) : "",
          ]
            .filter(Boolean)
            .join(" · ");
          return (
            <span className={cn(!students && "text-muted-foreground")}>
              {students || "—"}
            </span>
          );
        },
      },
    ],
    [locale, t, today],
  );

  return (
    <DataTable
      columns={columns}
      data={records}
      resetKey={resetKey}
      label={dictionary.sidebar.universities}
      empty={t.empty}
      className="@container px-4 py-1 shadow-[0_8px_24px_#00000012] sm:px-5"
      tableClassName="block"
      headerClassName="sr-only"
      rowClassName="relative grid grid-cols-2 items-center gap-x-4 gap-y-3 rounded-sm py-4 text-sm leading-snug wrap-anywhere transition-colors hover:bg-muted/50 focus-within:ring-2 focus-within:ring-ring @3xl:min-h-[77px] @3xl:grid-cols-[minmax(0,4.45fr)_minmax(0,1.72fr)_minmax(0,1.5fr)_minmax(0,1.3fr)_minmax(0,1.35fr)]"
    />
  );
}
