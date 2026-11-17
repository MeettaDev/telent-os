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
            <ol
              className={cn(
                "mt-2 grid gap-1",
                goal.steps.length === 5 ? "grid-cols-5" : "grid-cols-4",
              )}
            >
              {goal.steps.map((step, index) => (
                <li key={step} className="text-xs leading-5">
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
                      "text-xs leading-5",
                      index === 0
                        ? "text-violet-700 dark:text-violet-300"
                        : index === 1
                          ? "font-semibold"
                          : "text-muted-foreground",
                    )}
                  >
                    {index === 0 ? "✓ " : ""}
                    {t.goalSteps[step]}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-2 text-sm leading-5 text-muted-foreground">
              {goal.note}
            </p>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}
