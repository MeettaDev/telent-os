import { z } from "zod";

export const actorSchema = z.enum(["meetta", "student", "office", "noOne"]);
export const dateSchema = z.iso.date();
export const intakeChannels = [
  "phone",
  "office",
  "viber",
  "facebook",
  "tiktok",
  "referral",
  "other",
] as const;
export const contactChannels = ["phone", "viber", "facebook", "other"] as const;
export const contactPeople = ["student", "guardian"] as const;
export const consultationStatuses = [
  "inquiry",
  "scheduled",
  "completed",
] as const;
export const referralSources = [...intakeChannels, "website"] as const;
export const consultationTimeSchema = z.iso.time({ precision: -1 });
export const consultationModes = ["online", "office"] as const;
export const consultationOutcomes = [
  "ready",
  "needsHelp",
  "notNow",
  "notEligible",
] as const;
export const consultationAttendance = ["completed", "noShow", "moved"] as const;
const consultationHost = z.enum(["H", "N"]);
const appointmentSchema = z.object({
  date: dateSchema,
  time: consultationTimeSchema,
  mode: z.enum(consultationModes).optional(),
  host: consultationHost.optional(),
  messageId: z.string().optional(),
});
export const consultationBookingSchema = appointmentSchema
  .omit({ messageId: true })
  .required();
export const consultationOutcomeSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("completed"),
    date: dateSchema,
    outcome: z.enum(consultationOutcomes),
    goal: z.string().trim().max(200),
    notes: z.string().trim().max(1000),
  }),
  z.object({
    status: z.enum(["noShow", "moved"]),
    date: dateSchema,
    notes: z.string().trim().max(1000),
  }),
]);

const intakeSchema = z.object({
  channel: z.enum(intakeChannels),
  contactChannel: z.enum(contactChannels),
  contactPerson: z.enum(contactPeople),
  referralSource: z.enum(referralSources).or(z.literal("")),
  googleEmail: z.email().or(z.literal("")),
  note: z.string(),
  separateReason: z.string().optional(),
  consultation: z.discriminatedUnion("status", [
    z.object({ status: z.literal("inquiry") }),
    appointmentSchema.extend({ status: z.literal("scheduled") }),
    z.object({
      status: z.literal("completed"),
      date: dateSchema,
      outcome: z.string(),
      goal: z.string(),
      notes: z.string().optional(),
      appointment: appointmentSchema.optional(),
    }),
    z.object({
      status: z.enum(["noShow", "moved"]),
      date: dateSchema,
      notes: z.string(),
      appointment: appointmentSchema.optional(),
    }),
  ]),
});
export const documentIds = [
  "legalized",
  "passport",
  "photo",
  "application",
  "topik",
  "bank",
] as const;
export const documentStatusSchema = z.enum([
  "checking",
  "toSend",
  "approved",
  "longTerm",
  "fix",
]);
export const taskKeys = [
  "mofa",
  "nrc",
  "plan",
  "tb",
  "topik",
  "bank",
  "none",
  "documentsApproved",
  "fixRequested",
  "planSent",
  "planConfirmed",
  "planChangeRequested",
  "bookConsultation",
  "holdConsultation",
  "consultationFollowUp",
  "custom",
] as const;

