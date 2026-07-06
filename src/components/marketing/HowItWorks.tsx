import { motion } from "framer-motion";
import { CreditCard, PackageSearch, ShoppingCart, Truck, UserPlus } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";

const STEPS = [
  { icon: UserPlus, title: "Register as Retailer", desc: "Sign up with your GSTIN in under 2 minutes." },
  { icon: PackageSearch, title: "Browse Products", desc: "Discover 2.5L+ SKUs from verified suppliers." },
  { icon: ShoppingCart, title: "Bulk Order", desc: "Add to cart, meet MOQ, unlock slab pricing." },
  { icon: CreditCard, title: "Payment", desc: "Pay via UPI, card, NEFT or on 30-day credit." },
  { icon: Truck, title: "Delivery", desc: "Track shipments end-to-end till your door." },
];

export function HowItWorks() {
  return (
    <section className="bg-surface py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="How it works"
          title="From browse to delivery in 5 simple steps"
        />

        <div className="relative mt-16">
          <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 grid h-16 w-16 place-items-center rounded-2xl border border-border bg-card shadow-soft">
                  <s.icon className="h-6 w-6 text-brand" />
                  <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-brand text-[11px] font-bold text-white shadow-brand">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-foreground">
                  {s.title}
                </h3>
                <p className="mt-1.5 max-w-[220px] text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
