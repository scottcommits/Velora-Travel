"use client";

import { useState, useMemo, useRef, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeftRight,
  Plane,
  Stamp,
  Building2,
  CarFront,
  Luggage,
  Sparkles,
  Check,
} from "lucide-react";
import type { Flight } from "@/lib/types";
import { popularAirports } from "@/data/flights";
import { destinations } from "@/data/destinations";
import { flightSearchSchema } from "@/lib/validators";
import { formatUsd, cn, BLUR_DATA_URL } from "@/lib/utils";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
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

const SERVICE_TABS = [
  { label: "Visas", href: "/visa", icon: Stamp, active: false },
  { label: "Flights", href: "/tickets", icon: Plane, active: true },
  { label: "Hotels", href: "/hotels", icon: Building2, active: false },
  { label: "Car Rental", href: "/cars", icon: CarFront, active: false },
];

const POPULAR_ROUTES = [
  { from: "London", to: "Dubai", code: "LHR ⇄ DXB" },
  { from: "London", to: "Tokyo", code: "LHR ⇄ HND" },
  { from: "Paris", to: "Cairo", code: "CDG ⇄ CAI" },
  { from: "New York", to: "Lisbon", code: "JFK ⇄ LIS" },
  { from: "Singapore", to: "Bali", code: "SIN ⇄ DPS" },
];

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

  const fromAirport = useMemo(
    () =>
      popularAirports.find((a) => a.city === fromCity) || {
        city: fromCity,
        code: fromCity.slice(0, 3).toUpperCase(),
      },
    [fromCity]
  );

  const toAirport = useMemo(
    () =>
      popularAirports.find((a) => a.city === toCity) || {
        city: toCity,
        code: toCity.slice(0, 3).toUpperCase(),
      },
    [toCity]
  );

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

    const generated: Flight[] =
      exact.length >= 3
        ? exact
        : [
            ...exact,
            {
              id: `gen-1-${fromAirport.code}-${toAirport.code}`,
              airline: "Emirates",
              airlineCode: "EK",
              flightNumber: "EK 412",
              from: fromAirport.city,
              fromCode: fromAirport.code,
              to: toAirport.city,
              toCode: toAirport.code,
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
              id: `gen-2-${fromAirport.code}-${toAirport.code}`,
              airline: "Qatar Airways",
              airlineCode: "QR",
              flightNumber: "QR 088",
              from: fromAirport.city,
              fromCode: fromAirport.code,
              to: toAirport.city,
              toCode: toAirport.code,
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
              id: `gen-3-${fromAirport.code}-${toAirport.code}`,
              airline: "British Airways",
              airlineCode: "BA",
              flightNumber: "BA 294",
              from: fromAirport.city,
              fromCode: fromAirport.code,
              to: toAirport.city,
              toCode: toAirport.code,
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
  }, [initialFlights, fromCity, toCity, fromAirport, toAirport, cabinFilter, sortBy]);

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
      {/* Cohesive Velora Hero Frame with Live Flight Route Display & Embedded Search */}
      <div className="relative overflow-hidden rounded-[28px] border border-line bg-ink text-white">
        <Image
          src="/images/services/flight-window.jpg"
          alt="View above the clouds from an aircraft cabin window"
          fill
          priority
          sizes="96vw"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          className="object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/35"
        />

        <div className="relative z-10 p-5 sm:p-7 md:p-9 flex flex-col justify-between gap-7">
          {/* Top Bar: Service Desk Switcher + Trip Type Toggle */}
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

            <div
              role="radiogroup"
              aria-label="Trip type"
              className="inline-flex items-center gap-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 p-1"
            >
              {(["round-trip", "one-way"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  role="radio"
                  aria-checked={tripType === mode}
                  onClick={() => setTripType(mode)}
                  className={cn(
                    "rounded-full px-3.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                    tripType === mode
                      ? "bg-white text-ink shadow-xs"
                      : "text-white/85 hover:text-white"
                  )}
                >
                  {mode === "round-trip" ? "Round-trip" : "One-way"}
                </button>
              ))}
            </div>
          </div>

          {/* Center Headline + Live Boarding Telemetry Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-7 space-y-2.5">
              <h1 className="text-[clamp(2rem,3.6vw,3.1rem)] font-medium tracking-[-0.03em] leading-[1.06] text-white">
                Direct &amp; one-stop flights with baggage included.
              </h1>
              <p className="text-sm sm:text-[15px] text-white/85 leading-relaxed max-w-xl">
                Compare verified Economy and Business Class boarding passes across full-service global carriers—no surprise cabin bag fees.
              </p>
            </div>

            <div className="lg:col-span-5 rounded-[20px] bg-white/14 backdrop-blur-md border border-white/25 p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-white/70">
                  Origin Airport
                </p>
                <p className="font-mono text-2xl sm:text-3xl font-semibold text-white tracking-tight mt-0.5">
                  {fromAirport.code}
                </p>
                <p className="text-xs text-white/80 truncate">{fromAirport.city}</p>
              </div>

              <div className="flex-1 flex flex-col items-center px-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-white/75">
                  {tripType === "round-trip" ? "Return Route" : "One-Way"}
                </span>
                <div className="my-1.5 flex w-full items-center">
                  <div className="h-px flex-1 border-t border-dashed border-white/45" />
                  <Plane className="mx-2 h-4 w-4 text-white shrink-0" strokeWidth={1.7} />
                  <div className="h-px flex-1 border-t border-dashed border-white/45" />
                </div>
                <span className="text-[11px] text-emerald-300 font-medium">
                  Baggage included
                </span>
              </div>

              <div className="text-right">
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-white/70">
                  Arrival Airport
                </p>
                <p className="font-mono text-2xl sm:text-3xl font-semibold text-white tracking-tight mt-0.5">
                  {toAirport.code}
                </p>
                <p className="text-xs text-white/80 truncate">{toAirport.city}</p>
              </div>
            </div>
          </div>

          {/* Embedded Unified Flight Search Bar */}
          <SearchBarShell floating className="text-ink">
            <form
              onSubmit={onSearchSubmit}
              noValidate
              className="grid grid-cols-1 md:grid-cols-12 items-center divide-y md:divide-y-0 md:divide-x divide-line"
            >
              <div className="md:col-span-3 flex items-center">
                <div className="flex-1 min-w-0">
                  <BarSelect
                    id="tickets-from"
                    label="Departing from"
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
                  className="mr-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-bg text-ink-muted hover:text-ink hover:border-ink transition-colors cursor-pointer"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
                </button>
              </div>

              <div className="md:col-span-3">
                <BarSelect
                  id="tickets-to"
                  label="Flying to"
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
                  label="Departure date"
                  value={departDate}
                  onChange={(e) => setDepartDate(e.target.value)}
                />
              </div>

              {tripType === "round-trip" ? (
                <div className="md:col-span-2">
                  <BarDate
                    id="tickets-return"
                    label="Return date"
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
                  Search Flights
                </BarSubmitButton>
              </div>
            </form>
          </SearchBarShell>
        </div>
      </div>

      {formError ? (
        <p role="alert" className="text-xs font-medium text-error px-1">
          {formError}
        </p>
      ) : null}

      {/* Single Clean Filter & Quick Routes Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 rounded-[22px] border border-line bg-surface p-3.5 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-ink-muted mr-1">
            Popular routes:
          </span>
          {POPULAR_ROUTES.map((route) => {
            const isActiveRoute =
              fromCity === route.from && toCity === route.to;
            return (
              <button
                key={route.code}
                type="button"
                onClick={() => {
                  setFromCity(route.from);
                  setToCity(route.to);
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs font-medium transition-colors cursor-pointer",
                  isActiveRoute
                    ? "bg-ink text-bg border-ink"
                    : "bg-bg/70 text-ink hover:border-ink/40 border-line"
                )}
              >
                {route.code}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2 border-t lg:border-t-0 pt-2.5 lg:pt-0 border-line">
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
                {cab === "All" ? "All Cabins" : cab}
              </FilterChip>
            ))}
          </div>

          <div className="hidden sm:block h-6 w-px bg-line" aria-hidden="true" />

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
      </div>

      {/* Destination Spotlight Strip */}
      <div className="relative overflow-hidden rounded-[22px] border border-line bg-surface p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                Selected Route · {fromAirport.code} → {toAirport.code}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-medium text-ink">
              Flying to {destinationVisual.title}
            </h2>
            <p className="text-xs text-ink-muted line-clamp-1">
              {destinationVisual.tagline}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:shrink-0">
          <Badge tone="neutral">{destinationVisual.flightHours}</Badge>
          <Badge tone="ink">
            {results.length} {results.length === 1 ? "Boarding Pass" : "Boarding Passes"}
          </Badge>
        </div>
      </div>

      {/* Results — Perforated Airline Boarding Pass Cards */}
      {isSearching ? (
        <CardSkeleton count={3} />
      ) : (
        <div ref={listRef} className="space-y-3.5">
          {results.map((flight) => {
            const isRoundTrip = tripType === "round-trip";
            const displayPrice = Math.round(
              flight.priceUsd * (isRoundTrip ? 1.85 : 1)
            );
            const isSelected = selectedFlightId === flight.id;

            return (
              <div
                key={flight.id}
                data-flight-card
                className={cn(
                  "group relative overflow-hidden rounded-[24px] border bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(0,0,0,0.06)]",
                  isSelected ? "border-ink ring-1 ring-ink" : "border-line"
                )}
              >
                {/* Top Boarding Pass Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-b border-line bg-bg/60">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-9 items-center justify-center rounded-[10px] border border-line bg-surface font-mono text-xs font-semibold text-ink">
                      {flight.airlineCode}
                    </span>
                    <span className="text-sm font-medium text-ink">
                      {flight.airline}
                    </span>
                    <span className="font-mono text-xs text-ink-muted">
                      · Flight {flight.flightNumber}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface border border-line px-2.5 py-1 text-[11px] font-medium text-ink-muted">
                      <Luggage className="h-3 w-3 text-ink" strokeWidth={1.6} aria-hidden="true" />
                      {flight.baggage}
                    </span>
                    <Badge
                      tone={flight.cabin === "Business" ? "ink" : "neutral"}
                    >
                      {flight.cabin === "Business" ? (
                        <span className="inline-flex items-center gap-1">
                          <Sparkles className="h-3 w-3" strokeWidth={1.7} />
                          Business Class
                        </span>
                      ) : (
                        "Economy Class"
                      )}
                    </Badge>
                  </div>
                </div>

                {/* Main Boarding Pass Body + Perforated Stub */}
                <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                  {/* Left 8 cols: Departure -> Flight Path -> Arrival */}
                  <div className="lg:col-span-8 p-5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    {/* Departure */}
                    <div className="min-w-[115px]">
                      <p className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                        Depart
                      </p>
                      <div className="mt-0.5 flex items-baseline gap-2">
                        <span className="font-mono text-2xl sm:text-[26px] font-semibold text-ink tracking-tight">
                          {flight.departTime}
                        </span>
                        <span className="font-mono text-sm font-semibold text-ink-muted">
                          {flight.fromCode}
                        </span>
                      </div>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {flight.from}
                      </p>
                    </div>

                    {/* Visual Flight Route Timeline */}
                    <div className="flex-1 flex flex-col items-center px-2 sm:px-4">
                      <span className="font-mono text-xs font-medium text-ink">
                        {flight.duration}
                      </span>
                      <div className="relative my-2 flex w-full items-center">
                        <span className="h-2 w-2 rounded-full border border-ink bg-surface shrink-0" />
                        <div className="h-px flex-1 border-t border-dashed border-ink/35" />
                        <span className="mx-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-bg border border-line text-ink">
                          <Plane className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden="true" />
                        </span>
                        <div className="h-px flex-1 border-t border-dashed border-ink/35" />
                        <span className="h-2 w-2 rounded-full bg-ink shrink-0" />
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                          flight.stops === 0
                            ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
                            : "bg-bg text-ink-muted border border-line"
                        )}
                      >
                        {flight.stops === 0
                          ? "Direct · Non-stop"
                          : `1 Stop via ${flight.stopCity}`}
                      </span>
                    </div>

                    {/* Arrival */}
                    <div className="sm:text-right min-w-[115px]">
                      <p className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                        Arrive
                      </p>
                      <div className="mt-0.5 flex sm:justify-end items-baseline gap-2">
                        <span className="font-mono text-2xl sm:text-[26px] font-semibold text-ink tracking-tight">
                          {flight.arriveTime}
                        </span>
                        <span className="font-mono text-sm font-semibold text-ink-muted">
                          {flight.toCode}
                        </span>
                      </div>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {flight.to}
                      </p>
                    </div>
                  </div>

                  {/* Right 4 cols: Perforated Boarding Pass Stub */}
                  <div className="lg:col-span-4 relative border-t lg:border-t-0 lg:border-l-2 border-dashed border-line bg-bg/35 p-5 sm:px-6 flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3">
                    {/* Ticket punch cutouts on desktop */}
                    <span
                      aria-hidden="true"
                      className="hidden lg:block absolute -left-3 -top-3 h-6 w-6 rounded-full border border-line bg-bg"
                    />
                    <span
                      aria-hidden="true"
                      className="hidden lg:block absolute -left-3 -bottom-3 h-6 w-6 rounded-full border border-line bg-bg"
                    />

                    <div className="lg:text-right">
                      <p className="font-mono text-[10.5px] uppercase tracking-wider text-ink-muted">
                        {isRoundTrip ? "Round-trip fare" : "One-way fare"} · {passengers} pax
                      </p>
                      <p className="font-mono text-2xl font-semibold text-ink mt-0.5">
                        {formatUsd(displayPrice * passengers)}
                      </p>
                      {passengers > 1 ? (
                        <p className="text-[11px] text-ink-muted">
                          ({formatUsd(displayPrice)} per passenger)
                        </p>
                      ) : null}
                    </div>

                    <Button
                      size="sm"
                      withArrow={!isSelected}
                      variant={isSelected ? "secondary" : "primary"}
                      onClick={() => handleSelectFlight(flight)}
                    >
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5" strokeWidth={2} />
                          Pass Selected
                        </span>
                      ) : (
                        "Select Flight"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
