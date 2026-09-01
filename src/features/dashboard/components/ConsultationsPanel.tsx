import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import type { Dictionary } from "@/common/i18n/dictionaries";
import { consultations } from "@/features/dashboard/mocks/my-work-data";

export function ConsultationsPanel({ dictionary }: { dictionary: Dictionary }) {
  return (
    <section className="surface p-5">
      <div className="flex items-center justify-between gap-3">
        <Text as="h2" variant="section-title">
          {dictionary.dashboard.todayConsultations}
        </Text>
        <span className="rounded-full bg-primary-tint px-3 py-1 text-xs font-medium text-primary-hover">
          {dictionary.dashboard.scheduledCount}
        </span>
      </div>
      <div className="my-5 space-y-4">
        {consultations.map((item) => (
          <div
            className="grid grid-cols-[64px_auto_1fr] items-center gap-2"
            key={`${item.time}-${item.student}`}
          >
            <span className="text-sm font-semibold tabular-nums text-primary-hover">
              {item.time}
            </span>
            <span className="size-2 rounded-full bg-primary" />
            <Text variant="body" className="font-semibold">
              {item.student}
            </Text>
          </div>
        ))}
      </div>
      <Button variant="outline" className="w-full text-primary-hover">
        {dictionary.dashboard.openQueue}
      </Button>
    </section>
  );
}
