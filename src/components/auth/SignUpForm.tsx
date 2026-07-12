import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Factory, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { GoogleButton } from "./GoogleButton";
import type { BusinessRole } from "./RoleSelect";
import { resolvePostLoginPath } from "@/lib/postLoginRedirect";

const schema = z
  .object({
    businessName: z.string().trim().min(2, "Business name required").max(120),
    fullName: z.string().trim().min(2, "Your name required").max(120),
    email: z.string().trim().email("Please enter a valid email").max(255),
    phone: z
      .string()
      .trim()
      .regex(/^[+]?\d[\d\s-]{7,14}\d$/, "Enter a valid mobile number"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .max(72)
      .regex(/[A-Z]/, "Must include an uppercase letter")
      .regex(/[a-z]/, "Must include a lowercase letter")
      .regex(/[0-9]/, "Must include a number"),
    confirmPassword: z.string(),
    gstNumber: z
      .string()
      .trim()
      .optional()
      .refine(
        (v) => !v || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v),
        "Enter a valid 15-character GSTIN",
      ),
    address: z.string().trim().optional(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms to continue" }),
    }),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type FormValues = z.infer<typeof schema>;

// Buyer role maps to retailer; seller maps to manufacturer (RBAC-compatible).
const roleToBusinessType = (role: BusinessRole) =>
  role === "seller" ? "manufacturer" : "retailer";

export function SignUpForm({
  role,
  onBack,
}: {
  role: BusinessRole;
  onBack?: () => void;
}) {
  const [show, setShow] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const submit = async (values: FormValues) => {
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: values.fullName,
          business_name: values.businessName,
          phone: values.phone,
          business_type: roleToBusinessType(role),
          business_role: role,
          gst_number: values.gstNumber ?? "",
          address: values.address ?? "",
        },
      },
    });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("already") || msg.includes("registered")) {
        toast.error("This email is already registered. Try signing in instead.");
      } else if (msg.includes("weak") || msg.includes("password")) {
        toast.error("Please choose a stronger password.");
      } else {
        toast.error(error.message);
      }
      return;
    }
    setSuccess(values.email);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      // Remember the chosen role so the handle_new_user trigger / onboarding
      // can honour it after the OAuth roundtrip.
      try {
        sessionStorage.setItem("vs:signup_role", role);
      } catch {
        // ignore
      }
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Google sign-in failed. Please try again.");
        setGoogleLoading(false);
        return;
      }
      if (result.redirected) return;
      const { data } = await supabase.auth.getUser();
      const path = data.user ? await resolvePostLoginPath(data.user.id) : "/dashboard";
      navigate({ to: path as never });
    } catch {
      toast.error("Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-brand">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="mt-4 font-display text-xl font-semibold">Welcome to VyaparSetu!</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Your business account for <span className="font-medium text-foreground">{success}</span> is ready.
          You can sign in now to start {role === "seller" ? "selling" : "sourcing"}.
        </p>
        <Button asChild size="lg" className="mt-6 w-full shadow-brand">
          <Link to="/auth">Continue to sign in</Link>
        </Button>
      </div>
    );
  }

  const RoleIcon = role === "seller" ? Factory : ShoppingBag;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-xl border border-border bg-brand-soft/40 px-3 py-2">
        <div className="flex items-center gap-2 text-sm">
          <div className="grid h-8 w-8 place-items-center rounded-lg gradient-brand text-white">
            <RoleIcon className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold leading-tight">
              {role === "seller" ? "Selling on VyaparSetu" : "Sourcing on VyaparSetu"}
            </div>
            <div className="text-xs text-muted-foreground">
              {role === "seller" ? "Manufacturer / seller account" : "Retailer / buyer account"}
            </div>
          </div>
        </div>
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="text-xs">
            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Change
          </Button>
        )}
      </div>

      <GoogleButton onClick={handleGoogle} loading={googleLoading} label="Sign up with Google" />
      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Or with email</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="businessName">Business name</Label>
            <Input id="businessName" placeholder="Sharma Kirana Store" className="mt-1.5 h-11" {...form.register("businessName")} />
            {form.formState.errors.businessName && (
              <p className="mt-1 text-xs text-destructive">{form.formState.errors.businessName.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="fullName">Owner name</Label>
            <Input id="fullName" placeholder="Rakesh Sharma" className="mt-1.5 h-11" {...form.register("fullName")} />
            {form.formState.errors.fullName && (
              <p className="mt-1 text-xs text-destructive">{form.formState.errors.fullName.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="email">Work email</Label>
            <Input id="email" type="email" placeholder="you@company.com" className="mt-1.5 h-11" autoComplete="email" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="mt-1 text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Mobile number</Label>
            <Input id="phone" placeholder="+91 98765 43210" className="mt-1.5 h-11" autoComplete="tel" {...form.register("phone")} />
            {form.formState.errors.phone && (
              <p className="mt-1 text-xs text-destructive">{form.formState.errors.phone.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="gst">GSTIN <span className="text-muted-foreground">(optional)</span></Label>
          <Input id="gst" placeholder="29ABCDE1234F1Z5" className="mt-1.5 h-11 uppercase" {...form.register("gstNumber")} />
          {form.formState.errors.gstNumber && (
            <p className="mt-1 text-xs text-destructive">{form.formState.errors.gstNumber.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="address">Business address <span className="text-muted-foreground">(optional)</span></Label>
          <Input id="address" placeholder="Shop 12, MG Road, Mumbai" className="mt-1.5 h-11" {...form.register("address")} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1.5">
              <Input
                id="password"
                type={show ? "text" : "password"}
                className="h-11 pr-10"
                autoComplete="new-password"
                {...form.register("password")}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="mt-1 text-xs text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type={show ? "text" : "password"}
              className="mt-1.5 h-11"
              autoComplete="new-password"
              {...form.register("confirmPassword")}
            />
            {form.formState.errors.confirmPassword && (
              <p className="mt-1 text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="terms"
            checked={!!form.watch("acceptTerms")}
            onCheckedChange={(v) => form.setValue("acceptTerms", (!!v) as true, { shouldValidate: true })}
          />
          <Label htmlFor="terms" className="text-sm font-normal leading-snug">
            I agree to the <Link to="/about" className="text-brand hover:underline">Terms of Service</Link> and{" "}
            <Link to="/about" className="text-brand hover:underline">Privacy Policy</Link>.
          </Label>
        </div>
        {form.formState.errors.acceptTerms && (
          <p className="-mt-2 text-xs text-destructive">{form.formState.errors.acceptTerms.message}</p>
        )}

        <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="w-full shadow-brand">
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create business account
        </Button>
      </form>
    </div>
  );
}
