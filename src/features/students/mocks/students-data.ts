import type {
  Student,
  StudentPlan,
  PaperReview,
  DocumentId,
  DocumentStatus,
  WorkspaceData,
} from "@/features/students/types/student";

export const universities = [
  "Kunjang University College",
  "Busan Inst. of Sci. & Tech.",
  "Dongeui Univ. (Korean)",
  "Daegu Science Univ.",
];

export const students: Student[] = [
  {
    id: "MM-2026-0149",
    name: "Ko Thura Zaw",
    initials: "K",
    phone: "+95 9 ••• 771",
    nrc: "12/DEMO(N)000001",
    school: universities[0],
    start: "2027-03-01",
    contact: "viber",
    journeyStep: 2,
    now: "mofa",
    customAction: "",
    turn: "meetta",
    nextCheck: "2026-10-01",
    owner: "N",
  },
  {
    id: "MM-2026-0150",
    name: "May Zin",
    initials: "M",
    phone: "+95 9 000 000 000",
    nrc: "12/DEMO(N)000002",
    school: universities[0],
    start: "2027-03-01",
    contact: "recent2h",
    journeyStep: 2,
    now: "nrc",
    customAction: "",
    turn: "meetta",
    nextCheck: "2026-10-03",
    owner: "H",
  },
  {
    id: "MM-2026-0142",
    name: "Nang Mya Su Aung",
    initials: "N",
    phone: "+95 9 ••• 456",
    nrc: "12/DEMO(N)000003",
    school: universities[1],
    start: "2027-03-01",
    contact: "today",
    journeyStep: 1,
    now: "plan",
    customAction: "",
    turn: "meetta",
    nextCheck: "2026-10-02",
    owner: "H",
  },
  {
    id: "MM-2026-0151",
    name: "Su Su Hlaing",
    initials: "S",
    phone: "+95 9 ••• 562",
    nrc: "12/DEMO(N)000004",
    school: universities[0],
    start: "2027-03-01",
    contact: "yesterday",
    journeyStep: 4,
    now: "tb",
    customAction: "",
    turn: "office",
    nextCheck: "2026-10-02",
    owner: "N",
  },
  {
    id: "MM-2026-0152",
    name: "Ko Aung",
    initials: "K",
    phone: "+95 9 ••• 771",
    nrc: "12/DEMO(N)000005",
    school: universities[2],
    start: "2027-09-01",
    contact: "recent3h",
    journeyStep: 2,
    now: "topik",
    customAction: "",
    turn: "student",
    nextCheck: "2026-10-14",
    owner: "H",
  },
  {
    id: "MM-2026-0153",
    name: "Phyu Phyu Kyaw",
    initials: "P",
    phone: "+95 9 ••• 884",
    nrc: "12/DEMO(N)000006",
    school: universities[0],
    start: "2027-03-01",
    contact: "recent6d",
    journeyStep: 2,
    now: "bank",
    customAction: "",
    turn: "student",
    nextCheck: "2026-10-09",
    owner: "H",
  },
  {
    id: "MM-2026-0154",
    name: "Aung Min",
    initials: "A",
    phone: "",
    nrc: "12/DEMO(N)000007",
    school: universities[3],
    start: "2027-03-01",
    contact: "notLinked",
    journeyStep: 2,
    now: "none",
    customAction: "",
    turn: "noOne",
    nextCheck: null,
    owner: null,
  },
  {
    id: "MM-2026-0155",
    name: "Thiri Win",
    initials: "T",
    phone: "",
    nrc: "12/DEMO(N)000008",
    school: universities[0],
    start: "2027-03-01",
    contact: "yesterday",
    journeyStep: 1,
    now: "custom",
    customAction: "Confirm consultation location",
    turn: "meetta",
    nextCheck: "2026-10-01",
    owner: "H",
  },
];

export const journeyStages = [
  "consultation",
  "documents",
  "application",
  "visa",
  "arrival",
  "career",
] as const;
export const paperKeys = [
  "fatherNrc",
  "yourNrc",
  "motherNrc",
  "household",
  "birth",
  "matriculation",
  "marks",
  "relation",
  "income",
  "employment",
] as const;
export const reviewReasons = [
  "missingBack",
  "blurry",
  "nameMismatch",
  "wrongPaper",
  "cutOff",
] as const;
export const documentRows: { id: DocumentId; due: string | null }[] = [
  { id: "legalized", due: "2026-10-03" },
  { id: "passport", due: "2026-10-03" },
  { id: "photo", due: "2026-10-02" },
  { id: "application", due: "2026-09-28" },
  { id: "topik", due: "2026-12-01" },
  { id: "bank", due: "2026-12-20" },
];
export const initialDocumentStatuses: Record<DocumentId, DocumentStatus> = {
  legalized: "checking",
  passport: "toSend",
  photo: "checking",
  application: "approved",
  topik: "longTerm",
  bank: "longTerm",
};

export function createPlan(student: Student): StudentPlan {
  const isNew = student.contact === "new";
  let schedule = "Mar 2027 · Jan 15, 2027";
  if (isNew) {
    schedule = student.start
      ? new Intl.DateTimeFormat("en-US", {
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        }).format(new Date(student.start + "T00:00:00Z"))
      : "";
  }
  return {
    university: isNew ? student.school : universities[0],
    program: student.intake
      ? ""
      : "Advanced Materials Processing · D-2 · 2 years",
    schedule,
    topik: student.intake ? "" : "Level 2",
    why: "",
    backup: student.intake ? "" : universities[1],
    switchIf: "",
    note: "",
    version: 1,
    status: student.journeyStep === 1 || isNew ? "draft" : "confirmed",
    changeReason: "",
  };
}

export function createPapers(group: DocumentId): PaperReview[] {
  return (group === "legalized" ? paperKeys : [group]).map((id, index) => ({
    id,
    status: index === 0 && group !== "application" ? "checking" : "approved",
    version: index === 0 ? 2 : 1,
    checks: ["ok", "ok", "ok"],
    reasons: group === "legalized" && index === 0 ? ["missingBack"] : [],
    note: "",
  }));
}

export function createWorkspace(): WorkspaceData {
  return {
    students,
    plans: Object.fromEntries(
      students.map((student) => [student.id, createPlan(student)]),
    ),
    reviews: Object.fromEntries(
      students.flatMap((student) =>
        documentRows.map(({ id }) => [student.id + ":" + id, createPapers(id)]),
      ),
    ),
    documents: Object.fromEntries(
      students.flatMap((student) =>
        documentRows.map(({ id }) => [
          student.id + ":" + id,
          initialDocumentStatuses[id],
        ]),
      ),
    ),
    history: {},
    messages: {},
  };
}
