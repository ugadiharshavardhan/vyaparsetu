import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendEmailOtp, verifyEmailOtp, type OtpPurpose } from "@/lib/otp";

type Props = {
  email: string;
  purpose: OtpPurpose;
  /** Auth user id — improves send/resend reliability for signup */
  userId?: string;
  /**
   * For reset: new password.
   * For signup: password chosen at registration (synced via admin so sign-in works).
   */
  newPassword?: string;
  submitLabel?: string;
  /** Return false to abort verify (e.g. password form invalid). */
  beforeVerify?: () => boolean | Promise<boolean>;
  /** Receives verify API payload (includes token_hash for signup). */
  onVerified: (result: { token_hash?: string }) => void | Promise<void>;
  onResent?: () => void;
};

export function EmailOtpForm({
  email,
  purpose,
  userId,
  newPassword,
  submitLabel = "Verify code",
  beforeVerify,
  onVerified,
  onResent,
}: Props) {
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const verify = async () => {
    const trimmed = code.replace(/\s/g, "");
    if (!/^\d{6}$/.test(trimmed)) {
      toast.error("Enter the 6-digit code from your email");
      return;
    }
    if (purpose === "reset" && (!newPassword || newPassword.length < 8)) {
      toast.error("Enter a new password first");
      return;
    }
    if (beforeVerify) {
      const ok = await beforeVerify();
      if (!ok) return;
    }
    setVerifying(true);
    try {
      const result = await verifyEmailOtp({
        email,
        purpose,
        code: trimmed,
        // Signup: sync the form password so later sign-ins work
        // even if Supabase kept an older credential from a prior attempt.
        newPassword: newPassword || undefined,
      });
      toast.success(purpose === "signup" ? "Email verified" : "Password updated");
      await onVerified({ token_hash: result.token_hash });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      const result = await sendEmailOtp(email, purpose, {
        userId,
        force: true,
      });
      setCode("");
      const institutional = /\.(edu|ac)\.[a-z]{2,}$/i.test(email) || /\.edu$/i.test(email);
      toast.success(
        result.message ||
          (institutional
            ? "New code sent — check inbox and Spam/Junk (college mail often delays Gmail)"
            : "A new code was sent to your email"),
      );
      onResent?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not resend code");
    } finally {
      setResending(false);
    }
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        void verify();
      }}
    >
      <div>
        <Label htmlFor="otp">6-digit code</Label>
        <Input
          id="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="••••••"
          className="mt-1.5 h-12 tracking-[0.35em] text-center text-lg font-semibold"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          Sent to <span className="font-medium text-foreground">{email}</span>. Expires in 10 minutes.
          {/\.(edu|ac)\.[a-z]{2,}$/i.test(email) || /\.edu$/i.test(email) ? (
            <> Also check <span className="font-medium text-foreground">Spam / Junk</span> — college emails often delay Gmail.</>
          ) : null}
        </p>
      </div>
      <Button
        type="submit"
        size="lg"
        className="w-full shadow-brand"
        disabled={verifying || code.length !== 6}
      >
        {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {submitLabel}
      </Button>
      <button
        type="button"
        className="w-full text-center text-sm font-medium text-brand hover:underline disabled:opacity-50"
        disabled={resending}
        onClick={() => void resend()}
      >
        {resending ? "Sending…" : "Resend code"}
      </button>
    </form>
  );
}
