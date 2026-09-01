"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

import { takeSuccessFlashToast } from "@/common/toasts/flash-toast";

export function FlashToastListener() {
  const pathname = usePathname();

  useEffect(() => {
    const message = takeSuccessFlashToast();
    if (message) toast.success(message);
  }, [pathname]);

  return null;
}
