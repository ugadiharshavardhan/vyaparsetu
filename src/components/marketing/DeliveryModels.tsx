import { Link } from "@tanstack/react-router";

const MODELS = [
  {
    title: "Wholesale",
    timing: "NEXT DAY",
    tagline: "Delivery for your planned needs",
    tone: "brand" as const,
    porter: false,
    href: "/marketplace" as const,
  },
  {
    title: "Porter",
    timing: "IN HOURS",
    tagline: "Last-minute, unplanned needs — delivered by Porter",
    tone: "pale" as const,
    porter: true,
    href: "/marketplace" as const,
  },
];

function PorterBrandMark() {
  return (
    <div className="flex flex-col items-center gap-3">
      <img
        src="/porterlogo.png"
        alt="Porter"
        loading="lazy"
        decoding="async"
        width={96}
        height={96}
        className="h-20 w-20 rounded-[1.25rem] object-cover shadow-soft ring-1 ring-black/5 sm:h-24 sm:w-24"
      />
      <h3 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Porter</h3>
    </div>
  );
}
export function DeliveryModels() {
  return (
    <section className="bg-background py-14 sm:py-16">
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Our delivery models
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            We offer flexible delivery options tailored to your needs—whether it’s next-day
            restocking, urgent same-day supplies, or specialty products.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 md:gap-6">
          {MODELS.map((m) => (
            <Link
              key={m.title}
              to={m.href}
              resetScroll
              className={`flex min-h-[220px] flex-col items-center justify-center rounded-[1.75rem] px-6 py-12 text-center shadow-soft sm:min-h-[240px] sm:py-14 ${
                m.tone === "brand"
                  ? "bg-brand-soft text-foreground ring-1 ring-brand/20"
                  : "bg-surface text-foreground ring-1 ring-border"
              }`}
            >
              {m.porter ? (
                <PorterBrandMark />
              ) : (                <h3 className="inline-flex items-center gap-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  {m.title}
                </h3>
              )}
              <div className="mt-4 flex w-full max-w-xs items-center gap-3">
                <span className="h-px flex-1 bg-current/35" />
                <span className="text-xs font-medium uppercase tracking-[0.2em] opacity-90">
                  {m.timing}
                </span>
                <span className="h-px flex-1 bg-current/35" />
              </div>
              <p className="mt-4 max-w-sm text-sm opacity-90 sm:text-base">{m.tagline}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
