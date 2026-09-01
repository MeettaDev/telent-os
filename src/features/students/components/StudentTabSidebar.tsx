import { ChevronRight } from "lucide-react";

import type { Dictionary } from "@/common/i18n/dictionaries";
import { Text } from "@/components/ui/typography";
import type { StudentDetail } from "@/features/students/types/student";

export function StudentTabSidebar({
  dictionary,
  showPlan = true,
  student,
}: {
  dictionary: Dictionary;
  showPlan?: boolean;
  student: StudentDetail;
}) {
  return (
    <div className="grid content-start gap-5">
      {showPlan && (
        <section className="surface p-5">
          <div className="flex items-center justify-between">
            <Text as="h2" variant="card-title">
              {dictionary.studentDetail.publishedPlan}
            </Text>
            <span className="rounded-full bg-primary-tint px-2 py-1 text-[10px] font-semibold uppercase text-primary-hover">
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
      )}
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
    </div>
  );
}
