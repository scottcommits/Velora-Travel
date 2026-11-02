"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { sectionPhotography } from "@/data/stats";
import { BLUR_DATA_URL } from "@/lib/utils";
import { gsap, useGSAP, SplitText, MOTION_OK } from "@/lib/gsap";
import { Container } from "@/components/ui/Container";
import { SearchTabs } from "@/components/search/SearchTabs";

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        if (!root.current) return;
        const headline = root.current.querySelector<HTMLElement>(
          "[data-hero='headline']"
        );
        let split: SplitText | undefined;

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
          "[data-hero='image']",
          { autoAlpha: 0, scale: 1.03 },
          { autoAlpha: 1, scale: 1, duration: 1.0, ease: "power2.out" },
          0
        )
          .fromTo(
            "[data-hero='eyebrow']",
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, duration: 0.6 },
            0.12
          );

        if (split?.words?.length) {
          tl.from(
            split.words,
            { yPercent: 105, duration: 0.75, stagger: 0.05 },
            0.18
          );
        }

        tl.fromTo(
          "[data-hero='sub']",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.65 },
          0.35
        )
          .fromTo(
            "[data-hero='cta']",
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 },
            0.45
          )
          .fromTo(
            "[data-hero='widget']",
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: 0.75 },
            0.52
          );

        gsap.to("[data-hero-parallax]", {
          yPercent: 10,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

        return () => {
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
      className="pt-2 pb-12 md:pt-4 md:pb-16"
    >
      <Container>
        {/* Full-width rounded hero photo with overlaid headline + two pill buttons on a soft scrim */}
        <div
          data-hero="image"
          className="relative min-h-[70svh] md:min-h-[80svh] w-full rounded-[24px] overflow-hidden bg-ink flex flex-col justify-end p-6 sm:p-10 md:p-14 pb-16 md:pb-24"
        >
          <div
            data-hero-parallax
            className="absolute inset-x-0 -top-[8%] h-[116%] w-full"
          >
            <Image
              src={sectionPhotography.heroPrimary}
              alt="Calm turquoise ocean horizon and sunlit sandy shore at dawn"
              fill
              preload
              fetchPriority="high"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              sizes="(min-width: 1440px) 1376px, 96vw"
              className="object-cover"
            />
          </div>

          {/* Soft bottom-left scrim so overlaid white typography has strong contrast */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10"
          />

          <div className="relative z-10 max-w-2xl space-y-5 text-white">
            <div data-hero="eyebrow">
              <Link
                href="/#destinations"
                className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/25 pl-1.5 pr-3.5 py-1 text-xs font-medium text-white hover:bg-white/25 transition-colors"
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
              className="text-[clamp(2.25rem,5.5vw,4.5rem)] font-medium tracking-[-0.03em] leading-[1.06] text-white"
            >
              Every journey, arranged with quiet precision.
            </h1>

            <p
              data-hero="sub"
              className="max-w-lg text-base text-white/85 leading-[1.6]"
            >
              Visas, flights, handpicked stays, and private cars organized in one calm place with transparent pricing.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-3">
              <div data-hero="cta">
                <Link
                  href="/visa"
                  className="inline-flex min-h-12 items-center gap-3 rounded-full bg-white pl-5 pr-2 py-2 text-sm font-medium text-[#0A0A0A] transition-opacity hover:opacity-90"
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
                  className="inline-flex min-h-12 items-center gap-3 rounded-full bg-white/15 backdrop-blur-md border border-white/30 pl-5 pr-2 py-2 text-sm font-medium text-white transition-colors hover:bg-white/25"
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
        </div>

        {/* Overlapping tabbed search bar */}
        <div
          data-hero="widget"
          className="relative z-20 -mt-10 md:-mt-14 mx-auto max-w-5xl px-2 sm:px-4"
        >
          <SearchTabs />
        </div>
      </Container>
    </section>
  );
}
