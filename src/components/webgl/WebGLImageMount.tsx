"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { canUseWebGLImages } from "@/lib/webgl-capability";

const WebGLImageLayer = dynamic(() => import("./WebGLImageLayer"), {
  ssr: false,
});

export function WebGLImageMount() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let idleHandle: number | null = null;
    let timeoutHandle: number | null = null;

    const evaluateAndMount = () => {
      if (cancelled) return;
      if (!canUseWebGLImages()) {
        setEnabled(false);
        return;
      }

      const scheduleIdle = () => {
        if (cancelled) return;
        const ric = (
          window as Window & {
            requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
          }
        ).requestIdleCallback;

        if (typeof ric === "function") {
          idleHandle = ric(() => {
            if (!cancelled && canUseWebGLImages()) setEnabled(true);
          }, { timeout: 1500 });
        } else {
          timeoutHandle = window.setTimeout(() => {
            if (!cancelled && canUseWebGLImages()) setEnabled(true);
          }, 600);
        }
      };

      if (document.readyState === "complete") {
        scheduleIdle();
      } else {
        window.addEventListener("load", scheduleIdle, { once: true });
      }
    };

    evaluateAndMount();

    const mqDesktop = window.matchMedia("(min-width: 1024px)");
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMediaChange = () => {
      if (!canUseWebGLImages()) {
        setEnabled(false);
      } else {
        evaluateAndMount();
      }
    };

    mqDesktop.addEventListener("change", onMediaChange);
    mqMotion.addEventListener("change", onMediaChange);

    return () => {
      cancelled = true;
      mqDesktop.removeEventListener("change", onMediaChange);
      mqMotion.removeEventListener("change", onMediaChange);
      if (idleHandle !== null && "cancelIdleCallback" in window) {
        (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(
          idleHandle
        );
      }
      if (timeoutHandle !== null) {
        window.clearTimeout(timeoutHandle);
      }
    };
  }, []);

  if (!enabled) return null;
  return <WebGLImageLayer />;
}
