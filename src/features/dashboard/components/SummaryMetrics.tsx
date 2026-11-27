import type { Dictionary } from "@/common/i18n/dictionaries";
import { Card, CardContent } from "@/components/ui/card";
import { todayMetrics } from "@/features/dashboard/mocks/my-work-data";

export function SummaryMetrics({ dictionary }: { dictionary: Dictionary }) {
  return (
    <section
      aria-label={dictionary.today.summaryLabel}
      className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4"
    >
      {todayMetrics.map(({ id, count }) => (
        <Card
          key={id}
          className="border-0 shadow-[0_8px_24px_rgba(25,25,30,0.08)] dark:shadow-none"
        >
          <CardContent className="grid min-h-22 place-content-center gap-0.5 p-3 text-center">
            <h2 className="text-sm font-semibold text-muted-foreground">
              {dictionary.today.metrics[id].label}
            </h2>
            <p className="text-[2rem] leading-tight font-bold tabular-nums">
              {count}
            </p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
