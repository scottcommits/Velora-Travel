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
            {/* Left / Center composition: 3 overlapping tilted photos bleeding across edges + integrated "Have a Question?" */}
            <div className="lg:col-span-7 relative min-h-[340px] sm:min-h-[410px] lg:min-h-[440px] flex items-center">
              <div className="relative w-full h-[320px] sm:h-[400px] lg:h-[440px]">
                {/* Photo 1 - Top Center-Right Tilted, overlapping top edge and Photo 2 */}
                <div
                  ref={ctaPhotoRef1}
                  data-cta-photo
                  className="absolute -top-10 sm:-top-14 left-20 sm:left-32 lg:left-36 w-56 sm:w-68 lg:w-76 aspect-[4/3] rounded-[22px] overflow-hidden border-[3px] border-surface bg-surface shadow-[0_14px_34px_rgba(0,0,0,0.12)] rotate-[9deg] z-[2]"
                >
                  <Image
                    src={img1.src}
                    alt={img1.alt}
                    fill
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    sizes="(min-width: 1024px) 304px, 250px"
                    className="object-cover"
                  />
                </div>

                {/* Photo 2 - Middle Left Tilted, overlapping left edge and tucked under Photo 1 & 3 */}
                <div
                  ref={ctaPhotoRef2}
                  data-cta-photo
                  className="absolute top-12 sm:top-16 -left-10 sm:-left-14 w-56 sm:w-68 lg:w-76 aspect-[4/3] rounded-[22px] overflow-hidden border-[3px] border-surface bg-surface shadow-[0_14px_34px_rgba(0,0,0,0.12)] -rotate-[10deg] z-[1]"
                >
                  <Image
                    src={img2.src}
                    alt={img2.alt}
                    fill
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    sizes="(min-width: 1024px) 304px, 250px"
                    className="object-cover"
                  />
                </div>

                {/* Photo 3 - Bottom Left-Center Tilted, overlapping bottom edge and overlapping Photo 2 */}
                <div
                  ref={ctaPhotoRef3}
                  data-cta-photo
                  className="absolute -bottom-10 sm:-bottom-14 left-6 sm:left-14 lg:left-16 w-60 sm:w-72 lg:w-80 aspect-[4/3] rounded-[22px] overflow-hidden border-[3px] border-surface bg-surface shadow-[0_16px_38px_rgba(0,0,0,0.14)] rotate-[6deg] z-[3]"
                >
                  <Image
                    src={img3.src}
                    alt={img3.alt}
                    fill
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    sizes="(min-width: 1024px) 320px, 260px"
                    className="object-cover"
                  />
                </div>

                {/* Integrated "Have a Question?" lockup overlapping the right edge of the photo collage */}
                <div
                  data-reveal
                  className="absolute right-0 sm:right-2 lg:right-4 bottom-4 sm:bottom-12 lg:bottom-16 z-[5] inline-flex items-center gap-3 rounded-2xl bg-surface/90 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none p-2.5 sm:p-0 border border-line/60 sm:border-none"
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
