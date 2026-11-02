import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { hotels } from "@/data/hotels";
import { BLUR_DATA_URL } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { HotelDeskClient } from "@/components/hotels/HotelDeskClient";

export const metadata: Metadata = {
  title: "Hotels",
  description:
    "Browse 3, 4, and 5-star hotels and filter by nightly rate and star rating.",
};

const headerPhotos = [
  { src: "/images/services/hotel-sanctuary.jpg", alt: "Sunlit resort suite terrace" },
  { src: "/images/hotels/caldera-suites-santorini.jpg", alt: "Caldera cliffside pool in Santorini" },
  { src: "/images/hotels/arashiyama-kyoto.jpg", alt: "Japanese ryokan garden suite in Kyoto" },
];

export default function HotelsPage() {
  return (
    <main id="main" className="flex-1 py-10 md:py-14">
      <Container className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center rounded-full border border-line bg-surface px-3 py-1 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
              Hotels &amp; Stays
            </span>
            <h1 className="text-[clamp(1.75rem,3vw+0.5rem,2.75rem)] font-medium tracking-[-0.03em] leading-[1.08] text-ink">
              Places worth staying for.
            </h1>
            <p className="text-sm md:text-[15px] text-ink-muted leading-[1.55]">
              Filter handpicked 3, 4, and 5-star properties by destination, nightly rate, and rating.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {headerPhotos.map((photo, idx) => (
              <div
                key={photo.src}
                className="relative h-16 w-24 sm:h-20 sm:w-28 overflow-hidden rounded-[16px] border border-line bg-surface-2"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="120px"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  className="object-cover"
                />
                <span className="sr-only">Stay preview {idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <Suspense fallback={<CardSkeleton count={6} />}>
          <HotelDeskClient initialHotels={hotels} />
        </Suspense>
      </Container>
    </main>
  );
}
