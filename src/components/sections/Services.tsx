"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { servicesOverview } from "@/data/stats";
import type { ServiceSummary } from "@/lib/types";
import { cn } from "@/lib/utils";
import { gsap, useGSAP, MOTION_OK, HOVER_FINE } from "@/lib/gsap";
import { useReveal } from "@/hooks/useReveal";
import { Container } from "@/components/ui/Container";

function ServiceItem({ item, index }: { item: ServiceSummary; index: number }) {
  const itemRef = useRef<HTMLAnchorElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const mm = gsap.matchMedia();
      mm.add(`${HOVER_FINE} and ${MOTION_OK}`, () => {
        const el = itemRef.current;
        if (!el || !contextSafe) return;
        const arrow = el.querySelector("[data-service-arrow]");

        const enter = contextSafe(() => {
          gsap.to(el, { y: -4, duration: 0.3, ease: "power2.out" });
          if (arrow) gsap.to(arrow, { rotate: -35, duration: 0.3, ease: "power2.out" });
        });

        const leave = contextSafe(() => {
          gsap.to(el, { y: 0, duration: 0.35, ease: "power2.out" });
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

  // Desktop stagger matching the reference: card 1 sits lower, card 2 sits higher, card 3 sits lower, card 4 sits higher
  const sitsLower = index % 2 === 0;

  return (
    <Link
      ref={itemRef}
      href={item.href}
      data-reveal
      className={cn(
        "group relative flex flex-col justify-between rounded-[20px] border border-line bg-surface p-6 md:p-7 min-h-[260px] lg:min-h-[300px] transition-colors hover:border-ink/40",
        sitsLower ? "lg:mt-9" : "lg:mb-9"
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[19px] lg:text-[20px] font-medium tracking-[-0.02em] leading-snug text-ink pt-1">
            {item.title}
          </h3>
          <span
            data-service-arrow
            aria-hidden="true"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/75 bg-transparent text-ink group-hover:bg-ink group-hover:text-bg group-hover:border-ink transition-colors"
          >
            <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
          </span>
        </div>

        <p className="mt-7 text-[14.5px] text-ink-muted leading-[1.52] max-w-[27ch]">
          {item.description}
        </p>
      </div>

      <div className="pt-8 flex flex-wrap items-center gap-2">
        {item.highlights.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded-full border border-line bg-surface px-3.5 py-1 text-xs font-medium text-ink-muted"
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
        <div className="mb-6 md:mb-8">
          <h2
            id="services-heading"
            data-reveal
            className="text-[clamp(1.75rem,3.2vw,2.75rem)] font-medium tracking-[-0.03em] leading-[1.06] text-ink"
          >
            What We Offer
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3.5 items-start">
          {servicesOverview.map((service, idx) => (
            <ServiceItem key={service.id} item={service} index={idx} />
          ))}
        </div>
      </Container>
    </section>
  );
}
