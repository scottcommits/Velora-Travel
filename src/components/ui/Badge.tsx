import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type BadgeTone = "neutral" | "accent" | "teal" | "ink";

const toneStyles: Record<BadgeTone, string> = {
  neutral: "bg-surface text-ink-muted border-line",
  accent: "bg-surface text-ink border-line",
  teal: "bg-surface text-ink border-line",
  ink: "bg-ink text-bg border-ink",
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export function Badge({ tone = "neutral", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneStyles[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
