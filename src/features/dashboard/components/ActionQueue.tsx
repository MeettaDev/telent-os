import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import type { Dictionary } from "@/common/i18n/dictionaries";
import { queueItems } from "@/features/dashboard/mocks/my-work-data";
import type { QueueStatus } from "@/features/dashboard/types/my-work";

const statusStyles: Record<QueueStatus, string> = {
  actionable: "bg-primary-tint text-primary-hover",
  dueSoon: "bg-[#fff1c9] text-[#886713]",
  overdue: "bg-[#ffe4df] text-[#ad3d2c]",
  scheduled: "bg-[#ecefec] text-[#616a62]",
};

export function ActionQueue({ dictionary }: { dictionary: Dictionary }) {
  const statusLabels = {
    actionable: dictionary.dashboard.actionable,
    dueSoon: dictionary.dashboard.dueSoon,
    overdue: dictionary.dashboard.overdue,
    scheduled: dictionary.dashboard.scheduled,
  };
  return (
    <section className="surface min-w-0 p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Text as="h2" variant="section-title">
            {dictionary.dashboard.actionQueue}
          </Text>
          <Text variant="description" className="mt-0.5">
            {dictionary.dashboard.queueDescription}
          </Text>
        </div>
        <Button variant="outline" className="hidden sm:inline-flex">
          {dictionary.dashboard.viewAll}
        </Button>
      </div>
      <div className="mt-5 flex flex-wrap gap-2 border-b border-border pb-4">
        {[
          dictionary.dashboard.all,
          dictionary.dashboard.dueTodayFilter,
          dictionary.dashboard.overdueFilter,
          dictionary.dashboard.unclaimedFilter,
        ].map((label, index) => (
          <button
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20 ${index === 0 ? "bg-primary-tint text-primary-hover" : "bg-[#ecefec] text-[#646c65] hover:bg-[#e2e7e3] dark:bg-muted dark:text-muted-foreground"}`}
            key={label}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
      <div>
        {queueItems.map((item) => (
          <article
            className={`group grid min-h-[100px] grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border px-1 transition-colors last:border-0 hover:bg-muted/35 md:grid-cols-[auto_minmax(0,1fr)_90px_80px_120px_auto] ${item.status === "overdue" ? "-mx-2 rounded-xl border-0 bg-[#fff8f6] px-3 hover:bg-[#fff3ef] dark:bg-red-950/20" : ""}`}
            key={item.id}
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary-tint text-xs font-semibold text-primary-hover">
              {item.initials}
            </span>
            <div className="min-w-0">
              <Text variant="card-title" className="truncate">
                {item.title}
              </Text>
              <Text variant="description" className="mt-0.5 truncate">
                {item.student} · {item.category}
              </Text>
            </div>
            <div className="hidden md:block">
              <Text variant="caption" className="font-semibold uppercase">
                {dictionary.dashboard.owner}
              </Text>
              <Text variant="body" className="mt-2 font-medium">
                {item.owner}
              </Text>
            </div>
            <div className="hidden md:block">
              <Text variant="caption" className="font-semibold uppercase">
                {dictionary.dashboard.due}
              </Text>
              <Text
                variant="body"
                className={`mt-2 font-semibold tabular-nums ${item.status === "overdue" ? "text-destructive" : ""}`}
              >
                {item.due}
              </Text>
            </div>
            <span
              className={`hidden w-fit rounded-full px-3 py-1 text-xs font-medium sm:inline-flex ${statusStyles[item.status]}`}
            >
              {statusLabels[item.status]}
            </span>
            <ChevronRight
              aria-hidden="true"
              className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
            />
          </article>
        ))}
      </div>
    </section>
  );
}
