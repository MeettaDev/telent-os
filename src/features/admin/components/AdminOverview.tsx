"use client";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import {
  adminEscalations,
  adminMetrics,
  bottlenecks,
  journeyDistribution,
  teamWorkload,
} from "@/features/admin/mocks/admin-data";
import { useLocale } from "@/providers/locale-provider";

const tagTone = {
  blue: "bg-primary-tint text-primary-hover",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-50 text-red-700",
};

export function AdminOverview() {
  const { dictionary } = useLocale();
  const copy = dictionary.admin;
  return (
    <main className="mx-auto w-full max-w-[96rem] p-5 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Text as="h1" variant="page-title">
            {copy.overviewTitle}
          </Text>
          <Text variant="description">{copy.overviewDescription}</Text>
        </div>
        <Button variant="outline">{copy.openEscalations}</Button>
      </div>
      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {adminMetrics.map((item) => (
          <article className="surface p-5" key={item.key}>
            <Text variant="caption" className="font-semibold uppercase">
              {copy[item.key]}
            </Text>
            <Text className="mt-2 text-3xl font-semibold">{item.value}</Text>
            <span
              className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${tagTone[item.tone]}`}
            >
              {copy[item.note]}
            </span>
          </article>
        ))}
      </section>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_0.85fr]">
        <Workload copy={copy} />
        <section className="surface p-5">
          <PanelTitle title={copy.bottlenecks} badge={copy.active} />{" "}
          <div className="mt-3">
            {bottlenecks.map((item) => (
              <div
                className="border-b border-border py-3 last:border-0"
                key={item.title}
              >
                <div className="flex gap-3">
                  <span
                    className={`mt-2 size-2 shrink-0 rounded-full ${item.tone === "red" ? "bg-red-600" : "bg-amber-600"}`}
                  />
                  <div>
                    <Text className="font-semibold">{item.title}</Text>
                    <Text variant="caption" className="mt-1">
                      {item.detail}
                    </Text>
                    <span
                      className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] ${tagTone[item.tone]}`}
                    >
                      {item.tag}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-3 w-full" variant="outline">
            {copy.openWorkQueue}
          </Button>
        </section>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Distribution copy={copy} />
        <Escalations copy={copy} />
      </div>
    </main>
  );
}

function PanelTitle({ title, badge }: { title: string; badge: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Text as="h2" variant="card-title">
        {title}
      </Text>
      <span className="rounded-full bg-primary-tint px-2.5 py-1 text-[10px] font-semibold uppercase text-primary-hover">
        {badge}
      </span>
    </div>
  );
}

function Workload({
  copy,
}: {
  copy: ReturnType<typeof useLocale>["dictionary"]["admin"];
}) {
  return (
    <section className="surface overflow-hidden p-5">
      <PanelTitle title={copy.teamWorkload} badge={copy.live} />
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left text-xs">
          <thead>
            <tr className="border-b border-border uppercase text-muted-foreground">
              {[
                copy.teamMember,
                copy.role,
                copy.openItems,
                copy.dueToday,
                copy.overdue,
                copy.sla,
              ].map((x) => (
                <th className="py-3 pr-3" key={x}>
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teamWorkload.map((row) => (
              <tr
                className="border-b border-border last:border-0"
                key={row.name}
              >
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary-tint font-semibold text-primary-hover">
                      {row.initials}
                    </span>
                    <span className="font-semibold">{row.name}</span>
                  </div>
                </td>
                <td>{copy[row.role]}</td>
                <td>{row.open}</td>
                <td>{row.due}</td>
                <td
                  className={
                    row.overdue > 1 ? "font-semibold text-destructive" : ""
                  }
                >
                  {row.overdue}
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-20 rounded-full bg-muted">
                      <span
                        className={`block h-full rounded-full ${row.sla < 90 ? "bg-red-600" : "bg-emerald-700"}`}
                        style={{ width: `${row.sla}%` }}
                      />
                    </span>
                    <b>{row.sla}%</b>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Text
        variant="caption"
        className="mt-2 rounded-md bg-primary-tint px-3 py-1 text-primary-hover"
      >
        {copy.workloadNote}
      </Text>
    </section>
  );
}

function Distribution({
  copy,
}: {
  copy: ReturnType<typeof useLocale>["dictionary"]["admin"];
}) {
  return (
    <section className="surface p-5">
      <PanelTitle title={copy.journeyDistribution} badge={copy.currentPhase} />
      <div className="mt-4 space-y-3">
        {journeyDistribution.map(([label, value]) => (
          <div
            className="grid grid-cols-[7rem_1fr_2rem] items-center gap-3 text-xs"
            key={label}
          >
            <span>{label}</span>
            <span className="h-2 rounded-full bg-muted">
              <span
                className="block h-full rounded-full bg-emerald-700"
                style={{ width: `${(value / 16) * 100}%` }}
              />
            </span>
            <b>{value}</b>
          </div>
        ))}
      </div>
    </section>
  );
}

function Escalations({
  copy,
}: {
  copy: ReturnType<typeof useLocale>["dictionary"]["admin"];
}) {
  return (
    <section className="surface p-5">
      <PanelTitle title={copy.adminEscalations} badge={copy.open} />
      <div className="mt-3">
        {adminEscalations.map((item) => (
          <div
            className="grid grid-cols-[1fr_auto] gap-3 border-b border-border py-3 last:border-0"
            key={item.name}
          >
            <div>
              <Text className="font-semibold">{item.name}</Text>
              <Text variant="caption">{item.issue}</Text>
              <Text variant="caption" className="mt-1">
                {item.owner}
              </Text>
            </div>
            <span className="self-start rounded-full bg-amber-100 px-2 py-1 text-[10px] text-amber-800">
              {item.due === "today"
                ? copy.today
                : item.due === "tomorrow"
                  ? copy.tomorrow
                  : item.due}
            </span>
          </div>
        ))}
      </div>
      <Button className="mt-3 w-full" variant="outline">
        {copy.openEscalationQueue}
      </Button>
    </section>
  );
}
