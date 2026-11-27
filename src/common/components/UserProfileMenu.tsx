"use client";

import { useState } from "react";
import { Languages, LogOut, Moon, MoreHorizontal, Sun } from "lucide-react";
import { useRouter } from "next/navigation";

import { clearActiveMockUser, useMockUser } from "@/common/auth/mock-auth";
import { ConfirmDialog } from "@/common/components/ConfirmDialog";
import { setSuccessFlashToast } from "@/common/toasts/flash-toast";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Text } from "@/components/ui/typography";
import { useLocale } from "@/providers/locale-provider";
import { useTheme } from "@/providers/theme-provider";

type UserProfileMenuProps = {
  align?: "start" | "center" | "end";
  trigger?: "avatar" | "options" | "profile";
};

export function UserProfileMenu({
  align = "end",
  trigger = "avatar",
}: UserProfileMenuProps) {
  const router = useRouter();
  const user = useMockUser();
  const { dictionary, locale, setLocale } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    await new Promise((resolve) => window.setTimeout(resolve, 700));
    clearActiveMockUser();
    setSuccessFlashToast(dictionary.auth.logoutSuccess);
    router.replace("/login");
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {trigger === "profile" ? (
            <button
              aria-label={dictionary.sidebar.profileMenu}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl bg-muted/50 p-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              type="button"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground">
                {user.initials}
              </span>
              <span className="min-w-0">
                <span className="block break-words text-sm font-semibold">
                  {user.username}
                </span>
                <span className="block text-xs leading-relaxed text-muted-foreground">
                  {dictionary.sidebar.yangon} ·{" "}
                  {locale === "en" ? "English" : "မြန်မာ"}
                </span>
              </span>
            </button>
          ) : trigger === "avatar" ? (
            <button
              aria-label={dictionary.sidebar.profileMenu}
              className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-primary-tint transition-colors hover:bg-primary-tint/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              type="button"
            >
              <span className="flex size-9 items-center justify-center rounded-full text-xs font-bold text-primary-hover">
                {user.initials}
              </span>
            </button>
          ) : (
            <button
              aria-label={dictionary.sidebar.profileMenu}
              className="cursor-pointer rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              type="button"
            >
              <MoreHorizontal className="size-4" />
            </button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align} className="w-64">
          <DropdownMenuLabel>
            <Text className="font-semibold">{user.username}</Text>
            <Text variant="caption">
              {user.role === "admin"
                ? dictionary.sidebar.adminRole
                : dictionary.sidebar.counselorRole}
            </Text>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="flex items-center gap-2 pb-1 text-xs font-semibold uppercase text-muted-foreground">
            <Languages className="size-3.5" />
            {dictionary.sidebar.language}
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuCheckboxItem
              checked={locale === "en"}
              onSelect={() => setLocale("en")}
            >
              English
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={locale === "my"}
              onSelect={() => setLocale("my")}
            >
              မြန်မာ
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={toggleTheme}>
            {theme === "light" ? <Moon /> : <Sun />}
            {theme === "light"
              ? dictionary.dashboard.switchToDark
              : dictionary.dashboard.switchToLight}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setIsLogoutOpen(true)}
            variant="destructive"
          >
            <LogOut />
            {dictionary.sidebar.logout}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        cancelLabel={dictionary.auth.cancel}
        confirmLabel={dictionary.auth.confirmLogout}
        description={dictionary.auth.logoutDescription}
        isPending={isLoggingOut}
        onConfirm={handleLogout}
        onOpenChange={setIsLogoutOpen}
        open={isLogoutOpen}
        pendingLabel={dictionary.auth.loggingOut}
        title={dictionary.auth.logoutTitle}
      />
    </>
  );
}
