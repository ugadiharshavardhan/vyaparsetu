import { createFileRoute } from "@tanstack/react-router";
import { LifeBuoy, MessageCircle, Phone } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FAQS } from "@/data/faqs";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/_authenticated/help")({
  head: () => ({ meta: [{ title: "Help — VyaparSetu" }] }),
  component: HelpPage,
});

const CHANNELS = [
  { icon: MessageCircle, title: "Chat with us", body: "Mon–Sat, 9am–8pm", value: "Start chat" },
  { icon: Phone, title: "Call support", body: "Priority line for verified partners", value: "1800-000-000" },
  { icon: LifeBuoy, title: "Raise a ticket", body: "Response within 4 business hours", value: "Open ticket" },
];

function HelpPage() {
  return (
    <div className="container-page py-10">
      <PageHeader title="Help & support" description="Answers, guides and live support for your VyaparSetu account." />
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {CHANNELS.map((c) => (
          <div key={c.title} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand"><c.icon className="h-4 w-4" /></div>
            <h3 className="mt-3 font-display font-semibold">{c.title}</h3>
            <p className="text-sm text-muted-foreground">{c.body}</p>
            <p className="mt-3 text-sm font-semibold text-brand">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold">Frequently asked</h2>
        <Accordion type="single" collapsible className="mt-3">
          {FAQS.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
