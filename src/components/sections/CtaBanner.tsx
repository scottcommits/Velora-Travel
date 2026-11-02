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
          className="relative rounded-[24px] border border-line bg-surface-2/80 min-h-[440px] sm:min-h-[500px] lg:min-h-[560px] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12 flex items-center overflow-hidden"
        >
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
            {/* Left / Center composition: 3 overlapping tilted photos bleeding across edges + vertically centered "Have a Question?" */}
            <div className="lg:col-span-7 relative min-h-[360px] sm:min-h-[440px] lg:min-h-[480px] flex items-center">
              <div className="relative w-full h-[350px] sm:h-[430px] lg:h-[470px] flex items-center">
                {/* Photo 1 - Top Center-Left Tilted, overlapping top edge and Photo 2 */}
                <div
                  ref={ctaPhotoRef1}
                  data-cta-photo
                  className="absolute -top-12 sm:-top-16 left-16 sm:left-28 lg:left-32 w-56 sm:w-68 lg:w-76 aspect-[4/3] rounded-[22px] overflow-hidden border-[3px] border-surface bg-surface shadow-[0_14px_34px_rgba(0,0,0,0.12)] rotate-[9deg] z-[2]"
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
                  className="absolute top-1/2 -translate-y-1/2 -left-10 sm:-left-14 w-56 sm:w-68 lg:w-76 aspect-[4/3] rounded-[22px] overflow-hidden border-[3px] border-surface bg-surface shadow-[0_14px_34px_rgba(0,0,0,0.12)] -rotate-[10deg] z-[1]"
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
                  className="absolute -bottom-12 sm:-bottom-16 left-4 sm:left-12 lg:left-14 w-60 sm:w-72 lg:w-80 aspect-[4/3] rounded-[22px] overflow-hidden border-[3px] border-surface bg-surface shadow-[0_16px_38px_rgba(0,0,0,0.14)] rotate-[6deg] z-[3]"
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

                {/* Integrated "Have a Question?" lockup vertically centered in the middle of the band */}
                <div
                  data-reveal
                  className="absolute right-0 sm:right-2 lg:right-4 top-1/2 -translate-y-1/2 z-[5] inline-flex items-center gap-3 rounded-2xl bg-surface/90 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none p-2.5 sm:p-0 border border-line/60 sm:border-none"
                >
                  <p className="text-2xl sm:text-3xl lg:text-[36px] font-medium tracking-[-0.03em] leading-[1.06] text-ink text-right">
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

            {/* Right: Vertically Centered White Card */}
            <div className="lg:col-span-5 relative z-[5] flex justify-center lg:justify-end items-center" data-reveal>
              <div className="w-full max-w-md min-h-[340px] lg:min-h-[410px] rounded-[20px] border border-line bg-surface px-6 py-10 sm:px-9 sm:py-12 text-center flex flex-col items-center justify-center space-y-4">
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
