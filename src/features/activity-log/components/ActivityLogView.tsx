"use client";

import { useMemo, useState } from "react";

import { AppHeader } from "@/common/components/AppHeader";
import { AppSidebar } from "@/common/components/AppSidebar";
import type { Dictionary } from "@/common/i18n/dictionaries";
import { Text } from "@/components/ui/typography";
import {
  activityEvents,
  activityGroups,
  type ActivityActor,
} from "@/features/activity-log/mocks/activity-log-data";
import { useLocale } from "@/providers/locale-provider";

type Filter = "all" | ActivityActor;
type Copy = Dictionary["activityLog"];
const filters: { key: Filter; count: number }[] = [
  { key: "all", count: 9 },
  { key: "student", count: 2 },
  { key: "counselor", count: 4 },
  { key: "finance", count: 1 },
  { key: "system", count: 2 },
];
const avatarTone = {
  student: "bg-emerald-100 text-emerald-700",
  counselor: "bg-primary-tint text-primary-hover",
  finance: "bg-stone-200 text-stone-700",
  system: "bg-muted text-muted-foreground",
};
const codeTone = {
  red: "text-red-700",
  amber: "text-amber-800",
  green: "text-emerald-700",
};

export function ActivityLogView() {
  const { dictionary } = useLocale();
  const copy = dictionary.activityLog;
  const [filter, setFilter] = useState<Filter>("all");
  const visibleIds = useMemo(
    () =>
      new Set(
        activityEvents
          .filter((event) => filter === "all" || event.actor === filter)
          .map((event) => event.id),
      ),
    [filter],
  );
  return (
    <div className="flex min-h-dvh bg-[#f6f8f5] dark:bg-background">
      <AppSidebar />
      <div className="min-w-0 flex-1">
        <AppHeader variant="activity" />
        <main
          id="main-content"
          className="mx-auto px-4 pb-10 pt-7 md:px-7 md:pt-8 xl:px-8"
        >
          <Text as="h1" variant="page-title">
            {copy.title}
          </Text>
          <Text className="mt-1" variant="description">
            {copy.description}
          </Text>
          <div className="mt-5 flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                aria-pressed={filter === item.key}
                className={`cursor-pointer rounded-full px-5 py-2 text-xs font-semibold transition-colors ${filter === item.key ? "bg-primary-hover text-white" : "bg-card text-muted-foreground hover:bg-primary-tint hover:text-primary-hover"}`}
                key={item.key}
                onClick={() => setFilter(item.key)}
                type="button"
              >
                {copy[item.key]} {item.count}
              </button>
            ))}
          </div>
          <div className="mt-5 space-y-5">
            {activityGroups.map((group) => {
              const events = activityEvents.filter(
                (event) =>
                  group.eventIds.includes(event.id as never) &&
                  visibleIds.has(event.id),
              );
              if (!events.length) return null;
              return (
                <section key={group.labelKey}>
                  <Text
                    variant="caption"
                    className="mb-2 font-semibold uppercase"
                  >
                    {copy[group.labelKey]}
                  </Text>
                  <div className="space-y-2">
                    {events.map((event) => (
                      <ActivityRow copy={copy} event={event} key={event.id} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

function ActivityRow({
  copy,
  event,
}: {
  copy: Copy;
  event: (typeof activityEvents)[number];
}) {
  return (
    <article className="grid gap-3 rounded-xl border border-transparent bg-card px-4 py-3 transition-colors hover:border-border sm:grid-cols-[2.25rem_minmax(0,1fr)_auto] sm:items-start">
      <span
        className={`flex size-9 items-center justify-center rounded-full text-[11px] font-semibold ${avatarTone[event.actor]}`}
      >
        {event.initials}
      </span>
      <div>
        <Text>{copy[event.titleKey as keyof Copy]}</Text>
        {event.noteKey && (
          <Text variant="caption" className="mt-1">
            “{copy[event.noteKey as keyof Copy]}”
          </Text>
        )}
        <Text variant="caption" className="mt-1 text-[10px]">
          {copy[event.metaKey as keyof Copy]}
        </Text>
      </div>
      <code
        className={`w-fit rounded-md bg-muted px-3 py-1 text-[9px] font-semibold ${codeTone[event.tone]}`}
      >
        {event.code}
      </code>
    </article>
  );
}
