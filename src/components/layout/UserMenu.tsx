import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { toast } from "sonner";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  Settings as SettingsIcon,
  ShieldCheck,
  ShoppingCart,
  User as UserIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext, useAuth } from "@/hooks/useAuth";
import { useProfile, useRoles } from "@/hooks/useProfile";
import { useSessionMode } from "@/hooks/useSessionMode";
import { clearSessionMode } from "@/lib/sessionMode";

function initials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email || "";
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "V") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function UserMenu() {
  const auth = useContext(AuthContext);

  if (!auth) return <GuestActions />;

  return <ProvidedUserMenu />;
}

function GuestActions() {
  return (
    <div className="flex items-center gap-2">
      <Link
        to="/auth"
        search={{ mode: "signin" }}
        className="hidden rounded-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground md:inline-flex"
      >
        Sign in
      </Link>
      <Link
        to="/auth"
        search={{ mode: "signup" }}
        className="inline-flex items-center rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-brand transition hover:opacity-95"
      >
        Get Started
      </Link>
    </div>
  );
}

function ProvidedUserMenu() {
  const { user, isAuthenticated, loading } = useAuth();
  const { data: profile } = useProfile();
  const { data: roles } = useRoles();
  const sessionMode = useSessionMode();
  const navigate = useNavigate();
  const qc = useQueryClient();

  if (loading) return <Skeleton className="h-10 w-10 rounded-full" />;

  if (!isAuthenticated) {
    return <GuestActions />;
  }

  const isAdmin = roles?.includes("admin");
  const hasSellerRole = !!roles?.some((r) => r === "wholesaler" || r === "manufacturer" || r === "distributor");
  const isSeller = sessionMode === "seller" || (sessionMode !== "buyer" && hasSellerRole);
  const handleSignOut = async () => {
    try {
      await qc.cancelQueries();
      qc.clear();
      clearSessionMode();
      await supabase.auth.signOut();
      toast.success("You've been signed out");
      navigate({ to: "/", replace: true });
    } catch {
      toast.error("Could not sign out");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="grid h-10 w-10 place-items-center rounded-full gradient-brand text-sm font-bold text-white shadow-brand transition hover:opacity-95"
          aria-label="Open account menu"
        >
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            initials(profile?.full_name ?? profile?.business_name, user?.email)
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="truncate font-semibold text-foreground">
              {profile?.business_name ?? profile?.full_name ?? "Your account"}
            </span>
            <span className="truncate text-xs font-normal text-muted-foreground">{user?.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isSeller && (
          <DropdownMenuItem asChild>
            <Link to="/dashboard" className="cursor-pointer">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer">
            <UserIcon className="mr-2 h-4 w-4" /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/wishlist" className="cursor-pointer">
            <Heart className="mr-2 h-4 w-4" /> Wishlist
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/cart" className="cursor-pointer">
            <ShoppingCart className="mr-2 h-4 w-4" /> Cart
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings" className="cursor-pointer">
            <SettingsIcon className="mr-2 h-4 w-4" /> Settings
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link to="/admin" className="cursor-pointer">
              <ShieldCheck className="mr-2 h-4 w-4" /> Admin console
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
