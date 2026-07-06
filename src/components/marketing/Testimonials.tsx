import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { TESTIMONIALS } from "@/data/testimonials";
import { SectionHeading } from "@/components/common/SectionHeading";

export function Testimonials() {
  return (
    <section className="container-page py-20 sm:py-24">
      <SectionHeading
        eyebrow="Testimonials"
        title="Loved by retailers, distributors and manufacturers"
      />

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {TESTIMONIALS.map((t, i) => (
          <motion.article
            key={t.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="relative flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft"
          >
            <Quote className="h-6 w-6 text-brand/40" />
            <div className="mt-2 flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star
                  key={s}
                  className={`h-3.5 w-3.5 ${s < t.rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`}
                />
              ))}
            </div>
            <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground">"{t.quote}"</p>
            <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
              <div className="grid h-10 w-10 place-items-center rounded-full gradient-brand text-xs font-bold text-white">
                {t.logo}
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role} · {t.company}</div>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
