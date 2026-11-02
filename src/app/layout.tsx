import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { WebGLImageMount } from "@/components/webgl/WebGLImageMount";

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://velora-travel.vercel.app"),
  title: {
    default: "Velora | Visa, Flights, Hotels and Car Rental",
    template: "%s | Velora",
  },
  description:
    "Visas, flights, hotels, and car rentals in one place. Clear pricing, simple booking, and support when you need it.",
  openGraph: {
    title: "Velora | Visa, Flights, Hotels and Car Rental",
    description:
      "Visas, flights, hotels, and car rentals in one place.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

const themeInitScript = `
(function() {
  try {
    var saved = localStorage.getItem('velora-theme');
    var theme = saved === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${sans.variable} ${mono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh flex flex-col bg-bg text-ink selection:bg-accent/20 selection:text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-bg"
        >
          Skip to content
        </a>
        <SmoothScroll>
          <ToastProvider>
            <Navbar />
            <div className="flex-1 flex flex-col">{children}</div>
            <Suspense>
              <Footer />
            </Suspense>
            <WebGLImageMount />
          </ToastProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
