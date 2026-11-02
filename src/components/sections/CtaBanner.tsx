"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { sectionPhotography } from "@/data/stats";
import { testimonials } from "@/data/testimonials";
import { BLUR_DATA_URL } from "@/lib/utils";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { useReveal } from "@/hooks/useReveal";
import { Container } from "@/components/ui/Container";
import { MagneticButtonLink } from "@/components/ui/MagneticButton";

export function CtaBannerSection() {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        if (!scope.current) return;
        const photos = gsap.utils.toArray<HTMLElement>(
          "[data-cta-photo]",
          scope.current
        );
        if (!photos.length) return;
        gsap.fromTo(
          photos,
          { autoAlpha: 0, y: 28, scale: 0.94 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.85,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: scope.current,
              start: "top 85%",
              once: true,
            },
          }
        );
      });
    },
    { scope }
  );

  const [img1, img2, img3] = sectionPhotography.ctaCollage;
  const specialistAvatar = testimonials[0]?.avatar ?? "/images/people/clara-sterling.jpg";

  return (
    <section
      ref={scope}
      aria-labelledby="cta-banner-heading"
      className="py-12 md:py-16 lg:py-20"
    >
      <Container>
        <div className="rounded-[24px] border border-line bg-surface-2/75 p-6 sm:p-10 lg:p-12 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left / Center: Tilted 3-photo collage + "Have a Question?" */}
            <div className="lg:col-span-7 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
              <div className="relative w-full max-w-[300px] h-[320px] sm:h-[360px] shrink-0 mx-auto sm:mx-0">
                {/* Photo 1 - Top Right Tilted */}
                <div
                  data-cta-photo
                  className="absolute top-0 right-4 w-44 sm:w-48 aspect-[4/3] rounded-[18px] overflow-hidden border-2 border-surface shadow-sm rotate-6 z-20 bg-surface"
                >
                  <Image
                    src={img1.src}
                    alt={img1.alt}
                    fill
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    sizes="200px"
                    className="object-cover"
                  />
                </div>

                {/* Photo 2 - Middle Left Tilted */}
                <div
                  data-cta-photo
                  className="absolute top-20 left-0 w-44 sm:w-48 aspect-[4/3] rounded-[18px] overflow-hidden border-2 border-surface shadow-sm -rotate-6 z-10 bg-surface"
                >
                  <Image
                    src={img2.src}
                    alt={img2.alt}
                    fill
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    sizes="200px"
                    className="object-cover"
                  />
                </div>

                {/* Photo 3 - Bottom Left Tilted */}
                <div
                  data-cta-photo
                  className="absolute bottom-0 left-8 w-48 sm:w-52 aspect-[4/3] rounded-[18px] overflow-hidden border-2 border-surface shadow-sm rotate-3 z-30 bg-surface"
                >
                  <Image
                    src={img3.src}
                    alt={img3.alt}
                    fill
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    sizes="220px"
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Center Question Prompt */}
              <div
                data-reveal
                className="flex items-center gap-3.5 text-center sm:text-left"
              >
                <div>
                  <p className="text-2xl sm:text-3xl font-medium tracking-[-0.03em] leading-[1.1] text-ink">
                    Have a
                    <br />
                    Question?
                  </p>
                </div>
                <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-surface shrink-0 bg-surface">
                  <Image
                    src={specialistAvatar}
                    alt="Velora travel advisor"
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <Link
                  href="/#contact"
                  aria-label="Contact our travel team"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-bg hover:opacity-88 transition-opacity"
                >
                  <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
                </Link>
              </div>
            </div>

            {/* Right: One White Card */}
            <div className="lg:col-span-5" data-reveal>
              <div className="rounded-[20px] border border-line bg-surface px-6 py-10 sm:px-10 sm:py-12 text-center flex flex-col items-center justify-center space-y-5">
                <h2
                  id="cta-banner-heading"
                  className="text-[clamp(1.75rem,3vw,2.5rem)] font-medium tracking-[-0.03em] leading-[1.08] text-ink max-w-xs"
                >
                  Your Journey Awaits
                </h2>
                <p className="text-sm text-ink-muted max-w-xs leading-relaxed">
                  Let us arrange your visa, flights, hotel stay, and rental car into one seamless itinerary.
                </p>
                <div className="pt-1">
                  <MagneticButtonLink
                    href="/visa"
                    variant="primary"
                    size="lg"
                    withArrow
                  >
                    Start Planning Now
                  </MagneticButtonLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
