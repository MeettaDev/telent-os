import type { Dictionary } from "@/common/i18n/dictionaries";

export type TodayTask = {
  id: keyof Dictionary["today"]["tasks"];
  student: string;
  actor: "meetta" | "noOne";
  owner: "N" | "H" | null;
  overdue?: boolean;
  missingDate?: boolean;
  primaryAction?: boolean;
};

export type TodayMetric = {
  id: keyof Dictionary["today"]["metrics"];
  count: number;
  tone: "destructive" | "warning" | "primary";
};
