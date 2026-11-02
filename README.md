# Velora — Travel Agency Website

Modern, responsive travel agency frontend offering **Visa Assistance**, **Airline Ticketing**, **Hotel Booking**, and **Car Rental**. Built as a frontend-only application with realistic mock data, interactive search and filtering, GSAP + ScrollTrigger animations, Lenis smooth scroll, and DOM-synced Three.js WebGL image planes.

## Tech Stack
- **Framework**: Next.js 16.4.3 (App Router, Static Prerendering), React 19.2.4, TypeScript 5
- **Styling**: Tailwind CSS v4 + CSS custom properties (`src/app/globals.css`)
- **Typography**: `next/font/google` (`Geist` and `Geist_Mono`)
- **Animation & Scroll**: GSAP 3.15 + `ScrollTrigger` + `SplitText` (`@gsap/react` `useGSAP`), `lenis` smooth scroll synced to `gsap.ticker` and `ScrollTrigger`
- **WebGL Layer**: `three` (DOM-synced WebGL image planes with subtle scroll-velocity wave/RGB shift and soft hover ripple, dynamically loaded after idle on capable desktop devices)
- **Forms & Validation**: `react-hook-form` + `zod` + `@hookform/resolvers`
- **Icons & Media**: `lucide-react`, `next/image` (50 verified local Unsplash/Pexels photographs in `public/images/`)

## Getting Started

```bash
npm install
npm run dev                  # http://localhost:3000 (development server)
npm run lint                 # ESLint check
node scripts/check-images.mjs # Verify all 50 image paths in public/images/
npm run build && npm run start # Production build and server
```

Node 20+ recommended (verified on Node 24.22.1).

## One-Page vs Multi-Page Decision
Chose a **hybrid architecture**:
- The **Home page (`/`)** presents all 9 required sections (Navbar, Hero with unified 4-service search widget, Why Choose Us & Stats, Featured Destinations, Core Services overview, How It Works, Client Testimonials, Contact Enquiry Form, CTA Collage Banner, and Newsletter Footer) so visitors and reviewers can experience the entire brand story and jump straight into any booking flow from the first viewport.
- Dedicated **Service Desk routes (`/visa`, `/tickets`, `/hotels`, `/cars`)** give each of the 4 core travel services full room for multi-criteria filtering, interactive drawers/cards, and pre-filled enquiry dialogs via URL query parameters (`?country=`, `?from=`, `?city=`, `?category=`), while keeping the home page bundle lean and demonstrating App Router navigation.

## Design Decisions
- **Image-Rich Minimalist Editorial Direction**: Warm gallery paper background (`#F4F4F2` light / `#0A0A0A` dark), pure surface cards (`#FFFFFF` / `#141414`), carbon ink typography (`#0A0A0A` / `#FAFAFA`), hairline borders (`1px solid var(--line)`), and a single focus accent (`#0B5FFF` / `#6EA0FF`) with zero decorative gradients on buttons or text.
- **Full-Width Fluid Container**: Full-bleed viewport layout (`w-full max-w-[2400px] px-[clamp(12px,1.4vw,24px)]`) so the hero frame, floating navbar pills, and all bento grids share a tight 12–24px viewport gutter across 360px–2560px screens.
- **Floating Glass Pill Navbar**: Transparent `<header>` wrapper (`pointer-events-none`) with glass blur (`80%` surface + `backdrop-blur` + hairline border, strengthening on scroll) applied exclusively to the three floating pills (Brand pill, Center nav pill with thin scroll-progress indicator, and Right actions pill).
- **Unified In-Hero Booking Bar**: The 4-tab booking widget (`Visa`, `Flights`, `Hotels`, `Cars`) sits completely inside the bottom edge of the `calc(100svh - var(--navbar-h) - var(--gutter))` hero photo frame on desktop and stacks cleanly in a 2-column grid inside the hero on mobile.
- **Compact Section & Card Rhythm**: Tightened section padding (`py-8 md:py-12 lg:py-14`), `12px` (`gap-3`) bento grid gaps, `8–10px` photo insets inside service cards with desktop vertical stagger (`lg:mt-7` / `lg:mb-7`), 3-column `[23%_1fr_23%]` Destinations showcase (~54% center featured card + 2 aligned thumbnails per side + top-right controls), equal-height 3-column Testimonials row, and a bleeding 3-photo tilted CTA collage with integrated `"Have a Question?"` prompt.
- **Dark Mode**: Instant theme switching via `[data-theme="dark"]` CSS custom properties and Tailwind v4 `@custom-variant dark`, persisted in `localStorage` with an inline head script to prevent flash of wrong theme.

