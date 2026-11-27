"use client";
import { Card, CardContent } from "@/components/ui/card";
import { journeyStages } from "@/features/students/mocks/students-data";
import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";
export function JourneyProgress({
  activeStage,
  consultationNote,
}: {
  activeStage: number;
  consultationNote?: string;
}) {
  const { dictionary } = useLocale();
  const t = dictionary.studentWorkspace;
  return (
    <Card className="overflow-hidden border-0">
      <CardContent className="overflow-x-auto px-4 py-3.5 lg:px-5">
        <ol
          aria-label={t.journeyLabel.replace("{step}", String(activeStage))}
          className="grid min-w-[850px] grid-cols-6 gap-2"
        >
          {journeyStages.map((stage, index) => {
            const note =
              consultationNote === undefined
                ? t.stageNotes[stage]
                : stage === "consultation"
                  ? consultationNote
                  : "";
            return (
              <li
                key={stage}
                aria-current={index === activeStage - 1 ? "step" : undefined}
              >
                <div
                  className={cn(
                    "flex min-h-14 items-center gap-2 rounded-full border border-transparent px-2.5 py-1.5",
                    index === activeStage - 1 && "border-primary",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
                      index < activeStage - 1
                        ? "bg-emerald-700"
                        : index === activeStage - 1
                          ? "bg-primary"
                          : "bg-neutral-500",
                    )}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p
                      className={cn(
                        "text-sm font-semibold leading-5",
                        index >= activeStage && "text-muted-foreground",
                      )}
                    >
                      {t.stages[stage]}
                    </p>
                    {note && (
                      <p
                        className={cn(
                          "text-xs leading-4",
                          index < activeStage - 1
                            ? "text-emerald-700 dark:text-emerald-300"
                            : index === activeStage - 1
                              ? "text-primary-hover"
                              : "text-muted-foreground",
                        )}
                      >
                        {note}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
