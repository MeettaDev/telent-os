"use client";

import { useState, type FormEvent } from "react";
import { dictionaries, type Locale } from "@/common/i18n/dictionaries";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { reviewReasons } from "@/features/students/mocks/students-data";
import type {
  DocumentId,
  PaperReview,
} from "@/features/students/types/student";
import { cn } from "@/lib/utils";
import styles from "@/common/components/workspace.module.css";
import { useLocale } from "@/providers/locale-provider";

const reasons = [...reviewReasons, "other"] as const;
type Reason = (typeof reasons)[number];

export function ReviewFixDialog({
  student,
  paper,
  onCancel,
  onSend,
}: {
  student: string;
  document: DocumentId;
  paper: PaperReview;
  otherApproved: number;
  nextCheck: string;
  onCancel: () => void;
  onSend: (reason: Reason, message: string) => string | undefined;
}) {
  const { dictionary, locale } = useLocale();
  const t = dictionary.studentWorkspace;
  const copy = t.review.fixDialog;
  const [language, setLanguage] = useState(locale);
  const [selected, setSelected] = useState<Reason | undefined>(
    () =>
      reasons.find((reason) => paper.reasons.includes(reason)) ??
      (paper.note.trim() ? "other" : undefined),
  );
  const [edits, setEdits] = useState<Partial<Record<Locale, string>>>({});
  const [error, setError] = useState("");
  const review = dictionaries[language].studentWorkspace.review;
  const paperName =
    t.review.papers[paper.id as keyof typeof t.review.papers] ?? paper.id;
  const messagePaperName =
    review.papers[paper.id as keyof typeof review.papers] ?? paper.id;
  const template =
    selected && selected !== "other" ? review.reasonDetails[selected] : "";
  const message =
    edits[language] ??
    [
      template &&
        review.fixPreview
          .replace("{paper}", () => messagePaperName)
          .replace("{reason}", () => template),
      language === locale ? paper.note.trim() : "",
    ]
      .filter(Boolean)
      .join(" ");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selected && message.trim())
      setError(onSend(selected, message.trim()) ?? "");
  }

  const chipClass =
    "h-auto min-h-9 whitespace-normal rounded-full border border-transparent bg-muted px-3.5 py-2 text-sm text-muted-foreground";
  const selectedClass =
    "border-primary bg-primary-tint font-semibold text-foreground";

  return (
    <DialogContent
      className={cn(
        styles.palette,
        "inset-3 max-h-[calc(100dvh-1.5rem)] max-w-150 rounded-3xl border-0 p-5 sm:p-6",
      )}
    >
      <DialogTitle className="pr-8 text-xl font-bold wrap-anywhere">
        {copy.title
          .replace("{paper}", () => paperName)
          .replace("{student}", () => student)}
      </DialogTitle>
      <DialogDescription className="sr-only">{copy.reason}</DialogDescription>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <fieldset className="min-w-0">
          <legend className="mb-3 text-xs font-bold uppercase text-muted-foreground">
            {copy.reason}
          </legend>
          <div className="flex flex-wrap gap-2">
            {reasons.map((reason) => (
              <label key={reason}>
                <input
                  type="radio"
                  name="fix-dialog-reason"
                  checked={selected === reason}
                  className="peer sr-only"
                  required
                  onChange={() => {
                    setSelected(reason);
                    setError("");
                  }}
                />
                <span
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    chipClass,
                    "peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
                    selected === reason && selectedClass,
                  )}
                >
                  {reason === "other" ? copy.other : t.review.reasons[reason]}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="space-y-3">
          <label
            htmlFor="fix-message"
            className="text-xs font-bold uppercase text-muted-foreground"
          >
            {copy.message}
          </label>
          <div
            role="group"
            aria-label={copy.language}
            className="grid w-50 grid-cols-2 rounded-full bg-muted p-1"
          >
            {(["en", "my"] as const).map((value) => (
              <Button
                key={value}
                type="button"
                variant="outline"
                aria-pressed={language === value}
                className={cn(
                  "h-9 rounded-full border-0 text-sm",
                  language === value
                    ? "bg-card font-semibold text-foreground shadow-sm"
                    : "bg-transparent text-muted-foreground",
                )}
                onClick={() => setLanguage(value)}
              >
                {value === "en" ? "EN" : "မြန်မာ"}
              </Button>
            ))}
          </div>
        </div>
        <Textarea
          id="fix-message"
          lang={language}
          required
          maxLength={2000}
          value={message}
          className="min-h-20 rounded-2xl border-primary text-base leading-6"
          placeholder={review.reasonPlaceholder}
          onChange={(event) => {
            setError("");
            setEdits({ ...edits, [language]: event.target.value });
          }}
        />
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2.5">
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-primary px-5 text-base text-foreground"
              onClick={onCancel}
            >
              {t.cancel}
            </Button>
            <Button
              type="submit"
              disabled={!selected || !message.trim()}
              className="rounded-full bg-orange-700 px-6 text-lg text-white hover:bg-orange-800"
            >
              {copy.send}
            </Button>
          </div>
        </div>
      </form>
    </DialogContent>
  );
}
