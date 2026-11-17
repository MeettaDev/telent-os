import { StudentDetailView } from "@/features/students/components/StudentDetailView";
import { students } from "@/features/students/mocks/students-data";
export function generateStaticParams() {
  return students.map((student) => ({ studentId: student.id }));
}
export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  return <StudentDetailView studentId={studentId} />;
}
