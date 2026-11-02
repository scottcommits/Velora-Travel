import { Suspense } from "react";
import type { Metadata } from "next";
import { hotels } from "@/data/hotels";
import { Container } from "@/components/ui/Container";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { HotelDeskClient } from "@/components/hotels/HotelDeskClient";

export const metadata: Metadata = {
  title: "Hotels",
  description:
    "Browse 3, 4, and 5-star hotels and filter by nightly rate and star rating.",
};

export default function HotelsPage() {
  return (
    <main id="main" className="flex-1 pt-20 pb-12 md:pb-16">
      <Container>
        <Suspense fallback={<CardSkeleton count={6} />}>
          <HotelDeskClient initialHotels={hotels} />
        </Suspense>
      </Container>
    </main>
  );
}
