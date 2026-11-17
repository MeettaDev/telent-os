"use client";
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
import { Badge } from "@/components/ui/badge";
import {
  ActorBadge,
  DocumentBadge,
} from "@/features/students/components/StudentStatus";
import { documentRows } from "@/features/students/mocks/students-data";
import { dateLabel } from "@/features/students/lib/student-workflow";
import { useStudentsStore } from "@/features/students/stores/students-store";
import type { DocumentId, Student } from "@/features/students/types/student";
import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";

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
  const customRows = (messages ?? []).flatMap(({ id, action }) =>
    action?.kind === "file" && action.document === null && action.fileName
      ? [{ id: null, key: id, name: action.fileName, due: action.date }]
      : [],
  );
  const { pageRows, pagination } = usePagination(
    [...documentRows, ...customRows],
    student.id,
  );
  const approved = documentRows.filter(
    ({ id }) => statuses[student.id + ":" + id] === "approved",
  ).length;
  return (
    <Card id="student-documents" className="scroll-mt-40">
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 px-9 pb-4 pt-8 lg:px-11">
        <CardTitle>
          {t.detail.documents} ·{" "}
          {t.detail.approvedCount
            .replace("{approved}", String(approved))
            .replace(
              "{total}",
              String(documentRows.length + customRows.length),
            )}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{t.detail.fromPlan}</p>
      </CardHeader>
      <CardContent className="px-4 pb-4 lg:px-6 lg:pb-6">
        <Table
          aria-label={t.detail.documents}
          className="min-w-2xl table-fixed text-sm leading-5"
        >
          <TableHeader>
            <TableRow>
              <TableHead className="w-3/10 py-3 text-xs">
                {t.detail.document}
              </TableHead>
              <TableHead className="w-1/5 py-3 text-xs">
                {t.detail.appShows}
              </TableHead>
              <TableHead className="w-1/6 whitespace-nowrap py-3 text-xs">
                {t.columns.turn}
              </TableHead>
              <TableHead className="w-1/8 py-3 text-xs">
                {t.detail.due}
              </TableHead>
              <TableHead className="py-3 text-xs">
                <span className="sr-only">{t.action}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((row) => {
              const { id, due } = row;
              if (id === null) {
                return (
                  <TableRow key={row.key}>
                    <TableCell className="py-2.5 font-semibold wrap-anywhere">
                      {row.name}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <DocumentBadge status="toSend" />
                    </TableCell>
                    <TableCell className="py-2.5">
                      <ActorBadge actor="student" />
                    </TableCell>
                    <TableCell className="whitespace-nowrap py-2.5 text-sm font-semibold">
                      {dateLabel(due, locale, t.today, t.noDate)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                );
              }
              const status = statuses[student.id + ":" + id] ?? "toSend";
              const request = messages?.findLast(
                ({ action }) =>
                  action?.kind === "file" && action.document === id,
              )?.action;
              return (
                <TableRow key={id}>
                  <TableCell className="py-2.5">
                    <p className="font-semibold">{t.documents[id].title}</p>
                    <p className="mt-1 text-xs leading-4.5 text-muted-foreground">
                      {status === "toSend"
                        ? t.statuses.toSend
                        : t.documents[id].detail}
                    </p>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <DocumentBadge status={status} />
                  </TableCell>
                  <TableCell className="py-2.5">
                    {status === "approved" ? (
                      <Badge variant="secondary">—</Badge>
                    ) : (
                      <ActorBadge
                        actor={status === "checking" ? "meetta" : "student"}
                      />
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap py-2.5 text-sm font-semibold">
                    {request?.kind === "file"
                      ? dateLabel(request.date, locale, t.today, t.noDate)
                      : id === "topik"
                        ? t.detail.december
                        : dateLabel(due, locale, t.today, t.noDate)}
                  </TableCell>
                  <TableCell className="py-2.5">
                    {status === "toSend" || status === "fix" ? (
                      <Button
                        variant="app-text"
                        type="button"
                        className="h-auto whitespace-nowrap p-0 text-sm text-primary-hover"
                        onClick={() => onRequest(id)}
                      >
                        {t.detail.remind} ›
                      </Button>
                    ) : status === "longTerm" ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <Link
                        href={"/students/" + student.id + "/review/" + id}
                        className={cn(
                          buttonVariants({ variant: "app-text" }),
                          "h-auto whitespace-nowrap p-0 text-sm text-primary-hover",
                        )}
                      >
                        {status === "approved"
                          ? t.detail.view
                          : t.detail.openReview}{" "}
                        ›
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <Pagination {...pagination} tableLabel={t.detail.documents} />
      </CardContent>
    </Card>
  );
}
