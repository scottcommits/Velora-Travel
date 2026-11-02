"use client";

import { useState, useMemo, useRef, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  Cog,
  Briefcase,
  Stamp,
  Plane,
  Building2,
  CarFront,
  ShieldCheck,
  Check,
} from "lucide-react";
import type { Car, CarCategory } from "@/lib/types";
import { carCategories } from "@/data/cars";
import { popularAirports } from "@/data/flights";
import { formatUsd, BLUR_DATA_URL } from "@/lib/utils";
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
import { useToast } from "@/components/ui/Toast";

const SERVICE_TABS = [
  { label: "Visas", href: "/visa", icon: Stamp, active: false },
  { label: "Flights", href: "/tickets", icon: Plane, active: false },
  { label: "Hotels", href: "/hotels", icon: Building2, active: false },
  { label: "Car Rental", href: "/cars", icon: CarFront, active: true },
];

export function CarDeskClient({ initialCars }: { initialCars: Car[] }) {
  const searchParams = useSearchParams();
  const { notify } = useToast();
  const gridRef = useRef<HTMLDivElement>(null);

  const [selectedCategory, setSelectedCategory] = useState<"All" | CarCategory>(
    () => {
      const cat = searchParams.get("category") as CarCategory | null;
      return cat && carCategories.includes(cat) ? cat : "All";
    }
  );
  const [transmissionFilter, setTransmissionFilter] = useState<
    "All" | "Automatic" | "Manual"
  >(() => {
    const tr = searchParams.get("transmission");
    return tr === "Automatic" || tr === "Manual" ? tr : "All";
  });
  const [pickupCity, setPickupCity] = useState("Dubai");
  const [pickupDate, setPickupDate] = useState("2026-11-21");
  const [rentalDays, setRentalDays] = useState(4);
  const [reservedCarId, setReservedCarId] = useState<string | null>(null);

  const filteredCars = useMemo(() => {
    return initialCars.filter((car) => {
      const matchCat =
        selectedCategory === "All" || car.category === selectedCategory;
      const matchTrans =
        transmissionFilter === "All" || car.transmission === transmissionFilter;
      return matchCat && matchTrans;
    });
  }, [initialCars, selectedCategory, transmissionFilter]);

  useGSAP(
    () => {
      if (!gridRef.current) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const cards = gsap.utils.toArray<HTMLElement>(
          "[data-car-card]",
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
    { scope: gridRef, dependencies: [filteredCars] }
  );

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    notify({
      title: "Fleet rates updated",
      description: `Showing ${filteredCars.length} vehicles in ${pickupCity} for ${rentalDays} days from ${pickupDate}.`,
    });
  };

  const handleReserve = (car: Car) => {
    setReservedCarId(car.id);
    const total = car.pricePerDay * rentalDays;
    notify({
      title: `Vehicle reserved: ${car.name}`,
      description: `${rentalDays} days in ${pickupCity} at ${formatUsd(total)} total.`,
    });
  };

  const clearFilters = () => {
    setSelectedCategory("All");
    setTransmissionFilter("All");
  };

  const hasActiveFilters =
    selectedCategory !== "All" || transmissionFilter !== "All";

  return (
    <div className="space-y-6">
      {/* Cohesive Velora Hero Frame with Embedded Fleet Search Bar */}
      <div className="relative overflow-hidden rounded-[28px] border border-line bg-ink text-white">
        <Image
          src="/images/services/car-touring.jpg"
          alt="Grand touring car driving along a scenic coastal highway"
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
          {/* Top Bar: Service Desk Switcher + Fleet Badge */}
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
              <CarFront className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden="true" />
              Airport Showroom Fleet
            </span>
          </div>

          {/* Center Headline + 3 Fleet Showroom Guarantees */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-7 space-y-2.5">
              <h1 className="text-[clamp(2rem,3.6vw,3.1rem)] font-medium tracking-[-0.03em] leading-[1.06] text-white">
                Airport-ready vehicles with zero counter surprises.
              </h1>
              <p className="text-sm sm:text-[15px] text-white/85 leading-relaxed max-w-xl">
                From city-friendly hybrids and family SUVs to flagship grand tourers—delivered to your arrival terminal with full CDW insurance included.
              </p>
            </div>

            <div className="lg:col-span-5 grid grid-cols-3 gap-2.5">
              <div className="rounded-[16px] bg-white/12 backdrop-blur-md border border-white/20 p-3 text-left">
                <p className="font-mono text-lg sm:text-xl font-medium text-white">
                  $0
                </p>
                <p className="text-[11px] text-white/75 mt-0.5">
                  Insurance excess
                </p>
              </div>
              <div className="rounded-[16px] bg-white/12 backdrop-blur-md border border-white/20 p-3 text-left">
                <p className="font-mono text-lg sm:text-xl font-medium text-white">
                  24/7
                </p>
                <p className="text-[11px] text-white/75 mt-0.5">
                  Terminal handover
                </p>
              </div>
              <div className="rounded-[16px] bg-white/12 backdrop-blur-md border border-white/20 p-3 text-left">
                <p className="font-mono text-lg sm:text-xl font-medium text-white">
                  Free
                </p>
                <p className="text-[11px] text-white/75 mt-0.5">
                  Unlimited mileage
                </p>
              </div>
            </div>
          </div>

          {/* Embedded Unified Car Search Bar */}
          <SearchBarShell floating className="text-ink">
            <form
              onSubmit={handleSearch}
              noValidate
              className="grid grid-cols-1 md:grid-cols-12 items-center divide-y md:divide-y-0 md:divide-x divide-line"
            >
              <div className="md:col-span-4">
                <BarSelect
                  id="car-pickup-city"
                  label="Airport / city pick-up hub"
                  value={pickupCity}
                  onChange={(e) => setPickupCity(e.target.value)}
                >
                  {popularAirports.map((a) => (
                    <option key={a.code} value={a.city} className="bg-surface text-ink">
                      {a.city} International ({a.code})
                    </option>
                  ))}
                </BarSelect>
              </div>

              <div className="md:col-span-3">
                <BarDate
                  id="car-pickup-date"
                  label="Pick-up date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <BarSelect
                  id="car-trans-select"
                  label="Transmission"
                  value={transmissionFilter}
                  onChange={(e) =>
                    setTransmissionFilter(
                      e.target.value as "All" | "Automatic" | "Manual"
                    )
                  }
                >
                  <option value="All" className="bg-surface text-ink">
                    All gearboxes
                  </option>
                  <option value="Automatic" className="bg-surface text-ink">
                    Automatic
                  </option>
                  <option value="Manual" className="bg-surface text-ink">
                    Manual
                  </option>
                </BarSelect>
              </div>

              <div className="md:col-span-1">
                <BarInput
                  id="car-days-input"
                  label="Days"
                  type="number"
                  min={1}
                  max={30}
                  value={rentalDays}
                  onChange={(e) =>
                    setRentalDays(Math.max(1, Number(e.target.value) || 1))
                  }
                />
              </div>

              <div className="md:col-span-2 pt-2 md:pt-0 md:pl-2.5 flex justify-end border-none">
                <BarSubmitButton className="w-full justify-between">
                  Search Fleet
                </BarSubmitButton>
              </div>
            </form>
          </SearchBarShell>
        </div>
      </div>

      {/* Single Clean Vehicle Category & Gearbox Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-line bg-surface p-3.5 sm:px-5">
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <div
            role="radiogroup"
            aria-label="Filter cars by category"
            className="flex flex-wrap items-center gap-1.5"
          >
            {carCategories.map((cat) => (
              <FilterChip
                key={cat}
                role="radio"
                aria-checked={selectedCategory === cat}
                active={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === "All" ? "All Vehicles" : cat}
              </FilterChip>
            ))}
          </div>

          <div className="hidden sm:block h-7 w-px bg-line" aria-hidden="true" />

          <div
            role="group"
            aria-label="Filter by transmission"
            className="flex items-center gap-1.5"
          >
            {(["Automatic", "Manual"] as const).map((tr) => (
              <FilterChip
                key={tr}
                active={transmissionFilter === tr}
                aria-pressed={transmissionFilter === tr}
                onClick={() =>
                  setTransmissionFilter(
                    transmissionFilter === tr ? "All" : tr
                  )
                }
              >
                {tr}
              </FilterChip>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto text-xs text-ink-muted">
          <span aria-live="polite" className="font-mono">
            Showing{" "}
            <strong className="text-ink font-medium">{filteredCars.length}</strong>{" "}
            {filteredCars.length === 1 ? "vehicle" : "vehicles"}
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

      {/* Results — Showroom Fleet & Technical Spec Cards */}
      {filteredCars.length === 0 ? (
        <div className="rounded-[24px] border border-line bg-surface py-14 px-6 text-center space-y-3">
          <p className="text-sm text-ink-muted">
            No vehicles match this category and transmission combination.
          </p>
          <Button variant="secondary" size="sm" onClick={clearFilters}>
            Show all vehicles
          </Button>
        </div>
      ) : (
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredCars.map((car) => {
            const isReserved = reservedCarId === car.id;
            const totalRentalUsd = car.pricePerDay * rentalDays;

            return (
              <Card
                key={car.id}
                data-car-card
                interactive
                padding="none"
                className="group flex flex-col justify-between overflow-hidden rounded-[22px]"
              >
                <div>
                  {/* Top Vehicle Showroom Header */}
                  <div className="flex items-center justify-between gap-3 px-4 py-3.5 border-b border-line bg-bg/55">
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted">
                        {car.category} Class · {pickupCity} Hub
                      </p>
                      <h2 className="text-[17px] font-medium tracking-[-0.015em] text-ink truncate">
                        {car.name}
                      </h2>
                    </div>

                    <Badge tone="ink" className="shrink-0">
                      {car.category}
                    </Badge>
                  </div>

                  {/* Showroom Vehicle Photo */}
                  <div className="px-3 pt-3">
                    <div className="relative aspect-[16/10] w-full rounded-[14px] overflow-hidden bg-surface-2">
                      <Image
                        src={car.image}
                        alt={`${car.name} (${car.category})`}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 95vw"
                        placeholder="blur"
                        blurDataURL={BLUR_DATA_URL}
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                      <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-black/65 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-white">
                        <ShieldCheck className="h-3 w-3 text-emerald-400" strokeWidth={2} aria-hidden="true" />
                        Full Insurance · Unlimited km
                      </div>
                    </div>
                  </div>

                  {/* 3-Column Vehicle Dashboard Spec Box */}
                  <div className="px-3 pt-3 pb-1">
                    <div className="grid grid-cols-3 divide-x divide-line rounded-[14px] border border-line/80 bg-bg/65 py-2.5 px-1 text-center">
                      <div className="px-1.5">
                        <p className="inline-flex items-center justify-center gap-1 text-[10px] font-mono uppercase tracking-wider text-ink-muted">
                          <Users className="h-3 w-3" strokeWidth={1.6} aria-hidden="true" />
                          Capacity
                        </p>
                        <p className="mt-0.5 font-mono text-xs font-medium text-ink">
                          {car.seats} Seats
                        </p>
                      </div>
                      <div className="px-1.5">
                        <p className="inline-flex items-center justify-center gap-1 text-[10px] font-mono uppercase tracking-wider text-ink-muted">
                          <Cog className="h-3 w-3" strokeWidth={1.6} aria-hidden="true" />
                          Gearbox
                        </p>
                        <p className="mt-0.5 font-mono text-xs font-medium text-ink">
                          {car.transmission}
                        </p>
                      </div>
                      <div className="px-1.5">
                        <p className="inline-flex items-center justify-center gap-1 text-[10px] font-mono uppercase tracking-wider text-ink-muted">
                          <Briefcase className="h-3 w-3" strokeWidth={1.6} aria-hidden="true" />
                          Luggage
                        </p>
                        <p className="mt-0.5 font-mono text-xs font-medium text-ink">
                          {car.luggage} Bags
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Daily Rate + Multi-Day Total Bar */}
                <div className="mx-3 mb-3 mt-2.5 rounded-[14px] bg-bg/55 border border-line/70 px-3.5 py-2.5 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-lg font-semibold text-ink">
                        {formatUsd(car.pricePerDay)}
                      </span>
                      <span className="text-xs text-ink-muted">/ day</span>
                    </div>
                    <p className="font-mono text-[11px] text-ink-muted">
                      {formatUsd(totalRentalUsd)} total for {rentalDays}{" "}
                      {rentalDays === 1 ? "day" : "days"}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    withArrow={!isReserved}
                    variant={isReserved ? "secondary" : "primary"}
                    onClick={() => handleReserve(car)}
                  >
                    {isReserved ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5" strokeWidth={2} />
                        Reserved
                      </span>
                    ) : (
                      "Reserve Car"
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
