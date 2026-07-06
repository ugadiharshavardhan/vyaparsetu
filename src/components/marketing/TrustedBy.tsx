import { TRUSTED_LOGOS } from "@/data/stats";

export function TrustedBy() {
  return (
    <section className="border-y border-border bg-card/60">
      <div className="container-page py-10">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Trusted by 84,000+ businesses across India
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {TRUSTED_LOGOS.map((name) => (
            <span
              key={name}
              className="font-display text-lg font-semibold text-muted-foreground/80 grayscale transition hover:text-foreground hover:grayscale-0 sm:text-xl"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
