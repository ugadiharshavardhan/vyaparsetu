import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Factory, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfiniteCarousel } from "@/components/marketing/InfiniteCarousel";
import { CategoryImage } from "@/components/marketplace/CategoryCard";
import { useManufacturers } from "@/hooks/useCatalog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
const LEFT_LABELS = ["Manufacturers", "Distributors", "Wholesalers"] as const;
const RIGHT_LABELS = ["Kirana & Retail", "Marts", "Institutions"] as const;

/** Slice/rotate a pool of logo URLs for each marquee row. */
function rowImages(pool: string[], offset: number, count = 10): string[] {
  if (pool.length === 0) return [];
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.push(pool[(offset + i) % pool.length]!);
  }
  return out;
}

/** Numeric suffix so c1..c10 / s1..s10 sort naturally (not lexicographically). */
function slugNum(slug: string): number {
  const m = slug.match(/(\d+)\s*$/);
  return m ? Number(m[1]) : 0;
}

function Avatar({ src }: { src: string }) {
  return (
    <div
      data-scale-item
      className="mx-1 grid h-16 w-16 shrink-0 origin-center place-items-center overflow-hidden rounded-full border border-border bg-white p-2.5 shadow-soft will-change-transform sm:mx-1.5 sm:h-20 sm:w-20 sm:p-3 lg:h-[5.5rem] lg:w-[5.5rem]"
    >
      <CategoryImage src={src} alt="" className="h-full w-full object-contain" />
    </div>
  );
}

type ScaleMode = "shrink-to-right" | "grow-to-right";

function AvatarRow({
  images,
  offset,
  reverse,
  durationSec,
  loading,
  scaleMode,
}: {
  images: string[];
  offset: number;
  reverse?: boolean;
  durationSec: number;
  loading?: boolean;
  /** shrink-to-right: large on left → small near tags; grow-to-right: small near tags → large on right */
  scaleMode: ScaleMode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const root = rootRef.current;
      if (root) {
        const rootRect = root.getBoundingClientRect();
        const width = rootRect.width || 1;
        const items = root.querySelectorAll<HTMLElement>("[data-scale-item]");
        for (const el of items) {
          const r = el.getBoundingClientRect();
          const center = r.left + r.width / 2;
          const t = Math.min(1, Math.max(0, (center - rootRect.left) / width));
          // Keep readable range: 0.55 ↔ 1.0
          const scale =
            scaleMode === "shrink-to-right" ? 1 - t * 0.45 : 0.55 + t * 0.45;
          el.style.transform = `scale(${scale})`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scaleMode]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 overflow-hidden py-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-16 w-16 shrink-0 rounded-full sm:h-20 sm:w-20 lg:h-[5.5rem] lg:w-[5.5rem]"
          />
        ))}
      </div>
    );
  }

  const slice = rowImages(images, offset);
  if (slice.length === 0) return null;

  return (
    <div ref={rootRef} className="w-full">
      <InfiniteCarousel
        durationSec={durationSec}
        reverse={reverse}
        className="w-full py-1"
        trackClassName="items-center"
        pauseOnHover={false}
      >
        {slice.map((src, i) => (
          <Avatar key={`${offset}-${src}-${i}`} src={src} />
        ))}
      </InfiniteCarousel>
    </div>
  );
}

function LabelPill({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative z-20 inline-flex items-center justify-center whitespace-nowrap rounded-full bg-brand px-3.5 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-soft ring-1 ring-brand/30 sm:px-4 sm:py-2 sm:text-sm",
        wide && "min-w-[8.5rem] sm:min-w-[10rem]",
      )}
    >
      {children}
    </span>
  );
}

/** Soft white fade at the outer left / right edges of the logo marquee. */
function EdgeFade({ side }: { side: "left" | "right" }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-y-0 z-30 w-12 sm:w-20 lg:w-28 ${
        side === "left"
          ? "left-0 bg-gradient-to-r from-surface via-surface/80 to-transparent"
          : "right-0 bg-gradient-to-l from-surface via-surface/80 to-transparent"
      }`}
    />
  );
}

/** White fade where logos meet the category tag (inner junction). */
function JunctionFade({ side }: { side: "left" | "right" }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-y-0 z-[5] hidden w-10 sm:w-14 lg:block ${
        side === "left"
          ? "right-0 bg-gradient-to-l from-surface via-surface/90 to-transparent"
          : "left-0 bg-gradient-to-r from-surface via-surface/90 to-transparent"
      }`}
    />
  );
}

