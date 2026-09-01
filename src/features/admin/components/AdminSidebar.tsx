"use client";

import {
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
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
import { UserProfileMenu } from "@/common/components/UserProfileMenu";
import { useAppShellStore } from "@/common/stores/app-shell-store";
import { Text } from "@/components/ui/typography";
import { useLocale } from "@/providers/locale-provider";

const mainItems = [
  { key: "myWork", href: "/admin", icon: ClipboardList },
  { key: "students", href: "/admin/students", icon: UsersRound },
  { key: "consultations", href: "/admin/consultations", icon: Video },
  { key: "messages", href: "/admin/messages", icon: MessageSquareText },
  { key: "escalations", href: "/admin/escalations", icon: ShieldAlert },
] as const;

const operationItems = [
  { key: "referenceRules", href: "/admin/reference-rules", icon: BookOpenText },
  { key: "activityLog", href: "/admin/activity-log", icon: History },
  { key: "admissions", href: "/admin/admissions", icon: GraduationCap },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const user = useMockUser();
  const { dictionary } = useLocale();
  const {
    isSidebarCollapsed: collapsed,
    isMobileSidebarOpen,
    toggleSidebar,
    closeMobileSidebar,
  } = useAppShellStore();
  const renderItem = ({
    key,
    href,
    icon: Icon,
  }: (typeof mainItems)[number] | (typeof operationItems)[number]) => {
    const active =
      pathname === href ||
      (href !== "/admin" && pathname.startsWith(`${href}/`));
    return (
      <Link
        aria-current={active ? "page" : undefined}
        className={`relative flex w-full cursor-pointer items-center rounded-xl py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${collapsed ? "lg:justify-center lg:px-0" : "gap-3 px-3"} ${active ? "bg-primary-tint font-semibold text-primary-hover before:absolute before:left-0 before:h-8 before:w-1 before:rounded-full before:bg-primary" : "text-[#525b54] hover:bg-muted dark:text-muted-foreground"}`}
        href={href}
        key={key}
        onClick={closeMobileSidebar}
      >
        <Icon
          className={`size-[18px] shrink-0 ${collapsed ? "lg:block" : "lg:hidden"}`}
        />
        <span className={collapsed ? "lg:hidden" : "block"}>
          {dictionary.sidebar[key]}
        </span>
      </Link>
    );
  };

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
        className={`fixed inset-y-0 left-0 z-40 flex w-[15.5rem] bg-card shadow-xl transition-[width,transform] duration-200 lg:sticky lg:top-0 lg:z-10 lg:h-dvh lg:shrink-0 lg:translate-x-0 lg:border-r lg:border-border lg:shadow-none ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} ${collapsed ? "lg:w-[5.25rem]" : "lg:w-[15.5rem]"}`}
      >
        <div className="flex min-w-0 flex-1 flex-col p-4">
          <div
            className={`flex h-12 items-center ${collapsed ? "lg:justify-center" : "justify-between"}`}
          >
            <div className={collapsed ? "lg:hidden" : "block"}>
              <p className="text-[28px] font-bold leading-none tracking-[-0.05em] text-primary">
                {dictionary.appName}
              </p>
              <Text variant="caption" className="mt-1 font-semibold uppercase">
                {dictionary.appTagline}
              </Text>
            </div>
            <button
              className="flex size-9 items-center justify-center rounded-xl hover:bg-muted lg:hidden"
              onClick={closeMobileSidebar}
              type="button"
            >
              <X className="size-4" />
            </button>
            <button
              className="hidden size-9 cursor-pointer items-center justify-center rounded-xl border border-border hover:bg-muted lg:flex"
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
              {dictionary.admin.workspace}
            </Text>
            <Text className="mt-2 font-semibold">{dictionary.admin.scope}</Text>
          </div>
          <nav className="mt-5 space-y-1">{mainItems.map(renderItem)}</nav>
          <Text
            variant="caption"
            className={`mb-2 mt-6 px-1 font-semibold uppercase ${collapsed ? "lg:hidden" : "block"}`}
          >
            {dictionary.sidebar.operations}
          </Text>
          <nav className="space-y-1">{operationItems.map(renderItem)}</nav>
          <div className="mt-auto border-t border-border pt-4">
            <div
              className={`flex items-center ${collapsed ? "lg:justify-center" : "gap-3"}`}
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-primary-tint text-xs font-bold text-primary-hover">
                {user.initials}
              </span>
              <div
                className={`min-w-0 flex-1 ${collapsed ? "lg:hidden" : "block"}`}
              >
                <Text className="font-semibold">{user.username}</Text>
                <Text variant="caption">{dictionary.sidebar.adminRole}</Text>
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
