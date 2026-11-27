"use client";

import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/providers/locale-provider";
import { universityStatus, type University } from "../university-record";

export function universityDate(
  date: string,
  locale: "en" | "my",
  style: "month" | "short" | "full" = "full",
) {
  if (!date) return "—";
  return new Intl.DateTimeFormat(locale === "my" ? "my-MM" : "en-US", {
    month: "short",
    day: style === "month" ? undefined : "numeric",
    year: style === "short" ? undefined : "numeric",
    timeZone: "UTC",
  }).format(new Date(date + "T00:00:00Z"));
}

export function applicationWindow(
  { opensOn, closesOn, applicationNote }: University,
  locale: "en" | "my",
  labels: { from: string; until: string; notPosted: string },
  compact = false,
) {
  let window = labels.notPosted;
  if (opensOn && closesOn) {
    const style = compact ? "short" : "full";
    window =
      universityDate(opensOn, locale, style) +
      " – " +
      universityDate(closesOn, locale, style);
  } else if (closesOn) {
    window = labels.until.replace("{date}", universityDate(closesOn, locale));
  } else if (opensOn) {
    window = labels.from.replace("{date}", universityDate(opensOn, locale));
  }
  return applicationNote ? `${window} (${applicationNote})` : window;
}

export function UniversityStatus({
  record,
  today,
  includeDate,
}: {
  record: University;
  today: string;
  includeDate?: boolean;
}) {
  const { dictionary, locale } = useLocale();
  const status = universityStatus(record, today);
  return (
    <Badge
      className="rounded-full text-xs"
      variant={
        status === "verified"
          ? "success"
          : status === "recheck"
            ? "warning"
            : "secondary"
      }
    >
      {dictionary.universityWorkspace.statuses[status]}
      {includeDate &&
        record.checkedOn &&
        " · " + universityDate(record.checkedOn, locale, "short")}
    </Badge>
  );
}
