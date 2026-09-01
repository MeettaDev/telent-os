"use client";

import { AppHeader } from "@/common/components/AppHeader";
import { AppSidebar } from "@/common/components/AppSidebar";
import { Text } from "@/components/ui/typography";
import { ReferenceCatalog } from "@/features/reference-rules/components/ReferenceCatalog";
import { operatingRules } from "@/features/reference-rules/mocks/reference-rules-data";
import { useLocale } from "@/providers/locale-provider";

export function ReferenceRulesView() {
  const { dictionary } = useLocale();
  const copy = dictionary.referenceRules;
  return (
    <div className="flex min-h-dvh bg-[#f6f8f5] dark:bg-background">
      <AppSidebar />
      <div className="min-w-0 flex-1">
        <AppHeader variant="reference" />
        <main
          id="main-content"
          className="mx-auto px-4 pb-10 pt-7 md:px-7 md:pt-8 xl:px-8"
        >
          <div className="flex items-start justify-between gap-5">
            <div>
              <Text as="h1" variant="page-title">
                {copy.title}
              </Text>
              <Text className="mt-1" variant="description">
                {copy.description}
              </Text>
            </div>
            <span className="shrink-0 rounded-full bg-primary-tint px-3 py-1 text-[10px] font-semibold uppercase text-primary-hover">
              {copy.spec}
            </span>
          </div>
          <div className="mt-6">
            <ReferenceCatalog copy={copy} />
          </div>
          <section className="mt-7">
            <Text variant="caption" className="mb-3 font-semibold uppercase">
              {copy.operatingRules}
            </Text>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {operatingRules.map((rule) => (
                <article
                  className="border-t-2 border-primary bg-card px-5 py-5 shadow-[0_0_0_1px_var(--border)]"
                  key={rule.key}
                >
                  <div className="flex items-center justify-between gap-3">
                    <Text variant="card-title">{copy[rule.key]}</Text>
                    <Text variant="caption" className="font-semibold">
                      {rule.code}
                    </Text>
                  </div>
                  <Text variant="caption" className="mt-2">
                    {copy[rule.detailKey]}
                  </Text>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
