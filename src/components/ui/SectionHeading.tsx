import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  invert?: boolean;
  id?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  id,
  action,
  className,
}: SectionHeadingProps) {
  const isCenter = align === "center";
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        isCenter
          ? "items-center text-center mx-auto max-w-2xl"
          : "md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className={cn("max-w-2xl", isCenter && "mx-auto")}>
        {eyebrow ? (
          <p
            data-reveal
            className="text-[13px] font-medium text-ink-muted mb-1.5"
          >
            {eyebrow}
          </p>
        ) : null}
        <h2
          id={id}
          data-reveal
          className="text-[clamp(1.75rem,3.2vw,2.75rem)] font-medium tracking-[-0.03em] leading-[1.06] text-ink"
        >
          {title}
        </h2>
        {subtitle ? (
          <p
            data-reveal
            className="mt-2.5 text-base text-ink-muted leading-[1.6] max-w-[58ch]"
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? (
        <div data-reveal className="shrink-0 mt-1 md:mt-0">
          {action}
        </div>
      ) : null}
    </div>
  );
}
