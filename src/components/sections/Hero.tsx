"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { sectionPhotography } from "@/data/stats";
import { gsap, useGSAP, SplitText, MOTION_OK } from "@/lib/gsap";
import { useWebGLImage } from "@/hooks/useWebGLImage";
import { Container } from "@/components/ui/Container";
import { SearchTabs } from "@/components/search/SearchTabs";

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const heroWebGLRef = useWebGLImage<HTMLDivElement>(
    "hero-primary",
    sectionPhotography.heroPrimary,
    24
  );

  useGSAP(
    (_, contextSafe) => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        let split: SplitText | undefined;
        const runIntro = contextSafe
          ? contextSafe(() => {
              if (!root.current) return;
              const headline = root.current.querySelector<HTMLElement>(
                "[data-hero='headline']"
              );

              if (headline) {
                gsap.set(headline, { autoAlpha: 1 });
                split = SplitText.create(headline, { type: "words", mask: "words" });
                split.masks.forEach((m) => {
                  const el = m as HTMLElement;
                  el.style.paddingBottom = "0.14em";
                  el.style.marginBottom = "-0.14em";
                });
              }

              const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

              tl.fromTo(
                "[data-hero='eyebrow']",
                { autoAlpha: 0, y: 14 },
                { autoAlpha: 1, y: 0, duration: 0.6 },
                0.05
              );

              if (split?.words?.length) {
                tl.from(
                  split.words,
                  { yPercent: 105, duration: 0.75, stagger: 0.05 },
                  0.1
                );
              }

              tl.fromTo(
                "[data-hero='sub']",
                { autoAlpha: 0, y: 16 },
                { autoAlpha: 1, y: 0, duration: 0.65 },
                0.26
              )
                .fromTo(
                  "[data-hero='cta']",
                  { autoAlpha: 0, y: 16 },
                  { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 },
                  0.36
                )
                .fromTo(
                  "[data-hero='widget']",
                  { autoAlpha: 0, y: 24 },
                  { autoAlpha: 1, y: 0, duration: 0.75 },
                  0.42
                );

              // Hero scroll interaction:
              // At scroll = 0, image and canopy are 100x100 (full-bleed, magnified).
              // As user scrolls down, it smoothly zooms out into the resting card container position.
              gsap.fromTo(
                "[data-hero-parallax]",
                {
                  scale: 1.18,
                  yPercent: -2,
                },
                {
                  scale: 1.0,
                  yPercent: 8,
                  ease: "power1.out",
                  scrollTrigger: {
                    trigger: root.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: 1.2,
                  },
                }
              );

              gsap.fromTo(
                "[data-hero-card]",
                {
                  scale: 1.025,
                  borderRadius: "0px",
                },
                {
                  scale: 1.0,
                  borderRadius: "24px",
                  ease: "power1.out",
                  transformOrigin: "center top",
                  scrollTrigger: {
                    trigger: root.current,
                    start: "top top",
                    end: "+=450",
                    scrub: 1.2,
                  },
                }
              );

              gsap.fromTo(
                "[data-hero='image'], [data-hero-scrim]",
                {
                  borderRadius: "0px",
                },
                {
                  borderRadius: "24px",
                  ease: "power1.out",
                  scrollTrigger: {
                    trigger: root.current,
                    start: "top top",
                    end: "+=450",
                    scrub: 1.2,
                  },
                }
              );
            })
          : () => {};

        const rafId = requestAnimationFrame(runIntro);

        return () => {
          cancelAnimationFrame(rafId);
          split?.revert();
        };
      });
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      aria-labelledby="hero-headline"
      className="pt-0 pb-4 md:pb-6"
    >
      <Container>
        {/* Full-width rounded hero photo with headline, CTAs, and SearchTabs ALL inside */}
        <div
          data-hero-card
          className="relative w-full rounded-[24px] lg:h-[calc(100svh-var(--gutter))] lg:min-h-[640px] lg:max-h-[980px] flex flex-col justify-end p-3.5 sm:p-5 md:p-6 pt-20 sm:pt-24 lg:pt-20"
        >
          {/* Background Image Layer (z-0, registered for DOM-synced WebGL plane at z-[2]) */}
          <div
            ref={heroWebGLRef}
            data-hero="image"
            className="absolute inset-0 z-0 rounded-[24px] overflow-hidden bg-ink"
          >
            <div
              data-hero-parallax
              className="absolute inset-x-0 -top-[8%] h-[116%] w-full"
            >
              <Image
                src={sectionPhotography.heroPrimary}
                alt="Wooden boat drifting across a crystal-clear emerald alpine lake beneath sunlit Dolomite peaks"
                fill
                preload
                fetchPriority="high"
                decoding="sync"
                quality={85}
                sizes="98vw"
                className="object-cover object-[center_42%]"
              />
            </div>
          </div>

          {/* Soft bottom scrim (z-[3], above WebGL plane at z-[2] so white text contrast is always preserved) */}
          <div
            aria-hidden="true"
            data-hero-scrim
            className="pointer-events-none absolute inset-0 z-[3] rounded-[24px] bg-gradient-to-t from-black/80 via-black/38 to-black/10"
          />

          {/* Foreground Content + Embedded Search Widget (z-[5]) */}
          <div className="relative z-[5] flex flex-col justify-end gap-5 lg:gap-6 pt-14 sm:pt-20 lg:pt-8">
            <div className="max-w-2xl space-y-3.5 text-white">
              <div data-hero="eyebrow">
                <Link
                  href="/#destinations"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/25 pl-2 pr-4 py-1.5 text-xs font-medium text-white hover:bg-white/25 transition-colors"
                >
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-[#0A0A0A]">
                    New
                  </span>
                  <span>Choose your destination</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>

              <h1
                id="hero-headline"
                data-hero="headline"
                className="max-w-[18ch] text-[clamp(2.15rem,4.6vw,4.25rem)] font-medium tracking-[-0.03em] leading-[1.05] text-white"
              >
                Every journey, arranged with quiet precision.
              </h1>

              <p
                data-hero="sub"
                className="max-w-lg text-sm sm:text-[15px] text-white/85 leading-[1.55]"
              >
                Visas, flights, handpicked stays, and private cars organized in one calm place with transparent pricing.
              </p>

              <div className="pt-0.5 flex flex-wrap items-center gap-2.5">
                <div data-hero="cta">
                  <Link
                    href="/visa"
                    className="inline-flex min-h-11 items-center gap-2.5 rounded-full bg-white pl-4 pr-1.5 py-1.5 text-sm font-medium text-[#0A0A0A] transition-opacity hover:opacity-90"
                  >
                    <span>Plan Your Journey</span>
                    <span
                      aria-hidden="true"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#0A0A0A] text-white"
                    >
                      <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                  </Link>
                </div>

                <div data-hero="cta">
                  <Link
                    href="/#destinations"
                    className="inline-flex min-h-11 items-center gap-2.5 rounded-full bg-white/15 backdrop-blur-md border border-white/30 pl-4 pr-1.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/25"
                  >
                    <span>Explore Destinations</span>
                    <span
                      aria-hidden="true"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0A0A0A]"
                    >
                      <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Search widget anchored inside the bottom of the hero photo */}
            <div data-hero="widget" className="w-full">
              <SearchTabs />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
