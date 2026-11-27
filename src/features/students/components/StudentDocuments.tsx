"use client";
import { Fragment } from "react";
import Link from "next/link";
import { Pagination, usePagination } from "@/common/components/Pagination";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { ActorBadge, DocumentBadge } from "./StudentStatus";
import { GoalProgress } from "./StudentGoals";
import { documentRows } from "@/features/students/mocks/students-data";
import { dateLabel } from "@/features/students/lib/student-workflow";
import { useStudentsStore } from "@/features/students/stores/students-store";
import type {
  DocumentId,
  DocumentStatus,
  Student,
} from "@/features/students/types/student";
import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";

const actionClass =
  "h-10 rounded-full border-primary px-4 text-sm text-foreground whitespace-nowrap";
const cell = "px-1 py-3 align-middle";
const groups: { id: string; statuses: DocumentStatus[]; tone: string }[] = [
  {
    id: "checking",
    statuses: ["checking", "fix"],
    tone: "text-muted-foreground",
  },
  { id: "toSend", statuses: ["toSend"], tone: "text-primary" },
  {
    id: "longTerm",
    statuses: ["longTerm"],
    tone: "text-violet-600 dark:text-violet-300",
  },
  {
    id: "approved",
    statuses: ["approved"],
    tone: "text-emerald-700 dark:text-emerald-300",
  },
];

export function StudentDocuments({
  student,
  onRequest,
}: {
  student: Student;
  onRequest: (id: DocumentId) => void;
}) {
  const { dictionary, locale } = useLocale();
  const t = dictionary.studentWorkspace;
  const statuses = useStudentsStore((state) => state.documents);
  const messages = useStudentsStore((state) => state.messages[student.id]);
  const rows = [
    ...documentRows.map((row) => ({
      ...row,
      key: row.id,
      name: t.documents[row.id].title,
      status:
        statuses[student.id + ":" + row.id] ?? ("toSend" as DocumentStatus),
    })),
    ...(messages ?? []).flatMap(({ id, action }) =>
      action?.kind === "file" && action.document === null && action.fileName
        ? [
            {
              id: null,
              key: id,
              name: action.fileName,
              due: action.date,
              status: "toSend" as DocumentStatus,
            },
          ]
        : [],
    ),
  ];
  const { pageRows, pagination } = usePagination(
    groups.flatMap((group) =>
      rows.filter((row) => group.statuses.includes(row.status)),
    ),
    student.id,
  );

  return (
    <Card id="student-documents" className="scroll-mt-36 border-0">
      <CardHeader className="px-5 pt-5 pb-1">
        <CardTitle>{t.detail.documents}</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        <Table
          aria-label={t.detail.documents}
          className="min-w-140 table-fixed text-sm leading-5"
        >
          <TableHeader className="border-0 bg-transparent">
            <TableRow className="border-0">
              <TableHead className="w-[35%] px-1 py-2 text-[11px]">
                {t.detail.document}
              </TableHead>
              <TableHead className="w-[18%] px-1 py-2 text-[11px]">
                {t.detail.appShows}
              </TableHead>
              <TableHead className="w-[15%] px-1 py-2 text-[11px]">
                {t.columns.turn}
              </TableHead>
              <TableHead className="w-[12%] px-1 py-2 text-[11px]">
                {t.detail.due}
              </TableHead>
              <TableHead className="w-[20%] px-1 py-2">
                <span className="sr-only">{t.action}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          {groups.map((group) => {
            const grouped = pageRows.filter((row) =>
              group.statuses.includes(row.status),
            );
            if (!grouped.length) return null;
            return (
              <TableBody key={group.id}>
                <TableRow className="border-0">
                  <TableCell
                    colSpan={5}
                    className={cn("px-1 pt-4 pb-1 font-bold", group.tone)}
                  >
                    {group.id === "toSend"
                      ? t.documentGroups.toSend
                      : t.statuses[
                          group.id as "checking" | "longTerm" | "approved"
                        ]}
                  </TableCell>
                </TableRow>
                {grouped.map((row) => {
                  const { id, status } = row;
                  const request =
                    id &&
                    messages?.findLast(
                      ({ action }) =>
                        action?.kind === "file" && action.document === id,
                    )?.action;
                  const due =
                    request && request.kind === "file" ? request.date : row.due;
                  const goal =
                    status === "longTerm" && (id === "topik" || id === "bank");
                  const detail = goal
                    ? id === "topik"
                      ? `${t.detail.topikNote} · ${t.detail.checkOct7}`
                      : `${t.documentGroups.bankDetail} · ${t.detail.checkOct9}`
                    : id
                      ? t.documents[id].detail
                      : "";
                  return (
                    <Fragment key={row.key}>
                      <TableRow className="border-0">
                        <TableCell className={cn(cell, "pr-3")}>
                          <p className="text-base font-semibold">
                            {goal
                              ? `${row.name} · ${id === "topik" ? t.documentGroups.topikLevel : "48M MMK"}`
                              : row.name}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {detail}
                          </p>
                        </TableCell>
                        <TableCell
                          className={cn(
                            cell,
                            "[&_[data-slot=badge]]:rounded-full [&_[data-slot=badge]]:text-xs",
                          )}
                        >
                          <DocumentBadge status={status} />
                        </TableCell>
                        <TableCell
                          className={cn(
                            cell,
                            "[&_[data-slot=badge]]:rounded-full [&_[data-slot=badge]]:text-xs",
                          )}
                        >
                          {status === "approved" ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <ActorBadge
                              actor={
                                status === "checking" || status === "fix"
                                  ? "meetta"
                                  : "student"
                              }
                            />
                          )}
                        </TableCell>
                        <TableCell
                          className={cn(
                            cell,
                            "font-semibold whitespace-nowrap",
                          )}
                        >
                          {id === "topik" && !request
                            ? t.detail.december
                            : dateLabel(due, locale, t.today, t.noDate)}
                        </TableCell>
                        <TableCell className={cn(cell, "text-right")}>
                          {status === "longTerm" || id === null ? (
                            <span className="text-muted-foreground">—</span>
                          ) : status === "toSend" || status === "fix" ? (
                            <Button
                              variant="outline"
                              type="button"
                              className={actionClass}
                              onClick={() => onRequest(id)}
                            >
                              {t.detail.remind}
                            </Button>
                          ) : (
                            <Link
                              href={`/students/${student.id}/review/${id}`}
                              className={cn(
                                buttonVariants({ variant: "outline" }),
                                actionClass,
                                id === "legalized" &&
                                  status === "checking" &&
                                  "bg-primary-tint",
                              )}
                            >
                              {status === "approved"
                                ? t.detail.view
                                : t.detail.openReview}
                            </Link>
                          )}
                        </TableCell>
                      </TableRow>
                      {goal && (
                        <TableRow className="border-0">
                          <TableCell colSpan={5} className="px-1 pt-0 pb-5">
                            <GoalProgress
                              steps={
                                id === "topik"
                                  ? [
                                      "study",
                                      "register",
                                      "test",
                                      "score",
                                      "upload",
                                    ]
                                  : ["plan", "save", "hold", "certificate"]
                              }
                            />
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            );
          })}
        </Table>
        <Pagination {...pagination} tableLabel={t.detail.documents} />
      </CardContent>
    </Card>
  );
}
