"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppShellStore } from "@/common/stores/app-shell-store";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";

export function WorkspacePageHeader({
  title,
  avatar,
  description,
  actions,
  breadcrumbs,
  breadcrumbLabel,
  children,
  toolbar,
  inlineActions = false,
}: {
  title: ReactNode;
  avatar?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  breadcrumbLabel?: string;
  children?: ReactNode;
  toolbar?: ReactNode;
  inlineActions?: boolean;
}) {
  const { dictionary } = useLocale();
  const toggle = useAppShellStore((state) => state.toggleMobileSidebar);
  return (
    <header
      className={cn(
        "sticky top-0 z-20 bg-background px-4 pt-4 md:px-6 xl:px-8",
        breadcrumbs
          ? "space-y-4 pb-4 sm:pt-8"
          : "space-y-5 pb-5 md:pt-6 xl:pt-8",
        inlineActions && "max-lg:static",
      )}
    >
      {breadcrumbs && (
        <nav
          aria-label={breadcrumbLabel ?? dictionary.studentWorkspace.breadcrumb}
          className="flex flex-wrap items-center gap-2 text-sm font-semibold text-muted-foreground"
        >
          {breadcrumbs.map((item, index) => (
            <span
              key={index}
              className="inline-flex min-w-0 max-w-full items-center gap-2 wrap-anywhere"
            >
              {index > 0 && <span aria-hidden="true">/</span>}
              {item.href ? (
                <Link
                  href={item.href}
                  className="rounded-sm hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div
        className={cn(
          "flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between",
          inlineActions && "lg:flex-row lg:items-center lg:justify-between",
        )}
      >
        <div
          className={cn(
            "flex min-w-0 items-start gap-3 xl:flex-1",
            inlineActions && "items-center lg:flex-1",
          )}
        >
          <Button
            variant="outline"
            size="icon"
            type="button"
            aria-label={dictionary.sidebar.open}
            className="shrink-0 lg:hidden"
            onClick={toggle}
          >
            <Menu aria-hidden="true" />
          </Button>
          {avatar}
          <div className="min-w-0 flex-1">
            <h1
              className={cn(
                "workspace-title-size font-bold leading-tight tracking-tight text-foreground wrap-anywhere",
                breadcrumbs && "leading-8",
                inlineActions && "lg:text-[28px]",
              )}
            >
              {title}
            </h1>
            {description && (
              <div className="mt-1 text-sm leading-5 text-muted-foreground">
                {description}
              </div>
            )}
            {children && <div className="mt-1">{children}</div>}
          </div>
        </div>
        {actions && (
          <div
            className={cn(
              "flex flex-wrap items-center gap-2 xl:shrink-0",
              inlineActions && "gap-3 lg:shrink-0",
            )}
          >
            {actions}
          </div>
        )}
      </div>
      {toolbar}
    </header>
  );
}
