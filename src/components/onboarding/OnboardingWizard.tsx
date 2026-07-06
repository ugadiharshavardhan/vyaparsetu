import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, MapPin, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { StepIndicator } from "./StepIndicator";
import { UploadDropzone } from "./UploadDropzone";
import { BUSINESS_CATEGORIES, BUSINESS_TYPES, INDIAN_STATES } from "@/data/business";
import { useProfile, useUpdateProfile, type Profile } from "@/hooks/useProfile";
import { StatusBadge } from "@/components/common/StatusBadge";

type FormState = Partial<Profile>;

const STEPS = ["Business", "Address", "Contact", "Documents", "Review"];

export function OnboardingWizard() {
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(() => ({
    business_name: profile?.business_name ?? "",
    owner_name: profile?.owner_name ?? profile?.full_name ?? "",
    business_type: profile?.business_type ?? "retailer",
    business_category: profile?.business_category ?? "",
    gst_number: profile?.gst_number ?? "",
    pan_number: profile?.pan_number ?? "",
    years_in_business: profile?.years_in_business ?? null,
    website: profile?.website ?? "",
    address: profile?.address ?? "",
    city: profile?.city ?? "",
    state: profile?.state ?? "",
    country: profile?.country ?? "India",
    pincode: profile?.pincode ?? "",
    phone: profile?.phone ?? "",
    alternate_phone: profile?.alternate_phone ?? "",
    business_email: profile?.business_email ?? profile?.email ?? "",
    whatsapp: profile?.whatsapp ?? "",
    logo_url: profile?.logo_url ?? null,
    shop_image_url: profile?.shop_image_url ?? null,
    gst_certificate_url: profile?.gst_certificate_url ?? null,
    pan_document_url: profile?.pan_document_url ?? null,
  }));

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const canNext = useMemo(() => {
    if (step === 0) return !!(form.business_name && form.owner_name && form.business_type && form.business_category && form.gst_number);
    if (step === 1) return !!(form.address && form.city && form.state && form.pincode);
    if (step === 2) return !!(form.phone && form.business_email);
    if (step === 3) return true; // uploads optional but recommended
    return true;
  }, [step, form]);

  const submit = async () => {
    try {
      await update.mutateAsync({ ...form, verification_status: "under_review", onboarding_completed: true });
      toast.success("Onboarding complete — welcome aboard!");
      navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save profile");
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
          <ShieldCheck className="h-3.5 w-3.5" /> Verified business network
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Set up your business profile
        </h1>
        <p className="mt-2 text-muted-foreground">
          A quick 5-step setup unlocks the marketplace, business credit and verified supplier chats.
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-elevated sm:p-8">
        <StepIndicator steps={STEPS} current={step} />

        <div className="mt-8 min-h-[380px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Business name *"><Input value={form.business_name ?? ""} onChange={(e) => set("business_name", e.target.value)} placeholder="Shree Traders Pvt Ltd" /></Field>
                  <Field label="Owner name *"><Input value={form.owner_name ?? ""} onChange={(e) => set("owner_name", e.target.value)} placeholder="Rajesh Kumar" /></Field>
                  <Field label="Business type *">
                    <Select value={form.business_type ?? undefined} onValueChange={(v) => set("business_type", v)}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {BUSINESS_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Business category *">
                    <Select value={form.business_category ?? undefined} onValueChange={(v) => set("business_category", v)}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {BUSINESS_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="GST number *"><Input value={form.gst_number ?? ""} onChange={(e) => set("gst_number", e.target.value.toUpperCase())} placeholder="22ABCDE1234F1Z5" maxLength={15} /></Field>
                  <Field label="PAN (optional)"><Input value={form.pan_number ?? ""} onChange={(e) => set("pan_number", e.target.value.toUpperCase())} placeholder="ABCDE1234F" maxLength={10} /></Field>
                  <Field label="Years in business">
                    <Input type="number" min={0} value={form.years_in_business ?? ""} onChange={(e) => set("years_in_business", e.target.value ? Number(e.target.value) : null)} placeholder="5" />
                  </Field>
                  <Field label="Website (optional)"><Input value={form.website ?? ""} onChange={(e) => set("website", e.target.value)} placeholder="https://example.com" /></Field>
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-4">
                  <Field label="Address line *"><Input value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} placeholder="Shop 12, MG Road" /></Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="City *"><Input value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} placeholder="Mumbai" /></Field>
                    <Field label="State *">
                      <Select value={form.state ?? undefined} onValueChange={(v) => set("state", v)}>
                        <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                        <SelectContent className="max-h-72">
                          {INDIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Pincode *"><Input value={form.pincode ?? ""} onChange={(e) => set("pincode", e.target.value)} maxLength={6} placeholder="400001" /></Field>
                    <Field label="Country"><Input value={form.country ?? "India"} onChange={(e) => set("country", e.target.value)} /></Field>
                  </div>
                  <div className="mt-2 flex h-40 items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4 text-brand" /> Google Maps preview will appear here
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Primary phone *"><Input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98xxx xxxxx" /></Field>
                  <Field label="Alternate phone"><Input value={form.alternate_phone ?? ""} onChange={(e) => set("alternate_phone", e.target.value)} placeholder="Optional" /></Field>
                  <Field label="Business email *"><Input type="email" value={form.business_email ?? ""} onChange={(e) => set("business_email", e.target.value)} placeholder="owner@example.com" /></Field>
                  <Field label="WhatsApp number"><Input value={form.whatsapp ?? ""} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+91 98xxx xxxxx" /></Field>
                </div>
              )}

              {step === 3 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <UploadDropzone label="GST Certificate" hint="Required for verification" value={form.gst_certificate_url ?? null} onChange={(url) => set("gst_certificate_url", url)} />
                  <UploadDropzone label="Business Logo" hint="Square, min 400px" value={form.logo_url ?? null} onChange={(url) => set("logo_url", url)} />
                  <UploadDropzone label="Shop Image" hint="Outside/inside photo" value={form.shop_image_url ?? null} onChange={(url) => set("shop_image_url", url)} />
                  <UploadDropzone label="PAN Document" hint="Optional" value={form.pan_document_url ?? null} onChange={(url) => set("pan_document_url", url)} />
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <StatusBadge status="under_review" />
                    <span className="text-sm text-muted-foreground">Verification usually takes under 24 hours</span>
                  </div>
                  <ReviewGroup title="Business" onEdit={() => setStep(0)} rows={[
                    ["Business", form.business_name], ["Owner", form.owner_name],
                    ["Type", form.business_type], ["Category", form.business_category],
                    ["GST", form.gst_number], ["PAN", form.pan_number || "—"],
                    ["Website", form.website || "—"], ["Years", form.years_in_business ?? "—"],
                  ]} />
                  <ReviewGroup title="Address" onEdit={() => setStep(1)} rows={[
                    ["Address", form.address], ["City", form.city],
                    ["State", form.state], ["Pincode", form.pincode], ["Country", form.country],
                  ]} />
                  <ReviewGroup title="Contact" onEdit={() => setStep(2)} rows={[
                    ["Phone", form.phone], ["Alternate", form.alternate_phone || "—"],
                    ["Email", form.business_email], ["WhatsApp", form.whatsapp || "—"],
                  ]} />
                  <ReviewGroup title="Documents" onEdit={() => setStep(3)} rows={[
                    ["GST certificate", form.gst_certificate_url ? "Uploaded" : "Not uploaded"],
                    ["Logo", form.logo_url ? "Uploaded" : "Not uploaded"],
                    ["Shop image", form.shop_image_url ? "Uploaded" : "Not uploaded"],
                    ["PAN document", form.pan_document_url ? "Uploaded" : "Not uploaded"],
                  ]} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext} className="shadow-brand">
              Continue <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={submit} disabled={update.isPending} className="shadow-brand">
              {update.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit for verification
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function ReviewGroup({ title, rows, onEdit }: { title: string; rows: [string, React.ReactNode][]; onEdit: () => void }) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <Button variant="ghost" size="sm" onClick={onEdit}>Edit</Button>
      </div>
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 border-b border-border/50 py-1.5 last:border-0">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="truncate text-right font-medium">{v || "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
