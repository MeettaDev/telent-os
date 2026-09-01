"use client";

import { useEffect } from "react";

import { SystemStatePage } from "@/features/navigation/components/SystemStatePage";

type ErrorPageProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function ErrorPage({ error, retry }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <SystemStatePage kind="error" onRetry={retry} />;
}
