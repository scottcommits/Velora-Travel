"use client";

import { useState, useMemo, useRef, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Star } from "lucide-react";
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
        description: `Showing rates for ${checkIn} to ${checkOut} (${guests} guests).`,
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
      title: `Booking requested: ${hotel.name}`,
      description: `${hotel.city} at ${formatUsd(hotel.pricePerNight)} per night.`,
    });
  };

  const hasActiveFilters =
    cityFilter !== "All" || maxPrice < 1000 || starFilter !== "All";

  return (
    <div className="space-y-6">
      {/* Unified Search Bar */}
      <SearchBarShell>
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
              Search
            </BarSubmitButton>
          </div>
        </form>
      </SearchBarShell>

      {dateError ? (
        <p role="alert" className="text-xs font-medium text-error px-1">
          {dateError}
        </p>
      ) : null}

      {/* Single Compact Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-line bg-surface px-4 py-3">
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          <PriceRangeSlider
            id="hotel-price-range"
            label="Nightly max"
            min={180}
            max={1000}
            step={20}
            value={maxPrice}
            onChange={setMaxPrice}
            className="w-52 sm:w-56"
          />

          <div className="hidden sm:block h-7 w-px bg-line" aria-hidden="true" />

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
                {tier === "All" ? "All stars" : `${tier} ★`}
              </FilterChip>
            ))}
          </div>
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
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {/* Hotel Image Cards (3 cols desktop, 2 tablet, 1 mobile, gap-4) */}
      {isLoading ? (
        <CardSkeleton count={6} />
      ) : filteredHotels.length === 0 ? (
        <div className="rounded-[20px] border border-line bg-surface py-14 px-6 text-center space-y-3">
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
            return (
              <Card
                key={hotel.id}
                data-hotel-card
                interactive
                padding="none"
                className="group flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-2">
                    <Image
                      src={hotel.image}
                      alt={`${hotel.name} in ${hotel.city}`}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 95vw"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-full bg-surface/92 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-ink">
                        {hotel.city} · {hotel.neighborhood}
                      </span>
                      <span
                        aria-label={`${hotel.stars} stars, rated ${hotel.rating}`}
                        className="inline-flex items-center gap-1 rounded-full bg-ink/85 backdrop-blur-md px-2.5 py-1 font-mono text-[11px] font-medium text-white"
                      >
                        <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                        {hotel.stars}★ · {hotel.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 space-y-1.5">
                    <h2 className="text-[17px] font-medium tracking-[-0.015em] text-ink">
                      {hotel.name}
                    </h2>
                    <p className="text-xs text-ink-muted line-clamp-1">
                      {hotel.amenities.join(" · ")}
                    </p>
                  </div>
                </div>

                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 border-t border-line flex items-center justify-between gap-3">
                  <div>
                    <span className="font-mono text-base font-medium text-ink">
                      {formatUsd(hotel.pricePerNight)}
                    </span>
                    <span className="text-xs text-ink-muted"> / night</span>
                  </div>

                  <Button
                    size="sm"
                    variant={isBooked ? "secondary" : "primary"}
                    onClick={() => handleBookHotel(hotel)}
                  >
                    {isBooked ? "Requested" : "Book"}
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
