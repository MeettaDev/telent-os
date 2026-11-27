"use client";

import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import styles from "@/common/components/workspace.module.css";
import {
  dateSchema,
  type Actor,
  type Student,
} from "@/features/students/types/student";
import { useStudentsStore } from "@/features/students/stores/students-store";
import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";

const label = "block text-xs font-bold uppercase text-muted-foreground";

export function NextActionPopover({ student }: { student: Student }) {
  const { dictionary, locale } = useLocale();
  const t = dictionary.studentWorkspace;
  const prefix = useId();
  const [open, setOpen] = useState(false);
  const [turn, setTurn] = useState<Actor>(student.turn);
  const [action, setAction] = useState(
    student.customAction || t.now[student.now].title,
  );
  const [owner, setOwner] = useState(student.owner ?? "none");
  const [date, setDate] = useState(student.nextCheck ?? "");
  const [error, setError] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!action.trim() || !dateSchema.safeParse(date).success) {
      setError(t.required);
      return;
    }
    if (turn === "meetta" && owner === "none") {
      setError(t.forms.ownerNeeded);
      return;
    }
    try {
      useStudentsStore.getState().setNextAction(student.id, {
        customAction: action.trim(),
        turn,
        owner: owner === "none" ? null : (owner as "H" | "N"),
        nextCheck: date,
      });
      toast.success(t.saved);
      setOpen(false);
    } catch {
      setError(t.saveError);
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setTurn(student.turn);
          setAction(student.customAction || t.now[student.now].title);
          setOwner(student.owner ?? "none");
          setDate(student.nextCheck ?? "");
          setError("");
        }
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <Button type="button" className="h-11 rounded-full px-6 text-lg">
          {t.detail.setNext}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={24}
        collisionPadding={12}
        aria-labelledby={prefix + "title"}
        className={cn(
          styles.palette,
          "w-[min(28rem,calc(100vw-1.5rem))] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl p-6 shadow-2xl ring-0",
        )}
      >
        <h2 id={prefix + "title"} className="text-lg font-bold">
          {t.nextAction.title} · {student.name}
        </h2>
        <form onSubmit={submit} className="mt-2 space-y-4">
          <fieldset>
            <legend className={cn(label, "mb-3")}>{t.forms.turn}</legend>
            <div className="grid grid-cols-[1fr_1fr_auto] rounded-full bg-muted p-1">
              {(["meetta", "student", "office"] as const).map((actor) => (
                <label key={actor} className="relative">
                  <input
                    className="peer sr-only"
                    type="radio"
                    name="turn"
                    value={actor}
                    checked={turn === actor}
                    onChange={() => setTurn(actor)}
                  />
                  <span className="flex min-h-9 cursor-pointer items-center justify-center rounded-full px-2 py-2 text-center text-sm whitespace-nowrap text-muted-foreground peer-checked:bg-card peer-checked:font-semibold peer-checked:text-foreground peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-primary">
                    {actor === "office" ? t.nextAction.office : t[actor]}
                  </span>
                </label>
              ))}
            </div>
            {turn === "noOne" && (
              <p className="mt-2 text-sm text-muted-foreground">{t.noOne}</p>
            )}
          </fieldset>
          <div className="space-y-3">
            <label htmlFor={prefix + "action"} className={label}>
              {t.nextAction.what}
            </label>
            <Input
              id={prefix + "action"}
              name="action"
              required
              maxLength={200}
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="h-11 rounded-full border-primary"
            />
            <div className="flex flex-wrap gap-2">
              {(["file", "reply", "call", "university"] as const).map((key) => (
                <Button
                  key={key}
                  type="button"
                  variant="ghost"
                  className="h-9 rounded-full bg-muted px-3 text-sm"
                  onClick={() => {
                    setAction(t.nextAction.suggestions[key]);
                    setTurn(
                      key === "university"
                        ? "office"
                        : key === "file"
                          ? "student"
                          : "meetta",
                    );
                  }}
                >
                  {t.nextAction.suggestions[key]}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="min-w-0 space-y-2">
              <span className={label}>{t.owner}</span>
              <select
                name="owner"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="h-10 w-full rounded-full bg-muted px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="none">{t.forms.noOwner}</option>
                <option value="H">Hsu Wai</option>
                <option value="N">Nway Nway</option>
              </select>
            </label>
            <div className="min-w-0 space-y-2">
              <label htmlFor={prefix + "date"} className={label}>
                {t.nextCheck}
              </label>
              <DatePicker
                id={prefix + "date"}
                value={date}
                onChange={setDate}
                label={t.nextCheck}
                placeholder={t.intake.pickDate}
                clearLabel={t.intake.clearDate}
                locale={locale === "my" ? "my-MM" : "en-GB"}
                className="h-10 rounded-full border-0 bg-muted text-sm"
              />
            </div>
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-primary px-5 text-foreground"
              onClick={() => setOpen(false)}
            >
              {t.cancel}
            </Button>
            <Button type="submit" className="rounded-full px-6">
              {t.goalSteps.save}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
