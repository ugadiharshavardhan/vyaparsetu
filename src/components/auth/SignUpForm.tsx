import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Factory, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { useSearch } from "@tanstack/react-router";
import { setSessionMode } from "@/lib/sessionMode";
import { establishSessionAfterSignup, registerWithOtp } from "@/lib/otp";
import { peekPendingCartAdd } from "@/lib/pendingCart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { EmailOtpForm } from "@/components/auth/EmailOtpForm";
import { LocalAssetDropzone, type LocalAsset } from "@/components/auth/LocalAssetDropzone";
import { attachSellerBrandAssets } from "@/lib/sellerBrandAssets";
import type { BusinessRole } from "./RoleSelect";

const passwordSchema = {
  password: z
    .string()
    .min(8, "At least 8 characters")
    .max(72)
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[a-z]/, "Must include a lowercase letter")
    .regex(/[0-9]/, "Must include a number"),
  confirmPassword: z.string().min(1, "Confirm your password"),
};

const phoneRegex = /^[+]?\d[\d\s-]{7,14}\d$/;

const buyerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Name is required").max(120),
    businessName: z.string().trim().min(2, "Business name is required").max(120),
    email: z.string().trim().email("Please enter a valid email").max(255),
    phone: z.string().trim().regex(phoneRegex, "Enter a valid mobile number"),
    whatsapp: z
      .string()
      .trim()
      .optional()
      .refine((v) => !v || phoneRegex.test(v), "Enter a valid WhatsApp number"),
    address: z.string().trim().min(5, "Business address is required").max(500),
    password: passwordSchema.password,
    confirmPassword: passwordSchema.confirmPassword,
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms to continue" }),
    }),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

const sellerSchema = z
  .object({
    businessName: z.string().trim().min(2, "Business name is required").max(120),
    fullName: z.string().trim().min(2, "Owner name is required").max(120),
    email: z.string().trim().email("Please enter a valid email").max(255),
    phone: z.string().trim().regex(phoneRegex, "Enter a valid mobile number"),
    gstNumber: z
      .string()
      .trim()
      .optional()
      .refine(
        (v) => !v || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v),
        "Enter a valid 15-character GSTIN",
      ),
    address: z.string().trim().optional(),
    password: passwordSchema.password,
    confirmPassword: passwordSchema.confirmPassword,
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms to continue" }),
    }),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type BuyerFormValues = z.infer<typeof buyerSchema>;
type SellerFormValues = z.infer<typeof sellerSchema>;

function showSignUpError(message: string) {
  const msg = message.toLowerCase();
  if (msg.includes("already") || msg.includes("registered")) {
    toast.error("This email is already registered. Try signing in instead.");
  } else if (msg.includes("weak") || msg.includes("password")) {
    toast.error("Please choose a stronger password.");
  } else {
    toast.error(message);
  }
}

export function SignUpForm({
  role,
  onBack,
}: {
  role: BusinessRole;
  onBack?: () => void;
}) {
  if (role === "seller") {
    return <SellerSignUp onBack={onBack} />;
  }
  return <BuyerSignUp onBack={onBack} />;
}

