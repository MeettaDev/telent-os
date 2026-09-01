import { Text } from "@/components/ui/typography";
import type { Dictionary } from "@/common/i18n/dictionaries";

export function SummaryMetrics({ dictionary }: { dictionary: Dictionary }) {
  const metrics = [
    [dictionary.dashboard.dueToday, 7],
    [dictionary.dashboard.waitingStudent, 12],
    [dictionary.dashboard.reviewsReturned, 3],
    [dictionary.dashboard.casesAtRisk, 5],
  ] as const;
  return (
    <section
      aria-label="Workspace summary"
      className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4"
    >
      {metrics.map(([label, value]) => (
        <article
          className="surface group px-5 pb-5 pt-[1.15rem] transition-colors hover:border-primary/30 xl:px-6 xl:pb-6"
          key={label}
        >
          <Text
            variant="caption"
            className="font-semibold uppercase tracking-[0.025em] text-[#616a62] dark:text-muted-foreground"
          >
            {label}
          </Text>
          <p className="mt-3 text-[2rem] font-semibold tabular-nums tracking-[-0.045em]">
            {value}
          </p>
        </article>
      ))}
    </section>
  );
}
