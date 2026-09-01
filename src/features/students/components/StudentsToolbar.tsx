import { Download, ListFilter } from "lucide-react";

import { ParamSearchInput } from "@/common/components/ParamSearchInput";
import type { Dictionary } from "@/common/i18n/dictionaries";
import { Button } from "@/components/ui/button";

export type StudentFilter = "all" | "needsAttention" | "atRisk" | "unclaimed";

const filters: { key: StudentFilter; count: number }[] = [
  { key: "all", count: 42 },
  { key: "needsAttention", count: 8 },
  { key: "atRisk", count: 5 },
  { key: "unclaimed", count: 2 },
];

type StudentsToolbarProps = {
  dictionary: Dictionary;
  filter: StudentFilter;
  initialQuery: string;
  onFilterChange: (filter: StudentFilter) => void;
  onSearchChange: (query: string) => void;
};

export function StudentsToolbar({
  dictionary,
  filter,
  initialQuery,
  onFilterChange,
  onSearchChange,
}: StudentsToolbarProps) {
  return (
    <section className="surface flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
      <ParamSearchInput
        className="flex-1 lg:max-w-sm"
        initialValue={initialQuery}
        loadingLabel={dictionary.students.searching}
        onDebouncedChange={onSearchChange}
        paramName="search"
        placeholder={dictionary.students.search}
      />
      <div className="flex flex-1 gap-2 overflow-x-auto py-1">
        {filters.map(({ key, count }) => (
          <button
            aria-pressed={filter === key}
            className={`cursor-pointer whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${filter === key ? "bg-primary-tint text-primary-hover" : "bg-[#eef0ed] text-[#626a63] hover:bg-muted dark:bg-muted"}`}
            key={key}
            onClick={() => onFilterChange(key)}
            type="button"
          >
            {dictionary.students[key]}{" "}
            <span className="tabular-nums">{count}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Button
          className="flex-1 text-primary-hover lg:min-w-32"
          variant="outline"
        >
          <ListFilter />
          {dictionary.students.filters} <span className="text-primary">3</span>
        </Button>
        <Button
          className="flex-1 text-primary-hover lg:min-w-32"
          variant="outline"
        >
          <Download />
          {dictionary.students.export}
        </Button>
      </div>
    </section>
  );
}
