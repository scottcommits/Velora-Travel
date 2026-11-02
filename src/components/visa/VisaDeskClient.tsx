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
  FileCheck2,
  ShieldCheck,
  Stamp,
  Plane,
  Building2,
  CarFront,
  CheckCircle2,
  Calendar,
  Repeat,
} from "lucide-react";
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
      description: `Showing ${filteredOffers.length} official visa options.`,
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
      {/* Cohesive Velora Hero Frame with Embedded Visa Search Bar */}
      <div className="relative overflow-hidden rounded-[28px] border border-line bg-ink text-white">
        <Image
          src="/images/services/visa-passport.jpg"
          alt="Passport and travel documents on a consular desk"
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
          {/* Top Bar: Service Desk Switcher + Official Consular Badge */}
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
              <Stamp className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden="true" />
              e-Visa &amp; Consular Desk
            </span>
          </div>

          {/* Center Headline + 3 Visual Visa Trust Pills */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-7 space-y-2.5">
              <h1 className="text-[clamp(2rem,3.6vw,3.1rem)] font-medium tracking-[-0.03em] leading-[1.06] text-white">
                Travel visas &amp; entry permits, simplified.
              </h1>
              <p className="text-sm sm:text-[15px] text-white/85 leading-relaxed max-w-xl">
                Check exact embassy processing times, stay validity, and entry rules—then start your pre-checked visa application in minutes.
              </p>
            </div>

            <div className="lg:col-span-5 grid grid-cols-3 gap-2.5">
              <div className="rounded-[16px] bg-white/12 backdrop-blur-md border border-white/20 p-3 text-left">
                <p className="font-mono text-lg sm:text-xl font-medium text-white">
                  99.2%
                </p>
                <p className="text-[11px] text-white/75 mt-0.5">
                  First-try approval
                </p>
              </div>
              <div className="rounded-[16px] bg-white/12 backdrop-blur-md border border-white/20 p-3 text-left">
                <p className="font-mono text-lg sm:text-xl font-medium text-white">
                  2–15d
                </p>
                <p className="text-[11px] text-white/75 mt-0.5">
                  Processing window
                </p>
              </div>
              <div className="rounded-[16px] bg-white/12 backdrop-blur-md border border-white/20 p-3 text-left">
                <p className="font-mono text-lg sm:text-xl font-medium text-white">
                  100%
                </p>
                <p className="text-[11px] text-white/75 mt-0.5">
                  Document pre-check
                </p>
              </div>
            </div>
          </div>

          {/* Embedded Unified Visa Search Bar */}
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
                  label="Visa permit type"
                  value={selectedType}
                  onChange={(e) =>
                    triggerFilterChange(() => setSelectedType(e.target.value))
                  }
                >
                  {visaTypesList.map((type) => (
                    <option key={type} value={type} className="bg-surface text-ink">
                      {type === "All" ? "All visa categories" : `${type} Visa`}
                    </option>
                  ))}
                </BarSelect>
              </div>

              <div className="md:col-span-3">
                <BarInput
                  id="visa-search-input"
                  label="Quick search"
                  type="search"
                  withSearchIcon
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Country, region, or code..."
                />
              </div>

              <div className="md:col-span-2 pt-2 md:pt-0 md:pl-2.5 flex justify-end border-none">
                <BarSubmitButton className="w-full justify-between">
                  Find Visas
                </BarSubmitButton>
              </div>
            </form>
          </SearchBarShell>
        </div>
      </div>

      {/* Simple 3-Step Visa Guide Strip + Category Filter Pills */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 rounded-[22px] border border-line bg-surface p-3.5 sm:px-5">
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
              {type === "All" ? "All Permits" : `${type} Visa`}
            </FilterChip>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4 text-xs text-ink-muted border-t lg:border-t-0 pt-2.5 lg:pt-0 border-line">
          <div className="hidden xl:flex items-center gap-3 text-[12px] text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <FileCheck2 className="h-3.5 w-3.5 text-ink" strokeWidth={1.6} />
              Passport scan + photo only
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-ink" strokeWidth={1.6} />
              Embassy fee included
            </span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <span aria-live="polite" className="font-mono text-xs">
              Showing{" "}
              <strong className="text-ink font-medium">{filteredOffers.length}</strong>{" "}
              {filteredOffers.length === 1 ? "visa permit" : "visa permits"}
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
      </div>

      {/* Results — Official Entry Permit / Passport Visa Cards */}
      {isFiltering ? (
        <CardSkeleton count={6} />
      ) : filteredOffers.length === 0 ? (
        <div className="rounded-[24px] border border-line bg-surface py-14 px-6 text-center space-y-3">
          <p className="text-sm text-ink-muted">
            No visa permits match your current country or category filter.
          </p>
          <Button variant="secondary" size="sm" onClick={clearFilters}>
            Show all visas
          </Button>
        </div>
      ) : (
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredOffers.map((offer) => (
            <Card
              key={offer.id}
              data-visa-card
              interactive
              padding="none"
              className="group flex flex-col justify-between overflow-hidden rounded-[22px]"
            >
              <div>
                {/* Top Official Entry Permit Header Bar */}
                <div className="flex items-center justify-between gap-3 px-4 py-3.5 border-b border-line bg-bg/55">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      aria-hidden="true"
                      className="flex h-10 w-11 shrink-0 items-center justify-center rounded-[12px] border border-line bg-surface font-mono text-xs font-semibold tracking-wider text-ink shadow-2xs"
                    >
                      {offer.flag}
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted">
                        Entry Permit · {offer.region}
                      </p>
                      <h2 className="text-[17px] font-medium tracking-[-0.015em] text-ink truncate">
                        {offer.country}
                      </h2>
                    </div>
                  </div>

                  <Badge tone="ink" className="shrink-0">
                    {offer.visaType} Visa
                  </Badge>
                </div>

                {/* Destination Landmark Visual */}
                <div className="px-3 pt-3">
                  <div className="relative aspect-[16/9] w-full rounded-[14px] overflow-hidden bg-surface-2">
                    <Image
                      src={offer.image}
                      alt={`${offer.country} ${offer.visaType} visa`}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 95vw"
                      placeholder="blur"
                      blurDataURL={BLUR_DATA_URL}
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-black/65 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-white">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" strokeWidth={2} aria-hidden="true" />
                      e-Visa / Embassy Verified
                    </div>
                  </div>
                </div>

                {/* 3-Column Official Visa Spec Stamp Box */}
                <div className="px-3 pt-3">
                  <div className="grid grid-cols-3 divide-x divide-line rounded-[14px] border border-line/80 bg-bg/65 py-2.5 px-1 text-center">
                    <div className="px-1.5">
                      <p className="inline-flex items-center justify-center gap-1 text-[10px] font-mono uppercase tracking-wider text-ink-muted">
                        <Clock className="h-3 w-3" strokeWidth={1.6} aria-hidden="true" />
                        Processing
                      </p>
                      <p className="mt-0.5 font-mono text-xs font-medium text-ink">
                        {offer.processingDays}
                      </p>
                    </div>
                    <div className="px-1.5">
                      <p className="inline-flex items-center justify-center gap-1 text-[10px] font-mono uppercase tracking-wider text-ink-muted">
                        <Calendar className="h-3 w-3" strokeWidth={1.6} aria-hidden="true" />
                        Validity
                      </p>
                      <p className="mt-0.5 font-mono text-xs font-medium text-ink">
                        {offer.validity}
                      </p>
                    </div>
                    <div className="px-1.5">
                      <p className="inline-flex items-center justify-center gap-1 text-[10px] font-mono uppercase tracking-wider text-ink-muted">
                        <Repeat className="h-3 w-3" strokeWidth={1.6} aria-hidden="true" />
                        Entry
                      </p>
                      <p className="mt-0.5 font-mono text-xs font-medium text-ink">
                        {offer.entry}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Visa Highlights Preview Chips */}
                <div className="px-3.5 pt-3 pb-2 flex flex-wrap items-center gap-1.5">
                  {offer.highlights.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-bg px-2.5 py-0.5 text-[11px] font-medium text-ink-muted border border-line/70"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Embassy Fee + Apply CTA */}
              <div className="mx-3 mb-3 mt-2 rounded-[14px] bg-bg/50 border border-line/60 px-3.5 py-2.5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10.5px] text-ink-muted leading-tight">
                    Total visa &amp; consular fee
                  </p>
                  <div className="mt-0.5 flex items-baseline gap-1">
                    <span className="font-mono text-lg font-medium text-ink">
                      {formatUsd(offer.priceUsd)}
                    </span>
                    <span className="text-xs text-ink-muted">/ applicant</span>
                  </div>
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
                    Apply for {activeVisa.country} Visa
                  </h2>
                  <p className="font-mono text-xs text-ink-muted mt-0.5">
                    Embassy &amp; processing fee: {formatUsd(activeVisa.priceUsd)} / person
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
                label="Applicant full name (as on passport)"
                placeholder="Alex Morgan"
                error={errors.fullName?.message}
                {...register("fullName")}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputField
                  id="visa-app-email"
                  type="email"
                  label="Email for visa delivery"
                  placeholder="alex@example.com"
                  error={errors.email?.message}
                  {...register("email")}
                />
                <InputField
                  id="visa-app-passport"
                  label="Passport nationality"
                  placeholder="United Kingdom"
                  error={errors.passportCountry?.message}
                  {...register("passportCountry")}
                />
              </div>
              <InputField
                id="visa-app-date"
                type="date"
                label="Planned arrival date"
                error={errors.travelDate?.message}
                {...register("travelDate")}
              />
              <TextareaField
                id="visa-app-notes"
                label="Additional notes (optional)"
                placeholder="Number of applicants, expedited request, or questions..."
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
                  {isSubmitting ? "Submitting..." : "Submit visa application"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
