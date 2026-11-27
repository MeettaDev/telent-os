"use client";

import { useEffect, type ReactNode } from "react";
import { StudentWorkspace } from "@/features/students/components/StudentWorkspace";
import { useUniversitiesStore } from "@/features/universities/stores/universities-store";

export default function UniversitiesLayout({
  children,
}: {
  children: ReactNode;
}) {
  const load = useUniversitiesStore((state) => state.load);
  useEffect(() => {
    load();
  }, [load]);
  return <StudentWorkspace>{children}</StudentWorkspace>;
}
