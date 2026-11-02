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
      className={cn(
        "mx-auto w-full max-w-[2400px] px-[clamp(12px,1.4vw,24px)]",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
