"use client";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/common/components/AppSidebar";
import styles from "@/common/components/workspace.module.css";
import { cn } from "@/lib/utils";

export function StudentWorkspace({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const inset =
    pathname === "/inbox" ||
    pathname === "/students" ||
    pathname.startsWith("/students/") ||
    pathname === "/universities" ||
    pathname.startsWith("/universities/");
  return (
    <div
      className={cn(
        "flex min-h-dvh bg-background text-foreground",
        inset && styles.palette,
      )}
    >
      <AppSidebar inset={inset} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
