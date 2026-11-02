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
} from "lucide-react";
import type { Car, CarCategory } from "@/lib/types";
import { carCategories } from "@/data/cars";
import { popularAirports } from "@/data/flights";
import { formatUsd, BLUR_DATA_URL, cn } from "@/lib/utils";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
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
      {/* Expansive Panoramic Fleet Horizon Hero Stage (Full-span, spacious, non-boxed) */}
      <div className="relative min-h-[480px] rounded-[28px] border border-line bg-ink text-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-8">
        {/* Clipped background photo container */}
        <div className="absolute inset-0 z-0 rounded-[28px] overflow-hidden pointer-events-none">
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
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/35"
          />
        </div>

        {/* Top Header: Desk Switcher + Status Badge */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <nav
            aria-label="Switch travel service desk"
            className="inline-flex flex-wrap items-center gap-1 rounded-full bg-black/45 backdrop-blur-md border border-white/20 p-1"
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

          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/25 px-3.5 py-1.5 text-xs font-medium text-white">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Airport Handover · Comprehensive Coverage
          </span>
        </div>

        {/* Center Editorial Headline + Quick Fleet Category Pills */}
        <div className="relative z-10 max-w-3xl space-y-3.5 my-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/25 px-3 py-1 text-xs font-medium text-white/95">
            <span>Pre-inspected showroom fleet</span>
            <span className="h-1 w-1 rounded-full bg-white/60" />
            <span className="font-mono text-white/85">Zero hidden counter fees</span>
          </div>
          <h1 className="text-[clamp(2.25rem,4.5vw,3.75rem)] font-medium tracking-[-0.03em] leading-[1.08] text-white">
            Drive at your own pace.
          </h1>
          <p className="text-sm sm:text-base text-white/85 leading-relaxed max-w-2xl">
            Airport-ready city hybrids, all-terrain executive SUVs, and flagship grand tourers—delivered clean, inspected, and ready at terminal arrival.
          </p>

          {/* Quick Fleet Category Pills */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-white/70 mr-1">Fleet category:</span>
            {carCategories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer backdrop-blur-md border",
                    isActive
                      ? "bg-white text-ink border-white font-semibold shadow-xs"
                      : "bg-black/35 text-white/90 border-white/20 hover:bg-white/20 hover:text-white"
                  )}
                >
                  {cat === "All" ? "All Fleet" : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Full-Width Docked Search Bar (Spanning full container!) */}
        <div className="relative z-20">
          <SearchBarShell floating className="text-ink shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
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
                  Search Cars
                </BarSubmitButton>
              </div>
            </form>
          </SearchBarShell>
        </div>
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

      {/* Showroom Fleet Grid — Clean, Minimal, High-Precision Vehicle Cards */}
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredCars.map((car) => {
            const isReserved = reservedCarId === car.id;
            const totalRentalUsd = car.pricePerDay * rentalDays;

            return (
              <div
                key={car.id}
                data-car-card
                className="group flex flex-col justify-between overflow-hidden rounded-[22px] border border-line bg-surface transition-all duration-300 hover:border-ink/40 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(0,0,0,0.06)]"
              >
                <div>
                  {/* Full-bleed 16:10 Vehicle Showroom Photo */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-2">
                    <Image
                      src={car.image}
                      alt={`${car.name} (${car.category})`}
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
                      <span className="rounded-full bg-surface/92 backdrop-blur-md px-3 py-1 text-xs font-medium text-ink shadow-2xs">
                        {car.category} Fleet
                      </span>
                      <span className="rounded-full bg-ink/85 backdrop-blur-md px-2.5 py-1 font-mono text-xs font-medium text-white shadow-2xs">
                        {car.transmission}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3">
                      <span className="rounded-full bg-black/65 backdrop-blur-md border border-white/20 px-2.5 py-0.5 text-[11px] font-medium text-white">
                        Free Airport Handover
                      </span>
                    </div>
                  </div>

                  {/* Clean Showroom Typography & Spec Strip */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div>
                      <p className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-muted">
                        {car.brand} · Airport Handover
                      </p>
                      <h2 className="text-[19px] font-medium tracking-[-0.02em] text-ink mt-0.5 leading-snug">
                        {car.name}
                      </h2>
                    </div>

                    {/* Clean Inline Spec Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-bg px-2.5 py-1 text-[11.5px] font-medium text-ink-muted border border-line/60">
                        <Users className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.8} aria-hidden="true" />
                        {car.seats} seats
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-bg px-2.5 py-1 text-[11.5px] font-medium text-ink-muted border border-line/60">
                        <Cog className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.8} aria-hidden="true" />
                        {car.transmission}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-bg px-2.5 py-1 text-[11.5px] font-medium text-ink-muted border border-line/60">
                        <Briefcase className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.8} aria-hidden="true" />
                        {car.luggage} bags
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Hairline Rate & Reserve Action */}
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 border-t border-line flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-xl font-semibold text-ink">
                        {formatUsd(car.pricePerDay)}
                      </span>
                      <span className="text-xs text-ink-muted">/ day</span>
                    </div>
                    <p className="text-[11px] text-ink-muted mt-0.5 font-mono">
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
