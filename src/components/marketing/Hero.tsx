import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Pre-designed 2:1 banner art in /public — text/CTA is baked into the image. */
const SLIDES = [
  { id: 1, image: "/hero-banner1.jpg" },
  { id: 2, image: "/hero-banner2.jpg" },
  { id: 3, image: "/hero-banner3.jpg" },
];

export function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 6000);
    return () => window.clearInterval(t);
  }, []);

  const slide = SLIDES[index]!;

  return (
    <section className="relative w-full overflow-hidden bg-surface">
      <div className="relative aspect-[2/1] max-h-[620px] w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
            className="absolute inset-0"
          >
            <img
              src={slide.image}
              alt="VyaparSetu wholesale for retailers"
              className="h-full w-full object-cover"
              width={1600}
              height={800}
              decoding="async"
              fetchPriority={index === 0 ? "high" : "low"}
            />
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length)}
          className="absolute left-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-foreground shadow-soft transition hover:bg-white sm:left-6"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => setIndex((i) => (i + 1) % SLIDES.length)}
          className="absolute right-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-foreground shadow-soft transition hover:bg-white sm:right-6"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:bottom-5">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-brand" : "w-2 bg-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
