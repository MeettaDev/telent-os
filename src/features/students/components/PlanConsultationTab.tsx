import type { Dictionary } from "@/common/i18n/dictionaries";
import { Text } from "@/components/ui/typography";
import { StudentTabSidebar } from "@/features/students/components/StudentTabSidebar";
import { planEvents } from "@/features/students/mocks/student-tab-data";
import type { StudentDetail } from "@/features/students/types/student";

const statusStyles = [
  "bg-muted text-muted-foreground",
  "bg-amber-100 text-amber-800",
  "bg-primary-tint text-primary-hover",
  "bg-emerald-50 text-emerald-700",
  "bg-emerald-50 text-emerald-700",
];

export function PlanConsultationTab({
  dictionary,
  student,
}: {
  dictionary: Dictionary;
  student: StudentDetail;
}) {
  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
      <section className="surface p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Text as="h2" variant="section-title">
              {dictionary.studentTabs.planHistory}
            </Text>
            <Text variant="description" className="mt-1 max-w-3xl">
              {dictionary.studentTabs.planHistoryDescription}
            </Text>
          </div>
          <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-[10px] font-semibold uppercase text-muted-foreground">
            {dictionary.studentTabs.events}
          </span>
        </div>
        <div className="mt-4">
          {planEvents.map((event, index) => (
            <div
              className="grid gap-2 border-t border-border py-3 sm:grid-cols-[4rem_minmax(0,1.5fr)_minmax(8rem,1fr)_7rem] sm:items-center"
              key={event.title}
            >
              <Text variant="caption">{event.date}</Text>
              <div>
                <Text className="font-semibold">
                  {dictionary.studentTabs[event.title]}
                </Text>
                <p className="mt-0.5 text-[10px] leading-[1.5] text-muted-foreground">
                  {dictionary.studentTabs[event.meta]}
                </p>
              </div>
              <Text variant="caption">{event.actor}</Text>
              <span
                className={`w-fit rounded-full px-3 py-1 text-[10px] font-semibold uppercase ${statusStyles[index]}`}
              >
                {dictionary.studentTabs[event.status]}
              </span>
            </div>
          ))}
        </div>
        <p className="rounded-lg bg-primary-tint px-3 py-2 text-xs leading-[1.5] text-primary-hover">
          {dictionary.studentTabs.planPolicy}
        </p>
      </section>
      <StudentTabSidebar dictionary={dictionary} student={student} />
    </div>
  );
}
