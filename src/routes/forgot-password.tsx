import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().trim().email("Please enter a valid email").max(255),
});

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset password — VyaparSetu" },
      { name: "description", content: "Request a password reset link for your VyaparSetu account." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [sent, setSent] = useState<string | null>(null);
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  const submit = async ({ email }: z.infer<typeof schema>) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(email);
  };

  return (
    <AuthLayout
      eyebrow="Password reset"
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a secure reset link."
    >
      {sent ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-brand">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h3 className="mt-4 font-display text-xl font-semibold">Check your inbox</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            We've sent a reset link to <span className="font-medium text-foreground">{sent}</span>.
            The link expires in 30 minutes.
          </p>
          <Button asChild variant="outline" className="mt-6 w-full">
            <Link to="/auth"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to sign in</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
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
                {...form.register("email")}
              />
            </div>
            {form.formState.errors.email && (
              <p className="mt-1 text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
          <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="w-full shadow-brand">
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send reset link
          </Button>
          <div className="pt-2 text-center">
            <Link to="/auth" className="text-sm font-medium text-brand hover:underline">
              <ArrowLeft className="mr-1 inline h-3.5 w-3.5" /> Back to sign in
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
