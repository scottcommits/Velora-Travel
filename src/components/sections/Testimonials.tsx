"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { testimonials } from "@/data/testimonials";
import { BLUR_DATA_URL, cn } from "@/lib/utils";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { useReveal } from "@/hooks/useReveal";
import { Container } from "@/components/ui/Container";

interface TestimonialSlotBox {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  scale: number;
  opacity: number;
  zIndex: number;
}

function computeTestimonialSlots(W: number, H: number) {
  const leftW = Math.round(W * 0.315);
  const leftH = H;

  const peekW = Math.max(150, Math.round(W * 0.145));
  const peekH = Math.round(H * 0.56);
  const peekX = W - peekW;
  const peekY = Math.round((H - peekH) / 2);

  const slotLeft: TestimonialSlotBox = {
    x: 0,
    y: 0,
    width: leftW,
    height: leftH,
    radius: 24,
    scale: 1,
    opacity: 1,
    zIndex: 6,
  };

  const slotRight: TestimonialSlotBox = {
    x: peekX,
    y: peekY,
    width: peekW,
    height: peekH,
    radius: 20,
    scale: 1,
    opacity: 1,
    zIndex: 5,
  };

  const slotOutLeft: TestimonialSlotBox = {
    x: -Math.round(leftW * 0.85),
    y: Math.round(H * 0.14),
    width: Math.round(leftW * 0.72),
    height: Math.round(H * 0.72),
    radius: 20,
    scale: 0.86,
    opacity: 0,
    zIndex: 2,
  };

  const slotOutRight: TestimonialSlotBox = {
    x: W + Math.round(peekW * 0.65),
    y: peekY,
    width: peekW,
    height: peekH,
    radius: 20,
    scale: 0.86,
    opacity: 0,
    zIndex: 2,
  };

  return {
    leftW,
    peekW,
    slotLeft,
    slotRight,
    slotOutLeft,
    slotOutRight,
  };
}

