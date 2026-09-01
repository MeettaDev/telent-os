import { students } from "@/features/students/mocks/students-data";
import type { StudentDetail } from "@/features/students/types/student";

const detailOverrides: Record<string, Partial<StudentDetail>> = {
  "MM-2026-0142": {
    location: "Yangon, Myanmar",
    caseOwner: "USR-CON-001",
    currentPhase: "Application preparation",
    officialDeadline: "2026-09-15",
    deadlineDays: 29,
    milestone: "Bank statement review",
    dueTime: "Today · 4:00 PM",
    blocker: "None · in review 14 min",
    intake: "Spring 2027",
    university: "Sejong University",
    program: "Smart Agri-Food",
    publishedAt: "Aug 16 by May Zin",
  },
  "MM-2026-0144": {
    location: "Mandalay, Myanmar",
    currentPhase: "Consultation",
    university: "Hanyang University",
    program: "Mechanical Engineering",
  },
  "MM-2026-0145": {
    location: "Yangon, Myanmar",
    currentPhase: "Plan selection",
    university: "University options pending",
    program: "Korean language pathway",
  },
  "MM-2026-0146": {
    location: "Naypyidaw, Myanmar",
    currentPhase: "Application",
    university: "Yonsei University",
    program: "Biotechnology",
  },
  "MM-2026-0147": {
    location: "Bago, Myanmar",
    currentPhase: "Application preparation",
    university: "Kunjang University College",
    program: "Automotive Engineering",
  },
  "MM-2026-0148": {
    location: "Yangon, Myanmar",
    currentPhase: "Visa",
    university: "Edith Cowan University",
    program: "International Business",
  },
};

export const studentDetails: StudentDetail[] = students.map((student) => ({
  ...student,
  location: "Yangon, Myanmar",
  caseOwner: student.owner ?? "Unassigned",
  currentPhase: student.stage,
  officialDeadline: "2026-09-15",
  deadlineDays: 29,
  milestone: student.action,
  dueTime: student.deadline,
  blocker: "None",
  intake: "Spring 2027",
  university: student.school.split(" · ")[0],
  program: student.school.split(" · ")[1] ?? student.plan,
  publishedAt: "Aug 16 by May Zin",
  ...detailOverrides[student.id],
}));

export function getStudentDetail(studentId: string) {
  return studentDetails.find((student) => student.id === studentId);
}
