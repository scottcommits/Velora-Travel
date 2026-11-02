import { Suspense } from "react";
import type { Metadata } from "next";
import { mockFlights } from "@/data/flights";
import { Container } from "@/components/ui/Container";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { FlightDeskClient } from "@/components/tickets/FlightDeskClient";

export const metadata: Metadata = {
  title: "Flights",
  description:
    "Search one-way and round-trip flights in economy and business class.",
};

export default function TicketsPage() {
  return (
    <main id="main" className="flex-1 pt-2 pb-12 md:pb-16">
      <Container>
        <Suspense fallback={<CardSkeleton count={3} />}>
          <FlightDeskClient initialFlights={mockFlights} />
        </Suspense>
      </Container>
    </main>
  );
}
