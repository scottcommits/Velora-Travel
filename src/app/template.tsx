"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";

export default function Template({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        if (!ref.current) return;
        gsap.fromTo(
          ref.current,
          { autoAlpha: 0, y: 16 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.45,
            ease: "power2.out",
            clearProps: "transform",
          }
        );
      });
    },
    { scope: ref }
  );

  return <div ref={ref}>{children}</div>;
}
