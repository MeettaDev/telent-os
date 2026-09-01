import { StudentJourneys } from "@/features/students/components/StudentJourneys";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialQuery = typeof params.search === "string" ? params.search : "";

  return <StudentJourneys initialQuery={initialQuery} />;
}
