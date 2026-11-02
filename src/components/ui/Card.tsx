import { cn } from "@/lib/utils";
import type { ElementType, ComponentPropsWithoutRef } from "react";

type Padding = "none" | "inset" | "sm" | "md" | "lg";

const paddingStyles: Record<Padding, string> = {
  none: "p-0",
  inset: "p-2 md:p-2.5",
  sm: "p-3",
  md: "p-3 md:p-4",
  lg: "p-3.5 md:p-4",
};

export type CardProps<T extends ElementType = "article"> = {
  as?: T;
  interactive?: boolean;
  padding?: Padding;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

export function Card<T extends ElementType = "article">({
  as,
  interactive = false,
  padding = "md",
  className,
  children,
  ...props
}: CardProps<T>) {
  const Component = as || "article";
  return (
    <Component
      className={cn(
        "rounded-[20px] bg-surface border border-line overflow-hidden",
        interactive &&
          "group transition-colors duration-200 hover:border-ink/35 focus-within:border-accent",
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
