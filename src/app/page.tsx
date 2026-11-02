import { Suspense } from "react";
import { Hero } from "@/components/sections/Hero";
import { WhyChooseUsSection } from "@/components/sections/WhyChooseUs";
import { DestinationsSection } from "@/components/sections/Destinations";
import { ServicesSection } from "@/components/sections/Services";
import { HowItWorksSection } from "@/components/sections/HowItWorks";
import { TestimonialsSection } from "@/components/sections/Testimonials";
import { ContactSection } from "@/components/sections/Contact";
import { CtaBannerSection } from "@/components/sections/CtaBanner";

export default function HomePage() {
  return (
    <main id="main" className="flex-1">
      <Hero />
      <Suspense>
        <WhyChooseUsSection />
      </Suspense>
      <Suspense>
        <DestinationsSection />
      </Suspense>
      <Suspense>
        <ServicesSection />
      </Suspense>
      <Suspense>
        <HowItWorksSection />
      </Suspense>
      <Suspense>
        <TestimonialsSection />
      </Suspense>
      <Suspense>
        <ContactSection />
      </Suspense>
      <Suspense>
        <CtaBannerSection />
      </Suspense>
    </main>
  );
}
