import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearSessionMode } from "@/lib/sessionMode";

/** Sole platform admin credentials (password set in Auth via service role). */
export const ADMIN_LOGIN_EMAIL = "ugadiharshavardhan@gmail.com";

const schema = z.object({
  email: z.string().trim().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

export function AdminSignInForm() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: ADMIN_LOGIN_EMAIL, password: "" },
  });

  const submit = async (values: FormValues) => {
    const email = values.email.trim().toLowerCase();
    if (email !== ADMIN_LOGIN_EMAIL) {
      toast.error("Use the platform admin email to continue");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: values.password,
    });

    if (error) {
      toast.error(
        error.message.toLowerCase().includes("invalid")
          ? "Incorrect admin email or password"
          : error.message,
      );
      return;
    }

    const userId = data.user?.id;
    if (!userId || !data.session) {
      toast.error("Sign in failed. Please try again.");
      return;
    }

    const { data: isAdmin, error: adminErr } = await supabase.rpc("is_admin", {
      _user_id: userId,
    });
    if (adminErr || !isAdmin) {
      await supabase.auth.signOut();
      clearSessionMode();
      toast.error("This account is not authorized for the admin dashboard");
      return;
    }

    clearSessionMode();
    toast.success("Welcome, admin");
    navigate({ to: "/admin", replace: true });
  };

  const loading = form.formState.isSubmitting;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-brand-soft/40 px-3 py-2.5">
        <div className="grid h-9 w-9 place-items-center rounded-lg gradient-brand text-white">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold leading-tight">Platform admin</div>
          <div className="truncate text-xs text-muted-foreground">{ADMIN_LOGIN_EMAIL}</div>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(submit)} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="admin-email">Admin email</Label>
          <Input
            id="admin-email"
            type="email"
            className="mt-1.5 h-11"
            autoComplete="username"
            disabled={loading}
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="mt-1 text-xs text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="admin-password">Password</Label>
          <div className="relative mt-1.5">
            <Input
              id="admin-password"
              type={show ? "text" : "password"}
              placeholder="Enter admin password"
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

        <Button type="submit" size="lg" loading={loading} className="w-full shadow-brand">
          {loading ? "Signing in…" : "Sign in to admin"}
        </Button>
      </form>
    </div>
  );
}
