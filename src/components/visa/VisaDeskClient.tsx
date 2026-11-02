"use client";

import { useState, useMemo, useRef, useEffect, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Clock } from "lucide-react";
import type { VisaOffer, VisaType } from "@/lib/types";
import { visaCountries, visaTypesList } from "@/data/visas";
import { visaApplicationSchema, type VisaApplicationInput } from "@/lib/validators";
import { formatUsd, BLUR_DATA_URL } from "@/lib/utils";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  InputField,
  TextareaField,
  SearchBarShell,
  BarSelect,
  BarInput,
  BarSubmitButton,
  FilterChip,
} from "@/components/ui/FormFields";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";

export function VisaDeskClient({ offers }: { offers: VisaOffer[] }) {
  const searchParams = useSearchParams();
  const { notify } = useToast();
  const gridRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const [selectedCountry, setSelectedCountry] = useState<string>(
    () => searchParams.get("country") || "All"
  );
  const [selectedType, setSelectedType] = useState<string>(
    () => searchParams.get("type") || "All"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);
  const [activeVisa, setActiveVisa] = useState<VisaOffer | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VisaApplicationInput>({
    resolver: zodResolver(visaApplicationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      passportCountry: "United Kingdom",
      travelDate: "2026-11-24",
      notes: "",
    },
  });

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      const matchCountry =
        selectedCountry === "All" || offer.country === selectedCountry;
      const matchType =
        selectedType === "All" || offer.visaType === (selectedType as VisaType);
      const matchQuery =
        !searchQuery.trim() ||
        offer.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.region.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCountry && matchType && matchQuery;
    });
  }, [offers, selectedCountry, selectedType, searchQuery]);

  useGSAP(
    () => {
      if (isFiltering || !gridRef.current) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const cards = gsap.utils.toArray<HTMLElement>(
          "[data-visa-card]",
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
    { scope: gridRef, dependencies: [filteredOffers, isFiltering] }
  );

  useEffect(() => {
    if (!activeVisa) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    const firstInput = modalRef.current?.querySelector<HTMLElement>("input");
    firstInput?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveVisa(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeVisa]);

  const triggerFilterChange = (updater: () => void) => {
    setIsFiltering(true);
    updater();
    window.setTimeout(() => {
      setIsFiltering(false);
    }, 220);
  };

  const clearFilters = () => {
    triggerFilterChange(() => {
      setSelectedCountry("All");
      setSelectedType("All");
      setSearchQuery("");
    });
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    notify({
      title: "Visa requirements filtered",
      description: `Showing ${filteredOffers.length} visa options.`,
    });
  };

  const onApplySubmit = async (data: VisaApplicationInput) => {
    await new Promise((r) => setTimeout(r, 500));
    notify({
      title: `Application started: ${activeVisa?.country}`,
      description: `Checklist sent to ${data.email}.`,
    });
    reset();
    setActiveVisa(null);
  };

  const hasActiveFilters =
    selectedCountry !== "All" ||
    selectedType !== "All" ||
    searchQuery.trim() !== "";

  return (
    <div className="space-y-6">
      {/* Unified Search Bar */}
      <SearchBarShell>
        <form
          onSubmit={handleSearchSubmit}
          noValidate
          className="grid grid-cols-1 md:grid-cols-12 items-center divide-y md:divide-y-0 md:divide-x divide-line"
        >
          <div className="md:col-span-4">
            <BarSelect
              id="visa-country-filter"
              label="Destination country"
              value={selectedCountry}
              onChange={(e) =>
                triggerFilterChange(() => setSelectedCountry(e.target.value))
              }
            >
              <option value="All" className="bg-surface text-ink">
                All countries ({visaCountries.length})
              </option>
              {visaCountries.map((country) => (
                <option key={country} value={country} className="bg-surface text-ink">
                  {country}
                </option>
              ))}
            </BarSelect>
          </div>

          <div className="md:col-span-4">
            <BarInput
              id="visa-search-input"
              label="Search country or region"
              type="search"
              withSearchIcon
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Japan, Schengen, Asia..."
            />
          </div>

          <div className="md:col-span-2">
            <BarSelect
              id="visa-type-select"
              label="Category"
              value={selectedType}
              onChange={(e) =>
                triggerFilterChange(() => setSelectedType(e.target.value))
              }
            >
              {visaTypesList.map((type) => (
                <option key={type} value={type} className="bg-surface text-ink">
                  {type === "All" ? "All types" : type}
                </option>
              ))}
            </BarSelect>
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
        <div
          role="group"
          aria-label="Filter by visa type"
          className="flex flex-wrap items-center gap-1.5"
        >
          {visaTypesList.map((type) => (
            <FilterChip
              key={type}
              active={selectedType === type}
              aria-pressed={selectedType === type}
              onClick={() => triggerFilterChange(() => setSelectedType(type))}
            >
              {type === "All" ? "All categories" : type}
            </FilterChip>
          ))}
        </div>

        <div className="flex items-center gap-3 ml-auto text-xs text-ink-muted">
          <span aria-live="polite" className="font-mono">
            <strong className="text-ink font-medium">{filteredOffers.length}</strong>{" "}
            {filteredOffers.length === 1 ? "visa" : "visas"}
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

      {/* Results (3 cols desktop, 2 tablet, 1 mobile, gap-4) */}
      {isFiltering ? (
        <CardSkeleton count={6} />
      ) : filteredOffers.length === 0 ? (
        <div className="rounded-[20px] border border-line bg-surface py-14 px-6 text-center space-y-3">
          <p className="text-sm text-ink-muted">
            No visas match your current filters.
          </p>
          <Button variant="secondary" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {filteredOffers.map((offer) => (
            <Card
              key={offer.id}
              data-visa-card
              interactive
              padding="inset"
              className="group flex flex-col justify-between overflow-hidden"
            >
              <div>
                <div className="relative aspect-[4/3] w-full rounded-[14px] overflow-hidden bg-surface-2">
                  <Image
                    src={offer.image}
                    alt={`${offer.country} ${offer.visaType} visa`}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 95vw"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center rounded-full bg-surface/92 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-ink">
                      {offer.region}
                    </span>
                    <Badge tone="ink" className="backdrop-blur-md">
                      {offer.visaType}
                    </Badge>
                  </div>
                </div>

                <div className="px-3 pt-3 pb-2 space-y-1.5">
                  <h2 className="text-[17px] font-medium tracking-[-0.015em] text-ink">
                    {offer.country}
                  </h2>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                    <span className="inline-flex items-center gap-1 font-mono text-ink">
                      <Clock className="h-3.5 w-3.5 text-ink-muted" strokeWidth={1.6} aria-hidden="true" />
                      {offer.processingDays}
                    </span>
                    <span>·</span>
                    <span>
                      {offer.entry} entry ({offer.validity})
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-3 pb-3 pt-2 flex items-center justify-between gap-3">
                <div>
                  <span className="font-mono text-base font-medium text-ink">
                    {formatUsd(offer.priceUsd)}
                  </span>
                  <span className="text-xs text-ink-muted"> / person</span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveVisa(offer)}
                >
                  Apply now
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Accessible Visa Application Modal */}
      {activeVisa ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="visa-modal-title"
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveVisa(null);
          }}
        >
          <div
            ref={modalRef}
            className="w-full max-w-lg rounded-[20px] border border-line bg-surface p-6 sm:p-7 space-y-5 my-8"
          >
            <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
              <div>
                <p className="text-xs text-ink-muted">
                  {activeVisa.visaType} Visa · {activeVisa.processingDays}
                </p>
                <h2
                  id="visa-modal-title"
                  className="mt-1 text-xl font-medium text-ink"
                >
                  Apply for {activeVisa.country}
                </h2>
                <p className="font-mono text-xs text-ink-muted mt-1">
                  Fee: {formatUsd(activeVisa.priceUsd)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveVisa(null)}
                aria-label="Close application modal"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink-muted hover:text-ink cursor-pointer"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onApplySubmit)}
              noValidate
              className="space-y-4"
            >
              <InputField
                id="visa-app-name"
                label="Full name"
                placeholder="Alex Morgan"
                error={errors.fullName?.message}
                {...register("fullName")}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  id="visa-app-email"
                  type="email"
                  label="Email"
                  placeholder="alex@example.com"
                  error={errors.email?.message}
                  {...register("email")}
                />
                <InputField
                  id="visa-app-passport"
                  label="Passport country"
                  placeholder="United Kingdom"
                  error={errors.passportCountry?.message}
                  {...register("passportCountry")}
                />
              </div>
              <InputField
                id="visa-app-date"
                type="date"
                label="Travel date"
                error={errors.travelDate?.message}
                {...register("travelDate")}
              />
              <TextareaField
                id="visa-app-notes"
                label="Notes (optional)"
                placeholder="Any questions or details..."
                error={errors.notes?.message}
                className="min-h-20"
                {...register("notes")}
              />

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveVisa(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit application"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
