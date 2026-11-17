"use client";
import { AppSidebar } from "@/common/components/AppSidebar";

export function StudentWorkspace({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-background">
      <AppSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
