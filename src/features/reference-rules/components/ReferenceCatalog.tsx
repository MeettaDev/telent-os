import { Check, CircleSlash2 } from "lucide-react";

import type { Dictionary } from "@/common/i18n/dictionaries";
import { Text } from "@/components/ui/typography";
import {
  canonicalCriteria,
  milestoneTypes,
  renderSurfaces,
} from "@/features/reference-rules/mocks/reference-rules-data";

type Copy = Dictionary["referenceRules"];

export function ReferenceCatalog({ copy }: { copy: Copy }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[20rem_minmax(0,1fr)]">
      <MilestoneList copy={copy} />
      <CriteriaPanel copy={copy} />
    </div>
  );
}

function MilestoneList({ copy }: { copy: Copy }) {
  return (
    <section className="surface overflow-hidden">
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <Text variant="caption" className="font-semibold uppercase">
          {copy.milestoneTypes}
        </Text>
        <Text variant="caption" className="font-semibold">
          6
        </Text>
      </header>
      <div>
        {milestoneTypes.map((item, index) => (
          <div
            className={`relative flex min-h-[4.65rem] items-center justify-between gap-4 border-b border-border px-5 py-3 last:border-0 ${index === 0 ? "bg-primary-tint before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-primary" : ""}`}
            key={item.key}
          >
            <div>
              <Text className="font-semibold">{copy[item.key]}</Text>
              <Text variant="caption" className="mt-1">
                {copy[item.detailKey]}
              </Text>
            </div>
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${item.status === "ready" ? "bg-emerald-100 text-emerald-700" : item.status === "review" ? "bg-amber-100 text-amber-800" : "bg-muted text-muted-foreground"}`}
            >
              {item.status === "locked" ? (
                <CircleSlash2 className="size-3.5" />
              ) : (
                <Check className="size-3.5" />
              )}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CriteriaPanel({ copy }: { copy: Copy }) {
  return (
    <section className="surface overflow-hidden">
      <header className="border-b border-border px-5 py-4">
        <Text variant="caption" className="font-semibold uppercase">
          {copy.bankStatement} · acceptance_criteria[]
        </Text>
      </header>
      <div className="p-5">
        <div className="grid grid-cols-[2rem_1fr_auto] gap-3 pb-2 text-[10px] font-semibold uppercase text-muted-foreground">
          <span>#</span>
          <span>{copy.canonicalLabel}</span>
          <span>{copy.checkableBy}</span>
        </div>
        <div className="space-y-2">
          {canonicalCriteria.map((key, index) => (
            <div
              className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-lg bg-muted px-3 py-2.5"
              key={key}
            >
              <Text variant="caption" className="font-semibold">
                {index + 1}
              </Text>
              <Text>{copy[key]}</Text>
              <span className="rounded-full bg-primary-tint px-3 py-1 text-[10px] font-semibold text-primary-hover">
                {copy.both}
              </span>
            </div>
          ))}
        </div>
        <div className="my-5 border-t border-border" />
        <Text variant="caption" className="font-semibold uppercase">
          {copy.renderTitle}
        </Text>
        <div className="mt-2">
          {renderSurfaces.map((surface) => (
            <div
              className="grid gap-2 border-b border-border py-3 last:border-0 sm:grid-cols-[12rem_1fr_auto] sm:items-center"
              key={surface.key}
            >
              <Text className="font-semibold">{copy[surface.key]}</Text>
              <Text variant="caption">{copy[surface.detailKey]}</Text>
              <span
                className={`w-fit rounded-full px-3 py-1 text-[10px] font-semibold ${surface.completion.startsWith("0") ? "bg-muted text-muted-foreground" : "bg-emerald-100 text-emerald-700"}`}
              >
                {surface.completion}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
