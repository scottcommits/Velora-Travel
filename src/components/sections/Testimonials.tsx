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
  const [index, setIndex] = useState(0);

  useReveal(scope);

  const animateSlide = (nextIdx: number) => {
    setIndex(nextIdx);
    if (
      typeof window !== "undefined" &&
      window.matchMedia(MOTION_OK).matches &&
      slideRef.current
    ) {
      gsap.fromTo(
        slideRef.current,
        { autoAlpha: 0, y: 10 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.35,
          ease: "power2.out",
          clearProps: "transform",
        }
      );
    }
  };

  useGSAP(() => {}, { scope });

  const prev = () => {
    animateSlide((index - 1 + testimonials.length) % testimonials.length);
  };
  const next = () => {
    animateSlide((index + 1) % testimonials.length);
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

        {/* 3-Column Bento Layout: Left Photo | Lighter Vertically-Centered Quote | Right Peeking Photo — all sharing one row height */}
        <div
          ref={slideRef}
          role="group"
          aria-roledescription="slide"
          aria-label={`Testimonial ${index + 1} of ${testimonials.length}`}
          aria-live="polite"
          className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch lg:min-h-[340px]"
        >
          {/* Left Photo */}
          <div className="lg:col-span-4 flex" data-reveal>
            <div className="relative min-h-[260px] lg:min-h-full w-full rounded-[24px] overflow-hidden border border-line bg-ink p-4 flex items-end">
              <Image
                src={current.tripImage}
                alt={`${current.route} journey`}
                fill
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                sizes="(min-width: 1024px) 32vw, 94vw"
                className="object-cover"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent"
              />
              <div className="relative z-10 inline-flex items-center gap-2.5 rounded-full bg-black/45 backdrop-blur-md border border-white/20 pl-1.5 pr-3.5 py-1 text-white">
                <div className="relative h-7 w-7 rounded-full overflow-hidden bg-surface-2">
                  <Image
                    src={current.avatar}
                    alt={current.author}
                    fill
                    sizes="28px"
                    className="object-cover"
                  />
                </div>
                <span className="text-xs font-medium">— {current.author}</span>
              </div>
            </div>
          </div>

          {/* Center Lighter Quote Container (vertically centered, shared row height) */}
          <div className="lg:col-span-6 flex" data-reveal>
            <div className="w-full rounded-[24px] border border-line/70 bg-surface/65 p-5 sm:p-7 lg:px-9 lg:py-7 flex flex-col justify-center gap-4">
              <span
                aria-hidden="true"
                className="font-serif text-4xl leading-none text-ink-muted/35 select-none"
              >
                “
              </span>

              <blockquote className="text-[clamp(1.2rem,2.1vw,1.75rem)] font-medium tracking-[-0.02em] leading-[1.32] text-ink">
                {current.quote}
              </blockquote>

              <div className="pt-2 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="relative h-8 w-8 rounded-full overflow-hidden border border-line bg-surface-2">
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

          {/* Right Peeking Photo (Desktop — stretches to match exact row height) */}
          <div className="hidden lg:flex lg:col-span-2" data-reveal>
            <button
              type="button"
              onClick={next}
              aria-label={`Next review by ${nextItem.author}`}
              className="group relative h-full w-full rounded-[24px] overflow-hidden border border-line bg-ink p-3.5 flex items-end text-left cursor-pointer"
            >
              <Image
                src={nextItem.tripImage}
                alt={`${nextItem.route} preview`}
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
                    src={nextItem.avatar}
                    alt={nextItem.author}
                    fill
                    loading="eager"
                    sizes="24px"
                    className="object-cover"
                  />
                </div>
                <span className="text-[11px] font-medium truncate">
                  — {nextItem.author}
                </span>
              </div>
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