## Animation (GSAP + Lenis + Three.js WebGL)
- **Lenis Smooth Scroll (`src/components/layout/SmoothScroll.tsx`)**: Synced with `ScrollTrigger.update` and driven by `gsap.ticker` (`lagSmoothing(0)`). Intercepts in-page `#hash` links via `lenis.scrollTo` and disables automatically when `prefers-reduced-motion: reduce` is active.
- **Hero Intro Timeline (`src/components/sections/Hero.tsx`)**: Word-masked `SplitText` headline reveal (with descender-safe mask padding), staggered eyebrow/subtitle/CTA entrance, and bottom search widget slide-up, while keeping the LCP hero `<Image>` immediately visible in SSR HTML (`[data-hero]:not([data-hero="image"])`).
- **ScrollTrigger Batch Reveals & Scrubs**: Scoped `ScrollTrigger.batch` reveals (`src/hooks/useReveal.ts`), hero and about image vertical parallax, animated stat counters (`src/components/sections/WhyChooseUs.tsx`), horizontal step-connector line draw (`src/components/sections/HowItWorks.tsx`), service card hover scale + arrow rotation (`src/components/sections/Services.tsx`), and magnetic CTA buttons (`src/components/ui/MagneticButton.tsx`).
- **DOM-Synced Three.js WebGL Image Planes (`src/components/webgl/` & `src/hooks/useWebGLImage.ts`)**:
  - A single fixed transparent `<canvas>` (`pointer-events: none`, `z-[2]`) renders shader planes aligned to registered DOM `<Image>` containers (Hero photo, Why Choose Us tall photo, Featured Destination card, and the 3 tilted CTA collage photos).
  - Fragment and vertex shaders (`src/components/webgl/shaders.ts`) apply cover UV mapping, rounded-rectangle SDF clipping (including parent container clip bounds and 2px white borders on tilted CTA photos), subtle scroll-velocity wave/RGB shift driven by `window.__lenis.velocity`, and soft pointer hover displacement.
  - Strictly gated by `canUseWebGLImages()` (`min-width: 1024px`, `(hover: hover) and (pointer: fine)`, `prefers-reduced-motion: no-preference`, `navigator.hardwareConcurrency >= 4`) and dynamically imported after `window` load + `requestIdleCallback` so mobile/tablet devices download zero Three.js bytes.
  - Capped at DPR `1.5`, pauses the `gsap.ticker` render loop via `IntersectionObserver` and `visibilitychange` when no plane is visible, disposes all geometries/materials/textures on unmount, and falls back cleanly to the underlying DOM `<Image>` on `webglcontextlost`.

## Accessibility and Performance
- **Accessibility**: Semantic landmarks (`<header>`, `<nav>`, `<main id="main">`, `<section aria-labelledby>`, `<footer>`), skip-to-content link, keyboard-accessible WAI-ARIA tabs (`ArrowLeft`/`ArrowRight`/`Home`/`End`), full-screen mobile menu with `aria-expanded` and `Escape` key handling, `aria-live="polite"` filter result counts and testimonial announcements, visible `:focus-visible` outlines, and `>= 44px` touch targets.
- **Reduced Motion**: Full `prefers-reduced-motion: reduce` support across CSS (`src/app/globals.css`), `gsap.matchMedia()`, Lenis, and WebGL capability checks.
- **Lighthouse Mobile Audit (Production Build on `/`)**:
  - **Performance**: **94** (FCP `0.9s`, LCP `2.8s`, TBT `150ms`, CLS `0`, Speed Index `2.2s`)
  - **Accessibility**: **97**
  - **Best Practices**: **100**
  - **SEO**: **100**

## Project Structure

```text
src/
├── app/
│   ├── globals.css          # Color, radius, and compact spacing tokens + reduced-motion rules
│   ├── layout.tsx           # Root layout, Geist fonts, theme init script, SmoothScroll, WebGL mount
│   ├── page.tsx             # Home page with selective Suspense hydration boundaries
│   ├── template.tsx         # Client-navigation route entrance transition
│   ├── visa/page.tsx        # Visa desk route
│   ├── tickets/page.tsx     # Flights desk route
│   ├── hotels/page.tsx      # Hotels desk route
│   └── cars/page.tsx        # Car rental desk route
├── components/
│   ├── layout/              # Navbar (floating glass pills), Footer, ThemeToggle, SmoothScroll
│   ├── sections/            # Hero, WhyChooseUs, Destinations, Services, HowItWorks, Testimonials, Contact, CtaBanner
│   ├── search/              # SearchTabs unified 4-service booking bar
│   ├── webgl/               # WebGLImageMount, WebGLImageLayer, GLSL shaders
│   ├── visa/                # VisaDeskClient
│   ├── tickets/             # FlightDeskClient
│   ├── hotels/              # HotelDeskClient
│   ├── cars/                # CarDeskClient
│   └── ui/                  # Container, Button, Card, SectionHeading, FormFields, Toast, MagneticButton
├── data/                    # Typed mock datasets (visas, flights, hotels, cars, destinations, services, stats, testimonials)
├── hooks/                   # useReveal, useWebGLImage
└── lib/                     # Shared GSAP plugin registry (gsap.ts), utils, webgl-capability
```

## Incomplete / Future Work
- **Frontend-Only Mock Data**: All search results, flight schedules, visa checklists, hotel availability, and form submissions run entirely against local typed datasets with simulated client-side toast confirmations; no backend database, payment gateway, or live GDS/airline API is connected.
- **Route Exit Transitions**: Route entrance transitions are implemented in `src/app/template.tsx`, while full exit animations before Next.js App Router unmount are omitted to keep navigation instant.
- **User Accounts & Saved Itineraries**: Multi-service cart persistence and user authentication are outside the scope of this frontend assessment.

## Credits
- Photography sourced from verified **Unsplash** and **Pexels** photographers and stored locally in `public/images/`. See [`CREDITS.md`](./CREDITS.md) for the complete 50-image attribution table.
- Icons by [Lucide](https://lucide.dev/).
