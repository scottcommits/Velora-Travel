import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-lg bg-line/60", className)}
    />
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading options"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-[20px] border border-line bg-surface p-4 space-y-3"
        >
          <Skeleton className="aspect-[4/3] w-full rounded-[14px]" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <div className="pt-3 border-t border-line flex justify-between items-center">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
