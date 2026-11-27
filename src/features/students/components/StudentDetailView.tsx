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
import { StudentConsultation } from "@/features/students/components/StudentConsultation";
import { JourneyProgress } from "@/features/students/components/JourneyProgress";
import {
  StudentActionDialog,
  type StudentAction,
} from "@/features/students/components/StudentActionDialog";
import { useStudentsStore } from "@/features/students/stores/students-store";
import type { DocumentId } from "@/features/students/types/student";
import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";

export function StudentDetailView({ studentId }: { studentId: string }) {
  const { dictionary } = useLocale();
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
  function requestDocument(id: DocumentId) {
    setRequestedDoc(id);
    setAction("file");
  }
  return (
    <main id="main-content">
      <StudentDetailHeader student={student} onAction={setAction} />
      {student.intake && student.journeyStep === 1 ? (
        <StudentConsultation
          key={student.id}
          student={{ ...student, intake: student.intake }}
          plan={plan}
          onRequest={requestDocument}
        />
      ) : (
        <div className="space-y-5 px-4 pb-10 md:px-6 xl:px-8">
          <JourneyProgress activeStage={student.journeyStep} />
          <Card className="border-0 bg-primary-tint">
            <CardContent className="flex flex-col gap-4 px-5 py-4.5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-bold leading-6">
                  {student.now === "nrc"
                    ? t.detail.reviewHeading
                    : student.now === "custom"
                      ? student.customAction
                      : (intakeStatus ?? t.now[student.now].title)}
                </h2>
              </div>
              {planAction || reviewAction ? (
                <Link
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" }),
                    "h-11 shrink-0 rounded-full px-6 text-lg",
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
                  className="h-11 shrink-0 rounded-full px-6 text-lg"
                  onClick={() => setAction("next")}
                >
                  {t.detail.setNext}
                </Button>
              )}
            </CardContent>
          </Card>
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.92fr)_minmax(0,1fr)]">
            <div className="min-w-0 space-y-5">
              <StudentDocuments student={student} onRequest={requestDocument} />
            </div>
            <StudentDetailSidebar student={student} plan={plan} />
          </div>
        </div>
      )}
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
