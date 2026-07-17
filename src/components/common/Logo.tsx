import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { SITE } from "@/constants/site";

export function Logo({
  compact = false,
  hideSubtitle = false,
  variant = "default",
  asLink = true,
  className,
}: {
  compact?: boolean;
  /** Kept for callers; wordmark image already includes the tagline. */
  hideSubtitle?: boolean;
  variant?: "default" | "onBrand";
  /** Set false when Logo is already wrapped in a parent Link. */
  asLink?: boolean;
  className?: string;
}) {
  void hideSubtitle;
  const onBrand = variant === "onBrand";

  const mark = compact ? (
    <span
      aria-hidden
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-lg bg-white",
        "h-9 w-9",
      )}
    >
      {/* Crop to the hexagonal mark on the left of the wordmark */}
      <img
        src={SITE.logo}
        alt=""
        decoding="async"
        className="absolute left-[-8%] top-1/2 h-[155%] w-auto max-w-none -translate-y-1/2 object-cover object-left"
      />
    </span>
  ) : (
    <img
      src={SITE.logo}
      alt={SITE.name}
      decoding="async"
      className={cn(
        "h-10 w-auto object-contain object-left sm:h-11",
        onBrand && "rounded-md bg-white px-2 py-1 shadow-soft",
      )}
    />
  );

  const classes = cn(
    "group inline-flex shrink-0 flex-nowrap items-center whitespace-nowrap",
    compact && "justify-center",
    className,
  );

  if (!asLink) {
    return (
      <span className={classes} aria-label={SITE.name}>
        {mark}
      </span>
    );
  }

  return (
    <Link to="/marketplace" className={classes} aria-label={`${SITE.name} home`}>
      {mark}
    </Link>
  );
}
