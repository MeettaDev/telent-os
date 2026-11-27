import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Alert({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="alert"
      role="note"
      className={cn(
        "flex items-start gap-3 rounded-xl bg-destructive-tint p-4 text-destructive-foreground",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-sm font-medium leading-relaxed", className)}
      {...props}
    />
  );
}

export { Alert, AlertDescription };
