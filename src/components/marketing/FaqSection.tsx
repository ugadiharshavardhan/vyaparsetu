import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQS } from "@/data/faqs";
import { SectionHeading } from "@/components/common/SectionHeading";

export function FaqSection() {
  return (
    <section className="bg-surface py-20 sm:py-24">
      <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.5fr]">
        <div>
          <SectionHeading
            align="left"
            eyebrow="FAQ"
            title="Everything you wanted to ask"
            description="Still curious? Our team is one message away."
          />
        </div>
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((f) => (
            <AccordionItem
              key={f.id}
              value={f.id}
              className="rounded-xl border border-border bg-card px-5 mb-3 shadow-soft"
            >
              <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
