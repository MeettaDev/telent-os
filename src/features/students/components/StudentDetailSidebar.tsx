"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { OwnerAvatar } from "@/features/students/components/StudentStatus";
import { useStudentsStore } from "@/features/students/stores/students-store";
import {
  consultationOutcomes,
  type Student,
  type StudentPlan,
} from "@/features/students/types/student";
import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";

const initialEvents = [
  { date: "2026-10-01", key: "fix" },
  { date: "2026-10-01", key: "resent" },
  { date: "2026-09-30", key: "photo" },
  { date: "2026-09-28", key: "application" },
  { date: "2026-09-26", key: "plan" },
  { date: "2026-09-25", key: "consultation" },
] as const;
export function StudentDetailSidebar({
  student,
  plan,
}: {
  student: Student;
  plan: StudentPlan;
}) {
  const { dictionary, locale } = useLocale();
  const t = dictionary.studentWorkspace;
  const router = useRouter();
  const history = useStudentsStore((state) => state.history[student.id]);
  const intake = student.intake;
  const copy = t.intake;
  const consultation = intake?.consultation;
  const outcome =
    consultation?.status === "completed"
      ? consultationOutcomes.find((value) => value === consultation.outcome)
      : undefined;
  const intakeFields = intake &&
    consultation && [
      [copy.channel, copy.channels[intake.channel]],
      [copy.contactPerson, copy.people[intake.contactPerson]],
      [copy.status, copy.statuses[consultation.status]],
      ...(consultation.status === "scheduled"
        ? [
            [copy.scheduledDate, consultation.date],
            [copy.scheduledTime, consultation.time],
          ]
        : consultation.status === "completed"
          ? [
              [copy.completedDate, consultation.date],
              [
                copy.outcome,
                outcome
                  ? t.consultation.outcomes[outcome]
                  : consultation.outcome,
              ],
              [copy.goal, consultation.goal],
            ]
          : []),
      [
        copy.heardVia,
        intake.referralSource && copy.channels[intake.referralSource],
      ],
      [copy.googleEmail, intake.googleEmail],
      [
        consultation.status === "completed" ? copy.consultationNote : copy.note,
        consultation.status === "completed"
          ? (consultation.notes ?? intake.note)
          : intake.note,
      ],
      [copy.separateReason, intake.separateReason],
    ];
  const confirmed = history?.find((entry) => entry.kind === "planConfirmed");
  const confirmedDate = new Intl.DateTimeFormat(
    locale === "my" ? "my-MM" : "en-US",
    { month: "short", day: "numeric", timeZone: "Asia/Yangon" },
  ).format(
    confirmed ? new Date(confirmed.at) : new Date("2026-09-26T00:00:00Z"),
  );
  function editPlan() {
    try {
      if (plan.status === "confirmed")
        useStudentsStore
          .getState()
          .savePlan(
            student.id,
            { ...plan, version: plan.version + 1 },
            "draft",
          );
      router.push("/students/" + student.id + "/plan");
    } catch {
      toast.error(t.saveError);
    }
  }
  const fields = [
    [t.detail.school, plan.university],
    [t.detail.program, plan.program],
    [t.detail.start, plan.schedule],
    [t.detail.topik, plan.topik],
    [t.detail.backup, plan.backup],
    [t.detail.switchIf, plan.switchIf || t.plan.defaultSwitch],
    [
      t.detail.status,
      plan.status === "confirmed"
        ? t.detail.confirmedBy
            .replace("{student}", student.name)
            .replace("{date}", confirmedDate)
        : t.statuses[plan.status],
    ],
  ];
  return (
    <aside className="min-w-0 space-y-5">
      {intakeFields && (
        <Card className="border-0">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle>{t.stages.consultation}</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <dl className="space-y-3">
              {intakeFields
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div
                    key={label}
                    className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-2"
                  >
                    <dt className="text-xs font-semibold text-muted-foreground">
                      {label}
                    </dt>
                    <dd className="break-words text-sm">{value}</dd>
                  </div>
                ))}
            </dl>
          </CardContent>
        </Card>
      )}
      <Card className="border-0">
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 px-5 pt-5 pb-3">
          <CardTitle>
            {t.detail.yourPlan} · v{plan.version}
          </CardTitle>
          <Button
            type="button"
            variant="app-text"
            onClick={editPlan}
            className="h-auto p-0 text-sm text-primary-hover"
          >
            {plan.status === "draft" ? t.detail.writePlan : t.detail.editPlan} ›
          </Button>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <dl className="space-y-3">
            {fields.map(([label, value]) => (
              <div
                key={label}
                className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-2"
              >
                <dt className="text-[11px] font-bold uppercase text-muted-foreground">
                  {label}
                </dt>
                <dd
                  className={cn(
                    "break-words text-sm leading-5",
                    label === t.detail.status &&
                      plan.status === "confirmed" &&
                      "text-emerald-700 dark:text-emerald-300",
                  )}
                >
                  {value || "—"}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
      <Card className="border-0">
        <CardHeader className="px-5 pt-5 pb-3">
          <CardTitle>{t.detail.people}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-5 pb-5">
          {(
            [
              { owner: "H", name: "Hsu Wai", role: t.detail.caseOwner },
              { owner: "N", name: "Nway Nway", role: t.detail.reviewer },
            ] as const
          ).map((person) => (
            <div key={person.owner} className="flex items-start gap-3">
              <OwnerAvatar owner={person.owner} />
              <div>
                <h3 className="font-semibold">{person.name}</h3>
                <p className="text-xs leading-5 text-muted-foreground">
                  {person.role}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="border-0">
        <CardHeader className="flex-row flex-wrap justify-between gap-2 px-5 pt-5 pb-3">
          <CardTitle>{t.detail.history}</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <ol className="space-y-3">
            {(history ?? []).map((entry) => (
              <li
                key={entry.id}
                className="grid grid-cols-[3rem_minmax(0,1fr)] gap-3"
              >
                <time
                  dateTime={entry.at}
                  className="text-xs font-semibold text-muted-foreground"
                >
                  {new Intl.DateTimeFormat(
                    locale === "my" ? "my-MM" : "en-US",
                    { month: "short", day: "numeric", timeZone: "Asia/Yangon" },
                  ).format(new Date(entry.at))}
                </time>
                <div className="text-sm leading-5">
                  {t.history[entry.kind]}
                  {entry.detail && (
                    <p className="mt-1 break-words text-muted-foreground">
                      {entry.detail}
                    </p>
                  )}
                </div>
              </li>
            ))}
            {!student.id.startsWith("STU-") &&
              (student.id === "MM-2026-0150"
                ? initialEvents
                : initialEvents.filter(
                    (item) =>
                      item.key === "consultation" ||
                      (item.key === "plan" && plan.status === "confirmed"),
                  )
              ).map((entry, index) => (
                <li
                  key={index}
                  className="grid grid-cols-[3rem_minmax(0,1fr)] gap-3"
                >
                  <span className="text-xs font-semibold text-muted-foreground">
                    {new Intl.DateTimeFormat(
                      locale === "my" ? "my-MM" : "en-US",
                      { month: "short", day: "numeric", timeZone: "UTC" },
                    ).format(new Date(entry.date + "T00:00:00Z"))}
                  </span>
                  <p className="text-sm leading-5 text-foreground/80">
                    {t.initialHistory[entry.key].replace(
                      "May Zin",
                      student.name,
                    )}
                  </p>
                </li>
              ))}
          </ol>
        </CardContent>
      </Card>
    </aside>
  );
}
