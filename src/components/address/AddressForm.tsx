import { useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { AddressType, ShippingAddress } from "@/types/commerce";
import { INDIAN_STATES } from "@/lib/commerce";
import { useSaveAddress, type AddressInput } from "@/hooks/useAddresses";

const schema = z.object({
  label: z.string().max(40).optional(),
  type: z.enum(["home", "business", "warehouse"]),
  contact_name: z.string().trim().min(2, "Enter contact name").max(80),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  line1: z.string().trim().min(4, "Address is required").max(200),
  line2: z.string().max(200).optional(),
  landmark: z.string().max(80).optional(),
  city: z.string().trim().min(2).max(80),
  state: z.string().min(2),
  pincode: z.string().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit pincode"),
  gst_number: z
    .string()
    .trim()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN")
    .optional()
    .or(z.literal("")),
  is_default: z.boolean(),
});

export function AddressFormDialog({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: ShippingAddress | null;
}) {
  const save = useSaveAddress();
  const [values, setValues] = useState<AddressInput>(() => ({
    label: initial?.label ?? "",
    type: (initial?.type ?? "business") as AddressType,
    contact_name: initial?.contact_name ?? "",
    phone: initial?.phone ?? "",
    line1: initial?.line1 ?? "",
    line2: initial?.line2 ?? "",
    landmark: initial?.landmark ?? "",
    city: initial?.city ?? "",
    state: initial?.state ?? "Maharashtra",
    pincode: initial?.pincode ?? "",
    country: initial?.country ?? "India",
    gst_number: initial?.gst_number ?? "",
    is_default: initial?.is_default ?? false,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof AddressInput>(k: K, v: AddressInput[K]) =>
    setValues((s) => ({ ...s, [k]: v }));

  const submit = () => {
    const parsed = schema.safeParse({
      ...values,
      label: values.label || undefined,
      line2: values.line2 || undefined,
      landmark: values.landmark || undefined,
      gst_number: values.gst_number || "",
    });
    if (!parsed.success) {
      const e: Record<string, string> = {};
      for (const i of parsed.error.issues) e[i.path[0] as string] = i.message;
      setErrors(e);
      return;
    }
    setErrors({});
    save.mutate(
      {
        id: initial?.id,
        values: {
          ...values,
          label: values.label || null,
          line2: values.line2 || null,
          landmark: values.landmark || null,
          gst_number: values.gst_number || null,
        },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit address" : "Add new address"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Address type</Label>
            <Select value={values.type} onValueChange={(v) => set("type", v as AddressType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="business">Business / Shop</SelectItem>
                <SelectItem value="warehouse">Warehouse</SelectItem>
                <SelectItem value="home">Home</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Field label="Label (optional)" error={errors.label}>
            <Input value={values.label ?? ""} onChange={(e) => set("label", e.target.value)} placeholder="e.g. Main store" />
          </Field>
          <Field label="Contact name" error={errors.contact_name}>
            <Input value={values.contact_name} onChange={(e) => set("contact_name", e.target.value)} />
          </Field>
          <Field label="Phone" error={errors.phone}>
            <Input value={values.phone} onChange={(e) => set("phone", e.target.value)} maxLength={10} />
          </Field>
          <Field label="GSTIN (optional)" error={errors.gst_number}>
            <Input
              value={values.gst_number ?? ""}
              onChange={(e) => set("gst_number", e.target.value.toUpperCase())}
              maxLength={15}
              placeholder="e.g. 27AABCU9603R1ZM"
            />
          </Field>
          <Field label="Address line 1" error={errors.line1} className="sm:col-span-2">
            <Input value={values.line1} onChange={(e) => set("line1", e.target.value)} />
          </Field>
          <Field label="Address line 2 (optional)" error={errors.line2} className="sm:col-span-2">
            <Input value={values.line2 ?? ""} onChange={(e) => set("line2", e.target.value)} />
          </Field>
          <Field label="Landmark (optional)" error={errors.landmark}>
            <Input value={values.landmark ?? ""} onChange={(e) => set("landmark", e.target.value)} />
          </Field>
          <Field label="Pincode" error={errors.pincode}>
            <Input value={values.pincode} onChange={(e) => set("pincode", e.target.value)} maxLength={6} />
          </Field>
          <Field label="City" error={errors.city}>
            <Input value={values.city} onChange={(e) => set("city", e.target.value)} />
          </Field>
          <Field label="State" error={errors.state}>
            <Select value={values.state} onValueChange={(v) => set("state", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {INDIAN_STATES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <label className="sm:col-span-2 flex items-center gap-2 text-sm">
            <Checkbox
              checked={values.is_default}
              onCheckedChange={(v) => set("is_default", Boolean(v))}
            />
            Set as default address
          </label>
        </div>
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={save.isPending} className="shadow-brand">
            {save.isPending ? "Saving..." : "Save address"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label, error, children, className,
}: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1 block text-xs">{label}</Label>
      {children}
      {error && <p className="mt-1 text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
