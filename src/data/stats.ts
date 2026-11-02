import type { StatItem, ServiceSummary, ProcessStep } from "@/lib/types";

export const agencyStats: StatItem[] = [
  {
    id: "travelers",
    value: 10000,
    suffix: "+",
    label: "Travelers assisted",
    detail: "Individual, family, and business trips",
  },
  {
    id: "countries",
    value: 50,
    suffix: "+",
    label: "Countries covered",
    detail: "Visas, flights, stays, and local cars",
  },
  {
    id: "partners",
    value: 120,
    suffix: "+",
    label: "Airline & hotel partners",
    detail: "Direct booking across major routes",
  },
  {
    id: "support",
    value: 24,
    suffix: "/7",
    label: "Customer support",
    detail: "Help before and during your trip",
  },
];

export const servicesOverview: ServiceSummary[] = [
  {
    id: "visa",
    number: "01",
    title: "Visas",
    eyebrow: "Document check",
    description: "Tourist, business, student, and transit visa applications with clear checklists.",
    href: "/visa",
    statLabel: "From 2 days",
    image: "/images/services/visa-passport.jpg",
    highlights: ["Document review", "Fast filing"],
  },
  {
    id: "tickets",
    number: "02",
    title: "Flights",
    eyebrow: "One-way & return",
    description: "Direct and connecting flights in economy and business class with transparent fares.",
    href: "/tickets",
    statLabel: "Major airlines",
    image: "/images/services/flight-window.jpg",
    highlights: ["Flexible dates", "Baggage included"],
  },
  {
    id: "hotels",
    number: "03",
    title: "Hotels",
    eyebrow: "Handpicked stays",
    description: "Carefully selected 3, 4, and 5-star hotels in central neighborhoods and resorts.",
    href: "/hotels",
    statLabel: "3 to 5 stars",
    image: "/images/services/hotel-sanctuary.jpg",
    highlights: ["Verified stays", "Nightly rates"],
  },
  {
    id: "cars",
    number: "04",
    title: "Car Rental",
    eyebrow: "Airport & city pickup",
    description: "Economy cars, SUVs, vans, and convertibles ready when you land.",
    href: "/cars",
    statLabel: "Full insurance",
    image: "/images/services/car-touring.jpg",
    highlights: ["Airport pickup", "Clear pricing"],
  },
];

export const processSteps: ProcessStep[] = [
  {
    number: "01",
    title: "Choose your service",
    subtitle: "Step 1",
    description: "Pick a visa, flight, hotel, or rental car and enter your dates.",
    duration: "2 min",
  },
  {
    number: "02",
    title: "Review clear options",
    subtitle: "Step 2",
    description: "Compare processing times, flight schedules, nightly rates, or car specs side by side.",
    duration: "Instant",
  },
  {
    number: "03",
    title: "Submit your details",
    subtitle: "Step 3",
    description: "Fill in a short form with your travel details—no hidden fees at checkout.",
    duration: "5 min",
  },
  {
    number: "04",
    title: "Travel with support",
    subtitle: "Step 4",
    description: "Receive your confirmed itinerary and reach our team any time if plans change.",
    duration: "24/7",
  },
];

export const sectionPhotography = {
  heroPrimary: "/images/hero/coastal-horizon.jpg",
  heroSecondary: "/images/hero/alpine-lake-boat.jpg",
  aboutTall: "/images/about/island-lagoon.jpg",
  aboutOverlap: "/images/about/turquoise-boats.jpg",
  aboutAccent: "/images/about/coastal-retreat.jpg",
  ctaCollage: [
    {
      src: "/images/cta/sailing-yacht.jpg",
      alt: "White sailboat anchored on calm turquoise water",
    },
    {
      src: "/images/cta/palm-pool.jpg",
      alt: "Evening resort pool reflecting palm trees and warm pavilion lights",
    },
    {
      src: "/images/cta/coastal-cliffs.jpg",
      alt: "Sunlit whitewashed coastal steps overlooking the deep blue sea",
    },
  ],
} as const;
