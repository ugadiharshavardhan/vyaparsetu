import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  Award,
  BadgeCheck,
  Building2,
  Calendar,
  ChevronRight,
  MapPin,
  MessageCircle,
  Package,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { getSupplierById, SUPPLIERS } from "@/data/suppliers";
import { useCategories, useProductsBySupplier } from "@/hooks/useCatalog";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import { Rating } from "@/components/common/Rating";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ReviewCard, type ReviewData } from "@/components/product/ReviewCard";
import { ProductGridSkeleton } from "@/components/product/ProductCardSkeleton";
import { MarketplacePending } from "@/components/common/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";
import { asSupplier } from "@/lib/catalogMap";
import type { Supplier } from "@/types";

async function resolveSupplier(id: string): Promise<Supplier | null> {
  const normalized = id.trim();
  if (!normalized) return null;

  const fromDirectory =
    getSupplierById(normalized) ||
    SUPPLIERS.find((s) => s.id.toLowerCase() === normalized.toLowerCase()) ||
    SUPPLIERS.find((s) => s.name.toLowerCase() === normalized.toLowerCase());
  if (fromDirectory) return fromDirectory;

  try {
    const { data, error } = await supabase
      .from("products")
      .select("supplier")
      .filter("supplier->>id", "eq", normalized)
      .limit(1)
      .maybeSingle();

    if (!error && data?.supplier) {
      const supplier = asSupplier(data.supplier);
      if (supplier.id) {
        return {
          ...supplier,
          description:
            supplier.description ??
            `${supplier.name} — verified wholesale partner on VyaparSetu.`,
        };
      }
    }

    const { data: sample } = await supabase.from("products").select("supplier").limit(80);
    for (const row of sample ?? []) {
      const supplier = asSupplier(row.supplier);
      if (
        supplier.id.toLowerCase() === normalized.toLowerCase() ||
        supplier.name.toLowerCase() === normalized.toLowerCase()
      ) {
        return {
          ...supplier,
          description:
            supplier.description ??
            `${supplier.name} — verified wholesale partner on VyaparSetu.`,
        };
      }
    }
  } catch (e) {
    console.warn("[resolveSupplier]", e);
  }
  return null;
}

