"use client";
import { useState } from "react";
import { notFound } from "next/navigation";
import { Check, RotateCcw, ZoomIn } from "lucide-react";
import { toast } from "sonner";
import { useMockUser } from "@/common/auth/mock-auth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { WorkspacePageHeader } from "@/common/components/WorkspacePageHeader";
import { PageSkeleton } from "@/common/components/PageSkeleton";
import {
  documentRows,
  reviewReasons,
} from "@/features/students/mocks/students-data";
import { useStudentsStore } from "@/features/students/stores/students-store";
import type {
  DocumentId,
  PaperReview,
  Student,
} from "@/features/students/types/student";
import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";
import { ReviewFixDialog } from "./ReviewFixDialog";

function fixCheckDate() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 2);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Yangon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function DocumentReviewView({
  studentId,
  documentId,
}: {
  studentId: string;
  documentId: string;
}) {
  const hydrated = useStudentsStore((state) => state.hydrated);
  const student = useStudentsStore((state) =>
    state.students.find((student) => student.id === studentId),
  );
  const valid = documentRows.some((row) => row.id === documentId);
  if (!hydrated) return <PageSkeleton kind="review" />;
  if (!student || !valid) notFound();
  return (
    <ReviewWorkspace
      key={studentId + documentId}
      student={student}
      group={documentId as DocumentId}
    />
  );
}

