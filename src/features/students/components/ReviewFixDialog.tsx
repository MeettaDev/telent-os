"use client";

import { useState, type FormEvent } from "react";
import { dictionaries, type Locale } from "@/common/i18n/dictionaries";
import { Button, buttonVariants } from "@/components/ui/button";
import { DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { dateLabel } from "@/features/students/lib/student-workflow";
import { reviewReasons } from "@/features/students/mocks/students-data";
import type {
  DocumentId,
  PaperReview,
} from "@/features/students/types/student";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";

const reasons = [...reviewReasons, "other"] as const;
type Reason = (typeof reasons)[number];

export function ReviewFixDialog({
  student,
  document,
  paper,
  otherApproved,
  nextCheck,
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

  const effects = [
    [
      copy.app,
      copy.appDetail
        .replace("{group}", () => t.documents[document].title)
        .replace("{paper}", () => paperName),
    ],
    [copy.chat, copy.chatDetail],
    [
      copy.otherPapers,
      copy.otherPapersDetail.replace("{count}", String(otherApproved)),
    ],
    [
      copy.clock,
      copy.clockDetail.replace("{version}", String(paper.version + 1)),
    ],
    [copy.nextCheck, dateLabel(nextCheck, locale, t.today, t.noDate)],
  ];
  const chipClass =
    "h-auto min-h-9 whitespace-normal rounded-full px-3 py-1.5 text-sm";
  const selectedClass =
    "border-primary bg-primary-tint font-bold text-primary-hover";

  return (
    <DialogContent
      closeLabel={t.close}
      aria-describedby={undefined}
      className="max-h-9/10 max-w-xl p-5 sm:p-7"
    >
      <DialogTitle className="pr-8 text-xl font-bold wrap-anywhere">
        {copy.title
          .replace("{paper}", () => paperName)
          .replace("{student}", () => student)}
      </DialogTitle>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <fieldset className="min-w-0">
          <legend className="mb-3 text-xs font-bold uppercase text-primary-hover">
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
                  className={buttonVariants({
                    variant: "outline",
                    className: cn(
                      chipClass,
                      "peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
                      selected === reason && selectedClass,
                    ),
                  })}
                >
                  {reason === "other" ? copy.other : t.review.reasons[reason]}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="fix-message"
            className="text-xs font-bold uppercase text-primary-hover"
          >
            {copy.message}
          </label>
          <div role="group" aria-label={copy.language} className="flex gap-2">
            {(["en", "my"] as const).map((value) => (
              <Button
                key={value}
                type="button"
                variant="outline"
                aria-pressed={language === value}
                className={cn(chipClass, language === value && selectedClass)}
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
          className="min-h-20 resize-y text-sm leading-5"
          placeholder={review.reasonPlaceholder}
          onChange={(event) => {
            setError("");
            setEdits({ ...edits, [language]: event.target.value });
          }}
        />
        <section aria-labelledby="fix-effects">
          <h3
            id="fix-effects"
            className="text-xs font-bold uppercase text-primary-hover"
          >
            {copy.effects}
          </h3>
          <dl className="mt-3 grid gap-2 rounded-xl bg-muted/60 p-4 text-sm leading-5">
            {effects.map(([label, detail]) => (
              <div key={label} className="grid gap-1 sm:grid-cols-5 sm:gap-3">
                <dt className="font-semibold text-muted-foreground">{label}</dt>
                <dd className="wrap-anywhere sm:col-span-4">{detail}</dd>
              </div>
            ))}
          </dl>
        </section>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex-1 text-xs text-muted-foreground">
            {copy.audit.replace("{version}", String(paper.version))}
          </p>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="text-sm"
              onClick={onCancel}
            >
              {t.cancel}
            </Button>
            <Button
              type="submit"
              disabled={!selected || !message.trim()}
              className="bg-orange-700 text-sm text-white hover:bg-orange-800"
            >
              {copy.send}
            </Button>
          </div>
        </div>
      </form>
    </DialogContent>
  );
}
