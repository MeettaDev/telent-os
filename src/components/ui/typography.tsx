import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ElementType } from "react";

import { cn } from "@/lib/utils";

const textVariants = cva("leading-relaxed", {
  variants: {
    variant: {
      "page-title":
        "text-3xl font-bold leading-tight tracking-tight text-foreground",
      "section-title":
        "text-lg font-semibold leading-relaxed tracking-tight text-foreground",
      "card-title": "text-base font-semibold leading-relaxed text-foreground",
      body: "text-base leading-relaxed text-foreground",
      description: "text-sm leading-relaxed text-muted-foreground",
      caption: "text-sm leading-relaxed text-muted-foreground",
      error: "text-sm leading-relaxed text-destructive",
    },
  },
  defaultVariants: { variant: "body" },
});

type TextProps<T extends ElementType> = {
  as?: T;
} & VariantProps<typeof textVariants> &
  Omit<ComponentPropsWithoutRef<T>, "as">;

function Text<T extends ElementType = "p">({
  as,
  className,
  variant,
  ...props
}: TextProps<T>) {
  const Component = as ?? "p";
  return (
    <Component
      className={cn(textVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Text, textVariants };
