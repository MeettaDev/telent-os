import { UniversityDetail } from "@/features/universities/components/UniversityDetail";

export default async function Page({
  params,
}: {
  params: Promise<{ universityId: string }>;
}) {
  const { universityId } = await params;
  return <UniversityDetail key={universityId} id={universityId} />;
}
