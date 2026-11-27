"use client";

import { useState, type ComponentProps } from "react";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DatePickerProps = Pick<
  ComponentProps<typeof Button>,
  "id" | "ref" | "onBlur" | "aria-invalid" | "aria-describedby" | "className"
> & {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  clearLabel: string;
  locale: string;
  getMinDate?: () => string;
};

export function DatePicker({
  value,
  onChange,
  label,
  placeholder,
  clearLabel,
  locale,
  getMinDate,
  className,
  ...triggerProps
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const date = value ? parseISO(value) : undefined;
  const minDate = getMinDate ? parseISO(getMinDate()) : undefined;
  const display = date
    ? new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date)
    : placeholder;

  function selectDate(day: Date | undefined) {
    onChange(day ? format(day, "yyyy-MM-dd") : "");
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          data-empty={!date}
          className={cn(
            "h-11 w-full justify-between border-input px-3 font-normal text-foreground data-[empty=true]:text-muted-foreground aria-invalid:border-destructive",
            className,
          )}
          {...triggerProps}
        >
          {display}
          <CalendarIcon aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        aria-label={label}
        className="w-auto gap-0 p-0"
      >
        <Calendar
          mode="single"
          autoFocus
          defaultMonth={date ?? minDate}
          today={minDate}
          disabled={minDate ? { before: minDate } : undefined}
          selected={date}
          onSelect={selectDate}
        />
        {date && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="m-1"
            onClick={() => selectDate(undefined)}
          >
            {clearLabel}
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
