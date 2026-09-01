"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import { adminStudents } from "@/features/admin/mocks/admin-data";
import { useLocale } from "@/providers/locale-provider";

const healthStyles = {
  atRisk: "bg-red-50 text-red-700",
  needsAttention: "bg-amber-100 text-amber-800",
  onTrack: "bg-emerald-50 text-emerald-700",
};

export function AdminStudents() {
  const { dictionary } = useLocale();
  const copy = dictionary.admin;
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const rows = useMemo(() => {
    const value = query.trim().toLowerCase();
    return value
      ? adminStudents.filter((row) =>
          `${row.name} ${row.plan} ${row.counselor ?? ""}`
            .toLowerCase()
            .includes(value),
        )
      : adminStudents;
  }, [query]);
  return (
    <main className="mx-auto w-full max-w-[96rem] p-5 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Text as="h1" variant="page-title">
            {copy.studentsTitle}
          </Text>
          <Text variant="description">{copy.studentsDescription}</Text>
        </div>
        <Button disabled={!selected.length} variant="outline">
          {copy.reassignSelected}
          {selected.length ? ` (${selected.length})` : ""}
        </Button>
      </div>
      <section className="surface mt-6 flex flex-wrap items-center gap-3 p-4">
        <label className="flex h-10 min-w-[15rem] flex-1 items-center gap-2 rounded-lg bg-muted px-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            className="w-full bg-transparent text-sm outline-none"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.filterPlaceholder}
            value={query}
          />
        </label>
        {[copy.all, copy.unassigned, copy.atRisk, copy.slaBreach].map(
          (label, index) => (
            <button
              className={`rounded-full px-5 py-2 text-xs font-semibold ${index === 0 ? "bg-primary-hover text-white" : "bg-muted text-muted-foreground hover:bg-primary-tint"}`}
              key={label}
              type="button"
            >
              {label}
            </button>
          ),
        )}
        <button className="rounded-lg bg-muted px-4 py-3 text-xs" type="button">
          {copy.counselorAll}
        </button>
        <Button variant="app-text">{copy.export}</Button>
      </section>
      <AdminStudentsTable
        copy={copy}
        rows={rows}
        selected={selected}
        setSelected={setSelected}
      />
    </main>
  );
}

function AdminStudentsTable({
  copy,
  rows,
  selected,
  setSelected,
}: {
  copy: ReturnType<typeof useLocale>["dictionary"]["admin"];
  rows: readonly (typeof adminStudents)[number][];
  selected: string[];
  setSelected: (ids: string[]) => void;
}) {
  const router = useRouter();
  const toggle = (id: string) =>
    setSelected(
      selected.includes(id)
        ? selected.filter((value) => value !== id)
        : [...selected, id],
    );
  return (
    <section className="surface mt-4 overflow-hidden">
      <div className="overflow-x-auto px-4">
        <table className="w-full min-w-[70rem] text-left">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase text-muted-foreground">
              <th className="w-8 py-5">
                <span className="sr-only">Select</span>
              </th>
              {[
                copy.student,
                copy.counselor,
                copy.publishedPlan,
                copy.stage,
                copy.currentAction,
                copy.deadline,
                copy.health,
              ].map((label) => (
                <th className="px-2 py-5" key={label}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/50"
                key={row.id}
                onClick={() => router.push(`/students/${row.id}`)}
              >
                <td onClick={(event) => event.stopPropagation()}>
                  <input
                    aria-label={`Select ${row.name}`}
                    checked={selected.includes(row.id)}
                    className="accent-primary"
                    onChange={() => toggle(row.id)}
                    type="checkbox"
                  />
                </td>
                <td className="px-2 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-full bg-primary-tint text-xs font-semibold text-primary-hover">
                      {row.initials}
                    </span>
                    <div>
                      <Text className="font-semibold">{row.name}</Text>
                      <Text variant="caption">{row.id}</Text>
                    </div>
                  </div>
                </td>
                <td
                  className={`px-2 text-sm ${row.counselor ? "" : "font-semibold text-destructive"}`}
                >
                  {row.counselor ?? copy.notClaimed}
                </td>
                <td className="px-2 text-sm">{row.plan}</td>
                <td className="px-2">
                  <span className="rounded-full bg-primary-tint px-3 py-1 text-xs text-primary-hover">
                    {row.stage}
                  </span>
                </td>
                <td className="px-2 text-sm">{row.action}</td>
                <td
                  className={`px-2 text-sm ${row.deadline === "Today" ? "font-semibold text-destructive" : ""}`}
                >
                  {row.deadline}
                </td>
                <td className="px-2">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs ${healthStyles[row.health]}`}
                  >
                    {row.health === "atRisk"
                      ? dictionaryHealth(copy, "atRisk")
                      : copy[row.health]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length ? (
        <footer className="px-5 pb-4">
          <Text
            variant="caption"
            className="rounded-md bg-primary-tint px-3 py-1 text-primary-hover"
          >
            {copy.scopeNote}
          </Text>
          <Text variant="caption" className="mt-2">
            {copy.showing.replace("{count}", String(rows.length))}
          </Text>
        </footer>
      ) : (
        <Text variant="description" className="py-14 text-center">
          {copy.noResults}
        </Text>
      )}
    </section>
  );
}

function dictionaryHealth(
  copy: ReturnType<typeof useLocale>["dictionary"]["admin"],
  key: "atRisk",
) {
  return key === "atRisk" ? copy.atRisk.replace(/\s+\d+$/, "") : copy.atRisk;
}
