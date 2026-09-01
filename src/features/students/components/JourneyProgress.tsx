import { Check } from "lucide-react";

import type { Dictionary } from "@/common/i18n/dictionaries";
import { Text } from "@/components/ui/typography";
import { journeyStages } from "@/features/students/mocks/students-data";

export function JourneyProgress({
  dictionary,
  activeStage,
}: {
  dictionary: Dictionary;
  activeStage: string;
}) {
  const activeIndex = journeyStages.findIndex(({ key }) => key === activeStage);

  return (
    <section className="surface mt-8 overflow-x-auto p-5">
      <Text variant="caption" className="font-semibold uppercase">
        {dictionary.studentDetail.journeyProgress}
      </Text>
      <ol className="mt-5 flex min-w-[52rem]">
        {journeyStages.map(({ key }, index) => {
          const complete = index < activeIndex;
          const active = index === activeIndex;
          return (
            <li className="relative flex flex-1 flex-col items-start" key={key}>
              {index < journeyStages.length - 1 && (
                <span
                  className={`absolute left-7 right-1 top-3 h-1 rounded-full ${index < activeIndex ? "bg-emerald-600" : "bg-[#e8ebe7]"}`}
                />
              )}
              <span
                className={`relative z-10 flex size-7 items-center justify-center rounded-full text-xs font-semibold ${complete ? "bg-emerald-600 text-white" : active ? "bg-primary text-white" : "bg-[#eef0ed] text-muted-foreground"}`}
              >
                {complete ? <Check className="size-3.5" /> : index + 1}
              </span>
              <span
                className={`mt-2 text-xs ${active ? "font-semibold text-primary-hover" : "text-muted-foreground"}`}
              >
                {dictionary.students[key]}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
