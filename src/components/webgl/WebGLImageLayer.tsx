"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  getRegisteredPlanes,
  setWebGLNotify,
  type PlaneHandle,
} from "@/hooks/useWebGLImage";
import { canUseWebGLImages } from "@/lib/webgl-capability";
import { VERTEX_SHADER, FRAGMENT_SHADER } from "./shaders";

interface ManagedPlane {
  handle: PlaneHandle;
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  material: THREE.ShaderMaterial;
  texture: THREE.Texture | null;
  currentSrc: string;
  inView: boolean;
  ready: boolean;
  alpha: number;
  hover: number;
  targetHover: number;
  mouse: THREE.Vector2;
  targetMouse: THREE.Vector2;
  cleanupListeners: () => void;
}

function getCssRotationRad(el: HTMLElement): number {
  const st = window.getComputedStyle(el);
  const tr = st.transform;
  if (!tr || tr === "none") return 0;
  const match = tr.match(/matrix\(([^)]+)\)/);
  if (!match || !match[1]) return 0;
  const values = match[1].split(",").map((v) => parseFloat(v.trim()));
  if (values.length < 2) return 0;
  const a = values[0] ?? 1;
  const b = values[1] ?? 0;
  return Math.atan2(b, a);
}

export default function WebGLImageLayer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canUseWebGLImages()) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      -window.innerWidth / 2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      -window.innerHeight / 2,
      -1000,
      1000
    );
    camera.position.z = 10;

    const sharedGeometry = new THREE.PlaneGeometry(1, 1, 24, 24);
    const textureLoader = new THREE.TextureLoader();
    const textureCache = new Map<string, THREE.Texture>();
    const planes = new Map<string, ManagedPlane>();

    let contextLost = false;
    let rafId: number | null = null;
    let smoothedVelocity = 0;
    const startTime = performance.now();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          for (const item of planes.values()) {
            if (item.handle.el === entry.target) {
              item.inView = entry.isIntersecting;
            }
          }
        }
        scheduleLoop();
      },
      { rootMargin: "150px 0px" }
    );

    const loadPlaneTexture = (managed: ManagedPlane, src: string) => {
      managed.currentSrc = src;
      const cached = textureCache.get(src);
      if (cached && cached.image) {
        managed.texture = cached;
        managed.material.uniforms.uTexture.value = cached;
        const img = cached.image as { width?: number; height?: number };
        managed.material.uniforms.uTextureSize.value.set(
          img.width || 1200,
          img.height || 900
        );
        managed.ready = true;
        scheduleLoop();
        return;
      }

      textureLoader.load(
        src,
        (tex) => {
          if (contextLost) {
            tex.dispose();
            return;
          }
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.generateMipmaps = false;
          textureCache.set(src, tex);

          if (managed.currentSrc === src) {
            managed.texture = tex;
            managed.material.uniforms.uTexture.value = tex;
            const img = tex.image as { width?: number; height?: number };
            managed.material.uniforms.uTextureSize.value.set(
              img.width || 1200,
              img.height || 900
            );
            managed.ready = true;
            scheduleLoop();
          }
        },
        undefined,
        () => {
          managed.ready = false;
        }
      );
    };

    const getRenderOrder = (id: string) => {
      if (id === "cta-photo-2") return 1;
      if (id === "cta-photo-1") return 2;
      if (id === "cta-photo-3") return 3;
      return 0;
    };

    const syncRegistry = () => {
      if (contextLost) return;
      const currentHandles = getRegisteredPlanes();
      const activeIds = new Set(currentHandles.map((h) => h.id));

      for (const [id, managed] of planes.entries()) {
        if (!activeIds.has(id)) {
          io.unobserve(managed.handle.el);
          managed.cleanupListeners();
          scene.remove(managed.mesh);
          managed.material.dispose();
          planes.delete(id);
        }
      }

      for (const handle of currentHandles) {
        const existing = planes.get(handle.id);
        if (existing) {
          existing.handle = handle;
          if (existing.currentSrc !== handle.src) {
            loadPlaneTexture(existing, handle.src);
          }
          continue;
        }

        const isHero = handle.id === "hero-primary";
        const isCta = handle.id.startsWith("cta-photo-");
        const material = new THREE.ShaderMaterial({
          vertexShader: VERTEX_SHADER,
          fragmentShader: FRAGMENT_SHADER,
          transparent: true,
          depthTest: false,
          depthWrite: false,
          uniforms: {
            uTexture: { value: null },
            uPlaneSize: { value: new THREE.Vector2(1, 1) },
            uTextureSize: { value: new THREE.Vector2(1200, 900) },
            uMouse: { value: new THREE.Vector2(0.5, 0.5) },
            uHover: { value: 0 },
            uVelocity: { value: 0 },
            uTime: { value: 0 },
            uAlpha: { value: 0 },
            uRadius: { value: handle.radius },
            uAlignY: { value: isHero ? 0.35 : 0.5 },
            uZoom: { value: isHero ? 1.06 : 1.02 },
            uViewport: {
              value: new THREE.Vector2(
                window.innerWidth * dpr,
                window.innerHeight * dpr
              ),
            },
            uClipRect: { value: new THREE.Vector4(0, 0, 0, 0) },
            uHasClip: { value: 0 },
            uBorderWidth: { value: isCta ? 2.0 : 0.0 },
            uBorderColor: { value: new THREE.Color(1, 1, 1) },
          },
        });

        const mesh = new THREE.Mesh(sharedGeometry, material);
        mesh.renderOrder = getRenderOrder(handle.id);
        scene.add(mesh);

        const managed: ManagedPlane = {
          handle,
          mesh,
          material,
          texture: null,
          currentSrc: handle.src,
          inView: true,
          ready: false,
          alpha: 0,
          hover: 0,
          targetHover: 0,
          mouse: new THREE.Vector2(0.5, 0.5),
          targetMouse: new THREE.Vector2(0.5, 0.5),
          cleanupListeners: () => {},
        };

        const targetEl = handle.el.parentElement ?? handle.el;
        const onPointerMove = (e: PointerEvent) => {
          const r = handle.el.getBoundingClientRect();
          if (r.width <= 0 || r.height <= 0) return;
          const ux = (e.clientX - r.left) / r.width;
          const uy = 1.0 - (e.clientY - r.top) / r.height;
          if (ux >= 0 && ux <= 1 && uy >= 0 && uy <= 1) {
            managed.targetMouse.set(ux, uy);
            managed.targetHover = 1;
            scheduleLoop();
          }
        };
        const onPointerLeave = () => {
          managed.targetHover = 0;
          scheduleLoop();
        };

        targetEl.addEventListener("pointermove", onPointerMove, { passive: true });
        targetEl.addEventListener("pointerleave", onPointerLeave, { passive: true });
        managed.cleanupListeners = () => {
          targetEl.removeEventListener("pointermove", onPointerMove);
          targetEl.removeEventListener("pointerleave", onPointerLeave);
        };

        planes.set(handle.id, managed);
        io.observe(handle.el);
        loadPlaneTexture(managed, handle.src);
      }

      scheduleLoop();
    };

    const hasVisiblePlane = () => {
      if (contextLost || document.visibilityState !== "visible") return false;
      for (const p of planes.values()) {
        if (p.inView && p.ready) return true;
      }
      return false;
    };

    const renderFrame = (now: number) => {
      rafId = null;
      if (!hasVisiblePlane()) return;

      const rawVel = window.__lenis?.velocity ?? 0;
      smoothedVelocity += (rawVel - smoothedVelocity) * 0.14;
      if (Math.abs(smoothedVelocity) < 0.001) smoothedVelocity = 0;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const elapsed = (now - startTime) * 0.001;
      const isDark =
        document.documentElement.getAttribute("data-theme") === "dark";

      for (const managed of planes.values()) {
        const { handle, mesh, material } = managed;
        if (!managed.inView || !managed.ready || !managed.texture) {
          mesh.visible = false;
          continue;
        }

        const rect = handle.el.getBoundingClientRect();
        if (
          rect.width < 4 ||
          rect.height < 4 ||
          rect.bottom < -60 ||
          rect.top > vh + 60
        ) {
          mesh.visible = false;
          continue;
        }

        const st = window.getComputedStyle(handle.el);
        const domOpacity = parseFloat(st.opacity || "1");
        if (st.visibility === "hidden" || domOpacity <= 0.01) {
          mesh.visible = false;
          continue;
        }

        mesh.visible = true;

        managed.alpha = Math.min(1, managed.alpha + 0.045);
        managed.hover += (managed.targetHover - managed.hover) * 0.1;
        managed.mouse.lerp(managed.targetMouse, 0.14);

        const w = handle.el.offsetWidth || rect.width;
        const h = handle.el.offsetHeight || rect.height;
        const rotRad = getCssRotationRad(handle.el);

        const cx = rect.left + rect.width / 2 - vw / 2;
        const cy = vh / 2 - (rect.top + rect.height / 2);

        mesh.position.set(cx, cy, 0);
        mesh.scale.set(w, h, 1);
        mesh.rotation.z = -rotRad;

        const curDpr = renderer.getPixelRatio();
        material.uniforms.uPlaneSize.value.set(w, h);
        material.uniforms.uRadius.value = handle.radius;
        material.uniforms.uMouse.value.copy(managed.mouse);
        material.uniforms.uHover.value = managed.hover;
        material.uniforms.uVelocity.value = smoothedVelocity;
        material.uniforms.uTime.value = elapsed;
        material.uniforms.uAlpha.value = managed.alpha * domOpacity;
        material.uniforms.uViewport.value.set(vw * curDpr, vh * curDpr);
        material.uniforms.uBorderColor.value.setHex(isDark ? 0x141414 : 0xffffff);

        const clipAncestor = handle.el.closest<HTMLElement>("[data-webgl-clip]");
        if (clipAncestor) {
          const cr = clipAncestor.getBoundingClientRect();
          material.uniforms.uHasClip.value = 1;
          material.uniforms.uClipRect.value.set(
            cr.left * curDpr,
            cr.top * curDpr,
            cr.width * curDpr,
            cr.height * curDpr
          );
        } else {
          material.uniforms.uHasClip.value = 0;
        }
      }

      renderer.render(scene, camera);

      if (hasVisiblePlane()) {
        rafId = window.requestAnimationFrame(renderFrame);
      }
    };

    function scheduleLoop() {
      if (rafId === null && hasVisiblePlane()) {
        rafId = window.requestAnimationFrame(renderFrame);
      }
    }

    const onResize = () => {
      if (contextLost) return;
      const nw = window.innerWidth;
      const nh = window.innerHeight;
      const newDpr = Math.min(window.devicePixelRatio || 1, 1.5);
      renderer.setPixelRatio(newDpr);
      renderer.setSize(nw, nh, false);
      camera.left = -nw / 2;
      camera.right = nw / 2;
      camera.top = nh / 2;
      camera.bottom = -nh / 2;
      camera.updateProjectionMatrix();
      scheduleLoop();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        scheduleLoop();
      } else if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const onContextLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (canvas) {
        canvas.style.display = "none";
      }
    };

    setWebGLNotify(syncRegistry);
    syncRegistry();

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("scroll", scheduleLoop, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    canvas.addEventListener("webglcontextlost", onContextLost, false);

    return () => {
      setWebGLNotify(null);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", scheduleLoop);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      io.disconnect();

      for (const managed of planes.values()) {
        managed.cleanupListeners();
        scene.remove(managed.mesh);
        managed.material.dispose();
      }
      planes.clear();

      for (const tex of textureCache.values()) {
        tex.dispose();
      }
      textureCache.clear();
      sharedGeometry.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[2] h-full w-full"
    />
  );
}
