import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ElementType } from "react";

import { cn } from "@/lib/utils";

const textVariants = cva("leading-[1.5]", {
  variants: {
    variant: {
      "page-title":
        "text-[28px] font-semibold leading-[1.5] tracking-[-0.03em] text-foreground",
      "section-title":
        "text-xl font-semibold leading-[1.5] tracking-[-0.02em] text-foreground",
      "card-title": "text-base font-semibold leading-[1.5] text-foreground",
      body: "text-sm leading-[1.6] text-foreground",
      description: "text-sm leading-[1.6] text-muted-foreground",
      caption: "text-xs leading-[1.5] text-muted-foreground",
      error: "text-sm leading-[1.5] text-destructive",
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
