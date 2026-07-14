import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { resolvePostLoginPath } from "@/lib/postLoginRedirect";
import { setSessionMode, clearSessionMode } from "@/lib/sessionMode";
import { assertAccountMembership } from "@/lib/accountMembership";

const schema = z.object({
  email: z.string().trim().email("Please enter a valid email").max(255),
  password: z.string().min(1, "Password is required").max(72),
  remember: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

export function SignInForm({ role, onBack }: { role?: "buyer" | "seller"; onBack?: () => void } = {}) {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { redirect?: string };

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const roleRedirect = (fallback: string) =>
    role === "seller" ? "/supplier" : role === "buyer" ? "/marketplace" : fallback;

  const persistMode = () => {
    if (role === "seller") setSessionMode("seller");
    else if (role === "buyer") setSessionMode("buyer");
    else clearSessionMode();
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
        toast.error("Please confirm your email first, or try signing up again.");
      } else if (msg.includes("invalid")) {
        toast.error("Incorrect email or password");
      } else {
        toast.error(error.message);
      }
      return;
    }

    if (!data.user || !data.session) {
      toast.error("Sign in failed. Please try again.");
      return;
    }

    if (role) {
      const membership = await assertAccountMembership(data.user.id, role);
      if (!membership.ok) {
        await supabase.auth.signOut();
        clearSessionMode();
        toast.error(membership.message);
        return;
      }
    }

    persistMode();
    toast.success("Welcome back!");
    const fallback = await resolvePostLoginPath(data.user.id);
    const path = search.redirect ?? roleRedirect(fallback);
    navigate({ to: path as never });
  };

  const loading = form.formState.isSubmitting;

  return (
    <div className="space-y-5">
      {role && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs">
          <span className="text-muted-foreground">
            Signing in as{" "}
            <span className="font-semibold text-foreground">
              {role === "seller" ? "Seller" : "Customer"}
            </span>
          </span>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="cursor-pointer font-semibold text-brand hover:underline disabled:opacity-50"
            >
              Change
            </button>
          )}
        </div>
      )}

      <form onSubmit={form.handleSubmit(submit)} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="email">{role === "seller" ? "Work email" : "Email"}</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            className="mt-1.5 h-11"
            autoComplete="email"
            disabled={loading}
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="mt-1 text-xs text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="cursor-pointer text-xs font-medium text-brand hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-1.5">
            <Input
              id="password"
              type={show ? "text" : "password"}
              placeholder="Enter password"
              className="h-11 pr-10"
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

        <div className="flex items-center gap-2">
          <Checkbox
            id="remember"
            checked={!!form.watch("remember")}
            disabled={loading}
            onCheckedChange={(v) => form.setValue("remember", !!v)}
          />
          <Label htmlFor="remember" className="cursor-pointer text-sm font-normal">
            Remember me for 30 days
          </Label>
        </div>

        <Button type="submit" size="lg" loading={loading} className="w-full shadow-brand">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
