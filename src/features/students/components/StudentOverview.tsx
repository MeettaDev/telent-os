import { ChevronRight } from "lucide-react";

import type { Dictionary } from "@/common/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import type { StudentDetail } from "@/features/students/types/student";

export function StudentOverview({
  dictionary,
  student,
}: {
  dictionary: Dictionary;
  student: StudentDetail;
}) {
  const supportSteps = [
    [
      dictionary.studentDetail.documentReview,
      dictionary.studentDetail.inProgress,
      student.owner ?? "—",
      dictionary.students.today,
    ],
    [
      dictionary.studentDetail.universityCheck,
      dictionary.studentDetail.available,
      dictionary.students.notClaimed,
      "Sep 05",
    ],
    [
      dictionary.studentDetail.visaChecklist,
      dictionary.studentDetail.locked,
      "—",
      dictionary.studentDetail.afterAdmission,
    ],
  ];

  return (
    <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
      <div className="grid gap-5">
        <section className="rounded-2xl border border-amber-300 bg-amber-50/70 p-5 dark:bg-amber-950/20">
          <div className="flex items-center justify-between gap-4">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-semibold uppercase text-amber-800">
              {dictionary.studentDetail.inReview}
            </span>
            <Text
              variant="caption"
              className="font-semibold uppercase text-amber-800"
            >
              {dictionary.studentDetail.reviewSla}
            </Text>
          </div>
          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Text as="h2" variant="section-title">
                {dictionary.studentDetail.reviewTitle}
              </Text>
              <Text variant="description" className="mt-1">
                {dictionary.studentDetail.reviewDescription}
              </Text>
            </div>
            <Button className="shrink-0" variant="app-primary">
              {dictionary.studentDetail.openWorkbench}
            </Button>
          </div>
        </section>
        <section className="surface p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Text as="h2" variant="section-title">
                {dictionary.studentDetail.selectedSupport}
              </Text>
              <Text variant="description" className="mt-1">
                {dictionary.studentDetail.supportDescription}
              </Text>
            </div>
            <span className="shrink-0 rounded-full bg-primary-tint px-3 py-1 text-xs font-semibold text-primary-hover">
              {dictionary.studentDetail.activeSteps}
            </span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[38rem] text-left text-sm">
              <tbody>
                {supportSteps.map(([step, status, owner, due], index) => (
                  <tr className="border-t border-border" key={step}>
                    <th className="py-3 font-semibold">{step}</th>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${index === 0 ? "bg-amber-100 text-amber-800" : index === 1 ? "bg-primary-tint text-primary-hover" : "bg-muted text-muted-foreground"}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="py-3 text-muted-foreground">{owner}</td>
                    <td className="py-3 font-medium">{due}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      <aside className="grid gap-5">
        <section className="surface p-5">
          <div className="flex items-center justify-between">
            <Text as="h2" variant="card-title">
              {dictionary.studentDetail.publishedPlan}
            </Text>
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase text-emerald-700">
              {dictionary.studentDetail.version}
            </span>
          </div>
          <Text className="mt-4 font-semibold text-primary-hover">
            {student.plan}
          </Text>
          <Text className="mt-1 font-semibold">{student.university}</Text>
          <Text variant="caption" className="mt-1">
            {student.program} · {student.intake}
          </Text>
          <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
            <Text variant="caption">
              {dictionary.studentDetail.published} {student.publishedAt}
            </Text>
            <button
              className="flex cursor-pointer items-center text-xs font-semibold text-primary-hover"
              type="button"
            >
              {dictionary.studentDetail.viewPlan}
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </section>
        <section className="surface p-5">
          <Text as="h2" variant="card-title">
            {dictionary.studentDetail.caseTeam}
          </Text>
          <div className="mt-4 flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary-tint text-xs font-semibold text-primary-hover">
              MZ
            </span>
            <div className="min-w-0 flex-1">
              <Text className="font-semibold">May Zin · Counselor</Text>
              <Text variant="caption">
                {dictionary.studentDetail.reviewer} ·{" "}
                {student.owner ?? dictionary.studentDetail.none}
              </Text>
            </div>
            <button
              className="cursor-pointer text-xs font-semibold uppercase text-primary-hover"
              type="button"
            >
              {dictionary.studentDetail.view}
            </button>
          </div>
        </section>
        <section className="surface p-5">
          <Text as="h2" variant="card-title">
            {dictionary.studentDetail.keyDeadlines}
          </Text>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt>{dictionary.studentDetail.reviewerDecision}</dt>
              <dd className="font-semibold text-destructive">
                {student.dueTime}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>{dictionary.studentDetail.universityApplication}</dt>
              <dd className="font-semibold">{student.officialDeadline}</dd>
            </div>
          </dl>
        </section>
      </aside>
    </div>
  );
}
