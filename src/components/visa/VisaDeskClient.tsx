"use client";

import { useState, useMemo, useRef, useEffect, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Clock,
  Stamp,
  Plane,
  Building2,
  CarFront,
  ArrowUpRight,
} from "lucide-react";
import type { VisaOffer, VisaType } from "@/lib/types";
import { visaCountries, visaTypesList } from "@/data/visas";
import { visaApplicationSchema, type VisaApplicationInput } from "@/lib/validators";
import { formatUsd, BLUR_DATA_URL, cn } from "@/lib/utils";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
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

const SERVICE_TABS = [
  { label: "Visas", href: "/visa", icon: Stamp, active: true },
  { label: "Flights", href: "/tickets", icon: Plane, active: false },
  { label: "Hotels", href: "/hotels", icon: Building2, active: false },
  { label: "Car Rental", href: "/cars", icon: CarFront, active: false },
];

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

  const spotlightVisa = useMemo(
    () =>
      offers.find((o) => o.id === "schengen-tourist") ?? offers[0],
    [offers]
  );

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      const matchCountry =
        selectedCountry === "All" || offer.country === selectedCountry;
      const matchType =
        selectedType === "All" || offer.visaType === (selectedType as VisaType);
      const matchQuery =
        !searchQuery.trim() ||
        offer.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.flag.toLowerCase().includes(searchQuery.toLowerCase());
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
    <div className="space-y-5">
      {/* Top Editorial Bento Showcase: 8-Col Hero + Search & 4-Col Featured Visa Permit Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Left 8 Cols: Consular Desk Hero with Embedded Search Bar (overflow-visible so BarSelect dropdown never clips) */}
        <div className="lg:col-span-8 relative min-h-[440px] rounded-[24px] border border-line bg-ink text-white p-5 sm:p-7 flex flex-col justify-between gap-6">
          {/* Clipped background photo container */}
          <div className="absolute inset-0 z-0 rounded-[24px] overflow-hidden pointer-events-none">
            <Image
              src="/images/services/visa-passport.jpg"
              alt="Passport and travel documents on a consular desk"
              fill
              priority
              sizes="(min-width: 1024px) 66vw, 96vw"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              className="object-cover object-center"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/38 to-black/25"
            />
          </div>

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
              e-Visa &amp; Consular Desk
            </span>
          </div>

          {/* Bottom Headline + Embedded Visa Search Bar */}
          <div className="relative z-10 space-y-5 mt-auto">
            <div className="max-w-xl space-y-2">
              <h1 className="text-[clamp(2rem,3.8vw,3.25rem)] font-medium tracking-[-0.03em] leading-[1.05] text-white">
                Visas without the guesswork.
              </h1>
              <p className="text-sm sm:text-[15px] text-white/85 leading-relaxed">
                Check exact processing times, stay validity, and entry rules—then start your pre-checked visa application in minutes.
              </p>
            </div>

            <SearchBarShell floating className="text-ink">
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

                <div className="md:col-span-3">
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
                        {type === "All" ? "All types" : `${type} Visa`}
                      </option>
                    ))}
                  </BarSelect>
                </div>

                <div className="md:col-span-3">
                  <BarInput
                    id="visa-search-input"
                    label="Search country or region"
                    type="search"
                    withSearchIcon
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Japan, Europe, AE..."
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

        {/* Right 4 Cols: Featured Schengen Permit Bento Card */}
        {spotlightVisa ? (
          <div className="lg:col-span-4 relative min-h-[340px] overflow-hidden rounded-[24px] border border-line bg-ink text-white p-5 flex flex-col justify-between group">
            <Image
              src={spotlightVisa.image}
              alt={spotlightVisa.country}
              fill
              sizes="(min-width: 1024px) 32vw, 96vw"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/25"
            />

            <div className="relative z-10 flex items-center justify-between gap-2">
              <span className="rounded-full bg-white/18 backdrop-blur-md border border-white/25 px-3 py-1 text-xs font-medium text-white">
                Most Requested Permit
              </span>
              <span className="rounded-full bg-black/55 backdrop-blur-md border border-white/20 px-2.5 py-1 font-mono text-xs font-medium text-white">
                {spotlightVisa.flag} · {spotlightVisa.entry} Entry
              </span>
            </div>

            <div className="relative z-10 rounded-[18px] bg-white/14 backdrop-blur-md border border-white/25 p-4 space-y-3">
              <div>
                <p className="text-xs text-white/80">
                  {spotlightVisa.processingDays} · {spotlightVisa.validity}
                </p>
                <h2 className="text-xl font-medium tracking-[-0.02em] text-white mt-0.5">
                  {spotlightVisa.country} ({spotlightVisa.visaType})
                </h2>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/20">
                <div>
                  <span className="font-mono text-lg font-medium text-white">
                    {formatUsd(spotlightVisa.priceUsd)}
                  </span>
                  <span className="text-xs text-white/75"> / person</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveVisa(spotlightVisa)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-ink hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <span>Apply now</span>
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.8} />
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Sleek Single Filter Strip: Country Quick Pills + Permit Categories */}
      <div className="rounded-[20px] border border-line bg-surface p-3.5 sm:px-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
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
                className="min-h-9 px-3.5 text-xs"
              >
                {type === "All" ? "All Categories" : `${type} Visa`}
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
                Clear filters
              </button>
            ) : null}
          </div>
        </div>

        {/* Quick Country Pills */}
        <div
          role="group"
          aria-label="Quick country filter"
          className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-line"
        >
          <button
            type="button"
            onClick={() => triggerFilterChange(() => setSelectedCountry("All"))}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer",
              selectedCountry === "All"
                ? "bg-ink text-bg"
                : "bg-bg text-ink-muted hover:text-ink border border-line/70"
            )}
          >
            All Countries
          </button>
          {visaCountries.map((country) => {
            const active = selectedCountry === country;
            return (
              <button
                key={country}
                type="button"
                onClick={() =>
                  triggerFilterChange(() => setSelectedCountry(country))
                }
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer",
                  active
                    ? "bg-ink text-bg"
                    : "bg-bg text-ink-muted hover:text-ink border border-line/70"
                )}
              >
                {country}
              </button>
            );
          })}
        </div>
      </div>

      {/* Editorial Country Visa Cards — Clean, Minimal, Structured Document Presentation */}
      {isFiltering ? (
        <CardSkeleton count={6} />
      ) : filteredOffers.length === 0 ? (
        <div className="rounded-[22px] border border-line bg-surface py-14 px-6 text-center space-y-3">
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredOffers.map((offer) => (
            <div
              key={offer.id}
              data-visa-card
              className="group flex flex-col justify-between overflow-hidden rounded-[22px] border border-line bg-surface transition-all duration-300 hover:border-ink/40 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(0,0,0,0.06)]"
            >
              <div>
                {/* Full-bleed 16:9 Destination Landmark Photo */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-2">
                  <Image
                    src={offer.image}
                    alt={`${offer.country} ${offer.visaType} visa`}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 95vw"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25"
                  />

                  {/* Top Floating Glass Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/92 backdrop-blur-md px-3 py-1 text-xs font-medium text-ink shadow-2xs">
                      <span className="font-mono font-semibold">{offer.flag}</span>
                      <span>·</span>
                      <span>{offer.region}</span>
                    </span>
                    <span className="rounded-full bg-ink/85 backdrop-blur-md px-2.5 py-1 text-xs font-medium text-white shadow-2xs">
                      {offer.visaType} Permit
                    </span>
                  </div>

                  {/* Bottom Processing Window Pill */}
                  <div className="absolute bottom-3 left-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/20 px-2.5 py-0.5 font-mono text-[11px] font-medium text-white">
                      <Clock className="h-3 w-3" strokeWidth={1.8} aria-hidden="true" />
                      {offer.processingDays}
                    </span>
                  </div>
                </div>

                {/* Clean Content Area */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div>
                    <p className="text-[11px] font-medium text-ink-muted">
                      {offer.entry} Entry · Valid for {offer.validity}
                    </p>
                    <h2 className="text-[19px] font-medium tracking-[-0.02em] text-ink mt-0.5 leading-snug">
                      {offer.country}
                    </h2>
                  </div>

                  {/* Structured 3-Column Micro-Spec Strip */}
                  <div className="grid grid-cols-3 divide-x divide-line rounded-[14px] bg-bg/70 border border-line/70 py-2 px-1 text-center">
                    <div className="px-1">
                      <p className="text-[10px] uppercase font-mono tracking-wider text-ink-muted">Time</p>
                      <p className="text-xs font-medium text-ink font-mono mt-0.5 truncate">{offer.processingDays.split(" ")[0]} d</p>
                    </div>
                    <div className="px-1">
                      <p className="text-[10px] uppercase font-mono tracking-wider text-ink-muted">Validity</p>
                      <p className="text-xs font-medium text-ink font-mono mt-0.5 truncate">{offer.validity}</p>
                    </div>
                    <div className="px-1">
                      <p className="text-[10px] uppercase font-mono tracking-wider text-ink-muted">Entry</p>
                      <p className="text-xs font-medium text-ink font-mono mt-0.5 truncate">{offer.entry}</p>
                    </div>
                  </div>

                  {/* Checklist Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {offer.highlights.slice(0, 2).map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-bg px-2.5 py-1 text-[11px] font-medium text-ink-muted border border-line/60"
                      >
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Hairline Fee & Apply Action */}
              <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 border-t border-line flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-xl font-semibold text-ink">
                      {formatUsd(offer.priceUsd)}
                    </span>
                    <span className="text-xs text-ink-muted">/ applicant</span>
                  </div>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    Embassy fee included
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  withArrow
                  onClick={() => setActiveVisa(offer)}
                >
                  Apply now
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accessible Visa Application Modal */}
      {activeVisa ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="visa-modal-title"
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-ink/45 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveVisa(null);
          }}
        >
          <div
            ref={modalRef}
            className="w-full max-w-lg rounded-[24px] border border-line bg-surface p-6 sm:p-7 space-y-5 my-8 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-12 items-center justify-center rounded-[14px] border border-line bg-bg font-mono text-xs font-semibold text-ink">
                  {activeVisa.flag}
                </div>
                <div>
                  <p className="text-xs text-ink-muted">
                    {activeVisa.visaType} Visa · {activeVisa.processingDays} · {activeVisa.entry} entry
                  </p>
                  <h2
                    id="visa-modal-title"
                    className="mt-0.5 text-xl font-medium text-ink"
                  >
                    Apply for {activeVisa.country}
                  </h2>
                  <p className="font-mono text-xs text-ink-muted mt-0.5">
                    Fee: {formatUsd(activeVisa.priceUsd)} / person
                  </p>
                </div>
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
              className="space-y-3.5"
            >
              <InputField
                id="visa-app-name"
                label="Full name"
                placeholder="Alex Morgan"
                error={errors.fullName?.message}
                {...register("fullName")}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <Button type="submit" size="sm" withArrow disabled={isSubmitting}>
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
