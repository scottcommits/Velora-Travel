"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { destinations } from "@/data/destinations";
import { formatUsd, BLUR_DATA_URL } from "@/lib/utils";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { useReveal } from "@/hooks/useReveal";
import { useWebGLImage } from "@/hooks/useWebGLImage";
import { Container } from "@/components/ui/Container";

export function DestinationsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const imageLayersRef = useRef<(HTMLDivElement | null)[]>([]);
  const metaRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const featured = destinations[activeIndex] ?? destinations[0];
  const destWebGLRef = useWebGLImage<HTMLDivElement>(
    "featured-destination",
    featured.image,
    24
  );

  useReveal(sectionRef);
  useGSAP(() => {}, { scope: sectionRef });

  const switchDestination = (nextIdx: number, explicitDir?: 1 | -1) => {
    const len = destinations.length;
    const normalized = (nextIdx + len) % len;
    if (normalized === activeIndex) return;

    const dir: 1 | -1 =
      explicitDir ??
      ((normalized - activeIndex + len) % len <= len / 2 ? 1 : -1);

    const prevIdx = activeIndex;
    setActiveIndex(normalized);

    if (
      typeof window !== "undefined" &&
      window.matchMedia(MOTION_OK).matches
    ) {
      const outgoingEl = imageLayersRef.current[prevIdx];
      const incomingEl = imageLayersRef.current[normalized];

      const tl = gsap.timeline({ defaults: { overwrite: "auto" } });

      if (outgoingEl && incomingEl) {
        gsap.set(outgoingEl, { zIndex: 1 });
        gsap.set(incomingEl, { zIndex: 2 });

        tl.fromTo(
          outgoingEl,
          { autoAlpha: 1, scale: 1, xPercent: 0 },
          {
            autoAlpha: 0,
            scale: dir > 0 ? 0.94 : 1.07,
            xPercent: -dir * 6,
            duration: 0.65,
            ease: "power3.inOut",
          },
          0
        ).fromTo(
          incomingEl,
          {
            autoAlpha: 0,
            scale: dir > 0 ? 1.1 : 0.93,
            xPercent: dir * 6,
          },
          {
            autoAlpha: 1,
            scale: 1,
            xPercent: 0,
            duration: 0.72,
            ease: "power3.out",
          },
          0
        );
      }

      if (tagsRef.current) {
        tl.fromTo(
          tagsRef.current,
          { autoAlpha: 0, y: -8 },
          { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" },
          0.08
        );
      }

      if (metaRef.current) {
        tl.fromTo(
          metaRef.current,
          { autoAlpha: 0, y: dir * 14 },
          { autoAlpha: 1, y: 0, duration: 0.52, ease: "power3.out" },
          0.06
        );
      }

      if (sectionRef.current) {
        const thumbs = sectionRef.current.querySelectorAll("[data-dest-thumb]");
        if (thumbs.length) {
          tl.fromTo(
            thumbs,
            { autoAlpha: 0.45, scale: 0.96 },
            {
              autoAlpha: 1,
              scale: 1,
              duration: 0.48,
              stagger: 0.04,
              ease: "power2.out",
            },
            0.04
          );
        }
      }
    }
  };

  const leftThumbs = [
    destinations[(activeIndex + 1) % destinations.length],
    destinations[(activeIndex + 2) % destinations.length],
  ];
  const rightThumbs = [
    destinations[(activeIndex + 3) % destinations.length],
    destinations[(activeIndex + 4) % destinations.length],
  ];

  return (
    <section
      id="destinations"
      ref={sectionRef}
      aria-labelledby="destinations-heading"
      className="py-8 md:py-12 lg:py-14"
    >
      <Container>
        {/* Desktop BENTO Layout: Left heading + 2 thumbs (23%) | Center featured card (54%) | Right 2 thumbs (23%) */}
        <div className="hidden lg:grid lg:grid-cols-[23%_1fr_23%] gap-3 items-stretch">
          {/* Left Column */}
          <div className="flex flex-col justify-between gap-4">
            <div className="pt-1">
              <p
                data-reveal
                className="text-[13px] font-medium text-ink-muted mb-1"
              >
                Popular destinations
              </p>
              <h2
                id="destinations-heading"
                data-reveal
                className="text-[clamp(1.75rem,3.2vw,2.75rem)] font-medium tracking-[-0.03em] leading-[1.06] text-ink"
              >
                Destinations You’ll Love
              </h2>
              <p
                data-reveal
                className="mt-2 text-sm text-ink-muted leading-snug"
              >
                Select any city below to preview stays, visa guidance, and seasonal fares.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3" data-reveal>
              {leftThumbs.map((item) => {
                const idx = destinations.findIndex((d) => d.id === item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-dest-thumb
                    onClick={() => switchDestination(idx, 1)}
                    className="group text-left cursor-pointer focus:outline-none"
                  >
                    <div className="relative aspect-[4/5] w-full rounded-[18px] overflow-hidden border border-line bg-surface">
                      <Image
                        src={item.image}
                        alt={`${item.name}, ${item.country}`}
                        fill
                        placeholder="blur"
                        blurDataURL={BLUR_DATA_URL}
                        sizes="180px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-xs px-0.5">
                      <span className="font-mono text-ink-muted">
                        0{idx + 1}
                      </span>
                      <span className="font-medium text-ink truncate ml-2 group-hover:underline">
                        {item.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center Featured Card (~54% width) */}
          <div className="relative" data-reveal>
            <div
              ref={featuredRef}
              className="relative aspect-[16/13] xl:aspect-[5/4] w-full rounded-[24px] flex flex-col justify-between p-5 md:p-7"
            >
              {/* Layered Background Images for smooth GSAP cross-fade + scale transitions */}
              <div
                ref={destWebGLRef}
                className="absolute inset-0 z-0 rounded-[24px] overflow-hidden border border-line bg-ink"
              >
                {destinations.map((dest, idx) => (
                  <div
                    key={dest.id}
                    ref={(el) => {
                      imageLayersRef.current[idx] = el;
                    }}
                    style={{
                      opacity: idx === activeIndex ? 1 : 0,
                      visibility: idx === activeIndex ? "visible" : "hidden",
                      zIndex: idx === activeIndex ? 2 : 1,
                    }}
                    className="absolute inset-0 will-change-transform"
                  >
                    <Image
                      src={dest.image}
                      alt={`${dest.name}, ${dest.country}`}
                      fill
                      loading="eager"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                      sizes="(min-width: 1024px) 54vw, 95vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* Scrim overlay (z-[3]) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-[3] rounded-[24px] bg-gradient-to-t from-black/80 via-black/15 to-black/40"
              />

              {/* Top bar: functional tags left + prev/next arrows & "View all destinations" top-right */}
              <div className="relative z-[5] flex flex-wrap items-center justify-between gap-2">
                <div ref={tagsRef} className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 text-xs font-medium text-white">
                    from {formatUsd(featured.priceFrom)}
                  </span>
                  <span className="rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 text-xs font-medium text-white">
                    {featured.visaQuickInfo}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => switchDestination(activeIndex - 1, -1)}
                    aria-label="Previous destination"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/45 backdrop-blur-md border border-white/25 text-white hover:bg-black/65 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    onClick={() => switchDestination(activeIndex + 1, 1)}
                    aria-label="Next destination"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#0A0A0A] hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                  <Link
                    href="/hotels"
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/25 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-black/65 transition-colors"
                  >
                    <span>View all destinations</span>
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                  </Link>
                </div>
              </div>

              {/* Bottom destination title & tagline */}
              <div ref={metaRef} className="relative z-[5] text-white space-y-1.5">
                <p className="font-mono text-xs text-white/80">
                  0{activeIndex + 1} / 0{destinations.length} · {featured.duration} ({featured.bestSeason})
                </p>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h3 className="text-3xl md:text-4xl font-medium tracking-[-0.03em]">
                      {featured.name}, {featured.country}
                    </h3>
                    <p className="mt-1 text-sm text-white/85 max-w-md">
                      {featured.tagline}
                    </p>
                  </div>
                  <Link
                    href={`/hotels?city=${encodeURIComponent(featured.name)}`}
                    aria-label={`Explore stays in ${featured.name}`}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#0A0A0A] transition-transform hover:scale-105"
                  >
                    <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: aligned 2 thumbnails at bottom (no empty white card) */}
          <div className="flex flex-col justify-end">
            <div className="grid grid-cols-2 gap-3" data-reveal>
              {rightThumbs.map((item) => {
                const idx = destinations.findIndex((d) => d.id === item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-dest-thumb
                    onClick={() => switchDestination(idx, 1)}
                    className="group text-left cursor-pointer focus:outline-none"
                  >
                    <div className="relative aspect-[4/5] w-full rounded-[18px] overflow-hidden border border-line bg-surface">
                      <Image
                        src={item.image}
                        alt={`${item.name}, ${item.country}`}
                        fill
                        placeholder="blur"
                        blurDataURL={BLUR_DATA_URL}
                        sizes="180px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-xs px-0.5">
                      <span className="font-mono text-ink-muted">
                        0{idx + 1}
                      </span>
                      <span className="font-medium text-ink truncate ml-2 group-hover:underline">
                        {item.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Scroll-Snap Slider */}
        <div className="lg:hidden space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[13px] font-medium text-ink-muted mb-1">
                Popular destinations
              </p>
              <h2 className="text-[clamp(1.75rem,3.2vw,2.75rem)] font-medium tracking-[-0.03em] leading-[1.06] text-ink">
                Destinations You’ll Love
              </h2>
            </div>
            <Link
              href="/hotels"
              className="inline-flex min-h-11 items-center text-xs font-medium text-ink underline underline-offset-4 shrink-0"
            >
              View all destinations
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 no-scrollbar">
            {destinations.map((dest) => (
              <Link
                key={dest.id}
                href={`/hotels?city=${encodeURIComponent(dest.name)}`}
                className="group snap-start shrink-0 w-[78vw] sm:w-[44vw] block"
              >
                <div className="relative aspect-[4/5] w-full rounded-[24px] overflow-hidden border border-line bg-ink p-5 flex flex-col justify-between">
                  <Image
                    src={dest.image}
                    alt={`${dest.name}, ${dest.country}`}
                    fill
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    sizes="(min-width: 640px) 44vw, 78vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/25"
                  />
                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 text-xs font-medium text-white">
                      from {formatUsd(dest.priceFrom)}
                    </span>
                    <span className="rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 text-xs font-medium text-white">
                      {dest.visaQuickInfo}
                    </span>
                  </div>
                  <div className="relative z-10 text-white">
                    <h3 className="text-xl font-medium">
                      {dest.name}, {dest.country}
                    </h3>
                    <p className="mt-1 text-xs text-white/80 line-clamp-2">
                      {dest.tagline}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
