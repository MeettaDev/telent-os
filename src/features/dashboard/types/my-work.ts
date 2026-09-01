export type QueueStatus = "actionable" | "dueSoon" | "overdue" | "scheduled";
export type QueueItem = {
  id: number;
  initials: string;
  title: string;
  student: string;
  category: string;
  owner: string;
  due: string;
  status: QueueStatus;
};
export type Consultation = { time: string; student: string };
export type CaseHealth = {
  key: "onTrack" | "needsAttention" | "atRisk";
  value: number;
  width: string;
};
