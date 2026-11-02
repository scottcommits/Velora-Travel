"use client";

import { useState, useMemo, useRef, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Users, Cog, Briefcase } from "lucide-react";
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
      title: `Car reserved: ${car.name}`,
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
      {/* Unified Search Bar */}
      <SearchBarShell>
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

      {/* Single Compact Filter Row */}
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
              >
                {cat}
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
            <strong className="text-ink font-medium">{filteredCars.length}</strong>{" "}
            {filteredCars.length === 1 ? "car" : "cars"}
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

      {/* Cars Grid (3 cols desktop, 2 tablet, 1 mobile, gap-4) */}
      {filteredCars.length === 0 ? (
        <div className="rounded-[20px] border border-line bg-surface py-14 px-6 text-center space-y-3">
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
            return (
              <Card
                key={car.id}
                data-car-card
                interactive
                padding="none"
                className="group flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="relative aspect-[3/2] w-full overflow-hidden bg-surface-2">
                    <Image
                      src={car.image}
                      alt={`${car.name} (${car.category})`}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 95vw"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge
                        tone="neutral"
                        className="bg-surface/92 backdrop-blur-md text-ink border-transparent"
                      >
                        {car.category}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 space-y-2">
                    <h2 className="text-[17px] font-medium tracking-[-0.015em] text-ink">
                      {car.name}
                    </h2>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.6} aria-hidden="true" />
                        {car.seats} seats
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Cog className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.6} aria-hidden="true" />
                        {car.transmission}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.6} aria-hidden="true" />
                        {car.luggage} bags
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 border-t border-line flex items-center justify-between gap-3">
                  <div>
                    <span className="font-mono text-base font-medium text-ink">
                      {formatUsd(car.pricePerDay)}
                    </span>
                    <span className="text-xs text-ink-muted">
                      {" "}/ day · {formatUsd(car.pricePerDay * rentalDays)} total
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant={isReserved ? "secondary" : "primary"}
                    onClick={() => handleReserve(car)}
                  >
                    {isReserved ? "Reserved" : "Reserve"}
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
