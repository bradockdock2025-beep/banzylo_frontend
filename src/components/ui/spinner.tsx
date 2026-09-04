// Minimal ring spinner — thin stroke, no shadow/fill, matches the site's
// bare-minimum loading language (see InfiniteScrollSentinel, CartDrawer).
export function Spinner({ className = "h-4 w-4 text-neutral-400" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" role="status" aria-label="Loading">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="14 42" />
    </svg>
  );
}
