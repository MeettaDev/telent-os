"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { useMockUser } from "@/common/auth/mock-auth";
import styles from "@/common/components/workspace.module.css";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { selectClassName } from "@/features/students/components/StudentActionDialog";
import {
  intakeOwners,
  studentContactSchema,
  type StudentContact,
} from "@/features/students/lib/student-intake";
import {
  addDays,
  callDateLabel,
  consultationDuration,
  consultationNextAction,
  isCallSlotTaken,
  dateLabel,
  yangonToday,
  type CallAction,
} from "@/features/students/lib/student-workflow";
import { useStudentsStore } from "@/features/students/stores/students-store";
import {
  consultationAttendance,
  consultationModes,
  consultationOutcomes,
  contactChannels,
  contactPeople,
  dateSchema,
  intakeChannels,
  referralSources,
  type Consultation,
  type ConsultationBooking,
  type ConsultationOutcome,
  type Student,
} from "@/features/students/types/student";
import { useUniversitiesStore } from "@/features/universities/stores/universities-store";
import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";

type SheetProps = {
  student: Student;
  onClose: () => void;
  restoreFocus: () => void;
};
type IntakeSheetProps = SheetProps & {
  student: Student & { intake: NonNullable<Student["intake"]> };
};

const label = "block text-xs font-semibold text-muted-foreground";
const selectClass = cn(selectClassName, "h-12 rounded-full px-4");
const outline = "rounded-full border-primary px-4 text-sm text-foreground";
const times = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:30"];
const inboxTimes = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "13:30",
  "14:00",
  "15:30",
];
const unavailableInboxTimes = ["09:30", "11:00"];
const owners = ["H", "N"] as const;

