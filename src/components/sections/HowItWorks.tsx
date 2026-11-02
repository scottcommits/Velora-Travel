"use client";

import { useRef } from "react";
import { processSteps } from "@/data/stats";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { useReveal } from "@/hooks/useReveal";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function HowItWorksSection() {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope);

  useGSAP(
    (_, contextSafe) => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const init = contextSafe
          ? contextSafe(() => {
              if (!scope.current) return;
              const line = scope.current.querySelector("[data-step-line]");
              if (!line) return;
              gsap.fromTo(
                line,
                { scaleX: 0, transformOrigin: "left center" },
                {
                  scaleX: 1,
                  duration: 1.1,
                  ease: "power2.out",
                  scrollTrigger: {
                    trigger: scope.current,
                    start: "top 80%",
                    once: true,
                  },
                }
              );
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
      id="how-it-works"
      ref={scope}
      aria-labelledby="how-it-works-heading"
      className="py-8 md:py-12 lg:py-14"
    >
      <Container>
        <SectionHeading
          id="how-it-works-heading"
          eyebrow="How it works"
          title="Four simple steps."
          subtitle="From selecting your dates to receiving your confirmed documents and itinerary."
        />

        <div className="mt-5 md:mt-6">
          {/* Subtle grey horizontal progress line (not black) */}
          <div className="h-px w-full bg-line/70 overflow-hidden mb-4">
            <div data-step-line className="h-full w-full bg-ink-muted/35" />
          </div>

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {processSteps.map((step) => (
              <li
                key={step.number}
                data-reveal
                className="rounded-[20px] border border-line bg-surface p-6 md:p-7 min-h-[210px] lg:min-h-[245px] flex flex-col justify-between gap-6"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-medium text-ink-muted">
                    {step.number}
                  </span>
                  <span className="rounded-full border border-line bg-bg px-3 py-1 font-mono text-[11px] text-ink-muted">
                    {step.duration}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium tracking-[-0.02em] text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
