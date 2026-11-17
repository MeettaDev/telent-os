import type {
  Actor,
  MessageAction,
  PaperReview,
  Student,
  StudentPlan,
  WorkspaceData,
} from "@/features/students/types/student";

export type StudentFilter = "all" | Actor;
export type CallAction = Extract<MessageAction, { kind: "call" }>;

export function yangonToday() {
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "short",
    timeZone: "Asia/Yangon",
  }).format(new Date());
}

export function addDays(date: string, days: number) {
  const result = new Date(date + "T00:00:00Z");
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

export function callDateLabel(date: string, locale: "en" | "my") {
  return new Intl.DateTimeFormat(locale === "my" ? "my-MM" : "en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(date + "T00:00:00Z"));
}

export function isCallSlotTaken(
  messages: WorkspaceData["messages"],
  studentId: string,
  host: string,
  date: string,
  time: string,
) {
  const minutes = (slot: string) =>
    Number(slot.slice(0, 2)) * 60 + Number(slot.slice(3));
  const start = minutes(time);
  return Object.entries(messages).some(([id, thread]) =>
    thread.some(
      ({ action, author }) =>
        action?.kind === "call" &&
        action.date === date &&
        Math.abs(minutes(action.time) - start) < 30 &&
        (id === studentId || (action.booking?.host ?? author) === host),
    ),
  );
}

export function filterStudents(
  students: Student[],
  query: string,
  filter: StudentFilter,
) {
  const search = query.trim().toLowerCase();
  return students.filter(
    (student) =>
      (filter === "all" || student.turn === filter) &&
      (!search ||
        [student.name, student.school, student.phone, student.nrc].some(
          (value) => value.toLowerCase().includes(search),
        )),
  );
}

export function planIsReady(plan: StudentPlan) {
  return [
    plan.university,
    plan.program,
    plan.schedule,
    plan.topik,
    plan.why,
  ].every((value) => value.trim().length > 0);
}

export function reviewCanDecide(
  paper: PaperReview,
  decision: "approved" | "fix",
) {
  return decision === "approved"
    ? paper.checks.every((check) => check === "ok")
    : paper.reasons.length > 0 || paper.note.trim().length > 0;
}

export function dateLabel(
  date: string | null,
  locale: "en" | "my",
  today: string,
  noDate: string,
  monthOnly = false,
) {
  if (!date) return noDate;
  const parsed = new Date(date + "T00:00:00Z");
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== date
  )
    return noDate;
  if (!monthOnly && date === "2026-10-01") return today;
  return new Intl.DateTimeFormat(locale === "my" ? "my-MM" : "en-US", {
    month: "short",
    ...(monthOnly ? { year: "numeric" as const } : { day: "numeric" as const }),
    timeZone: "UTC",
  }).format(parsed);
}
