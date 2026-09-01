import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15 aria-invalid:border-destructive aria-invalid:ring-destructive/15",
        className,
      )}
      {...props}
    />
  );
}
