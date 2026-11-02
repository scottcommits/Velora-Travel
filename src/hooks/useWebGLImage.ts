"use client";

import { useEffect, useRef } from "react";

export type PlaneHandle = {
  el: HTMLElement;
  src: string;
  id: string;
  radius: number;
};

const registry = new Map<string, PlaneHandle>();
let notify: (() => void) | null = null;

export function setWebGLNotify(fn: (() => void) | null) {
  notify = fn;
}

export function useWebGLImage<T extends HTMLElement = HTMLDivElement>(
  id: string,
  src: string,
  radius = 24
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    registry.set(id, { el, src, id, radius });
    notify?.();
    return () => {
      registry.delete(id);
      notify?.();
    };
  }, [id, src, radius]);

  return ref;
}

export function getRegisteredPlanes(): PlaneHandle[] {
  return Array.from(registry.values());
}
