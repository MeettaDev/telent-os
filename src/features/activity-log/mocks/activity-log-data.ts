export type ActivityActor = "student" | "counselor" | "finance" | "system";

export const activityGroups = [
  { labelKey: "today", eventIds: ["reject", "reminder", "upload", "urgent"] },
  { labelKey: "yesterday", eventIds: ["payer", "inactive"] },
  { labelKey: "earlier", eventIds: ["plan", "payment", "cleared"] },
] as const;

export const activityEvents = [
  {
    id: "reject",
    actor: "counselor",
    initials: "MZ",
    titleKey: "rejectTitle",
    noteKey: "rejectNote",
    metaKey: "meettaTwoHours",
    code: "EV_COUNSELOR_REJECT",
    tone: "red",
  },
  {
    id: "reminder",
    actor: "system",
    initials: "SY",
    titleKey: "reminderTitle",
    noteKey: null,
    metaKey: "systemTwoHours",
    code: "EV_DEADLINE_T3",
    tone: "amber",
  },
  {
    id: "upload",
    actor: "student",
    initials: "NM",
    titleKey: "uploadTitle",
    noteKey: null,
    metaKey: "b2cFourteen",
    code: "EV_STUDENT_SUBMIT",
    tone: "green",
  },
  {
    id: "urgent",
    actor: "counselor",
    initials: "MZ",
    titleKey: "urgentTitle",
    noteKey: "urgentNote",
    metaKey: "meettaFiveHours",
    code: "EV_COUNSELOR_FLAG_URGENT",
    tone: "red",
  },
  {
    id: "payer",
    actor: "finance",
    initials: "FW",
    titleKey: "payerTitle",
    noteKey: "payerNote",
    metaKey: "meettaOneDay",
    code: "EV_PAYER_MISMATCH_FLAGGED",
    tone: "red",
  },
  {
    id: "inactive",
    actor: "system",
    initials: "SY",
    titleKey: "inactiveTitle",
    noteKey: null,
    metaKey: "systemOneDay",
    code: "EV_NO_ACTIVITY_7D",
    tone: "amber",
  },
  {
    id: "plan",
    actor: "counselor",
    initials: "MZ",
    titleKey: "planTitle",
    noteKey: null,
    metaKey: "meettaThreeDays",
    code: "EV_PLAN_CONFIRMED",
    tone: "green",
  },
  {
    id: "payment",
    actor: "student",
    initials: "SL",
    titleKey: "paymentTitle",
    noteKey: null,
    metaKey: "b2cFiveDays",
    code: "EV_PAYMENT_VERIFIED",
    tone: "green",
  },
  {
    id: "cleared",
    actor: "counselor",
    initials: "MZ",
    titleKey: "clearedTitle",
    noteKey: "clearedNote",
    metaKey: "meettaSixDays",
    code: "EV_CLEAR_FLAG",
    tone: "green",
  },
] as const satisfies readonly {
  id: string;
  actor: ActivityActor;
  initials: string;
  titleKey: string;
  noteKey: string | null;
  metaKey: string;
  code: string;
  tone: "red" | "amber" | "green";
}[];
