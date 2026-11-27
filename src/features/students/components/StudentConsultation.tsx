"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Tabs } from "radix-ui";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentDocuments } from "@/features/students/components/StudentDocuments";
import { JourneyProgress } from "@/features/students/components/JourneyProgress";
import {
  BookConsultationSheet,
  ConsultationNotesSheet,
  EditIntakeSheet,
  RecordConsultationSheet,
} from "@/features/students/components/ConsultationSheets";
import { intakeOwners } from "@/features/students/lib/student-intake";
import {
  addDays,
  callDateLabel,
  dateLabel,
  yangonToday,
} from "@/features/students/lib/student-workflow";
import { useStudentsStore } from "@/features/students/stores/students-store";
import {
  consultationOutcomes,
  type DocumentId,
  type Student,
  type StudentPlan,
} from "@/features/students/types/student";
import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";

type DetailSheet = "book" | "record" | "notes" | "edit";
const outline = "rounded-full border-primary px-4 text-sm text-foreground";
const primary = "h-11 shrink-0 rounded-full px-6 text-lg";
const panelFocus = "focus-visible:outline-2 focus-visible:outline-ring";

function Details({
  fields,
}: {
  fields: readonly (readonly [string, string])[];
}) {
  return (
    <dl className="space-y-3">
      {fields.map(([label, value]) => (
        <div
          key={label}
          className="grid grid-cols-[minmax(5rem,1fr)_minmax(0,4fr)] items-baseline gap-3 sm:grid-cols-[minmax(6rem,1fr)_minmax(0,3fr)]"
        >
          <dt className="text-[11px] font-bold uppercase text-muted-foreground">
            {label}
          </dt>
          <dd className="text-[15px] wrap-anywhere">{value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function StudentConsultation({
  student,
  plan,
  onRequest,
}: {
  student: Student & { intake: NonNullable<Student["intake"]> };
  plan: StudentPlan;
  onRequest: (id: DocumentId) => void;
}) {
  const { dictionary, locale } = useLocale();
  const t = dictionary.studentWorkspace;
  const copy = t.consultation;
  const call = dictionary.inboxWorkspace.callBooking;
  const history = useStudentsStore((state) => state.history[student.id]);
  const [sheet, setSheet] = useState<DetailSheet | null>(null);
  const [initialTab] = useState(() =>
    typeof window !== "undefined" &&
    window.location.hash === "#student-documents"
      ? "legalization"
      : "overview",
  );
  const opener = useRef<HTMLButtonElement>(null);
  const activeTab = useRef<HTMLDivElement>(null);
  const intake = student.intake;
  const consultation = intake.consultation;
  const appointment =
    consultation.status === "scheduled"
      ? consultation
      : consultation.status === "inquiry"
        ? undefined
        : consultation.appointment;
  const result =
    consultation.status === "scheduled" || consultation.status === "inquiry"
      ? undefined
      : consultation;
  const completed = result?.status === "completed";
  const scheduled = consultation.status === "scheduled";
  const outcome = completed
    ? consultationOutcomes.find((value) => value === result.outcome)
    : undefined;
  const writePlan =
    completed &&
    plan.status === "draft" &&
    (outcome === "ready" || student.now === "plan");
  const planDue =
    writePlan &&
    (student.now === "plan" && student.nextCheck
      ? student.nextCheck
      : addDays(result.date, 2));
  const needsBooking = !scheduled && !completed;
  const shortDate = (date: string | null) =>
    date === yangonToday()
      ? t.today
      : dateLabel(date, locale, t.today, t.noDate);
  const activityDate = new Intl.DateTimeFormat(
    locale === "my" ? "my-MM" : "en-US",
    {
      month: "short",
      day: "numeric",
      timeZone: "Asia/Yangon",
    },
  );
  const formattedAppointment = appointment
    ? callDateLabel(appointment.date, locale) +
      " · " +
      appointment.time.slice(0, 5)
    : "";
  const owner = student.owner && intakeOwners[student.owner];
  const host = appointment?.host ? intakeOwners[appointment.host] : owner;
  const stageNote = scheduled
    ? copy.bookedOn.replace("{date}", shortDate(consultation.date))
    : planDue
      ? copy.planDue.replace("{date}", shortDate(planDue))
      : result
        ? t.intake.statuses[result.status]
        : copy.notBooked;
  const nextTask =
    student.now === "none" && consultation.status === "inquiry"
      ? "bookConsultation"
      : student.now;
  const due =
    student.nextCheck ??
    (nextTask === "bookConsultation" && consultation.status === "inquiry"
      ? yangonToday()
      : null);
  const current = scheduled ? 1 : writePlan ? 3 : needsBooking ? 0 : -1;
  const steps = [
    {
      title: copy.bookFirst,
      detail: needsBooking
        ? stageNote
        : [
            formattedAppointment,
            appointment?.mode && call.locations[appointment.mode],
          ]
            .filter(Boolean)
            .join(" · "),
    },
    {
      title: copy.call,
      detail: completed
        ? [copy.sessionHeld.replace("{date}", shortDate(result.date)), host]
            .filter(Boolean)
            .join(" · ")
        : scheduled
          ? [
              formattedAppointment,
              host && call.withHost.replace("{host}", host),
            ]
              .filter(Boolean)
              .join(" · ")
          : "",
    },
    {
      title: copy.recordStep,
      detail: completed
        ? [outcome ? copy.outcomes[outcome] : result.outcome, result.goal]
            .filter(Boolean)
            .join(" · ")
        : result
          ? t.intake.statuses[result.status]
          : "",
    },
    {
      title: t.now.plan.title,
      detail: planDue ? t.detail.due + " " + shortDate(planDue) : "",
    },
  ];
  const openPlan =
    writePlan || (completed && (!outcome || plan.status !== "draft"));
  const hasBanner = scheduled || needsBooking || openPlan;

  function open(event: React.MouseEvent<HTMLButtonElement>, next: DetailSheet) {
    opener.current = event.currentTarget;
    setSheet(next);
  }

  const sheetProps = {
    student,
    onClose: () => setSheet(null),
    restoreFocus: () => {
      if (opener.current?.isConnected) opener.current.focus();
      else if (activeTab.current?.isConnected) {
        const target = activeTab.current.querySelector<HTMLElement>(
          "[data-state=active]",
        );
        target?.focus();
      }
    },
  };
  const contact = (
    <Card className="border-0">
      <CardHeader className="flex-row items-center justify-between gap-3 px-5 pt-5 pb-3">
        <CardTitle>{copy.contactIntake}</CardTitle>
        <Button
          type="button"
          variant="outline"
          className={outline}
          onClick={(event) => open(event, "edit")}
        >
          {copy.edit}
        </Button>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <Details
          fields={[
            [copy.studentId, student.id],
            [
              copy.contact,
              [
                student.phone,
                t.intake.channels[intake.contactChannel],
                t.intake.people[intake.contactPerson],
              ]
                .filter(Boolean)
                .join(" · "),
            ],
            [t.intake.cameInBy, t.intake.channels[intake.channel]],
            [
              copy.heardFrom,
              intake.referralSource
                ? t.intake.channels[intake.referralSource]
                : t.intake.notProvided,
            ],
          ]}
        />
      </CardContent>
    </Card>
  );

  return (
    <Tabs.Root
      defaultValue={initialTab}
      className="space-y-5 px-4 pb-10 md:px-6 xl:px-8"
    >
      <Tabs.List
        ref={activeTab}
        aria-label={t.title}
        className="flex w-fit max-w-full flex-wrap gap-1 rounded-2xl bg-card p-1 shadow-sm sm:rounded-full"
      >
        {(["overview", "profile", "legalization"] as const).map((value) => (
          <Tabs.Trigger
            key={value}
            value={value}
            className="min-h-9.5 cursor-pointer rounded-full px-3 text-center text-sm font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring data-[state=active]:bg-foreground data-[state=active]:text-background sm:px-4.5"
          >
            {copy[value]}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <Tabs.Content value="overview" className={cn("space-y-5", panelFocus)}>
        <JourneyProgress
          activeStage={student.journeyStep}
          consultationNote={stageNote}
        />
        {hasBanner && (
          <Card className="border-0 bg-primary-tint">
            <CardContent className="flex flex-col gap-4 px-5 py-4.5 lg:flex-row lg:items-center lg:justify-between">
              <h2 className="text-xl leading-6 font-bold">
                {scheduled
                  ? t.stages.consultation + " · " + formattedAppointment
                  : writePlan
                    ? copy.writeFor.replace("{student}", student.name)
                    : openPlan
                      ? t.statuses[plan.status]
                      : copy.bookFirst}
              </h2>
              {openPlan ? (
                <Link
                  href={"/students/" + student.id + "/plan"}
                  className={cn(buttonVariants(), primary)}
                >
                  {copy.openPlan}
                </Link>
              ) : (
                <Button
                  type="button"
                  className={primary}
                  onClick={(event) =>
                    open(event, scheduled ? "record" : "book")
                  }
                >
                  {scheduled ? copy.record : copy.book}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.77fr)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-5">
            <Card className="border-0">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle>{t.stages.consultation}</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <ol className="space-y-4.5">
                  {steps.map(({ title, detail }, index) => {
                    const done =
                      (completed && index < 3) ||
                      (scheduled && index === 0) ||
                      (completed && index === 3 && plan.status !== "draft");
                    return (
                      <li
                        key={title}
                        aria-current={index === current ? "step" : undefined}
                        className="flex min-h-9 flex-wrap items-center gap-x-3.5 gap-y-2"
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "flex size-6.5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                            done
                              ? "bg-emerald-700"
                              : index === current
                                ? "bg-primary"
                                : "bg-[#82828e] dark:bg-neutral-600",
                          )}
                        >
                          {done ? <Check className="size-3.5" /> : index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "text-[15px] font-semibold",
                              !done &&
                                index !== current &&
                                !detail &&
                                "text-muted-foreground",
                            )}
                          >
                            {title}
                          </p>
                          {detail && (
                            <p
                              className={cn(
                                "mt-0.5 text-sm wrap-anywhere",
                                index === current
                                  ? "text-primary-hover"
                                  : "text-muted-foreground",
                              )}
                            >
                              {detail}
                            </p>
                          )}
                        </div>
                        {index === 1 && scheduled && (
                          <Button
                            type="button"
                            variant="outline"
                            className={outline}
                            onClick={(event) => open(event, "book")}
                          >
                            {copy.reschedule}
                          </Button>
                        )}
                        {index === 2 && result && (
                          <Button
                            type="button"
                            variant="outline"
                            className={outline}
                            onClick={(event) => open(event, "notes")}
                          >
                            {copy.viewNotes}
                          </Button>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </CardContent>
            </Card>
            {contact}
          </div>
          <aside className="min-w-0 space-y-5">
            <Card className="border-0">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle>{copy.nextAction}</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <Details
                  fields={[
                    [
                      t.action,
                      nextTask === "custom"
                        ? student.customAction
                        : t.now[nextTask].title,
                    ],
                    [
                      t.detail.due,
                      due
                        ? shortDate(due) +
                          (scheduled && due === consultation.date
                            ? " · " + consultation.time.slice(0, 5)
                            : "")
                        : t.noDate,
                    ],
                    [t.owner, owner || "—"],
                  ]}
                />
              </CardContent>
            </Card>
            <Card className="border-0">
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle>{copy.activity}</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <ol className="divide-y">
                  {(history ?? []).map((entry) => {
                    const date = new Date(entry.at);
                    const detail =
                      entry.kind === "studentAdded"
                        ? entry.author && entry.intakeChannel
                          ? copy.created
                              .replace("{author}", entry.author)
                              .replace(
                                "{channel}",
                                t.intake.channels[entry.intakeChannel],
                              )
                          : t.history.studentAdded
                        : [
                            t.history[entry.kind],
                            entry.consultationOutcome &&
                              copy.outcomes[entry.consultationOutcome],
                            entry.detail,
                          ]
                            .filter(Boolean)
                            .join(" · ");
                    return (
                      <li
                        key={entry.id}
                        className="grid grid-cols-[3.75rem_minmax(0,1fr)] items-baseline gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <time
                          dateTime={entry.at}
                          className="text-sm font-semibold text-muted-foreground"
                        >
                          {Number.isNaN(date.getTime())
                            ? "—"
                            : activityDate.format(date)}
                        </time>
                        <p className="text-sm wrap-anywhere">{detail}</p>
                      </li>
                    );
                  })}
                  {!history?.length && (
                    <li className="text-sm text-muted-foreground">
                      {t.intake.notProvided}
                    </li>
                  )}
                </ol>
              </CardContent>
            </Card>
          </aside>
        </div>
      </Tabs.Content>
      <Tabs.Content value="profile" className={panelFocus}>
        {contact}
      </Tabs.Content>
      <Tabs.Content value="legalization" className={panelFocus}>
        <StudentDocuments student={student} onRequest={onRequest} />
      </Tabs.Content>
      {sheet === "book" && <BookConsultationSheet {...sheetProps} />}
      {sheet === "record" && consultation.status === "scheduled" && (
        <RecordConsultationSheet {...sheetProps} appointment={consultation} />
      )}
      {sheet === "notes" && result && (
        <ConsultationNotesSheet {...sheetProps} result={result} />
      )}
      {sheet === "edit" && <EditIntakeSheet {...sheetProps} />}
    </Tabs.Root>
  );
}
