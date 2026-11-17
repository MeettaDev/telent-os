"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Pagination, usePagination } from "@/common/components/Pagination";
import { PageSkeleton } from "@/common/components/PageSkeleton";
import { WorkspacePageHeader } from "@/common/components/WorkspacePageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";
import {
  matchesUniversity,
  workspaceDate,
  type UniversityFilter,
} from "../university-record";
import { useUniversitiesStore } from "../stores/universities-store";
import { UniversityDialog } from "./UniversityDialogs";
import {
  applicationWindow,
  universityDate,
  UniversityStatus,
} from "./UniversityStatus";

const filters: UniversityFilter[] = ["all", "hasStudents", "recheck", "draft"];
const columns = [
  "school",
  "intake",
  "window",
  "topik",
  "bankProof",
  "checked",
  "students",
] as const;

export function UniversitiesView() {
  const { dictionary, locale } = useLocale();
  const t = dictionary.universityWorkspace;
  const router = useRouter();
  const records = useUniversitiesStore((state) => state.records);
  const ready = useUniversitiesStore((state) => state.ready);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<UniversityFilter>("all");
  const [adding, setAdding] = useState(false);
  const addButton = useRef<HTMLButtonElement>(null);
  const today = workspaceDate();
  const visible = records.filter((record) =>
    matchesUniversity(record, filter, query, today),
  );
  const { pageRows, pagination } = usePagination(
    visible,
    filter + ":" + query.trim().toLocaleLowerCase(),
  );

  if (!ready) return <PageSkeleton />;

  return (
    <main id="main-content">
      <WorkspacePageHeader
        title={dictionary.sidebar.universities}
        description={t.description}
        actions={
          <>
            <label className="relative min-w-0 basis-full sm:w-72 sm:flex-1 sm:basis-auto">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-3 size-4 text-muted-foreground"
              />
              <span className="sr-only">{t.search}</span>
              <Input
                type="search"
                className="pl-10"
                placeholder={t.search}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <Button
              type="button"
              className="w-full sm:w-auto"
              disabled={!ready}
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
                  "h-auto min-h-9 whitespace-normal rounded-full px-4 py-1 text-sm",
                  item === filter &&
                    "border-foreground bg-foreground text-background hover:bg-foreground/90",
                )}
                onClick={() => setFilter(item)}
              >
                {t.filters[item]}{" "}
                {
                  records.filter((record) =>
                    matchesUniversity(record, item, "", today),
                  ).length
                }
              </Button>
            ))}
          </nav>
        }
      />
      <div className="px-4 pb-10 md:px-6 xl:px-8">
        <Card className="overflow-hidden">
          <CardContent className="p-4 lg:p-6">
            <Table
              className="min-w-5xl"
              aria-label={dictionary.sidebar.universities}
              compact
            >
              <TableHeader>
                <TableRow>
                  {columns.map((key) => (
                    <TableHead key={key}>{t.columns[key]}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((record) => {
                  const primary = record.assignments.filter(
                    ({ backup }) => !backup,
                  ).length;
                  const backups = record.assignments.length - primary;
                  return (
                    <TableRow
                      key={record.id}
                      className={cn(
                        "transition-colors hover:bg-muted/40",
                        !record.checkedOn && "bg-destructive-tint/20",
                      )}
                    >
                      <TableCell className="w-64">
                        <Link
                          href={
                            "/universities/" + encodeURIComponent(record.id)
                          }
                          className="font-semibold wrap-anywhere hover:text-primary-hover hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {record.name}
                        </Link>
                        <p className="mt-1 text-sm text-muted-foreground wrap-anywhere">
                          {[
                            record.city,
                            record.summary,
                            record.programs.length
                              ? t.programCount.replace(
                                  "{count}",
                                  String(record.programs.length),
                                )
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {universityDate(record.intake, locale, "month")}
                      </TableCell>
                      <TableCell className="font-semibold wrap-anywhere">
                        {applicationWindow(record, locale, t, true)}
                      </TableCell>
                      <TableCell>{record.topik || "—"}</TableCell>
                      <TableCell>{record.bankProof || "—"}</TableCell>
                      <TableCell>
                        <UniversityStatus record={record} today={today} />
                        <p className="mt-1 text-sm text-muted-foreground">
                          {record.checkedOn
                            ? universityDate(record.checkedOn, locale)
                            : t.pending}
                        </p>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "font-semibold",
                          !record.assignments.length && "text-muted-foreground",
                        )}
                      >
                        {[
                          primary || "",
                          backups
                            ? t.backupCount.replace("{count}", String(backups))
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" · ") || "0"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <Pagination
              {...pagination}
              tableLabel={dictionary.sidebar.universities}
            />
            {visible.length === 0 && (
              <p className="py-12 text-center text-sm text-muted-foreground">
                {t.empty}
              </p>
            )}
          </CardContent>
        </Card>
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
