"use client";

import { useState, useMemo, useRef, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeftRight, Plane } from "lucide-react";
import type { Flight } from "@/lib/types";
import { popularAirports } from "@/data/flights";
import { destinations } from "@/data/destinations";
import { flightSearchSchema } from "@/lib/validators";
import { formatUsd, cn, BLUR_DATA_URL } from "@/lib/utils";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  SearchBarShell,
  BarSelect,
  BarDate,
  BarInput,
  BarSubmitButton,
  FilterChip,
} from "@/components/ui/FormFields";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

export function FlightDeskClient({ initialFlights }: { initialFlights: Flight[] }) {
  const searchParams = useSearchParams();
  const { notify } = useToast();
  const listRef = useRef<HTMLDivElement>(null);

  const [tripType, setTripType] = useState<"one-way" | "round-trip">(() =>
    searchParams.get("trip") === "one-way" ? "one-way" : "round-trip"
  );
  const [fromCity, setFromCity] = useState(
    () => searchParams.get("from") || "London"
  );
  const [toCity, setToCity] = useState(() => searchParams.get("to") || "Dubai");
  const [departDate, setDepartDate] = useState(
    () => searchParams.get("depart") || "2026-11-18"
  );
  const [returnDate, setReturnDate] = useState(
    () => searchParams.get("return") || "2026-11-26"
  );
  const [passengers, setPassengers] = useState(1);
  const [cabinFilter, setCabinFilter] = useState<"All" | "Economy" | "Business">(
    "All"
  );
  const [sortBy, setSortBy] = useState<"price" | "duration">("price");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);

  const destinationVisual = useMemo(() => {
    const matched = destinations.find(
      (d) => d.name.toLowerCase() === toCity.toLowerCase()
    );
    if (matched) {
      return {
        image: matched.image,
        title: `${matched.name}, ${matched.country}`,
        tagline: matched.tagline,
        flightHours: matched.duration,
      };
    }
    return {
      image: "/images/services/flight-window.jpg",
      title: `${fromCity} → ${toCity}`,
      tagline: "Verified international schedules with checked baggage included.",
      flightHours: "Direct & 1-stop",
    };
  }, [fromCity, toCity]);

  const results = useMemo(() => {
    const exact = initialFlights.filter(
      (f) =>
        f.from.toLowerCase() === fromCity.toLowerCase() &&
        f.to.toLowerCase() === toCity.toLowerCase()
    );

    const fromObj =
      popularAirports.find((a) => a.city === fromCity) || {
        city: fromCity,
        code: fromCity.slice(0, 3).toUpperCase(),
      };
    const toObj =
      popularAirports.find((a) => a.city === toCity) || {
        city: toCity,
        code: toCity.slice(0, 3).toUpperCase(),
      };

    const generated: Flight[] =
      exact.length >= 3
        ? exact
        : [
            ...exact,
            {
              id: `gen-1-${fromObj.code}-${toObj.code}`,
              airline: "Emirates",
              airlineCode: "EK",
              flightNumber: "EK 412",
              from: fromObj.city,
              fromCode: fromObj.code,
              to: toObj.city,
              toCode: toObj.code,
              departTime: "09:40",
              arriveTime: "18:15",
              duration: "6h 35m",
              durationMinutes: 395,
              stops: 0,
              priceUsd: 740,
              cabin: "Economy",
              baggage: "2 × 23kg checked",
            },
            {
              id: `gen-2-${fromObj.code}-${toObj.code}`,
              airline: "Qatar Airways",
              airlineCode: "QR",
              flightNumber: "QR 088",
              from: fromObj.city,
              fromCode: fromObj.code,
              to: toObj.city,
              toCode: toObj.code,
              departTime: "15:20",
              arriveTime: "23:40",
              duration: "6h 20m",
              durationMinutes: 380,
              stops: 0,
              priceUsd: 2490,
              cabin: "Business",
              baggage: "40kg checked",
            },
            {
              id: `gen-3-${fromObj.code}-${toObj.code}`,
              airline: "British Airways",
              airlineCode: "BA",
              flightNumber: "BA 294",
              from: fromObj.city,
              fromCode: fromObj.code,
              to: toObj.city,
              toCode: toObj.code,
              departTime: "21:10",
              arriveTime: "07:05+1",
              duration: "7h 55m",
              durationMinutes: 475,
              stops: 1,
              stopCity: "Geneva",
              priceUsd: 590,
              cabin: "Economy",
              baggage: "23kg checked",
            },
          ];

    return generated
      .filter((f) => cabinFilter === "All" || f.cabin === cabinFilter)
      .sort((a, b) =>
        sortBy === "price"
          ? a.priceUsd - b.priceUsd
          : a.durationMinutes - b.durationMinutes
      );
  }, [initialFlights, fromCity, toCity, cabinFilter, sortBy]);

  useGSAP(
    () => {
      if (isSearching || !listRef.current) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const cards = gsap.utils.toArray<HTMLElement>(
          "[data-flight-card]",
          listRef.current!
        );
        if (!cards.length) return;
        gsap.fromTo(
          cards,
          { autoAlpha: 0, y: 16 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.42,
            stagger: 0.05,
            ease: "power3.out",
            overwrite: true,
          }
        );
      });
    },
    { scope: listRef, dependencies: [results, isSearching, tripType] }
  );

  const onSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsed = flightSearchSchema.safeParse({
      tripType,
      from: fromCity,
      to: toCity,
      departDate,
      returnDate: tripType === "round-trip" ? returnDate : undefined,
      passengers,
      cabin: cabinFilter === "Business" ? "Business" : "Economy",
    });

    if (!parsed.success) {
      setFormError(
        parsed.error.issues[0]?.message ?? "Please check your flight search inputs."
      );
      return;
    }

    setIsSearching(true);
    window.setTimeout(() => {
      setIsSearching(false);
      notify({
        title: "Flights updated",
        description: `Showing ${results.length} options for ${fromCity} to ${toCity}.`,
      });
    }, 350);
  };

  const handleSelectFlight = (flight: Flight) => {
    setSelectedFlightId(flight.id);
    const multiplier = tripType === "round-trip" ? 1.85 : 1;
    const total = Math.round(flight.priceUsd * multiplier * passengers);
    notify({
      title: `Flight selected: ${flight.airline} (${flight.flightNumber})`,
      description: `${tripType === "round-trip" ? "Round-trip" : "One-way"} for ${passengers} passenger(s) at ${formatUsd(total)}.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Unified Search Bar */}
      <SearchBarShell>
        <form
          onSubmit={onSearchSubmit}
          noValidate
          className="grid grid-cols-1 md:grid-cols-12 items-center divide-y md:divide-y-0 md:divide-x divide-line"
        >
          <div className="md:col-span-3 flex items-center">
            <div className="flex-1 min-w-0">
              <BarSelect
                id="tickets-from"
                label="From"
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
              >
                {popularAirports.map((a) => (
                  <option key={a.code} value={a.city} className="bg-surface text-ink">
                    {a.city} ({a.code})
                  </option>
                ))}
              </BarSelect>
            </div>
            <button
              type="button"
              onClick={() => {
                setFromCity(toCity);
                setToCity(fromCity);
              }}
              aria-label="Swap origin and destination"
              className="mr-2 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-bg text-ink-muted hover:text-ink hover:border-ink transition-colors cursor-pointer"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
            </button>
          </div>

          <div className="md:col-span-3">
            <BarSelect
              id="tickets-to"
              label="To"
              value={toCity}
              onChange={(e) => setToCity(e.target.value)}
            >
              {popularAirports.map((a) => (
                <option key={a.code} value={a.city} className="bg-surface text-ink">
                  {a.city} ({a.code})
                </option>
              ))}
            </BarSelect>
          </div>

          <div className="md:col-span-2">
            <BarDate
              id="tickets-depart"
              label="Depart"
              value={departDate}
              onChange={(e) => setDepartDate(e.target.value)}
            />
          </div>

          {tripType === "round-trip" ? (
            <div className="md:col-span-2">
              <BarDate
                id="tickets-return"
                label="Return"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </div>
          ) : (
            <div className="md:col-span-2">
              <BarInput
                id="tickets-pax"
                label="Passengers"
                type="number"
                min={1}
                max={9}
                value={passengers}
                onChange={(e) =>
                  setPassengers(Math.max(1, Number(e.target.value) || 1))
                }
              />
            </div>
          )}

          <div className="md:col-span-2 pt-2 md:pt-0 md:pl-2.5 flex justify-end border-none">
            <BarSubmitButton className="w-full justify-between">
              Search
            </BarSubmitButton>
          </div>
        </form>
      </SearchBarShell>

      {formError ? (
        <p role="alert" className="text-xs font-medium text-error px-1">
          {formError}
        </p>
      ) : null}

      {/* Single Compact Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-line bg-surface px-4 py-3">
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <div
            role="radiogroup"
            aria-label="Trip type"
            className="flex items-center gap-1.5"
          >
            {(["round-trip", "one-way"] as const).map((mode) => (
              <FilterChip
                key={mode}
                role="radio"
                aria-checked={tripType === mode}
                active={tripType === mode}
                onClick={() => setTripType(mode)}
              >
                {mode === "round-trip" ? "Round-trip" : "One-way"}
              </FilterChip>
            ))}
          </div>

          <div className="hidden sm:block h-7 w-px bg-line" aria-hidden="true" />

          <div
            role="group"
            aria-label="Filter by cabin class"
            className="flex items-center gap-1.5"
          >
            {(["All", "Economy", "Business"] as const).map((cab) => (
              <FilterChip
                key={cab}
                active={cabinFilter === cab}
                aria-pressed={cabinFilter === cab}
                onClick={() => setCabinFilter(cab)}
              >
                {cab === "All" ? "All cabins" : cab}
              </FilterChip>
            ))}
          </div>

          <div className="hidden md:block h-7 w-px bg-line" aria-hidden="true" />

          <div
            role="group"
            aria-label="Sort flights"
            className="flex items-center gap-1.5"
          >
            <FilterChip
              active={sortBy === "price"}
              aria-pressed={sortBy === "price"}
              onClick={() => setSortBy("price")}
            >
              Lowest fare
            </FilterChip>
            <FilterChip
              active={sortBy === "duration"}
              aria-pressed={sortBy === "duration"}
              onClick={() => setSortBy("duration")}
            >
              Shortest time
            </FilterChip>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto text-xs text-ink-muted">
          <span aria-live="polite" className="font-mono">
            <strong className="text-ink font-medium">{results.length}</strong>{" "}
            {results.length === 1 ? "flight" : "flights"}
          </span>
        </div>
      </div>

      {/* Destination Photo Strip at top of results */}
      <div className="relative overflow-hidden rounded-[20px] border border-line bg-surface p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-28 sm:h-20 sm:w-36 shrink-0 overflow-hidden rounded-[14px] bg-surface-2">
            <Image
              src={destinationVisual.image}
              alt={destinationVisual.title}
              fill
              sizes="160px"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              className="object-cover"
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
                Route Spotlight · {fromCity} to {toCity}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-medium text-ink">
              {destinationVisual.title}
            </h2>
            <p className="text-xs text-ink-muted line-clamp-1">
              {destinationVisual.tagline}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:shrink-0">
          <Badge tone="neutral">{destinationVisual.flightHours}</Badge>
          <Badge tone="neutral">
            {tripType === "round-trip" ? "Return included" : "One-way fare"}
          </Badge>
        </div>
      </div>

      {/* Results — Compact horizontal flight rows */}
      {isSearching ? (
        <CardSkeleton count={3} />
      ) : (
        <div ref={listRef} className="space-y-3">
          {results.map((flight) => {
            const isRoundTrip = tripType === "round-trip";
            const displayPrice = Math.round(
              flight.priceUsd * (isRoundTrip ? 1.85 : 1)
            );
            const isSelected = selectedFlightId === flight.id;

            return (
              <Card
                key={flight.id}
                data-flight-card
                interactive
                padding="sm"
                className={cn(
                  "px-4 py-4 sm:px-5 sm:py-4",
                  isSelected && "border-ink"
                )}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  {/* Airline Logo-Initials Badge & Flight Info */}
                  <div className="lg:col-span-3 flex items-center gap-3.5">
                    <div
                      aria-hidden="true"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-line bg-bg font-mono text-xs font-semibold text-ink"
                    >
                      {flight.airlineCode}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[15px] font-medium text-ink truncate">
                          {flight.airline}
                        </h3>
                        <Badge tone="neutral">{flight.cabin}</Badge>
                      </div>
                      <p className="font-mono text-xs text-ink-muted mt-0.5">
                        {flight.flightNumber} · {flight.baggage}
                      </p>
                    </div>
                  </div>

                  {/* Schedule & Duration Line */}
                  <div className="lg:col-span-6 flex items-center justify-between gap-4 border-y lg:border-y-0 lg:border-x border-line py-3 lg:py-0 lg:px-6">
                    <div>
                      <p className="font-mono text-lg font-medium text-ink">
                        {flight.departTime}
                      </p>
                      <p className="text-xs text-ink-muted">
                        <span className="font-mono text-ink">{flight.fromCode}</span>{" "}
                        · {flight.from}
                      </p>
                    </div>

                    <div className="flex-1 flex flex-col items-center px-3 text-center max-w-[200px]">
                      <span className="font-mono text-[11px] text-ink-muted">
                        {flight.duration}
                      </span>
                      <div className="relative my-1.5 flex w-full items-center">
                        <div className="h-px w-full bg-line" />
                        <Plane
                          className="mx-1.5 h-3 w-3 shrink-0 text-ink-muted"
                          strokeWidth={1.6}
                          aria-hidden="true"
                        />
                        <div className="h-px w-full bg-line" />
                      </div>
                      <span className="text-[11px] text-ink-muted">
                        {flight.stops === 0
                          ? "Non-stop"
                          : `1 stop (${flight.stopCity})`}
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="font-mono text-lg font-medium text-ink">
                        {flight.arriveTime}
                      </p>
                      <p className="text-xs text-ink-muted">
                        <span className="font-mono text-ink">{flight.toCode}</span>{" "}
                        · {flight.to}
                      </p>
                    </div>
                  </div>

                  {/* Fare & Select Pill */}
                  <div className="lg:col-span-3 flex items-center justify-between lg:justify-end gap-4">
                    <div className="lg:text-right">
                      <p className="font-mono text-xl font-medium text-ink">
                        {formatUsd(displayPrice)}
                      </p>
                      <p className="text-[11px] text-ink-muted">
                        {isRoundTrip ? "Round-trip" : "One-way"} / pax
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant={isSelected ? "secondary" : "primary"}
                      onClick={() => handleSelectFlight(flight)}
                    >
                      {isSelected ? "Selected" : "Select"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