function BuyerSignUp({ onBack }: { onBack?: () => void }) {
  const [show, setShow] = useState(false);
  const [pendingVerify, setPendingVerify] = useState<{
    email: string;
    password: string;
    userId: string;
  } | null>(null);
  const form = useForm<BuyerFormValues>({
    resolver: zodResolver(buyerSchema),
    defaultValues: {
      fullName: "",
      businessName: "",
      email: "",
      phone: "",
      whatsapp: "",
      address: "",
      password: "",
      confirmPassword: "",
    },
  });

  const submit = async (values: BuyerFormValues) => {
    const email = values.email.trim().toLowerCase();
    const phone = values.phone.trim();
    const whatsapp = (values.whatsapp ?? "").trim() || phone;
    const address = values.address.trim();
    try {
      const result = await registerWithOtp({
        email,
        password: values.password,
        role: "buyer",
        profile: {
          full_name: values.fullName.trim(),
          business_name: values.businessName.trim(),
          phone,
          whatsapp,
          address,
        },
      });
      if (!result.userId) {
        toast.error("Could not start email verification. Please try again.");
        return;
      }
      setPendingVerify({ email, password: values.password, userId: result.userId });
      toast.success(
        result.message ||
          (/\.(edu|ac)\.[a-z]{2,}$/i.test(email)
            ? "Code sent — check inbox and Spam/Junk (college mail often delays Gmail)"
            : "We sent a 6-digit code to your email"),
      );
    } catch (e) {
      showSignUpError(e instanceof Error ? e.message : "Could not create account");
    }
  };

  if (pendingVerify) {
    return (
      <SignupOtpStep
        email={pendingVerify.email}
        password={pendingVerify.password}
        userId={pendingVerify.userId}
        role="buyer"
        onBack={() => setPendingVerify(null)}
      />
    );
  }

  return (
    <div className="space-y-5">
      <RoleBanner role="buyer" onBack={onBack} />
      <form onSubmit={form.handleSubmit(submit)} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="fullName">Name</Label>
          <Input
            id="fullName"
            placeholder="Rakesh Sharma"
            className="mt-1.5 h-11"
            {...form.register("fullName")}
          />
          {form.formState.errors.fullName && (
            <p className="mt-1 text-xs text-destructive">{form.formState.errors.fullName.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="businessName">Business name</Label>
          <Input
            id="businessName"
            placeholder="Sharma Kirana Store"
            className="mt-1.5 h-11"
            {...form.register("businessName")}
          />
          {form.formState.errors.businessName && (
            <p className="mt-1 text-xs text-destructive">{form.formState.errors.businessName.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            className="mt-1.5 h-11"
            autoComplete="email"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="mt-1 text-xs text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="buyer-phone">Phone number</Label>
            <Input
              id="buyer-phone"
              type="tel"
              placeholder="+91 98765 43210"
              className="mt-1.5 h-11"
              autoComplete="tel"
              {...form.register("phone")}
            />
            {form.formState.errors.phone && (
              <p className="mt-1 text-xs text-destructive">{form.formState.errors.phone.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="buyer-whatsapp">
              WhatsApp <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="buyer-whatsapp"
              type="tel"
              placeholder="Same as phone if empty"
              className="mt-1.5 h-11"
              {...form.register("whatsapp")}
            />
            {form.formState.errors.whatsapp && (
              <p className="mt-1 text-xs text-destructive">{form.formState.errors.whatsapp.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="buyer-address">Business address</Label>
          <Input
            id="buyer-address"
            placeholder="Shop / street, area, city, pincode"
            className="mt-1.5 h-11"
            autoComplete="street-address"
            {...form.register("address")}
          />
          {form.formState.errors.address && (
            <p className="mt-1 text-xs text-destructive">{form.formState.errors.address.message}</p>
          )}
        </div>

        <PasswordFields
          show={show}
          setShow={setShow}
          register={form.register}
          passwordError={form.formState.errors.password?.message}
          confirmError={form.formState.errors.confirmPassword?.message}
        />

        <TermsCheckbox
          checked={!!form.watch("acceptTerms")}
          onCheckedChange={(v) => form.setValue("acceptTerms", (!!v) as true, { shouldValidate: true })}
          error={form.formState.errors.acceptTerms?.message}
        />

        <Button type="submit" size="lg" loading={form.formState.isSubmitting} className="w-full shadow-brand">
          {form.formState.isSubmitting ? "Creating account…" : "Create customer account"}
        </Button>
      </form>
    </div>
  );
}

function SellerSignUp({ onBack }: { onBack?: () => void }) {
  const [show, setShow] = useState(false);
  const [logoAsset, setLogoAsset] = useState<LocalAsset | null>(null);
  const [shopAsset, setShopAsset] = useState<LocalAsset | null>(null);
  const [assetError, setAssetError] = useState<string | null>(null);
  const [pendingVerify, setPendingVerify] = useState<{
    email: string;
    password: string;
    userId: string;
    logoFile: File | null;
    shopFile: File | null;
  } | null>(null);
  const form = useForm<SellerFormValues>({
    resolver: zodResolver(sellerSchema),
    defaultValues: {
      businessName: "",
      fullName: "",
      email: "",
      phone: "",
      gstNumber: "",
      address: "",
      password: "",
      confirmPassword: "",
    },
  });

  const submit = async (values: SellerFormValues) => {
    if (!logoAsset || !shopAsset) {
      setAssetError("Business logo and shop image are required for verification");
      toast.error("Please upload your business logo and shop image");
      return;
    }
    setAssetError(null);
    const email = values.email.trim().toLowerCase();
    try {
      const result = await registerWithOtp({
        email,
        password: values.password,
        role: "seller",
        profile: {
          full_name: values.fullName.trim(),
          business_name: values.businessName.trim(),
          phone: values.phone.trim(),
          gst_number: values.gstNumber?.trim() || undefined,
          address: values.address?.trim() || undefined,
        },
      });
      if (!result.userId) {
        toast.error("Could not start email verification. Please try again.");
        return;
      }
      setPendingVerify({
        email,
        password: values.password,
        userId: result.userId,
        logoFile: logoAsset.file,
        shopFile: shopAsset.file,
      });
      toast.success(
        result.message ||
          (/\.(edu|ac)\.[a-z]{2,}$/i.test(email)
            ? "Code sent — check inbox and Spam/Junk (college mail often delays Gmail)"
            : "We sent a 6-digit code to your email"),
      );
    } catch (e) {
      showSignUpError(e instanceof Error ? e.message : "Could not create account");
    }
  };

  if (pendingVerify) {
    return (
      <SignupOtpStep
        email={pendingVerify.email}
        password={pendingVerify.password}
        userId={pendingVerify.userId}
        role="seller"
        logoFile={pendingVerify.logoFile}
        shopFile={pendingVerify.shopFile}
        onBack={() => setPendingVerify(null)}
      />
    );
  }

  return (
    <div className="space-y-5">
      <RoleBanner role="seller" onBack={onBack} />
      <form onSubmit={form.handleSubmit(submit)} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="businessName">Business name</Label>
            <Input
              id="businessName"
              placeholder="Sharma Kirana Store"
              className="mt-1.5 h-11"
              {...form.register("businessName")}
            />
            {form.formState.errors.businessName && (
              <p className="mt-1 text-xs text-destructive">{form.formState.errors.businessName.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="fullName">Owner name</Label>
            <Input
              id="fullName"
              placeholder="Rakesh Sharma"
              className="mt-1.5 h-11"
              {...form.register("fullName")}
            />
            {form.formState.errors.fullName && (
              <p className="mt-1 text-xs text-destructive">{form.formState.errors.fullName.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              className="mt-1.5 h-11"
              autoComplete="email"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="mt-1 text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Mobile number</Label>
            <Input
              id="phone"
              placeholder="+91 98765 43210"
              className="mt-1.5 h-11"
              autoComplete="tel"
              {...form.register("phone")}
            />
            {form.formState.errors.phone && (
              <p className="mt-1 text-xs text-destructive">{form.formState.errors.phone.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="gst">
            GSTIN <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="gst"
            placeholder="29ABCDE1234F1Z5"
            className="mt-1.5 h-11 uppercase"
            {...form.register("gstNumber")}
          />
          {form.formState.errors.gstNumber && (
            <p className="mt-1 text-xs text-destructive">{form.formState.errors.gstNumber.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="address">
            Business address <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="address"
            placeholder="Shop 12, MG Road, Mumbai"
            className="mt-1.5 h-11"
            {...form.register("address")}
          />
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <h3 className="font-display text-base font-semibold">Brand assets</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Required for admin verification. Your products stay hidden from buyers until approved.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <LocalAssetDropzone
              label="Business Logo"
              value={logoAsset}
              onChange={(asset) => {
                setLogoAsset(asset);
                setAssetError(null);
              }}
            />
            <LocalAssetDropzone
              label="Shop Image"
              value={shopAsset}
              onChange={(asset) => {
                setShopAsset(asset);
                setAssetError(null);
              }}
            />
          </div>
          {assetError && <p className="mt-2 text-xs text-destructive">{assetError}</p>}
        </div>

        <PasswordFields
          show={show}
          setShow={setShow}
          register={form.register}
          passwordError={form.formState.errors.password?.message}
          confirmError={form.formState.errors.confirmPassword?.message}
        />

        <TermsCheckbox
          checked={!!form.watch("acceptTerms")}
          onCheckedChange={(v) => form.setValue("acceptTerms", (!!v) as true, { shouldValidate: true })}
          error={form.formState.errors.acceptTerms?.message}
        />

        <Button type="submit" size="lg" loading={form.formState.isSubmitting} className="w-full shadow-brand">
          {form.formState.isSubmitting ? "Creating account…" : "Create seller account"}
        </Button>
      </form>
    </div>
  );
}

function RoleBanner({ role, onBack }: { role: BusinessRole; onBack?: () => void }) {
  const isSeller = role === "seller";
  const RoleIcon = isSeller ? Factory : ShoppingBag;
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-brand-soft/40 px-3 py-2">
      <div className="flex items-center gap-2 text-sm">
        <div className="grid h-8 w-8 place-items-center rounded-lg gradient-brand text-white">
          <RoleIcon className="h-4 w-4" />
        </div>
        <div>
          <div className="font-semibold leading-tight">
            {isSeller ? "Seller sign up" : "Customer sign up"}
          </div>
          <div className="text-xs text-muted-foreground">
            {isSeller ? "Full business details required" : "Name, business, email & password"}
          </div>
        </div>
      </div>
      {onBack && (
        <Button variant="ghost" size="sm" onClick={onBack} className="text-xs">
          <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Change
        </Button>
      )}
    </div>
  );
}

function SignupOtpStep({
  email,
  password,
  userId,
  role,
  logoFile,
  shopFile,
  onBack,
}: {
  email: string;
  password: string;
  userId: string;
  role: BusinessRole;
  logoFile?: File | null;
  shopFile?: File | null;
  onBack: () => void;
}) {
  const search = useSearch({ strict: false }) as { redirect?: string };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-center font-display text-xl font-semibold">Verify your email</h3>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Enter the 6-digit code we emailed you to activate your{" "}
          {role === "seller" ? "seller" : "customer"} account.
        </p>
        <div className="mt-5">
          <EmailOtpForm
            email={email}
            purpose="signup"
            userId={userId}
            newPassword={password}
            submitLabel="Verify & continue"
            onVerified={async ({ token_hash }) => {
              try {
                const session = await establishSessionAfterSignup({
                  email,
                  password,
                  tokenHash: token_hash,
                });
                if (role === "seller") {
                  try {
                    await attachSellerBrandAssets({
                      userId: session.userId || userId,
                      logo: logoFile,
                      shopImage: shopFile,
                    });
                  } catch (uploadErr) {
                    toast.error(
                      uploadErr instanceof Error
                        ? uploadErr.message
                        : "Account created, but brand assets failed to upload. Add them from Profile.",
                    );
                  }
                }
                setSessionMode(role === "seller" ? "seller" : "buyer");
                toast.success(
                  role === "seller"
                    ? "Account verified — pending admin approval"
                    : "Account verified — you're signed in!",
                );
                const pending = peekPendingCartAdd();
                const next =
                  search.redirect ||
                  pending?.returnTo ||
                  (role === "seller" ? "/seller/dashboard" : "/marketplace");
                window.location.assign(next);
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Sign in failed after verification");
              }
            }}
          />
        </div>
        <button
          type="button"
          className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground"
          onClick={onBack}
        >
          <ArrowLeft className="mr-1 inline h-3.5 w-3.5" /> Back
        </button>
      </div>
    </div>
  );
}

function PasswordFields({
  show,
  setShow,
  register,
  passwordError,
  confirmError,
}: {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  register: ReturnType<typeof useForm>["register"];
  passwordError?: string;
  confirmError?: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative mt-1.5">
          <Input
            id="password"
            type={show ? "text" : "password"}
            className="h-11 pr-10"
            autoComplete="new-password"
            {...register("password")}
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
        {passwordError && <p className="mt-1 text-xs text-destructive">{passwordError}</p>}
      </div>
      <div>
        <Label htmlFor="confirm">Confirm password</Label>
        <Input
          id="confirm"
          type={show ? "text" : "password"}
          className="mt-1.5 h-11"
          autoComplete="new-password"
          {...register("confirmPassword")}
        />
        {confirmError && <p className="mt-1 text-xs text-destructive">{confirmError}</p>}
      </div>
    </div>
  );
}

function TermsCheckbox({
  checked,
  onCheckedChange,
  error,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  error?: string;
}) {
  return (
    <>
      <div className="flex items-start gap-2">
        <Checkbox id="terms" checked={checked} onCheckedChange={(v) => onCheckedChange(!!v)} />
        <Label htmlFor="terms" className="cursor-pointer text-sm font-normal leading-snug">
          I agree to the{" "}
          <Link to="/about" className="cursor-pointer text-brand hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/about" className="cursor-pointer text-brand hover:underline">
            Privacy Policy
          </Link>
          .
        </Label>
      </div>
      {error && <p className="-mt-2 text-xs text-destructive">{error}</p>}
    </>
  );
}
