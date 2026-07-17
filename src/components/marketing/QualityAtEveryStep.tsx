import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  Pin,
  ShieldCheck,
  ThermometerSnowflake,
  Users,
} from "lucide-react";

const STEPS = [
  {
    id: "sourcing",
    icon: BadgeCheck,
    title: "Standardized sourcing",
    desc: "Every supplier is GST-verified with documented warehouse and quality checks before listing on VyaparSetu.",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    highlights: [
      "GSTIN & KYC verified sellers",
      "Documented warehouse checks",
      "Consistent wholesale quality",
    ],
  },
  {
    id: "fulfilment",
    icon: ThermometerSnowflake,
    title: "Reliable fulfilment",
    desc: "Orders move through tracked dispatch so stock reaches your shop on the promised ETA — every time.",
    image: "/quality/fulfilment.jpg",
    highlights: [
      "Tracked dispatch updates",
      "Clear delivery windows",
      "MOQ-ready case packing",
    ],
  },
  {
    id: "safety",
    icon: ShieldCheck,
    title: "Food safety & hygiene",
    desc: "FMCG and packaged goods from sellers who meet platform verification and hygiene standards.",
    image: "/quality/food-grains.jpg",
    highlights: [
      "Verified seller standards",
      "Clean handling practices",
      "GST-ready tax invoices",
    ],
  },
  {
    id: "support",
    icon: Users,
    title: "Customer centricity",
    desc: "Dedicated support for retailers and sellers — from onboarding to after-sales, built for Indian wholesale.",
    image: "/quality/support.jpg",
    highlights: [
      "Retailer-first support",
      "Seller onboarding help",
      "After-sales assistance",
    ],
  },
] as const;

const INTERVAL_MS = 2000;

export function QualityAtEveryStep() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % STEPS.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  const step = STEPS[active]!;

  return (
    <section id="quality" className="scroll-mt-24 bg-card py-14 sm:py-16">
      <div className="container-page">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Left: animated feature list */}
          <div
            className="relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <ul className="relative border-l border-border">
              {STEPS.map((item, index) => {
                const isActive = index === active;
                const Icon = item.icon;
                return (
                  <li key={item.id} className="relative">
                    {isActive && (
                      <motion.span
                        layoutId="quality-active-bar"
                        className="absolute -left-px top-0 bottom-0 w-[3px] rounded-full bg-brand"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setActive(index)}
                      className={`flex w-full gap-4 border-b border-border px-5 py-5 text-left transition-colors last:border-b-0 sm:px-6 sm:py-6 ${
                        isActive ? "bg-transparent" : "hover:bg-secondary/40"
                      }`}
                    >
                      <Icon
                        className={`mt-0.5 h-6 w-6 shrink-0 transition-colors sm:h-7 sm:w-7 ${
                          isActive ? "text-brand" : "text-muted-foreground/50"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <h3
                          className={`font-display text-lg leading-snug transition-colors sm:text-xl ${
                            isActive
                              ? "font-bold text-foreground"
                              : "font-semibold text-muted-foreground"
                          }`}
                        >
                          {item.title}
                        </h3>
                        <AnimatePresence initial={false}>
                          {isActive && (
                            <motion.p
                              key={`${item.id}-desc`}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.28 }}
                              className="overflow-hidden text-sm leading-relaxed text-muted-foreground sm:text-[15px]"
                            >
                              <span className="mt-2 block">{item.desc}</span>
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right: image + pin card */}
          <div className="relative">
            <div
              aria-hidden
              className="absolute -right-2 -top-2 z-0 grid grid-cols-6 gap-1.5 sm:-right-3 sm:-top-3"
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <span key={i} className="h-1.5 w-1.5 rounded-full bg-brand/25" />
              ))}
            </div>

            <div className="relative z-[1] overflow-hidden rounded-2xl border border-border bg-secondary shadow-soft">
              <AnimatePresence mode="wait">
                <motion.img
                  key={step.id}
                  src={step.image}
                  alt={step.title}
                  loading="lazy"
                  decoding="async"
                  initial={{ opacity: 0.35, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0.35 }}
                  transition={{ duration: 0.35 }}
                  className="aspect-[5/4] w-full object-cover"
                />
              </AnimatePresence>
            </div>

            <motion.div
              key={`card-${step.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute -bottom-3 left-4 z-[2] w-[min(100%,17.5rem)] rounded-xl border border-border bg-card p-4 shadow-elevated sm:bottom-4 sm:left-5 sm:w-60"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-brand">
                <Pin className="h-5 w-5 fill-brand" aria-hidden />
              </div>
              <ul className="mt-1 space-y-2.5">
                {step.highlights.map((line, i) => (
                  <li key={line} className="flex gap-2.5 text-sm leading-snug text-foreground">
                    <span className="font-display text-sm font-semibold text-brand tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-medium">{line}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
