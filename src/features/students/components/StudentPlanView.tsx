"use client";
import { useState } from "react";
import { notFound } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { WorkspacePageHeader } from "@/common/components/WorkspacePageHeader";
import { PageSkeleton } from "@/common/components/PageSkeleton";
import { universities } from "@/features/students/mocks/students-data";
import { useStudentsStore } from "@/features/students/stores/students-store";
import type { Student, StudentPlan } from "@/features/students/types/student";
import { useLocale } from "@/providers/locale-provider";

const noUniversity = "__no_university__";

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
  function commit(status: "draft" | "sent") {
    const next =
      plan.status === "changeRequested"
        ? { ...plan, version: plan.version + 1 }
        : plan;
    try {
      if (!save(student.id, next, status)) {
        setError(t.plan.sendError);
        return;
      }
      setPlan({ ...next, status, changeReason: "" });
      setError("");
      toast.success(status === "draft" ? t.plan.saved : t.plan.sent);
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
  function universityField(key: "university" | "backup") {
    const value = plan[key];
    const id = "plan-" + key;
    return (
      <div className="min-w-0 space-y-1.5">
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-muted-foreground"
        >
          {t.plan.university}
        </label>
        <Select
          value={value || noUniversity}
          onValueChange={(selected) =>
            field(key, selected === noUniversity ? "" : selected)
          }
          disabled={locked}
        >
          <SelectTrigger id={id} className="h-12 rounded-full">
            <SelectValue data-slot="select-value">
              {value || t.intake.notDecided}
            </SelectValue>
            {key === "university" && universities.includes(value) && (
              <Badge
                variant="success"
                className="shrink-0 rounded-full px-2 text-xs"
              >
                {t.plan.verified}
              </Badge>
            )}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={noUniversity}>{t.intake.notDecided}</SelectItem>
            {universities.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
  const whyLines = plan.why.split(/\r?\n/).filter(Boolean);
  return (
    <main id="main-content">
      <WorkspacePageHeader
        title={
          <span className="text-[clamp(1.375rem,3vw,1.875rem)] tracking-normal">
            {t.plan.title} · {student.name}
          </span>
        }
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <span
              role="status"
              className="mr-2 text-sm font-semibold text-muted-foreground"
            >
              {t.statuses[plan.status]}
            </span>
            {plan.status === "confirmed" ? (
              <Button
                type="button"
                className="h-11 rounded-full px-5"
                onClick={newVersion}
              >
                {t.plan.edit}
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-full border-primary px-4 text-foreground"
                  disabled={locked}
                  onClick={() => commit("draft")}
                >
                  {t.plan.save}
                </Button>
                <Button
                  type="button"
                  className="h-11 rounded-full px-6 text-lg"
                  disabled={locked}
                  onClick={() => commit("sent")}
                >
                  {t.plan.send.replace("{student}", student.name)}
                </Button>
              </>
            )}
          </div>
        }
      />
      <div className="grid items-start gap-5 px-4 pb-10 md:px-6 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)] xl:px-8">
        <div className="min-w-0 space-y-5">
          <Card className="border-0 shadow-[0_10px_20px_rgba(25,25,30,0.05)]">
            <CardHeader className="p-5 pb-4">
              <CardTitle>{t.plan.route}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
              {universityField("university")}
              <label className="min-w-0 space-y-1.5 text-sm font-semibold text-muted-foreground">
                <span className="block">{t.plan.program}</span>
                <Textarea
                  disabled={locked}
                  className="min-h-12 resize-y rounded-3xl px-4 py-3 text-foreground"
                  rows={2}
                  value={plan.program}
                  onChange={(event) => field("program", event.target.value)}
                />
              </label>
              <label className="min-w-0 space-y-1.5 text-sm font-semibold text-muted-foreground">
                <span className="block">{t.plan.schedule}</span>
                <Input
                  disabled={locked}
                  className="h-12 rounded-full text-foreground"
                  value={plan.schedule}
                  onChange={(event) => field("schedule", event.target.value)}
                />
              </label>
              <label className="min-w-0 space-y-1.5 text-sm font-semibold text-muted-foreground">
                <span className="block">{t.plan.topik}</span>
                <Input
                  disabled={locked}
                  className="h-12 rounded-full text-foreground"
                  value={plan.topik}
                  onChange={(event) => field("topik", event.target.value)}
                />
              </label>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-[0_10px_20px_rgba(25,25,30,0.05)]">
            <CardHeader className="p-5 pb-4">
              <CardTitle>{t.plan.whyTitle}</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <label className="block space-y-1.5 text-sm font-semibold text-muted-foreground">
                <span>{t.plan.why}</span>
                <Textarea
                  disabled={locked}
                  className="min-h-28 rounded-2xl border-primary text-foreground"
                  maxLength={2000}
                  value={plan.why}
                  onChange={(event) => field("why", event.target.value)}
                />
              </label>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-[0_10px_20px_rgba(25,25,30,0.05)]">
            <CardHeader className="p-5 pb-4">
              <CardTitle>{t.detail.backup}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
              {universityField("backup")}
              <label className="min-w-0 space-y-1.5 text-sm font-semibold text-muted-foreground">
                <span className="block">{t.detail.switchIf}</span>
                <Input
                  disabled={locked}
                  className="h-12 rounded-full text-foreground"
                  value={plan.switchIf}
                  onChange={(event) => field("switchIf", event.target.value)}
                />
              </label>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-[0_10px_20px_rgba(25,25,30,0.05)]">
            <CardHeader className="p-5 pb-4">
              <CardTitle>{t.plan.note}</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <label className="block space-y-1.5 text-sm font-semibold text-muted-foreground">
                <span>{t.forms.message}</span>
                <Textarea
                  disabled={locked}
                  className="min-h-14 rounded-2xl text-foreground"
                  maxLength={2000}
                  value={plan.note}
                  onChange={(event) => field("note", event.target.value)}
                />
              </label>
            </CardContent>
          </Card>
          {plan.changeReason && (
            <p
              role="status"
              className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
            >
              {t.plan.requestChange}: {plan.changeReason}
            </p>
          )}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
        <aside className="min-w-0">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            {t.plan.previewTitle}
          </h2>
          <div className="space-y-3 rounded-[2rem] border border-input p-4">
            <h3 className="mb-4 text-2xl font-bold">{t.plan.title}</h3>
            <Card className="gap-2 border-0 p-4">
              <Badge
                variant={plan.status === "confirmed" ? "success" : "tint"}
                className="rounded-full text-xs"
              >
                {plan.status === "confirmed"
                  ? t.statuses.confirmed
                  : plan.status === "changeRequested"
                    ? t.statuses.changeRequested
                    : t.plan.toConfirm}
              </Badge>
              <h4 className="text-lg font-bold wrap-anywhere">
                {plan.university || "—"}
              </h4>
              <p className="text-sm leading-5 text-muted-foreground wrap-anywhere">
                {plan.program}
              </p>
              <p className="text-sm leading-5 font-semibold wrap-anywhere">
                {plan.schedule} · {t.detail.topik} {plan.topik}
              </p>
            </Card>
            <Card className="border-0 p-4">
              <h4 className="text-xs font-bold uppercase text-primary">
                {t.plan.whyRoute}
              </h4>
              <ul className="mt-2 list-disc space-y-2 pl-4 text-sm leading-5">
                {whyLines.map((line, index) => (
                  <li key={index}>{line.replace(/^[•*-]\s*/, "")}</li>
                ))}
              </ul>
            </Card>
            <Card className="border-0 p-4">
              <p className="text-sm text-muted-foreground">{t.detail.backup}</p>
              <p className="font-semibold wrap-anywhere">
                {plan.backup || "—"}
              </p>
            </Card>
            <Button
              type="button"
              className="h-auto min-h-11 w-full rounded-full px-4 py-2 text-lg whitespace-normal"
            >
              {plan.status === "confirmed" ? t.plan.confirmed : t.plan.confirm}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-auto min-h-10 w-full rounded-full border-primary px-4 py-2 text-foreground whitespace-normal"
            >
              {t.plan.requestChange}
            </Button>
          </div>
        </aside>
      </div>
    </main>
  );
}
