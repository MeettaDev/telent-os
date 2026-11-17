import { StudentPlanView } from "@/features/students/components/StudentPlanView";
export default async function PlanPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  return <StudentPlanView studentId={studentId} />;
}