function SheetForm({
  student,
  onClose,
  restoreFocus,
  title,
  submit,
  onSubmit,
  disabled,
  error,
  className,
  children,
}: SheetProps & {
  title: string;
  submit?: string;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  const { dictionary } = useLocale();
  const t = dictionary.studentWorkspace;
  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="right"
        className={cn(
          styles.palette,
          "w-full border-0 sm:max-w-130 sm:rounded-l-3xl",
          className,
        )}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          restoreFocus();
        }}
      >
        <header className="shrink-0 px-5 pt-6 sm:px-7 sm:pt-7">
          <SheetTitle className="text-[25px] leading-tight font-bold">
            {title}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {student.name}
          </SheetDescription>
        </header>
        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4.5 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
            {children}
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
          <footer className="mx-5 flex shrink-0 flex-wrap items-center justify-end gap-2.5 border-t py-4 sm:mx-7 sm:pb-6">
            <SheetClose asChild>
              <Button type="button" variant="outline" className={outline}>
                {submit ? t.cancel : t.close}
              </Button>
            </SheetClose>
            {submit && (
              <Button
                type="submit"
                disabled={disabled}
                className="h-11 rounded-full px-6 text-lg"
              >
                {submit}
              </Button>
            )}
          </footer>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function Choices<Option extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  labels,
  segmented,
}: {
  name: string;
  legend: string;
  options: readonly Option[];
  value: string;
  onChange: (value: Option) => void;
  labels: Record<Option, string>;
  segmented?: boolean;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className={label}>{legend}</legend>
      <div
        className={cn(
          "mt-3 flex gap-1",
          segmented ? "rounded-full bg-muted p-1" : "flex-wrap gap-2",
        )}
      >
        {options.map((option) => (
          <label
            key={option}
            className={cn("relative", segmented && "min-w-0 flex-1")}
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="peer sr-only"
            />
            <span
              className={cn(
                "flex min-h-10 cursor-pointer items-center justify-center rounded-full px-3 py-1.5 text-center text-sm font-medium text-muted-foreground peer-checked:font-semibold peer-checked:text-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-primary",
                segmented
                  ? "peer-checked:bg-card peer-checked:shadow-sm"
                  : "border border-transparent bg-muted peer-checked:border-primary peer-checked:bg-primary-tint",
              )}
            >
              {labels[option]}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function BookConsultationSheet({
  inboxBooking,
  ...props
}: SheetProps & {
  inboxBooking?: { host: string; onSend: (action: CallAction) => void };
}) {
  const { student, onClose } = props;
  const { dictionary, locale } = useLocale();
  const t = dictionary.studentWorkspace;
  const copy = t.consultation;
  const call = dictionary.inboxWorkspace.callBooking;
  const user = useMockUser();
  const messages = useStudentsStore((state) => state.messages);
  const consultation = student.intake?.consultation;
  const appointment =
    !inboxBooking && consultation?.status === "scheduled"
      ? consultation
      : undefined;
  const [days] = useState(() => {
    const today = yangonToday();
    const upcoming = Array.from({ length: 6 }, (_, index) =>
      addDays(today, index + 1),
    )
      .filter((date) => new Date(date + "T00:00:00Z").getUTCDay() !== 0)
      .slice(0, 5);
    if (
      appointment &&
      appointment.date > today &&
      !upcoming.includes(appointment.date)
    )
      return [...upcoming.slice(0, 4), appointment.date].sort();
    return upcoming;
  });
  const [date, setDate] = useState(
    appointment && days.includes(appointment.date) ? appointment.date : days[0],
  );
  const [time, setTime] = useState(appointment?.time.slice(0, 5) ?? "10:00");
  const [mode, setMode] = useState(appointment?.mode ?? "online");
  const [host, setHost] = useState(appointment?.host ?? student.owner ?? "H");
  const [error, setError] = useState("");
  const hostName = inboxBooking?.host ?? intakeOwners[host];
  const duration = inboxBooking ? call.duration : copy.duration;
  const canBook = (slot: string) =>
    !(inboxBooking && unavailableInboxTimes.includes(slot)) &&
    !isCallSlotTaken(messages, student.id, hostName, date, slot, {
      duration: inboxBooking ? 30 : consultationDuration,
      ignoreId: appointment?.messageId,
    });
  const availableTimes = inboxBooking
    ? inboxTimes
    : appointment && !times.includes(appointment.time.slice(0, 5))
      ? [...times, appointment.time.slice(0, 5)].sort()
      : times;
  const selected = canBook(time) ? time : availableTimes.find(canBook);
  const dateText = callDateLabel(date, locale);
  const weekday = new Intl.DateTimeFormat(locale === "my" ? "my-MM" : "en-US", {
    weekday: "short",
    timeZone: "UTC",
  });
  const dayNumber = new Intl.DateTimeFormat(
    locale === "my" ? "my-MM" : "en-US",
    { day: "numeric", timeZone: "UTC" },
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    try {
      if (inboxBooking) {
        inboxBooking.onSend({
          kind: "call",
          date,
          time: selected,
          booking: { mode, host: hostName },
        });
        onClose();
        return;
      }
      if (
        !useStudentsStore.getState().bookConsultation(
          student.id,
          {
            date,
            time: selected,
            mode,
            host,
          },
          user.username,
          call.booked,
        )
      ) {
        setError(call.slotUnavailable);
        return;
      }
      toast.success(
        appointment ? t.history.consultationRescheduled : call.booked,
      );
      onClose();
    } catch (error) {
      setError(
        error instanceof Error && error.message === "Call slot unavailable"
          ? call.slotUnavailable
          : t.saveError,
      );
    }
  }

  return (
    <SheetForm
      {...props}
      title={
        inboxBooking
          ? dictionary.inboxWorkspace.actions.call
          : appointment
            ? copy.reschedule
            : copy.book
      }
      submit={
        inboxBooking
          ? call.send
          : appointment
            ? copy.reschedule
            : copy.bookButton
      }
      onSubmit={submit}
      disabled={!selected}
      error={error}
      className={inboxBooking ? "sm:max-w-125 [&_legend]:uppercase" : undefined}
    >
      <Choices
        name="consultation-mode"
        legend={call.how}
        options={consultationModes}
        value={mode}
        onChange={setMode}
        labels={call.modes}
        segmented
      />
      <fieldset>
        <legend className={label}>{call.day}</legend>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {days.map((day) => (
            <label key={day} className="relative min-w-0">
              <input
                type="radio"
                name="consultation-day"
                className="peer sr-only"
                aria-label={callDateLabel(day, locale)}
                checked={day === date}
                onChange={() => {
                  setDate(day);
                  setError("");
                }}
              />
              <span className="flex min-h-16 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-2xl bg-muted text-muted-foreground peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-primary">
                <span className="text-xs">
                  {weekday.format(new Date(day + "T00:00:00Z"))}
                </span>
                <span className="text-lg font-bold">
                  {dayNumber.format(new Date(day + "T00:00:00Z"))}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className={label}>
          {call.time} · {dateText} · {duration}
        </legend>
        <div
          className={cn(
            "mt-3 grid gap-2",
            inboxBooking ? "grid-cols-4" : "grid-cols-3",
          )}
        >
          {availableTimes.map((slot) => (
            <label key={slot} className="relative">
              <input
                type="radio"
                name="consultation-time"
                className="peer sr-only"
                checked={selected === slot}
                disabled={!canBook(slot)}
                onChange={() => {
                  setTime(slot);
                  setError("");
                }}
              />
              <span className="flex min-h-10 cursor-pointer items-center justify-center rounded-full border border-transparent bg-muted text-sm tabular-nums text-muted-foreground peer-checked:border-primary peer-checked:bg-primary-tint peer-checked:font-semibold peer-checked:text-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-disabled:cursor-default peer-disabled:opacity-50">
                {slot}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {!inboxBooking && (
        <label className="block space-y-3">
          <span className={label}>{copy.with}</span>
          <select
            value={host}
            className={selectClass}
            onChange={(event) => {
              setHost(event.target.value as ConsultationBooking["host"]);
              setError("");
            }}
          >
            {owners.map((owner) => (
              <option key={owner} value={owner}>
                {intakeOwners[owner]}
              </option>
            ))}
          </select>
        </label>
      )}
      {selected ? (
        <div className="space-y-3">
          <h3 className={cn(label, inboxBooking && "uppercase")}>
            {copy.studentPreview}
          </h3>
          <div className="space-y-1 rounded-2xl bg-muted p-4">
            <p className="font-semibold">
              {call.booked} · {dateText} · {selected}
            </p>
            <p className="text-sm text-muted-foreground">
              {call.locations[mode]} · {duration} ·{" "}
              {call.withHost.replace("{host}", hostName)}
            </p>
          </div>
        </div>
      ) : (
        <p role="status" className="text-sm text-muted-foreground">
          {call.noTimes}
        </p>
      )}
    </SheetForm>
  );
}

export function RecordConsultationSheet(
  props: IntakeSheetProps & {
    appointment: Extract<Consultation, { status: "scheduled" }>;
  },
) {
  const { student, appointment, onClose } = props;
  const { dictionary, locale } = useLocale();
  const t = dictionary.studentWorkspace;
  const copy = t.consultation;
  const prefix = useId();
  const programs = useUniversitiesStore((state) => state.records);
  const [status, setStatus] =
    useState<(typeof consultationAttendance)[number]>("completed");
  const [date, setDate] = useState(() => {
    const today = yangonToday();
    return appointment.date > today ? today : appointment.date;
  });
  const [goal, setGoal] = useState("");
  const [outcome, setOutcome] = useState<
    (typeof consultationOutcomes)[number] | ""
  >("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const result: ConsultationOutcome | null =
    status !== "completed"
      ? { status, date, notes }
      : outcome
        ? { status, date, goal, notes, outcome }
        : null;
  const next =
    result && dateSchema.safeParse(date).success
      ? consultationNextAction(result)
      : null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!result) return;
    if (!dateSchema.safeParse(date).success || date > yangonToday()) {
      setError(t.intake.errors.invalidDate);
      return;
    }
    try {
      if (
        !useStudentsStore
          .getState()
          .recordConsultationOutcome(student.id, result)
      ) {
        setError(t.saveError);
        return;
      }
      toast.success(
        next?.now === "plan" && next.nextCheck
          ? copy.outcomeSaved +
              " · " +
              copy.planDue.replace(
                "{date}",
                dateLabel(next.nextCheck, locale, t.today, t.noDate),
              )
          : copy.outcomeSaved,
        { position: "bottom-center" },
      );
      onClose();
    } catch {
      setError(t.saveError);
    }
  }

  return (
    <SheetForm
      {...props}
      title={copy.record}
      submit={copy.saveOutcome}
      onSubmit={submit}
      disabled={!result || !date}
      error={error}
    >
      <Choices
        name="consultation-attendance"
        legend={copy.attendance}
        options={consultationAttendance}
        value={status}
        onChange={setStatus}
        labels={t.intake.statuses}
        segmented
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor={prefix + "date"} className={label}>
            {copy.date}
          </label>
          <DatePicker
            id={prefix + "date"}
            label={copy.date}
            value={date}
            onChange={(value) => {
              setDate(value);
              setError("");
            }}
            locale={locale === "my" ? "my-MM" : "en-US"}
            placeholder={t.intake.pickDate}
            clearLabel={t.intake.clearDate}
            className="h-12 rounded-full px-4"
          />
        </div>
        {status === "completed" && (
          <label className="block space-y-1.5">
            <span className={label}>{copy.programInterest}</span>
            <Input
              value={goal}
              maxLength={200}
              list={prefix + "programs"}
              className="h-12 rounded-full"
              onChange={(event) => setGoal(event.target.value)}
              placeholder={t.intake.notDecided}
            />
            <datalist id={prefix + "programs"}>
              {Array.from(
                new Set([
                  "D2 Caregiver",
                  ...programs.flatMap((record) =>
                    record.programs.map(({ name }) => name),
                  ),
                ]),
              ).map((program) => (
                <option key={program} value={program} />
              ))}
            </datalist>
          </label>
        )}
      </div>
      {status === "completed" && (
        <Choices
          name="consultation-outcome"
          legend={t.intake.outcome}
          options={consultationOutcomes}
          labels={copy.outcomes}
          value={outcome}
          onChange={setOutcome}
        />
      )}
      <label className="block space-y-3">
        <span className={label}>
          {t.intake.note}{" "}
          <span className="ml-1 font-normal">{t.intake.optional}</span>
        </span>
        <Textarea
          value={notes}
          maxLength={1000}
          className="min-h-21 rounded-2xl"
          onChange={(event) => setNotes(event.target.value)}
        />
      </label>
      {next && (
        <section className="space-y-3">
          <h3 className={label}>{copy.next}</h3>
          <div className="space-y-1 rounded-2xl bg-primary-tint p-4">
            <p className="font-semibold">
              {next.now === "none" ? t.filters.noOne : t.now[next.now].title}
            </p>
            {next.nextCheck && (
              <p className="text-sm text-muted-foreground">
                {t.detail.due}{" "}
                {dateLabel(next.nextCheck, locale, t.today, t.noDate)} ·{" "}
                {intakeOwners[student.owner ?? "H"]}
              </p>
            )}
          </div>
        </section>
      )}
    </SheetForm>
  );
}

export function ConsultationNotesSheet(
  props: IntakeSheetProps & {
    result: Exclude<Consultation, { status: "inquiry" | "scheduled" }>;
  },
) {
  const { result, student } = props;
  const { dictionary, locale } = useLocale();
  const t = dictionary.studentWorkspace;
  const outcome =
    result.status === "completed"
      ? consultationOutcomes.find((value) => value === result.outcome)
      : undefined;
  return (
    <SheetForm {...props} title={t.consultation.viewNotes}>
      <div className="space-y-1">
        <p className="font-semibold">
          {result.status === "completed"
            ? [
                outcome ? t.consultation.outcomes[outcome] : result.outcome,
                result.goal,
              ]
                .filter(Boolean)
                .join(" · ")
            : t.intake.statuses[result.status]}
        </p>
        <p className="text-sm text-muted-foreground">
          {callDateLabel(result.date, locale)}
        </p>
      </div>
      <p className="whitespace-pre-wrap wrap-anywhere">
        {(result.notes ?? student.intake.note) || t.intake.notProvided}
      </p>
    </SheetForm>
  );
}

export function EditIntakeSheet(props: IntakeSheetProps) {
  const { student, onClose } = props;
  const { dictionary } = useLocale();
  const t = dictionary.studentWorkspace;
  const copy = t.intake;
  const [error, setError] = useState("");
  const [values, setValues] = useState<StudentContact>({
    name: student.name,
    reachableContact: student.phone,
    channel: student.intake.channel,
    contactChannel: student.intake.contactChannel,
    contactPerson: student.intake.contactPerson,
    referralSource: student.intake.referralSource,
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validated = studentContactSchema.safeParse(values);
    if (!validated.success) {
      const issue = validated.error.issues[0]
        .message as keyof typeof copy.errors;
      setError(copy.errors[issue] ?? t.required);
      return;
    }
    try {
      if (
        !useStudentsStore
          .getState()
          .updateIntakeContact(student.id, validated.data)
      ) {
        setError(t.consultation.duplicatePhone);
        return;
      }
      toast.success(t.saved);
      onClose();
    } catch {
      setError(t.saveError);
    }
  }
  function update(field: keyof StudentContact, value: string) {
    setError("");
    setValues((current) => ({ ...current, [field]: value }));
  }
  return (
    <SheetForm
      {...props}
      title={t.consultation.editContact}
      submit={t.goalSteps.save}
      onSubmit={submit}
      error={error}
    >
      <label className="block space-y-1.5">
        <span className={label}>{copy.name}</span>
        <Input
          value={values.name}
          maxLength={120}
          required
          onChange={(event) => update("name", event.target.value)}
          className="h-12 rounded-full"
        />
      </label>
      <label className="block space-y-1.5">
        <span className={label}>{copy.reachableContact}</span>
        <Input
          type="tel"
          value={values.reachableContact}
          maxLength={200}
          required
          onChange={(event) => update("reachableContact", event.target.value)}
          className="h-12 rounded-full"
        />
      </label>
      {(
        [
          ["contactChannel", copy.contactChannel, contactChannels],
          ["channel", copy.cameInBy, intakeChannels],
          ["referralSource", copy.referralSource, referralSources],
        ] as const
      ).map(([field, title, options]) => (
        <label key={field} className="block space-y-1.5">
          <span className={label}>{title}</span>
          <select
            className={selectClass}
            value={values[field]}
            onChange={(event) => update(field, event.target.value)}
          >
            {field === "referralSource" && (
              <option value="">{copy.notProvided}</option>
            )}
            {options.map((option) => (
              <option key={option} value={option}>
                {copy.channels[option]}
              </option>
            ))}
          </select>
        </label>
      ))}
      <Choices
        name="intake-contact-person"
        legend={copy.contactPerson}
        options={contactPeople}
        value={values.contactPerson}
        onChange={(value) => update("contactPerson", value)}
        labels={copy.people}
        segmented
      />
    </SheetForm>
  );
}