export const studentSchema = z.object({
  id: z.string(),
  name: z.string(),
  initials: z.string(),
  phone: z.string(),
  nrc: z.string(),
  school: z.string(),
  start: dateSchema.or(z.literal("")),
  contact: z.enum([
    "viber",
    "recent2h",
    "today",
    "yesterday",
    "recent3h",
    "recent6d",
    "notLinked",
    "new",
  ]),
  journeyStep: z.number().int().min(1).max(6),
  now: z.enum(taskKeys),
  customAction: z.string(),
  turn: actorSchema,
  nextCheck: dateSchema.nullable(),
  owner: z.enum(["H", "N"]).nullable(),
  intake: intakeSchema.optional(),
});
export const planSchema = z.object({
  university: z.string(),
  program: z.string(),
  schedule: z.string(),
  topik: z.string(),
  why: z.string(),
  backup: z.string(),
  switchIf: z.string(),
  note: z.string(),
  version: z.number().int().positive(),
  status: z.enum(["draft", "sent", "confirmed", "changeRequested"]),
  changeReason: z.string(),
});
export const paperSchema = z.object({
  id: z.string(),
  status: z.enum(["checking", "approved", "fix"]),
  version: z.number().int().positive(),
  checks: z.array(z.enum(["ok", "fix"])).length(3),
  reasons: z.array(z.string()),
  note: z.string(),
  fixMessage: z.string().optional(),
});
export const historySchema = z.object({
  id: z.string(),
  at: z.string(),
  author: z.string().optional(),
  intakeChannel: z.enum(intakeChannels).optional(),
  consultationOutcome: z.enum(consultationOutcomes).optional(),
  kind: z.enum([
    "reviewApproved",
    "reviewFix",
    "planSaved",
    "planSent",
    "planConfirmed",
    "planChangeRequested",
    "studentAdded",
    "messageSent",
    "fileRequested",
    "nextActionSet",
    "consultationBooked",
    "consultationRescheduled",
    "consultationCompleted",
    "consultationOutcome",
    "consultationNoShow",
    "consultationMoved",
    "contactUpdated",
  ]),
  detail: z.string(),
});
export const messageActionSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("file"),
      document: z.enum(documentIds).nullable(),
      date: dateSchema,
      paper: z.string().optional(),
      fileName: z.string().trim().min(1).max(120).optional(),
      request: z.object({ updated: z.boolean() }).optional(),
    })
    .refine(({ document, fileName, paper }) =>
      document === null ? Boolean(fileName) && !paper : !fileName,
    ),
  z.object({
    kind: z.literal("call"),
    date: dateSchema,
    time: z.iso.time({ precision: -1 }),
    booking: z
      .object({
        mode: z.enum(consultationModes),
        host: z.string().trim().min(1),
        duration: z.literal(40).optional(),
        status: z.enum(consultationAttendance).optional(),
      })
      .optional(),
  }),
  z.object({
    kind: z.literal("guide"),
    guide: z.enum(["passport", "topik", "consultation"]),
  }),
]);
export const messageSchema = z.object({
  id: z.string(),
  at: z.string(),
  text: z.string(),
  author: z.string(),
  action: messageActionSchema.optional(),
});
export const workspaceSchema = z.object({
  students: z.array(studentSchema),
  plans: z.record(z.string(), planSchema),
  reviews: z.record(z.string(), z.array(paperSchema)),
  documents: z.record(z.string(), documentStatusSchema),
  history: z.record(z.string(), z.array(historySchema)),
  messages: z.record(z.string(), z.array(messageSchema)),
});

// Recover missing dates without dropping unrelated saved students and edits.
export const storedWorkspaceSchema = workspaceSchema.extend({
  students: z.array(
    studentSchema.extend({
      start: studentSchema.shape.start.catch(""),
      nextCheck: dateSchema.nullable().catch(null),
      intake: studentSchema.shape.intake.catch(undefined),
    }),
  ),
});

export type Actor = z.infer<typeof actorSchema>;
export type Student = z.infer<typeof studentSchema>;
export type Consultation = z.infer<typeof intakeSchema>["consultation"];
export type ConsultationBooking = z.infer<typeof consultationBookingSchema>;
export type ConsultationOutcome = z.infer<typeof consultationOutcomeSchema>;
export type StudentPlan = z.infer<typeof planSchema>;
export type PaperReview = z.infer<typeof paperSchema>;
export type DocumentId = (typeof documentIds)[number];
export type DocumentStatus = z.infer<typeof documentStatusSchema>;
export type HistoryEvent = z.infer<typeof historySchema>;
export type WorkspaceData = z.infer<typeof workspaceSchema>;
export type StudentMessage = z.infer<typeof messageSchema>;
export type MessageAction = z.infer<typeof messageActionSchema>;
