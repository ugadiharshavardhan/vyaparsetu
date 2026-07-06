import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HERO_STATS } from "@/data/stats";
import { useCountUp } from "@/hooks/useCountUp";
import { compactNumber } from "@/lib/format";

function Stat({ value, label, suffix }: { value: number; label: string; suffix: string }) {
  const n = useCountUp(value);
  return (
    <div>
      <div className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {compactNumber(n)}
        <span className="text-brand">{suffix}</span>
      </div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute -right-40 top-40 h-[400px] w-[400px] rounded-full bg-info/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_oklch(0.7_0.02_260/0.15)_1px,_transparent_0)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,_black_45%,_transparent_75%)]" />
      </div>

      <div className="container-page grid gap-12 py-16 md:py-24 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col justify-center"
        >
          <span className="inline-flex w-max items-center gap-2 rounded-full border border-brand/20 bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
            <Sparkles className="h-3.5 w-3.5" /> New · Instant business credit up to ₹10L
          </span>

          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Wholesale Bharat,{" "}
            <span className="gradient-text-brand">delivered directly</span> to your shop.
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            Source from 12,500+ verified manufacturers and distributors at factory prices.
            GST-ready invoices, business credit and next-day delivery — all in one platform.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-12 rounded-full px-6 shadow-brand">
              <Link to="/marketplace">
                Explore Marketplace <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 rounded-full px-6">
              <Link to="/about">
                <PlayCircle className="mr-2 h-4 w-4" /> How it works
              </Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-brand" /> Verified suppliers</span>
            <span className="inline-flex items-center gap-1.5"><Truck className="h-4 w-4 text-brand" /> Pan-India delivery</span>
            <span className="inline-flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-brand" /> GST invoices</span>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-6 rounded-2xl border border-border bg-card p-6 shadow-soft sm:grid-cols-4">
            {HERO_STATS.map((s) => (
              <Stat key={s.label} {...s} />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="relative"
        >
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-elevated">
            <img
              src="https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=900&q=70"
              alt="Wholesale warehouse in India"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/85 via-foreground/30 to-transparent p-6">
              <p className="text-xs uppercase tracking-widest text-background/80">Live now</p>
              <p className="font-display text-xl font-semibold text-background">
                Diwali stock at wholesale prices
              </p>
            </div>
          </div>

          {/* Floating cards */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="absolute -left-4 top-10 hidden w-56 rounded-2xl border border-border bg-card p-4 shadow-elevated md:block"
          >
            <div className="text-xs text-muted-foreground">Order placed</div>
            <div className="mt-1 text-sm font-semibold text-foreground">240 cartons · ₹1.8L</div>
            <div className="mt-2 flex items-center gap-2 text-xs text-brand">
              <ShieldCheck className="h-3.5 w-3.5" /> Auto GST invoice generated
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="absolute -right-4 bottom-16 hidden w-56 rounded-2xl border border-border bg-card p-4 shadow-elevated md:block"
          >
            <div className="text-xs text-muted-foreground">Delivery ETA</div>
            <div className="mt-1 text-sm font-semibold text-foreground">Tomorrow, 11:30 AM</div>
            <div className="mt-2 flex items-center gap-2 text-xs text-info">
              <Truck className="h-3.5 w-3.5" /> Nagpur → Bengaluru
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