function ReviewWorkspace({
  student,
  group,
}: {
  student: Student;
  group: DocumentId;
}) {
  const { dictionary } = useLocale();
  const t = dictionary.studentWorkspace;
  const user = useMockUser();
  const store = useStudentsStore();
  const papers = store.reviews[student.id + ":" + group] ?? [];
  const documentStatus = store.documents[student.id + ":" + group];
  const awaitingUpload =
    documentStatus === "toSend" || documentStatus === "longTerm";
  const [selected, setSelected] = useState(papers[0]?.id ?? "");
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [compare, setCompare] = useState(false);
  const [error, setError] = useState("");
  const [fixDraft, setFixDraft] = useState<{
    paper: PaperReview;
    nextCheck: string;
  } | null>(null);
  const paper = papers.find((paper) => paper.id === selected) ?? papers[0];
  if (!paper) notFound();
  const label = (id: string) =>
    t.review.papers[id as keyof typeof t.review.papers] ?? id;
  const selectedReason = reviewReasons.find((reason) =>
    paper.reasons.includes(reason),
  );
  const previewReason = [
    selectedReason && t.review.reasonDetails[selectedReason],
    paper.note,
  ]
    .filter(Boolean)
    .join(" ");
  function update(
    values: Partial<Pick<PaperReview, "checks" | "reasons" | "note">>,
  ) {
    try {
      store.updatePaper(student.id, group, paper.id, values);
      setError("");
    } catch {
      setError(t.saveError);
    }
  }
  function approve() {
    try {
      if (
        !store.decidePaper(
          student.id,
          group,
          paper.id,
          "approved",
          label(paper.id),
        )
      ) {
        setError(t.review.approveError);
        return;
      }
      setError("");
      toast.success(t.review.approvedToast);
    } catch {
      setError(t.saveError);
    }
  }
  function canvas(old = false) {
    if (awaitingUpload)
      return (
        <div
          role="status"
          className="flex min-h-96 items-center justify-center rounded-xl bg-muted p-6 text-center text-sm text-muted-foreground"
        >
          {t.review.awaitingUpload}
        </div>
      );
    return (
      <div
        role="img"
        aria-label={t.review.preview + (old ? " · v1" : " · v" + paper.version)}
        className="min-h-96 overflow-auto rounded-xl bg-slate-800 p-5 sm:p-8 xl:p-10"
      >
        <div
          className="space-y-3 transition-transform motion-reduce:transition-none"
          style={{
            transform: "rotate(" + rotation + "deg) scale(" + zoom + ")",
            transformOrigin: "center",
          }}
        >
          {(old ? [t.review.front] : [t.review.front, t.review.back]).map(
            (side) => (
              <div
                key={side}
                className="aspect-[1.58] rounded-lg bg-slate-200 p-4 text-slate-500"
              >
                <p className="text-xs font-bold uppercase text-neutral-500">
                  {group === "legalized" ? side : label(paper.id)}
                </p>
                <div className="mt-3 space-y-2">
                  {[true, false, true, false].map((long, index) => (
                    <div
                      key={index}
                      className={cn(
                        "h-2.5 rounded-full bg-slate-300",
                        long ? "w-4/5" : "w-3/5",
                      )}
                    />
                  ))}
                </div>
              </div>
            ),
          )}
          {old && (
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              {t.review.missingBackPreview}
            </p>
          )}
        </div>
      </div>
    );
  }
  return (
    <main id="main-content">
      <WorkspacePageHeader
        title={
          <span className="text-[clamp(1.375rem,3vw,1.875rem)] tracking-normal">
            {t.review.title + " · " + label(paper.id)}
          </span>
        }
      />
      <div className="grid items-start gap-5 px-4 pb-10 md:px-6 xl:grid-cols-[minmax(0,0.76fr)_minmax(0,1.3fr)_minmax(0,1fr)] xl:px-8">
        <Card className="border-0">
          <CardContent className="p-4">
            <h2 className="px-1 pb-3 text-sm font-bold uppercase text-primary">
              {t.review.paperCount
                .replace("{total}", String(papers.length))
                .replace(
                  "{approved}",
                  String(
                    awaitingUpload
                      ? 0
                      : papers.filter((paper) => paper.status === "approved")
                          .length,
                  ),
                )}
            </h2>
            <div className="grid max-h-64 grid-cols-1 gap-1 sm:grid-cols-2 overflow-y-auto xl:max-h-none xl:grid-cols-1">
              {papers.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  aria-pressed={paper.id === item.id}
                  onClick={() => {
                    setSelected(item.id);
                    setZoom(1);
                    setRotation(0);
                    setError("");
                  }}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-2xl border px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    item.id === paper.id
                      ? "border-primary bg-primary-tint"
                      : "border-transparent hover:bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                      !awaitingUpload && item.status === "approved"
                        ? "bg-emerald-700 text-white"
                        : item.status === "fix"
                          ? "bg-destructive-tint text-destructive"
                          : "bg-primary text-primary-foreground",
                    )}
                  >
                    {!awaitingUpload && item.status === "approved" ? (
                      <Check aria-hidden="true" className="size-4" />
                    ) : item.status === "fix" ? (
                      "!"
                    ) : (
                      "•"
                    )}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block text-base leading-5",
                        item.id === paper.id && "font-semibold",
                      )}
                    >
                      {label(item.id)}
                    </span>
                    <span className="block text-xs leading-4 text-muted-foreground">
                      v{item.version} ·{" "}
                      {awaitingUpload
                        ? t.statuses.toSend
                        : item.status === "approved"
                          ? t.review.ok
                          : item.status === "fix"
                            ? t.review.fix
                            : t.review.new}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="min-w-0 border-0">
          <CardContent className="p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="min-w-0 flex-1 wrap-anywhere text-sm font-semibold leading-5">
                {awaitingUpload ? (
                  t.review.awaitingUpload
                ) : (
                  <>
                    {paper.id === "fatherNrc"
                      ? "Father_NRC_both_sides"
                      : paper.id}
                    _v{paper.version}.jpg · {t.review.onePage}
                  </>
                )}
              </h2>
              <div className="flex flex-wrap items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  aria-pressed={compare}
                  disabled={awaitingUpload}
                  className="h-10 rounded-full border-primary px-4 text-sm text-foreground"
                  onClick={() => setCompare((value) => !value)}
                >
                  {compare ? t.review.hideCompare : t.review.compare}
                </Button>
              </div>
            </div>
            <div
              className={cn(
                "grid gap-3",
                compare && "sm:grid-cols-2 xl:grid-cols-1",
              )}
            >
              {compare && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold text-muted-foreground">
                    {t.review.previous}
                  </h3>
                  {canvas(true)}
                </div>
              )}
              <div>
                {compare && (
                  <h3 className="mb-2 text-xs font-semibold text-muted-foreground">
                    {t.review.current}
                  </h3>
                )}
                {canvas()}
              </div>
            </div>
            <div className="mt-2 flex justify-end gap-1">
              {" "}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t.review.zoom}
                disabled={awaitingUpload}
                onClick={() =>
                  setZoom((value) => (value >= 1.5 ? 1 : value + 0.25))
                }
              >
                <ZoomIn aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t.review.rotate}
                disabled={awaitingUpload}
                onClick={() => setRotation((value) => (value + 90) % 360)}
              >
                <RotateCcw aria-hidden="true" />
              </Button>
            </div>
          </CardContent>
        </Card>
        <fieldset disabled={awaitingUpload} className="min-w-0 space-y-4">
          <Card className="border-0">
            <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 p-5 pb-3">
              <CardTitle>{t.review.checklist}</CardTitle>
            </CardHeader>
            <CardContent className="divide-y px-5 pb-5">
              {(["names", "clear", "sides"] as const).map((check, index) => (
                <div
                  key={check}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <p className="text-sm leading-5">{t.review.checks[check]}</p>
                  <div
                    role="group"
                    aria-label={t.review.checks[check]}
                    className="flex shrink-0 rounded-full bg-muted p-0.5"
                  >
                    {(["ok", "fix"] as const).map((value) => (
                      <Button
                        key={value}
                        variant="ghost"
                        type="button"
                        aria-pressed={
                          !awaitingUpload && paper.checks[index] === value
                        }
                        className={cn(
                          "h-7 rounded-full px-2.5 text-xs",
                          !awaitingUpload &&
                            paper.checks[index] === value &&
                            (value === "ok"
                              ? "bg-card text-emerald-700 shadow-sm dark:text-emerald-300"
                              : "bg-card text-destructive shadow-sm"),
                        )}
                        onClick={() => {
                          const checks = [...paper.checks];
                          checks[index] = value;
                          update({ checks });
                        }}
                      >
                        {t.review[value]}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-0">
            <CardHeader className="p-5 pb-3">
              <CardTitle>{t.review.decision}</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="grid gap-2">
                <Button
                  type="button"
                  className="h-11 w-full rounded-full whitespace-normal bg-emerald-700 px-3 py-2 text-sm leading-5 text-white hover:bg-emerald-800"
                  onClick={approve}
                >
                  {t.review.approve}
                </Button>
                <Dialog
                  open={Boolean(fixDraft)}
                  onOpenChange={(open) =>
                    setFixDraft(
                      open ? { paper, nextCheck: fixCheckDate() } : null,
                    )
                  }
                >
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={awaitingUpload}
                      className="h-11 w-full rounded-full whitespace-normal border-orange-700 px-3 py-2 text-sm leading-5 text-orange-700 hover:bg-orange-50 dark:text-orange-300 dark:hover:bg-orange-950/40"
                    >
                      {t.review.askFix}
                    </Button>
                  </DialogTrigger>
                  {fixDraft && (
                    <ReviewFixDialog
                      student={student.name}
                      document={group}
                      paper={fixDraft.paper}
                      otherApproved={
                        papers.filter(
                          (item) =>
                            item.id !== fixDraft.paper.id &&
                            item.status === "approved",
                        ).length
                      }
                      nextCheck={fixDraft.nextCheck}
                      onCancel={() => setFixDraft(null)}
                      onSend={(reason, message) => {
                        try {
                          if (
                            !store.decidePaper(
                              student.id,
                              group,
                              fixDraft.paper.id,
                              "fix",
                              label(fixDraft.paper.id),
                              {
                                author: user.username,
                                version: fixDraft.paper.version,
                                reason,
                                message,
                                nextCheck: fixCheckDate(),
                              },
                            )
                          )
                            return t.review.fixDialog.unavailable;
                          setFixDraft(null);
                          setError("");
                          toast.success(t.review.fixToast);
                        } catch {
                          return t.saveError;
                        }
                      }}
                    />
                  )}
                </Dialog>
              </div>
              {!awaitingUpload && paper.status === "approved" && (
                <p
                  role="status"
                  className="mt-3 text-sm text-emerald-700 dark:text-emerald-300"
                >
                  {t.review.approvedMessage}
                </p>
              )}
              {error && (
                <p role="alert" className="mt-3 text-sm text-destructive">
                  {error}
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="border-0">
            <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 p-5 pb-3">
              <CardTitle>{t.review.reasonsTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1">
                {reviewReasons.map((reason) => (
                  <Button
                    key={reason}
                    type="button"
                    variant="ghost"
                    aria-pressed={selectedReason === reason}
                    className={cn(
                      "h-8 rounded-full border px-3 text-sm",
                      selectedReason === reason
                        ? "border-orange-700 bg-orange-50 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300"
                        : "border-transparent bg-muted text-muted-foreground",
                    )}
                    onClick={() => update({ reasons: [reason] })}
                  >
                    {t.review.reasons[reason]}
                  </Button>
                ))}
              </div>
              {!awaitingUpload && (
                <>
                  <div className="rounded-xl bg-orange-50 p-4 dark:bg-orange-950/40">
                    <p className="text-xs font-bold uppercase text-orange-800 dark:text-orange-300">
                      {t.review.sentBack}
                    </p>
                    <p className="mt-2 text-sm leading-5">
                      {(paper.status === "fix" && paper.fixMessage) ||
                        (previewReason
                          ? t.review.fixPreview
                              .replace("{paper}", label(paper.id))
                              .replace("{reason}", previewReason)
                          : t.review.fixError)}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </fieldset>
      </div>
    </main>
  );
}
