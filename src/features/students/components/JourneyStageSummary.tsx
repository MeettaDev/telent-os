import type { Dictionary } from "@/common/i18n/dictionaries";
import { Text } from "@/components/ui/typography";
import { journeyStages } from "@/features/students/mocks/students-data";

export function JourneyStageSummary({
  dictionary,
}: {
  dictionary: Dictionary;
}) {
  return (
    <section
      aria-label={dictionary.students.stageSupport}
      className="overflow-x-auto pb-1"
    >
      <div className="grid min-w-[62rem] grid-cols-8 gap-3">
        {journeyStages.map(({ key, count }) => (
          <div className="surface min-h-24 rounded-xl px-4 py-3" key={key}>
            <Text
              variant="caption"
              className="font-semibold uppercase text-[#626a63]"
            >
              {dictionary.students[key]}
            </Text>
            <p className="mt-2 text-[28px] font-semibold leading-none tabular-nums text-foreground">
              {count}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
