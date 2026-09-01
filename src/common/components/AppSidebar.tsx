"use client";

import {
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  GraduationCap,
  History,
  MessageSquareText,
  ShieldAlert,
  UsersRound,
  Video,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useMockUser } from "@/common/auth/mock-auth";
import { Text } from "@/components/ui/typography";
import { useAppShellStore } from "@/common/stores/app-shell-store";
import { UserProfileMenu } from "@/common/components/UserProfileMenu";
import { useLocale } from "@/providers/locale-provider";

const primaryItems = [
  { key: "myWork", href: "/", icon: ClipboardList, count: 7 },
  { key: "students", href: "/students", icon: UsersRound, count: undefined },
  { key: "consultations", href: "/consultations", icon: Video, count: 3 },
  { key: "reviews", href: "/reviews", icon: BookOpenText, count: 4 },
  { key: "payments", href: "/payments", icon: CreditCard, count: 2 },
  { key: "messages", href: "/messages", icon: MessageSquareText, count: 5 },
  { key: "escalations", href: "/escalations", icon: ShieldAlert, count: 2 },
] as const;

const operationItems = [
  { key: "referenceRules", href: "/reference-rules", icon: BookOpenText },
  { key: "activityLog", href: "/activity-log", icon: History },
  { key: "admissions", href: "/admissions", icon: GraduationCap },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const user = useMockUser();
  const { dictionary } = useLocale();
  const {
    isSidebarCollapsed: collapsed,
    isMobileSidebarOpen,
    toggleSidebar,
    closeMobileSidebar,
  } = useAppShellStore();

  return (
    <>
      {isMobileSidebarOpen && (
        <button
          aria-label={dictionary.sidebar.close}
          className="fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-[2px] lg:hidden"
          onClick={closeMobileSidebar}
          type="button"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[17rem] bg-card shadow-xl shadow-slate-900/10 transition-[width,transform] duration-200 lg:sticky lg:top-0 lg:z-10 lg:h-dvh lg:shrink-0 lg:translate-x-0 lg:border-r lg:border-border lg:shadow-none motion-reduce:transition-none ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} ${collapsed ? "lg:w-[5.25rem]" : "lg:w-[17rem]"}`}
      >
        <div className="flex min-w-0 flex-1 flex-col p-4">
          <div
            className={`flex h-12 items-center ${collapsed ? "lg:justify-center" : "justify-between"}`}
          >
            <div className={collapsed ? "lg:hidden" : "block"}>
              <p className="text-[28px] font-bold leading-none tracking-[-0.05em] text-primary">
                {dictionary.appName}
              </p>
              <Text
                variant="caption"
                className="mt-1 font-semibold uppercase tracking-[0.06em]"
              >
                {dictionary.appTagline}
              </Text>
            </div>
            <button
              aria-label={dictionary.sidebar.close}
              className="flex size-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted lg:hidden"
              onClick={closeMobileSidebar}
              type="button"
            >
              <X className="size-4" />
            </button>
            <button
              aria-label={
                collapsed
                  ? dictionary.sidebar.expand
                  : dictionary.sidebar.collapse
              }
              className="hidden size-9 cursor-pointer items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:flex"
              onClick={toggleSidebar}
              type="button"
            >
              {collapsed ? (
                <ChevronRight className="size-4" />
              ) : (
                <ChevronLeft className="size-4" />
              )}
            </button>
          </div>
          <div
            className={`mt-4 rounded-xl bg-[#f3f5f3] p-4 dark:bg-muted ${collapsed ? "lg:hidden" : "block"}`}
          >
            <Text
              variant="caption"
              className="font-semibold uppercase text-primary-hover"
            >
              {dictionary.sidebar.workspace}
            </Text>
            <Text variant="body" className="mt-2 font-semibold">
              {dictionary.sidebar.assignedStudents}
            </Text>
          </div>
          <nav aria-label="Workspace" className="mt-5 space-y-1">
            {primaryItems.map(({ key, href, icon: Icon, count }) => {
              const isActive =
                href === "/"
                  ? pathname === href
                  : pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  aria-current={isActive ? "page" : undefined}
                  aria-label={dictionary.sidebar[key]}
                  className={`relative flex w-full cursor-pointer items-center rounded-xl py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${collapsed ? "lg:justify-center lg:px-0" : "gap-3 px-3"} ${isActive ? "bg-primary-tint font-semibold text-primary-hover before:absolute before:left-0 before:h-8 before:w-1 before:rounded-full before:bg-primary" : "text-[#525b54] hover:bg-muted dark:text-muted-foreground"}`}
                  href={href}
                  key={key}
                  onClick={closeMobileSidebar}
                  title={collapsed ? dictionary.sidebar[key] : undefined}
                >
                  <Icon
                    aria-hidden="true"
                    className={`size-[18px] shrink-0 ${collapsed ? "lg:block" : "lg:hidden"}`}
                    strokeWidth={1.8}
                  />
                  <span className={collapsed ? "lg:hidden" : "block"}>
                    {dictionary.sidebar[key]}
                  </span>
                  {count && (
                    <span
                      className={`ml-auto min-w-7 rounded-full bg-[#ecefec] px-2 py-1 text-center text-xs font-medium text-[#59625b] dark:bg-muted ${collapsed ? "lg:absolute lg:right-1 lg:top-1 lg:min-w-4 lg:px-1 lg:py-0 lg:text-[9px]" : ""}`}
                    >
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <Text
            variant="caption"
            className={`mb-2 mt-6 px-1 font-semibold uppercase text-[#59625b] ${collapsed ? "lg:hidden" : "block"}`}
          >
            {dictionary.sidebar.operations}
          </Text>
          <nav aria-label="Operations" className="space-y-1">
            {operationItems.map(({ key, href, icon: Icon }) => {
              const isActive =
                pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  aria-current={isActive ? "page" : undefined}
                  aria-label={dictionary.sidebar[key]}
                  className={`relative flex w-full cursor-pointer items-center rounded-xl py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${collapsed ? "lg:justify-center lg:px-0" : "gap-3 px-3"} ${isActive ? "bg-primary-tint font-semibold text-primary-hover before:absolute before:left-0 before:h-8 before:w-1 before:rounded-full before:bg-primary" : "text-[#525b54] hover:bg-muted dark:text-muted-foreground"}`}
                  href={href}
                  key={key}
                  onClick={closeMobileSidebar}
                  title={collapsed ? dictionary.sidebar[key] : undefined}
                >
                  <Icon
                    className={`size-[18px] shrink-0 ${collapsed ? "lg:block" : "lg:hidden"}`}
                    strokeWidth={1.8}
                  />
                  <span className={collapsed ? "lg:hidden" : "block"}>
                    {dictionary.sidebar[key]}
                  </span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto border-t border-border pt-4">
            <div
              className={`flex items-center ${collapsed ? "lg:justify-center" : "gap-3 px-1"}`}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-tint text-sm font-semibold text-primary-hover">
                {user.initials}
              </span>
              <div
                className={`min-w-0 flex-1 ${collapsed ? "lg:hidden" : "block"}`}
              >
                <Text variant="body" className="font-semibold">
                  {user.username}
                </Text>
                <Text variant="caption">
                  {user.role === "admin"
                    ? dictionary.sidebar.adminRole
                    : dictionary.sidebar.counselorRole}
                </Text>
              </div>
              <div className={collapsed ? "lg:hidden" : "block"}>
                <UserProfileMenu trigger="options" />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
