"use client";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/providers/locale-provider";
import type { Actor, DocumentStatus } from "@/features/students/types/student";
import { cn } from "@/lib/utils";

export function ActorBadge({ actor }: { actor: Actor }) {
  const { dictionary } = useLocale();
  const t = dictionary.studentWorkspace;
  return (
    <Badge
      variant={
        actor === "meetta"
          ? "tint"
          : actor === "student"
            ? "warning"
            : actor === "noOne"
              ? "destructive"
              : "secondary"
      }
    >
      {t[actor]}
    </Badge>
  );
}
export function DocumentBadge({ status }: { status: DocumentStatus }) {
  const { dictionary } = useLocale();
  return (
    <Badge
      variant={
        status === "approved"
          ? "success"
          : status === "toSend"
            ? "warning"
            : status === "longTerm"
              ? "purple"
              : status === "fix"
                ? "destructive"
                : "tint"
      }
    >
      {dictionary.studentWorkspace.statuses[status]}
    </Badge>
  );
}
export function OwnerAvatar({ owner }: { owner: "H" | "N" | null }) {
  if (!owner) return <span className="text-muted-foreground">—</span>;
  return (
    <span
      aria-label={owner === "H" ? "Hsu Wai" : "Nway Nway"}
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white",
        owner === "H" ? "bg-primary" : "bg-violet-600",
      )}
    >
      {owner}
    </span>
  );
}
