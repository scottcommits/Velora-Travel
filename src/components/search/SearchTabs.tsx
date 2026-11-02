"use client";

import { useState, useRef, type KeyboardEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight } from "lucide-react";
import { visaCountries, visaTypesList } from "@/data/visas";
import { popularAirports } from "@/data/flights";
import { carCategories } from "@/data/cars";
import {
  SearchBarShell,
  BarSelect,
  BarDate,
  BarSubmitButton,
  PriceRangeSlider,
} from "@/components/ui/FormFields";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

type TabId = "visa" | "tickets" | "hotels" | "cars";

const tabs: { id: TabId; label: string }[] = [
  { id: "visa", label: "Visa" },
  { id: "tickets", label: "Flights" },
  { id: "hotels", label: "Hotels" },
  { id: "cars", label: "Cars" },
];

const citizenshipOptions = [
  "United Kingdom",
  "United States",
  "United Arab Emirates",
  "Canada",
  "Germany",
  "France",
  "Singapore",
  "Australia",
];

const pickupLocations = [
  "Dubai Airport (DXB)",
  "London Heathrow (LHR)",
  "Istanbul Airport (IST)",
  "Geneva Airport (GVA)",
  "Milan Malpensa (MXP)",
  "Paris Charles de Gaulle (CDG)",
];

