"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger } from "@/lib/gsap";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    window.__lenis = lenis;

    const onAnchorClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      let hash = "";
      if (href.startsWith("#")) {
        hash = href;
      } else if (href.startsWith("/#") && window.location.pathname === "/") {
        hash = href.slice(1);
      }

      if (hash && hash.length > 1) {
        const el = document.querySelector<HTMLElement>(hash);
        if (el) {
          e.preventDefault();
          lenis.scrollTo(el, { offset: -72 });
          window.history.pushState(null, "", href);
        }
      }
    };

    document.addEventListener("click", onAnchorClick);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      gsap.ticker.remove(tick);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
      delete window.__lenis;
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, []);

  return <>{children}</>;
}
