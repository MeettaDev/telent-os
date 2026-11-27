import type {
  TodayMetric,
  TodayTask,
} from "@/features/dashboard/types/my-work";

export const todayMetrics: TodayMetric[] = [
  { id: "reviews", count: 3 },
  { id: "replies", count: 4 },
  { id: "consultations", count: 2 },
  { id: "noAction", count: 1 },
];

export const todayTasks: TodayTask[] = [
  {
    id: "mofa",
    student: "Ko Thura Zaw",
    studentId: "MM-2026-0149",
    group: "overdue",
    actor: "meetta",
    owner: "N",
    primaryAction: true,
  },
  {
    id: "nrc",
    student: "May Zin",
    studentId: "MM-2026-0150",
    group: "today",
    actor: "meetta",
    owner: null,
    primaryAction: true,
  },
  {
    id: "call",
    student: "Thiri Win",
    studentId: "MM-2026-0155",
    group: "today",
    actor: "meetta",
    owner: "H",
  },
  {
    id: "contact",
    student: "Hnin Ei Phyu",
    group: "today",
    actor: "meetta",
    owner: null,
  },
  {
    id: "chat",
    student: "Ko Aung",
    studentId: "MM-2026-0152",
    group: "today",
    actor: "meetta",
    owner: null,
  },
  {
    id: "plan",
    student: "Nang Mya Su Aung",
    studentId: "MM-2026-0142",
    group: "tomorrow",
    actor: "meetta",
    owner: "H",
  },
  {
    id: "next",
    student: "Aung Min",
    studentId: "MM-2026-0154",
    group: "noAction",
    actor: "noOne",
    owner: null,
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
