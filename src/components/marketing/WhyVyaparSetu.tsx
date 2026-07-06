import { motion } from "framer-motion";
import {
  BadgeCheck,
  CreditCard,
  FileCheck,
  ShieldCheck,
  Tag,
  Truck,
} from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";

const FEATURES = [
  { icon: BadgeCheck, title: "Verified Suppliers", desc: "GSTIN, PAN and warehouse verified before onboarding.", tint: "brand" },
  { icon: FileCheck, title: "GST Invoicing", desc: "Auto-generated GST-compliant tax invoices per order.", tint: "info" },
  { icon: Truck, title: "Fast Delivery", desc: "Next-day to 3-day delivery across 380+ cities.", tint: "warning" },
  { icon: CreditCard, title: "Business Credit", desc: "Interest-free credit up to ₹10L against invoices.", tint: "brand" },
  { icon: Tag, title: "Bulk Pricing", desc: "Auto slab-based discounts as your quantities grow.", tint: "info" },
  { icon: ShieldCheck, title: "Secure Payments", desc: "UPI, NEFT, cards and business wallets — all safe.", tint: "warning" },
] as const;

const tintClasses = {
  brand: "bg-brand-soft text-brand",
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning",
} as const;

export function WhyVyaparSetu() {
  return (
    <section className="container-page py-20 sm:py-24">
      <SectionHeading
        eyebrow="Why VyaparSetu"
        title="Built for how India actually does wholesale"
        description="Every feature is designed with kirana, distributor and B2B ops teams in mind."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-soft transition-shadow hover:shadow-elevated"
          >
            <div className={`grid h-12 w-12 place-items-center rounded-2xl ${tintClasses[f.tint]}`}>
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 font-display text-lg font-semibold text-foreground">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand/5 transition-transform duration-500 group-hover:scale-125" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
