import type { Dictionary } from "@/common/i18n/dictionaries";
import { Card, CardContent } from "@/components/ui/card";
import { todayMetrics } from "@/features/dashboard/mocks/my-work-data";
import { cn } from "@/lib/utils";

const tones = {
  destructive: "text-destructive",
  warning: "text-warning",
  primary: "text-primary-hover",
};

export function SummaryMetrics({ dictionary }: { dictionary: Dictionary }) {
  return (
    <section
      aria-label={dictionary.today.summaryLabel}
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {todayMetrics.map(({ id, count, tone }) => (
        <Card key={id}>
          <CardContent className="p-4 lg:p-6">
            <h2 className="text-sm font-semibold text-muted-foreground">
              {dictionary.today.metrics[id].label}
            </h2>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{count}</p>
            <p className={cn("mt-1 text-sm font-semibold", tones[tone])}>
              {dictionary.today.metrics[id].hint}
            </p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
