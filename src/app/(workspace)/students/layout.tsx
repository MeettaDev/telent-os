import { StudentWorkspace } from "@/features/students/components/StudentWorkspace";
export default function StudentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentWorkspace>{children}</StudentWorkspace>;
}
