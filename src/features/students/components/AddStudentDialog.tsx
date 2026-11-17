"use client";

import { useEffect, useId, useRef, useState, type ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { selectClassName } from "@/features/students/components/StudentActionDialog";
import {
  findIntakeMatches,
  intakeOwners,
  studentIntakeFormSchema,
  type StudentIntakeForm,
} from "@/features/students/lib/student-intake";
import { yangonToday } from "@/features/students/lib/student-workflow";
import { useStudentsStore } from "@/features/students/stores/students-store";
import {
  consultationStatuses,
  contactChannels,
  contactPeople,
  intakeChannels,
  referralSources,
  type Student,
} from "@/features/students/types/student";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";

const defaults: StudentIntakeForm = {
  channel: "phone",
  name: "",
  reachableContact: "",
  contactChannel: "phone",
  contactPerson: "student",
  owner: "H",
  referralSource: "",
  status: "inquiry",
  scheduledDate: "",
  scheduledTime: "",
  completedDate: "",
  outcome: "",
  goal: "",
  nextAction: "",
  dueDate: "",
  googleEmail: "",
  note: "",
  separateReason: "",
};

const grid = "grid gap-4 sm:grid-cols-2 sm:gap-x-6";
const panel = "space-y-1 rounded-2xl border bg-muted/45 p-4";
const outline = "h-11 border-primary/80 px-5 sm:px-10";
const primary = "h-11 px-5 sm:px-10";
const help = "text-sm leading-5 text-muted-foreground";

export function AddStudentDialog({
  onClose,
  returnFocus,
}: {
  onClose: () => void;
  returnFocus: () => void;
}) {
  const { dictionary, locale } = useLocale();
  const t = dictionary.studentWorkspace;
  const copy = t.intake;
  const router = useRouter();
  const prefix = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const [matches, setMatches] = useState<Student[] | null>(null);
  const [editingBasics, setEditingBasics] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    getValues,
    setFocus,
    setValue,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(studentIntakeFormSchema),
    defaultValues: defaults,
  });
  const [
    status,
    name,
    channel,
    reachableContact,
    contactChannel,
    contactPerson,
    owner,
    referralSource,
    separateReason,
  ] = useWatch({
    control,
    name: [
      "status",
      "name",
      "channel",
      "reachableContact",
      "contactChannel",
      "contactPerson",
      "owner",
      "referralSource",
      "separateReason",
    ],
  });
  const completed = status === "completed";
  const showBasics = !completed || editingBasics;

  useEffect(() => {
    if (matches) heading.current?.focus();
  }, [matches]);

  function openRecord(id: string) {
    onClose();
    router.push("/students/" + id);
  }

  const check = useMutation({
    mutationFn: async (contact: string) => {
      const { students } = useStudentsStore.getState();
      const found = findIntakeMatches(students, contact);
      if (found.length) return found;

      // Demo fallback for the manual check. Saving still checks the entered number.
      const demoRecord = students.find(({ id }) => id === "MM-2026-0150");
      return demoRecord ? [demoRecord] : [];
    },
    onSuccess: setMatches,
  });

  const save = useMutation({
    mutationFn: async (values: StudentIntakeForm) =>
      useStudentsStore.getState().createIntakeStudent(
        values,
        matches?.map(({ id }) => id),
      ),
    onSuccess(result) {
      if ("matches" in result) {
        setMatches(result.matches);
        return;
      }
      toast.success(t.saved);
      openRecord(result.id);
    },
  });

  const busy = check.isPending || save.isPending;

  function fieldError(field: keyof StudentIntakeForm) {
    const message = errors[field]?.message;
    if (!message) return null;
    const error = copy.errors[message as keyof typeof copy.errors];
    return (
      <span
        id={prefix + field + "-error"}
        className="block text-sm font-normal text-destructive"
      >
        {error ?? t.required}
      </span>
    );
  }

  function input(
    field: keyof StudentIntakeForm,
    label: string,
    props?: ComponentProps<typeof Input>,
  ) {
    const fieldProps = {
      id: prefix + field,
      "aria-invalid": !!errors[field],
      "aria-describedby": errors[field] ? prefix + field + "-error" : undefined,
    };
    return (
      <div className="min-w-0 space-y-1.5">
        <label
          htmlFor={prefix + field}
          className="block text-sm font-semibold text-muted-foreground"
        >
          {label}
        </label>
        {props?.type === "date" ? (
          <Controller
            control={control}
            name={field}
            render={({ field: date }) => (
              <DatePicker
                {...date}
                {...fieldProps}
                label={label}
                locale={locale === "my" ? "my-MM" : "en-GB"}
                placeholder={copy.pickDate}
                clearLabel={copy.clearDate}
                getMinDate={field === "dueDate" ? yangonToday : undefined}
              />
            )}
          />
        ) : (
          <Input
            className="h-11 px-3"
            {...fieldProps}
            {...register(field)}
            {...props}
          />
        )}
        {fieldError(field)}
      </div>
    );
  }

  function select<T extends string>(
    field: keyof StudentIntakeForm,
    label: string,
    options: readonly T[],
    labels: Record<T, string>,
    placeholder?: string,
  ) {
    return (
      <label className="block min-w-0 space-y-1.5 text-sm font-semibold text-muted-foreground">
        <span>{label}</span>
        <select
          className={cn(selectClassName, "h-11 text-foreground")}
          {...register(field)}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option} value={option}>
              {labels[option]}
            </option>
          ))}
        </select>
      </label>
    );
  }

  function choices<T extends string>(
    field: "channel" | "contactPerson" | "status",
    label: string,
    options: readonly T[],
    labels: Record<T, string>,
    columns: string,
  ) {
    return (
      <fieldset className="min-w-0">
        <legend className="mb-1.5 text-sm font-semibold text-muted-foreground">
          {label}
        </legend>
        <div className={cn("grid gap-2 sm:gap-3", columns)}>
          {options.map((option) => (
            <label key={option} className="relative min-w-0">
              <input
                type="radio"
                value={option}
                {...register(field, {
                  onChange(event) {
                    if (
                      field === "status" &&
                      event.target.value === "completed"
                    )
                      setEditingBasics(
                        !name.trim() || !reachableContact.trim(),
                      );
                  },
                })}
                className="peer sr-only"
              />
              <span className="flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-input px-2 py-2 text-center text-sm font-semibold text-muted-foreground hover:bg-muted/60 peer-checked:border-primary peer-checked:bg-primary-tint peer-checked:text-primary-hover peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-disabled:cursor-default">
                {labels[option]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  async function checkContact() {
    if (busy || !(await trigger("reachableContact"))) return;
    save.reset();
    setValue("separateReason", "");
    check.mutate(getValues("reachableContact").trim());
  }

  function backToIntake() {
    setMatches(null);
    setValue("separateReason", "");
    save.reset();
    requestAnimationFrame(() => heading.current?.focus());
  }

  const dismiss = matches ? backToIntake : onClose;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) dismiss();
      }}
    >
      <DialogContent
        closeLabel={t.close}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocus();
        }}
        className="inset-x-3 top-3 bottom-auto mx-auto my-0 flex max-h-[calc(100dvh-1.5rem)] max-w-250 flex-col overflow-hidden p-0 sm:inset-x-6 sm:top-10 sm:max-h-[calc(100dvh-5rem)]"
      >
        <div className="shrink-0 border-b px-5 pt-5 pb-4 sm:px-8 sm:pt-8">
          <DialogTitle
            ref={heading}
            tabIndex={-1}
            className="pr-6 text-[28px] leading-8 font-bold tracking-tight"
          >
            {matches
              ? copy.matchTitle
              : completed
                ? copy.completedTitle
                : t.addStudent}
          </DialogTitle>
          <DialogDescription className="mt-3 text-[16px] leading-6 text-muted-foreground">
            {matches
              ? matches.length
                ? copy.matchIntro
                : copy.noMatches
              : completed
                ? copy.completedIntro
                : copy.intro}
          </DialogDescription>
        </div>
        <form
          id={prefix + "form"}
          noValidate
          hidden={matches?.length === 0}
          className="min-h-0 overflow-y-auto overscroll-contain px-5 py-4 sm:px-8"
          onSubmit={handleSubmit(
            (values) => {
              if (busy) return;
              check.reset();
              save.mutate(values);
            },
            (issues) => {
              setMatches(null);
              if (issues.name || issues.reachableContact)
                setEditingBasics(true);
              const first = Object.keys(issues)[0] as
                keyof StudentIntakeForm | undefined;
              if (first) requestAnimationFrame(() => setFocus(first));
            },
          )}
        >
          <fieldset
            disabled={busy}
            className="min-w-0 space-y-4"
            aria-busy={busy}
          >
            {matches?.length === 0 ? null : matches ? (
              <>
                <div className="space-y-1 rounded-2xl bg-amber-100/80 p-4 dark:bg-amber-950/60">
                  <h3 className="font-semibold text-amber-900 dark:text-amber-200">
                    {copy.matchWarning}
                  </h3>
                  <p className={help}>{copy.matchWarningDetail}</p>
                </div>
                {matches.map((student) => (
                  <section
                    key={student.id}
                    className={cn(panel, "space-y-3 p-5")}
                  >
                    <h3 className="text-xl font-bold break-words">
                      {student.name}
                    </h3>
                    <p className={help}>
                      {copy.recordId.replace("{id}", student.id)}
                      {student.intake &&
                        " · " +
                          copy.channel +
                          ": " +
                          copy.channels[student.intake.channel]}
                    </p>
                    <p className="font-semibold break-words">
                      {copy.channels[student.intake?.contactChannel ?? "viber"]}{" "}
                      · {student.phone}
                    </p>
                    <p className={help}>{copy.existingHistory}</p>
                    <Button
                      type="button"
                      className={primary}
                      onClick={() => openRecord(student.id)}
                    >
                      {copy.openExisting}
                    </Button>
                  </section>
                ))}
                <h3 className="text-xl font-bold">{copy.differentStudent}</h3>
                <p className={help}>
                  {copy.separateIntro.replace(
                    "{name}",
                    name.trim() || copy.newStudent,
                  )}
                </p>
                {input("separateReason", copy.separateReason, {
                  placeholder: copy.reasonPlaceholder,
                  maxLength: 500,
                  required: true,
                })}
                <p className={help}>{copy.reasonHint}</p>
              </>
            ) : (
              <>
                {showBasics ? (
                  <>
                    {choices(
                      "channel",
                      copy.channel,
                      intakeChannels,
                      copy.channels,
                      "grid-cols-2 min-[420px]:grid-cols-3 lg:grid-cols-6",
                    )}
                    <div className={grid}>
                      {input("name", copy.name, {
                        maxLength: 120,
                        required: true,
                        autoComplete: "off",
                      })}
                      {input("reachableContact", copy.reachableContact, {
                        maxLength: 200,
                        required: true,
                        autoComplete: "off",
                        type: "tel",
                      })}
                      {select(
                        "contactChannel",
                        copy.contactChannel,
                        contactChannels,
                        copy.channels,
                      )}
                      {choices(
                        "contactPerson",
                        copy.contactPerson,
                        contactPeople,
                        copy.people,
                        "grid-cols-2",
                      )}
                      {select(
                        "owner",
                        copy.assignedTo,
                        ["H", "N"],
                        intakeOwners,
                      )}
                      {select(
                        "referralSource",
                        copy.referralSource,
                        referralSources,
                        copy.channels,
                        copy.notProvided,
                      )}
                    </div>
                    {completed && name.trim() && reachableContact.trim() && (
                      <Button
                        type="button"
                        variant="outline"
                        className={outline}
                        onClick={async () => {
                          if (await trigger(["name", "reachableContact"]))
                            setEditingBasics(false);
                        }}
                      >
                        {copy.doneEditing}
                      </Button>
                    )}
                  </>
                ) : (
                  <section className={panel}>
                    <h3 className="text-lg font-bold break-words">
                      {name.trim() || copy.newStudent} ·{" "}
                      {copy.channels[channel]}
                    </h3>
                    <p className="text-muted-foreground break-words">
                      {copy.channels[contactChannel]} ·{" "}
                      {reachableContact.trim() || copy.notProvided} ·{" "}
                      {copy.contactPerson}: {copy.people[contactPerson]} ·{" "}
                      {copy.assignedTo} {intakeOwners[owner]}
                    </p>
                    {referralSource && (
                      <p className={help}>
                        {copy.heardVia}: {copy.channels[referralSource]}
                      </p>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(outline, "mt-2")}
                      onClick={() => setEditingBasics(true)}
                    >
                      {copy.editBasics}
                    </Button>
                  </section>
                )}
                {choices(
                  "status",
                  copy.status,
                  consultationStatuses,
                  copy.statuses,
                  "grid-cols-3",
                )}
                {status === "inquiry" && (
                  <p className={help}>{copy.scheduleHint}</p>
                )}
                {status === "scheduled" && (
                  <div className={grid}>
                    {input("scheduledDate", copy.scheduledDate, {
                      type: "date",
                      required: true,
                    })}
                    {input("scheduledTime", copy.scheduledTime, {
                      type: "time",
                      required: true,
                    })}
                  </div>
                )}
                {completed && (
                  <>
                    <div className={grid}>
                      {input("completedDate", copy.completedDate, {
                        type: "date",
                        required: true,
                      })}
                      {input("outcome", copy.outcome, {
                        maxLength: 200,
                        required: true,
                      })}
                      {input("goal", copy.goal, {
                        maxLength: 200,
                        placeholder: copy.notDecided,
                      })}
                      <label className="block space-y-1.5 text-sm font-semibold text-muted-foreground">
                        <span>{copy.planStatus}</span>
                        <Input
                          className="h-11 px-3"
                          value={t.statuses.draft}
                          readOnly
                        />
                      </label>
                    </div>
                    <p className={help}>{copy.planHint}</p>
                  </>
                )}
                <div className={grid}>
                  {input("nextAction", copy.nextAction, { maxLength: 200 })}
                  {input("dueDate", copy.dueDate, { type: "date" })}
                  {input("googleEmail", copy.googleEmail, {
                    type: "email",
                    maxLength: 254,
                    placeholder: copy.notProvided,
                    autoComplete: "off",
                  })}
                  {input(
                    "note",
                    completed ? copy.consultationNote : copy.note,
                    { maxLength: 1000, placeholder: copy.notePlaceholder },
                  )}
                </div>
                <p className="text-sm font-semibold text-primary-hover">
                  {completed ? copy.completedEmailHint : copy.emailHint}
                </p>
                {!completed && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      className={outline}
                      onClick={checkContact}
                    >
                      {check.isPending ? copy.checking : copy.checkRecords}
                    </Button>
                    <p className={help}>{copy.checkHint}</p>
                  </>
                )}
                <div className="space-y-1 rounded-2xl bg-primary-tint/75 p-4">
                  <h3 className="font-semibold text-primary-hover">
                    {completed ? copy.outcomeNotice : copy.accountNotice}
                  </h3>
                  <p className={help}>
                    {completed
                      ? copy.outcomeNoticeDetail
                      : copy.accountNoticeDetail}
                  </p>
                </div>
              </>
            )}
          </fieldset>
        </form>
        <div className="shrink-0 space-y-2 border-t px-5 py-4 sm:px-8">
          {(check.isError || save.isError) && (
            <p role="alert" className="text-sm text-destructive">
              {save.isError ? t.saveError : copy.checkError}
            </p>
          )}
          <div className="flex flex-wrap gap-3 sm:gap-4">
            {matches?.length !== 0 && (
              <Button
                type="submit"
                form={prefix + "form"}
                className={primary}
                disabled={busy || (!!matches && !separateReason.trim())}
              >
                {save.isPending
                  ? copy.saving
                  : matches
                    ? copy.saveSeparate
                    : completed
                      ? copy.saveOutcome
                      : copy.save}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              className={outline}
              disabled={busy}
              onClick={dismiss}
            >
              {t.cancel}
            </Button>
          </div>
          {!!matches?.length && <p className={help}>{copy.separateHint}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
