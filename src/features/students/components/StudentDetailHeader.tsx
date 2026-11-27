"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WorkspacePageHeader } from "@/common/components/WorkspacePageHeader";
import { useStudentsStore } from "@/features/students/stores/students-store";
import type { Student } from "@/features/students/types/student";
import type { StudentAction } from "@/features/students/components/StudentActionDialog";
import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";
import { NextActionPopover } from "./NextActionPopover";

export function StudentDetailHeader({
  student,
  onAction,
}: {
  student: Student;
  onAction: (action: StudentAction) => void;
}) {
  const { dictionary, locale } = useLocale();
  const t = dictionary.studentWorkspace;
  const copy = t.consultation;
  const consultation =
    student.journeyStep === 1 ? student.intake?.consultation : undefined;
  const created = useStudentsStore((state) =>
    state.history[student.id]?.find((entry) => entry.kind === "studentAdded"),
  );
  const date = created && new Date(created.at);
  const createLabel =
    consultation && created?.author && date && !Number.isNaN(date.getTime())
      ? copy.addedBy
          .replace("{author}", created.author)
          .replace(
            "{date}",
            new Intl.DateTimeFormat(locale === "my" ? "my-MM" : "en-US", {
              month: "short",
              day: "numeric",
              timeZone: "Asia/Yangon",
            }).format(date),
          )
      : "";
  const phone = consultation
    ? student.phone.replace(
        /(\+95[ -]?9|09|၀၉)(?:[ -]?[0-9၀-၉]){3}[ -]?/,
        "$1 ••• ",
      )
    : student.phone;
  const planToWrite =
    consultation?.status === "completed" && student.now === "plan";
  return (
    <WorkspacePageHeader
      title={
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-[clamp(1.5rem,3vw,1.875rem)] tracking-normal">
            {student.name}
          </span>
          {consultation && (
            <Badge
              variant={
                planToWrite
                  ? "warning"
                  : consultation.status === "scheduled"
                    ? "tint"
                    : "secondary"
              }
              className="rounded-full text-xs tracking-normal"
            >
              {planToWrite
                ? copy.planToWrite
                : consultation.status === "inquiry"
                  ? copy.inquiry
                  : consultation.status === "scheduled"
                    ? dictionary.inboxWorkspace.callBooking.booked
                    : t.intake.statuses[consultation.status]}
            </Badge>
          )}
        </span>
      }
      avatar={
        <span
          aria-hidden="true"
          className={cn(
            "mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full text-xl font-semibold text-primary-foreground sm:size-14 sm:text-2xl",
            consultation ? "bg-violet-600" : "bg-primary",
          )}
        >
          {student.initials}
        </span>
      }
      actions={
        <>
          <Button
            type="button"
            size="sm"
            className="h-11 rounded-full border-primary px-4 text-sm text-foreground"
            variant="outline"
            onClick={() => onAction("message")}
          >
            {t.detail.message}
          </Button>
          {!consultation && (
            <Button
              type="button"
              size="sm"
              className="h-11 rounded-full border-primary px-4 text-sm text-foreground"
              variant="outline"
              onClick={() => onAction("file")}
            >
              {t.detail.askFile}
            </Button>
          )}
          <NextActionPopover student={student} />
        </>
      }
    >
      <p className="mt-2 text-xs font-semibold text-muted-foreground">
        {student.phone
          ? `${t.intake.channels[student.intake?.contactChannel ?? "viber"]} ${phone}`
          : t.contacts[student.contact]}
        {createLabel && " · " + createLabel}
      </p>
    </WorkspacePageHeader>
  );
}