export function SearchTabs() {
  const router = useRouter();
  const { notify } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>("visa");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Visa state
  const [visaCountry, setVisaCountry] = useState("All");
  const [visaType, setVisaType] = useState("Tourist");
  const [nationality, setNationality] = useState("United Kingdom");

  // Flight state
  const [tripType, setTripType] = useState<"one-way" | "round-trip">("round-trip");
  const [flightFrom, setFlightFrom] = useState("London");
  const [flightTo, setFlightTo] = useState("Dubai");
  const [departDate, setDepartDate] = useState("2026-11-18");
  const [returnDate, setReturnDate] = useState("2026-11-26");
  const [flightError, setFlightError] = useState<string | null>(null);

  // Hotel state
  const [hotelCity, setHotelCity] = useState("All");
  const [hotelStars, setHotelStars] = useState("All");
  const [hotelMaxPrice, setHotelMaxPrice] = useState(850);

  // Car state
  const [carCategory, setCarCategory] = useState("SUV");
  const [carTransmission, setCarTransmission] = useState("Automatic");
  const [carCity, setCarCity] = useState("Dubai Airport (DXB)");

  const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index;
    if (e.key === "ArrowRight") {
      nextIndex = (index + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }
    e.preventDefault();
    const nextTab = tabs[nextIndex];
    if (nextTab) {
      setActiveTab(nextTab.id);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  const handleVisaSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (visaCountry !== "All") params.set("country", visaCountry);
    if (visaType !== "All") params.set("type", visaType);
    notify({
      title: "Searching visas",
      description: `Showing ${visaType.toLowerCase()} options for ${
        visaCountry === "All" ? "all countries" : visaCountry
      }.`,
    });
    router.push(`/visa?${params.toString()}`);
  };

  const handleFlightSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFlightError(null);
    if (flightFrom.trim().toLowerCase() === flightTo.trim().toLowerCase()) {
      setFlightError("Origin and destination cities must be different.");
      return;
    }
    if (tripType === "round-trip" && returnDate < departDate) {
      setFlightError("Return date must be on or after the departure date.");
      return;
    }
    const params = new URLSearchParams({
      trip: tripType,
      from: flightFrom,
      to: flightTo,
      depart: departDate,
    });
    if (tripType === "round-trip") params.set("return", returnDate);
    notify({
      title: "Searching flights",
      description: `${flightFrom} to ${flightTo}`,
    });
    router.push(`/tickets?${params.toString()}`);
  };

  const handleHotelSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (hotelCity !== "All") params.set("city", hotelCity);
    if (hotelStars !== "All") params.set("stars", hotelStars);
    params.set("maxPrice", String(hotelMaxPrice));
    notify({
      title: "Searching hotels",
      description: `Showing stays up to $${hotelMaxPrice} per night.`,
    });
    router.push(`/hotels?${params.toString()}`);
  };

  const handleCarSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (carCategory !== "All") params.set("category", carCategory);
    if (carTransmission !== "All") params.set("transmission", carTransmission);
    notify({
      title: "Searching cars",
      description: `Showing ${carCategory.toLowerCase()} options in ${carCity}.`,
    });
    router.push(`/cars?${params.toString()}`);
  };

  return (
    <SearchBarShell floating className="p-2.5 sm:p-3 bg-surface/95 backdrop-blur-xl">
      {/* Top bar: Service pill tabs + Trip type toggle on Flights */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-1.5 border-b border-line px-1">
        <div
          role="tablist"
          aria-label="Search travel services"
          className="flex items-center gap-1"
        >
          {tabs.map((tab, idx) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[idx] = el;
                }}
                id={`search-tab-${tab.id}`}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls={`search-panel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => onTabKeyDown(e, idx)}
                className={cn(
                  "min-h-11 rounded-full px-4 text-[13px] font-medium transition-colors cursor-pointer",
                  selected
                    ? "bg-ink text-bg"
                    : "bg-transparent text-ink-muted hover:text-ink"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "tickets" ? (
          <fieldset className="flex items-center gap-1">
            <legend className="sr-only">Trip type</legend>
            {(["round-trip", "one-way"] as const).map((mode) => (
              <label
                key={mode}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-full border px-3.5 text-[12px] font-medium cursor-pointer transition-colors",
                  tripType === mode
                    ? "bg-ink text-bg border-ink"
                    : "bg-surface text-ink-muted border-line hover:text-ink"
                )}
              >
                <input
                  type="radio"
                  name="hero-trip-type"
                  value={mode}
                  checked={tripType === mode}
                  onChange={() => setTripType(mode)}
                  className="sr-only"
                />
                <span>{mode === "round-trip" ? "Round-trip" : "One-way"}</span>
              </label>
            ))}
          </fieldset>
        ) : null}
      </div>

      {/* Tab Panel: VISA */}
      <div
        id="search-panel-visa"
        role="tabpanel"
        aria-labelledby="search-tab-visa"
        hidden={activeTab !== "visa"}
      >
        <form
          onSubmit={handleVisaSubmit}
          className="grid grid-cols-2 md:grid-cols-12 gap-2 md:gap-0 md:divide-x md:divide-line items-center"
        >
          <BarSelect
            id="hero-visa-country"
            label="Destination"
            value={visaCountry}
            onChange={(e) => setVisaCountry(e.target.value)}
            wrapperClassName="col-span-2 sm:col-span-1 md:col-span-4"
          >
            <option value="All" className="bg-surface text-ink">
              All destinations
            </option>
            {visaCountries.map((c) => (
              <option key={c} value={c} className="bg-surface text-ink">
                {c}
              </option>
            ))}
          </BarSelect>

          <BarSelect
            id="hero-visa-type"
            label="Visa type"
            value={visaType}
            onChange={(e) => setVisaType(e.target.value)}
            wrapperClassName="col-span-1 md:col-span-3"
          >
            {visaTypesList.map((t) => (
              <option key={t} value={t} className="bg-surface text-ink">
                {t === "All" ? "All types" : t}
              </option>
            ))}
          </BarSelect>

          <BarSelect
            id="hero-visa-nat"
            label="Citizenship"
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            wrapperClassName="col-span-1 md:col-span-3"
          >
            {citizenshipOptions.map((nat) => (
              <option key={nat} value={nat} className="bg-surface text-ink">
                {nat}
              </option>
            ))}
          </BarSelect>

          <div className="col-span-2 md:col-span-2 md:pl-3 flex justify-end">
            <BarSubmitButton className="w-full">Search</BarSubmitButton>
          </div>
        </form>
      </div>

      {/* Tab Panel: TICKETS */}
      <div
        id="search-panel-tickets"
        role="tabpanel"
        aria-labelledby="search-tab-tickets"
        hidden={activeTab !== "tickets"}
      >
        <form onSubmit={handleFlightSubmit} className="space-y-2">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-2 md:gap-0 md:divide-x md:divide-line items-center">
            <BarSelect
              id="hero-flight-from"
              label="From"
              value={flightFrom}
              onChange={(e) => setFlightFrom(e.target.value)}
              wrapperClassName="col-span-1 md:col-span-3"
            >
              {popularAirports.map((a) => (
                <option key={a.code} value={a.city} className="bg-surface text-ink">
                  {a.city} ({a.code})
                </option>
              ))}
            </BarSelect>

            <div className="hidden md:flex md:col-span-1 justify-center items-center px-1">
              <button
                type="button"
                onClick={() => {
                  setFlightFrom(flightTo);
                  setFlightTo(flightFrom);
                }}
                aria-label="Swap origin and destination cities"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink-muted hover:text-ink hover:border-ink transition-colors cursor-pointer"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
              </button>
            </div>

            <BarSelect
              id="hero-flight-to"
              label="To"
              value={flightTo}
              onChange={(e) => setFlightTo(e.target.value)}
              wrapperClassName="col-span-1 md:col-span-3"
            >
              {popularAirports.map((a) => (
                <option key={a.code} value={a.city} className="bg-surface text-ink">
                  {a.city} ({a.code})
                </option>
              ))}
            </BarSelect>

            <BarDate
              id="hero-flight-depart"
              label="Depart"
              value={departDate}
              onChange={(e) => setDepartDate(e.target.value)}
              wrapperClassName={cn(
                "col-span-1",
                tripType === "round-trip" ? "md:col-span-2" : "md:col-span-3"
              )}
            />

            {tripType === "round-trip" ? (
              <BarDate
                id="hero-flight-return"
                label="Return"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                wrapperClassName="col-span-1 md:col-span-1"
              />
            ) : null}

            <div className="col-span-2 md:col-span-2 md:pl-3 flex justify-end">
              <BarSubmitButton className="w-full">Search</BarSubmitButton>
            </div>
          </div>

          {flightError ? (
            <p role="alert" className="px-3 text-xs font-medium text-error">
              {flightError}
            </p>
          ) : null}
        </form>
      </div>

      {/* Tab Panel: HOTELS */}
      <div
        id="search-panel-hotels"
        role="tabpanel"
        aria-labelledby="search-tab-hotels"
        hidden={activeTab !== "hotels"}
      >
        <form
          onSubmit={handleHotelSubmit}
          className="grid grid-cols-2 md:grid-cols-12 gap-2 md:gap-0 md:divide-x md:divide-line items-center"
        >
          <BarSelect
            id="hero-hotel-city"
            label="City"
            value={hotelCity}
            onChange={(e) => setHotelCity(e.target.value)}
            wrapperClassName="col-span-1 md:col-span-3"
          >
            <option value="All" className="bg-surface text-ink">
              All cities
            </option>
            <option value="Dubai" className="bg-surface text-ink">
              Dubai
            </option>
            <option value="Istanbul" className="bg-surface text-ink">
              Istanbul
            </option>
            <option value="Maldives" className="bg-surface text-ink">
              Maldives
            </option>
            <option value="London" className="bg-surface text-ink">
              London
            </option>
            <option value="Kyoto" className="bg-surface text-ink">
              Kyoto
            </option>
            <option value="Santorini" className="bg-surface text-ink">
              Santorini
            </option>
          </BarSelect>

          <BarSelect
            id="hero-hotel-stars"
            label="Stars"
            value={hotelStars}
            onChange={(e) => setHotelStars(e.target.value)}
            wrapperClassName="col-span-1 md:col-span-3"
          >
            <option value="All" className="bg-surface text-ink">
              3, 4 & 5 stars
            </option>
            <option value="5" className="bg-surface text-ink">
              5 stars
            </option>
            <option value="4" className="bg-surface text-ink">
              4 stars
            </option>
            <option value="3" className="bg-surface text-ink">
              3 stars
            </option>
          </BarSelect>

          <div className="col-span-2 md:col-span-4 px-3.5 py-1.5">
            <PriceRangeSlider
              id="hero-hotel-price"
              min={180}
              max={1000}
              step={20}
              value={hotelMaxPrice}
              onChange={setHotelMaxPrice}
              label="Nightly rate"
            />
          </div>

          <div className="col-span-2 md:col-span-2 md:pl-3 flex justify-end">
            <BarSubmitButton className="w-full">Search</BarSubmitButton>
          </div>
        </form>
      </div>

      {/* Tab Panel: CARS */}
      <div
        id="search-panel-cars"
        role="tabpanel"
        aria-labelledby="search-tab-cars"
        hidden={activeTab !== "cars"}
      >
        <form
          onSubmit={handleCarSubmit}
          className="grid grid-cols-2 md:grid-cols-12 gap-2 md:gap-0 md:divide-x md:divide-line items-center"
        >
          <BarSelect
            id="hero-car-city"
            label="Pickup location"
            value={carCity}
            onChange={(e) => setCarCity(e.target.value)}
            wrapperClassName="col-span-2 md:col-span-4"
          >
            {pickupLocations.map((loc) => (
              <option key={loc} value={loc} className="bg-surface text-ink">
                {loc}
              </option>
            ))}
          </BarSelect>

          <BarSelect
            id="hero-car-cat"
            label="Category"
            value={carCategory}
            onChange={(e) => setCarCategory(e.target.value)}
            wrapperClassName="col-span-1 md:col-span-3"
          >
            {carCategories.map((c) => (
              <option key={c} value={c} className="bg-surface text-ink">
                {c === "All" ? "All categories" : c}
              </option>
            ))}
          </BarSelect>

          <BarSelect
            id="hero-car-trans"
            label="Transmission"
            value={carTransmission}
            onChange={(e) => setCarTransmission(e.target.value)}
            wrapperClassName="col-span-1 md:col-span-3"
          >
            <option value="All" className="bg-surface text-ink">
              All
            </option>
            <option value="Automatic" className="bg-surface text-ink">
              Automatic
            </option>
            <option value="Manual" className="bg-surface text-ink">
              Manual
            </option>
          </BarSelect>

          <div className="col-span-2 md:col-span-2 md:pl-3 flex justify-end">
            <BarSubmitButton className="w-full">Search</BarSubmitButton>
          </div>
        </form>
      </div>
    </SearchBarShell>
  );
}
