"use client";

import { Text } from "@/components/ui/typography";
import { useLocale } from "@/providers/locale-provider";

export function AdminPlaceholderPage({
  titleKey,
}: {
  titleKey:
    | "consultations"
    | "messages"
    | "escalations"
    | "referenceRules"
    | "activityLog"
    | "admissions";
}) {
  const { dictionary } = useLocale();
  return (
    <main className="mx-auto w-full max-w-[96rem] p-5 md:p-8">
      <Text as="h1" variant="page-title">
        {dictionary.sidebar[titleKey]}
      </Text>
      <Text variant="description" className="mt-1">
        {dictionary.admin.placeholderDescription}
      </Text>
      <section className="surface mt-6 min-h-[20rem]" />
    </main>
  );
}
