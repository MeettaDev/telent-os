"use client";

import { useState, type FormEvent } from "react";
import { File, TriangleAlert, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { DocumentBadge } from "@/features/students/components/StudentStatus";
import {
  addDays,
  dateLabel,
  yangonToday,
} from "@/features/students/lib/student-workflow";
import {
  openFileRequest,
  useStudentsStore,
} from "@/features/students/stores/students-store";
import {
  dateSchema,
  type MessageAction,
  type Student,
} from "@/features/students/types/student";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";

type FileAction = Extract<MessageAction, { kind: "file" }>;

const fatherFile = { document: "legalized", paper: "fatherNrc" } as const;
const options = {
  father: fatherFile,
  passport: { document: "passport" },
  photo: { document: "photo" },
  other: { document: null },
} as const;

const sectionLabel = "text-xs font-bold uppercase text-primary-hover";
const selectedPill = "border-primary bg-primary-tint text-primary-hover";

export function InboxFileSheet({
  student,
  may,
  onClose,
  onRestoreFocus,
  onSend,
}: {
  student: Student;
  may: boolean;
  onClose: () => void;
  onRestoreFocus: () => void;
  onSend: (file: FileAction, message: string, seededOpen: boolean) => void;
}) {
  const { dictionary, locale } = useLocale();
  const t = dictionary.inboxWorkspace;
  const f = t.fileRequest;
  const s = dictionary.studentWorkspace;
  const documents = useStudentsStore((state) => state.documents);
  const reviews = useStudentsStore((state) => state.reviews);
  const messages = useStudentsStore((state) => state.messages);
  const [today] = useState(yangonToday);
  const [selected, setSelected] = useState<keyof typeof options>(
    may ? "father" : "passport",
  );
  const [fileName, setFileName] = useState("");
  const [dateChoice, setDateChoice] = useState<string>();
  const [customDate, setCustomDate] = useState("");
  const [note, setNote] = useState<string>();
  const [error, setError] = useState("");
  const formatDate = (date: string) =>
    dateLabel(date, locale, s.today, s.noDate);
  const file = {
    ...options[selected],
    ...(selected === "other" && { fileName: fileName.trim() }),
  };
  const fatherStatus = reviews[student.id + ":legalized"]?.find(
    ({ id }) => id === fatherFile.paper,
  )?.status;
  const seededOpen =
    may && selected === "father" && fatherStatus !== "approved";
  const existing = openFileRequest(
    { documents, reviews, messages },
    student.id,
    file,
  );
  const existingDate =
    existing?.action?.kind === "file" ? existing.action.date : undefined;
  const middleDate =
    existingDate && existingDate > today ? existingDate : addDays(today, 4);
  const dateOptions = [
    { key: "three", date: addDays(today, 3), days: 3 },
    { key: "existing", date: middleDate },
    { key: "seven", date: addDays(today, 7), days: 7 },
  ].filter(
    ({ date }, index, all) =>
      all.findIndex((item) => item.date === date) === index,
  );
  const choice =
    dateChoice === "custom" || dateOptions.some(({ key }) => key === dateChoice)
      ? dateChoice
      : dateOptions.find(({ date }) => date === middleDate)?.key;
  const dueDate =
    choice === "custom"
      ? customDate
      : (dateOptions.find(({ key }) => key === choice)?.date ?? "");
  const message =
    note ?? existing?.text ?? (selected === "father" ? f.defaultMessage : "");
  const fileTitle =
    selected === "father"
      ? t.initialFile
      : file.document
        ? s.documents[file.document].title
        : fileName.trim() || f.other;
  const checklist =
    selected === "father"
      ? [s.review.checks.names, s.review.checks.sides, f.clear]
      : selected === "passport"
        ? [f.colorCopy, f.clear]
        : [f.clear];
  const valid =
    (selected !== "other" || Boolean(fileName.trim())) &&
    dateSchema.safeParse(dueDate).success &&
    dueDate > today;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid) return;
    try {
      onSend({ kind: "file", ...file, date: dueDate }, message, seededOpen);
      onClose();
    } catch {
      setError(s.saveError);
    }
  }

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          onRestoreFocus();
        }}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <SheetTitle className="text-xl font-bold">
              {t.actions.file}
            </SheetTitle>
            <SheetDescription className="mt-1 text-sm text-muted-foreground">
              {student.name} · {f.description}
            </SheetDescription>
          </div>
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={s.close}
              className="size-8 shrink-0 rounded-full bg-muted"
            >
              <X aria-hidden="true" />
            </Button>
          </SheetClose>
        </header>
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-4 sm:p-6">
            <fieldset className="min-w-0">
              <legend className={sectionLabel}>{f.whatFile}</legend>
              <div className="mt-2 divide-y overflow-hidden rounded-xl border">
                {(Object.keys(options) as (keyof typeof options)[])
                  .filter((key) => may || key !== "father")
                  .map((key) => {
                    const option = options[key];
                    const status =
                      option.document &&
                      (key === "father" && fatherStatus !== "approved"
                        ? "fix"
                        : documents[student.id + ":" + option.document]);
                    const title =
                      key === "father"
                        ? t.initialFile
                        : option.document
                          ? s.documents[option.document].title
                          : f.other;
                    const detail =
                      key === "father"
                        ? f.fatherDetail
                        : option.document
                          ? s.documents[option.document].detail
                          : f.otherHint;
                    return (
                      <label
                        key={key}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-muted",
                          selected === key &&
                            "bg-primary-tint/60 hover:bg-primary-tint/60",
                        )}
                      >
                        <input
                          type="radio"
                          name="file"
                          checked={selected === key}
                          className="size-4 shrink-0 accent-primary"
                          onChange={() => {
                            setSelected(key);
                            setDateChoice(undefined);
                            setNote(undefined);
                            setError("");
                          }}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold">
                            {title}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {detail}
                          </span>
                        </span>
                        {status && <DocumentBadge status={status} />}
                      </label>
                    );
                  })}
              </div>
              {selected === "other" && (
                <Input
                  aria-label={f.fileName}
                  placeholder={f.fileName}
                  required
                  maxLength={120}
                  className="mt-2"
                  value={fileName}
                  onChange={(event) => setFileName(event.target.value)}
                />
              )}
              {(existing || seededOpen) && (
                <div className="mt-2 flex items-start gap-2 rounded-lg bg-warning/15 p-3 text-xs leading-relaxed text-warning">
                  <TriangleAlert
                    className="size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <p>{f.alreadyOpen}</p>
                </div>
              )}
            </fieldset>
            <section aria-labelledby="file-checklist">
              <div className="flex flex-wrap justify-between gap-1">
                <h3 id="file-checklist" className={sectionLabel}>
                  {f.checklist}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {f.checklistVersion}
                </span>
              </div>
              <ul className="mt-2 space-y-1 rounded-xl bg-muted/60 px-3 py-2.5 text-sm">
                {checklist.map((item) => (
                  <li key={item} className="flex items-baseline gap-2">
                    <span
                      aria-hidden="true"
                      className="size-3 shrink-0 rounded-sm border border-muted-foreground"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
            <fieldset className="min-w-0">
              <legend className={sectionLabel}>{f.date}</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  ...dateOptions.map(({ key, date, days }) => ({
                    key,
                    title:
                      days && date !== middleDate
                        ? f.inDays
                            .replace("{days}", String(days))
                            .replace("{date}", formatDate(date))
                        : formatDate(date),
                  })),
                  { key: "custom", title: f.pickDate },
                ].map(({ key, title }) => (
                  <label
                    key={key}
                    className={cn(
                      "cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium focus-within:ring-2 focus-within:ring-ring",
                      choice === key && selectedPill,
                    )}
                  >
                    <input
                      type="radio"
                      name="dateChoice"
                      className="sr-only"
                      checked={choice === key}
                      onChange={() => setDateChoice(key)}
                    />
                    {title}
                  </label>
                ))}
              </div>
              {choice === "custom" && (
                <Input
                  type="date"
                  aria-label={f.pickDate}
                  min={addDays(today, 1)}
                  required
                  value={customDate}
                  className="mt-2"
                  onChange={(event) => setCustomDate(event.target.value)}
                />
              )}
            </fieldset>
            <label className="block">
              <span className={sectionLabel}>{f.message}</span>
              <Textarea
                className="mt-2 min-h-16 text-sm"
                value={message}
                maxLength={2000}
                onChange={(event) => setNote(event.target.value)}
              />
            </label>
            <section aria-labelledby="file-preview">
              <h3 id="file-preview" className={sectionLabel}>
                {f.preview}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-3 rounded-xl border p-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-tint text-primary-hover">
                  <File className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1 wrap-anywhere">
                  <p className="text-sm font-semibold">
                    {f.previewTitle.replace("{file}", fileTitle)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {dueDate && t.dueDate + " " + formatDate(dueDate) + " · "}
                    {f.tapUpload}
                  </p>
                </div>
                <Badge variant="secondary">{f.open} ›</Badge>
              </div>
            </section>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
          <footer className="flex shrink-0 flex-wrap justify-end gap-2 border-t px-4 py-4 sm:px-6">
            <SheetClose asChild>
              <Button type="button" variant="outline" className="text-sm">
                {s.cancel}
              </Button>
            </SheetClose>
            <Button
              type="submit"
              className="h-auto min-h-10 whitespace-normal py-2 text-sm"
              disabled={!valid}
            >
              {f.send.replace("{student}", student.name)}
            </Button>
          </footer>
        </form>
      </SheetContent>
    </Sheet>
  );
}
