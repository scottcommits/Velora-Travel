"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Menu, X } from "lucide-react";
import { primaryNav } from "@/data/nav";
import { useScrolled } from "@/hooks/useScrolled";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ThemeToggle } from "./ThemeToggle";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";

export function Navbar() {
  const pathname = usePathname();
  const scrolled = useScrolled(12);
  const [open, setOpen] = useState(false);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleBtnRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useGSAP(
    () => {
      if (!open) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          "[data-mobile-link]",
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.04, ease: "power3.out" }
        );
      });
    },
    { scope: menuRef, dependencies: [open] }
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-colors duration-200",
        scrolled
          ? "bg-bg/85 backdrop-blur-md border-b border-line"
          : "bg-bg border-b border-transparent"
      )}
    >
      <Container>
        <nav
          aria-label="Primary"
          className="flex h-16 items-center justify-between gap-4"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-lg font-semibold tracking-[-0.03em] text-ink"
          >
            <Compass className="h-5 w-5 text-ink" strokeWidth={1.75} aria-hidden="true" />
            <span>Velora</span>
          </Link>

          <ul className="hidden lg:flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-1">
            {primaryNav.map((item) => {
              const isHash = item.href.startsWith("/#");
              const isActive = !isHash && pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "inline-flex h-9 items-center rounded-full px-3.5 text-[13px] font-medium transition-colors",
                      isActive
                        ? "bg-ink text-bg"
                        : "text-ink-muted hover:text-ink"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="hidden sm:block">
              <ButtonLink
                href="/#contact"
                variant="primary"
                size="md"
                withArrow
              >
                Plan a trip
              </ButtonLink>
            </div>
            <button
              ref={toggleBtnRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav-drawer"
              aria-label={open ? "Close navigation menu" : "Open navigation menu"}
              className="inline-flex lg:hidden h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-xs font-medium text-ink cursor-pointer"
            >
              {open ? (
                <>
                  <X className="h-4 w-4" strokeWidth={1.6} />
                  <span>Close</span>
                </>
              ) : (
                <>
                  <Menu className="h-4 w-4" strokeWidth={1.6} />
                  <span>Menu</span>
                </>
              )}
            </button>
          </div>
        </nav>
      </Container>

      {open ? (
        <div
          id="mobile-nav-drawer"
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className="fixed inset-x-0 top-16 bottom-0 z-50 bg-bg border-t border-line lg:hidden overflow-y-auto shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
        >
          <Container className="py-8 flex flex-col justify-between min-h-full">
            <ul className="flex flex-col divide-y divide-line">
              {primaryNav.map((item) => {
                const isActive =
                  !item.href.startsWith("/#") && pathname === item.href;
                return (
                  <li key={item.href} data-mobile-link>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block py-4 text-xl font-medium tracking-[-0.02em] transition-colors",
                        isActive ? "text-accent" : "text-ink hover:text-ink-muted"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div data-mobile-link className="pt-6 border-t border-line">
              <ButtonLink
                href="/#contact"
                onClick={() => setOpen(false)}
                variant="primary"
                size="lg"
                withArrow
                className="w-full"
              >
                Plan a trip
              </ButtonLink>
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
