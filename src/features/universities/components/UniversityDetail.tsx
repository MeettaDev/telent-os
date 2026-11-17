"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageSkeleton } from "@/common/components/PageSkeleton";
import { Pagination, usePagination } from "@/common/components/Pagination";
import { WorkspacePageHeader } from "@/common/components/WorkspacePageHeader";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { journeyStages } from "@/features/students/mocks/students-data";
import { useStudentsStore } from "@/features/students/stores/students-store";
import { useLocale } from "@/providers/locale-provider";
import {
  contactKeys,
  milestoneKeys,
  recheckDate,
  requirementKeys,
  workspaceDate,
} from "../university-record";
import { useUniversitiesStore } from "../stores/universities-store";
import { AddProgramDialog, UniversityDialog } from "./UniversityDialogs";
import {
  applicationWindow,
  universityDate,
  UniversityStatus,
} from "./UniversityStatus";

const programColumns = [
  "program",
  "visaLength",
  "seats",
  "career",
  "students",
] as const;

function Panel({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 pb-4">
        <CardTitle>{title}</CardTitle>
        {aside}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function InfoRows({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <dl className="divide-y">
      {rows.map(({ label, value }) => (
        <div
          key={label}
          className="grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-4 sm:gap-3"
        >
          <dt className="text-xs font-semibold leading-5 text-primary-hover">
            {label}
          </dt>
          <dd className="text-sm leading-5 wrap-anywhere sm:col-span-3">
            {value || "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function UniversityDetail({ id }: { id: string }) {
  const { dictionary, locale } = useLocale();
  const t = dictionary.universityWorkspace;
  const s = dictionary.studentWorkspace;
  const record = useUniversitiesStore((state) =>
    state.records.find((item) => item.id === id),
  );
  const ready = useUniversitiesStore((state) => state.ready);
  const students = useStudentsStore((state) => state.students);
  const hydrated = useStudentsStore((state) => state.hydrated);
  const [dialog, setDialog] = useState<"edit" | "program" | null>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const { pageRows, pagination } = usePagination(record?.programs ?? [], id);
  if (!ready || !hydrated) return <PageSkeleton kind="detail" />;
  if (!record) notFound();
  const today = workspaceDate();
  const linked = record.assignments.flatMap((assignment) => {
    const student = students.find(
      ({ id: studentId }) => studentId === assignment.studentId,
    );
    return student ? [{ assignment, student }] : [];
  });
  const date = (value: string) => universityDate(value, locale);
  const timeline = [
    {
      label: t.columns.window,
      value: applicationWindow(record, locale, t),
      journey: t.journey.window,
    },
    ...milestoneKeys.map((key) => ({
      label: t.milestones[key],
      value: record.milestones[key],
      journey: t.journey[key],
    })),
  ];

  return (
    <main id="main-content">
      <WorkspacePageHeader
        title={record.name}
        breadcrumbLabel={dictionary.sidebar.universities}
        breadcrumbs={[
          { label: dictionary.sidebar.universities, href: "/universities" },
          { label: record.name },
        ]}
        actions={
          <>
            {record.guidelineUrl ? (
              <a
                href={record.guidelineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "text-sm",
                })}
              >
                {t.openPdf}
              </a>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-sm"
                disabled
              >
                {t.noPdf}
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              className="text-sm"
              disabled={!ready}
              onClick={(event) => {
                opener.current = event.currentTarget;
                setDialog("edit");
              }}
            >
              {t.edit}
            </Button>
          </>
        }
      >
        <div className="flex flex-wrap gap-1.5">
          <UniversityStatus record={record} today={today} includeDate />
          <Badge
            variant="secondary"
            className="whitespace-normal text-xs wrap-anywhere"
          >
            {t.source.replace("{source}", record.source || t.pending)}
          </Badge>
          {record.checkedOn && (
            <Badge variant="warning" className="text-xs">
              {t.recheckBy.replace(
                "{date}",
                universityDate(recheckDate(record.checkedOn), locale, "month"),
              )}
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">
            {t.version.replace("{version}", String(record.version))}
          </Badge>
        </div>
      </WorkspacePageHeader>
      <div className="grid items-start gap-5 px-4 pb-10 md:px-6 xl:grid-cols-3 xl:px-8">
        <div className="min-w-0 space-y-5 xl:col-span-2">
          <Panel
            title={t.programCount.replace(
              "{count}",
              String(record.programs.length),
            )}
            aside={
              <Button
                type="button"
                variant="app-text"
                className="h-auto p-0 text-sm"
                disabled={!ready}
                onClick={(event) => {
                  opener.current = event.currentTarget;
                  setDialog("program");
                }}
              >
                + {t.addProgram}
              </Button>
            }
          >
            <Table
              className="min-w-xl text-sm leading-5"
              aria-label={t.programs}
            >
              <TableHeader>
                <TableRow>
                  {programColumns.map((key) => (
                    <TableHead key={key} className="px-4 py-3 text-xs">
                      {t.columns[key]}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell className="px-4 py-3">
                      <p className="font-semibold wrap-anywhere">
                        {program.name}
                      </p>
                      {program.track && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {program.track}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {[program.visa, program.length]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {program.seats ?? "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {program.career || "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 font-semibold">
                      {
                        record.assignments.filter(
                          ({ programId }) => programId === program.id,
                        ).length
                      }
                    </TableCell>
                  </TableRow>
                ))}
                {!record.programs.length && (
                  <TableRow>
                    <TableCell
                      colSpan={programColumns.length}
                      className="py-5 text-muted-foreground"
                    >
                      {t.noPrograms}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <Pagination {...pagination} tableLabel={t.programs} />
          </Panel>
          <Panel
            title={t.datesTitle.replace(
              "{intake}",
              universityDate(record.intake, locale, "month"),
            )}
            aside={
              <Badge variant="tint" className="whitespace-normal text-xs">
                {t.journeyReference}
              </Badge>
            }
          >
            <dl className="divide-y">
              {timeline.map(({ label, value, journey }) => (
                <div
                  key={label}
                  className="grid gap-1 py-3 text-sm leading-5 first:pt-0 sm:grid-cols-10 sm:gap-3"
                >
                  <dt className="font-semibold sm:col-span-3">{label}</dt>
                  <dd className="text-muted-foreground wrap-anywhere sm:col-span-4">
                    {value || "—"}
                  </dd>
                  <dd className="text-xs font-semibold text-primary-hover sm:col-span-3">
                    {journey}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm leading-5 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              {t.dateNotice
                .replace("{version}", String(record.version + 1))
                .replace("{count}", String(linked.length))}
            </p>
          </Panel>
          <Panel
            title={t.requirementsTitle}
            aside={
              <span className="text-xs text-muted-foreground">
                {t.documentReference}
              </span>
            }
          >
            <InfoRows
              rows={requirementKeys.map((key) => ({
                label: t.requirements[key],
                value:
                  record.requirements[key] ||
                  (key === "language"
                    ? record.topik
                    : key === "bank"
                      ? record.bankProof
                      : ""),
              }))}
            />
          </Panel>
        </div>
        <aside className="min-w-0 space-y-5">
          <Panel
            title={t.studentsTitle.replace("{count}", String(linked.length))}
          >
            {linked.length ? (
              <ul className="divide-y">
                {linked.map(({ student, assignment }) => {
                  const program = record.programs.find(
                    ({ id: programId }) => programId === assignment.programId,
                  );
                  return (
                    <li key={student.id} className="py-3 first:pt-0 last:pb-0">
                      <Link
                        href={"/students/" + encodeURIComponent(student.id)}
                        className="flex items-center gap-3 rounded-sm hover:text-primary-hover focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span
                          aria-hidden="true"
                          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-tint text-sm font-semibold text-primary-hover"
                        >
                          {student.initials}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold wrap-anywhere">
                            {student.name}
                          </span>
                          <span className="mt-1 block text-xs text-muted-foreground wrap-anywhere">
                            {[
                              s.stages[journeyStages[student.journeyStep - 1]],
                              assignment.backup ? t.backup : program?.name,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{t.noStudents}</p>
            )}
          </Panel>
          <Panel
            title={t.contactsTitle}
            aside={
              <span className="text-xs text-muted-foreground">
                {t.internal}
              </span>
            }
          >
            <InfoRows
              rows={contactKeys.map((key) => ({
                label: t.contacts[key],
                value: record.contacts[key],
              }))}
            />
          </Panel>
          <Panel title={t.history}>
            {record.history.length ? (
              <ol className="divide-y">
                {record.history.map((entry) => (
                  <li
                    key={entry.version}
                    className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <Badge
                      variant={
                        entry.version === record.version ? "tint" : "secondary"
                      }
                    >
                      v{entry.version}
                    </Badge>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{date(entry.on)}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground wrap-anywhere">
                        {[entry.note, entry.author].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">{t.noHistory}</p>
            )}
          </Panel>
        </aside>
      </div>
      {dialog === "edit" && (
        <UniversityDialog
          record={record}
          opener={opener}
          students={linked.map(({ student }) => student.name)}
          onClose={() => setDialog(null)}
          onSave={() => setDialog(null)}
        />
      )}
      {dialog === "program" && (
        <AddProgramDialog
          record={record}
          opener={opener}
          onClose={() => setDialog(null)}
        />
      )}
    </main>
  );
}
