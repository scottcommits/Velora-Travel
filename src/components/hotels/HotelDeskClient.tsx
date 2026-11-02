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
  Sparkles,
  Check,
  Coffee,
} from "lucide-react";
import type { Hotel } from "@/lib/types";
import { hotelSearchSchema } from "@/lib/validators";
import { formatUsd, BLUR_DATA_URL } from "@/lib/utils";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { Card } from "@/components/ui/Card";
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
      {/* Cohesive Velora Hero Frame with Embedded Hotel Search Bar */}
      <div className="relative overflow-hidden rounded-[28px] border border-line bg-ink text-white">
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
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/48 to-black/32"
        />

        <div className="relative z-10 p-5 sm:p-7 md:p-9 flex flex-col justify-between gap-7">
          {/* Top Bar: Service Desk Switcher + Sanctuary Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <nav
              aria-label="Switch travel service desk"
              className="inline-flex flex-wrap items-center gap-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 p-1"
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
                        ? "inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-ink shadow-xs"
                        : "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-white/80 hover:text-white transition-colors"
                    }
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden="true" />
                    {tab.label}
                  </Link>
                );
              })}
            </nav>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-white">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden="true" />
              3★ to 5★ Curated Stays
            </span>
          </div>

          {/* Center Headline + 3 Sanctuary Perks */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-7 space-y-2.5">
              <h1 className="text-[clamp(2rem,3.6vw,3.1rem)] font-medium tracking-[-0.03em] leading-[1.06] text-white">
                Sanctuaries &amp; suites worth staying for.
              </h1>
              <p className="text-sm sm:text-[15px] text-white/85 leading-relaxed max-w-xl">
                Handpicked cliffside villas, historic ryokans, and design hotels—with daily breakfast, verified ratings, and transparent nightly rates.
              </p>
            </div>

            <div className="lg:col-span-5 grid grid-cols-3 gap-2.5">
              <div className="rounded-[16px] bg-white/12 backdrop-blur-md border border-white/20 p-3 text-left">
                <p className="font-mono text-lg sm:text-xl font-medium text-white">
                  4.8★
                </p>
                <p className="text-[11px] text-white/75 mt-0.5">
                  Avg. guest score
                </p>
              </div>
              <div className="rounded-[16px] bg-white/12 backdrop-blur-md border border-white/20 p-3 text-left">
                <p className="font-mono text-lg sm:text-xl font-medium text-white">
                  Free
                </p>
                <p className="text-[11px] text-white/75 mt-0.5">
                  Daily breakfast
                </p>
              </div>
              <div className="rounded-[16px] bg-white/12 backdrop-blur-md border border-white/20 p-3 text-left">
                <p className="font-mono text-lg sm:text-xl font-medium text-white">
                  Flex
                </p>
                <p className="text-[11px] text-white/75 mt-0.5">
                  48h cancellation
                </p>
              </div>
            </div>
          </div>

          {/* Embedded Unified Hotel Search Bar */}
          <SearchBarShell floating className="text-ink">
            <form
              onSubmit={handleDateSearch}
              noValidate
              className="grid grid-cols-1 md:grid-cols-12 items-center divide-y md:divide-y-0 md:divide-x divide-line"
            >
              <div className="md:col-span-4">
                <BarSelect
                  id="hotel-city-select"
                  label="Destination city"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                >
                  {cities.map((c) => (
                    <option key={c} value={c} className="bg-surface text-ink">
                      {c === "All" ? `All destinations (${cities.length - 1} cities)` : c}
                    </option>
                  ))}
                </BarSelect>
              </div>

              <div className="md:col-span-2">
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

              <div className="md:col-span-2">
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
                  Find Stays
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

      {/* Single Clean Star & Nightly Rate Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-line bg-surface p-3.5 sm:px-5">
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
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
              >
                {tier === "All"
                  ? "All Star Tiers"
                  : tier === 5
                    ? "5 ★ Luxury"
                    : tier === 4
                      ? "4 ★ Boutique"
                      : "3 ★ Comfort"}
              </FilterChip>
            ))}
          </div>

          <div className="hidden sm:block h-7 w-px bg-line" aria-hidden="true" />

          <PriceRangeSlider
            id="hotel-price-range"
            label="Max nightly rate"
            min={180}
            max={1000}
            step={20}
            value={maxPrice}
            onChange={setMaxPrice}
            className="w-52 sm:w-60"
          />
        </div>

        <div className="flex items-center gap-3 ml-auto text-xs text-ink-muted">
          <span aria-live="polite" className="font-mono">
            Showing{" "}
            <strong className="text-ink font-medium">{filteredHotels.length}</strong>{" "}
            {filteredHotels.length === 1 ? "property" : "properties"}
          </span>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-medium text-ink underline underline-offset-4 cursor-pointer"
            >
              Reset filters
            </button>
          ) : null}
        </div>
      </div>

      {/* Results — Curated Sanctuary & Suite Cards */}
      {isLoading ? (
        <CardSkeleton count={6} />
      ) : filteredHotels.length === 0 ? (
        <div className="rounded-[24px] border border-line bg-surface py-14 px-6 text-center space-y-3">
          <p className="text-sm text-ink-muted">
            No properties match your current nightly rate and star filters.
          </p>
          <Button variant="secondary" size="sm" onClick={clearFilters}>
            Show all hotels
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
              <Card
                key={hotel.id}
                data-hotel-card
                interactive
                padding="inset"
                className="group flex flex-col justify-between overflow-hidden rounded-[22px]"
              >
                <div>
                  {/* Suite Photography with Star Badge, Guest Score & Location Pin */}
                  <div className="relative aspect-[16/10] w-full rounded-[16px] overflow-hidden bg-surface-2">
                    <Image
                      src={hotel.image}
                      alt={`${hotel.name} in ${hotel.city}`}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 95vw"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/25"
                    />

                    {/* Top badges: Star Tier + Guest Rating */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                      <span
                        aria-label={`${hotel.stars} star hotel`}
                        className="inline-flex items-center gap-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 px-2.5 py-1 font-mono text-[11px] font-medium text-amber-300"
                      >
                        {"★".repeat(hotel.stars)}
                        <span className="text-white ml-0.5">{hotel.stars}-Star</span>
                      </span>

                      <span
                        aria-label={`Guest rating ${hotel.rating} out of 5`}
                        className="inline-flex items-center gap-1 rounded-full bg-surface/95 backdrop-blur-md px-2.5 py-1 font-mono text-[11px] font-semibold text-ink shadow-xs"
                      >
                        <Star className="h-3 w-3 fill-current text-ink" aria-hidden="true" />
                        {hotel.rating.toFixed(1)} · Exceptional
                      </span>
                    </div>

                    {/* Bottom Location Pin Pill */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-black/65 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-white">
                        <MapPin className="h-3 w-3 text-white/85 shrink-0" strokeWidth={1.7} aria-hidden="true" />
                        {hotel.city} · {hotel.neighborhood}
                      </span>
                    </div>
                  </div>

                  {/* Property Name + Stay Summary + Scannable Amenity Pills */}
                  <div className="px-2.5 pt-3.5 pb-2 space-y-2.5">
                    <div>
                      <h2 className="text-[18px] font-medium tracking-[-0.015em] text-ink">
                        {hotel.name}
                      </h2>
                      <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-ink-muted">
                        <Coffee className="h-3.5 w-3.5 text-ink" strokeWidth={1.6} aria-hidden="true" />
                        Breakfast included · Free 48h cancellation
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {hotel.amenities.map((amenity) => (
                        <span
                          key={amenity}
                          className="rounded-full bg-bg px-2.5 py-1 text-[11px] font-medium text-ink-muted border border-line/70"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Nightly Rate + Multi-Night Stay Total Bar */}
                <div className="mx-1 mb-1 mt-2 rounded-[14px] bg-bg/60 border border-line/70 px-3.5 py-2.5 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-lg font-semibold text-ink">
                        {formatUsd(hotel.pricePerNight)}
                      </span>
                      <span className="text-xs text-ink-muted">/ night</span>
                    </div>
                    <p className="font-mono text-[11px] text-ink-muted">
                      {formatUsd(totalStayUsd)} total for {stayNights}{" "}
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
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
