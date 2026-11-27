"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useMockUser } from "@/common/auth/mock-auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { inboxThreads } from "@/features/inbox/mocks/inbox-data";
import { documentRows } from "@/features/students/mocks/students-data";
import { useStudentsStore } from "@/features/students/stores/students-store";
import type {
  Actor,
  DocumentId,
  Student,
} from "@/features/students/types/student";
import { useLocale } from "@/providers/locale-provider";

export type StudentAction = "message" | "file" | "next";
export const selectClassName =
  "h-10 w-full rounded-xl border border-input bg-card px-3 text-base font-normal outline-none focus:ring-2 focus:ring-primary/20";

export function StudentActionDialog({
  student,
  kind,
  documentId = "passport",
  onClose,
}: {
  student: Student;
  kind: StudentAction;
  documentId?: DocumentId;
  onClose: () => void;
}) {
  const { dictionary, locale } = useLocale();
  const t = dictionary.studentWorkspace;
  const user = useMockUser();
  const store = useStudentsStore();
  const [error, setError] = useState("");
  const messages = store.messages[student.id] ?? [];
  const thread = inboxThreads.find(({ id }) => id === student.id);
  const title =
    kind === "message"
      ? t.detail.message
      : kind === "file"
        ? t.detail.askFile
        : t.detail.setNext;
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const value = (key: string) => String(data.get(key) ?? "").trim();
    try {
      if (kind === "message") {
        if (!value("message")) {
          setError(t.required);
          return;
        }
        store.sendMessage(student.id, value("message"), user.username);
      }
      if (kind === "file")
        store.requestFile(
          student.id,
          value("file") as DocumentId,
          t.documents[value("file") as DocumentId].title +
            (value("note") ? " · " + value("note") : ""),
        );
      if (kind === "next") {
        const turn = value("turn") as Actor;
        const owner =
          value("owner") === "none" ? null : (value("owner") as "H" | "N");
        if (!value("action") || !value("date")) {
          setError(t.required);
          return;
        }
        if (turn === "meetta" && !owner) {
          setError(t.forms.ownerNeeded);
          return;
        }
        store.setNextAction(student.id, {
          customAction: value("action"),
          turn,
          nextCheck: value("date"),
          owner,
        });
      }
      toast.success(t.saved);
      onClose();
    } catch {
      setError(t.saveError);
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent closeLabel={t.close}>
        <DialogTitle className="pr-6 text-xl font-semibold">
          {title}
        </DialogTitle>
        <DialogDescription className="mt-1 text-sm text-muted-foreground">
          {student.name}
        </DialogDescription>
        <form onSubmit={submit} className="mt-5 space-y-4">
          {kind === "message" && (
            <>
              <div className="max-h-60 space-y-3 overflow-y-auto rounded-xl bg-muted/50 p-4">
                {thread && (
                  <p className="text-sm leading-relaxed">
                    {student.name} ·{" "}
                    {thread.time === "09:12"
                      ? thread.time
                      : dictionary.inboxWorkspace.times[thread.time]}
                    <br />
                    {dictionary.inboxWorkspace.incoming[thread.key]}
                  </p>
                )}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className="rounded-lg bg-primary-tint p-3 text-sm"
                  >
                    <p className="font-semibold">
                      {message.author} ·{" "}
                      {new Intl.DateTimeFormat(
                        locale === "my" ? "my-MM" : "en-US",
                        { hour: "2-digit", minute: "2-digit" },
                      ).format(new Date(message.at))}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap break-words">
                      {message.text}
                    </p>
                  </div>
                ))}
                {!messages.length && !thread && (
                  <p className="text-sm text-muted-foreground">
                    {t.detail.noMessages}
                  </p>
                )}
              </div>
              <label className="block space-y-2 text-sm font-semibold">
                <span>{t.forms.message}</span>
                <Textarea name="message" required maxLength={2000} autoFocus />
              </label>
            </>
          )}
          {kind === "file" && (
            <>
              <label className="block space-y-2 text-sm font-semibold">
                <span>{t.forms.file}</span>
                <select
                  name="file"
                  defaultValue={documentId}
                  className={selectClassName}
                >
                  {documentRows.map(({ id }) => (
                    <option key={id} value={id}>
                      {t.documents[id].title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-2 text-sm font-semibold">
                <span>
                  {t.forms.note} · {t.forms.optional}
                </span>
                <Textarea name="note" maxLength={2000} />
              </label>
            </>
          )}
          {kind === "next" && (
            <>
              <label className="block space-y-2 text-sm font-semibold">
                <span>{t.forms.nextAction}</span>
                <Input
                  name="action"
                  required
                  maxLength={200}
                  defaultValue={
                    student.customAction || t.now[student.now].title
                  }
                />
              </label>
              <label className="block space-y-2 text-sm font-semibold">
                <span>{t.forms.turn}</span>
                <select
                  name="turn"
                  defaultValue={student.turn}
                  className={selectClassName}
                >
                  {(["meetta", "student", "office", "noOne"] as const).map(
                    (actor) => (
                      <option key={actor} value={actor}>
                        {t[actor]}
                      </option>
                    ),
                  )}
                </select>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2 text-sm font-semibold">
                  <span>{t.forms.date}</span>
                  <Input
                    name="date"
                    type="date"
                    required
                    defaultValue={student.nextCheck ?? ""}
                  />
                </label>
                <label className="block space-y-2 text-sm font-semibold">
                  <span>{t.owner}</span>
                  <select
                    name="owner"
                    defaultValue={student.owner ?? "none"}
                    className={selectClassName}
                  >
                    <option value="none">{t.forms.noOwner}</option>
                    <option value="H">Hsu Wai</option>
                    <option value="N">Nway Nway</option>
                  </select>
                </label>
              </div>
            </>
          )}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              {t.cancel}
            </Button>
            <Button type="submit">
              {kind === "message"
                ? t.forms.send
                : kind === "file"
                  ? t.forms.requestFile
                  : t.detail.setNext}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
