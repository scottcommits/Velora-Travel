export interface NavItem {
  label: string;
  href: string;
}

export const primaryNav: NavItem[] = [
  { label: "Visas", href: "/visa" },
  { label: "Flights", href: "/tickets" },
  { label: "Hotels", href: "/hotels" },
  { label: "Cars", href: "/cars" },
  { label: "Destinations", href: "/#destinations" },
  { label: "Contact", href: "/#contact" },
];

export const footerLinks = {
  services: [
    { label: "Visas", href: "/visa" },
    { label: "Flights", href: "/tickets" },
    { label: "Hotels", href: "/hotels" },
    { label: "Car Rental", href: "/cars" },
  ],
  company: [
    { label: "Destinations", href: "/#destinations" },
    { label: "Why Us", href: "/#why-us" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Reviews", href: "/#testimonials" },
  ],
  support: [
    { label: "Contact", href: "/#contact" },
    { label: "Business Visas", href: "/visa?type=Business" },
    { label: "Group Travel", href: "/#contact" },
    { label: "Travel Requirements", href: "/visa" },
  ],
};
