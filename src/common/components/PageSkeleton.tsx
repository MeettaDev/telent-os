"use client";

import { AppSidebar } from "@/common/components/AppSidebar";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";

export type PageSkeletonKind =
  "list" | "dashboard" | "detail" | "form" | "review" | "inbox" | "login";

function Block({ className }: { className: string }) {
  return <div className={cn("rounded-lg bg-muted", className)} />;
}

function Rows({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y rounded-2xl border bg-card px-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex items-center gap-4 py-4">
          <Block className="h-5 w-2/5" />
          <Block className="h-4 w-1/4" />
          <Block className="ml-auto h-5 w-1/6" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton({ kind = "list" }: { kind?: PageSkeletonKind }) {
  const { dictionary } = useLocale();

  return (
    <>
      <p role="status" className="sr-only">
        {dictionary.loadingPage}
      </p>
      <main
        id="main-content"
        aria-busy="true"
        data-page-skeleton={kind}
        className={cn(
          "min-w-0 flex-1",
          kind === "inbox" && "h-dvh overflow-hidden",
        )}
      >
        <div aria-hidden="true" className="motion-safe:animate-pulse">
          {kind === "login" ? (
            <div className="grid min-h-dvh lg:grid-cols-2">
              <div className="hidden bg-primary/80 lg:block" />
              <div className="flex items-center justify-center p-5">
                <div className="w-full max-w-md space-y-4">
                  <Block className="h-8 w-40" />
                  <Block className="h-4 w-3/4" />
                  <Block className="mt-8 h-11 w-full" />
                  <Block className="h-11 w-full" />
                  <Block className="h-10 w-full bg-primary-tint" />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5 p-4 md:p-6 xl:p-8">
              <div className="space-y-2">
                <Block className="h-8 w-44 max-w-full" />
                <Block className="h-4 w-72 max-w-full" />
              </div>
              {kind === "list" && (
                <>
                  <div className="flex gap-2">
                    <Block className="h-9 w-24 rounded-full" />
                    <Block className="h-9 w-28 rounded-full" />
                    <Block className="h-9 w-24 rounded-full" />
                  </div>
                  <Rows />
                </>
              )}
              {kind === "dashboard" && (
                <>
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {Array.from({ length: 4 }, (_, index) => (
                      <Block key={index} className="h-24 rounded-2xl" />
                    ))}
                  </div>
                  <Rows />
                </>
              )}
              {kind === "detail" && (
                <>
                  <Block className="h-20 rounded-2xl" />
                  <div className="grid items-start gap-5 xl:grid-cols-3">
                    <div className="xl:col-span-2">
                      <Rows />
                    </div>
                    <Rows count={3} />
                  </div>
                </>
              )}
              {kind === "form" && (
                <div className="grid items-start gap-5 xl:grid-cols-3">
                  <div className="grid gap-5 rounded-2xl border bg-card p-5 sm:grid-cols-2 xl:col-span-2">
                    {Array.from({ length: 4 }, (_, index) => (
                      <div key={index} className="space-y-2">
                        <Block className="h-4 w-1/2" />
                        <Block className="h-10" />
                      </div>
                    ))}
                    <Block className="h-28 sm:col-span-2" />
                  </div>
                  <Block className="h-64 rounded-2xl" />
                </div>
              )}
              {(kind === "inbox" || kind === "review") && (
                <div className="grid items-start gap-4 md:grid-cols-3 xl:grid-cols-4">
                  <Rows count={4} />
                  <div
                    className={cn(
                      "md:col-span-2",
                      kind === "inbox" && "hidden md:block",
                    )}
                  >
                    <Block className="h-96 rounded-2xl" />
                  </div>
                  <div className="hidden xl:block">
                    <Rows count={3} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export function WorkspaceLoading({ kind }: { kind?: PageSkeletonKind }) {
  return (
    <div className="flex min-h-dvh bg-background">
      <AppSidebar />
      <PageSkeleton kind={kind} />
    </div>
  );
}
