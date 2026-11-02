export type VisaType = "Tourist" | "Business" | "Transit" | "Student";

export interface VisaOffer {
  id: string;
  country: string;
  region: string;
  flag: string;
  image: string;
  visaType: VisaType;
  processingDays: string;
  priceUsd: number;
  validity: string;
  entry: "Single" | "Multiple";
  highlights: string[];
}

export interface Flight {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  durationMinutes: number;
  stops: 0 | 1 | 2;
  stopCity?: string;
  priceUsd: number;
  cabin: "Economy" | "Business";
  baggage: string;
}

export interface Hotel {
  id: string;
  name: string;
  city: string;
  country: string;
  neighborhood: string;
  image: string;
  stars: 3 | 4 | 5;
  rating: number;
  reviews: number;
  pricePerNight: number;
  amenities: string[];
  badge?: string;
}

export type CarCategory = "Economy" | "SUV" | "Luxury" | "Van" | "Convertible";

export interface Car {
  id: string;
  name: string;
  brand: string;
  image: string;
  category: CarCategory;
  seats: number;
  transmission: "Automatic" | "Manual";
  pricePerDay: number;
  fuel: string;
  luggage: number;
  features: string[];
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  tagline: string;
  image: string;
  priceFrom: number;
  duration: string;
  bestSeason: string;
  rating: number;
  visaQuickInfo: string;
}

export interface StatItem {
  id: string;
  value: number;
  suffix: string;
  label: string;
  detail: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  route: string;
  service: "Visa" | "Tickets" | "Hotels" | "Car Rental";
  rating: number;
  avatar: string;
  tripImage: string;
}

export interface ServiceSummary {
  id: "visa" | "tickets" | "hotels" | "cars";
  number: string;
  title: string;
  eyebrow: string;
  description: string;
  href: string;
  statLabel: string;
  image: string;
  highlights: string[];
}

export interface ProcessStep {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
}
