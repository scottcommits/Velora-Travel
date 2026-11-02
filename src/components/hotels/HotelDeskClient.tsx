"use client";

import { useState, useMemo, useRef, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  MapPin,
  Stamp,
  Plane,
  Building2,
  CarFront,
  Check,
} from "lucide-react";
import type { Hotel } from "@/lib/types";
import { hotelSearchSchema } from "@/lib/validators";
import { formatUsd, BLUR_DATA_URL, cn } from "@/lib/utils";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { Button } from "@/components/ui/Button";
import {
  SearchBarShell,
  BarSelect,
  BarDate,
  BarInput,
  BarSubmitButton,
  PriceRangeSlider,
  FilterChip,
} from "@/components/ui/FormFields";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

const SERVICE_TABS = [
  { label: "Visas", href: "/visa", icon: Stamp, active: false },
  { label: "Flights", href: "/tickets", icon: Plane, active: false },
  { label: "Hotels", href: "/hotels", icon: Building2, active: true },
  { label: "Car Rental", href: "/cars", icon: CarFront, active: false },
];

export function HotelDeskClient({ initialHotels }: { initialHotels: Hotel[] }) {
  const searchParams = useSearchParams();
  const { notify } = useToast();
  const gridRef = useRef<HTMLDivElement>(null);

  const [cityFilter, setCityFilter] = useState(
    () => searchParams.get("city") || "All"
  );
  const [maxPrice, setMaxPrice] = useState<number>(() => {
    const param = Number(searchParams.get("maxPrice"));
    return param >= 180 && param <= 1000 ? param : 1000;
  });
  const [starFilter, setStarFilter] = useState<number | "All">(() => {
    const param = Number(searchParams.get("stars"));
    return param === 3 || param === 4 || param === 5 ? param : "All";
  });

  const [checkIn, setCheckIn] = useState("2026-11-20");
  const [checkOut, setCheckOut] = useState("2026-11-25");
  const [guests, setGuests] = useState(2);
  const [dateError, setDateError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [bookedHotelId, setBookedHotelId] = useState<string | null>(null);

  const cities = useMemo(
    () => ["All", ...Array.from(new Set(initialHotels.map((h) => h.city)))],
    [initialHotels]
  );

  const stayNights = useMemo(() => {
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 5;
    return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  }, [checkIn, checkOut]);

  const filteredHotels = useMemo(() => {
    return initialHotels.filter((hotel) => {
      const matchCity =
        cityFilter === "All" ||
        hotel.city.toLowerCase().includes(cityFilter.toLowerCase());
      const matchPrice = hotel.pricePerNight <= maxPrice;
      const matchStars = starFilter === "All" || hotel.stars === starFilter;
      return matchCity && matchPrice && matchStars;
    });
  }, [initialHotels, cityFilter, maxPrice, starFilter]);

  useGSAP(
    () => {
      if (isLoading || !gridRef.current) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const cards = gsap.utils.toArray<HTMLElement>(
          "[data-hotel-card]",
          gridRef.current!
        );
        if (!cards.length) return;
        gsap.fromTo(
          cards,
          { autoAlpha: 0, y: 18 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.05,
            ease: "power3.out",
            overwrite: true,
          }
        );
      });
    },
    { scope: gridRef, dependencies: [filteredHotels, isLoading] }
  );

  const handleDateSearch = (e: FormEvent) => {
    e.preventDefault();
    setDateError(null);
    const parsed = hotelSearchSchema.safeParse({
      destination: cityFilter,
      checkIn,
      checkOut,
      guests,
    });
    if (!parsed.success) {
      setDateError(parsed.error.issues[0]?.message ?? "Check your stay dates");
      return;
    }
    setIsLoading(true);
    window.setTimeout(() => {
      setIsLoading(false);
      notify({
        title: "Availability updated",
        description: `Showing rates for ${stayNights} night(s) (${guests} guests).`,
      });
    }, 350);
  };

  const clearFilters = () => {
    setCityFilter("All");
    setMaxPrice(1000);
    setStarFilter("All");
  };

  const handleBookHotel = (hotel: Hotel) => {
    setBookedHotelId(hotel.id);
    notify({
      title: `Suite requested: ${hotel.name}`,
      description: `${stayNights} nights in ${hotel.city} at ${formatUsd(hotel.pricePerNight * stayNights)} total.`,
    });
  };

  const hasActiveFilters =
    cityFilter !== "All" || maxPrice < 1000 || starFilter !== "All";

  return (
    <div className="space-y-6">
      {/* Expansive Panoramic Hotel Horizon Hero Stage (Full-span, spacious, non-boxed) */}
      <div className="relative min-h-[480px] rounded-[28px] border border-line bg-ink text-white p-4 sm:p-8 lg:p-10 flex flex-col justify-between gap-8">
        {/* Clipped background photo container */}
        <div className="absolute inset-0 z-0 rounded-[28px] overflow-hidden pointer-events-none">
          <Image
            src="/images/services/hotel-sanctuary.jpg"
            alt="Sunlit luxury resort suite terrace overlooking the sea"
            fill
            priority
            sizes="96vw"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            className="object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/35"
          />
        </div>

        {/* Top Header: Desk Switcher + Status Badge */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <nav
            aria-label="Switch travel service desk"
            className="inline-flex items-center gap-0.5 sm:gap-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 p-1 max-w-full overflow-x-auto no-scrollbar shrink-0 shadow-sm"
          >
            {SERVICE_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={tab.active ? "page" : undefined}
                  className={
                    tab.active
                      ? "inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-semibold text-[#0A0A0A] shadow-xs shrink-0 whitespace-nowrap"
                      : "inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-medium text-white/85 hover:text-white transition-colors shrink-0 whitespace-nowrap"
                  }
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.7} aria-hidden="true" />
                  {tab.label === "Car Rental" ? (
                    <>
                      <span className="sm:hidden">Cars</span>
                      <span className="hidden sm:inline">Car Rental</span>
                    </>
                  ) : (
                    <span>{tab.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          <span className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/25 px-3.5 py-1.5 text-xs font-medium text-white shrink-0">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            3★ to 5★ Handpicked Stays · Breakfast Included
          </span>
        </div>

        {/* Center Editorial Headline + Quick Destination Pills */}
        <div className="relative z-10 max-w-3xl space-y-3.5 my-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/25 px-3 py-1 text-xs font-medium text-white/95">
            <span>Verified boutique sanctuaries</span>
            <span className="hidden sm:inline-block h-1 w-1 rounded-full bg-white/60" />
            <span className="hidden sm:inline font-mono text-white/85">Best rate guaranteed</span>
          </div>
          <h1 className="text-[clamp(2.25rem,4.5vw,3.75rem)] font-medium tracking-[-0.03em] leading-[1.08] text-white">
            Places worth staying for.
          </h1>
          <p className="text-sm sm:text-base text-white/85 leading-relaxed max-w-2xl">
            Cliffside villas, historic ryokans, and architectural sanctuaries—with daily breakfast, verified guest reviews, and clear nightly rates.
          </p>

          {/* Quick Destination Pills */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-white/70 mr-1">Popular stays:</span>
            {["Santorini", "Kyoto", "Amalfi", "Bali", "Swiss Alps", "Reykjavik"].map((city) => {
              const isActive = cityFilter === city;
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => setCityFilter(city)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer backdrop-blur-md border",
                    isActive
                      ? "bg-white text-[#0A0A0A] border-white font-semibold shadow-xs"
                      : "bg-black/35 text-white/90 border-white/20 hover:bg-white/20 hover:text-white"
                  )}
                >
                  {city}
                </button>
              );
            })}
          </div>
        </div>

        {/* Full-Width Docked Search Bar (Spanning full container!) */}
        <div className="relative z-20">
          <SearchBarShell floating className="text-ink shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
            <form
              onSubmit={handleDateSearch}
              noValidate
              className="grid grid-cols-1 md:grid-cols-12 items-center divide-y md:divide-y-0 md:divide-x divide-line"
            >
              <div className="md:col-span-4">
                <BarSelect
                  id="hotel-city-select"
                  label="Destination"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                >
                  {cities.map((c) => (
                    <option key={c} value={c} className="bg-surface text-ink">
                      {c === "All" ? "All cities" : c}
                    </option>
                  ))}
                </BarSelect>
              </div>

              <div className="md:col-span-3">
                <BarDate
                  id="hotel-checkin"
                  label="Check-in"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <BarDate
                  id="hotel-checkout"
                  label="Check-out"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>

              <div className="md:col-span-1">
                <BarInput
                  id="hotel-guests"
                  label="Guests"
                  type="number"
                  min={1}
                  max={12}
                  value={guests}
                  onChange={(e) =>
                    setGuests(Math.max(1, Number(e.target.value) || 1))
                  }
                />
              </div>

              <div className="md:col-span-2 pt-2 md:pt-0 md:pl-2.5 flex justify-end border-none">
                <BarSubmitButton className="w-full justify-between">
                  Search Stays
                </BarSubmitButton>
              </div>
            </form>
          </SearchBarShell>
        </div>
      </div>

      {dateError ? (
        <p role="alert" className="text-xs font-medium text-error px-1">
          {dateError}
        </p>
      ) : null}

      {/* Sleek Single Filter Strip: City Quick Pills + Star Tiers + Nightly Slider */}
      <div className="rounded-[20px] border border-line bg-surface p-3.5 sm:px-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* City quick pills */}
          <div
            role="group"
            aria-label="Filter by destination city"
            className="flex flex-wrap items-center gap-1.5"
          >
            {cities.map((city) => {
              const active = cityFilter === city;
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => setCityFilter(city)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                    active
                      ? "bg-ink text-bg"
                      : "bg-bg text-ink-muted hover:text-ink border border-line/70"
                  )}
                >
                  {city === "All" ? "All Destinations" : city}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 ml-auto text-xs text-ink-muted">
            <span aria-live="polite" className="font-mono">
              <strong className="text-ink font-medium">{filteredHotels.length}</strong>{" "}
              {filteredHotels.length === 1 ? "stay" : "stays"}
            </span>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium text-ink underline underline-offset-4 cursor-pointer"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2.5 border-t border-line">
          <div
            role="group"
            aria-label="Filter by hotel star rating"
            className="flex flex-wrap items-center gap-1.5"
          >
            {(["All", 5, 4, 3] as const).map((tier) => (
              <FilterChip
                key={String(tier)}
                active={starFilter === tier}
                aria-pressed={starFilter === tier}
                onClick={() => setStarFilter(tier)}
                className="min-h-9 px-3.5 text-xs"
              >
                {tier === "All" ? "All stars" : `${tier} ★`}
              </FilterChip>
            ))}
          </div>

          <PriceRangeSlider
            id="hotel-price-range"
            label="Nightly max"
            min={180}
            max={1000}
            step={20}
            value={maxPrice}
            onChange={setMaxPrice}
            className="w-full sm:w-64"
          />
        </div>
      </div>

      {/* Editorial Hotel Image Cards — Clean, Minimal, Architectural Presentation */}
      {isLoading ? (
        <CardSkeleton count={6} />
      ) : filteredHotels.length === 0 ? (
        <div className="rounded-[22px] border border-line bg-surface py-14 px-6 text-center space-y-3">
          <p className="text-sm text-ink-muted">
            No hotels match your current price and star filters.
          </p>
          <Button variant="secondary" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredHotels.map((hotel) => {
            const isBooked = bookedHotelId === hotel.id;
            const totalStayUsd = hotel.pricePerNight * stayNights;

            return (
              <div
                key={hotel.id}
                data-hotel-card
                className="group flex flex-col justify-between overflow-hidden rounded-[22px] border border-line bg-surface transition-all duration-300 hover:border-ink/40 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(0,0,0,0.06)]"
              >
                <div>
                  {/* Full-bleed 16:10 Property Photography */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-2">
                    <Image
                      src={hotel.image}
                      alt={`${hotel.name} in ${hotel.city}`}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 95vw"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25"
                    />

                    {/* Top Floating Glass Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/92 backdrop-blur-md px-3 py-1 text-xs font-medium text-ink shadow-2xs">
                        <MapPin className="h-3 w-3 text-ink-muted shrink-0" strokeWidth={1.8} aria-hidden="true" />
                        {hotel.city}
                      </span>
                      <span
                        aria-label={`${hotel.stars} stars, rated ${hotel.rating}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-ink/85 backdrop-blur-md px-2.5 py-1 font-mono text-xs font-medium text-white shadow-2xs"
                      >
                        <Star className="h-3 w-3 fill-amber-300 text-amber-300" aria-hidden="true" />
                        {hotel.rating.toFixed(1)}
                        <span className="text-white/60 font-sans text-[11px]">({hotel.reviews})</span>
                      </span>
                    </div>

                    {hotel.badge ? (
                      <div className="absolute bottom-3 left-3">
                        <span className="rounded-full bg-black/65 backdrop-blur-md border border-white/20 px-2.5 py-0.5 text-[11px] font-medium text-white">
                          {hotel.badge}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {/* Clean Editorial Content */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-ink-muted">
                          {hotel.stars}-Star Luxury Sanctuary
                        </span>
                        <span className="text-ink-muted/40">•</span>
                        <span className="text-[11px] text-ink-muted">
                          {hotel.neighborhood}
                        </span>
                      </div>
                      <h2 className="text-[19px] font-medium tracking-[-0.02em] text-ink mt-0.5 leading-snug">
                        {hotel.name}
                      </h2>
                    </div>

                    {/* Curated Amenity Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {hotel.amenities.slice(0, 3).map((amenity) => (
                        <span
                          key={amenity}
                          className="rounded-full bg-bg px-2.5 py-1 text-[11.5px] font-medium text-ink-muted border border-line/60"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Hairline Rate & Booking Action */}
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 border-t border-line flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-xl font-semibold text-ink">
                        {formatUsd(hotel.pricePerNight)}
                      </span>
                      <span className="text-xs text-ink-muted">/ night</span>
                    </div>
                    <p className="text-[11px] text-ink-muted mt-0.5 font-mono">
                      {formatUsd(totalStayUsd)} total · {stayNights}{" "}
                      {stayNights === 1 ? "night" : "nights"}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    withArrow={!isBooked}
                    variant={isBooked ? "secondary" : "primary"}
                    onClick={() => handleBookHotel(hotel)}
                  >
                    {isBooked ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5" strokeWidth={2} />
                        Requested
                      </span>
                    ) : (
                      "Book Stay"
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
