"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, Compass, Globe, Mail, Share2 } from "lucide-react";
import { footerLinks } from "@/data/nav";
import { newsletterSchema } from "@/lib/validators";
import { Container } from "@/components/ui/Container";

export function Footer() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onNewsletterSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const parsed = newsletterSchema.safeParse({ email });
    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ?? "Enter a valid email address"
      );
      return;
    }
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setSubscribed(true);
      setEmail("");
    }, 400);
  };

  return (
    <footer className="border-t border-line bg-bg pt-8 pb-6 md:pt-12 md:pb-8 overflow-hidden">
      <Container>
        {/* Top Centered "Stay in the loop" + Email Pill + Round Social Icons */}
        <div className="mx-auto max-w-xl text-center space-y-4 pb-8 border-b border-line">
          <h2 className="text-[clamp(1.75rem,3.2vw,2.5rem)] font-medium tracking-[-0.03em] leading-[1.06] text-ink">
            Stay in the loop
          </h2>
          <p className="text-sm text-ink-muted leading-snug">
            Receive seasonal route updates, visa requirement alerts, and curated hotel openings directly in your inbox.
          </p>

          {subscribed ? (
            <p
              role="status"
              className="inline-flex items-center rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-medium text-ink"
            >
              Thanks for subscribing. You are on the list.
            </p>
          ) : (
            <form
              onSubmit={onNewsletterSubmit}
              noValidate
              className="mx-auto max-w-sm"
            >
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Email address for newsletter
              </label>
              <div className="flex items-center rounded-full border border-line bg-surface pl-4 pr-1 py-1 focus-within:border-ink">
                <input
                  id="footer-newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@velora.travel"
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "newsletter-error" : undefined}
                  className="flex-1 min-w-0 bg-transparent text-base sm:text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  aria-label="Subscribe to newsletter"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-bg hover:opacity-88 transition-opacity cursor-pointer disabled:opacity-50"
                >
                  <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
              {error ? (
                <p
                  id="newsletter-error"
                  role="alert"
                  className="mt-2 text-xs font-medium text-error"
                >
                  {error}
                </p>
              ) : null}
            </form>
          )}

          {/* Round social buttons */}
          <div className="flex items-center justify-center gap-2 pt-0.5">
            {[
              { name: "Website", href: "https://velora-travel.vercel.app", Icon: Globe },
              { name: "Email", href: "mailto:hello@velora.travel", Icon: Mail },
              { name: "Share", href: "https://x.com", Icon: Share2 },
            ].map(({ name, href, Icon }) => (
              <a
                key={name}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                aria-label={`Velora ${name}`}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-ink-muted hover:text-ink hover:border-ink transition-colors"
              >
                <Icon className="h-4 w-4" strokeWidth={1.6} />
              </a>
            ))}
          </div>
        </div>

        {/* Compact Link Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-7 border-b border-line text-sm">
          <div>
            <h3 className="text-xs font-medium text-ink-muted mb-3">
              Services
            </h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-ink hover:text-ink-muted transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium text-ink-muted mb-3">
              Company
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-ink hover:text-ink-muted transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium text-ink-muted mb-3">
              Support
            </h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-ink hover:text-ink-muted transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium text-ink-muted mb-3">
              Offices
            </h3>
            <address className="not-italic space-y-1.5 text-ink-muted">
              <p className="text-ink font-medium">London · Dubai</p>
              <p>hello@velora.travel</p>
              <p className="font-mono text-xs">+44 20 7946 0921</p>
            </address>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-muted">
          <p>© 2026 Velora Travel. All rights reserved.</p>
          <p>Visas · Flights · Hotels · Car Rental</p>
        </div>

        {/* Giant faded wordmark (unclipped letters) */}
        <div
          aria-hidden="true"
          className="mt-4 py-2 flex items-center justify-center gap-4 select-none pointer-events-none text-ink/[0.07]"
        >
          <Compass className="h-[13vw] w-[13vw] max-h-36 max-w-36 shrink-0" strokeWidth={1.2} />
          <span className="text-[16vw] xl:text-[210px] font-semibold tracking-[-0.05em] leading-[1.04]">
            Velora
          </span>
        </div>
      </Container>
    </footer>
  );
}
