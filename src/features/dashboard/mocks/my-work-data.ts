import type {
  TodayMetric,
  TodayTask,
} from "@/features/dashboard/types/my-work";

export const todayMetrics: TodayMetric[] = [
  { id: "reviews", count: 3, tone: "destructive" },
  { id: "replies", count: 4, tone: "warning" },
  { id: "consultations", count: 2, tone: "primary" },
  { id: "noAction", count: 1, tone: "destructive" },
];

export const todayTasks: TodayTask[] = [
  {
    id: "mofa",
    student: "Ko Thura Zaw",
    actor: "meetta",
    owner: "N",
    overdue: true,
    primaryAction: true,
  },
  {
    id: "nrc",
    student: "May Zin",
    actor: "meetta",
    owner: null,
    primaryAction: true,
  },
  { id: "call", student: "Thiri Win", actor: "meetta", owner: "H" },
  { id: "contact", student: "Hnin Ei Phyu", actor: "meetta", owner: null },
  { id: "chat", student: "Ko Aung", actor: "meetta", owner: null },
  { id: "plan", student: "Nang Mya Su Aung", actor: "meetta", owner: "H" },
  {
    id: "next",
    student: "Aung Min",
    actor: "noOne",
    owner: null,
    missingDate: true,
  },
];

export const waitingItems = [
  { id: "passport", student: "May Zin" },
  { id: "university", student: "Ko Thura Zaw" },
  { id: "tb", student: "Su Su Hlaing" },
] as const;

export const appActivities = [
  { id: "topik", student: "Ko Aung", time: "10:05" },
  { id: "bank", student: "May Zin", time: "09:40" },
  { id: "study", student: "Thiri Win", time: null },
] as const;