export const Route = createFileRoute("/suppliers/$id")({
  ssr: false,
  pendingComponent: MarketplacePending,
  loader: async ({ params }) => {
    const id = decodeURIComponent(params.id ?? "").trim();
    if (!id) throw notFound();
    const supplier = await resolveSupplier(id);
    if (!supplier?.id) throw notFound();
    return { supplier };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.supplier.name} — VyaparSetu` : "Supplier — VyaparSetu" },
      {
        name: "description",
        content: loaderData?.supplier.description ?? "Verified wholesale supplier on VyaparSetu",
      },
    ],
  }),
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Supplier not found</h1>
      <p className="mt-2 text-muted-foreground">This store may have been removed or the link is invalid.</p>
      <Button asChild className="mt-6">
        <Link to="/suppliers">All suppliers</Link>
      </Button>
    </div>
  ),
  component: SupplierProfile,
});

const REVIEWS: ReviewData[] = [
  {
    id: "r1",
    name: "Rahul Nair",
    rating: 5,
    text: "Fast dispatch, always ships on the same day for MOQ orders. Highly recommend.",
    verified: true,
    helpful: 21,
    date: "3 weeks ago",
  },
  {
    id: "r2",
    name: "Anita M.",
    rating: 4,
    text: "Good pricing and clean invoicing. Would like better after-sales response for damaged units.",
    verified: true,
    helpful: 6,
    date: "1 month ago",
  },
  {
    id: "r3",
    name: "Farhan Q.",
    rating: 5,
    text: "Reliable partner for the last 2 years. Never had a stock issue during festive season.",
    verified: true,
    helpful: 14,
    date: "2 months ago",
  },
];

function SupplierProfile() {
  const { supplier } = Route.useLoaderData();
  const { data: products = [], isLoading } = useProductsBySupplier(supplier.id, 96);
  const { data: categories = [] } = useCategories();
  const suppliedCategories = supplier.categories
    ? categories.filter((c) => supplier.categories?.includes(c.slug))
    : Array.from(new Set(products.map((p) => p.category)))
        .map((slug) => categories.find((c) => c.slug === slug)!)
        .filter(Boolean);

  return (
    <div className="container-page py-8 md:py-12">
      <nav className="flex items-center gap-1 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-brand">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/suppliers" className="hover:text-brand">
          Suppliers
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{supplier.name}</span>
      </nav>

      <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <div className="h-32 gradient-brand" />
        <div className="grid gap-6 p-6 sm:grid-cols-[auto_1fr_auto] sm:items-end sm:p-8">
          <div className="-mt-16 grid h-24 w-24 place-items-center rounded-2xl border-4 border-card bg-white text-3xl font-bold text-brand shadow-soft">
            {supplier.logo ? (
              <img src={supplier.logo} alt="" className="h-full w-full rounded-xl object-cover" />
            ) : (
              supplier.name.slice(0, 1)
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{supplier.name}</h1>
              {supplier.verified && <VerifiedBadge />}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {supplier.location}
              </span>
              <Rating value={supplier.rating} />
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {supplier.yearsActive}+ yrs
              </span>
            </div>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{supplier.description}</p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Button className="shadow-brand">
              <MessageCircle className="mr-2 h-4 w-4" /> Contact supplier
            </Button>
            <Button variant="outline" asChild>
              <Link to="/marketplace">Browse marketplace</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: Package,
            label: "Products listed",
            value: String(supplier.totalProducts ?? products.length),
          },
          { icon: ShieldCheck, label: "GST verified", value: supplier.gstVerified ? "Yes" : "Pending" },
          {
            icon: TrendingUp,
            label: "Response rate",
            value: supplier.responseRate ? `${supplier.responseRate}%` : "—",
          },
          { icon: Award, label: "Business type", value: supplier.businessType ?? "Wholesale" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <s.icon className="h-5 w-5 text-brand" />
            <div className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {s.label}
            </div>
            <div className="mt-1 font-display text-xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      {suppliedCategories.length > 0 && (
        <div className="mt-10">
          <SectionHeading title="Categories supplied" subtitle="Product categories this supplier covers" />
          <div className="mt-4 flex flex-wrap gap-2">
            {suppliedCategories.map((c) => (
              <Link
                key={c.id}
                to="/categories/$slug"
                params={{ slug: c.slug }}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:border-brand hover:text-brand"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <SectionHeading title="Products from this supplier" subtitle={`${products.length} listed`} />
        <div className="mt-6">{isLoading ? <ProductGridSkeleton /> : <ProductGrid products={products} />}</div>
      </div>

      <div className="mt-10">
        <SectionHeading title="Buyer reviews" subtitle="What retailers say about this supplier" />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-4 rounded-2xl border border-border bg-muted/30 p-6 md:grid-cols-3">
        <div className="flex gap-3">
          <BadgeCheck className="h-5 w-5 shrink-0 text-brand" />
          <div>
            <div className="text-sm font-semibold">Verified supplier</div>
            <p className="mt-1 text-xs text-muted-foreground">
              GST and business documents reviewed by VyaparSetu.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Building2 className="h-5 w-5 shrink-0 text-brand" />
          <div>
            <div className="text-sm font-semibold">Factory / warehouse</div>
            <p className="mt-1 text-xs text-muted-foreground">Ships from {supplier.location || "India"}.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <ShieldCheck className="h-5 w-5 shrink-0 text-brand" />
          <div>
            <div className="text-sm font-semibold">Secure trade</div>
            <p className="mt-1 text-xs text-muted-foreground">Orders and payments protected on the platform.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
