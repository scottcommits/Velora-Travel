import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main id="main" className="flex-1 flex items-center justify-center py-24">
      <Container className="text-center max-w-md space-y-5">
        <p className="font-mono text-xs text-ink-muted">404</p>
        <h1 className="text-3xl font-medium tracking-[-0.03em] text-ink">
          Page not found.
        </h1>
        <p className="text-sm text-ink-muted">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="pt-2">
          <ButtonLink href="/" variant="primary" size="md">
            Back to home
          </ButtonLink>
        </div>
      </Container>
    </main>
  );
}
