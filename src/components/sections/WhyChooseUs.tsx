"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { agencyStats, sectionPhotography } from "@/data/stats";
import { formatNumber, BLUR_DATA_URL } from "@/lib/utils";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { useReveal } from "@/hooks/useReveal";
import { useWebGLImage } from "@/hooks/useWebGLImage";
import { Container } from "@/components/ui/Container";

export function WhyChooseUsSection() {
  const scope = useRef<HTMLElement>(null);
  const aboutWebGLRef = useWebGLImage<HTMLDivElement>(
    "about-tall",
    sectionPhotography.aboutTall,
    24
  );
  useReveal(scope);

  useGSAP(
    (_, contextSafe) => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const init = contextSafe
          ? contextSafe(() => {
              if (!scope.current) return;
              const counters = gsap.utils.toArray<HTMLElement>(
                "[data-count]",
                scope.current
              );
              counters.forEach((el) => {
                const end = Number(el.dataset.count ?? "0");
                const suffix = el.dataset.suffix ?? "";
                const state = { value: 0 };
                el.textContent = "0" + suffix;

                gsap.to(state, {
                  value: end,
                  duration: 1.6,
                  ease: "power2.out",
                  scrollTrigger: {
                    trigger: el,
                    start: "top 90%",
                    once: true,
                  },
                  onUpdate: () => {
                    el.textContent = formatNumber(Math.round(state.value)) + suffix;
                  },
                });
              });

              gsap.to("[data-about-parallax]", {
                yPercent: 8,
                ease: "none",
                scrollTrigger: {
                  trigger: scope.current,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                },
              });
            })
          : () => {};
        const rafId = requestAnimationFrame(init);
        return () => cancelAnimationFrame(rafId);
      });
    },
    { scope }
  );

  return (
    <section
      id="why-us"
      ref={scope}
      aria-labelledby="why-us-heading"
      className="py-8 md:py-12 lg:py-14"
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left column: Tall photo + overlapping small image card */}
          <div className="lg:col-span-5 relative pb-4 sm:pb-0 sm:pr-14">
            <div
              ref={aboutWebGLRef}
              data-reveal
              className="relative z-0 aspect-[4/5] w-full rounded-[24px] overflow-hidden border border-line bg-surface"
            >
              <div
                data-about-parallax
                className="absolute inset-x-0 -top-[6%] h-[112%] w-full"
              >
                <Image
                  src={sectionPhotography.aboutTall}
                  alt="Aerial view of boats anchored along a turquoise island lagoon"
                  fill
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  sizes="(min-width: 1024px) 38vw, 94vw"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Overlapping white image card - generously sized */}
            <Link
              href="/hotels"
              data-reveal
              className="group relative sm:absolute -mt-16 sm:mt-0 ml-auto sm:-right-4 lg:-right-6 sm:top-1/2 sm:-translate-y-1/2 z-[5] block w-[85%] sm:w-[290px] md:w-[315px] rounded-[22px] border border-line bg-surface p-2.5 sm:p-3 shadow-[0_18px_44px_rgba(0,0,0,0.1)] transition-transform duration-300 hover:-translate-y-[calc(50%+4px)]"
            >
              <div className="relative aspect-[16/11] w-full rounded-[16px] overflow-hidden bg-surface-2">
                <Image
                  src={sectionPhotography.aboutOverlap}
                  alt="Green island cove surrounded by calm clear water"
                  fill
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  sizes="(min-width: 640px) 315px, 85vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span
                  aria-hidden="true"
                  className="absolute top-2.5 right-2.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface/90 backdrop-blur-md text-ink shadow-xs"
                >
                  <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
                </span>
              </div>
              <div className="mt-2.5 px-1 pb-0.5 space-y-1">
                <h3 className="text-sm sm:text-[15.5px] font-semibold leading-tight text-ink">
                  Tailored Itineraries
                </h3>
                <p className="text-xs sm:text-[13px] text-ink-muted leading-relaxed">
                  Visas, flights, boutique stays, and private cars seamlessly coordinated in one itinerary.
                </p>
              </div>
            </Link>
          </div>

          {/* Right column: Copy + Counters + Supporting Image Card */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <p
                data-reveal
                className="text-[13px] font-medium text-ink-muted mb-1"
              >
                Why choose Velora
              </p>
              <h2
                id="why-us-heading"
                data-reveal
                className="text-[clamp(1.75rem,3.2vw,2.75rem)] font-medium tracking-[-0.03em] leading-[1.06] text-ink"
              >
                Thoughtful travel planning, handled end to end.
              </h2>
              <p
                data-reveal
                className="mt-2 text-base text-ink-muted leading-[1.55] max-w-2xl"
              >
                At Velora, we bring visa documentation, airline ticketing, curated hotel stays, and airport car rentals together under one roof—so every step of your trip is clear before you depart.
              </p>
            </div>

            {/* 4 Animated Counters in compact cards (gap-3, max 12px/16px padding) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {agencyStats.map((stat) => {
                const finalFormatted = `${formatNumber(stat.value)}${stat.suffix}`;
                return (
                  <div
                    key={stat.id}
                    data-reveal
                    aria-label={`${finalFormatted} ${stat.label}`}
                    className="rounded-[20px] border border-line bg-surface p-3 md:p-4 flex flex-col justify-between gap-2"
                  >
                    <span
                      data-count={stat.value}
                      data-suffix={stat.suffix}
                      className="font-mono text-2xl md:text-3xl font-medium tracking-[-0.03em] text-ink"
                    >
                      {finalFormatted}
                    </span>
                    <div>
                      <h3 className="text-xs font-medium text-ink">
                        {stat.label}
                      </h3>
                      <p className="mt-0.5 text-[11px] text-ink-muted leading-snug">
                        {stat.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Supporting visual row */}
            <div
              data-reveal
              className="rounded-[20px] border border-line bg-surface p-2.5 md:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-22 shrink-0 rounded-[12px] overflow-hidden bg-surface-2">
                  <Image
                    src={sectionPhotography.aboutAccent}
                    alt="Sunlit coastal steps overlooking the Mediterranean"
                    fill
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">
                    Direct airline &amp; hotel coordination
                  </p>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Transparent fares and verified check-in times across all routes.
                  </p>
                </div>
              </div>
              <Link
                href="/tickets"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-bg text-ink hover:border-ink transition-colors self-end sm:self-center"
                aria-label="Browse flights"
              >
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.6} />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
