"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK, HOVER_FINE } from "@/lib/gsap";
import { Button, ButtonLink, type ButtonProps, type ButtonLinkProps } from "./Button";

export function MagneticButton(props: ButtonProps) {
  const wrapRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${HOVER_FINE} and ${MOTION_OK}`, () => {
        const el = wrapRef.current;
        if (!el) return;
        const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" });

        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          xTo((e.clientX - (r.left + r.width / 2)) * 0.2);
          yTo((e.clientY - (r.top + r.height / 2)) * 0.2);
        };
        const leave = () => {
          xTo(0);
          yTo(0);
        };

        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        return () => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
        };
      });
    },
    { scope: wrapRef }
  );

  return (
    <span ref={wrapRef} className="inline-block">
      <Button {...props} />
    </span>
  );
}

export function MagneticButtonLink(props: ButtonLinkProps) {
  const wrapRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${HOVER_FINE} and ${MOTION_OK}`, () => {
        const el = wrapRef.current;
        if (!el) return;
        const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" });

        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          xTo((e.clientX - (r.left + r.width / 2)) * 0.2);
          yTo((e.clientY - (r.top + r.height / 2)) * 0.2);
        };
        const leave = () => {
          xTo(0);
          yTo(0);
        };

        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        return () => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
        };
      });
    },
    { scope: wrapRef }
  );

  return (
    <span ref={wrapRef} className="inline-block">
      <ButtonLink {...props} />
    </span>
  );
}
