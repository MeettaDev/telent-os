import type { Dictionary } from "@/common/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import type { StudentDetail } from "@/features/students/types/student";

export function StudentDetailHeader({
  dictionary,
  student,
}: {
  dictionary: Dictionary;
  student: StudentDetail;
}) {
  const facts = [
    [dictionary.studentDetail.caseOwner, student.caseOwner],
    [dictionary.studentDetail.currentPhase, student.currentPhase],
    [
      dictionary.studentDetail.officialDeadline,
      `${student.officialDeadline} · ${dictionary.studentDetail.days.replace("{count}", String(student.deadlineDays))}`,
    ],
  ];

  return (
    <>
      <section className="surface grid gap-6 p-5 xl:grid-cols-[minmax(20rem,1.5fr)_2fr] xl:items-start">
        <div className="flex gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-tint text-sm font-semibold text-primary-hover">
            {student.initials}
          </span>
          <div className="min-w-0">
            <Text as="h1" variant="page-title" className="text-2xl">
              {student.name}
            </Text>
            <Text variant="caption" className="mt-1">
              {dictionary.studentDetail.studentId} · {student.id} ·{" "}
              {student.location}
            </Text>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-semibold uppercase text-red-700">
                {dictionary.studentDetail.deadlineRisk}
              </span>
              <span className="rounded-full bg-primary-tint px-3 py-1 text-[11px] font-semibold uppercase text-primary-hover">
                {dictionary.students[student.support]}
              </span>
              <span className="rounded-full bg-primary-tint px-3 py-1 text-[11px] font-semibold uppercase text-primary-hover">
                {dictionary.studentDetail.intake} · {student.intake}
              </span>
            </div>
          </div>
        </div>
        <div>
          <dl className="grid gap-4 sm:grid-cols-3">
            {facts.map(([label, value], index) => (
              <div key={label}>
                <dt className="text-[10px] font-semibold uppercase text-muted-foreground">
                  {label}
                </dt>
                <dd
                  className={`mt-2 text-sm font-semibold leading-[1.5] ${index === 2 ? "text-destructive" : "text-foreground"}`}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Button variant="outline" className="text-primary-hover">
              {dictionary.studentDetail.messageStudent}
            </Button>
            <Button variant="app-primary">
              {dictionary.studentDetail.createTask}
            </Button>
          </div>
        </div>
      </section>
      <section className="surface mt-5 grid gap-5 p-5 sm:grid-cols-2 xl:grid-cols-5">
        {[
          [dictionary.studentDetail.currentMilestone, student.milestone],
          [dictionary.studentDetail.nextAction, student.action],
          [
            dictionary.studentDetail.actionOwner,
            `${student.owner ?? dictionary.students.ownerNA} · ${student.actor}`,
          ],
          [dictionary.studentDetail.due, student.dueTime],
          [dictionary.studentDetail.blocker, student.blocker],
        ].map(([label, value], index) => (
          <div key={label}>
            <Text variant="caption" className="font-semibold uppercase">
              {label}
            </Text>
            <Text
              className={`mt-2 font-semibold ${index === 1 ? "text-primary-hover" : index === 3 ? "text-destructive" : ""}`}
            >
              {value}
            </Text>
          </div>
        ))}
      </section>
    </>
  );
}
