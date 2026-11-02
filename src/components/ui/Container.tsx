import { cn } from "@/lib/utils";
import type { ElementType, ComponentPropsWithoutRef } from "react";

type ContainerProps<T extends ElementType = "div"> = {
  as?: T;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

export function Container<T extends ElementType = "div">({
  as,
  className,
  children,
  ...props
}: ContainerProps<T>) {
  const Component = as || "div";
  return (
    <Component
      className={cn("mx-auto w-full max-w-[1440px] px-4 md:px-6 lg:px-8", className)}
      {...props}
    >
      {children}
    </Component>
  );
}
