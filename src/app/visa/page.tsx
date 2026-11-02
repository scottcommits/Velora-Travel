import { Suspense } from "react";
import type { Metadata } from "next";
import { visaOffers } from "@/data/visas";
import { Container } from "@/components/ui/Container";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { VisaDeskClient } from "@/components/visa/VisaDeskClient";

export const metadata: Metadata = {
  title: "Visas",
  description:
    "Tourist, business, transit, and student visa applications with clear processing times and pricing.",
};

export default function VisaPage() {
  return (
    <main id="main" className="flex-1 pt-2 pb-12 md:pb-16">
      <Container>
        <Suspense fallback={<CardSkeleton count={6} />}>
          <VisaDeskClient offers={visaOffers} />
        </Suspense>
      </Container>
    </main>
  );
}
