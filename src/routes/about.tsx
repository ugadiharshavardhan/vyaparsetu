import { createFileRoute } from "@tanstack/react-router";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { WhyVyaparSetu } from "@/components/marketing/WhyVyaparSetu";
import { CtaBanner } from "@/components/marketing/CtaBanner";
import { SectionHeading } from "@/components/common/SectionHeading";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — VyaparSetu" },
      { name: "description", content: "VyaparSetu is India's next-generation B2B wholesale marketplace, connecting Bharat's businesses." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <section className="container-page py-16 md:py-24">
        <SectionHeading
          eyebrow="Our story"
          title="Bridging Bharat's wholesale trade with technology"
          description="We're building the operating system for Indian B2B commerce — from kirana shops to enterprise procurement teams."
        />
        <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
          {[
            { k: "2026", v: "Founded" },
            { k: "₹1,200Cr", v: "GMV run rate" },
            { k: "380+", v: "Cities served" },
          ].map((s) => (
            <div key={s.k} className="rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
              <div className="font-display text-3xl font-bold text-brand">{s.k}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.v}</div>
            </div>
          ))}
        </div>
      </section>
      <WhyVyaparSetu />
      <HowItWorks />
      <CtaBanner />
    </>
  );
}
