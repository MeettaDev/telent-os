"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { inboxThreads, isWaiting } from "@/features/inbox/mocks/inbox-data";
import { OwnerAvatar } from "@/features/students/components/StudentStatus";
import { useStudentsStore } from "@/features/students/stores/students-store";
import type { Student, StudentPlan } from "@/features/students/types/student";
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
  const messages = useStudentsStore((state) => state.messages[student.id]);
  const waiting = useStudentsStore((state) =>
    isWaiting(student.id, state.messages),
  );
  const history = useStudentsStore((state) => state.history[student.id]);
  const latest = messages?.at(-1);
  const intake = student.intake;
  const copy = t.intake;
  const consultation = intake?.consultation;
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
              [copy.outcome, consultation.outcome],
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
        intake.note,
      ],
      [copy.separateReason, intake.separateReason],
    ];
  const thread = inboxThreads.find(({ id }) => id === student.id);
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
        <Card>
          <CardHeader>
            <CardTitle>{t.stages.consultation}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="divide-y">
              {intakeFields
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div
                    key={label}
                    className="grid grid-cols-3 gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <dt className="text-xs font-semibold text-muted-foreground">
                      {label}
                    </dt>
                    <dd className="col-span-2 break-words text-sm">{value}</dd>
                  </div>
                ))}
            </dl>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-2">
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
        <CardContent>
          <dl className="divide-y">
            {fields.map(([label, value]) => (
              <div
                key={label}
                className="grid grid-cols-3 gap-3 py-3 first:pt-0 last:pb-0"
              >
                <dt className="text-xs font-semibold uppercase text-primary-hover">
                  {label}
                </dt>
                <dd
                  className={cn(
                    "col-span-2 break-words text-sm leading-5",
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
      <Card>
        <CardHeader>
          <CardTitle>{t.detail.people}</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {(
            [
              { owner: "H", name: "Hsu Wai", role: t.detail.caseOwner },
              { owner: "N", name: "Nway Nway", role: t.detail.reviewer },
            ] as const
          ).map((person) => (
            <div
              key={person.owner}
              className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
            >
              <OwnerAvatar owner={person.owner} />
              <div>
                <h3 className="font-semibold">{person.name}</h3>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  {person.role}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-2">
          <CardTitle>{t.detail.chat}</CardTitle>
          {waiting && <Badge variant="tint">{t.detail.unread}</Badge>}
        </CardHeader>
        <CardContent>
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="whitespace-pre-wrap break-words text-sm leading-5">
              {latest?.text ??
                (thread
                  ? dictionary.inboxWorkspace.incoming[thread.key]
                  : t.detail.noMessages)}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {latest?.author ?? student.name} · {t.detail.chatMeta}
            </p>
          </div>
          <Link
            href={"/inbox?student=" + encodeURIComponent(student.id)}
            className="mt-3 inline-block rounded-sm text-sm font-semibold text-primary-hover hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t.detail.openConversation} ›
          </Link>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex-row flex-wrap justify-between gap-2">
          <CardTitle>{t.detail.services}</CardTitle>
          <span className="text-xs font-semibold text-muted-foreground">
            {t.detail.paidOutside}
          </span>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            {[
              [t.detail.asked, t.detail.serviceRequest],
              [t.detail.status, t.detail.serviceStatus],
            ].map(([label, value]) => (
              <div
                key={label}
                className="grid grid-cols-3 gap-3 py-3 first:pt-0 last:pb-0"
              >
                <dt className="text-xs font-semibold uppercase text-primary-hover">
                  {label}
                </dt>
                <dd className="col-span-2 text-sm leading-5">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex-row flex-wrap justify-between gap-2">
          <CardTitle>{t.detail.history}</CardTitle>
          <span className="text-xs font-semibold text-muted-foreground">
            {t.detail.historyNote}
          </span>
        </CardHeader>
        <CardContent>
          <ol className="divide-y">
            {(history ?? []).map((entry) => (
              <li
                key={entry.id}
                className="grid grid-cols-4 gap-3 py-3 first:pt-0"
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
                <div className="col-span-3 text-sm leading-5">
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
                  className="grid grid-cols-4 gap-3 py-3 first:pt-0"
                >
                  <span className="text-xs font-semibold text-muted-foreground">
                    {new Intl.DateTimeFormat(
                      locale === "my" ? "my-MM" : "en-US",
                      { month: "short", day: "numeric", timeZone: "UTC" },
                    ).format(new Date(entry.date + "T00:00:00Z"))}
                  </span>
                  <p className="col-span-3 text-sm leading-5 text-foreground/80">
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
