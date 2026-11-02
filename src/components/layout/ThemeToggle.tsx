"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

function subscribeTheme(callback: () => void) {
  if (typeof document === "undefined") return () => {};
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getThemeSnapshot(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function getServerSnapshot(): "light" | "dark" {
  return "light";
}

import { cn } from "@/lib/utils";

export function ThemeToggle({
  scrolled = false,
  className,
  showLabel = false,
}: {
  scrolled?: boolean;
  className?: string;
  showLabel?: boolean;
}) {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerSnapshot);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("velora-theme", next);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className={cn(
        "pointer-events-auto inline-flex items-center justify-center rounded-full border transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 text-ink hover:border-ink cursor-pointer",
        !showLabel ? "h-11 w-11" : "h-10 px-3.5 gap-2 text-xs font-medium",
        scrolled
          ? "bg-surface/92 backdrop-blur-xl border-ink/15 shadow-[0_6px_24px_rgba(0,0,0,0.06)]"
          : "bg-surface/80 backdrop-blur-md border-line",
        className
      )}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-ink shrink-0" strokeWidth={1.5} aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4 text-ink shrink-0" strokeWidth={1.5} aria-hidden="true" />
      )}
      {showLabel ? (
        <span>{theme === "dark" ? "Light theme" : "Dark theme"}</span>
      ) : null}
    </button>
  );
}
