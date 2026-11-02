import { Suspense } from "react";
import type { Metadata } from "next";
import { cars } from "@/data/cars";
import { Container } from "@/components/ui/Container";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { CarDeskClient } from "@/components/cars/CarDeskClient";

export const metadata: Metadata = {
  title: "Car Rental",
  description:
    "Rent economy cars, SUVs, vans, luxury sedans, and convertibles.",
};

export default function CarsPage() {
  return (
    <main id="main" className="flex-1 pt-20 pb-12 md:pb-16">
      <Container>
        <Suspense fallback={<CardSkeleton count={6} />}>
          <CarDeskClient initialCars={cars} />
        </Suspense>
      </Container>
    </main>
  );
}
