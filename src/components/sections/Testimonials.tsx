"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { testimonials } from "@/data/testimonials";
import { BLUR_DATA_URL } from "@/lib/utils";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { useReveal } from "@/hooks/useReveal";
import { Container } from "@/components/ui/Container";

export function TestimonialsSection() {
  const scope = useRef<HTMLElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const leftSlidesRef = useRef<(HTMLDivElement | null)[]>([]);
  const rightSlidesRef = useRef<(HTMLDivElement | null)[]>([]);
  const quoteContentRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useReveal(scope);
  useGSAP(() => {}, { scope });

  const animateSlide = (nextIdx: number, dir: 1 | -1) => {
    const len = testimonials.length;
    const normalized = (nextIdx + len) % len;
    if (normalized === index) return;

    const prevIdx = index;
    const prevPeekIdx = (prevIdx + 1) % len;
    const nextPeekIdx = (normalized + 1) % len;

    setIndex(normalized);

    if (
      typeof window !== "undefined" &&
      window.matchMedia(MOTION_OK).matches
    ) {
      const outLeft = leftSlidesRef.current[prevIdx];
      const inLeft = leftSlidesRef.current[normalized];
      const outRight = rightSlidesRef.current[prevPeekIdx];
      const inRight = rightSlidesRef.current[nextPeekIdx];

      const tl = gsap.timeline({ defaults: { overwrite: "auto" } });

      if (outLeft && inLeft) {
        gsap.set(outLeft, { zIndex: 1 });
        gsap.set(inLeft, { zIndex: 2 });

        tl.fromTo(
          outLeft,
          { xPercent: 0, scale: 1.03, autoAlpha: 1 },
          {
            xPercent: -dir * 22,
            scale: 0.93,
            autoAlpha: 0,
            duration: 0.65,
            ease: "power3.inOut",
          },
          0
        ).fromTo(
          inLeft,
          {
            xPercent: dir * 24,
            scale: 1.14,
            autoAlpha: 0,
          },
          {
            xPercent: 0,
            scale: 1.03,
            autoAlpha: 1,
            duration: 0.72,
            ease: "power3.out",
          },
          0
        );
      }

      if (quoteContentRef.current) {
        tl.fromTo(
          quoteContentRef.current,
          { autoAlpha: 0, x: dir * 22, scale: 0.98 },
          {
            autoAlpha: 1,
            x: 0,
            scale: 1,
            duration: 0.6,
            ease: "power3.out",
          },
          0.05
        );
      }

      if (outRight && inRight) {
        gsap.set(outRight, { zIndex: 1 });
        gsap.set(inRight, { zIndex: 2 });

        tl.fromTo(
          outRight,
          { xPercent: 0, scale: 1, autoAlpha: 1 },
          {
            xPercent: -dir * 18,
            scale: 0.92,
            autoAlpha: 0,
            duration: 0.6,
            ease: "power3.inOut",
          },
          0
        ).fromTo(
          inRight,
          {
            xPercent: dir * 22,
            scale: 1.1,
            autoAlpha: 0,
          },
          {
            xPercent: 0,
            scale: 1,
            autoAlpha: 1,
            duration: 0.68,
            ease: "power3.out",
          },
          0.04
        );
      }
    }
  };

  const prev = () => {
    animateSlide(index - 1, -1);
  };
  const next = () => {
    animateSlide(index + 1, 1);
  };

  const current = testimonials[index] ?? testimonials[0];
  const nextItem = testimonials[(index + 1) % testimonials.length] ?? testimonials[0];

  return (
    <section
      id="testimonials"
      ref={scope}
      aria-labelledby="testimonials-heading"
      aria-roledescription="carousel"
      className="py-8 md:py-12 lg:py-14"
    >
      <Container>
        {/* Header with round arrows top-right */}
        <div className="flex items-end justify-between gap-4 mb-5 md:mb-6">
          <div>
            <p
              data-reveal
              className="text-[13px] font-medium text-ink-muted mb-1"
            >
              Client stories
            </p>
            <h2
              id="testimonials-heading"
              data-reveal
              className="text-[clamp(1.75rem,3.2vw,2.75rem)] font-medium tracking-[-0.03em] leading-[1.06] text-ink"
            >
              Hear From Our Clients
            </h2>
          </div>

          <div data-reveal className="flex items-center gap-2">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous review"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-ink hover:border-ink transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next review"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-ink text-bg hover:opacity-88 transition-opacity cursor-pointer"
            >
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* 3-Column Bento Layout: Prominent Left Photo (col-span-5) | Center Quote (col-span-5) | Right Peeking Photo (col-span-2) */}
        <div
          ref={slideRef}
          role="group"
          aria-roledescription="slide"
          aria-label={`Testimonial ${index + 1} of ${testimonials.length}`}
          aria-live="polite"
          className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch lg:min-h-[370px]"
        >
          {/* Left Prominent Photo with layered GSAP slide+scale transitions & client message overlay */}
          <div className="lg:col-span-5 flex" data-reveal>
            <div className="relative min-h-[290px] lg:min-h-full w-full rounded-[24px] overflow-hidden border border-line bg-ink">
              {testimonials.map((item, i) => (
                <div
                  key={item.id}
                  ref={(el) => {
                    leftSlidesRef.current[i] = el;
                  }}
                  style={{
                    opacity: i === index ? 1 : 0,
                    visibility: i === index ? "visible" : "hidden",
                    zIndex: i === index ? 2 : 1,
                    transform: "scale(1.03)",
                  }}
                  className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-between will-change-transform"
                >
                  <Image
                    src={item.tripImage}
                    alt={`${item.route} journey`}
                    fill
                    loading="eager"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    sizes="(min-width: 1024px) 40vw, 94vw"
                    className="object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/15"
                  />

                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-white/20 backdrop-blur-md border border-white/25 px-3 py-1 text-[11px] font-medium text-white">
                      {item.service} · {item.route}
                    </span>
                  </div>

                  <div className="relative z-10 space-y-2.5 text-white">
                    <p className="text-xs sm:text-[13px] text-white/90 leading-snug line-clamp-2 max-w-sm">
                      “{item.quote}”
                    </p>
                    <div className="inline-flex items-center gap-2.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 pl-1.5 pr-3.5 py-1 text-white">
                      <div className="relative h-7 w-7 rounded-full overflow-hidden bg-surface-2">
                        <Image
                          src={item.avatar}
                          alt={item.author}
                          fill
                          loading="eager"
                          sizes="28px"
                          className="object-cover"
                        />
                      </div>
                      <span className="text-xs font-medium">— {item.author}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center Lighter Quote Container (vertically centered, shared row height) */}
          <div className="lg:col-span-5 flex" data-reveal>
            <div className="w-full rounded-[24px] border border-line/70 bg-surface/65 p-5 sm:p-7 lg:px-8 lg:py-7 flex flex-col justify-center">
              <div ref={quoteContentRef} className="flex flex-col justify-center gap-4">
                <span
                  aria-hidden="true"
                  className="font-serif text-4xl leading-none text-ink-muted/35 select-none"
                >
                  “
                </span>

                <blockquote className="text-[clamp(1.15rem,1.9vw,1.6rem)] font-medium tracking-[-0.02em] leading-[1.34] text-ink">
                  {current.quote}
                </blockquote>

                <div className="pt-2 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="relative h-8 w-8 rounded-full overflow-hidden border border-line bg-surface-2 shrink-0">
                      <Image
                        src={current.avatar}
                        alt={current.author}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    </div>
                    <p className="text-ink-muted">
                      <strong className="font-medium text-ink">
                        — {current.author}
                      </strong>{" "}
                      <span className="mx-1 text-ink-muted/50">|</span>{" "}
                      {current.role} · {current.service} ({current.route})
                    </p>
                  </div>

                  <span className="font-mono text-xs text-ink-muted shrink-0">
                    <strong className="text-ink font-medium">{index + 1}</strong>/
                    {testimonials.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Peeking Photo (Desktop — stretches to match exact row height, synced slide+scale transition) */}
          <div className="hidden lg:flex lg:col-span-2" data-reveal>
            <button
              type="button"
              onClick={next}
              aria-label={`Next review by ${nextItem.author}`}
              className="group relative h-full w-full rounded-[24px] overflow-hidden border border-line bg-ink text-left cursor-pointer"
            >
              {testimonials.map((item, i) => {
                const isPeek = i === (index + 1) % testimonials.length;
                return (
                  <div
                    key={item.id}
                    ref={(el) => {
                      rightSlidesRef.current[i] = el;
                    }}
                    style={{
                      opacity: isPeek ? 1 : 0,
                      visibility: isPeek ? "visible" : "hidden",
                      zIndex: isPeek ? 2 : 1,
                    }}
                    className="absolute inset-0 p-3.5 flex items-end will-change-transform"
                  >
                    <Image
                      src={item.tripImage}
                      alt={`${item.route} preview`}
                      fill
                      loading="eager"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                      sizes="18vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"
                    />
                    <div className="relative z-10 flex items-center gap-2 text-white">
                      <div className="relative h-6 w-6 rounded-full overflow-hidden shrink-0">
                        <Image
                          src={item.avatar}
                          alt={item.author}
                          fill
                          loading="eager"
                          sizes="24px"
                          className="object-cover"
                        />
                      </div>
                      <span className="text-[11px] font-medium truncate">
                        — {item.author}
                      </span>
                    </div>
                  </div>
                );
              })}
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
