import type { Dictionary } from "@/common/i18n/dictionaries";
import { Text } from "@/components/ui/typography";
import { StudentTabSidebar } from "@/features/students/components/StudentTabSidebar";
import {
  activityEvents,
  studentFiles,
} from "@/features/students/mocks/student-tab-data";
import type { StudentDetail } from "@/features/students/types/student";

const actorStyles = [
  "bg-primary-tint text-primary-hover",
  "bg-red-50 text-red-700",
  "bg-emerald-50 text-emerald-700",
  "bg-emerald-50 text-emerald-700",
  "bg-muted text-muted-foreground",
];

export function FilesActivityTab({
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
              {dictionary.studentTabs.activityTimeline}
            </Text>
            <Text variant="description" className="mt-1 max-w-3xl">
              {dictionary.studentTabs.activityDescription}
            </Text>
          </div>
          <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-[10px] font-semibold uppercase text-muted-foreground">
            {dictionary.studentTabs.immutable}
          </span>
        </div>
        <div className="mt-4">
          {activityEvents.map((event, index) => (
            <div
              className="grid gap-2 border-t border-border py-3 sm:grid-cols-[6.5rem_minmax(0,1fr)_7rem] sm:items-center"
              key={event.title}
            >
              <Text variant="caption">{event.date}</Text>
              <div>
                <Text>{dictionary.studentTabs[event.title]}</Text>
                <p className="mt-0.5 text-[10px] leading-[1.5] text-muted-foreground">
                  {dictionary.studentTabs[event.meta]}
                </p>
              </div>
              <span
                className={`w-fit rounded-full px-3 py-1 text-[10px] font-semibold uppercase ${actorStyles[index]}`}
              >
                {dictionary.studentTabs[event.actor]}
              </span>
            </div>
          ))}
        </div>
        <p className="rounded-lg bg-primary-tint px-3 py-2 text-xs leading-[1.5] text-primary-hover">
          {dictionary.studentTabs.activityPolicy}
        </p>
      </section>
      <aside className="grid content-start gap-5">
        <section className="surface p-5">
          <div className="flex items-center justify-between">
            <Text as="h2" variant="card-title">
              {dictionary.studentTabs.files}
            </Text>
            <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground">
              {dictionary.studentTabs.versions}
            </span>
          </div>
          <div className="mt-3">
            {studentFiles.map((file) => (
              <div
                className="flex items-center justify-between gap-3 border-t border-border py-2 first:border-0"
                key={file.name}
              >
                <div className="min-w-0">
                  <Text className="truncate font-semibold">{file.name}</Text>
                  <Text variant="caption">{file.meta}</Text>
                </div>
                {file.status && (
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${file.status === "current" ? "bg-primary-tint text-primary-hover" : "bg-muted text-muted-foreground"}`}
                  >
                    {dictionary.studentTabs[file.status]}
                  </span>
                )}
              </div>
            ))}
          </div>
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
