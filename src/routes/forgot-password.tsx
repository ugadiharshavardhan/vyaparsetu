import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { EmailOtpForm } from "@/components/auth/EmailOtpForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendEmailOtp } from "@/lib/otp";
import { supabase } from "@/integrations/supabase/client";

const emailSchema = z.object({
  email: z.string().trim().email("Please enter a valid email").max(255),
});

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "At least 8 characters")
      .max(72)
      .regex(/[A-Z]/, "Must include an uppercase letter")
      .regex(/[a-z]/, "Must include a lowercase letter")
      .regex(/[0-9]/, "Must include a number"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset password — VyaparSetu" },
      { name: "description", content: "Reset your VyaparSetu password with a 6-digit email code." },
    ],
  }),
  component: ForgotPasswordPage,
});

type Step = "email" | "reset" | "done";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [show, setShow] = useState(false);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  // Prefill when opened from seller/buyer settings while signed in
  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      const signedInEmail = data.user?.email?.trim().toLowerCase();
      if (signedInEmail) {
        emailForm.setValue("email", signedInEmail);
      }
    });
  }, [emailForm]);

  const requestCode = async ({ email: raw }: z.infer<typeof emailSchema>) => {
    const normalized = raw.trim().toLowerCase();
    try {
      await sendEmailOtp(normalized, "reset", { force: true });
      setEmail(normalized);
      setStep("reset");
      toast.success("If an account exists, a 6-digit code was sent");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send reset code");
    }
  };

  return (
    <AuthLayout
      eyebrow="Password reset"
      title={step === "done" ? "Password updated" : "Forgot your password?"}
      subtitle={
        step === "email"
          ? "Enter your email and we'll send a 6-digit verification code."
          : step === "reset"
            ? "Enter the code from your email and choose a new password."
            : "You can sign in with your new password."
      }
    >
      {step === "done" ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-brand">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h3 className="mt-4 font-display text-xl font-semibold">All set</h3>
          <p className="mt-2 text-sm text-muted-foreground">Your password has been reset.</p>
          <Button
            className="mt-6 w-full shadow-brand"
            onClick={() => navigate({ to: "/auth", search: { mode: "signin" } })}
          >
            Continue to sign in
          </Button>
        </div>
      ) : step === "email" ? (
        <form onSubmit={emailForm.handleSubmit(requestCode)} className="space-y-4">
          <div>
            <Label htmlFor="email">Work email</Label>
            <div className="relative mt-1.5">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                className="h-11 pl-10"
                autoComplete="email"
                {...emailForm.register("email")}
              />
            </div>
            {emailForm.formState.errors.email && (
              <p className="mt-1 text-xs text-destructive">{emailForm.formState.errors.email.message}</p>
            )}
          </div>
          <Button type="submit" size="lg" disabled={emailForm.formState.isSubmitting} className="w-full shadow-brand">
            {emailForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send 6-digit code
          </Button>
          <div className="pt-2 text-center">
            <Link to="/auth" className="text-sm font-medium text-brand hover:underline">
              <ArrowLeft className="mr-1 inline h-3.5 w-3.5" /> Back to sign in
            </Link>
          </div>
        </form>
      ) : (
        <div className="space-y-5">
          <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
            <div>
              <Label htmlFor="password">New password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  className="h-11 pr-10"
                  autoComplete="new-password"
                  {...passwordForm.register("password")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordForm.formState.errors.password && (
                <p className="mt-1 text-xs text-destructive">{passwordForm.formState.errors.password.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type={show ? "text" : "password"}
                className="mt-1.5 h-11"
                autoComplete="new-password"
                {...passwordForm.register("confirmPassword")}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="mt-1 text-xs text-destructive">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <EmailOtpForm
            email={email}
            purpose="reset"
            newPassword={passwordForm.watch("password")}
            submitLabel="Verify & update password"
            beforeVerify={async () => {
              const valid = await passwordForm.trigger();
              if (!valid) toast.error("Fix the password fields and try again");
              return valid;
            }}
            onVerified={() => setStep("done")}
          />

          <button
            type="button"
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setStep("email")}
          >
            <ArrowLeft className="mr-1 inline h-3.5 w-3.5" /> Use a different email
          </button>
        </div>
      )}
    </AuthLayout>
  );
}
