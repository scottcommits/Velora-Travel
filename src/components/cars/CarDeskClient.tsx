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
  Check,
  ArrowUpRight,
} from "lucide-react";
import type { Car, CarCategory } from "@/lib/types";
import { carCategories } from "@/data/cars";
import { popularAirports } from "@/data/flights";
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

  const spotlightCar = useMemo(
    () =>
      initialCars.find((c) => c.image.includes("porsche-911")) ??
      initialCars[0],
    [initialCars]
  );

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
    <div className="space-y-5">
      {/* Top Showroom Bento Showcase: 8-Col Hero + Search & 4-Col Flagship Tourer Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Left 8 Cols: Grand Touring Hero with Embedded Search Bar */}
        <div className="lg:col-span-8 relative min-h-[420px] overflow-hidden rounded-[24px] border border-line bg-ink text-white p-5 sm:p-7 flex flex-col justify-between gap-6">
          <Image
            src="/images/services/car-touring.jpg"
            alt="Grand touring car driving along a scenic coastal highway"
            fill
            priority
            sizes="(min-width: 1024px) 66vw, 96vw"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            className="object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/25"
          />

          {/* Top Service Desk Switcher */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5">
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
                        : "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-white/85 hover:text-white transition-colors"
                    }
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden="true" />
                    {tab.label}
                  </Link>
                );
              })}
            </nav>

            <span className="rounded-full bg-white/15 backdrop-blur-md border border-white/25 px-3 py-1 text-xs font-medium text-white">
              Airport Handover · Insurance Included
            </span>
          </div>

          {/* Bottom Headline + Embedded Fleet Search Bar */}
          <div className="relative z-10 space-y-5 mt-auto">
            <div className="max-w-xl space-y-2">
              <h1 className="text-[clamp(2rem,3.8vw,3.25rem)] font-medium tracking-[-0.03em] leading-[1.05] text-white">
                Drive at your own pace.
              </h1>
              <p className="text-sm sm:text-[15px] text-white/85 leading-relaxed">
                Airport-ready city hybrids, all-terrain SUVs, and flagship grand tourers—with full coverage and zero hidden counter fees.
              </p>
            </div>

            <SearchBarShell floating className="text-ink">
              <form
                onSubmit={handleSearch}
                noValidate
                className="grid grid-cols-1 md:grid-cols-12 items-center divide-y md:divide-y-0 md:divide-x divide-line"
              >
                <div className="md:col-span-4">
                  <BarSelect
                    id="car-pickup-city"
                    label="Pick-up hub"
                    value={pickupCity}
                    onChange={(e) => setPickupCity(e.target.value)}
                  >
                    {popularAirports.map((a) => (
                      <option key={a.code} value={a.city} className="bg-surface text-ink">
                        {a.city} ({a.code})
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
                    Search
                  </BarSubmitButton>
                </div>
              </form>
            </SearchBarShell>
          </div>
        </div>

        {/* Right 4 Cols: Flagship Grand Tourer Spotlight Bento Card */}
        {spotlightCar ? (
          <div className="lg:col-span-4 relative min-h-[340px] overflow-hidden rounded-[24px] border border-line bg-ink text-white p-5 flex flex-col justify-between group">
            <Image
              src={spotlightCar.image}
              alt={spotlightCar.name}
              fill
              sizes="(min-width: 1024px) 32vw, 96vw"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/25"
            />

            <div className="relative z-10 flex items-center justify-between gap-2">
              <span className="rounded-full bg-white/18 backdrop-blur-md border border-white/25 px-3 py-1 text-xs font-medium text-white">
                Showroom Spotlight
              </span>
              <span className="rounded-full bg-black/55 backdrop-blur-md border border-white/20 px-2.5 py-1 font-mono text-xs font-medium text-white">
                {spotlightCar.category} · {spotlightCar.transmission}
              </span>
            </div>

            <div className="relative z-10 rounded-[18px] bg-white/14 backdrop-blur-md border border-white/25 p-4 space-y-3">
              <div>
                <p className="text-xs text-white/80">
                  {spotlightCar.brand} · {spotlightCar.seats} Seats · {spotlightCar.luggage} Bags
                </p>
                <h2 className="text-xl font-medium tracking-[-0.02em] text-white mt-0.5">
                  {spotlightCar.name}
                </h2>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/20">
                <div>
                  <span className="font-mono text-lg font-medium text-white">
                    {formatUsd(spotlightCar.pricePerDay)}
                  </span>
                  <span className="text-xs text-white/75"> / day</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleReserve(spotlightCar)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-ink hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <span>Reserve</span>
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.8} />
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Single Clean Vehicle Category & Gearbox Filter Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-line bg-surface px-4 py-3">
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
                className="min-h-9 px-3.5 text-xs"
              >
                {cat === "All" ? "All Vehicles" : cat}
              </FilterChip>
            ))}
          </div>

          <div className="hidden sm:block h-6 w-px bg-line" aria-hidden="true" />

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
                className="min-h-9 px-3.5 text-xs"
              >
                {tr}
              </FilterChip>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto text-xs text-ink-muted">
          <span aria-live="polite" className="font-mono">
            <strong className="text-ink font-medium">{filteredCars.length}</strong>{" "}
            {filteredCars.length === 1 ? "car" : "cars"}
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

      {/* Showroom Fleet Grid (3:2 Photo-First, Clean Spec Pills, Hairline Footer) */}
      {filteredCars.length === 0 ? (
        <div className="rounded-[22px] border border-line bg-surface py-14 px-6 text-center space-y-3">
          <p className="text-sm text-ink-muted">
            No cars match this category and transmission combination.
          </p>
          <Button variant="secondary" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5"
        >
          {filteredCars.map((car) => {
            const isReserved = reservedCarId === car.id;
            const totalRentalUsd = car.pricePerDay * rentalDays;

            return (
              <Card
                key={car.id}
                data-car-card
                interactive
                padding="inset"
                className="group flex flex-col justify-between overflow-hidden rounded-[22px]"
              >
                <div>
                  {/* Lush 3:2 Vehicle Showroom Photo */}
                  <div className="relative aspect-[3/2] w-full rounded-[16px] overflow-hidden bg-surface-2">
                    <Image
                      src={car.image}
                      alt={`${car.name} (${car.category})`}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 95vw"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/15"
                    />

                    {/* Top Floating Glass Pills (max 2) */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-surface/92 backdrop-blur-md px-3 py-1 text-[11.5px] font-medium text-ink">
                        {car.category}
                      </span>
                      <span className="rounded-full bg-ink/85 backdrop-blur-md px-2.5 py-1 font-mono text-[11px] font-medium text-white">
                        {car.transmission}
                      </span>
                    </div>
                  </div>

                  {/* Clean Showroom Typography & Inline Spec Pills */}
                  <div className="px-3 pt-3.5 pb-2 space-y-2.5">
                    <div>
                      <p className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-muted">
                        {car.brand} · {pickupCity} Airport
                      </p>
                      <h2 className="text-[18px] font-medium tracking-[-0.02em] text-ink mt-0.5">
                        {car.name}
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-bg px-2.5 py-1 text-[11.5px] font-medium text-ink-muted">
                        <Users className="h-3.5 w-3.5 text-ink" strokeWidth={1.6} aria-hidden="true" />
                        {car.seats} seats
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-bg px-2.5 py-1 text-[11.5px] font-medium text-ink-muted">
                        <Cog className="h-3.5 w-3.5 text-ink" strokeWidth={1.6} aria-hidden="true" />
                        {car.transmission}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-bg px-2.5 py-1 text-[11.5px] font-medium text-ink-muted">
                        <Briefcase className="h-3.5 w-3.5 text-ink" strokeWidth={1.6} aria-hidden="true" />
                        {car.luggage} bags
                      </span>
                    </div>
                  </div>
                </div>

                {/* Clean Hairline Footer */}
                <div className="mx-3 pb-2.5 pt-3 mt-1 border-t border-line flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-lg font-medium text-ink">
                        {formatUsd(car.pricePerDay)}
                      </span>
                      <span className="text-xs text-ink-muted">/ day</span>
                    </div>
                    <p className="text-[11px] text-ink-muted">
                      {formatUsd(totalRentalUsd)} total · {rentalDays}{" "}
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
                      "Reserve"
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
