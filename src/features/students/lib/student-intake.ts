import { z } from "zod";
import { yangonToday } from "@/features/students/lib/student-workflow";
import {
  consultationStatuses,
  consultationTimeSchema,
  contactChannels,
  contactPeople,
  dateSchema,
  intakeChannels,
  referralSources,
  type Student,
} from "@/features/students/types/student";

export const intakeOwners = { H: "Hsu Wai", N: "Nway Nway" } as const;
function asciiDigits(value: string) {
  return value.replace(/[၀-၉]/g, (digit) =>
    String(digit.charCodeAt(0) - 0x1040),
  );
}

const reachableContactSchema = z
  .string()
  .trim()
  .min(1, "required")
  .refine(
    (value) =>
      !value || /^(?:\+95[ -]?9|09)(?:[ -]?\d){9}$/.test(asciiDigits(value)),
    "invalidPhone",
  );

function contactKey(contact: string) {
  const value = asciiDigits(contact.trim().toLowerCase());
  if (!/^\+?[\d\s().-]+$/.test(value)) return value;

  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("09")) return "95" + digits.slice(1);
  if (digits.startsWith("0095")) return digits.slice(2);
  return digits;
}

export function findIntakeMatches(students: Student[], contact: string) {
  const key = contactKey(contact);
  return key
    ? students.filter((student) => contactKey(student.phone) === key)
    : [];
}

export const studentIntakeFormSchema = z
  .object({
    channel: z.enum(intakeChannels),
    name: z.string().trim().min(1, "required").max(120),
    reachableContact: reachableContactSchema,
    contactChannel: z.enum(contactChannels),
    contactPerson: z.enum(contactPeople),
    owner: z.enum(["H", "N"]),
    referralSource: z.enum(referralSources).or(z.literal("")),
    status: z.enum(consultationStatuses),
    scheduledDate: z.string(),
    scheduledTime: z.string(),
    completedDate: z.string(),
    outcome: z.string().trim().max(200),
    goal: z.string().trim().max(200),
    nextAction: z.string().trim().max(200),
    dueDate: z
      .union([z.literal(""), dateSchema], { error: "invalidDate" })
      .refine((date) => !date || date >= yangonToday(), "pastDueDate"),
    googleEmail: z
      .string()
      .trim()
      .max(254)
      .refine(
        (value) => !value || z.email().safeParse(value).success,
        "invalidEmail",
      ),
    note: z.string().trim().max(1000),
    separateReason: z.string().trim().max(500),
  })
  .superRefine((values, context) => {
    if (values.status === "scheduled") {
      if (!dateSchema.safeParse(values.scheduledDate).success)
        context.addIssue({
          code: "custom",
          path: ["scheduledDate"],
          message: "invalidDate",
        });
      if (!consultationTimeSchema.safeParse(values.scheduledTime).success)
        context.addIssue({
          code: "custom",
          path: ["scheduledTime"],
          message: "invalidTime",
        });
    }
    if (values.status === "completed") {
      if (!dateSchema.safeParse(values.completedDate).success)
        context.addIssue({
          code: "custom",
          path: ["completedDate"],
          message: "invalidDate",
        });
      if (!values.outcome)
        context.addIssue({
          code: "custom",
          path: ["outcome"],
          message: "required",
        });
    }
  });

export type StudentIntakeForm = z.infer<typeof studentIntakeFormSchema>;
