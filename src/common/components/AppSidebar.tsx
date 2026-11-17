"use client";

import { useEffect, useRef } from "react";
import {
  CalendarDays,
  Landmark,
  MessageCircle,
  Settings,
  UsersRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { UserProfileMenu } from "@/common/components/UserProfileMenu";
import { useAppShellStore } from "@/common/stores/app-shell-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";
import { waitingCount } from "@/features/inbox/mocks/inbox-data";
import { useStudentsStore } from "@/features/students/stores/students-store";

const items = [
  { key: "today", href: "/", icon: CalendarDays, count: 7 },
  { key: "students", href: "/students", icon: UsersRound, count: 24 },
  { key: "inbox", href: "/inbox", icon: MessageCircle, count: undefined },
  {
    key: "universities",
    href: "/universities",
    icon: Landmark,
    count: undefined,
  },
] as const;

function SidebarContent({ mobile = false }: { mobile?: boolean }) {
  const { dictionary, locale } = useLocale();
  const pathname = usePathname();
  const waiting = useStudentsStore((state) => waitingCount(state.messages));
  const closeMobileSidebar = useAppShellStore(
    (state) => state.closeMobileSidebar,
  );

  return (
    <div className="flex h-full min-h-0 flex-col p-4">
      <div className="flex min-h-12 items-center justify-between px-2">
        <Link
          href="/"
          onClick={closeMobileSidebar}
          aria-label={dictionary.sidebar.today}
          className="flex items-baseline gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="text-2xl font-bold tracking-tight text-primary-hover">
            {dictionary.appName}
          </span>
          <span className="text-base font-semibold text-muted-foreground">
            OS
          </span>
        </Link>
        {mobile && (
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={dictionary.sidebar.close}
            >
              <X aria-hidden="true" />
            </Button>
          </SheetClose>
        )}
      </div>
      <nav
        aria-label={dictionary.sidebar.workspace}
        className="mt-6 flex-1 space-y-1 overflow-y-auto"
      >
        {items.map(({ key, href, icon: Icon, count }) => {
          const badgeCount = key === "inbox" ? waiting || undefined : count;
          const active =
            pathname === href ||
            (href !== "/" && pathname.startsWith(`${href}/`)) ||
            (key === "inbox" && pathname === "/messages");
          return (
            <Link
              key={key}
              href={href}
              onClick={closeMobileSidebar}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "bg-primary-tint font-semibold text-primary-hover"
                  : "text-foreground/80 hover:bg-muted",
              )}
            >
              <Icon
                aria-hidden="true"
                className={cn(
                  "size-5 shrink-0",
                  !active && "text-muted-foreground",
                )}
                strokeWidth={1.8}
              />
              <span className={locale === "my" ? "text-sm" : undefined}>
                {dictionary.sidebar[key]}
              </span>
              {badgeCount !== undefined && (
                <Badge
                  variant={key === "inbox" ? "default" : "secondary"}
                  className="ml-auto min-w-6 rounded-full px-2 py-0 text-sm"
                >
                  {badgeCount}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-3 pt-6">
        <Link
          href="/settings"
          onClick={closeMobileSidebar}
          aria-current={pathname === "/settings" ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            pathname === "/settings"
              ? "bg-primary-tint font-semibold text-primary-hover"
              : "text-foreground/80 hover:bg-muted",
          )}
        >
          <Settings
            aria-hidden="true"
            className="size-5 shrink-0 text-muted-foreground"
            strokeWidth={1.8}
          />
          {dictionary.sidebar.settings}
        </Link>
        <UserProfileMenu trigger="profile" align="start" />
      </div>
    </div>
  );
}

export function AppSidebar() {
  const { dictionary } = useLocale();
  const { isMobileSidebarOpen, closeMobileSidebar } = useAppShellStore();
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (useStudentsStore.getState().hydrated) return;
    if (useStudentsStore.persist) {
      void useStudentsStore.persist.rehydrate();
    } else {
      useStudentsStore.setState({ hydrated: true });
    }
  }, []);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    function closeOnDesktop() {
      if (desktop.matches) closeMobileSidebar();
    }
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, [closeMobileSidebar]);

  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 border-r bg-card lg:block">
        <SidebarContent />
      </aside>
      <Sheet
        open={isMobileSidebarOpen}
        onOpenChange={(open) => {
          if (!open) closeMobileSidebar();
        }}
      >
        <SheetContent
          onOpenAutoFocus={() => {
            opener.current =
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            opener.current?.focus();
          }}
        >
          <SheetTitle className="sr-only">
            {dictionary.sidebar.workspace}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {dictionary.sidebar.navigationDescription}
          </SheetDescription>
          <SidebarContent mobile />
        </SheetContent>
      </Sheet>
    </>
  );
}
