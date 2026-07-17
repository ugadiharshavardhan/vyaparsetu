import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmailOtpForm } from "@/components/auth/EmailOtpForm";
import { resolvePostLoginPath } from "@/lib/postLoginRedirect";
import { setSessionMode, clearSessionMode } from "@/lib/sessionMode";
import { establishSessionAfterSignup, sendEmailOtp, checkLoginHelp } from "@/lib/otp";
import { cn } from "@/lib/utils";
import { authFieldLabel, authInputWithIcon, authSubmitButton } from "@/components/auth/AuthLayout";

const schema = z.object({
  email: z.string().trim().email("Please enter a valid email").max(255),
  password: z.string().min(1, "Password is required").max(72),
});
type FormValues = z.infer<typeof schema>;

export function SignInForm({ role }: { role?: "buyer" | "seller" } = {}) {
  const [show, setShow] = useState(false);
  const [pendingVerify, setPendingVerify] = useState<{ email: string; password: string } | null>(
    null,
  );
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { redirect?: string };

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const persistMode = () => {
    if (role === "seller") setSessionMode("seller");
    else if (role === "buyer") setSessionMode("buyer");
    else clearSessionMode();
  };

  const finishSignIn = async (userId: string) => {
    // No role-membership gate: valid credentials always sign in. Buyers and
    // sellers can log in from either tab without being blocked or signed out.
    persistMode();
    toast.success("Welcome back!");
    const path = await resolvePostLoginPath(userId, search.redirect);
    // Full path+query must use assign so marketplace filters / product URLs survive
    if (path.includes("?") || path.includes("#")) {
      window.location.assign(path);
      return;
    }
    navigate({ to: path as never });
  };

  const submit = async (values: FormValues) => {
    const email = values.email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: values.password,
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
        try {
          await sendEmailOtp(email, "signup");
          setPendingVerify({ email, password: values.password });
          toast.success("We sent a 6-digit code to verify your email");
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Could not send verification code");
        }
        return;
      }
      if (msg.includes("invalid")) {
        try {
          const help = await checkLoginHelp(email, role);
          if (help.exists && help.confirmed === false) {
            await sendEmailOtp(email, "signup", { userId: help.userId, force: true });
            setPendingVerify({ email, password: values.password });
            toast.success("Verify your email with the 6-digit code we sent");
            return;
          }
        } catch {
          /* fall through */
        }
        toast.error("Incorrect email or password. Try Forgot password to reset.");
        return;
      }
      toast.error(error.message);
      return;
    }

    if (!data.user || !data.session) {
      toast.error("Sign in failed. Please try again.");
      return;
    }

    await finishSignIn(data.user.id);
  };

  const loading = form.formState.isSubmitting;

  if (pendingVerify) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-border bg-muted/30 p-6">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-center font-display text-xl font-semibold">Verify your email</h3>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Enter the 6-digit code we emailed you to open your{" "}
            {role === "seller" ? "seller" : "buyer"} dashboard.
          </p>
          <div className="mt-5">
            <EmailOtpForm
              email={pendingVerify.email}
              purpose="signup"
              newPassword={pendingVerify.password}
              submitLabel="Verify & sign in"
              onVerified={async ({ token_hash }) => {
                try {
                  const { userId } = await establishSessionAfterSignup({
                    email: pendingVerify.email,
                    password: pendingVerify.password,
                    tokenHash: token_hash,
                  });
                  await finishSignIn(userId);
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Sign in failed after verification");
                }
              }}
            />
          </div>
          <button
            type="button"
            className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setPendingVerify(null)}
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <form onSubmit={form.handleSubmit(submit)} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="email" className={authFieldLabel}>
            Email Address
          </Label>
          <div className="relative mt-1.5">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E9E9E]" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className={authInputWithIcon}
              autoComplete="email"
              disabled={loading}
              {...form.register("email")}
            />
          </div>
          {form.formState.errors.email && (
            <p className="mt-1 text-xs text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="password" className={authFieldLabel}>
            Password
          </Label>
          <div className="relative mt-1.5">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E9E9E]" />
            <Input
              id="password"
              type={show ? "text" : "password"}
              placeholder="Enter your password"
              className={cn(authInputWithIcon, "pr-10")}
              autoComplete="current-password"
              disabled={loading}
              {...form.register("password")}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="mt-1 text-xs text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-[#108548] hover:opacity-80"
          >
            Forgot Password?
          </Link>
        </div>

        <Button
          type="submit"
          size="lg"
          loading={loading}
          className={authSubmitButton}
        >
          {loading ? "Signing in…" : "Login"}
        </Button>
      </form>
    </div>
  );
}
