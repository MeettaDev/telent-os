"use client";
import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageSkeleton } from "@/common/components/PageSkeleton";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StudentDetailHeader } from "@/features/students/components/StudentDetailHeader";
import { StudentDetailSidebar } from "@/features/students/components/StudentDetailSidebar";
import { StudentDocuments } from "@/features/students/components/StudentDocuments";
import { StudentGoals } from "@/features/students/components/StudentGoals";
import { JourneyProgress } from "@/features/students/components/JourneyProgress";
import {
  StudentActionDialog,
  type StudentAction,
} from "@/features/students/components/StudentActionDialog";
import { useStudentsStore } from "@/features/students/stores/students-store";
import { dateLabel } from "@/features/students/lib/student-workflow";
import type { DocumentId } from "@/features/students/types/student";
import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";

export function StudentDetailView({ studentId }: { studentId: string }) {
  const { dictionary, locale } = useLocale();
  const t = dictionary.studentWorkspace;
  const store = useStudentsStore();
  const student = store.students.find((student) => student.id === studentId);
  const plan = store.plans[studentId];
  const [action, setAction] = useState<StudentAction | null>(null);
  const [requestedDoc, setRequestedDoc] = useState<DocumentId>("passport");
  if (!store.hydrated) return <PageSkeleton kind="detail" />;
  if (!student || !plan) notFound();
  const planAction = [
    "plan",
    "planSent",
    "planConfirmed",
    "planChangeRequested",
  ].includes(student.now);
  const reviewAction = ["nrc", "mofa"].includes(student.now);
  const intakeStatus =
    student.intake && student.now === "none"
      ? t.intake.statuses[student.intake.consultation.status]
      : null;
  return (
    <main id="main-content">
      <StudentDetailHeader student={student} plan={plan} onAction={setAction} />
      <div className="space-y-5 px-4 pb-10 md:px-6 xl:px-8">
        <JourneyProgress activeStage={student.journeyStep} />
        <Card className="border-primary/40 bg-primary-tint/60">
          <CardContent className="flex flex-col gap-4 px-5 py-4.5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase leading-4 text-primary-hover">
                {t.detail.now} · {t.filters[student.turn]} · {t.detail.due}{" "}
                {dateLabel(student.nextCheck, locale, t.today, t.noDate)}
                {reviewAction ? " (" + t.detail.promise + ")" : ""}
              </p>
              <h2 className="mt-1 text-lg font-bold leading-6">
                {student.now === "nrc"
                  ? t.detail.reviewTitle
                  : student.now === "custom"
                    ? student.customAction
                    : (intakeStatus ?? t.now[student.now].title)}
              </h2>
              {!intakeStatus && (
                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  {student.now === "nrc"
                    ? t.detail.reviewDetail
                    : t.now[student.now].detail}
                </p>
              )}
            </div>
            {planAction || reviewAction ? (
              <Link
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "shrink-0 text-sm",
                )}
                href={
                  "/students/" +
                  student.id +
                  (planAction ? "/plan" : "/review/legalized")
                }
              >
                {planAction ? t.detail.yourPlan : t.detail.openReview}
              </Link>
            ) : (
              <Button
                type="button"
                size="sm"
                className="shrink-0 text-sm"
                onClick={() => setAction("next")}
              >
                {t.detail.setNext}
              </Button>
            )}
          </CardContent>
        </Card>
        <div className="grid items-start gap-5 xl:grid-cols-3">
          <div className="min-w-0 space-y-5 xl:col-span-2">
            <StudentDocuments
              student={student}
              onRequest={(id) => {
                setRequestedDoc(id);
                setAction("file");
              }}
            />
            <StudentGoals />
          </div>
          <StudentDetailSidebar student={student} plan={plan} />
        </div>
      </div>
      {action && (
        <StudentActionDialog
          key={action + requestedDoc}
          student={student}
          kind={action}
          documentId={requestedDoc}
          onClose={() => setAction(null)}
        />
      )}
    </main>
  );
}
