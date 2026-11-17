"use client";
import { Card, CardContent } from "@/components/ui/card";
import { journeyStages } from "@/features/students/mocks/students-data";
import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";
export function JourneyProgress({ activeStage }: { activeStage: number }) {
  const { dictionary } = useLocale();
  const t = dictionary.studentWorkspace;
  return (
    <Card className="overflow-hidden">
      <CardContent className="overflow-x-auto px-4 py-3.5 lg:px-5">
        <ol
          aria-label={t.journeyLabel.replace("{step}", String(activeStage))}
          className="grid min-w-4xl grid-cols-6 gap-2"
        >
          {journeyStages.map((stage, index) => (
            <li
              key={stage}
              aria-current={index === activeStage - 1 ? "step" : undefined}
            >
              <div
                className={cn(
                  "mb-2 h-1.5 rounded-full",
                  index < activeStage - 1
                    ? "bg-emerald-700"
                    : index === activeStage - 1
                      ? "bg-primary"
                      : "bg-border",
                )}
              />
              <p
                className={cn(
                  "text-sm font-semibold leading-5",
                  index >= activeStage && "text-muted-foreground",
                )}
              >
                {index + 1} {t.stages[stage]}
              </p>
              <p
                className={cn(
                  "mt-1 text-xs leading-5",
                  index < activeStage - 1
                    ? "text-emerald-700 dark:text-emerald-300"
                    : index === activeStage - 1
                      ? "text-primary-hover"
                      : "text-muted-foreground",
                )}
              >
                {t.stageNotes[stage]}
              </p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
