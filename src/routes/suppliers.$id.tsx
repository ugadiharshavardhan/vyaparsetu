import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  Award, BadgeCheck, Building2, Calendar, ChevronRight,
  MapPin, MessageCircle, ShieldCheck, TrendingUp,
} from "lucide-react";
import { getSupplierById } from "@/data/suppliers";
import { getBySupplier, useCategories, useProducts } from "@/hooks/useCatalog";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import { Rating } from "@/components/common/Rating";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ReviewCard, type ReviewData } from "@/components/product/ReviewCard";
import { ProductGridSkeleton } from "@/components/product/ProductCardSkeleton";

export const Route = createFileRoute("/suppliers/$id")({
  loader: ({ params }) => {
    const supplier = getSupplierById(params.id);
    if (!supplier) throw notFound();
    return { supplier };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.supplier.name} — VyaparSetu` : "Supplier — VyaparSetu" },
      { name: "description", content: loaderData?.supplier.description ?? "Verified wholesale supplier on VyaparSetu" },
    ],
  }),
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Supplier not found</h1>
      <Button asChild className="mt-6"><Link to="/suppliers">All suppliers</Link></Button>
    </div>
  ),
  component: SupplierProfile,
});

const REVIEWS: ReviewData[] = [
  { id: "r1", name: "Rahul Nair", rating: 5, text: "Fast dispatch, always ships on the same day for MOQ orders. Highly recommend.", verified: true, helpful: 21, date: "3 weeks ago" },
  { id: "r2", name: "Anita M.", rating: 4, text: "Good pricing and clean invoicing. Would like better after-sales response for damaged units.", verified: true, helpful: 6, date: "1 month ago" },
  { id: "r3", name: "Farhan Q.", rating: 5, text: "Reliable partner for the last 2 years. Never had a stock issue during festive season.", verified: true, helpful: 14, date: "2 months ago" },
];

function SupplierProfile() {
  const { supplier } = Route.useLoaderData();
  const { data: allProducts = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const products = getBySupplier(allProducts, supplier.id);
  const suppliedCategories = supplier.categories
    ? categories.filter((c) => supplier.categories?.includes(c.slug))
    : Array.from(new Set(products.map((p) => p.category)))
        .map((slug) => categories.find((c) => c.slug === slug)!)
        .filter(Boolean);

  return (
    <div className="container-page py-8 md:py-12">
      <nav className="flex items-center gap-1 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-brand">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/suppliers" className="hover:text-brand">Suppliers</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{supplier.name}</span>
      </nav>

      <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <div className="h-32 gradient-brand" />
        <div className="grid gap-6 p-6 sm:grid-cols-[auto_1fr_auto] sm:items-end sm:p-8">
          <div className="-mt-16 grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-3xl border-4 border-card bg-white text-2xl font-bold shadow-elevated sm:h-28 sm:w-28">
            {supplier.logo ? (
              <img src={supplier.logo} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="gradient-brand bg-clip-text text-transparent">{supplier.name[0]}</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate font-display text-2xl font-bold tracking-tight sm:text-3xl">
                {supplier.name}
              </h1>
              {supplier.verified && <VerifiedBadge label="Verified" />}
              {supplier.gstVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success">
                  <BadgeCheck className="h-3 w-3" /> GST verified
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {supplier.businessType && (
                <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {supplier.businessType}</span>
              )}
              <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {supplier.location}</span>
              {supplier.established && (
                <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Est. {supplier.established}</span>
              )}
              <Rating value={supplier.rating} />
            </div>
          </div>
          <Button size="lg" className="shadow-brand" disabled title="Direct chat launches next phase">
            <MessageCircle className="mr-1.5 h-4 w-4" /> Contact supplier
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-border p-6 sm:grid-cols-4 sm:p-8">
          <Stat icon={ShieldCheck} label="Products" value={String(products.length)} />
          <Stat icon={TrendingUp} label="Response rate" value={`${supplier.responseRate ?? 92}%`} />
          <Stat icon={Award} label="Years active" value={`${supplier.yearsActive}+`} />
          <Stat icon={BadgeCheck} label="Rating" value={supplier.rating.toFixed(1)} />
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_2fr]">
        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="font-display text-sm font-semibold">About</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {supplier.description ?? "Verified wholesale partner on VyaparSetu."}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="font-display text-sm font-semibold">Categories supplied</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {suppliedCategories.map((c) => (
                <Link
                  key={c.id}
                  to="/marketplace"
                  search={{ category: c.slug, supplier: supplier.id } as never}
                  className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground transition hover:border-brand/40 hover:text-brand"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <div>
          <SectionHeading
            align="left"
            eyebrow="Catalog"
            title={`Products from ${supplier.name}`}
            description={`${products.length} SKUs currently listed`}
          />
          <div className="mt-6">
            {isLoading ? (
              <ProductGridSkeleton count={6} />
            ) : products.length > 0 ? (
              <ProductGrid products={products.slice(0, 6)} />
            ) : (
              <p className="text-sm text-muted-foreground">No products listed yet.</p>
            )}
          </div>
          {products.length > 6 && (
            <div className="mt-6">
              <Button asChild variant="outline">
                <Link to="/marketplace" search={{ supplier: supplier.id } as never}>See all {products.length} products</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-16">
        <SectionHeading align="left" eyebrow="Feedback" title="Buyer reviews" />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {REVIEWS.map((r) => <ReviewCard key={r.id} review={r} />)}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof ShieldCheck; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary p-4">
      <Icon className="h-4 w-4 text-brand" />
      <div className="mt-2 font-display text-xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
