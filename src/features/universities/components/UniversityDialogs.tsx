"use client";

import {
  useState,
  type FormEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMockUser } from "@/common/auth/mock-auth";
import { useLocale } from "@/providers/locale-provider";
import {
  contactKeys,
  emptyUniversity,
  milestoneKeys,
  programFieldsSchema,
  requirementKeys,
  universityFieldsSchema,
  workspaceDate,
  type University,
  type UniversityFields,
} from "../university-record";
import { useUniversitiesStore } from "../stores/universities-store";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-sm font-semibold">
      {label}
      {children}
    </label>
  );
}

const dateFields = [
  "intake",
  "opensOn",
  "closesOn",
  "applicationNote",
] as const;
const programFields = [
  "name",
  "track",
  "visa",
  "length",
  "career",
  "seats",
] as const;

export function UniversityDialog({
  record,
  students,
  opener,
  onClose,
  onSave,
}: {
  record?: University;
  students: string[];
  opener: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onSave: (record: University) => void;
}) {
  const { dictionary } = useLocale();
  const t = dictionary.universityWorkspace;
  const s = dictionary.studentWorkspace;
  const { username } = useMockUser();
  const save = useUniversitiesStore((state) => state.save);
  const [draft, setDraft] = useState<UniversityFields>(
    record ?? emptyUniversity,
  );
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  const dateChanges = record
    ? dateFields
        .flatMap((key) =>
          record[key] === draft[key]
            ? []
            : [
                {
                  label: t.fields[key],
                  before: record[key],
                  after: draft[key],
                },
              ],
        )
        .concat(
          milestoneKeys.flatMap((key) =>
            record.milestones[key] === draft.milestones[key]
              ? []
              : [
                  {
                    label: t.milestones[key],
                    before: record.milestones[key],
                    after: draft.milestones[key],
                  },
                ],
          ),
        )
    : [];

  function persist(fields: UniversityFields) {
    try {
      onSave(save(fields, username, record ? t.updated : t.created, record));
    } catch (cause) {
      setError(
        cause instanceof Error && cause.message === "duplicate"
          ? t.duplicate
          : cause instanceof Error && cause.message === "stale"
            ? t.stale
            : s.saveError,
      );
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const entries = Object.fromEntries(form);
    const values = universityFieldsSchema.safeParse({
      ...entries,
      intake: entries.intake + "-01",
      milestones: Object.fromEntries(
        milestoneKeys.map((key) => [key, entries["milestone-" + key]]),
      ),
      requirements: Object.fromEntries(
        requirementKeys.map((key) => [key, entries["requirement-" + key]]),
      ),
      contacts: Object.fromEntries(
        contactKeys.map((key) => [key, entries["contact-" + key]]),
      ),
    });
    if (!values.success) {
      setError(t.invalidRecord);
      return;
    }
    setError("");
    if (record) {
      setDraft(values.data);
      setPreview(true);
    } else {
      persist(values.data);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="max-h-9/10 max-w-2xl"
        closeLabel={s.close}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          opener.current?.focus({ preventScroll: true });
        }}
      >
        <DialogTitle className="pr-6 text-lg font-semibold">
          {preview ? t.preview : record ? t.edit : t.add}
        </DialogTitle>
        <DialogDescription className="mt-1 text-sm text-muted-foreground">
          {record
            ? t.nextVersion.replace("{version}", String(record.version + 1))
            : t.addDescription}
        </DialogDescription>
        {preview ? (
          <div className="mt-5 space-y-4">
            {dateChanges.length > 0 ? (
              <>
                <ul className="divide-y rounded-xl border px-3">
                  {dateChanges.map(({ label, before, after }) => (
                    <li key={label} className="py-2 text-sm wrap-anywhere">
                      <p className="font-semibold">{label}</p>
                      <p className="text-muted-foreground">
                        {before || "—"} → {after || "—"}
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="rounded-xl bg-muted p-3 text-sm">
                  <p className="font-semibold">
                    {t.studentsTitle.replace(
                      "{count}",
                      String(students.length),
                    )}
                  </p>
                  <p className="mt-1 wrap-anywhere">
                    {students.join(" · ") || t.noStudents}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{t.recordPreview}</p>
            )}
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPreview(false);
                  setError("");
                }}
              >
                {t.back}
              </Button>
              <Button type="button" onClick={() => persist(draft)}>
                {t.saveVersion}
              </Button>
            </div>
          </div>
        ) : (
          <form className="mt-5 space-y-4" onSubmit={submit}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t.fields.name}>
                <Input
                  name="name"
                  required
                  maxLength={120}
                  defaultValue={draft.name}
                />
              </Field>
              <Field label={t.fields.city}>
                <Input
                  name="city"
                  required
                  maxLength={80}
                  defaultValue={draft.city}
                />
              </Field>
              <Field label={t.fields.summary}>
                <Input
                  name="summary"
                  maxLength={1000}
                  defaultValue={draft.summary}
                />
              </Field>
              <Field label={t.fields.intake}>
                <Input
                  name="intake"
                  type="month"
                  required
                  defaultValue={draft.intake.slice(0, 7)}
                />
              </Field>
              <Field label={t.fields.opensOn}>
                <Input
                  name="opensOn"
                  type="date"
                  defaultValue={draft.opensOn}
                />
              </Field>
              <Field label={t.fields.closesOn}>
                <Input
                  name="closesOn"
                  type="date"
                  defaultValue={draft.closesOn}
                />
              </Field>
              {(
                [
                  "applicationNote",
                  "topik",
                  "bankProof",
                  "source",
                  "guidelineUrl",
                ] as const
              ).map((key) => (
                <Field key={key} label={t.fields[key]}>
                  <Input
                    name={key}
                    maxLength={1000}
                    defaultValue={draft[key]}
                  />
                </Field>
              ))}
              <Field label={t.fields.checkedOn}>
                <Input
                  name="checkedOn"
                  type="date"
                  max={workspaceDate()}
                  defaultValue={draft.checkedOn}
                />
              </Field>
            </div>
            <details className="rounded-xl border p-3">
              <summary className="cursor-pointer text-sm font-semibold">
                {t.extraFields}
              </summary>
              <div className="mt-3 space-y-4">
                {milestoneKeys.map((key) => (
                  <Field key={key} label={t.milestones[key]}>
                    <Input
                      name={"milestone-" + key}
                      maxLength={1000}
                      defaultValue={draft.milestones[key]}
                    />
                  </Field>
                ))}
                {requirementKeys.map((key) => (
                  <Field key={key} label={t.requirements[key]}>
                    <Textarea
                      className="min-h-16"
                      name={"requirement-" + key}
                      maxLength={1000}
                      defaultValue={draft.requirements[key]}
                    />
                  </Field>
                ))}
                {contactKeys.map((key) => (
                  <Field key={key} label={t.contacts[key]}>
                    <Input
                      name={"contact-" + key}
                      maxLength={1000}
                      defaultValue={draft.contacts[key]}
                    />
                  </Field>
                ))}
              </div>
            </details>
            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                {s.cancel}
              </Button>
              <Button type="submit">{record ? t.preview : t.add}</Button>
            </div>
          </form>
        )}
        {error && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {error}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function AddProgramDialog({
  record,
  opener,
  onClose,
}: {
  record: University;
  opener: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}) {
  const { dictionary } = useLocale();
  const t = dictionary.universityWorkspace;
  const s = dictionary.studentWorkspace;
  const { username } = useMockUser();
  const addProgram = useUniversitiesStore((state) => state.addProgram);
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const entries = Object.fromEntries(new FormData(event.currentTarget));
    const program = programFieldsSchema.safeParse({
      ...entries,
      seats: entries.seats ? Number(entries.seats) : null,
    });
    if (!program.success) {
      setError(t.invalidProgram);
      return;
    }
    try {
      addProgram(record, program.data, username, t.programAdded);
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error && cause.message === "duplicate"
          ? t.duplicateProgram
          : cause instanceof Error && cause.message === "stale"
            ? t.stale
            : s.saveError,
      );
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="max-h-9/10"
        closeLabel={s.close}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          opener.current?.focus({ preventScroll: true });
        }}
      >
        <DialogTitle className="pr-6 text-lg font-semibold">
          {t.addProgram}
        </DialogTitle>
        <DialogDescription className="mt-1 text-sm text-muted-foreground">
          {record.name}
        </DialogDescription>
        <form className="mt-5 grid gap-3 sm:grid-cols-2" onSubmit={submit}>
          {programFields.map((field) => (
            <Field key={field} label={t.programFields[field]}>
              <Input
                name={field}
                required={field === "name"}
                type={field === "seats" ? "number" : "text"}
                min={field === "seats" ? 1 : undefined}
                max={field === "seats" ? 10000 : undefined}
                maxLength={field === "name" ? 120 : 1000}
              />
            </Field>
          ))}
          {error && (
            <p role="alert" className="text-sm text-destructive sm:col-span-2">
              {error}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {s.cancel}
            </Button>
            <Button type="submit">{t.addProgram}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
