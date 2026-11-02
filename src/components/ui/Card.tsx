import { cn } from "@/lib/utils";
import type { ElementType, ComponentPropsWithoutRef } from "react";

type Padding = "none" | "sm" | "md" | "lg";

const paddingStyles: Record<Padding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
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
