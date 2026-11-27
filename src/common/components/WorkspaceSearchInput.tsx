import type { ComponentProps } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

export function WorkspaceSearchInput(
  props: Pick<
    ComponentProps<typeof Input>,
    "name" | "value" | "onChange" | "enterKeyHint"
  > & { placeholder: string },
) {
  return (
    <label className="relative block">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <span className="sr-only">{props.placeholder}</span>
      <Input
        type="search"
        className="h-11 rounded-full border-0 bg-card pl-10 text-sm"
        {...props}
      />
    </label>
  );
}
