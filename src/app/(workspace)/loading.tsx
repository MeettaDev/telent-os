"use client";

import { usePathname } from "next/navigation";

import { WorkspaceLoading } from "@/common/components/PageSkeleton";

export default function Loading() {
  const pathname = usePathname();

  return <WorkspaceLoading kind={pathname === "/" ? "dashboard" : "list"} />;
}
