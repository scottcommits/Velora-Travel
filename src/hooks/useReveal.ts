"use client";

import type { RefObject } from "react";
import { gsap, useGSAP, ScrollTrigger, MOTION_OK } from "@/lib/gsap";

export function useReveal(scope: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        if (!scope.current) return;
        const els = gsap.utils.toArray<HTMLElement>("[data-reveal]", scope.current);
        if (!els.length) return;
        gsap.set(els, { autoAlpha: 0, y: 24 });
        ScrollTrigger.batch(els, {
          start: "top 90%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              stagger: 0.08,
              overwrite: true,
            }),
        });

        const onLoad = () => ScrollTrigger.refresh();
        if (document.readyState === "complete") {
          ScrollTrigger.refresh();
        } else {
          window.addEventListener("load", onLoad, { once: true });
        }
        return () => {
          window.removeEventListener("load", onLoad);
        };
      });
    },
    { scope, dependencies: deps }
  );
}
