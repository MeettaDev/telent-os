import { InboxView } from "@/features/inbox/components/InboxView";
import { StudentWorkspace } from "@/features/students/components/StudentWorkspace";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { student } = await searchParams;
  return (
    <StudentWorkspace>
      <InboxView
        initialStudent={typeof student === "string" ? student : undefined}
      />
    </StudentWorkspace>
  );
}
