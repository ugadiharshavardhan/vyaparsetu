import { InfiniteCarousel } from "@/components/marketing/InfiniteCarousel";

const CARDS = [
  {
    title: "Working with local sellers",
    image: "/sustainability/local-sellers.jpg",
  },
  {
    title: "Meet the teams at our warehouses",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Smarter logistics, fewer wasted trips",
    image:
      "https://images.unsplash.com/photo-1494412685616-a5d310fbb07d?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Responsible packaging for B2B packs",
    image:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Empowering neighbourhood retailers",
    image:
      "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=900&q=80",
  },
];

export function ImpactSection() {
  return (
    <section
      id="sustainability"
      className="scroll-mt-24 overflow-hidden bg-brand py-14 sm:py-16 lg:rounded-t-[2.5rem]"
    >
      <div className="container-page grid items-center gap-10 lg:grid-cols-[0.85fr_1.4fr] lg:gap-12">
        <div className="text-brand-foreground">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Sustainability goes beyond the environment
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-brand-foreground/90 sm:text-base">
            For VyaparSetu—it’s at the core of our operations, shaping every decision we make,
            every day. Fairer prices for retailers, steadier demand for sellers, and less waste
            in the supply chain.
          </p>
        </div>

        <InfiniteCarousel durationSec={32} className="py-1" trackClassName="gap-0">
          {CARDS.map((card) => (
            <article
              key={card.title}
              className="relative mx-2 w-[14.5rem] shrink-0 overflow-hidden rounded-2xl shadow-soft sm:mx-2.5 sm:w-[16.5rem]"
            >
              <div className="aspect-[3/4]">
                <img
                  src={card.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  width={264}
                  height={352}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-foreground/35" />
                <p className="absolute inset-x-0 top-0 p-4 font-display text-base font-bold leading-snug text-white sm:text-lg">
                  {card.title}
                </p>
              </div>
            </article>
          ))}
        </InfiniteCarousel>
      </div>
    </section>
  );
}
