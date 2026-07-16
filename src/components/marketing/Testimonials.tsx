import { Plus, Star } from "lucide-react";
import { TESTIMONIALS } from "@/data/testimonials";
import { InfiniteCarousel } from "@/components/marketing/InfiniteCarousel";
import type { Testimonial } from "@/types";

function snippet(quote: string, max = 72) {
  const clean = quote.trim();
  if (clean.length <= max) return `..${clean}..`;
  return `..${clean.slice(0, max).trimEnd()}...`;
}

function nameParts(full: string) {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0]!, rest: "" };
  return { first: parts[0]!, rest: parts.slice(1).join(" ") };
}

function FlipTestimonialCard({ t }: { t: Testimonial }) {
  const { first, rest } = nameParts(t.name);
  const accent = t.accent ?? "#7A8F6A";
  const photo = t.photo ?? "/retailers/retailer-1.png";

  return (
    <div
      data-marquee-pause
      className="group/flip mx-2.5 h-[22rem] w-[16.5rem] shrink-0 [perspective:1200px] sm:mx-3 sm:h-[24rem] sm:w-[18rem]"
    >
      <div className="relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] group-hover/flip:[transform:rotateY(180deg)]">
        {/* FRONT */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[1.25rem] shadow-elevated [backface-visibility:hidden]"
          style={{ backgroundColor: accent }}
        >
          <div className="relative z-20 flex items-center gap-3 px-5 pt-5">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-foreground shadow-soft">
              {t.logo}
            </div>
            <div className="min-w-0 text-white">
              <div className="truncate font-display text-sm font-bold sm:text-base">{t.company}</div>
              <div className="text-xs text-white/85">{t.role}</div>
            </div>
          </div>

          <p className="relative z-20 mt-8 max-w-[11.5rem] px-5 text-sm leading-snug text-white sm:mt-10 sm:text-[15px]">
            {snippet(t.quote)}
          </p>

          {/* Portrait (right side) */}
          <div className="pointer-events-none absolute bottom-0 right-0 z-10 h-[62%] w-[50%]">
            <img
              src={photo}
              alt={t.name}
              className="h-full w-full object-cover object-top"
              style={{
                maskImage: "linear-gradient(to top, black 78%, transparent)",
                WebkitMaskImage: "linear-gradient(to top, black 78%, transparent)",
              }}
            />
          </div>

          {/* Customer name (left side, kept clear of the portrait) */}
          <div className="absolute bottom-4 left-5 z-20 max-w-[45%] text-white">
            <div className="font-display text-xl font-bold leading-tight sm:text-2xl">{first}</div>
            {rest ? (
              <div className="font-display text-xl font-bold leading-tight sm:text-2xl">{rest}</div>
            ) : null}
          </div>

          <span className="absolute bottom-3 right-3 z-30 grid h-8 w-8 place-items-center rounded-full bg-foreground text-background shadow-soft">
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </span>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 flex flex-col overflow-hidden rounded-[1.25rem] p-5 text-white shadow-elevated [backface-visibility:hidden] [transform:rotateY(180deg)]"
          style={{ backgroundColor: accent }}
        >
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-foreground">
              {t.logo}
            </div>
            <div className="min-w-0">
              <div className="truncate font-display text-sm font-bold">{t.company}</div>
              <div className="text-xs text-white/85">
                {t.name} · {t.role}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < t.rating ? "fill-white text-white" : "text-white/35"
                }`}
              />
            ))}
          </div>

          <p className="mt-4 flex-1 overflow-y-auto text-sm leading-relaxed text-white/95 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            “{t.quote}”
          </p>

          <div className="mt-4 border-t border-white/25 pt-3 text-xs font-medium text-white/80">
            Partner on VyaparSetu
          </div>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="overflow-hidden py-14 sm:py-16">
      <div className="container-page">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            What our partners say about us
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            Indian retailers using VyaparSetu every day.
          </p>
        </div>
      </div>

      <div className="relative mt-10">
        {/* Soft edge shadows so cards fade in/out at the ends */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-20 w-16 bg-gradient-to-r from-background via-background/80 to-transparent sm:w-24"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-20 w-16 bg-gradient-to-l from-background via-background/80 to-transparent sm:w-24"
        />

        <InfiniteCarousel
          durationSec={40}
          pauseOnHover={false}
          pauseOnChildHoverSelector="[data-marquee-pause]"
          trackClassName="items-stretch py-2"
        >
          {TESTIMONIALS.map((t) => (
            <FlipTestimonialCard key={t.id} t={t} />
          ))}
        </InfiniteCarousel>
      </div>
    </section>
  );
}
