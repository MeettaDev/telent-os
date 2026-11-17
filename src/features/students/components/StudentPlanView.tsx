"use client";
import { useState } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WorkspacePageHeader } from "@/common/components/WorkspacePageHeader";
import { PageSkeleton } from "@/common/components/PageSkeleton";
import { universities } from "@/features/students/mocks/students-data";
import { useStudentsStore } from "@/features/students/stores/students-store";
import type { Student, StudentPlan } from "@/features/students/types/student";
import { useLocale } from "@/providers/locale-provider";

export function StudentPlanView({ studentId }: { studentId: string }) {
  const hydrated = useStudentsStore((state) => state.hydrated);
  const student = useStudentsStore((state) =>
    state.students.find((student) => student.id === studentId),
  );
  const plan = useStudentsStore((state) => state.plans[studentId]);
  if (!hydrated) return <PageSkeleton kind="form" />;
  if (!student || !plan) notFound();
  return <PlanEditor key={studentId} student={student} initialPlan={plan} />;
}

function PlanEditor({
  student,
  initialPlan,
}: {
  student: Student;
  initialPlan: StudentPlan;
}) {
  const { dictionary } = useLocale();
  const t = dictionary.studentWorkspace;
  const save = useStudentsStore((state) => state.savePlan);
  const [plan, setPlan] = useState<StudentPlan>({
    ...initialPlan,
    why: initialPlan.why || t.plan.defaultWhy,
    switchIf: initialPlan.switchIf || t.plan.defaultSwitch,
    note: initialPlan.note || t.plan.defaultNote,
  });
  const [error, setError] = useState("");
  const [changing, setChanging] = useState(false);
  const [changeReason, setChangeReason] = useState("");
  const locked = plan.status === "sent" || plan.status === "confirmed";
  function field(
    key: keyof Pick<
      StudentPlan,
      | "university"
      | "program"
      | "schedule"
      | "topik"
      | "why"
      | "backup"
      | "switchIf"
      | "note"
    >,
    value: string,
  ) {
    setPlan((current) => ({ ...current, [key]: value }));
    setError("");
  }
  function commit(status: StudentPlan["status"], reason = "") {
    const next =
      plan.status === "changeRequested" &&
      (status === "draft" || status === "sent")
        ? { ...plan, version: plan.version + 1 }
        : plan;
    try {
      if (!save(student.id, next, status, reason)) {
        setError(
          status === "changeRequested" ? t.plan.changeError : t.plan.sendError,
        );
        return;
      }
      setPlan({ ...next, status, changeReason: reason });
      setError("");
      setChanging(false);
      toast.success(
        status === "draft"
          ? t.plan.saved
          : status === "sent"
            ? t.plan.sent
            : status === "confirmed"
              ? t.plan.confirmed
              : t.plan.changeRequested,
      );
    } catch {
      setError(t.saveError);
    }
  }
  function newVersion() {
    const next = {
      ...plan,
      status: "draft" as const,
      version: plan.version + 1,
      changeReason: "",
    };
    try {
      if (save(student.id, next, "draft")) {
        setPlan(next);
        setError("");
        toast.success(t.plan.saved);
      }
    } catch {
      setError(t.saveError);
    }
  }
  const whyLines = plan.why.split(/\r?\n/).filter(Boolean);
  return (
    <main id="main-content">
      <WorkspacePageHeader
        title={
          t.plan.title + " · v" + plan.version + " " + t.statuses[plan.status]
        }
        description={t.plan.description}
        breadcrumbs={[
          { label: t.breadcrumb, href: "/students" },
          { label: student.name, href: "/students/" + student.id },
          { label: t.plan.title },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
            <Badge variant={plan.status === "draft" ? "tint" : "secondary"}>
              {t.statuses.draft}
            </Badge>
            <ArrowRight aria-hidden="true" className="size-4" />
            <Badge variant={plan.status === "sent" ? "tint" : "secondary"}>
              {t.statuses.sent}
            </Badge>
            <ArrowRight aria-hidden="true" className="size-4" />
            <Badge
              variant={
                plan.status === "confirmed"
                  ? "success"
                  : plan.status === "changeRequested"
                    ? "warning"
                    : "secondary"
              }
            >
              {plan.status === "confirmed" || plan.status === "changeRequested"
                ? t.statuses[plan.status]
                : t.plan.finalStatus}
            </Badge>
          </div>
        }
      />
      <div className="grid items-start gap-5 px-4 pb-10 md:px-6 xl:grid-cols-3 xl:px-8">
        <div className="min-w-0 space-y-5 xl:col-span-2">
          <Card>
            <CardHeader className="flex-row flex-wrap items-center justify-between gap-2">
              <CardTitle>{t.plan.route}</CardTitle>
              <span className="text-xs font-semibold text-muted-foreground">
                {t.plan.fromUniversity}
              </span>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-semibold leading-5">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>{t.plan.university}</span>
                  {universities.includes(plan.university) && (
                    <Badge variant="success" className="px-2 py-0 text-xs">
                      {t.plan.verified}
                    </Badge>
                  )}
                </span>
                <Input
                  list="plan-universities"
                  disabled={locked}
                  value={plan.university}
                  onChange={(event) => field("university", event.target.value)}
                  className="px-3 sm:text-sm"
                />
                <datalist id="plan-universities">
                  {universities.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold leading-5">
                <span>{t.plan.program}</span>
                <Input
                  disabled={locked}
                  className="px-3 sm:text-sm"
                  value={plan.program}
                  onChange={(event) => field("program", event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold leading-5">
                <span>{t.plan.schedule}</span>
                <Input
                  disabled={locked}
                  className="px-3 sm:text-sm"
                  value={plan.schedule}
                  onChange={(event) => field("schedule", event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold leading-5">
                <span>{t.plan.topik}</span>
                <Input
                  disabled={locked}
                  className="px-3 sm:text-sm"
                  value={plan.topik}
                  onChange={(event) => field("topik", event.target.value)}
                />
              </label>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row flex-wrap items-center justify-between gap-2">
              <CardTitle>{t.plan.whyTitle}</CardTitle>
              <span className="text-xs font-semibold text-muted-foreground">
                {t.plan.studentReads}
              </span>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex flex-col gap-1.5 text-sm font-semibold leading-5">
                <span>{t.plan.why}</span>
                <Textarea
                  disabled={locked}
                  className="px-3 py-2 leading-5 sm:text-sm"
                  maxLength={2000}
                  value={plan.why}
                  onChange={(event) => field("why", event.target.value)}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-sm font-semibold leading-5">
                  <span>{t.plan.backup}</span>
                  <Input
                    disabled={locked}
                    className="px-3 sm:text-sm"
                    value={plan.backup}
                    onChange={(event) => field("backup", event.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-semibold leading-5">
                  <span>{t.plan.switchIf}</span>
                  <Input
                    disabled={locked}
                    className="px-3 sm:text-sm"
                    value={plan.switchIf}
                    onChange={(event) => field("switchIf", event.target.value)}
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1.5 text-sm font-semibold leading-5">
                <span>{t.plan.note}</span>
                <Textarea
                  disabled={locked}
                  className="min-h-20 px-3 py-2 leading-5 sm:text-sm"
                  maxLength={2000}
                  value={plan.note}
                  onChange={(event) => field("note", event.target.value)}
                />
              </label>
              {plan.changeReason && (
                <p
                  role="status"
                  className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                >
                  {t.plan.requestChange}: {plan.changeReason}
                </p>
              )}
            </CardContent>
          </Card>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            {plan.status === "confirmed" ? (
              <Button
                type="button"
                size="sm"
                className="text-sm"
                onClick={newVersion}
              >
                {t.plan.edit}
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-sm"
                  disabled={locked}
                  onClick={() => commit("draft")}
                >
                  {t.plan.save}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="h-auto min-h-9 whitespace-normal py-2 text-sm"
                  disabled={locked}
                  onClick={() => commit("sent")}
                >
                  {t.plan.send.replace("{student}", student.name)}
                </Button>
              </>
            )}
          </div>
        </div>
        <aside className="min-w-0">
          <h2 className="mb-3 text-xs font-bold uppercase text-primary-hover">
            {t.plan.previewTitle}
          </h2>
          <div className="rounded-4xl border-6 border-foreground bg-card p-4 sm:p-6">
            <p className="mb-3 flex items-center gap-1 text-sm font-semibold text-primary-hover">
              <ArrowLeft aria-hidden="true" className="size-4" />
              {t.plan.consultation}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold leading-6">
                {t.plan.title}
              </h3>
              <Badge variant={plan.status === "confirmed" ? "success" : "tint"}>
                {plan.status === "confirmed"
                  ? t.statuses.confirmed
                  : plan.status === "changeRequested"
                    ? t.statuses.changeRequested
                    : t.plan.toConfirm}
              </Badge>
            </div>
            <div className="mt-3 rounded-xl bg-primary-tint/70 p-3">
              <h4 className="text-sm font-semibold leading-5">
                {plan.university || "—"}
              </h4>
              <p className="mt-2 text-xs leading-4.5 text-muted-foreground">
                {plan.program}
              </p>
              <p className="mt-1 text-xs font-semibold leading-4.5 text-primary-hover">
                {plan.schedule} · TOPIK {plan.topik}
              </p>
            </div>
            <h4 className="mt-4 text-xs font-bold uppercase text-primary-hover">
              {t.plan.whyRoute}
            </h4>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-5 text-foreground/80">
              {whyLines.map((line, index) => (
                <li key={index}>{line.replace(/^[•*-]\s*/, "")}</li>
              ))}
            </ul>
            <p className="mt-3 text-sm leading-5 text-muted-foreground">
              {t.detail.backup}: {plan.backup} · {plan.switchIf}
            </p>
            {plan.note && <p className="mt-3 text-sm leading-5">{plan.note}</p>}
            <Button
              type="button"
              disabled={plan.status !== "sent"}
              className="mt-4 h-auto min-h-9 w-full whitespace-normal px-3 py-2 text-sm leading-5"
              onClick={() => commit("confirmed")}
            >
              {plan.status === "confirmed" ? t.plan.confirmed : t.plan.confirm}
            </Button>
            <Button
              type="button"
              disabled={plan.status !== "sent"}
              variant="app-text"
              className="mt-2 h-auto p-0 text-sm text-primary-hover"
              onClick={() => {
                setChangeReason("");
                setChanging(true);
              }}
            >
              {t.plan.requestChange}
            </Button>
            {plan.status === "draft" && (
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {t.plan.sendFirst}
              </p>
            )}
          </div>
        </aside>
      </div>
      {changing && (
        <Dialog open onOpenChange={setChanging}>
          <DialogContent closeLabel={t.close}>
            <DialogTitle className="pr-6 text-xl font-semibold">
              {t.plan.requestChange}
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-muted-foreground">
              {student.name}
            </DialogDescription>
            <form
              className="mt-4 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (!changeReason.trim()) {
                  setError(t.plan.changeError);
                  return;
                }
                commit("changeRequested", changeReason.trim());
              }}
            >
              <label className="block space-y-2 text-sm font-semibold">
                <span>{t.forms.changeReason}</span>
                <Textarea
                  required
                  maxLength={2000}
                  autoFocus
                  value={changeReason}
                  onChange={(event) => setChangeReason(event.target.value)}
                />
              </label>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setChanging(false)}
                >
                  {t.cancel}
                </Button>
                <Button type="submit">{t.forms.submitChange}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
}
