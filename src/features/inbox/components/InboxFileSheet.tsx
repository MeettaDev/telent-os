"use client";

import { useState, type FormEvent } from "react";
import { TriangleAlert } from "lucide-react";
import styles from "@/common/components/workspace.module.css";
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

const sectionLabel = "text-xs font-bold uppercase text-muted-foreground";
const selectedPill = "border-primary bg-primary-tint text-foreground";

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
        className={cn(
          styles.palette,
          "w-full border-0 sm:inset-y-8 sm:right-8 sm:h-auto sm:max-w-125 sm:rounded-3xl sm:shadow-2xl xl:[@media(min-height:66rem)]:top-20 xl:[@media(min-height:66rem)]:bottom-10",
        )}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          onRestoreFocus();
        }}
      >
        <header className="shrink-0 px-5 pt-5 sm:px-7 sm:pt-7">
          <SheetTitle className="text-[25px] leading-tight font-bold">
            {t.actions.file}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {student.name} · {f.description}
          </SheetDescription>
        </header>
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
            <fieldset className="min-w-0">
              <legend className={sectionLabel}>{f.whatFile}</legend>
              <div className="mt-3 space-y-2">
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
                          "relative flex cursor-pointer items-center gap-2 rounded-2xl border border-transparent bg-muted px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-ring",
                          selected === key && selectedPill,
                        )}
                      >
                        <input
                          type="radio"
                          name="file"
                          checked={selected === key}
                          className="sr-only"
                          onChange={() => {
                            setSelected(key);
                            setDateChoice(undefined);
                            setNote(undefined);
                            setError("");
                          }}
                        />
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "block text-[15px] font-medium",
                              selected === key && "font-semibold",
                            )}
                          >
                            {title}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {detail}
                          </span>
                        </span>
                        {status && (
                          <span className="shrink-0 [&_[data-slot=badge]]:rounded-full">
                            <DocumentBadge status={status} />
                          </span>
                        )}
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
              {existing && (
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
              <h3 id="file-checklist" className={sectionLabel}>
                {f.checklist}
              </h3>
              <ul className="mt-3 space-y-1.5 text-sm">
                {checklist.map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className="size-4 shrink-0 rounded-sm border border-muted-foreground"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
            <fieldset className="min-w-0">
              <legend className={sectionLabel}>{f.date}</legend>
              <div className="mt-3 flex flex-wrap gap-2">
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
                      "relative cursor-pointer rounded-full border border-transparent bg-muted px-3 py-2 text-sm font-medium text-muted-foreground focus-within:ring-2 focus-within:ring-ring",
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
                className="mt-3 min-h-17 rounded-2xl text-sm"
                value={message}
                maxLength={2000}
                onChange={(event) => setNote(event.target.value)}
              />
            </label>
            <section aria-labelledby="file-preview">
              <h3 id="file-preview" className={sectionLabel}>
                {f.preview}
              </h3>
              <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl bg-muted p-4">
                <div className="min-w-0 flex-1 wrap-anywhere">
                  <p className="font-semibold">
                    {f.previewTitle.replace("{file}", fileTitle)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {dueDate && t.dueDate + " " + formatDate(dueDate) + " · "}
                    {f.tapUpload}
                  </p>
                </div>
                <span className="text-sm font-semibold text-primary-hover">
                  {f.open} ›
                </span>
              </div>
            </section>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
          <footer className="mx-5 flex shrink-0 flex-wrap items-center justify-end gap-2.5 border-t py-4 sm:mx-7 sm:pb-6">
            <SheetClose asChild>
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-primary px-5 text-sm text-foreground"
              >
                {s.cancel}
              </Button>
            </SheetClose>
            <Button
              type="submit"
              className="h-auto min-h-11 rounded-full px-6 py-2 text-lg whitespace-normal"
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
