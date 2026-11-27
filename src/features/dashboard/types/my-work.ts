import type { Dictionary } from "@/common/i18n/dictionaries";

export type TodayTask = {
  id: keyof Dictionary["today"]["tasks"];
  student: string;
  studentId?: string;
  group: keyof Dictionary["today"]["groups"];
  actor: "meetta" | "noOne";
  owner: "N" | "H" | null;
  primaryAction?: boolean;
};

export type TodayMetric = {
  id: keyof Dictionary["today"]["metrics"];
  count: number;
};
