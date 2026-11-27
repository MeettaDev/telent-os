"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";

export function StudentGoals() {
  const { dictionary } = useLocale();
  const t = dictionary.studentWorkspace;
  return (
    <Card id="long-term-goals">
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 pb-4">
        <CardTitle>{t.detail.goals}</CardTitle>
        <p className="text-xs font-medium text-muted-foreground">
          {t.detail.goalsNote}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {(
          [
            {
              title: t.detail.topikGoal,
              check: t.detail.checkOct7,
              steps: ["study", "register", "test", "score", "upload"],
              note: t.detail.topikNote,
            },
            {
              title: t.detail.bankGoal,
              check: t.detail.checkOct9,
              steps: ["plan", "save", "hold", "certificate"],
              note: t.detail.bankNote,
            },
          ] as const
        ).map((goal) => (
          <section key={goal.title}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-semibold leading-6">
                {goal.title}
              </h3>
              <span className="text-xs font-semibold leading-5 text-muted-foreground">
                {goal.check}
              </span>
            </div>
            <GoalProgress steps={goal.steps} />
            <p className="mt-2 text-sm leading-5 text-muted-foreground">
              {goal.note}
            </p>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}

export function GoalProgress({
  steps,
}: {
  steps: readonly (keyof import("@/common/i18n/dictionaries").Dictionary["studentWorkspace"]["goalSteps"])[];
}) {
  const { dictionary } = useLocale();
  return (
    <ol
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
    >
      {steps.map((step, index) => (
        <li key={step} className="min-w-0 text-[11px] leading-5">
          <span
            className={cn(
              "mb-1 block h-1.5 rounded-full",
              index === 0
                ? "bg-violet-600"
                : index === 1
                  ? "bg-violet-400"
                  : "bg-violet-100 dark:bg-violet-950",
            )}
          />
          <span
            className={cn(
              index === 0
                ? "text-violet-600 dark:text-violet-300"
                : index === 1
                  ? "font-semibold"
                  : "text-muted-foreground",
            )}
          >
            {index === 0 && "✓ "}
            {dictionary.studentWorkspace.goalSteps[step]}
          </span>
        </li>
      ))}
    </ol>
  );
}
