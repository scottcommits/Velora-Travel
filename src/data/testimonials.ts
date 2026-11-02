import type { Testimonial } from "@/lib/types";

export const testimonials: Testimonial[] = [
  {
    id: "t-1",
    quote:
      "Getting our Schengen visas and flights in one place saved us days of paperwork. Everything arrived on schedule.",
    author: "Clara Sterling",
    role: "London",
    route: "London to Milan",
    service: "Visa",
    rating: 5,
    avatar: "/images/people/clara-sterling.jpg",
    tripImage: "/images/destinations/santorini.jpg",
  },
  {
    id: "t-2",
    quote:
      "When our flight time changed, the team updated our hotel transfer before we even landed. Calm, reliable service.",
    author: "Tariq Al-Mansoor",
    role: "Dubai",
    route: "Dubai to Maldives",
    service: "Tickets",
    rating: 5,
    avatar: "/images/people/tariq-al-mansoor.jpg",
    tripImage: "/images/destinations/maldives.jpg",
  },
  {
    id: "t-3",
    quote:
      "The hotel recommendations in Istanbul were spot-on, and the price was lower than booking each piece separately.",
    author: "Elena Lindqvist",
    role: "Stockholm",
    route: "Stockholm to Istanbul",
    service: "Hotels",
    rating: 5,
    avatar: "/images/people/elena-lindqvist.jpg",
    tripImage: "/images/destinations/istanbul.jpg",
  },
  {
    id: "t-4",
    quote:
      "Our rental car was waiting at the terminal and the return took five minutes. Simple from start to finish.",
    author: "Julian Kwan",
    role: "Singapore",
    route: "Singapore to Kyoto",
    service: "Car Rental",
    rating: 5,
    avatar: "/images/people/julian-kwan.jpg",
    tripImage: "/images/destinations/kyoto.jpg",
  },
];
