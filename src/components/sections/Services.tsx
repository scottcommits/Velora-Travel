"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { servicesOverview } from "@/data/stats";
import type { ServiceSummary } from "@/lib/types";
import { BLUR_DATA_URL, cn } from "@/lib/utils";
import { gsap, useGSAP, MOTION_OK, HOVER_FINE } from "@/lib/gsap";
import { useReveal } from "@/hooks/useReveal";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

function ServiceItem({ item, index }: { item: ServiceSummary; index: number }) {
  const itemRef = useRef<HTMLAnchorElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const mm = gsap.matchMedia();
      mm.add(`${HOVER_FINE} and ${MOTION_OK}`, () => {
        const el = itemRef.current;
        if (!el || !contextSafe) return;
        const img = el.querySelector("[data-service-img]");
        const arrow = el.querySelector("[data-service-arrow]");

        const enter = contextSafe(() => {
          if (img) gsap.to(img, { scale: 1.05, duration: 0.45, ease: "power2.out" });
          if (arrow) gsap.to(arrow, { rotate: 45, duration: 0.3, ease: "power2.out" });
        });

        const leave = contextSafe(() => {
          if (img) gsap.to(img, { scale: 1, duration: 0.45, ease: "power2.out" });
          if (arrow) gsap.to(arrow, { rotate: 0, duration: 0.3, ease: "power2.out" });
        });

        el.addEventListener("pointerenter", enter);
        el.addEventListener("pointerleave", leave);
        return () => {
          el.removeEventListener("pointerenter", enter);
          el.removeEventListener("pointerleave", leave);
        };
      });
    },
    { scope: itemRef }
  );

  const isOffset = index % 2 === 1;

  return (
    <Link
      ref={itemRef}
      href={item.href}
      data-reveal
      className={cn(
        "group relative flex flex-col justify-between rounded-[20px] border border-line bg-surface p-2 md:p-2.5 transition-colors hover:border-ink/40",
        isOffset && "lg:translate-y-7"
      )}
    >
      <div>
        {/* Inset photo at top (8-10px from card edge) */}
        <div className="relative aspect-[16/10] w-full rounded-[14px] overflow-hidden bg-surface-2">
          <Image
            data-service-img
            src={item.image}
            alt={`${item.title} — ${item.description}`}
            fill
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            sizes="(min-width: 1024px) 24vw, (min-width: 640px) 48vw, 94vw"
            className="object-cover"
          />
        </div>

        {/* Text area px-3 pb-3 with bigger circular arrow button */}
        <div className="px-3 pt-3 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="font-mono text-[11px] text-ink-muted block">
                {item.number} · {item.eyebrow}
              </span>
              <h3 className="text-lg font-medium tracking-[-0.02em] text-ink">
                {item.title}
              </h3>
            </div>
            <span
              data-service-arrow
              aria-hidden="true"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-bg text-ink group-hover:bg-ink group-hover:text-bg group-hover:border-ink transition-colors"
            >
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
            </span>
          </div>

          <p className="mt-2 text-sm text-ink-muted leading-snug">
            {item.description}
          </p>
        </div>
      </div>

      <div className="px-3 pb-3 pt-1 flex flex-wrap items-center gap-1.5">
        {item.highlights.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded-full border border-line bg-bg px-2.5 py-0.5 text-[11px] font-medium text-ink-muted"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}

export function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useReveal(sectionRef);

  return (
    <section
      id="services"
      ref={sectionRef}
      aria-labelledby="services-heading"
      className="py-8 md:py-12 lg:py-14"
    >
      <Container>
        <SectionHeading
          id="services-heading"
          eyebrow="What we offer"
          title="Four core travel services."
          subtitle="Book each service independently or combine them into a single itinerary."
        />

        <div className="mt-5 md:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:pb-7">
          {servicesOverview.map((service, idx) => (
            <ServiceItem key={service.id} item={service} index={idx} />
          ))}
        </div>
      </Container>
    </section>
  );
}
