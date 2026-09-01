import type {
  CaseHealth,
  Consultation,
  QueueItem,
} from "@/features/dashboard/types/my-work";

export const queueItems: QueueItem[] = [
  {
    id: 1,
    initials: "NM",
    title: "Prepare consultation",
    student: "Nang Mya Su Aung",
    category: "Consultation",
    owner: "May Zin",
    due: "9:30 AM",
    status: "actionable",
  },
  {
    id: 2,
    initials: "HN",
    title: "Confirm selected-step scope",
    student: "Htet Naing",
    category: "Support activation",
    owner: "May Zin",
    due: "11:00 AM",
    status: "dueSoon",
  },
  {
    id: 3,
    initials: "SL",
    title: "Send published plan summary",
    student: "Su Su Lwin",
    category: "Plan published",
    owner: "May Zin",
    due: "1:30 PM",
    status: "actionable",
  },
  {
    id: 4,
    initials: "AT",
    title: "Follow up bank statement",
    student: "Aye Thandar",
    category: "Application",
    owner: "May Zin",
    due: "3:00 PM",
    status: "overdue",
  },
  {
    id: 5,
    initials: "KT",
    title: "Review consultation notes",
    student: "Ko Tay Za",
    category: "Consultation",
    owner: "May Zin",
    due: "Tomorrow",
    status: "scheduled",
  },
];

export const consultations: Consultation[] = [
  { time: "09:30", student: "Nang Mya Su Aung" },
  { time: "13:00", student: "Ko Tay Za" },
  { time: "16:30", student: "Thet Naing Oo" },
  { time: "17:30", student: "Thiri Kay" },
];

export const caseHealth: CaseHealth[] = [
  { key: "onTrack", value: 29, width: "68%" },
  { key: "needsAttention", value: 8, width: "20%" },
  { key: "atRisk", value: 5, width: "12%" },
];
