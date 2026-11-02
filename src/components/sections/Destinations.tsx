"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { destinations } from "@/data/destinations";
import { formatUsd, BLUR_DATA_URL, cn } from "@/lib/utils";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { useReveal } from "@/hooks/useReveal";
import { Container } from "@/components/ui/Container";

interface SlotBox {
  x: number;
  y: number;
  width: number;
  height: number;
  mediaHeight: number;
  radius: number;
  scale: number;
  opacity: number;
  zIndex: number;
}

function getCircularOffset(index: number, centerIndex: number, length: number): number {
  const raw = (index - centerIndex + length) % length;
  if (raw <= Math.floor(length / 2)) return raw;
  return raw - length;
}

function computeSlotGeometry(
  offset: number,
  trackWidth: number,
  trackHeight: number
): SlotBox {
  const gap = 12;
  const captionH = 26;
  const featuredW = Math.round(trackWidth * 0.535);
  const sideGroupW = Math.floor((trackWidth - featuredW - gap * 2) / 2);
  const thumbW = Math.max(96, Math.floor((sideGroupW - gap) / 2));
  const thumbMediaH = Math.min(
    trackHeight - captionH - 24,
    Math.round(thumbW * 1.5)
  );
  const thumbTotalH = thumbMediaH + captionH;
  const thumbY = Math.round((trackHeight - thumbTotalH) / 2);

  const leftOuterX = 0;
  const leftInnerX = thumbW + gap;
  const featuredX = sideGroupW + gap;
  const rightInnerX = featuredX + featuredW + gap;
  const rightOuterX = rightInnerX + thumbW + gap;

  if (offset === 0) {
    return {
      x: featuredX,
      y: 0,
      width: featuredW,
      height: trackHeight,
      mediaHeight: trackHeight,
      radius: 24,
      scale: 1,
      opacity: 1,
      zIndex: 10,
    };
  }

  if (offset === -2) {
    return {
      x: leftOuterX,
      y: thumbY,
      width: thumbW,
      height: thumbTotalH,
      mediaHeight: thumbMediaH,
      radius: 18,
      scale: 1,
      opacity: 1,
      zIndex: 5,
    };
  }

  if (offset === -1) {
    return {
      x: leftInnerX,
      y: thumbY,
      width: thumbW,
      height: thumbTotalH,
      mediaHeight: thumbMediaH,
      radius: 18,
      scale: 1,
      opacity: 1,
      zIndex: 6,
    };
  }

  if (offset === 1) {
    return {
      x: rightInnerX,
      y: thumbY,
      width: thumbW,
      height: thumbTotalH,
      mediaHeight: thumbMediaH,
      radius: 18,
      scale: 1,
      opacity: 1,
      zIndex: 6,
    };
  }

  if (offset === 2) {
    return {
      x: rightOuterX,
      y: thumbY,
      width: thumbW,
      height: thumbTotalH,
      mediaHeight: thumbMediaH,
      radius: 18,
      scale: 1,
      opacity: 1,
      zIndex: 5,
    };
  }

  if (offset < -2) {
    return {
      x: leftOuterX - (thumbW + gap) * Math.min(2, Math.abs(offset) - 2),
      y: thumbY,
      width: thumbW,
      height: thumbTotalH,
      mediaHeight: thumbMediaH,
      radius: 18,
      scale: 0.86,
      opacity: 0,
      zIndex: 1,
    };
  }

  return {
    x: rightOuterX + (thumbW + gap) * Math.min(2, offset - 2),
    y: thumbY,
    width: thumbW,
    height: thumbTotalH,
    mediaHeight: thumbMediaH,
    radius: 18,
    scale: 0.86,
    opacity: 0,
    zIndex: 1,
  };
}

