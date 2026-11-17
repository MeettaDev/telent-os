"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { selectClassName } from "@/features/students/components/StudentActionDialog";
import {
  messageActionSchema,
  type MessageAction,
} from "@/features/students/types/student";
import { useLocale } from "@/providers/locale-provider";

export function InboxActionDialog({
  student,
  onClose,
  onSend,
}: {
  student: string;
  onClose: () => void;
  onSend: (text: string, action: MessageAction) => void;
}) {
  const { dictionary } = useLocale();
  const t = dictionary.inboxWorkspace;
  const s = dictionary.studentWorkspace;
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const parsed = messageActionSchema.safeParse({
      kind: "guide",
      ...Object.fromEntries(data),
    });
    if (!parsed.success) {
      setError(t.invalidAction);
      return;
    }
    const action = parsed.data;
    if (action.kind !== "guide") return;
    try {
      onSend(t.guides[action.guide].title, action);
      onClose();
    } catch {
      setError(s.saveError);
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent closeLabel={s.close}>
        <DialogTitle className="pr-6 text-lg font-semibold">
          {t.actions.guide}
        </DialogTitle>
        <DialogDescription className="mt-1 text-sm text-muted-foreground">
          {student}
        </DialogDescription>
        <form className="mt-5 space-y-4" onSubmit={submit}>
          <label className="flex flex-col gap-2 text-sm font-semibold">
            {t.guide}
            <select name="guide" className={selectClassName}>
              {Object.entries(t.guides).map(([id, guide]) => (
                <option key={id} value={id}>
                  {guide.title}
                </option>
              ))}
            </select>
          </label>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {s.cancel}
            </Button>
            <Button type="submit">{t.actions.guide}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
