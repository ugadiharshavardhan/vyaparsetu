import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeading } from "@/components/common/SectionHeading";
import { SITE } from "@/constants/site";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — VyaparSetu" },
      { name: "description", content: "Get in touch with the VyaparSetu team. We usually reply within 2 hours." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email"),
  company: z.string().min(2, "Company name required"),
  message: z.string().min(10, "Please describe your query (min 10 chars)"),
});
type FormValues = z.infer<typeof schema>;

function ContactPage() {
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });
  const submit = (v: FormValues) => {
    toast.success(`Thanks ${v.name}, we'll get back to you within 2 hours.`);
    form.reset();
  };

  return (
    <div className="container-page py-12 md:py-20">
      <SectionHeading
        eyebrow="Contact"
        title="Let's build your wholesale playbook"
        description="Sales, partnerships or support — the right person will get back to you fast."
      />

      <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          {[
            { icon: Mail, label: "Email", value: SITE.email },
            { icon: Phone, label: "Phone", value: SITE.phone },
            { icon: MapPin, label: "HQ", value: SITE.address },
          ].map((c) => (
            <div key={c.label} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
                <c.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</p>
                <p className="text-sm font-semibold text-foreground">{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={form.handleSubmit(submit)}
          className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-soft"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" placeholder="Rakesh Sharma" className="mt-1.5" {...form.register("name")} />
              {form.formState.errors.name && <p className="mt-1 text-xs text-destructive">{form.formState.errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">Work email</Label>
              <Input id="email" placeholder="you@company.com" className="mt-1.5" {...form.register("email")} />
              {form.formState.errors.email && <p className="mt-1 text-xs text-destructive">{form.formState.errors.email.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="company">Company</Label>
            <Input id="company" placeholder="Sharma Kirana Store" className="mt-1.5" {...form.register("company")} />
            {form.formState.errors.company && <p className="mt-1 text-xs text-destructive">{form.formState.errors.company.message}</p>}
          </div>
          <div>
            <Label htmlFor="message">How can we help?</Label>
            <Textarea id="message" rows={5} placeholder="Tell us about your sourcing needs…" className="mt-1.5" {...form.register("message")} />
            {form.formState.errors.message && <p className="mt-1 text-xs text-destructive">{form.formState.errors.message.message}</p>}
          </div>
          <Button type="submit" size="lg" className="w-full shadow-brand">Send message</Button>
        </form>
      </div>
    </div>
  );
}
