"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkspacePageHeader } from "@/common/components/WorkspacePageHeader";
import type { Student, StudentPlan } from "@/features/students/types/student";
import type { StudentAction } from "@/features/students/components/StudentActionDialog";
import { useLocale } from "@/providers/locale-provider";
import { useStudentsStore } from "@/features/students/stores/students-store";

export function StudentDetailHeader({
  student,
  plan,
  onAction,
}: {
  student: Student;
  plan: StudentPlan;
  onAction: (action: StudentAction) => void;
}) {
  const { dictionary } = useLocale();
  const t = dictionary.studentWorkspace;
  const history = useStudentsStore((state) => state.history[student.id]);
  const confirmed = history?.some((entry) => entry.kind === "planConfirmed");
  return (
    <WorkspacePageHeader
      title={student.name}
      avatar={
        <span
          aria-hidden="true"
          className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-tint text-xl font-semibold text-primary-hover sm:size-14 sm:text-2xl"
        >
          {student.initials}
        </span>
      }
      breadcrumbs={[
        { label: t.breadcrumb, href: "/students" },
        { label: student.name },
      ]}
      actions={
        <>
          <Button
            type="button"
            size="sm"
            className="text-sm"
            variant="outline"
            onClick={() => onAction("message")}
          >
            {t.detail.message}
          </Button>
          <Button
            type="button"
            size="sm"
            className="text-sm"
            variant="outline"
            onClick={() => onAction("file")}
          >
            {t.detail.askFile}
          </Button>
          <Button
            type="button"
            size="sm"
            className="text-sm"
            onClick={() => onAction("next")}
          >
            {t.detail.setNext}
          </Button>
        </>
      }
    >
      <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
        <Badge
          variant={plan.status === "confirmed" ? "success" : "tint"}
          className="whitespace-nowrap px-2 text-sm leading-4"
        >
          {t.detail.planBadge
            .replace("{version}", String(plan.version))
            .replace(
              "{status}",
              plan.status === "confirmed" && !confirmed
                ? t.detail.confirmedDate
                : t.statuses[plan.status],
            )}
        </Badge>
        <Badge
          variant="tint"
          className="whitespace-nowrap px-2 text-sm leading-4"
        >
          {t.contacts[student.contact]}
        </Badge>
        <Badge
          variant="purple"
          className="whitespace-nowrap px-2 text-sm leading-4"
        >
          {t.detail.studyOn}
        </Badge>
        {student.phone && (
          <Badge
            variant="secondary"
            className="whitespace-nowrap px-2 text-sm leading-4"
          >
            {t.intake.channels[student.intake?.contactChannel ?? "viber"]}{" "}
            {student.phone}
          </Badge>
        )}
      </div>
    </WorkspacePageHeader>
  );
}
