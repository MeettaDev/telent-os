"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { PageSkeleton } from "@/common/components/PageSkeleton";
import { Pagination, usePagination } from "@/common/components/Pagination";
import { WorkspacePageHeader } from "@/common/components/WorkspacePageHeader";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { journeyStages } from "@/features/students/mocks/students-data";
import { useStudentsStore } from "@/features/students/stores/students-store";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import {
  contactKeys,
  milestoneKeys,
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

const avatarTones = [
  "bg-primary",
  "bg-orange-700",
  "bg-green-700",
  "bg-violet-600",
  "bg-primary",
  "bg-neutral-600",
];

const outlineAction =
  "h-9 rounded-full border-primary px-4 text-sm text-foreground";

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
    <Card className="@container min-w-0 gap-3.5 border-0 p-4 shadow-[0_8px_24px_#00000012] sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle className="text-lg leading-tight font-bold">
          {title}
        </CardTitle>
        {aside}
      </div>
      {children}
    </Card>
  );
}

function InfoRows({
  rows,
  divided = false,
}: {
  rows: { label: string; value: string }[];
  divided?: boolean;
}) {
  return (
    <dl className={divided ? "divide-y" : "space-y-3.5"}>
      {rows.map(({ label, value }) => (
        <div
          key={label}
          className={cn(
            "grid items-baseline gap-1 @xs:gap-3",
            divided
              ? "py-3.5 first:pt-0 last:pb-0 @xs:grid-cols-[minmax(6.5rem,1fr)_minmax(0,4fr)]"
              : "@xs:grid-cols-[minmax(5.75rem,3fr)_minmax(0,7fr)]",
          )}
        >
          <dt className="text-xs font-semibold text-muted-foreground uppercase">
            {label}
          </dt>
          <dd className="text-sm leading-relaxed wrap-anywhere">
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
  const linked = record.assignments.flatMap((assignment) => {
    const student = students.find(
      ({ id: studentId }) => studentId === assignment.studentId,
    );
    return student ? [{ assignment, student }] : [];
  });
  const timeline = [
    {
      label: t.columns.window,
      value: applicationWindow(record, locale, t),
      journey: record.closesOn
        ? t.journey.deadline.replace(
            "{date}",
            universityDate(record.closesOn, locale, "short"),
          )
        : t.journey.window,
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
        inlineActions
        actions={
          <>
            <UniversityStatus
              record={record}
              today={workspaceDate()}
              includeDate
            />
            {record.guidelineUrl ? (
              <a
                href={record.guidelineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  outlineAction,
                )}
              >
                {t.openPdf}
              </a>
            ) : (
              <Button
                type="button"
                variant="outline"
                className={outlineAction}
                disabled
              >
                {t.noPdf}
              </Button>
            )}
            <Button
              type="button"
              className="h-11 rounded-full px-6 text-lg"
              onClick={(event) => {
                opener.current = event.currentTarget;
                setDialog("edit");
              }}
            >
              {t.editAction}
            </Button>
          </>
        }
      />
      <div className="grid items-start gap-5 px-4 pb-10 md:px-6 xl:grid-cols-[minmax(0,1.92fr)_minmax(0,1fr)] xl:px-8">
        <div className="min-w-0 space-y-5">
          <Panel
            title={t.programs}
            aside={
              <Button
                type="button"
                variant="outline"
                className={outlineAction}
                onClick={(event) => {
                  opener.current = event.currentTarget;
                  setDialog("program");
                }}
              >
                <Plus aria-hidden="true" />
                {t.addProgram}
              </Button>
            }
          >
            {pageRows.length ? (
              <ul className="divide-y">
                {pageRows.map((program) => {
                  const count = record.assignments.filter(
                    ({ programId }) => programId === program.id,
                  ).length;
                  const summary = [program.track, program.career]
                    .filter(Boolean)
                    .join(" · ");
                  return (
                    <li
                      key={program.id}
                      className="grid grid-cols-3 items-center gap-x-3 gap-y-2 py-4 text-sm wrap-anywhere first:pt-0 last:pb-0 @xl:grid-cols-[minmax(0,3.1fr)_minmax(0,1fr)_minmax(0,0.95fr)_minmax(0,0.72fr)]"
                    >
                      <div className="col-span-3 @xl:col-span-1">
                        <p className="text-base font-semibold">
                          {program.name}
                        </p>
                        {summary && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {summary}
                          </p>
                        )}
                      </div>
                      <p>
                        <span className="sr-only">{t.columns.visaLength} </span>
                        {[program.visa, program.length]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </p>
                      <p>
                        {program.seats === null
                          ? "—"
                          : (program.seats === 1
                              ? t.oneSeat
                              : t.seatCount
                            ).replace("{count}", String(program.seats))}
                      </p>
                      <p
                        className={cn(
                          "text-right font-semibold",
                          !count && "text-muted-foreground",
                        )}
                      >
                        {count
                          ? (count === 1
                              ? t.oneStudent
                              : t.studentCount
                            ).replace("{count}", String(count))
                          : "—"}
                      </p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{t.noPrograms}</p>
            )}
            {pagination.totalPages > 1 && (
              <Pagination {...pagination} tableLabel={t.programs} />
            )}
          </Panel>
          <Panel
            title={t.datesTitle.replace(
              "{intake}",
              universityDate(record.intake, locale, "month"),
            )}
          >
            <dl className="divide-y">
              {timeline.map(({ label, value, journey }) => (
                <div
                  key={label}
                  className="grid items-center gap-x-3 gap-y-1.5 py-3 text-sm leading-snug first:pt-0 last:pb-0 @lg:grid-cols-[minmax(0,3fr)_minmax(0,5fr)_minmax(0,2fr)]"
                >
                  <dt className="font-medium text-muted-foreground">{label}</dt>
                  <dd className="font-semibold wrap-anywhere">
                    {value || "—"}
                  </dd>
                  {value && (
                    <dd className="@lg:justify-self-end">
                      <Badge
                        variant="tint"
                        className="max-w-full rounded-full text-center text-xs"
                      >
                        {journey}
                      </Badge>
                    </dd>
                  )}
                </div>
              ))}
            </dl>
          </Panel>
          <Panel title={t.requirementsTitle}>
            <InfoRows
              divided
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
          <Panel title={t.columns.students}>
            {linked.length ? (
              <ul className="space-y-3.5">
                {linked.map(({ student, assignment }, index) => {
                  const program = record.programs.find(
                    ({ id: programId }) => programId === assignment.programId,
                  );
                  return (
                    <li key={student.id}>
                      <Link
                        href={"/students/" + encodeURIComponent(student.id)}
                        className="flex min-h-9 items-center gap-3 rounded-sm hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white",
                            avatarTones[index % avatarTones.length],
                          )}
                        >
                          {student.initials}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold wrap-anywhere">
                            {student.name}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground wrap-anywhere">
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
              <Badge variant="secondary" className="rounded-full text-xs">
                {t.internal}
              </Badge>
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
              <ol className="space-y-3.5">
                {record.history.map((entry) => (
                  <li key={entry.version} className="flex items-start gap-3">
                    <Badge
                      className="rounded-full text-xs"
                      variant={
                        entry.version === record.version ? "tint" : "secondary"
                      }
                    >
                      v{entry.version}
                    </Badge>
                    <div className="min-w-0">
                      <p className="text-sm font-medium wrap-anywhere">
                        {[entry.note, entry.author].filter(Boolean).join(" · ")}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {universityDate(entry.on, locale)}
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