function CardHeaderSticker({ label }: { label: string }) {
  return (
    <div className="absolute bottom-4 right-4 z-10 rounded-xl bg-white px-3.5 py-2 text-brand shadow-elevated ring-1 ring-black/10">
      <span className="font-display text-xs font-bold uppercase tracking-wide sm:text-sm">
        {label}
      </span>
    </div>
  );
}

function CardIconHeader({
  icon: Icon,
  tone,
  sticker,
}: {
  icon: typeof Factory;
  tone: "light" | "brand";
  sticker: string;
}) {
  return (
    <div
      className={`relative px-7 py-10 sm:px-8 sm:py-12 ${
        tone === "light" ? "bg-brand-soft/40" : "bg-brand"
      }`}
    >
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-2xl shadow-soft ring-1 ring-black/5 sm:h-[4.5rem] sm:w-[4.5rem] ${
          tone === "light" ? "bg-white text-brand" : "bg-white/15 text-brand-foreground"
        }`}
      >
        <Icon className="h-8 w-8 sm:h-9 sm:w-9" strokeWidth={1.75} />
      </div>
      <CardHeaderSticker label={sticker} />
    </div>
  );
}
function FlowConnectors() {
  // Shared bezier endpoints relative to viewBox 0..1000 × 0..300
  // Paths extend behind the pills so no gap appears at the tag junction.
  const leftPaths = [
    "M270 48 C 390 48, 445 150, 500 150",
    "M270 150 L 500 150",
    "M270 252 C 390 252, 445 150, 500 150",
  ];
  const rightPaths = [
    { d: "M500 150 C 555 150, 610 48, 690 48", color: "var(--brand)" },
    { d: "M500 150 L 690 150", color: "var(--warning)" },
    { d: "M500 150 C 555 150, 610 252, 690 252", color: "oklch(0.72 0.12 95)" },
  ];

  return (
    <svg
      aria-hidden
      viewBox="0 0 1000 300"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-y-0 left-1/2 z-0 hidden h-full w-full max-w-4xl -translate-x-1/2 lg:block"
    >
      {/* Left: faint dashed lines converging into the hub */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {leftPaths.map((d) => (
          <path
            key={d}
            d={d}
            stroke="var(--brand)"
            strokeOpacity="0.35"
            strokeWidth="2.5"
            strokeDasharray="5 9"
          />
        ))}
      </g>

      {/* Right: thick colored “road” paths with dashed center line */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {rightPaths.map((p) => (
          <g key={p.d}>
            <path d={p.d} stroke={p.color} strokeOpacity="0.85" strokeWidth="20" />
            <path
              d={p.d}
              stroke="white"
              strokeOpacity="0.75"
              strokeWidth="3"
              strokeDasharray="7 10"
            />
          </g>
        ))}
      </g>
    </svg>
  );
}

export function NetworkSection({
  showCta = true,
  compact = false,
  className,
}: {
  /** Landing page register cards under the hub. */
  showCta?: boolean;
  /** Tighter padding for dashboard footer use. */
  compact?: boolean;
  className?: string;
}) {
  const { data: manufacturers = [], isLoading } = useManufacturers();

  const logosForPrefix = (prefix: string) =>
    manufacturers
      .filter((m) => m.slug.toLowerCase().startsWith(prefix) && !!m.logo)
      .sort((a, b) => slugNum(a.slug) - slugNum(b.slug))
      .map((m) => m.logo!.trim());

  // c1..c10 → left (sellers) ; s1..s10 → right (buyers)
  const leftLogos = logosForPrefix("c");
  const rightLogos = logosForPrefix("s");

  return (
    <section
      className={cn(
        "overflow-hidden bg-surface",
        compact ? "py-10 sm:py-12" : "py-20 sm:py-24 lg:pb-32 lg:pt-28",
        className,
      )}
    >
      <div className="container-page">
        <div className="text-center">
          {!compact && (
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              Building a wide network of
            </h2>
          )}
          <p
            className={cn(
              "font-display font-semibold tracking-tight text-brand",
              compact ? "text-base sm:text-lg" : "mt-2 text-lg sm:text-xl",
            )}
          >
            — Sellers &amp; Customers —
          </p>
        </div>
      </div>

      <div className="relative mt-6 w-full px-2 sm:mt-8 sm:px-4">
          <EdgeFade side="left" />
          <EdgeFade side="right" />

          <FlowConnectors />

          <div className="relative z-10 grid grid-cols-1 items-center gap-y-8 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-x-4">
            <div className="flex flex-col justify-center gap-6 sm:gap-8 lg:gap-10">
              {LEFT_LABELS.map((label, i) => (
                <div key={label} className="flex min-h-16 items-center gap-1.5 sm:min-h-20 lg:min-h-[5.5rem]">
                  <div className="relative z-[1] min-w-0 flex-1 overflow-hidden">
                    <AvatarRow
                      images={leftLogos}
                      offset={i * 3}
                      reverse
                      durationSec={24 + i * 5}
                      loading={isLoading}
                      scaleMode="shrink-to-right"
                    />
                    <JunctionFade side="left" />
                  </div>
                  <div className="relative z-20 hidden shrink-0 lg:flex">
                    <LabelPill>{label}</LabelPill>
                  </div>
                </div>
              ))}
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className="relative z-10 mx-auto grid h-24 w-24 place-items-center rounded-xl border border-border bg-card text-center shadow-elevated sm:h-28 sm:w-28 sm:rounded-2xl"
            >
              <div>
                <div className="font-display text-sm font-extrabold tracking-tight text-brand sm:text-base">
                  VyaparSetu
                </div>
                <div className="mt-0.5 text-[8px] font-semibold uppercase tracking-widest text-muted-foreground sm:text-[9px]">
                  B2B Marketplace
                </div>
              </div>
            </motion.div>

            <div className="flex flex-col justify-center gap-6 sm:gap-8 lg:gap-10">
              {RIGHT_LABELS.map((label, i) => (
                <div key={label} className="flex min-h-16 items-center gap-1.5 sm:min-h-20 lg:min-h-[5.5rem]">
                  <div className="relative z-20 hidden shrink-0 lg:block">
                    <LabelPill wide>{label}</LabelPill>
                  </div>
                  <div className="relative z-[1] min-w-0 flex-1 overflow-hidden">
                    <AvatarRow
                      images={rightLogos}
                      offset={i * 3}
                      reverse
                      durationSec={24 + i * 5}
                      loading={isLoading}
                      scaleMode="grow-to-right"
                    />
                    <JunctionFade side="right" />
                  </div>
                </div>
              ))}
            </div>
          </div>
      </div>

      {showCta ? (
      <div className="container-page">
        <div className="mt-24 grid gap-5 sm:mt-28 sm:grid-cols-2 sm:gap-6">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <CardIconHeader
              icon={Factory}
              tone="light"
              sticker="Sell on VyaparSetu"
            />
            <div className="p-7 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                For manufacturers &amp; distributors
              </p>
              <h3 className="mt-2 font-display text-xl font-bold text-foreground">
                Seller / Manufacturer
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                List your catalogue, manage inventory, and fulfil orders from retailers nationwide.
              </p>
              <Button
                asChild
                variant="outline"
                className="mt-6 rounded-xl border-brand text-brand hover:bg-brand-soft"
              >
                <Link to="/auth" search={{ mode: "signup" }}>
                  Register as a seller
                </Link>
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl bg-brand shadow-soft">
            <CardIconHeader icon={Store} tone="brand" sticker="Shop wholesale" />
            <div className="p-7 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-foreground/80">
                For kirana &amp; retail buyers
              </p>
              <h3 className="mt-2 font-display text-xl font-bold text-brand-foreground">
                Retailers
              </h3>
              <p className="mt-2 text-sm text-brand-foreground/85">
                Source at wholesale prices with MOQ clarity, GST invoices, and reliable delivery.
              </p>
              <Button
                asChild
                variant="outline"
                className="mt-6 rounded-xl border-white/50 bg-transparent text-brand-foreground hover:bg-white hover:text-brand"
              >
                <Link to="/auth" search={{ mode: "signup" }}>
                  Login / Sign up
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      ) : null}
    </section>
  );
}
