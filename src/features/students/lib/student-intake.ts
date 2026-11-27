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

export const studentContactSchema = z.object({
  channel: z.enum(intakeChannels),
  name: z.string().trim().min(1, "required").max(120, "nameTooLong"),
  reachableContact: reachableContactSchema,
  contactChannel: z.enum(contactChannels),
  contactPerson: z.enum(contactPeople),
  referralSource: z.enum(referralSources).or(z.literal("")).default(""),
});

export const studentIntakeFormSchema = studentContactSchema
  .extend({
    owner: z.enum(["H", "N"]),
    status: z.enum(consultationStatuses).default("inquiry"),
    scheduledDate: z.string().default(""),
    scheduledTime: z.string().default(""),
    completedDate: z.string().default(""),
    outcome: z.string().trim().max(200).default(""),
    goal: z.string().trim().max(200).default(""),
    nextAction: z.string().trim().max(200).default(""),
    dueDate: z
      .union([z.literal(""), dateSchema], { error: "invalidDate" })
      .refine((date) => !date || date >= yangonToday(), "pastDueDate")
      .default(""),
    googleEmail: z
      .string()
      .trim()
      .max(254)
      .refine(
        (value) => !value || z.email().safeParse(value).success,
        "invalidEmail",
      )
      .default(""),
    note: z.string().trim().max(1000).default(""),
    separateReason: z.string().trim().max(500, "reasonTooLong").default(""),
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

export type StudentIntakeInput = z.input<typeof studentIntakeFormSchema>;
export type StudentIntakeForm = z.output<typeof studentIntakeFormSchema>;
export type StudentContact = z.input<typeof studentContactSchema>;
