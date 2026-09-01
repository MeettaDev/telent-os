import { Check, X } from "lucide-react";

import type { Dictionary } from "@/common/i18n/dictionaries";
import { Text } from "@/components/ui/typography";
import { StudentTabSidebar } from "@/features/students/components/StudentTabSidebar";
import { processMilestones } from "@/features/students/mocks/student-tab-data";
import type { StudentDetail } from "@/features/students/types/student";

const statusStyles = [
  "bg-amber-100 text-amber-800",
  "bg-emerald-50 text-emerald-700",
  "bg-emerald-50 text-emerald-700",
  "bg-primary-tint text-primary-hover",
  "bg-muted text-muted-foreground",
];

export function ProcessTab({
  dictionary,
  student,
}: {
  dictionary: Dictionary;
  student: StudentDetail;
}) {
  const criteria = [
    "holderVisible",
    "balanceVisible",
    "statementRecent",
    "pageSharp",
    "minimumBalance",
  ] as const;

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
      <section className="surface p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Text as="h2" variant="section-title">
              {dictionary.studentTabs.milestones}
            </Text>
            <Text variant="description" className="mt-1 max-w-3xl">
              {dictionary.studentTabs.milestonesDescription}
            </Text>
          </div>
          <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-semibold uppercase text-amber-800">
            {dictionary.studentTabs.oneInReview}
          </span>
        </div>
        <div className="mt-4">
          {processMilestones.map((item, index) => (
            <div
              className="grid gap-2 border-t border-border py-3 sm:grid-cols-[minmax(0,1.7fr)_8rem_minmax(6rem,1fr)_8rem] sm:items-center"
              key={item.title}
            >
              <div>
                <Text className="font-semibold">
                  {dictionary.studentTabs[item.title]}
                </Text>
                <p className="mt-0.5 text-[10px] leading-[1.5] text-muted-foreground">
                  {dictionary.studentTabs[item.meta]}
                </p>
              </div>
              <span
                className={`w-fit rounded-full px-3 py-1 text-[10px] font-semibold uppercase ${statusStyles[index]}`}
              >
                {dictionary.studentTabs[item.status]}
              </span>
              <Text variant="caption">
                {item.owner === "notClaimed"
                  ? dictionary.studentTabs.notClaimed
                  : item.owner}
              </Text>
              <Text className="font-medium">
                {item.due === "todayAtFour" || item.due === "afterAdmission"
                  ? dictionary.studentTabs[item.due]
                  : item.due}
              </Text>
            </div>
          ))}
        </div>
        <p className="rounded-lg bg-primary-tint px-3 py-2 text-xs leading-[1.5] text-primary-hover">
          {dictionary.studentTabs.processPolicy}
        </p>
      </section>
      <aside className="grid content-start gap-5">
        <section className="surface p-5">
          <div className="flex items-center justify-between gap-3">
            <Text as="h2" variant="card-title">
              {dictionary.studentTabs.acceptanceCriteria}
            </Text>
            <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-semibold uppercase text-red-700">
              {dictionary.studentTabs.criteriaSummary}
            </span>
          </div>
          <ul className="mt-4 space-y-2">
            {criteria.map((key, index) => (
              <li
                className={`flex gap-2 text-sm leading-[1.5] ${index === 3 ? "text-destructive" : index === 4 ? "text-amber-700" : "text-foreground"}`}
                key={key}
              >
                {index === 3 ? (
                  <X className="mt-0.5 size-4 shrink-0" />
                ) : index === 4 ? (
                  <span className="w-4 text-center">–</span>
                ) : (
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                )}
                {dictionary.studentTabs[key]}
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-lg bg-primary-tint px-3 py-2 text-[11px] leading-[1.5] text-primary-hover">
            {dictionary.studentTabs.criteriaPolicy}
          </p>
        </section>
        <StudentTabSidebar
          dictionary={dictionary}
          showPlan={false}
          student={student}
        />
      </aside>
    </div>
  );
}