export function TestimonialsSection() {
  const scope = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const photoCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const quoteZoneRef = useRef<HTMLDivElement>(null);
  const quoteContentRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);
  const isAnimatingRef = useRef(false);

  const [index, setIndex] = useState(0);

  useReveal(scope);
  const { contextSafe } = useGSAP({ scope });

  const layoutStage = useCallback((currentIndex: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    if (!W || !H) return;

    const len = testimonials.length;
    const peekIndex = (currentIndex + 1) % len;
    const { leftW, peekW, slotLeft, slotRight, slotOutRight } =
      computeTestimonialSlots(W, H);

    if (quoteZoneRef.current) {
      const gapLeft = Math.round(Math.max(32, W * 0.042));
      const gapRight = Math.round(Math.max(32, W * 0.042));
      gsap.set(quoteZoneRef.current, {
        left: leftW + gapLeft,
        width: Math.max(260, W - leftW - peekW - gapLeft - gapRight),
      });
    }

    testimonials.forEach((_, i) => {
      const card = photoCardRefs.current[i];
      if (!card) return;
      const box =
        i === currentIndex
          ? slotLeft
          : i === peekIndex
            ? slotRight
            : slotOutRight;

      gsap.set(card, {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        borderRadius: box.radius,
        scale: box.scale,
        autoAlpha: box.opacity,
        zIndex: box.zIndex,
      });
    });
  }, []);

  useEffect(() => {
    layoutStage(activeIndexRef.current);
    const onResize = () => {
      if (!isAnimatingRef.current) {
        layoutStage(activeIndexRef.current);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [layoutStage]);

  // eslint-disable-next-line react-hooks/refs
  const slideTestimonial = contextSafe((dir: 1 | -1) => {
    const len = testimonials.length;
    const prevIdx = activeIndexRef.current;
    const nextIdx = (prevIdx + dir + len) % len;
    if (prevIdx === nextIdx) return;

    activeIndexRef.current = nextIdx;
    setIndex(nextIdx);

    const stage = stageRef.current;
    if (
      !stage ||
      typeof window === "undefined" ||
      !window.matchMedia(MOTION_OK).matches
    ) {
      layoutStage(nextIdx);
      return;
    }

    const W = stage.clientWidth;
    const H = stage.clientHeight;
    if (!W || !H) return;

    isAnimatingRef.current = true;
    const { slotLeft, slotRight, slotOutLeft, slotOutRight } =
      computeTestimonialSlots(W, H);

    const prevPeekIdx = (prevIdx + 1) % len;
    const nextPeekIdx = (nextIdx + 1) % len;

    const tl = gsap.timeline({
      defaults: {
        duration: 0.82,
        ease: "power3.out",
        overwrite: "auto",
      },
      onComplete: () => {
        isAnimatingRef.current = false;
        layoutStage(nextIdx);
      },
    });

    if (dir === 1) {
      // NEXT:
      // 1) Old left photo (prevIdx) slides out to the left and scales down
      // 2) Old right peek photo (nextIdx === prevPeekIdx) slides left across the row and scales UP into the large left slot
      // 3) New peek photo (nextPeekIdx) enters on the right from off-screen right
      const oldLeftCard = photoCardRefs.current[prevIdx];
      const movingPeekToLeftCard = photoCardRefs.current[nextIdx];
      const newPeekCard = photoCardRefs.current[nextPeekIdx];

      testimonials.forEach((_, i) => {
        if (i !== prevIdx && i !== nextIdx && i !== nextPeekIdx) {
          const el = photoCardRefs.current[i];
          if (el) gsap.set(el, { autoAlpha: 0, zIndex: 1 });
        }
      });

      if (oldLeftCard) {
        gsap.set(oldLeftCard, { zIndex: 5 });
        tl.to(
          oldLeftCard,
          {
            x: slotOutLeft.x,
            y: slotOutLeft.y,
            width: slotOutLeft.width,
            height: slotOutLeft.height,
            borderRadius: slotOutLeft.radius,
            scale: slotOutLeft.scale,
            autoAlpha: 0,
          },
          0
        );
      }

      if (movingPeekToLeftCard) {
        gsap.set(movingPeekToLeftCard, { zIndex: 8 });
        tl.to(
          movingPeekToLeftCard,
          {
            x: slotLeft.x,
            y: slotLeft.y,
            width: slotLeft.width,
            height: slotLeft.height,
            borderRadius: slotLeft.radius,
            scale: 1,
            autoAlpha: 1,
          },
          0
        );
      }

      if (newPeekCard) {
        gsap.set(newPeekCard, {
          x: slotOutRight.x,
          y: slotOutRight.y,
          width: slotOutRight.width,
          height: slotOutRight.height,
          borderRadius: slotOutRight.radius,
          scale: slotOutRight.scale,
          autoAlpha: 0,
          zIndex: 6,
        });
        tl.to(
          newPeekCard,
          {
            x: slotRight.x,
            y: slotRight.y,
            width: slotRight.width,
            height: slotRight.height,
            borderRadius: slotRight.radius,
            scale: 1,
            autoAlpha: 1,
          },
          0.06
        );
      }
    } else {
      // PREVIOUS (reverse):
      // 1) Old right peek photo (prevPeekIdx) exits to the right
      // 2) Old left photo (prevIdx === nextPeekIdx) shrinks and slides right into the right peek slot
      // 3) Incoming left photo (nextIdx) slides in from the left and scales up into the large left slot
      const oldPeekCard = photoCardRefs.current[prevPeekIdx];
      const movingLeftToPeekCard = photoCardRefs.current[prevIdx];
      const incomingLeftCard = photoCardRefs.current[nextIdx];

      testimonials.forEach((_, i) => {
        if (i !== prevPeekIdx && i !== prevIdx && i !== nextIdx) {
          const el = photoCardRefs.current[i];
          if (el) gsap.set(el, { autoAlpha: 0, zIndex: 1 });
        }
      });

      if (oldPeekCard) {
        gsap.set(oldPeekCard, { zIndex: 4 });
        tl.to(
          oldPeekCard,
          {
            x: slotOutRight.x,
            y: slotOutRight.y,
            width: slotOutRight.width,
            height: slotOutRight.height,
            borderRadius: slotOutRight.radius,
            scale: slotOutRight.scale,
            autoAlpha: 0,
          },
          0
        );
      }

      if (movingLeftToPeekCard) {
        gsap.set(movingLeftToPeekCard, { zIndex: 6 });
        tl.to(
          movingLeftToPeekCard,
          {
            x: slotRight.x,
            y: slotRight.y,
            width: slotRight.width,
            height: slotRight.height,
            borderRadius: slotRight.radius,
            scale: 1,
            autoAlpha: 1,
          },
          0
        );
      }

      if (incomingLeftCard) {
        gsap.set(incomingLeftCard, {
          x: slotOutLeft.x,
          y: slotOutLeft.y,
          width: slotOutLeft.width,
          height: slotOutLeft.height,
          borderRadius: slotOutLeft.radius,
          scale: slotOutLeft.scale,
          autoAlpha: 0,
          zIndex: 8,
        });
        tl.to(
          incomingLeftCard,
          {
            x: slotLeft.x,
            y: slotLeft.y,
            width: slotLeft.width,
            height: slotLeft.height,
            borderRadius: slotLeft.radius,
            scale: 1,
            autoAlpha: 1,
          },
          0
        );
      }
    }

    if (quoteContentRef.current) {
      tl.fromTo(
        quoteContentRef.current,
        { autoAlpha: 0, x: dir * 28 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.52,
          ease: "power3.out",
        },
        0.26
      );
    }
  });

  const current = testimonials[index] ?? testimonials[0];
  const peekIdx = (index + 1) % testimonials.length;

  return (
    <section
      id="testimonials"
      ref={scope}
      aria-labelledby="testimonials-heading"
      aria-roledescription="carousel"
      className="py-8 md:py-12 lg:py-14"
    >
      <Container>
        {/* Header with round outline prev + solid black next buttons top-right above the small peek photo */}
        <div className="flex items-end justify-between gap-4 mb-5 md:mb-6">
          <div>
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
              onClick={() => slideTestimonial(-1)}
              aria-label="Previous review"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-ink hover:border-ink transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => slideTestimonial(1)}
              aria-label="Next review"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-ink text-bg hover:opacity-88 transition-opacity cursor-pointer"
            >
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Desktop Track: Large Left Photo (author pill bottom-left only) | Plain Center Quote (no card) | Vertically-Centered Right Peek Photo */}
        <div
          ref={stageRef}
          data-reveal
          role="group"
          aria-roledescription="slide"
          aria-label={`Testimonial ${index + 1} of ${testimonials.length}`}
          aria-live="polite"
          className="hidden lg:block relative w-full h-[380px] xl:h-[420px] overflow-hidden select-none"
        >
          {/* Persistent Photo Cards that physically slide between Left Large Slot and Right Peek Slot */}
          {testimonials.map((item, i) => {
            const isLeft = i === index;
            const isPeek = i === peekIdx;

            return (
              <div
                key={item.id}
                ref={(el) => {
                  photoCardRefs.current[i] = el;
                }}
                data-testimonial-photo={item.id}
                onClick={() => {
                  if (isPeek) slideTestimonial(1);
                }}
                role={isPeek ? "button" : undefined}
                tabIndex={isPeek ? 0 : -1}
                aria-label={isPeek ? `Next review by ${item.author}` : undefined}
                onKeyDown={(e) => {
                  if (isPeek && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    slideTestimonial(1);
                  }
                }}
                className={cn(
                  "absolute top-0 left-0 overflow-hidden border border-line bg-ink will-change-transform",
                  isPeek && "cursor-pointer group"
                )}
              >
                <Image
                  src={item.tripImage}
                  alt={`${item.route} journey`}
                  fill
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  sizes="(min-width: 1024px) 34vw, 94vw"
                  className={cn(
                    "object-cover transition-transform duration-500",
                    isPeek && "group-hover:scale-105"
                  )}
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent"
                />

                {/* Bottom-left author name + small avatar ONLY (quote text is NOT on the photo) */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 flex items-center gap-2.5 text-white">
                  {isLeft ? (
                    <div className="relative h-8 w-8 rounded-full overflow-hidden border border-white/40 bg-surface-2 shrink-0">
                      <Image
                        src={item.avatar}
                        alt={item.author}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  <span className="text-xs font-medium truncate drop-shadow-xs">
                    — {item.author}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Center Plain Quote (NO heavy white card, vertically centered against the left photo) */}
          <div
            ref={quoteZoneRef}
            className="absolute top-0 bottom-0 z-[4] flex flex-col justify-center"
          >
            <div ref={quoteContentRef} className="space-y-4">
              <span
                aria-hidden="true"
                className="block font-serif text-5xl leading-none text-ink-muted/35 select-none"
              >
                “
              </span>

              <blockquote className="text-[clamp(1.25rem,2vw,1.65rem)] font-normal tracking-[-0.02em] leading-[1.36] text-ink max-w-[44ch]">
                {current.quote}
              </blockquote>

              <div className="pt-3 flex items-center justify-between gap-4 text-xs">
                <p className="text-ink-muted">
                  <strong className="font-medium text-ink">
                    — {current.author}
                  </strong>{" "}
                  <span className="mx-1.5 text-ink-muted/50">|</span>{" "}
                  <span>{current.role}</span>
                </p>

                <span className="font-mono text-xs text-ink-muted shrink-0">
                  <strong className="text-ink font-semibold">{index + 1}</strong>
                  /{testimonials.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Stacked View */}
        <div className="lg:hidden space-y-5">
          <div className="relative aspect-[4/3] w-full rounded-[24px] overflow-hidden border border-line bg-ink">
            <Image
              src={current.tripImage}
              alt={`${current.route} journey`}
              fill
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              sizes="94vw"
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent"
            />
            <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2.5 text-white">
              <div className="relative h-8 w-8 rounded-full overflow-hidden border border-white/40 bg-surface-2 shrink-0">
                <Image
                  src={current.avatar}
                  alt={current.author}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
              <span className="text-xs font-medium">— {current.author}</span>
            </div>
          </div>

          <div className="px-1 space-y-3">
            <span
              aria-hidden="true"
              className="block font-serif text-4xl leading-none text-ink-muted/35 select-none"
            >
              “
            </span>
            <blockquote className="text-lg font-normal tracking-[-0.015em] leading-[1.38] text-ink">
              {current.quote}
            </blockquote>
            <div className="pt-1 flex items-center justify-between gap-4 text-xs">
              <p className="text-ink-muted">
                <strong className="font-medium text-ink">
                  — {current.author}
                </strong>{" "}
                <span className="mx-1 text-ink-muted/50">|</span>{" "}
                {current.role}
              </p>
              <span className="font-mono text-xs text-ink-muted">
                <strong className="text-ink font-semibold">{index + 1}</strong>/
                {testimonials.length}
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
