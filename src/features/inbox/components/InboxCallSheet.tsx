"use client";

import { useState, type FormEvent } from "react";
import { Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  addDays,
  callDateLabel,
  isCallSlotTaken,
  yangonToday,
  type CallAction,
} from "@/features/students/lib/student-workflow";
import { useStudentsStore } from "@/features/students/stores/students-store";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";

const modes = ["online", "office"] as const;
const times = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "13:30",
  "14:00",
  "15:30",
];
const unavailable = ["09:30", "11:00"];
const legend = "text-xs font-bold uppercase text-primary-hover";
const selected =
  "border-primary bg-primary-tint font-semibold text-primary-hover";
const focusRing =
  "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-card";

export function InboxCallSheet({
  studentId,
  studentName,
  host,
  onClose,
  onRestoreFocus,
  onSend,
}: {
  studentId: string;
  studentName: string;
  host: string;
  onClose: () => void;
  onRestoreFocus: () => void;
  onSend: (action: CallAction) => void;
}) {
  const { dictionary, locale } = useLocale();
  const t = dictionary.inboxWorkspace;
  const copy = t.callBooking;
  const s = dictionary.studentWorkspace;
  const messages = useStudentsStore((state) => state.messages);
  const [days] = useState(() => {
    const today = yangonToday();
    return Array.from({ length: 6 }, (_, index) => addDays(today, index + 1))
      .filter((day) => new Date(day + "T00:00:00Z").getUTCDay() !== 0)
      .slice(0, 5);
  });
  const [date, setDate] = useState(days[0]);
  const [time, setTime] = useState("10:00");
  const [mode, setMode] = useState<(typeof modes)[number]>("online");
  const [error, setError] = useState("");
  const canBook = (slot: string) =>
    !unavailable.includes(slot) &&
    !isCallSlotTaken(messages, studentId, host, date, slot);
  const selectedTime = canBook(time) ? time : times.find(canBook);
  const dayLabel = callDateLabel(date, locale);
  const dayFormat = new Intl.DateTimeFormat(
    locale === "my" ? "my-MM" : "en-US",
    {
      weekday: "short",
      timeZone: "UTC",
    },
  );
  const dayNumber = new Intl.DateTimeFormat(
    locale === "my" ? "my-MM" : "en-US",
    {
      day: "numeric",
      timeZone: "UTC",
    },
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTime) return;
    try {
      onSend({
        kind: "call",
        date,
        time: selectedTime,
        booking: { mode, host },
      });
      onClose();
    } catch {
      setError(copy.slotUnavailable);
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
              {t.actions.call}
            </SheetTitle>
            <SheetDescription className="mt-1 text-sm text-muted-foreground">
              {studentName} · {copy.description}
            </SheetDescription>
          </div>
          <SheetClose asChild>
            <Button
              type="button"
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
              <legend className={legend}>{copy.how}</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {modes.map((option) => (
                  <label
                    key={option}
                    className={cn(
                      "cursor-pointer rounded-full border px-3 py-2 text-sm",
                      focusRing,
                      mode === option && selected,
                    )}
                  >
                    <input
                      type="radio"
                      name="call-mode"
                      className="sr-only"
                      checked={mode === option}
                      onChange={() => {
                        setMode(option);
                        setError("");
                      }}
                    />
                    {copy.modes[option]}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="min-w-0">
              <legend className={legend}>{copy.day}</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {days.map((day) => {
                  const parsed = new Date(day + "T00:00:00Z");
                  return (
                    <label
                      key={day}
                      className={cn(
                        "flex min-h-16 min-w-12 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border px-2 py-1.5 text-center sm:min-w-14",
                        focusRing,
                        date === day &&
                          "border-primary bg-primary text-primary-foreground",
                      )}
                    >
                      <input
                        type="radio"
                        name="call-day"
                        aria-label={callDateLabel(day, locale)}
                        className="sr-only"
                        checked={date === day}
                        onChange={() => {
                          setDate(day);
                          setError("");
                        }}
                      />
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          date !== day && "text-muted-foreground",
                        )}
                      >
                        {dayFormat.format(parsed)}
                      </span>
                      <span className="text-lg font-bold">
                        {dayNumber.format(parsed)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <fieldset className="min-w-0">
              <legend className={legend}>
                {copy.time} · {dayLabel} · {copy.duration}
              </legend>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {times.map((slot) => {
                  const disabled = !canBook(slot);
                  return (
                    <label
                      key={slot}
                      className={cn(
                        "cursor-pointer rounded-xl border px-1 py-2 text-center text-sm tabular-nums",
                        focusRing,
                        selectedTime === slot && selected,
                        disabled &&
                          "cursor-default border-transparent bg-muted text-muted-foreground",
                      )}
                    >
                      <input
                        type="radio"
                        name="call-time"
                        className="sr-only"
                        disabled={disabled}
                        checked={selectedTime === slot}
                        onChange={() => {
                          setTime(slot);
                          setError("");
                        }}
                      />
                      {slot}
                    </label>
                  );
                })}
              </div>
            </fieldset>
            {selectedTime ? (
              <section aria-labelledby="call-preview">
                <h3 id="call-preview" className={legend}>
                  {copy.preview}
                </h3>
                <div className="mt-2 flex items-center gap-3 rounded-xl border p-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-tint text-primary-hover">
                    <Calendar className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold">
                      {copy.booked} · {dayLabel} · {selectedTime}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {copy.locations[mode]} · {copy.duration} ·{" "}
                      {copy.withHost.replace("{host}", host)}
                    </p>
                  </div>
                </div>
              </section>
            ) : (
              <p role="status" className="text-sm text-muted-foreground">
                {copy.noTimes}
              </p>
            )}
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
            <Button type="submit" className="text-sm" disabled={!selectedTime}>
              {copy.send}
            </Button>
          </footer>
        </form>
      </SheetContent>
    </Sheet>
  );
}
