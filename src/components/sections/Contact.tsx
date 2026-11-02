"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sectionPhotography } from "@/data/stats";
import { enquirySchema, type EnquiryInput } from "@/lib/validators";
import { BLUR_DATA_URL } from "@/lib/utils";
import { useReveal } from "@/hooks/useReveal";
import { Container } from "@/components/ui/Container";
import { InputField, SelectField, TextareaField } from "@/components/ui/FormFields";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function ContactSection() {
  const scope = useRef<HTMLElement>(null);
  const { notify } = useToast();
  const [submittedData, setSubmittedData] = useState<EnquiryInput | null>(null);

  useReveal(scope);

  const {
    register,
    handleSubmit,
    reset,
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
      className="py-12 md:py-16 lg:py-20"
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-stretch">
          {/* Left column: Large rounded photo with overlaid contact info */}
          <div
            data-reveal
            className="lg:col-span-5 relative min-h-[360px] rounded-[24px] overflow-hidden border border-line bg-ink p-6 sm:p-8 flex flex-col justify-between text-white"
          >
            <Image
              src={sectionPhotography.heroSecondary}
              alt="Wooden boat on a calm emerald alpine lake surrounded by mountain peaks"
              fill
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              sizes="(min-width: 1024px) 520px, 94vw"
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/25"
            />

            <div className="relative z-10">
              <p className="text-[13px] font-medium text-white/80 mb-1.5">
                Direct travel desk
              </p>
              <h2
                id="contact-heading"
                className="text-[clamp(1.75rem,3.2vw,2.75rem)] font-medium tracking-[-0.03em] leading-[1.06] text-white"
              >
                Send an enquiry.
              </h2>
              <p className="mt-2.5 text-sm text-white/85 leading-relaxed max-w-sm">
                Share your destination and dates—our specialists will prepare visa checklists, flight options, or hotel rates.
              </p>
            </div>

            <div className="relative z-10 mt-8 rounded-[16px] bg-white/15 backdrop-blur-md border border-white/25 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-white/75">Email</p>
                <a
                  href="mailto:hello@velora.travel"
                  className="font-medium text-white hover:underline"
                >
                  hello@velora.travel
                </a>
              </div>
              <div>
                <p className="text-white/75">Phone</p>
                <p className="font-mono font-medium text-white">
                  +44 20 7946 0921
                </p>
              </div>
            </div>
          </div>

          {/* Right column: Compact form inside a white card */}
          <div
            data-reveal
            className="lg:col-span-7 rounded-[20px] border border-line bg-surface p-6 sm:p-8"
          >
            {submittedData ? (
              <div
                role="status"
                className="h-full flex flex-col items-start justify-center space-y-4 py-8"
              >
                <h3 className="text-2xl font-medium text-ink">
                  Thank you, {submittedData.name}.
                </h3>
                <p className="text-sm text-ink-muted leading-relaxed max-w-md">
                  We have received your {submittedData.service.toLowerCase()} enquiry and sent a confirmation copy to{" "}
                  <span className="font-medium text-ink">{submittedData.email}</span>.
                </p>
                <Button
                  variant="secondary"
                  onClick={() => setSubmittedData(null)}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    label="Email"
                    placeholder="alex@example.com"
                    error={errors.email?.message}
                    {...register("email")}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    id="enquiry-phone"
                    type="tel"
                    label="Phone (optional)"
                    placeholder="+44 7700 900077"
                    error={errors.phone?.message}
                    {...register("phone")}
                  />
                  <SelectField
                    id="enquiry-service"
                    label="Service"
                    error={errors.service?.message}
                    options={[
                      { value: "Visa", label: "Visa" },
                      { value: "Tickets", label: "Flights" },
                      { value: "Hotels", label: "Hotels" },
                      { value: "Car Rental", label: "Car Rental" },
                    ]}
                    {...register("service")}
                  />
                </div>

                <TextareaField
                  id="enquiry-message"
                  label="Message"
                  placeholder="Tell us your destination and travel dates..."
                  error={errors.message?.message}
                  {...register("message")}
                />

                <div className="space-y-1">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-ink-muted">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-line accent-ink"
                      aria-invalid={errors.consent ? true : undefined}
                      aria-describedby={
                        errors.consent ? "consent-error" : undefined
                      }
                      {...register("consent")}
                    />
                    <span>
                      I agree to be contacted regarding this travel enquiry.
                    </span>
                  </label>
                  {errors.consent ? (
                    <p
                      id="consent-error"
                      role="alert"
                      className="text-xs font-medium text-error"
                    >
                      {errors.consent.message}
                    </p>
                  ) : null}
                </div>

                <div className="pt-1">
                  <Button
                    type="submit"
                    size="lg"
                    withArrow
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send message"}
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
