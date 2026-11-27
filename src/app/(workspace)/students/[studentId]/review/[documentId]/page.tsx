import { DocumentReviewView } from "@/features/students/components/DocumentReviewView";
export default async function ReviewPage({
  params,
}: {
  params: Promise<{ studentId: string; documentId: string }>;
}) {
  const { studentId, documentId } = await params;
  return <DocumentReviewView studentId={studentId} documentId={documentId} />;
}
