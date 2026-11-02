"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { agencyStats, sectionPhotography } from "@/data/stats";
import { formatNumber, BLUR_DATA_URL } from "@/lib/utils";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { useReveal } from "@/hooks/useReveal";
import { Container } from "@/components/ui/Container";

export function WhyChooseUsSection() {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
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
      });
    },
    { scope }
  );

  return (
    <section
      id="why-us"
      ref={scope}
      aria-labelledby="why-us-heading"
      className="py-12 md:py-16 lg:py-20"
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left column: Tall photo + overlapping small image card */}
          <div className="lg:col-span-6 relative pb-8 sm:pb-0 sm:pr-16">
            <div
              data-reveal
              className="relative aspect-[4/5] w-full max-w-[460px] rounded-[24px] overflow-hidden border border-line bg-surface"
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
                  sizes="(min-width: 1024px) 460px, 92vw"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Overlapping white image card */}
            <Link
              href="/hotels"
              data-reveal
              className="group relative sm:absolute -mt-16 sm:mt-0 ml-auto sm:right-2 sm:top-1/2 sm:-translate-y-1/2 z-10 block w-[82%] sm:w-[250px] rounded-[20px] border border-line bg-surface p-3 transition-transform duration-300 hover:-translate-y-[calc(50%+3px)]"
            >
              <div className="relative aspect-[4/3] w-full rounded-[14px] overflow-hidden bg-surface-2">
                <Image
                  src={sectionPhotography.aboutOverlap}
                  alt="Green island cove surrounded by calm clear water"
                  fill
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  sizes="250px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span
                  aria-hidden="true"
                  className="absolute top-2.5 right-2.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface text-ink"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                </span>
              </div>
              <div className="mt-3 px-1 pb-1">
                <h3 className="text-sm font-medium text-ink">
                  Tailored Itineraries
                </h3>
                <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                  Visas, flights, stays, and local cars coordinated in one schedule.
                </p>
              </div>
            </Link>
          </div>

          {/* Right column: Copy + Counters + Supporting Image Card */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <p
                data-reveal
                className="text-[13px] font-medium text-ink-muted mb-1.5"
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
                className="mt-3 text-base text-ink-muted leading-[1.6]"
              >
                At Velora, we bring visa documentation, airline ticketing, curated hotel stays, and airport car rentals together under one roof—so every step of your trip is clear before you depart.
              </p>
            </div>

            {/* 4 Animated Counters in compact cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {agencyStats.map((stat) => {
                const finalFormatted = `${formatNumber(stat.value)}${stat.suffix}`;
                return (
                  <div
                    key={stat.id}
                    data-reveal
                    aria-label={`${finalFormatted} ${stat.label}`}
                    className="rounded-[20px] border border-line bg-surface p-4 flex flex-col justify-between"
                  >
                    <span
                      data-count={stat.value}
                      data-suffix={stat.suffix}
                      className="font-mono text-2xl md:text-3xl font-medium tracking-[-0.03em] text-ink"
                    >
                      {finalFormatted}
                    </span>
                    <div className="mt-3">
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
              className="rounded-[20px] border border-line bg-surface p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="relative h-16 w-24 shrink-0 rounded-[12px] overflow-hidden bg-surface-2">
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
                    Direct airline & hotel coordination
                  </p>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Transparent fares and verified check-in times across all routes.
                  </p>
                </div>
              </div>
              <Link
                href="/tickets"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-bg text-ink hover:border-ink transition-colors self-end sm:self-center"
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
