import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQS } from "@/data/faqs";

export function FaqSection() {
  return (
    <section className="border-t border-border bg-surface py-14 sm:py-16">
      <div className="container-page max-w-3xl">
        <h2 className="text-center font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Frequently asked questions
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Quick answers about buying and selling on VyaparSetu.
        </p>

        <Accordion type="single" collapsible className="mt-8 w-full">
          {FAQS.map((f) => (
            <AccordionItem
              key={f.id}
              value={f.id}
              className="border-b border-border px-1"
            >
              <AccordionTrigger className="py-5 text-left text-base font-semibold hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
