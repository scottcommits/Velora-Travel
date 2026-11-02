"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { destinations } from "@/data/destinations";
import { formatUsd, BLUR_DATA_URL, cn } from "@/lib/utils";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { useReveal } from "@/hooks/useReveal";
import { Container } from "@/components/ui/Container";

export function DestinationsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useReveal(sectionRef);
  useGSAP(() => {}, { scope: sectionRef });

  const switchDestination = (nextIdx: number) => {
    const normalized = (nextIdx + destinations.length) % destinations.length;
    setActiveIndex(normalized);
    if (
      typeof window !== "undefined" &&
      window.matchMedia(MOTION_OK).matches &&
      featuredRef.current
    ) {
      gsap.fromTo(
        featuredRef.current,
        { autoAlpha: 0.2, scale: 0.985 },
        { autoAlpha: 1, scale: 1, duration: 0.45, ease: "power2.out" }
      );
    }
  };

  const featured = destinations[activeIndex] ?? destinations[0];
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
      className="py-12 md:py-16 lg:py-20"
    >
      <Container>
        {/* Desktop BENTO Layout: Left heading + 2 thumbs | Center featured card | Right controls + 2 thumbs */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-stretch">
          {/* Left Column (3 cols) */}
          <div className="lg:col-span-3 flex flex-col justify-between gap-4">
            <div className="pt-2">
              <p
                data-reveal
                className="text-[13px] font-medium text-ink-muted mb-1.5"
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
                className="mt-2.5 text-sm text-ink-muted leading-relaxed"
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
                    onClick={() => switchDestination(idx)}
                    className="group text-left cursor-pointer focus:outline-none"
                  >
                    <div className="relative aspect-[4/5] w-full rounded-[18px] overflow-hidden border border-line bg-surface">
                      <Image
                        src={item.image}
                        alt={`${item.name}, ${item.country}`}
                        fill
                        loading="eager"
                        placeholder="blur"
                        blurDataURL={BLUR_DATA_URL}
                        sizes="160px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
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

          {/* Center Featured Card (6 cols) */}
          <div className="lg:col-span-6" data-reveal>
            <div
              ref={featuredRef}
              className="relative aspect-[5/6] w-full rounded-[24px] overflow-hidden border border-line bg-ink flex flex-col justify-between p-6 md:p-8"
            >
              <Image
                src={featured.image}
                alt={`${featured.name}, ${featured.country}`}
                fill
                loading="eager"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                sizes="(min-width: 1024px) 660px, 95vw"
                className="object-cover"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/30"
              />

              {/* Top functional tags (max 2 per image) */}
              <div className="relative z-10 flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 text-xs font-medium text-white">
                    from {formatUsd(featured.priceFrom)}
                  </span>
                  <span className="rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 text-xs font-medium text-white">
                    {featured.visaQuickInfo}
                  </span>
                </div>

                <Link
                  href={`/hotels?city=${encodeURIComponent(featured.name)}`}
                  aria-label={`Explore stays in ${featured.name}`}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0A0A0A] transition-transform hover:scale-105"
                >
                  <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
                </Link>
              </div>

              {/* Bottom destination title & tagline */}
              <div className="relative z-10 text-white space-y-2">
                <p className="font-mono text-xs text-white/80">
                  0{activeIndex + 1} / 0{destinations.length} · {featured.duration} ({featured.bestSeason})
                </p>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h3 className="text-3xl md:text-4xl font-medium tracking-[-0.03em]">
                      {featured.name}, {featured.country}
                    </h3>
                    <p className="mt-1.5 text-sm text-white/85 max-w-md">
                      {featured.tagline}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (3 cols) */}
          <div className="lg:col-span-3 flex flex-col justify-between gap-4">
            <div
              data-reveal
              className="flex flex-col items-center justify-center flex-1 rounded-[20px] border border-line bg-surface p-6 text-center space-y-4"
            >
              <p className="text-xs text-ink-muted">
                Browse all {destinations.length} curated destinations
              </p>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => switchDestination(activeIndex - 1)}
                  aria-label="Previous destination"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-ink text-bg hover:opacity-88 transition-opacity cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  onClick={() => switchDestination(activeIndex + 1)}
                  aria-label="Next destination"
                  className="inline-flex h-14 w-16 items-center justify-center rounded-full border border-line bg-bg text-ink hover:border-ink transition-colors cursor-pointer"
                >
                  <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
              <Link
                href="/hotels"
                className="text-xs font-medium text-ink underline underline-offset-4 hover:text-ink-muted"
              >
                View all hotels
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3" data-reveal>
              {rightThumbs.map((item) => {
                const idx = destinations.findIndex((d) => d.id === item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => switchDestination(idx)}
                    className="group text-left cursor-pointer focus:outline-none"
                  >
                    <div className="relative aspect-[4/5] w-full rounded-[18px] overflow-hidden border border-line bg-surface">
                      <Image
                        src={item.image}
                        alt={`${item.name}, ${item.country}`}
                        fill
                        loading="eager"
                        placeholder="blur"
                        blurDataURL={BLUR_DATA_URL}
                        sizes="160px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
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

        {/* Desktop quick-select pill bar for all 8 destinations */}
        <div
          data-reveal
          className="hidden lg:flex items-center justify-center gap-1.5 mt-4 flex-wrap"
        >
          {destinations.map((dest, idx) => {
            const isCurrent = idx === activeIndex;
            return (
              <button
                key={dest.id}
                type="button"
                onClick={() => switchDestination(idx)}
                aria-pressed={isCurrent}
                className={cn(
                  "h-[34px] rounded-full border px-3.5 text-[13px] font-medium transition-colors cursor-pointer",
                  isCurrent
                    ? "bg-ink text-bg border-ink"
                    : "bg-surface text-ink-muted border-line hover:text-ink"
                )}
              >
                {dest.name}
              </button>
            );
          })}
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
              className="text-xs font-medium text-ink underline underline-offset-4 shrink-0"
            >
              View all
            </Link>
          </div>

          <div className="flex gap-3.5 overflow-x-auto snap-x snap-mandatory pb-2 no-scrollbar -mx-4 px-4">
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
                    loading="eager"
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
