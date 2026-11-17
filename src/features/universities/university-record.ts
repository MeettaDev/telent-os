import { addMonths, formatISO, parseISO } from "date-fns";
import { z } from "zod";

export const milestoneKeys = [
  "interview",
  "result",
  "tuition",
  "certificate",
  "orientation",
] as const;
export const requirementKeys = [
  "language",
  "bank",
  "documents",
  "legalization",
  "fee",
] as const;
export const contactKeys = ["office", "channel", "lastContact"] as const;

const text = z.string().trim().max(1000);
const requiredText = text.min(1);
const optionalDate = z.union([z.iso.date(), z.literal("")]);
const pdfUrl = text.refine(
  (value) =>
    !value ||
    value === "/guidelines/kunjang-sample.pdf" ||
    z.url({ protocol: /^https?$/ }).safeParse(value).success,
);

export const universityFieldsSchema = z
  .object({
    name: requiredText.max(120),
    city: requiredText.max(80),
    summary: text,
    intake: z.iso.date(),
    opensOn: optionalDate,
    closesOn: optionalDate,
    applicationNote: text,
    topik: text,
    bankProof: text,
    checkedOn: optionalDate,
    source: text,
    guidelineUrl: pdfUrl,
    milestones: z.record(z.enum(milestoneKeys), text),
    requirements: z.record(z.enum(requirementKeys), text),
    contacts: z.record(z.enum(contactKeys), text),
  })
  .refine(
    ({ opensOn, closesOn }) => !opensOn || !closesOn || opensOn <= closesOn,
  );

export const programFieldsSchema = z.object({
  name: requiredText.max(120),
  track: text,
  visa: text,
  length: text,
  seats: z.number().int().min(1).max(10000).nullable(),
  career: text,
});
const programSchema = programFieldsSchema.extend({ id: requiredText });
const assignmentSchema = z.object({
  studentId: requiredText,
  programId: requiredText.optional(),
  backup: z.boolean().optional(),
});
const historySchema = z.object({
  version: z.number().int().positive(),
  on: z.iso.date(),
  note: text,
  author: text.optional(),
});

export const universitySchema = universityFieldsSchema.safeExtend({
  id: requiredText,
  version: z.number().int().positive(),
  programs: z.array(programSchema),
  assignments: z.array(assignmentSchema),
  history: z.array(historySchema),
});

export type UniversityFields = z.infer<typeof universityFieldsSchema>;
export type ProgramFields = z.infer<typeof programFieldsSchema>;
export type University = z.infer<typeof universitySchema>;
export type UniversityFilter = "all" | "hasStudents" | "recheck" | "draft";

export const emptyUniversity: UniversityFields = {
  name: "",
  city: "",
  summary: "",
  intake: "2027-03-01",
  opensOn: "",
  closesOn: "",
  applicationNote: "",
  topik: "",
  bankProof: "",
  checkedOn: "",
  source: "",
  guidelineUrl: "",
  milestones: {
    interview: "",
    result: "",
    tuition: "",
    certificate: "",
    orientation: "",
  },
  requirements: {
    language: "",
    bank: "",
    documents: "",
    legalization: "",
    fee: "",
  },
  contacts: { office: "", channel: "", lastContact: "" },
};

export function workspaceDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Yangon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function recheckDate(checkedOn: string) {
  return checkedOn
    ? formatISO(addMonths(parseISO(checkedOn), 6), { representation: "date" })
    : "";
}

export function universityStatus(record: University, today: string) {
  if (!record.checkedOn) return "draft";
  return recheckDate(record.checkedOn) <= today ? "recheck" : "verified";
}

export function matchesUniversity(
  record: University,
  filter: UniversityFilter,
  query: string,
  today: string,
) {
  const search = query.trim().toLocaleLowerCase();
  const matchesFilter =
    filter === "all" ||
    (filter === "hasStudents"
      ? record.assignments.length > 0
      : universityStatus(record, today) === filter);
  return (
    matchesFilter &&
    [
      record.name,
      record.city,
      record.summary,
      ...record.programs.map(({ name, track }) => name + " " + track),
    ].some((value) => value.toLocaleLowerCase().includes(search))
  );
}
