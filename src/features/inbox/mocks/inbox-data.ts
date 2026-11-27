import type { WorkspaceData } from "@/features/students/types/student";

export const inboxThreads = [
  { id: "MM-2026-0150", key: "may", time: "09:12", waiting: true },
  { id: "MM-2026-0152", key: "ko", time: "hours", waiting: true },
  { id: "MM-2026-0155", key: "thiri", time: "yesterday", waiting: true },
  { id: "MM-2026-0153", key: "phyu", time: "yesterday", waiting: true },
  { id: "MM-2026-0151", key: "su", time: "sep30", waiting: false },
] as const;

export function isWaiting(id: string, messages: WorkspaceData["messages"]) {
  return (
    !messages[id]?.length &&
    inboxThreads.some((thread) => thread.id === id && thread.waiting)
  );
}

export function waitingCount(messages: WorkspaceData["messages"]) {
  return inboxThreads.filter((thread) => isWaiting(thread.id, messages)).length;
}
