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
import { useWebGLImage } from "@/hooks/useWebGLImage";
import { Container } from "@/components/ui/Container";
import { MagneticButtonLink } from "@/components/ui/MagneticButton";

export function CtaBannerSection() {
  const scope = useRef<HTMLElement>(null);
  const [img1, img2, img3] = sectionPhotography.ctaCollage;
  const ctaPhotoRef1 = useWebGLImage<HTMLDivElement>("cta-photo-1", img1.src, 20);
  const ctaPhotoRef2 = useWebGLImage<HTMLDivElement>("cta-photo-2", img2.src, 20);
  const ctaPhotoRef3 = useWebGLImage<HTMLDivElement>("cta-photo-3", img3.src, 20);

  useReveal(scope);

  useGSAP(
    (_, contextSafe) => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const init = contextSafe
          ? contextSafe(() => {
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
            })
          : () => {};
        const rafId = requestAnimationFrame(init);
        return () => cancelAnimationFrame(rafId);
      });
    },
    { scope }
  );

  const specialistAvatar = testimonials[0]?.avatar ?? "/images/people/clara-sterling.jpg";

  return (
    <section
      ref={scope}
      aria-labelledby="cta-banner-heading"
      className="py-8 md:py-12 lg:py-14"
    >
      <Container>
        <div
          data-webgl-clip
          className="relative rounded-[24px] border border-line bg-surface-2/80 p-5 sm:p-8 lg:p-10 overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 items-center">
            {/* Left / Center composition: 3 larger tilted photos overlapping container edges + integrated "Have a Question?" */}
            <div className="lg:col-span-7 relative min-h-[340px] sm:min-h-[410px] lg:min-h-[440px] flex items-center">
              {/* 3 Tilted Photos bleeding across left/top/bottom container edges */}
              <div className="relative w-full h-[320px] sm:h-[400px] lg:h-[440px]">
                {/* Photo 1 - Top Tilted, overlapping top edge */}
                <div
                  ref={ctaPhotoRef1}
                  data-cta-photo
                  className="absolute -top-8 sm:-top-12 left-14 sm:left-24 lg:left-28 w-52 sm:w-64 lg:w-72 aspect-[4/3] rounded-[20px] overflow-hidden border-2 border-surface bg-surface rotate-[7deg] z-[1]"
                >
                  <Image
                    src={img1.src}
                    alt={img1.alt}
                    fill
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    sizes="(min-width: 1024px) 288px, 240px"
                    className="object-cover"
                  />
                </div>

                {/* Photo 2 - Middle Left Tilted, overlapping left edge */}
                <div
                  ref={ctaPhotoRef2}
                  data-cta-photo
                  className="absolute top-14 sm:top-20 -left-8 sm:-left-12 w-52 sm:w-64 lg:w-72 aspect-[4/3] rounded-[20px] overflow-hidden border-2 border-surface bg-surface -rotate-[8deg] z-0"
                >
                  <Image
                    src={img2.src}
                    alt={img2.alt}
                    fill
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    sizes="(min-width: 1024px) 288px, 240px"
                    className="object-cover"
                  />
                </div>

                {/* Photo 3 - Bottom Left Tilted, overlapping bottom/left edge */}
                <div
                  ref={ctaPhotoRef3}
                  data-cta-photo
                  className="absolute -bottom-8 sm:-bottom-12 left-2 sm:left-6 w-56 sm:w-68 lg:w-76 aspect-[4/3] rounded-[20px] overflow-hidden border-2 border-surface bg-surface rotate-[4deg] z-[1]"
                >
                  <Image
                    src={img3.src}
                    alt={img3.alt}
                    fill
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    sizes="(min-width: 1024px) 304px, 250px"
                    className="object-cover"
                  />
                </div>

                {/* Integrated "Have a Question?" lockup anchored into the right side of the collage composition */}
                <div
                  data-reveal
                  className="absolute right-0 sm:right-2 lg:right-4 bottom-3 sm:bottom-1/2 sm:translate-y-8 z-[5] inline-flex items-center gap-3 rounded-2xl bg-surface/85 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none p-2.5 sm:p-0 border border-line/60 sm:border-none"
                >
                  <p className="text-2xl sm:text-3xl lg:text-[34px] font-medium tracking-[-0.03em] leading-[1.06] text-ink text-right">
                    Have a
                    <br />
                    Question?
                  </p>
                  <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full overflow-hidden border-2 border-surface shrink-0 bg-surface">
                    <Image
                      src={specialistAvatar}
                      alt="Velora travel advisor"
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <Link
                    href="/#contact"
                    aria-label="Contact our travel team"
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-bg hover:opacity-88 transition-opacity"
                  >
                    <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Centered White Card */}
            <div className="lg:col-span-5 relative z-[5] flex justify-center lg:justify-end" data-reveal>
              <div className="w-full max-w-md rounded-[20px] border border-line bg-surface px-6 py-8 sm:px-8 sm:py-10 text-center flex flex-col items-center justify-center space-y-4">
                <h2
                  id="cta-banner-heading"
                  className="text-[clamp(1.75rem,3vw,2.5rem)] font-medium tracking-[-0.03em] leading-[1.06] text-ink max-w-xs"
                >
                  Your Journey Awaits
                </h2>
                <p className="text-sm text-ink-muted max-w-xs leading-snug">
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
