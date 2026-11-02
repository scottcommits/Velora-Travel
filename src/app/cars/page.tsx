import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { cars } from "@/data/cars";
import { BLUR_DATA_URL } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { CarDeskClient } from "@/components/cars/CarDeskClient";

export const metadata: Metadata = {
  title: "Car Rental",
  description:
    "Rent economy cars, SUVs, vans, luxury sedans, and convertibles.",
};

const headerPhotos = [
  { src: "/images/services/car-touring.jpg", alt: "Touring car on coastal road" },
  { src: "/images/cars/porsche-911.jpg", alt: "Porsche grand tourer" },
  { src: "/images/cars/range-rover.jpg", alt: "Luxury SUV for mountain and coastal drives" },
];

export default function CarsPage() {
  return (
    <main id="main" className="flex-1 py-10 md:py-14">
      <Container className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center rounded-full border border-line bg-surface px-3 py-1 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
              Car Rental
            </span>
            <h1 className="text-[clamp(1.75rem,3vw+0.5rem,2.75rem)] font-medium tracking-[-0.03em] leading-[1.08] text-ink">
              Drive at your own pace.
            </h1>
            <p className="text-sm md:text-[15px] text-ink-muted leading-[1.55]">
              Airport-ready vehicles with transparent daily rates, insurance included, and zero hidden counter fees.
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
                <span className="sr-only">Vehicle preview {idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <Suspense fallback={<CardSkeleton count={6} />}>
          <CarDeskClient initialCars={cars} />
        </Suspense>
      </Container>
    </main>
  );
}
