"use client";

import { useEffect, useId, useState, type ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { useMockUser } from "@/common/auth/mock-auth";
import styles from "@/common/components/workspace.module.css";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { selectClassName } from "@/features/students/components/StudentActionDialog";
import {
  intakeOwners,
  studentIntakeFormSchema,
  type StudentIntakeForm,
  type StudentIntakeInput,
} from "@/features/students/lib/student-intake";
import { useStudentsStore } from "@/features/students/stores/students-store";
import {
  contactChannels,
  contactPeople,
  intakeChannels,
  referralSources,
  type Student,
} from "@/features/students/types/student";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";

const defaults: StudentIntakeInput = {
  name: "",
  reachableContact: "",
  contactChannel: "phone",
  contactPerson: "student",
  channel: "phone",
  referralSource: "",
  owner: "H",
  separateReason: "",
};

const grid = "grid gap-3 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-4.5";
const labelClass = "block text-xs font-semibold text-muted-foreground";
const controlClass = "h-11 rounded-full px-4 focus:border-primary sm:h-12";
const outline =
  "rounded-full border-primary px-4 text-sm text-foreground sm:px-5";

export function AddStudentDialog({
  onClose,
  onSaved,
  returnFocus,
}: {
  onClose: () => void;
  onSaved: () => void;
  returnFocus: () => void;
}) {
  const { dictionary } = useLocale();
  const t = dictionary.studentWorkspace;
  const copy = t.intake;
  const router = useRouter();
  const user = useMockUser();
  const prefix = useId();
  const {
    control,
    register,
    handleSubmit,
    resetField,
    setFocus,
    formState: { errors },
  } = useForm<StudentIntakeInput, unknown, StudentIntakeForm>({
    resolver: zodResolver(studentIntakeFormSchema),
    defaultValues: defaults,
  });
  const reason = useWatch({ control, name: "separateReason" });

  // Retain the reviewed records during retries and storage errors.
  const [matches, setMatches] = useState<Student[]>([]);
  const reviewing = matches.length > 0;
  const save = useMutation({
    mutationFn: async (values: StudentIntakeForm) =>
      useStudentsStore.getState().createIntakeStudent(
        values,
        matches.map(({ id }) => id),
        user.username,
      ),
    onSuccess(result) {
      if ("matches" in result) {
        setMatches(result.matches);
        return;
      }
      toast.success(t.saved);
      onClose();
      onSaved();
    },
  });

  useEffect(() => {
    if (reviewing) setFocus("separateReason");
  }, [reviewing, setFocus]);

  function dismiss() {
    if (!reviewing) {
      onClose();
      return;
    }
    resetField("separateReason");
    setMatches([]);
    save.reset();
    requestAnimationFrame(() => setFocus("reachableContact"));
  }

  function fieldProps(field: keyof StudentIntakeInput) {
    return {
      id: prefix + field,
      "aria-invalid": !!errors[field],
      "aria-describedby": errors[field] ? prefix + field + "-error" : undefined,
    };
  }

  function fieldError(field: keyof StudentIntakeInput) {
    const message = errors[field]?.message;
    return message ? (
      <p id={prefix + field + "-error"} className="text-sm text-destructive">
        {copy.errors[message as keyof typeof copy.errors] ?? t.required}
      </p>
    ) : null;
  }

  function input(
    field: "name" | "reachableContact",
    label: string,
    props: ComponentProps<typeof Input>,
  ) {
    return (
      <div className="min-w-0 space-y-2">
        <label htmlFor={prefix + field} className={labelClass}>
          {label}
        </label>
        <Input
          {...fieldProps(field)}
          {...register(field)}
          {...props}
          className={controlClass}
          autoComplete="off"
          required
        />
        {fieldError(field)}
      </div>
    );
  }

  function select<Option extends string>(
    field: "contactChannel" | "owner" | "referralSource",
    label: string,
    options: readonly Option[],
    labels: Record<Option, string>,
  ) {
    const optional = field === "referralSource";
    return (
      <div className="min-w-0 space-y-2">
        <label htmlFor={prefix + field} className={labelClass}>
          {label}
          {optional && (
            <span className="ml-1.5 font-normal opacity-80">
              {copy.optional}
            </span>
          )}
        </label>
        <select
          {...fieldProps(field)}
          {...register(field)}
          className={cn(
            selectClassName,
            controlClass,
            "block text-foreground aria-invalid:border-destructive",
          )}
          required={!optional}
        >
          {optional && <option value="">{copy.notProvided}</option>}
          {options.map((option) => (
            <option key={option} value={option}>
              {labels[option]}
            </option>
          ))}
        </select>
        {fieldError(field)}
      </div>
    );
  }

  function choices<Option extends string>(
    field: "channel" | "contactPerson",
    label: string,
    options: readonly Option[],
    labels: Record<Option, string>,
  ) {
    const segmented = field === "contactPerson";
    return (
      <fieldset
        className="min-w-0 space-y-2"
        aria-describedby={fieldProps(field)["aria-describedby"]}
      >
        <legend className={labelClass}>{label}</legend>
        <div
          className={cn(
            segmented
              ? "grid grid-cols-2 gap-1 rounded-full bg-muted p-1"
              : "flex flex-wrap gap-1.5 sm:gap-2",
          )}
        >
          {options.map((option) => (
            <label key={option} className="relative min-w-0">
              <input
                type="radio"
                value={option}
                {...register(field)}
                className="peer sr-only"
                required
              />
              <span
                className={cn(
                  "flex h-full cursor-pointer items-center justify-center rounded-full text-center text-sm font-medium text-muted-foreground hover:text-foreground peer-checked:font-semibold peer-checked:text-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
                  segmented
                    ? "min-h-9 px-2 peer-checked:bg-card peer-checked:shadow-sm sm:min-h-10"
                    : "min-h-9.5 border border-transparent bg-muted px-3 peer-checked:border-primary peer-checked:bg-primary-tint sm:px-4",
                )}
              >
                {labels[option]}
              </span>
            </label>
          ))}
        </div>
        {fieldError(field)}
      </fieldset>
    );
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !save.isPending) dismiss();
      }}
    >
      <DialogContent
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocus();
        }}
        className={cn(
          styles.palette,
          "inset-3 flex max-h-[calc(100dvh-1.5rem)] flex-col gap-0 overflow-hidden rounded-3xl border-0 p-0 shadow-2xl lg:right-4 lg:left-[264px]",
          reviewing ? "max-w-160" : "max-w-150",
        )}
      >
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-5 pt-5 sm:px-7 sm:pt-7">
          <DialogTitle className="text-2xl leading-tight font-bold">
            {reviewing ? copy.matchTitle : t.addStudent}
          </DialogTitle>
          {reviewing && (
            <Badge variant="warning" className="rounded-full text-xs">
              {copy.sameContact}
            </Badge>
          )}
          <DialogDescription className="sr-only">
            {reviewing ? `${copy.matchIntro} ${copy.reasonHint}` : copy.intro}
          </DialogDescription>
        </div>
        <form
          id={prefix + "form"}
          noValidate
          className="min-h-0 overflow-y-auto overscroll-contain px-5 pt-5 pb-1 sm:px-7"
          onSubmit={handleSubmit((values) => {
            if (!save.isPending && (!reviewing || values.separateReason))
              save.mutate(values);
          })}
        >
          <fieldset
            disabled={save.isPending}
            className="min-w-0 space-y-4.5"
            aria-busy={save.isPending}
          >
            {reviewing ? (
              <>
                <div className="space-y-2">
                  {matches.map((student) => (
                    <section
                      key={student.id}
                      aria-label={student.name}
                      className="flex flex-wrap items-center gap-3 rounded-2xl border border-input p-4 sm:gap-3.5 sm:p-4.5"
                    >
                      <span
                        aria-hidden="true"
                        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground"
                      >
                        {student.initials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg leading-6 font-bold wrap-anywhere">
                          {student.name}
                        </h3>
                        <p className="text-sm leading-5 text-muted-foreground wrap-anywhere">
                          {student.id}
                          {student.intake &&
                            " · " +
                              copy.firstContact +
                              " " +
                              copy.channels[student.intake.channel]}
                        </p>
                        <p className="text-sm leading-5 font-semibold wrap-anywhere">
                          {
                            copy.channels[
                              student.intake?.contactChannel ?? "viber"
                            ]
                          }{" "}
                          · {student.phone}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(outline, "w-full sm:w-auto")}
                        onClick={() => {
                          onClose();
                          router.push("/students/" + student.id);
                        }}
                      >
                        {copy.openExisting}
                      </Button>
                    </section>
                  ))}
                </div>
                <div className="space-y-2 pt-1">
                  <h3 className="mb-3 text-lg font-bold">
                    {copy.differentStudent}
                  </h3>
                  <label
                    htmlFor={prefix + "separateReason"}
                    className={labelClass}
                  >
                    {copy.separateReason}
                  </label>
                  <Textarea
                    {...fieldProps("separateReason")}
                    {...register("separateReason")}
                    placeholder={copy.reasonPlaceholder}
                    maxLength={500}
                    required
                    className="h-17 min-h-17 resize-none rounded-2xl border-input py-3 focus:border-primary aria-invalid:border-destructive"
                  />
                  {fieldError("separateReason")}
                </div>
              </>
            ) : (
              <>
                <div className={grid}>
                  {input("name", copy.name, { maxLength: 120 })}
                  {input("reachableContact", copy.reachableContact, {
                    type: "tel",
                    maxLength: 200,
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
                  )}
                </div>
                {choices(
                  "channel",
                  copy.cameInBy,
                  intakeChannels,
                  copy.channels,
                )}
                <div className={grid}>
                  {select(
                    "referralSource",
                    copy.referralSource,
                    referralSources,
                    copy.channels,
                  )}
                  {select("owner", copy.assignedTo, ["H", "N"], intakeOwners)}
                </div>
              </>
            )}
          </fieldset>
        </form>
        <div className="shrink-0 space-y-2 px-5 pt-4 pb-5 sm:px-7 sm:pt-5 sm:pb-6">
          {save.isError && (
            <p role="alert" className="text-sm text-destructive">
              {t.saveError}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              className={outline}
              disabled={save.isPending}
              onClick={dismiss}
            >
              {t.cancel}
            </Button>
            <Button
              type="submit"
              form={prefix + "form"}
              className="h-11 max-w-full rounded-full px-5 text-lg whitespace-normal sm:px-6 sm:text-xl disabled:bg-[#e4e4e9] disabled:text-[#888892] disabled:opacity-100 dark:disabled:bg-muted dark:disabled:text-muted-foreground"
              disabled={save.isPending || (reviewing && !reason?.trim())}
            >
              {save.isPending
                ? copy.saving
                : reviewing
                  ? copy.saveSeparate
                  : t.addStudent}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
