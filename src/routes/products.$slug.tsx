import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import {
  Boxes, ChevronRight, Heart, MapPin, MessageCircle, PackageCheck,
  ShieldCheck, ShoppingCart, Sparkles, Truck, Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { mapDbProduct, type DbProduct } from "@/lib/catalogMap";
import { getRelatedFromList, useProducts } from "@/hooks/useCatalog";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import { StockBadge } from "@/components/common/StockBadge";
import { RatingBadge } from "@/components/common/RatingBadge";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductGallery } from "@/components/product/ProductGallery";
import { SpecificationTable } from "@/components/product/SpecificationTable";
import { ReviewCard, type ReviewData } from "@/components/product/ReviewCard";
import { SectionHeading } from "@/components/common/SectionHeading";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", params.slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw notFound();
    return { product: mapDbProduct(data as unknown as DbProduct) };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.product.name} — VyaparSetu` : "Product — VyaparSetu" },
      { name: "description", content: loaderData?.product.description ?? "Wholesale product on VyaparSetu" },
      ...(loaderData
        ? [
            { property: "og:title", content: loaderData.product.name },
            { property: "og:description", content: loaderData.product.description },
            { property: "og:image", content: loaderData.product.image },
          ]
        : []),
    ],
  }),
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Product not found</h1>
      <p className="mt-2 text-muted-foreground">This SKU may have been removed by the supplier.</p>
      <Button asChild className="mt-6"><Link to="/marketplace">Back to marketplace</Link></Button>
    </div>
  ),
  component: ProductPage,
});

const REVIEWS: ReviewData[] = [
  { id: "r1", name: "Mehul Shah", rating: 5, text: "Consistent quality across 6 orders. Delivery is always on time and packaging is bulk-transit ready.", date: "2 weeks ago", helpful: 12, verified: true },
  { id: "r2", name: "Kavya R.", rating: 4, text: "Great pricing at MOQ. Would love bigger slab discounts above 100 units.", date: "1 month ago", helpful: 4, verified: true },
  { id: "r3", name: "Anwar P.", rating: 5, text: "GST invoice was clean and matched my books perfectly. Solid supplier.", date: "2 months ago", helpful: 8, verified: true },
];

const PRODUCT_FAQS = [
  { q: "Is the GST invoice included in the price?", a: "Yes. Every order generates a GST-compliant invoice with HSN, taxable value and tax breakdown." },
  { q: "What is the average delivery time?", a: "2–3 business days for metro cities, 4–5 days for tier 2/3. Ships from the supplier's nearest warehouse." },
  { q: "Can I return damaged units?", a: "Yes. Report damage within 48 hours with photos and we replace or refund damaged units." },
  { q: "Are bulk-slab discounts available?", a: "Yes. Volume pricing unlocks automatically at 3x MOQ and above. Contact the supplier for larger orders." },
];

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { data: allProducts = [] } = useProducts();
  const gallery = product.images ?? [product.image];
  const related = useMemo(() => getRelatedFromList(allProducts, product), [allProducts, product]);
  const { ids, push } = useRecentlyViewed();
  const recentlyViewed = allProducts.filter((p) => ids.includes(p.id) && p.id !== product.id).slice(0, 4);

  useEffect(() => { push(product.id); }, [product.id, push]);

  return (
    <div className="container-page py-8 md:py-12">
      <nav className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-brand">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/marketplace" className="hover:text-brand">Marketplace</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/marketplace" search={{ category: product.category } as never} className="capitalize hover:text-brand">
          {product.category}
        </Link>
        {product.subCategory && (
          <>
            <ChevronRight className="h-3 w-3" />
            <span>{product.subCategory}</span>
          </>
        )}
        <ChevronRight className="h-3 w-3" />
        <span className="line-clamp-1 text-foreground">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <ProductGallery images={gallery} alt={product.name} />

        <div className="flex min-w-0 flex-col">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {product.brand} · SKU {product.sku}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">
            {product.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <RatingBadge value={product.rating} count={product.reviewCount} />
            <StockBadge inStock={product.inStock} stock={product.stockCount} />
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <PriceDisplay
              price={product.wholesalePrice}
              mrp={product.mrp}
              gstIncluded={product.gstIncluded}
              gstRate={product.gstRate}
              size="lg"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Wholesale price per {product.unit}. Volume pricing unlocks at {product.moq * 3}+ units.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs">
              <div className="rounded-xl bg-secondary p-3">
                <div className="font-semibold text-foreground">{product.moq}</div>
                <div className="text-muted-foreground">MOQ ({product.unit})</div>
              </div>
              <div className="rounded-xl bg-secondary p-3">
                <div className="font-semibold text-foreground">2–3 days</div>
                <div className="text-muted-foreground">Delivery</div>
              </div>
              <div className="rounded-xl bg-secondary p-3">
                <div className="font-semibold text-foreground">Yes</div>
                <div className="text-muted-foreground">GST invoice</div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button size="lg" disabled className="flex-1 shadow-brand" title="Cart ships in next phase">
                <ShoppingCart className="mr-1.5 h-4 w-4" /> Add to Cart
              </Button>
              <Button size="lg" variant="outline" disabled className="flex-1" title="Checkout ships in next phase">
                <Zap className="mr-1.5 h-4 w-4" /> Buy Now
              </Button>
              <Button size="lg" variant="outline" aria-label="Save">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
            <Button size="lg" variant="ghost" className="mt-2 w-full text-brand">
              <MessageCircle className="mr-1.5 h-4 w-4" /> Send Inquiry to Supplier
            </Button>
          </div>

          {product.highlights && product.highlights.length > 0 && (
            <div className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h3 className="flex items-center gap-2 font-display text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-brand" /> Product highlights
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {product.highlights.map((h: string, i: number) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-start gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl gradient-brand font-semibold text-white">
                {product.supplier.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="truncate font-semibold text-foreground">{product.supplier.name}</div>
                  {product.supplier.verified && <VerifiedBadge />}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {product.supplier.location}
                  <span>·</span>
                  <span>★ {product.supplier.rating.toFixed(1)}</span>
                  <span>·</span>
                  <span>{product.supplier.yearsActive}+ yrs on VyaparSetu</span>
                </div>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/suppliers/$id" params={{ id: product.supplier.id }}>View store</Link>
              </Button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-brand" /> Verified</div>
              <div className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-brand" /> Ships pan-India</div>
              <div className="flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5 text-brand" /> Replies in 2h</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-14">
        <Tabs defaultValue="desc">
          <TabsList>
            <TabsTrigger value="desc">Description</TabsTrigger>
            <TabsTrigger value="spec">Specifications</TabsTrigger>
            <TabsTrigger value="pack">Packaging</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({REVIEWS.length})</TabsTrigger>
            <TabsTrigger value="faq">FAQs</TabsTrigger>
          </TabsList>

          <TabsContent value="desc" className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </TabsContent>

          <TabsContent value="spec" className="mt-6 max-w-3xl">
            <SpecificationTable specs={product.specifications} />
          </TabsContent>

          <TabsContent value="pack" className="mt-6 max-w-3xl">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h3 className="flex items-center gap-2 font-display text-base font-semibold">
                <PackageCheck className="h-4 w-4 text-brand" /> Packaging details
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {product.packagingDetails}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-xs sm:grid-cols-4">
                <Meta label="Unit" value={product.unit} />
                <Meta label="MOQ" value={`${product.moq} ${product.unit}`} />
                <Meta label="Stock" value={product.stockCount.toLocaleString("en-IN")} />
                <Meta label="HSN" value={product.specifications.HSN ?? "—"} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6 grid gap-4 sm:grid-cols-3">
            {REVIEWS.map((r) => <ReviewCard key={r.id} review={r} />)}
          </TabsContent>

          <TabsContent value="faq" className="mt-6 max-w-3xl">
            <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card px-5 shadow-soft">
              {PRODUCT_FAQS.map((f) => (
                <AccordionItem key={f.q} value={f.q}>
                  <AccordionTrigger>{f.q}</AccordionTrigger>
                  <AccordionContent>{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
        </Tabs>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <SectionHeading align="left" eyebrow="Related" title="You might also like" />
          <div className="mt-8"><ProductGrid products={related} /></div>
        </div>
      )}

      {recentlyViewed.length > 0 && (
        <div className="mt-16">
          <SectionHeading align="left" eyebrow="Just browsed" title="Recently viewed" />
          <div className="mt-8"><ProductGrid products={recentlyViewed} /></div>
        </div>
      )}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

// Silence unused import for Boxes (kept for future use)
void Boxes;
