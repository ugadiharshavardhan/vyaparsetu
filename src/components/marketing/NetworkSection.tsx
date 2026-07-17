import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Factory, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfiniteCarousel } from "@/components/marketing/InfiniteCarousel";
import { CategoryImage } from "@/components/marketplace/CategoryCard";
import { useManufacturers } from "@/hooks/useCatalog";
import { Skeleton } from "@/components/ui/skeleton";
const LEFT_LABELS = ["Manufacturers", "Distributors", "Wholesalers"];
const RIGHT_LABELS = ["Kirana & Retail", "Hotels", "Cloud Kitchens"];

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
    <div className="mx-3 grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-white p-2.5 shadow-soft sm:mx-3.5 sm:h-20 sm:w-20 sm:p-3 lg:h-[5.5rem] lg:w-[5.5rem]">
      <CategoryImage src={src} alt="" className="h-full w-full object-contain" />
    </div>
  );
}

function AvatarRow({
  images,
  offset,
  reverse,
  durationSec,
  loading,
}: {
  images: string[];
  offset: number;
  reverse?: boolean;
  durationSec: number;
  loading?: boolean;
}) {
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
  );
}

function LabelPill({ children }: { children: ReactNode }) {
  return (
    <span className="relative z-20 inline-flex items-center whitespace-nowrap rounded-full border border-brand/20 bg-brand-soft px-4 py-2 text-xs font-bold uppercase tracking-wide text-brand ring-1 ring-black/5 sm:text-sm">
      {children}
    </span>
  );
}

/** White fade where the streaming logos meet the label pill. */
function JunctionFade({ side }: { side: "left" | "right" }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-y-0 z-[5] hidden w-16 lg:block ${
        side === "left"
          ? "right-0 bg-gradient-to-l from-surface via-surface/85 to-transparent"
          : "left-0 bg-gradient-to-r from-surface via-surface/85 to-transparent"
      }`}
    />
  );
}

function CardHeaderSticker({ label }: { label: string }) {
  return (
    <div className="absolute bottom-4 right-4 z-10 rotate-[-4deg] rounded-xl bg-white px-3.5 py-2 text-brand shadow-elevated ring-1 ring-black/10">
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
export function NetworkSection() {
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
    <section className="overflow-hidden bg-surface py-20 sm:py-24 lg:pb-32 lg:pt-28">
      <div className="container-page">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            Building a wide network of
          </h2>
          <p className="mt-2 font-display text-lg font-semibold tracking-tight text-brand sm:text-xl">
            — Sellers &amp; Customers —
          </p>
        </div>
      </div>

      <div className="relative mt-6 w-full px-2 sm:mt-8 sm:px-4">
          <svg
            aria-hidden
            viewBox="0 0 1000 300"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-y-0 left-1/2 h-full w-full max-w-4xl -translate-x-1/2"
          >
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeDasharray="6 10"
              strokeLinecap="round"
              className="text-brand/40"
            >
              <path d="M300 50  C 400 50, 420 150, 500 150" />
              <path d="M300 150 L 500 150" />
              <path d="M300 250 C 400 250, 420 150, 500 150" />
              <path d="M500 150 C 580 150, 600 50, 700 50" />
              <path d="M500 150 L 700 150" />
              <path d="M500 150 C 580 150, 600 250, 700 250" />
            </g>
          </svg>

          <div className="relative grid grid-cols-1 items-center gap-y-8 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-x-8">
            <div className="flex flex-col justify-center gap-8 sm:gap-10">
              {LEFT_LABELS.map((label, i) => (
                <div key={label} className="flex items-center">
                  <div className="relative z-[1] min-w-0 flex-1">
                    <AvatarRow
                      images={leftLogos}
                      offset={i * 3}
                      reverse
                      durationSec={24 + i * 5}
                      loading={isLoading}
                    />
                    <JunctionFade side="left" />
                  </div>
                  <div className="relative hidden shrink-0 lg:block">
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
              className="mx-auto grid h-32 w-32 place-items-center rounded-2xl border border-border bg-card text-center shadow-elevated sm:h-36 sm:w-36"
            >
              <div>
                <div className="font-display text-lg font-extrabold tracking-tight text-brand sm:text-xl">
                  VyaparSetu
                </div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  B2B Marketplace
                </div>
              </div>
            </motion.div>

            <div className="flex flex-col justify-center gap-8 sm:gap-10">
              {RIGHT_LABELS.map((label, i) => (
                <div key={label} className="flex items-center">
                  <div className="relative hidden shrink-0 lg:block">
                    <LabelPill>{label}</LabelPill>
                  </div>
                  <div className="relative z-[1] min-w-0 flex-1">
                    <AvatarRow
                      images={rightLogos}
                      offset={i * 3}
                      reverse
                      durationSec={24 + i * 5}
                      loading={isLoading}
                    />
                    <JunctionFade side="right" />
                  </div>
                </div>
              ))}
            </div>
          </div>
      </div>

      <div className="container-page">
        <div className="mt-24 grid gap-5 sm:mt-28 sm:grid-cols-2 sm:gap-6">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <CardIconHeader
              icon={Factory}
              tone="light"
              sticker="Sell on VyaparSetu"
            />
            <div className="p-7 sm:p-8">              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
            <div className="p-7 sm:p-8">              <p className="text-xs font-semibold uppercase tracking-wider text-brand-foreground/80">
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
    </section>
  );
}