export function DestinationsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const featuredUiRefs = useRef<(HTMLDivElement | null)[]>([]);
  const thumbUiRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeIndexRef = useRef(0);
  const isAnimatingRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState(0);

  useReveal(sectionRef);
  const { contextSafe } = useGSAP({ scope: sectionRef });

  const layoutCards = useCallback((centerIdx: number) => {
    const track = trackRef.current;
    if (!track) return;
    const W = track.clientWidth;
    const H = track.clientHeight;
    if (!W || !H) return;

    const len = destinations.length;
    destinations.forEach((_, i) => {
      const card = cardRefs.current[i];
      const media = mediaRefs.current[i];
      const featUi = featuredUiRefs.current[i];
      const thumbUi = thumbUiRefs.current[i];
      if (!card || !media) return;

      const offset = getCircularOffset(i, centerIdx, len);
      const box = computeSlotGeometry(offset, W, H);
      const isCenter = offset === 0;
      const isVisible = Math.abs(offset) <= 2;

      gsap.set(card, {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        scale: box.scale,
        autoAlpha: isVisible ? 1 : 0,
        zIndex: box.zIndex,
      });

      gsap.set(media, {
        height: box.mediaHeight,
        borderRadius: box.radius,
      });

      if (featUi) {
        gsap.set(featUi, {
          autoAlpha: isCenter ? 1 : 0,
          y: 0,
          pointerEvents: isCenter ? "auto" : "none",
        });
      }

      if (thumbUi) {
        gsap.set(thumbUi, {
          autoAlpha: !isCenter && isVisible ? 1 : 0,
        });
      }
    });
  }, []);

  useEffect(() => {
    layoutCards(activeIndexRef.current);
    const onResize = () => {
      if (!isAnimatingRef.current) {
        layoutCards(activeIndexRef.current);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [layoutCards]);

  // eslint-disable-next-line react-hooks/refs
  const slideByOffset = contextSafe((stepOffset: number) => {
    if (stepOffset === 0) return;
    const len = destinations.length;
    const prevCenter = activeIndexRef.current;
    const nextCenter = (prevCenter + stepOffset + len) % len;
    activeIndexRef.current = nextCenter;
    setActiveIndex(nextCenter);

    const track = trackRef.current;
    if (
      !track ||
      typeof window === "undefined" ||
      !window.matchMedia(MOTION_OK).matches
    ) {
      layoutCards(nextCenter);
      return;
    }

    const W = track.clientWidth;
    const H = track.clientHeight;
    if (!W || !H) return;

    isAnimatingRef.current = true;
    const dir = stepOffset > 0 ? 1 : -1;

    const tl = gsap.timeline({
      defaults: {
        duration: 0.82,
        ease: "power3.out",
        overwrite: "auto",
      },
      onComplete: () => {
        isAnimatingRef.current = false;
        layoutCards(nextCenter);
      },
    });

    destinations.forEach((_, i) => {
      const card = cardRefs.current[i];
      const media = mediaRefs.current[i];
      const featUi = featuredUiRefs.current[i];
      const thumbUi = thumbUiRefs.current[i];
      if (!card || !media) return;

      const oldOffset = getCircularOffset(i, prevCenter, len);
      const newOffset = getCircularOffset(i, nextCenter, len);
      const wasVisible = Math.abs(oldOffset) <= 2;
      const willBeVisible = Math.abs(newOffset) <= 2;

      const targetBox = computeSlotGeometry(newOffset, W, H);
      const isBecomingCenter = newOffset === 0;
      const wasCenter = oldOffset === 0;

      // If this card is newly entering the 5-card visible window from off-screen,
      // pre-position it at the incoming off-screen edge on the correct side so it slides in cleanly
      if (!wasVisible && willBeVisible) {
        const entryOffset = newOffset + stepOffset;
        const entryBox = computeSlotGeometry(entryOffset, W, H);
        gsap.set(card, {
          x: entryBox.x,
          y: entryBox.y,
          width: entryBox.width,
          height: entryBox.height,
          scale: 0.88,
          autoAlpha: 0,
          zIndex: targetBox.zIndex,
        });
        gsap.set(media, {
          height: entryBox.mediaHeight,
          borderRadius: entryBox.radius,
        });
      } else {
        gsap.set(card, {
          zIndex: isBecomingCenter ? 12 : wasCenter ? 9 : targetBox.zIndex,
        });
      }

      if (wasVisible && !willBeVisible) {
        const exitOffset = oldOffset - stepOffset;
        const exitBox = computeSlotGeometry(exitOffset, W, H);
        tl.to(
          card,
          {
            x: exitBox.x,
            y: exitBox.y,
            width: exitBox.width,
            height: exitBox.height,
            scale: 0.88,
            autoAlpha: 0,
          },
          0
        );
        tl.to(
          media,
          {
            height: exitBox.mediaHeight,
            borderRadius: exitBox.radius,
          },
          0
        );
      } else if (willBeVisible) {
        tl.to(
          card,
          {
            x: targetBox.x,
            y: targetBox.y,
            width: targetBox.width,
            height: targetBox.height,
            scale: 1,
            autoAlpha: 1,
          },
          0
        );
        tl.to(
          media,
          {
            height: targetBox.mediaHeight,
            borderRadius: targetBox.radius,
          },
          0
        );
      } else {
        gsap.set(card, { autoAlpha: 0 });
      }

      if (featUi) {
        if (isBecomingCenter) {
          gsap.set(featUi, { pointerEvents: "auto" });
          tl.fromTo(
            featUi,
            { autoAlpha: 0, y: dir * 14 },
            { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out" },
            0.22
          );
        } else if (wasCenter) {
          gsap.set(featUi, { pointerEvents: "none" });
          tl.to(
            featUi,
            { autoAlpha: 0, y: -dir * 10, duration: 0.32, ease: "power2.in" },
            0
          );
        } else {
          gsap.set(featUi, { autoAlpha: 0, pointerEvents: "none" });
        }
      }

      if (thumbUi) {
        if (isBecomingCenter || !willBeVisible) {
          tl.to(thumbUi, { autoAlpha: 0, duration: 0.25 }, 0);
        } else {
          tl.to(thumbUi, { autoAlpha: 1, duration: 0.45 }, 0.2);
        }
      }
    });
  });

  return (
    <section
      id="destinations"
      ref={sectionRef}
      aria-labelledby="destinations-heading"
      className="py-8 md:py-12 lg:py-14"
    >
      <Container>
        {/* Section Header with Heading on Left and Slider Controls + View All on Top-Right */}
        <div data-reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 sm:mb-6">
          <div className="max-w-xl">
            <p className="text-[13px] font-medium text-ink-muted mb-1">
              Popular destinations
            </p>
            <h2
              id="destinations-heading"
              className="text-[clamp(1.75rem,3.2vw,2.75rem)] font-medium tracking-[-0.03em] leading-[1.06] text-ink"
            >
              Destinations You’ll Love
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-ink-muted leading-relaxed">
              Select any city below to preview stays, visa guidance, and seasonal fares.
            </p>
          </div>

          {/* Top-Right Section Controls: Prev/Next arrows & View All Destinations */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => slideByOffset(-1)}
              aria-label="Previous destination"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-ink hover:border-ink transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              onClick={() => slideByOffset(1)}
              aria-label="Next destination"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-ink text-bg hover:opacity-90 transition-opacity cursor-pointer shadow-2xs"
            >
              <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
            </button>
            <Link
              href="/hotels"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-xs sm:text-sm font-medium text-ink hover:border-ink transition-colors shadow-2xs"
            >
              <span>View all destinations</span>
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Desktop Horizontal Track: [thumb -2] [thumb -1] [FEATURED 0] [thumb +1] [thumb +2] */}
        <div
          ref={trackRef}
          data-reveal
          className="hidden lg:block relative w-full h-[540px] xl:h-[590px] overflow-hidden select-none"
        >

          {/* Persistent Destination Cards on the Horizontal Track */}
          {destinations.map((dest, idx) => {
            const offset = getCircularOffset(idx, activeIndex, destinations.length);
            const isCenter = offset === 0;
            const isVisible = Math.abs(offset) <= 2;

            return (
              <div
                key={dest.id}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                data-dest-card={dest.id}
                data-slot-offset={offset}
                onClick={() => {
                  if (!isCenter && isVisible) {
                    slideByOffset(offset);
                  }
                }}
                role={!isCenter && isVisible ? "button" : undefined}
                tabIndex={!isCenter && isVisible ? 0 : -1}
                aria-label={
                  !isCenter && isVisible
                    ? `Slide ${dest.name}, ${dest.country} into featured view`
                    : undefined
                }
                onKeyDown={(e) => {
                  if (
                    !isCenter &&
                    isVisible &&
                    (e.key === "Enter" || e.key === " ")
                  ) {
                    e.preventDefault();
                    slideByOffset(offset);
                  }
                }}
                className={cn(
                  "absolute top-0 left-0 will-change-transform",
                  !isCenter && isVisible && "cursor-pointer group"
                )}
              >
                {/* Media Frame (animates between 18px thumbnail radius and 24px featured radius) */}
                <div
                  ref={(el) => {
                    mediaRefs.current[idx] = el;
                  }}
                  data-card-media
                  className="relative w-full overflow-hidden border border-line bg-ink"
                >
                  <Image
                    src={dest.image}
                    alt={`${dest.name}, ${dest.country}`}
                    fill
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    sizes="(min-width: 1024px) 54vw, 95vw"
                    className={cn(
                      "object-cover transition-transform duration-500",
                      !isCenter && "group-hover:scale-105"
                    )}
                  />

                  {/* Featured Overlay UI (visible when card is in Center Slot 0) */}
                  <div
                    ref={(el) => {
                      featuredUiRefs.current[idx] = el;
                    }}
                    data-featured-ui
                    className="absolute inset-0 flex flex-col justify-between p-5 md:p-7"
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/40"
                    />

                    {/* Top bar: functional tags left */}
                    <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 text-xs font-medium text-white">
                          from {formatUsd(dest.priceFrom)}
                        </span>
                        <span className="rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 text-xs font-medium text-white">
                          {dest.visaQuickInfo}
                        </span>
                      </div>
                    </div>

                    {/* Bottom destination title & tagline */}
                    <div className="relative z-10 text-white space-y-1.5">
                      <p className="font-mono text-xs text-white/80">
                        0{idx + 1} / 0{destinations.length} · {dest.duration} ({dest.bestSeason})
                      </p>
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <h3 className="text-3xl md:text-4xl font-medium tracking-[-0.03em]">
                            {dest.name}, {dest.country}
                          </h3>
                          <p className="mt-1 text-sm text-white/85 max-w-md">
                            {dest.tagline}
                          </p>
                        </div>
                        <Link
                          href={`/hotels?city=${encodeURIComponent(dest.name)}`}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Explore stays in ${dest.name}`}
                          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#0A0A0A] transition-transform hover:scale-105"
                        >
                          <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thumbnail Bottom Caption (visible when card is in a Thumbnail Slot) */}
                <div
                  ref={(el) => {
                    thumbUiRefs.current[idx] = el;
                  }}
                  data-thumb-ui
                  className="mt-1.5 flex items-center justify-between text-xs px-0.5 h-5"
                >
                  <span className="font-mono text-ink-muted">0{idx + 1}</span>
                  <span className="font-medium text-ink truncate ml-2 group-hover:underline">
                    {dest.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile / Tablet Scroll-Snap Slider */}
        <div className="lg:hidden">
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 no-scrollbar">
            {destinations.map((dest) => (
              <Link
                key={dest.id}
                href={`/hotels?city=${encodeURIComponent(dest.name)}`}
                className="group snap-start shrink-0 w-[78vw] sm:w-[44vw] block"
              >
                <div className="relative h-[430px] sm:h-[470px] w-full rounded-[24px] overflow-hidden border border-line bg-ink p-5 flex flex-col justify-between">
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
