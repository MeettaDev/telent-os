import { notFound } from "next/navigation";

import { StudentDetailView } from "@/features/students/components/StudentDetailView";
import {
  getStudentDetail,
  studentDetails,
} from "@/features/students/mocks/student-details-data";

export function generateStaticParams() {
  return studentDetails.map((student) => ({ studentId: student.id }));
}

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const student = getStudentDetail(studentId);

  if (!student) notFound();
  return <StudentDetailView student={student} />;
}
