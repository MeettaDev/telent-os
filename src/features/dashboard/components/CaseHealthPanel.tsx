import { Text } from "@/components/ui/typography";
import type { Dictionary } from "@/common/i18n/dictionaries";
import { caseHealth } from "@/features/dashboard/mocks/my-work-data";

const barColors = {
  onTrack: "bg-[#367d52]",
  needsAttention: "bg-[#8c6a16]",
  atRisk: "bg-[#b44432]",
};
export function CaseHealthPanel({ dictionary }: { dictionary: Dictionary }) {
  return (
    <section className="surface p-5">
      <div className="flex items-center justify-between">
        <Text as="h2" variant="section-title">
          {dictionary.dashboard.caseHealth}
        </Text>
        <span className="rounded-full bg-[#ffe4df] px-3 py-1 text-xs font-medium text-[#ad3d2c] dark:bg-red-950/40 dark:text-red-300">
          {dictionary.dashboard.atRiskCount}
        </span>
      </div>
      <div className="mt-6 space-y-6">
        {caseHealth.map((item) => (
          <div
            className="grid grid-cols-[8.2rem_1fr_1.5rem] items-center gap-3"
            key={item.key}
          >
            <Text
              variant="body"
              className="text-[#505951] dark:text-muted-foreground"
            >
              {dictionary.dashboard[item.key]}
            </Text>
            <div className="h-2 overflow-hidden rounded-full bg-[#e7eae6] dark:bg-muted">
              <div
                className={`h-full rounded-full ${barColors[item.key]}`}
                style={{ width: item.width }}
              />
            </div>
            <span className="text-right text-sm font-semibold tabular-nums">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
