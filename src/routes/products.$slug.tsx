import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ChevronRight, Loader2, MapPin, MessageCircle, Minus, PackageCheck, Plus,
  ShieldCheck, Sparkles, Truck, Percent, HelpCircle, Star, Heart, Share2, ShieldAlert
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { mapDbProduct, type DbProduct } from "@/lib/catalogMap";
import { useCartRelatedProducts, useProductsByIds, useRelatedProducts } from "@/hooks/useCatalog";
import { useCart } from "@/hooks/useCart";
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
import { useProductReviews } from "@/hooks/useProductReviews";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useCartLine, useRemoveCartItem } from "@/hooks/useCart";
import { openCartSheet } from "@/hooks/useCartSheet";
import { AddToCartControl } from "@/components/cart/AddToCartControl";
import { SaveProductButton } from "@/components/product/SaveProductButton";

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
  const navigate = useNavigate();
  const { product } = Route.useLoaderData();
  const { data: dbReviews = [] } = useProductReviews(product.id);
  const { data: sameCategory = [], isLoading: relatedLoading } = useRelatedProducts(product, 8);
  const { data: cartItems = [] } = useCart();
  const cartActive = cartItems.filter((i) => !i.saved_for_later);
  const cartExcludeIds = cartActive.map((i) => i.product_id).concat(product.id);
  const cartCategories = Array.from(
    new Set(
      [
        product.category,
        ...cartActive.map((i) => i.product_snapshot?.category).filter(Boolean),
      ].filter((c): c is string => !!c && c.trim().length > 0),
    ),
  );
  const { data: cartRelated = [] } = useCartRelatedProducts({
    excludeIds: cartExcludeIds,
    categoryHints: cartCategories,
    limit: 8,
    enabled: cartActive.length > 0,
  });
  // Prefer cart-driven same-category picks when cart has items; else PDP category
  const related =
    cartActive.length > 0 && cartRelated.length > 0
      ? cartRelated
      : sameCategory;
  const gallery =
    product.images?.length > 0 ? product.images : product.image ? [product.image] : [];
  const { ids, push } = useRecentlyViewed();
  const recentIds = ids.filter((id) => id !== product.id).slice(0, 4);
  const { data: recentlyViewed = [], isLoading: recentLoading } = useProductsByIds(recentIds);

  const moq = Math.max(1, product.moq);
  const [qty, setQty] = useState(moq);
  const line = useCartLine(product.id);
  const remove = useRemoveCartItem();

  useEffect(() => { push(product.id); }, [product.id, push]);
  useEffect(() => {
    if (!line) setQty(moq);
  }, [product.id, moq, line]);

  const onInquiry = () => {
    const subject = encodeURIComponent(`Inquiry: ${product.name} (${product.sku ?? product.slug})`);
    const body = encodeURIComponent(
      `Hi ${product.supplier.name},\n\nI'm interested in "${product.name}" (MOQ ${product.moq} ${product.unit}).\nPlease share bulk pricing and availability.\n\nThanks`,
    );
    window.location.href = `mailto:hello@vyaparsetu.in?subject=${subject}&body=${body}`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      }).catch(() => undefined);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
    }
  };

  // Dynamic B2B wholesale pricing calculations
  const tier1Price = product.wholesalePrice;
  const tier2Price = Math.round(product.wholesalePrice * 0.97 * 100) / 100;
  const tier3Price = Math.round(product.wholesalePrice * 0.95 * 100) / 100;

  // Tabs visibility checks
  const hasDesc = !!product.description && product.description.trim() !== "";
  const hasSpecs = !!product.specifications && Object.keys(product.specifications).length > 0;
  const hasPack = !!product.packagingDetails && product.packagingDetails.trim() !== "";

  const tabs = [
    ...(hasDesc ? [{ value: "desc", label: "Description" }] : []),
    ...(hasSpecs ? [{ value: "spec", label: "Specifications" }] : []),
    ...(hasPack ? [{ value: "pack", label: "Packaging & Shipping" }] : []),
    { value: "reviews", label: `Reviews (${dbReviews.length})` },
    { value: "faq", label: "FAQs" }
  ];

  return (
    <div className="container-page py-6 md:py-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground font-medium py-2">
        <Link to="/" className="hover:text-brand transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
        <Link to="/marketplace" className="hover:text-brand transition-colors">Marketplace</Link>
        <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
        <Link to="/marketplace" search={{ category: product.category } as never} className="capitalize hover:text-brand transition-colors">
          {product.category?.replace(/-/g, " ")}
        </Link>
        {product.subCategory && (
          <>
            <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
            <span className="capitalize text-muted-foreground">{product.subCategory?.replace(/-/g, " ")}</span>
          </>
        )}
        <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
        <span className="line-clamp-1 text-foreground font-semibold">{product.name}</span>
      </nav>

      {/* Main Grid: Left Gallery/Tabs vs Right Sticky Purchase Card */}
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.3fr_1fr] items-start">
        {/* Left Column: Gallery, Highlights, Details Tabs */}
        <div className="flex flex-col gap-6">
          <ProductGallery images={gallery} alt={product.name} />

          {/* Highlights Section */}
          {product.highlights && product.highlights.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft transition-all hover:shadow-elevated duration-300">
              <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
                <Sparkles className="h-4 w-4 text-brand animate-pulse" /> Key Product Highlights
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-muted-foreground">
                {product.highlights.map((h: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    <span className="leading-snug">{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Information & Details Tabs */}
          {tabs.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft transition-all hover:shadow-elevated duration-300">
              <Tabs defaultValue={tabs[0]?.value || "desc"} className="w-full">
                <TabsList className="w-full flex justify-start border-b border-border bg-transparent p-0 rounded-none h-auto gap-6 overflow-x-auto pb-px">
                  {tabs.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="px-1 py-3 text-sm font-semibold rounded-none border-b-2 !border-transparent data-[state=active]:!border-brand data-[state=active]:text-brand data-[state=active]:bg-transparent hover:text-brand/85 transition-all p-0 h-auto bg-transparent shadow-none cursor-pointer"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {hasDesc && (
                  <TabsContent value="desc" className="mt-6 text-sm leading-relaxed text-muted-foreground focus-visible:outline-none">
                    <div className="prose prose-sm dark:prose-invert max-w-none text-justify whitespace-pre-line">
                      {product.description}
                    </div>
                  </TabsContent>
                )}
                
                {hasSpecs && (
                  <TabsContent value="spec" className="mt-6 focus-visible:outline-none">
                    <div className="overflow-hidden rounded-xl border border-border">
                      <SpecificationTable specs={product.specifications} />
                    </div>
                  </TabsContent>
                )}
                
                {hasPack && (
                  <TabsContent value="pack" className="mt-6 focus-visible:outline-none">
                    <div className="flex flex-col gap-5">
                      <div className="flex items-center gap-2">
                        <PackageCheck className="h-5 w-5 text-brand" />
                        <h4 className="font-display font-semibold text-foreground text-sm">Packaging Specifications</h4>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground bg-secondary/35 rounded-xl p-4 border border-border/50">
                        {product.packagingDetails}
                      </p>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <Meta label="Unit of Measure" value={product.unit} />
                        <Meta label="Minimum Order" value={`${product.moq} ${product.unit}`} />
                        <Meta label="Stock Level" value={product.stockCount.toLocaleString("en-IN")} />
                        <Meta label="HSN Code" value={product.specifications.HSN ?? "—"} />
                      </div>
                    </div>
                  </TabsContent>
                )}
                
                <TabsContent value="reviews" className="mt-6 focus-visible:outline-none">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-secondary/20 p-5">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl font-display font-bold text-foreground">
                        {product.rating > 0 ? product.rating.toFixed(1) : "—"}
                      </div>
                      <div>
                        <RatingBadge value={product.rating} count={product.reviewCount} />
                        <div className="text-xs text-muted-foreground mt-1">Based on {product.reviewCount} verified B2B transactions</div>
                      </div>
                    </div>
                    <Button onClick={() => toast.info("To write a review, please visit your Order Details page and select the item you purchased.")} className="shadow-brand bg-brand text-brand-foreground hover:bg-brand/90 font-medium text-xs px-4 cursor-pointer">
                      Write a Review
                    </Button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {dbReviews.length > 0 ? (
                      dbReviews.map((r) => (
                        <ReviewCard
                          key={r.id}
                          review={{
                            id: r.id,
                            name: r.buyer?.fullName || r.buyer?.businessName || "Retailer",
                            rating: r.rating,
                            text: r.comment || "Verified transaction",
                            date: new Date(r.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }),
                            verified: true,
                          }}
                        />
                      ))
                    ) : (
                      <div className="col-span-full py-8 text-center text-sm text-muted-foreground">
                        No reviews yet for this product.
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="faq" className="mt-6 focus-visible:outline-none">
                  <Accordion type="single" collapsible className="border border-border rounded-2xl overflow-hidden divide-y divide-border">
                    {PRODUCT_FAQS.map((f) => (
                      <AccordionItem key={f.q} value={f.q} className="border-0 px-4">
                        <AccordionTrigger className="text-sm font-semibold hover:text-brand hover:no-underline py-4">{f.q}</AccordionTrigger>
                        <AccordionContent className="text-sm leading-relaxed text-muted-foreground pb-4">{f.a}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Purchase Panel & Supplier Info */}
        <div className="lg:sticky lg:top-8 flex flex-col gap-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft hover:shadow-elevated transition-all duration-300">
            {/* Header Metadata */}
            <div className="flex items-center justify-between gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              <span>{product.brand}</span>
              {product.sku && <span>SKU: {product.sku}</span>}
            </div>

            {/* Product Title */}
            <h1 className="mt-2.5 font-display text-2xl font-bold tracking-tight text-foreground leading-tight">
              {product.name}
            </h1>

            {/* Ratings & Stock Status Row */}
            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <RatingBadge value={product.rating} count={product.reviewCount} />
              <StockBadge inStock={product.inStock} stock={product.stockCount} />
            </div>

            {/* Premium Price Block */}
            <div className="mt-5 space-y-1">
              <div className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Wholesale Price</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-foreground">
                  ₹{product.wholesalePrice.toLocaleString("en-IN")}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  / {product.unit}
                </span>
                {product.mrp && product.mrp > product.wholesalePrice && (
                  <>
                    <span className="text-sm line-through text-muted-foreground/70">
                      ₹{product.mrp.toLocaleString("en-IN")}
                    </span>
                    <span className="rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 text-[10px] font-bold">
                      Save {Math.round(((product.mrp - product.wholesalePrice) / product.mrp) * 100)}%
                    </span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">
                {product.gstIncluded ? "GST Included" : `+${product.gstRate}% GST`} (HSN: {product.specifications.HSN ?? "—"})
              </p>
            </div>

            {/* B2B Wholesale Pricing Tiers Table */}
            {product.moq > 0 && (
              <div className="mt-4 rounded-xl bg-secondary/35 p-3.5 border border-border/80">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5">Bulk Pricing Tiers</div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg bg-card p-2 border border-border/60 flex flex-col items-center justify-center text-center">
                    <span className="text-muted-foreground font-semibold text-[10px]">{moq}-{moq * 3 - 1} {product.unit}</span>
                    <span className="font-bold text-foreground mt-1">₹{tier1Price}</span>
                    <span className="text-[9px] text-muted-foreground mt-0.5 font-medium">Base Price</span>
                  </div>
                  <div className="rounded-lg bg-card p-2 border border-border/60 flex flex-col items-center justify-center text-center">
                    <span className="text-muted-foreground font-semibold text-[10px]">{moq * 3}-{moq * 10 - 1} {product.unit}</span>
                    <span className="font-bold text-brand mt-1">₹{tier2Price}</span>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">3% OFF</span>
                  </div>
                  <div className="rounded-lg bg-card p-2 border border-border/60 flex flex-col items-center justify-center text-center">
                    <span className="text-muted-foreground font-semibold text-[10px]">{moq * 10}+ {product.unit}</span>
                    <span className="font-bold text-brand mt-1">₹{tier3Price}</span>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">5% OFF</span>
                  </div>
                </div>
              </div>
            )}

            {/* Product Information Cards Grid */}
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-border bg-secondary/10 p-2.5 flex items-center gap-2.5">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                  <PackageCheck className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground truncate">MOQ</div>
                  <div className="text-xs font-semibold text-foreground truncate">{product.moq} {product.unit}</div>
                </div>
              </div>
              
              <div className="rounded-xl border border-border bg-secondary/10 p-2.5 flex items-center gap-2.5">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground truncate">Inventory</div>
                  <div className="text-xs font-semibold text-foreground truncate">
                    {product.inStock ? `${product.stockCount} Units` : "Out of stock"}
                  </div>
                </div>
              </div>
              
              <div className="rounded-xl border border-border bg-secondary/10 p-2.5 flex items-center gap-2.5">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                  <Truck className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground truncate">Shipping</div>
                  <div className="text-xs font-semibold text-foreground truncate">{product.deliveryEstimate ?? "2–3 Days"}</div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-secondary/10 p-2.5 flex items-center gap-2.5">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                  <Percent className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground truncate">Taxation</div>
                  <div className="text-xs font-semibold text-foreground truncate">{product.gstRate}% GST</div>
                </div>
              </div>
            </div>

            {/* Quantity Picker & Add To Cart Operations */}
            {!line && (
              <div className="mt-5 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Quantity</div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Increments of 1 {product.unit}</p>
                  </div>
                  <div className="inline-flex items-center rounded-full border border-border bg-background shadow-sm h-10">
                    <button
                      type="button"
                      disabled={!product.inStock || qty <= moq}
                      onClick={() => setQty((q) => Math.max(moq, q - 1))}
                      className="grid h-10 w-10 place-items-center text-muted-foreground hover:bg-secondary disabled:opacity-40 rounded-l-full cursor-pointer transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <input
                      type="number"
                      value={qty}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (isNaN(val)) return;
                        if (val > product.stockCount) {
                          toast.error(`Only ${product.stockCount} units available in stock`);
                          setQty(product.stockCount);
                        } else {
                          setQty(Math.max(moq, val));
                        }
                      }}
                      className="w-12 text-center text-sm font-semibold focus:outline-none bg-transparent border-0 focus:ring-0 p-0"
                    />
                    <button
                      type="button"
                      disabled={!product.inStock || qty + 1 > product.stockCount}
                      onClick={() => {
                        const next = qty + 1;
                        if (next > product.stockCount) {
                          toast.error(`Only ${product.stockCount} units available in stock`);
                          return;
                        }
                        setQty(next);
                      }}
                      className="grid h-10 w-10 place-items-center text-muted-foreground hover:bg-secondary disabled:opacity-40 rounded-r-full cursor-pointer transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons Row */}
            <div className="mt-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <AddToCartControl
                  product={product}
                  size="lg"
                  initialQuantity={qty}
                  className="flex-1 shadow-brand text-sm font-bold h-12"
                />
                <SaveProductButton product={product} variant="button" size="lg" className="h-12 border border-border" />
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="lg"
                  className="h-12 px-3.5 border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  aria-label="Share product"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {line && (
                <div className="rounded-xl bg-brand-soft/50 p-3 text-xs border border-brand/20">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-brand">
                      {line.quantity} {product.unit} in your cart · (MOQ: {moq})
                    </span>
                    <div className="flex items-center gap-3 font-semibold">
                      <button
                        type="button"
                        className="text-brand hover:underline cursor-pointer"
                        onClick={() => openCartSheet()}
                      >
                        View Cart
                      </button>
                      <span className="text-muted-foreground/50">|</span>
                      <button
                        type="button"
                        className="text-destructive hover:underline cursor-pointer"
                        onClick={() => remove.mutate(line.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <Button
                size="lg"
                className="w-full text-sm font-bold py-3 h-12 bg-amber-500 hover:bg-amber-600 text-white shadow-soft transition-all duration-200 cursor-pointer"
                disabled={!product.inStock}
                onClick={() => {
                  if (qty > product.stockCount) {
                    toast.error(`Only ${product.stockCount} units available in stock`);
                    return;
                  }
                  navigate({
                    to: "/checkout",
                    search: {
                      buyNowProductId: product.id,
                      buyNowQuantity: qty,
                    } as any,
                  });
                }}
              >
                Buy Now
              </Button>
            </div>
          </div>

          {/* Premium Verified Supplier Card */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft hover:shadow-elevated transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand to-emerald-600 font-display font-semibold text-white text-lg shadow-sm">
                {product.supplier.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-bold text-foreground text-sm truncate leading-snug">{product.supplier.name}</div>
                  {product.supplier.verified && <VerifiedBadge />}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground font-medium">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/75" /> {product.supplier.location}</span>
                  <span>·</span>
                  <span className="text-amber-500 flex items-center gap-0.5 font-bold">
                    {product.supplier.rating && product.supplier.rating > 0 ? (
                      <>★ {product.supplier.rating.toFixed(1)} ({product.supplier.reviewCount ?? 0} ratings)</>
                    ) : (
                      <>No ratings yet</>
                    )}
                  </span>
                  <span>·</span>
                  <span>{product.supplier.yearsActive}+ Yrs</span>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand shrink-0" /> Verified Supplier</div>
              <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-brand shrink-0" /> Ships Pan-India</div>
              <div className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-brand shrink-0" /> Replies within 2h</div>
              <div className="flex items-center gap-2"><PackageCheck className="h-4 w-4 text-brand shrink-0" /> High Fulfillment</div>
            </div>

            <div className="mt-5 flex gap-2.5">
              {product.supplier.id ? (
                <Button asChild variant="outline" size="sm" className="flex-1 text-xs h-9 border-border hover:bg-secondary transition-colors cursor-pointer">
                  <Link to="/suppliers/$id" params={{ id: product.supplier.id }}>
                    View Store
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="flex-1 text-xs h-9" disabled>
                  View Store
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs h-9 text-brand border-brand/20 hover:bg-brand-soft/20 hover:border-brand/40 transition-all cursor-pointer font-semibold"
                onClick={onInquiry}
              >
                Send Inquiry
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Grid */}
      {(relatedLoading || related.length > 0) && (
        <div className="mt-16 border-t border-border pt-12">
          <SectionHeading
            align="left"
            eyebrow={cartActive.length > 0 ? "BASED ON YOUR CART" : "SAME CATEGORY"}
            title="You might also like"
            description={
              cartActive.length > 0
                ? "Products from the same categories as items in your cart."
                : `More wholesale products in ${product.category?.replace(/-/g, " ") || "this category"}.`
            }
          />
          <div className="mt-8">
            {relatedLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-10 justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-brand" /> Loading related products…
              </div>
            ) : (
              <ProductGrid products={related} />
            )}
          </div>
        </div>
      )}

      {/* Recently Viewed Products Grid */}
      {(recentLoading || recentlyViewed.length > 0) && (
        <div className="mt-16 border-t border-border pt-12">
          <SectionHeading align="left" eyebrow="JUST BROWSED" title="Recently viewed" />
          <div className="mt-8">
            {recentLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-10 justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-brand" /> Loading recently viewed…
              </div>
            ) : (
              <ProductGrid products={recentlyViewed} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/50 border border-border/40 p-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-xs font-bold text-foreground truncate">{value}</div>
    </div>
  );
}
