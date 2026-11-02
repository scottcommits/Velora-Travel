"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
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
  const headerRef = useRef<HTMLElement>(null);
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

  const glassPill = cn(
    "pointer-events-auto rounded-full border transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300",
    scrolled
      ? "bg-surface/92 backdrop-blur-xl border-ink/15 shadow-[0_6px_24px_rgba(0,0,0,0.06)]"
      : "bg-surface/80 backdrop-blur-md border-line"
  );

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 w-full bg-transparent border-none pointer-events-none"
    >
      <Container>
        <nav
          aria-label="Primary"
          className="flex h-16 items-center justify-between gap-3"
        >
          {/* Left Logo Glass Pill */}
          <Link
            href="/"
            className={cn(
              glassPill,
              "inline-flex h-11 items-center gap-2.5 pl-3.5 pr-4 text-lg font-semibold tracking-[-0.03em] text-ink"
            )}
          >
            <Image
              src="/velora-logo.png"
              alt=""
              width={26}
              height={26}
              className="h-5 w-5 object-contain invert dark:invert-0"
            />
            <span>Velora</span>
          </Link>

          {/* Center Navigation Glass Pill */}
          <div
            className={cn(
              glassPill,
              "hidden lg:flex relative items-center px-1.5 py-1"
            )}
          >
            <ul className="flex items-center gap-0.5">
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
          </div>

          {/* Right Actions: Desktop has ThemeToggle + Plan a trip; Mobile has Plan a trip + Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle scrolled={scrolled} className="hidden lg:inline-flex" />
            <ButtonLink
              href="/#contact"
              variant="primary"
              size="sm"
              withArrow
              className="pointer-events-auto inline-flex min-h-10 sm:min-h-11 px-3 sm:px-4 py-1.5 text-xs sm:text-sm border-0 shadow-none"
            >
              Plan a trip
            </ButtonLink>
            <button
              ref={toggleBtnRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav-drawer"
              aria-label={open ? "Close navigation menu" : "Open navigation menu"}
              className={cn(
                glassPill,
                "inline-flex lg:hidden h-10 sm:h-11 items-center gap-1.5 sm:gap-2 px-3 sm:px-4 text-xs font-medium text-ink cursor-pointer"
              )}
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
          data-lenis-prevent
          className="pointer-events-auto fixed inset-0 z-[100] bg-bg lg:hidden flex flex-col justify-between overflow-y-auto"
        >
          {/* Drawer Top Header (Matches navbar height, perfectly aligned, zero top empty space) */}
          <div className="h-16 px-[clamp(12px,1.4vw,24px)] flex items-center justify-between border-b border-line bg-surface/80 backdrop-blur-md shrink-0">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="inline-flex h-11 items-center gap-2.5 pl-3.5 pr-4 rounded-full border border-line bg-surface text-lg font-semibold tracking-[-0.03em] text-ink"
            >
              <Image
                src="/velora-logo.png"
                alt=""
                width={26}
                height={26}
                className="h-5 w-5 object-contain invert dark:invert-0"
              />
              <span>Velora</span>
            </Link>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close navigation menu"
              className="inline-flex h-11 items-center gap-2 px-4 rounded-full border border-line bg-surface text-xs font-medium text-ink cursor-pointer hover:border-ink"
            >
              <X className="h-4 w-4" strokeWidth={1.8} />
              <span>Close</span>
            </button>
          </div>

          <div className="flex-1 px-[clamp(12px,1.4vw,24px)] py-6 flex flex-col justify-between overflow-y-auto">
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
                        "block py-3.5 text-xl font-medium tracking-[-0.02em] transition-colors",
                        isActive ? "text-accent" : "text-ink hover:text-ink-muted"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Bottom Actions: Dark Theme Toggle + Plan a trip Button */}
            <div data-mobile-link className="pt-6 mt-6 border-t border-line space-y-3 shrink-0">
              <div className="flex items-center justify-between p-3 rounded-[18px] border border-line bg-surface">
                <span className="text-sm font-medium text-ink">Appearance</span>
                <ThemeToggle showLabel className="border-line bg-bg hover:border-ink/40 shadow-xs" />
              </div>

              <ButtonLink
                href="/#contact"
                onClick={() => setOpen(false)}
                variant="primary"
                size="lg"
                withArrow
                className="w-full justify-between"
              >
                Plan a trip
              </ButtonLink>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
