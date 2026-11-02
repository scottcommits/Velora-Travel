"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Clock, ShieldCheck } from "lucide-react";
import { sectionPhotography } from "@/data/stats";
import { enquirySchema, type EnquiryInput } from "@/lib/validators";
import { BLUR_DATA_URL, cn } from "@/lib/utils";
import { useReveal } from "@/hooks/useReveal";
import { Container } from "@/components/ui/Container";
import { InputField, SelectField, TextareaField } from "@/components/ui/FormFields";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const SERVICE_OPTIONS: { value: EnquiryInput["service"]; label: string }[] = [
  { value: "Visa", label: "Visa Assistance" },
  { value: "Tickets", label: "Flight Tickets" },
  { value: "Hotels", label: "Hotel Stays" },
  { value: "Car Rental", label: "Car Rental" },
];

export function ContactSection() {
  const scope = useRef<HTMLElement>(null);
  const { notify } = useToast();
  const [submittedData, setSubmittedData] = useState<EnquiryInput | null>(null);

  useReveal(scope);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryInput>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      service: "Visa",
      message: "",
      consent: false,
    },
  });

  const activeService = useWatch({
    control,
    name: "service",
    defaultValue: "Visa",
  });

  const onSubmit = async (data: EnquiryInput) => {
    await new Promise((resolve) => setTimeout(resolve, 450));
    setSubmittedData(data);
    notify({
      title: "Message sent",
      description: `We received your ${data.service.toLowerCase()} enquiry and will reply shortly.`,
    });
    reset();
  };

  return (
    <section
      id="contact"
      ref={scope}
      aria-labelledby="contact-heading"
      className="py-8 md:py-12 lg:py-14"
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
          {/* Left column: Large rounded photo with overlaid contact info */}
          <div
            data-reveal
            className="lg:col-span-5 relative min-h-[360px] rounded-[24px] overflow-hidden border border-line bg-ink p-6 sm:p-7 flex flex-col justify-between text-white"
          >
            <Image
              src={sectionPhotography.heroSecondary}
              alt="Wooden boat on a calm emerald alpine lake surrounded by mountain peaks"
              fill
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              sizes="(min-width: 1024px) 40vw, 94vw"
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/25"
            />

            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 px-3 py-1 text-[11px] font-medium text-white mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Direct Travel Desk
              </span>
              <h2
                id="contact-heading"
                className="text-[clamp(1.85rem,3.2vw,2.75rem)] font-medium tracking-[-0.03em] leading-[1.06] text-white"
              >
                Plan your trip with our specialists.
              </h2>
              <p className="mt-2.5 text-sm text-white/85 leading-relaxed max-w-sm">
                Share your destination and dates—our desk prepares tailored visa checklists, flight holds, hotel rates, and chauffeur options.
              </p>
            </div>

            <div className="relative z-10 mt-6 space-y-2.5">
              <div className="rounded-[18px] bg-white/14 backdrop-blur-md border border-white/25 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-white/70 text-[11px]">Direct Email</p>
                  <a
                    href="mailto:hello@velora.travel"
                    className="mt-0.5 block font-medium text-white text-[13.5px] hover:underline"
                  >
                    hello@velora.travel
                  </a>
                </div>
                <div>
                  <p className="text-white/70 text-[11px]">24/7 Concierge Desk</p>
                  <p className="mt-0.5 font-mono font-medium text-white text-[13.5px]">
                    +44 20 7946 0921
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 px-1 text-[11.5px] text-white/80">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-white/90" strokeWidth={1.6} />
                  Reply under 2 hours
                </span>
                <span aria-hidden="true" className="text-white/35">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-white/90" strokeWidth={1.6} />
                  No upfront booking fee
                </span>
              </div>
            </div>
          </div>

          {/* Right column: Cohesive Velora inquiry console */}
          <div
            data-reveal
            className="lg:col-span-7 rounded-[24px] border border-line bg-surface p-5 sm:p-7 flex flex-col justify-between"
          >
            {submittedData ? (
              <div
                role="status"
                className="h-full flex flex-col items-start justify-center space-y-4 py-8 px-2"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-ink text-bg">
                  <Check className="h-5 w-5" strokeWidth={2} />
                </span>
                <div className="space-y-1.5">
                  <p className="text-xs font-mono uppercase tracking-wider text-ink-muted">
                    Enquiry Received
                  </p>
                  <h3 className="text-2xl font-medium tracking-[-0.02em] text-ink">
                    Thank you, {submittedData.name}.
                  </h3>
                  <p className="text-sm text-ink-muted leading-relaxed max-w-md">
                    We have assigned your{" "}
                    <span className="font-medium text-ink">
                      {submittedData.service.toLowerCase()}
                    </span>{" "}
                    request to a specialist and sent a confirmation copy to{" "}
                    <span className="font-medium text-ink">{submittedData.email}</span>.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setSubmittedData(null)}
                >
                  Send another enquiry
                </Button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="space-y-4"
              >
                {/* Top bar: Service pill switcher matching the Hero Search widget */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-line">
                  <div>
                    <p className="text-[11px] font-medium text-ink-muted">
                       What can we arrange for you?
                    </p>
                    <p className="text-[15px] font-medium text-ink tracking-[-0.01em]">
                      Select a travel desk
                    </p>
                  </div>

                  <div
                    role="group"
                    aria-label="Select travel service"
                    className="inline-flex flex-wrap items-center gap-1 rounded-full bg-bg p-1 border border-line/80"
                  >
                    {SERVICE_OPTIONS.map((item) => {
                      const isActive = activeService === item.value;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() =>
                            setValue("service", item.value, {
                              shouldValidate: true,
                              shouldDirty: true,
                            })
                          }
                          className={cn(
                            "rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                            isActive
                              ? "bg-ink text-bg shadow-xs"
                              : "text-ink-muted hover:text-ink"
                          )}
                        >
                          {item.value === "Tickets" ? "Flights" : item.value}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InputField
                    id="enquiry-name"
                    label="Full name"
                    placeholder="Alex Morgan"
                    error={errors.name?.message}
                    {...register("name")}
                  />
                  <InputField
                    id="enquiry-email"
                    type="email"
                    label="Email address"
                    placeholder="alex@example.com"
                    error={errors.email?.message}
                    {...register("email")}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InputField
                    id="enquiry-phone"
                    type="tel"
                    label="Phone number (optional)"
                    placeholder="+44 7700 900077"
                    error={errors.phone?.message}
                    {...register("phone")}
                  />
                  <SelectField
                    id="enquiry-service"
                    label="Service category"
                    value={activeService}
                    error={errors.service?.message}
                    options={SERVICE_OPTIONS}
                    {...register("service")}
                  />
                </div>

                <TextareaField
                  id="enquiry-message"
                  label="Trip details & dates"
                  placeholder="Tell us your destination, preferred travel dates, number of travelers, or any special requests..."
                  error={errors.message?.message}
                  {...register("message")}
                />

                <div className="space-y-1.5">
                  <label className="flex items-center gap-3 rounded-[14px] border border-line/80 bg-bg/45 px-3.5 py-2.5 cursor-pointer text-xs text-ink-muted hover:border-ink/30 transition-colors">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-line accent-ink shrink-0 cursor-pointer"
                      aria-invalid={errors.consent ? true : undefined}
                      aria-describedby={
                        errors.consent ? "consent-error" : undefined
                      }
                      {...register("consent")}
                    />
                    <span className="leading-snug text-ink/85">
                      I agree to be contacted by Velora specialists regarding this travel enquiry.
                    </span>
                  </label>
                  {errors.consent ? (
                    <p
                      id="consent-error"
                      role="alert"
                      className="px-1 text-xs font-medium text-error"
                    >
                      {errors.consent.message}
                    </p>
                  ) : null}
                </div>

                <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs text-ink-muted">
                    Direct specialist response • No spam, ever.
                  </p>
                  <Button
                    type="submit"
                    size="lg"
                    withArrow
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send enquiry"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
