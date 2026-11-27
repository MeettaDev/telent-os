"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { PageSkeleton } from "@/common/components/PageSkeleton";
import { WorkspacePageHeader } from "@/common/components/WorkspacePageHeader";
import { WorkspaceSearchInput } from "@/common/components/WorkspaceSearchInput";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";
import {
  matchesUniversity,
  workspaceDate,
  type UniversityFilter,
} from "../university-record";
import { useUniversitiesStore } from "../stores/universities-store";
import { UniversitiesTable } from "./UniversitiesTable";
import { UniversityDialog } from "./UniversityDialogs";

const filters: UniversityFilter[] = ["all", "hasStudents", "recheck", "draft"];

export function UniversitiesView() {
  const { dictionary } = useLocale();
  const t = dictionary.universityWorkspace;
  const router = useRouter();
  const records = useUniversitiesStore((state) => state.records);
  const ready = useUniversitiesStore((state) => state.ready);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<UniversityFilter>("all");
  const [adding, setAdding] = useState(false);
  const addButton = useRef<HTMLButtonElement>(null);
  const today = workspaceDate();
  const visible = useMemo(
    () =>
      records.filter((record) =>
        matchesUniversity(record, filter, query, today),
      ),
    [records, filter, query, today],
  );
  const resetKey = filter + ":" + query.trim().toLocaleLowerCase();

  if (!ready) return <PageSkeleton />;

  return (
    <main id="main-content" className="flex h-dvh min-h-min flex-col">
      <WorkspacePageHeader
        title={dictionary.sidebar.universities}
        inlineActions
        actions={
          <>
            <div className="w-full min-w-0 sm:w-70">
              <WorkspaceSearchInput
                placeholder={t.search}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <Button
              type="button"
              className="h-11 rounded-full px-6 text-lg"
              onClick={(event) => {
                addButton.current = event.currentTarget;
                setAdding(true);
              }}
            >
              <Plus aria-hidden="true" />
              {t.add}
            </Button>
          </>
        }
        toolbar={
          <nav aria-label={t.filterLabel} className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <Button
                key={item}
                type="button"
                variant="outline"
                aria-pressed={filter === item}
                className={cn(
                  "h-auto min-h-9.5 gap-1 rounded-full border-0 px-4 py-1 text-sm whitespace-normal",
                  item === filter
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : "text-foreground",
                )}
                onClick={() => setFilter(item)}
              >
                {t.filters[item]}
                <span className="tabular-nums">
                  {
                    records.filter((record) =>
                      matchesUniversity(record, item, "", today),
                    ).length
                  }
                </span>
              </Button>
            ))}
          </nav>
        }
      />
      <div className="flex min-h-48 flex-1 flex-col px-4 pb-4 md:px-6 xl:px-8">
        <UniversitiesTable
          records={visible}
          resetKey={resetKey}
          today={today}
        />
      </div>
      {adding && (
        <UniversityDialog
          students={[]}
          opener={addButton}
          onClose={() => setAdding(false)}
          onSave={(record) => {
            setAdding(false);
            router.push("/universities/" + encodeURIComponent(record.id));
          }}
        />
      )}
    </main>
  );
}
