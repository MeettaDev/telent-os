"use client";

import { LoginForm } from "@/features/auth/components/LoginForm";
import { Text } from "@/components/ui/typography";
import { useLocale } from "@/providers/locale-provider";

export function LoginPage() {
  const { dictionary } = useLocale();

  return (
    <main className="grid min-h-dvh bg-[#f6f8f5] lg:grid-cols-[minmax(0,1fr)_minmax(32rem,0.82fr)] dark:bg-background">
      <section className="relative hidden overflow-hidden bg-[#0d789f] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="absolute -right-32 top-24 size-96 rounded-full border border-white/10" />
        <div className="absolute -bottom-48 -left-20 size-[34rem] rounded-full border border-white/10" />
        <div className="relative">
          <p className="text-[32px] font-bold leading-none tracking-[-0.05em]">
            {dictionary.appName}
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/70">
            {dictionary.appTagline}
          </p>
        </div>
        <div className="relative max-w-xl">
          <p className="text-4xl font-semibold leading-[1.15] tracking-[-0.04em] text-balance xl:text-5xl">
            {dictionary.auth.sideTitle}
          </p>
          <p className="mt-5 max-w-[55ch] text-base leading-[1.6] text-white/75">
            {dictionary.auth.sideDescription}
          </p>
        </div>
        <Text className="relative text-white/60" variant="caption">
          {dictionary.auth.secureWorkspace}
        </Text>
      </section>
      <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <p className="text-[28px] font-bold leading-none tracking-[-0.05em] text-primary">
              {dictionary.appName}
            </p>
            <Text variant="caption" className="mt-1 font-semibold uppercase">
              {dictionary.appTagline}
            </Text>
          </div>
          <Text as="h1" variant="page-title">
            {dictionary.auth.title}
          </Text>
          <Text className="mt-2 max-w-[48ch]" variant="description">
            {dictionary.auth.description}
          </Text>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
