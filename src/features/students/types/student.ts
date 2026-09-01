export type StudentHealth = "atRisk" | "needsAttention" | "onTrack";
export type CounselorId = `USR-CON-${string}`;
export type IsoDate = `${number}-${number}-${number}`;

export type Student = {
  id: string;
  initials: string;
  name: string;
  plan: string;
  school: string;
  stage: string;
  support: "selectedSteps" | "selfManaged" | "fullSupport";
  action: string;
  actor: string;
  owner: CounselorId | null;
  deadline: IsoDate;
  health: StudentHealth;
  unclaimed?: boolean;
};

export type StudentDetail = Student & {
  location: string;
  caseOwner: string;
  currentPhase: string;
  officialDeadline: IsoDate;
  deadlineDays: number;
  milestone: string;
  dueTime: string;
  blocker: string;
  intake: string;
  university: string;
  program: string;
  publishedAt: string;
};
