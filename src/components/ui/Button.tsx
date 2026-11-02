import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight whitespace-nowrap transition-colors duration-200 cursor-pointer select-none active:translate-y-px disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent";

const variantStyles: Record<Variant, string> = {
  primary: "bg-ink text-bg hover:opacity-88",
  secondary: "bg-surface text-ink border border-line hover:border-ink",
  ghost:
    "bg-transparent text-ink hover:underline underline-offset-4 px-2",
};

const sizeStyles: Record<Size, string> = {
  sm: "min-h-9 px-4 py-1.5 text-xs",
  md: "min-h-11 px-5 py-2 text-sm",
  lg: "min-h-12 px-5 py-2.5 text-sm",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  withArrow?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  withArrow = false,
  className,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        withArrow && "pl-5 pr-2",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      {withArrow ? (
        <span
          aria-hidden="true"
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-full shrink-0",
            variant === "primary"
              ? "bg-bg text-ink"
              : "bg-ink text-bg"
          )}
        >
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </span>
      ) : null}
    </button>
  );
}

export type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: Variant;
  size?: Size;
  withArrow?: boolean;
};

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  withArrow = false,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        withArrow && "pl-5 pr-2",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      {withArrow ? (
        <span
          aria-hidden="true"
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-full shrink-0",
            variant === "primary"
              ? "bg-bg text-ink"
              : "bg-ink text-bg"
          )}
        >
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </span>
      ) : null}
    </Link>
  );
}
