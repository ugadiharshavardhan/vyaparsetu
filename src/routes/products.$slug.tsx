import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Heart,
  MapPin,
  MessageCircle,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Zap,
} from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/common/Rating";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import { discountPct, inr } from "@/lib/format";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/products/$slug")({
  loader: ({ params }) => {
    const product = getProductBySlug(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.product.name} — VyaparSetu` : "Product — VyaparSetu" },
      {
        name: "description",
        content: loaderData?.product.description ?? "Wholesale product on VyaparSetu",
      },
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

const REVIEWS = [
  { name: "Mehul S.", rating: 5, text: "Consistent quality across 6 orders. Delivery is always on time." },
  { name: "Kavya R.", rating: 4, text: "Great pricing at MOQ. Would love bigger slab discounts above 100 units." },
  { name: "Anwar P.", rating: 5, text: "GST invoice was clean and matched my books perfectly." },
];

function ProductPage() {
  const { product } = Route.useLoaderData();
  const [activeImg, setActiveImg] = useState(0);
  const gallery = product.images ?? [product.image, product.image, product.image];
  const related = getRelatedProducts(product);
  const off = discountPct(product.mrp, product.wholesalePrice);

  return (
    <div className="container-page py-8 md:py-12">
      <nav className="flex items-center gap-1 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-brand">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/marketplace" className="hover:text-brand">Marketplace</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="capitalize">{product.category}</span>
        <ChevronRight className="h-3 w-3" />
        <span className="line-clamp-1 text-foreground">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <motion.div
            key={activeImg}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
          >
            <img src={gallery[activeImg]} alt={product.name} className="h-full w-full object-cover" />
            {off > 0 && (
              <span className="absolute left-5 top-5 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white shadow-brand">
                {off}% OFF
              </span>
            )}
          </motion.div>
          <div className="mt-4 flex gap-3">
            {gallery.map((g, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`relative h-20 w-20 overflow-hidden rounded-xl border transition-all ${
                  activeImg === i ? "border-brand ring-2 ring-brand/30" : "border-border"
                }`}
              >
                <img src={g} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{product.brand}</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">
            {product.name}
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <Rating value={product.rating} count={product.reviewCount} />
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs font-semibold text-brand">
              {product.inStock ? `In stock (${product.stockCount})` : "Out of stock"}
            </span>
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">{inr(product.wholesalePrice)}</span>
              {product.mrp > product.wholesalePrice && (
                <span className="text-sm text-muted-foreground line-through">{inr(product.mrp)}</span>
              )}
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand">
                {product.gstIncluded ? `GST ${product.gstRate}% incl.` : `+ ${product.gstRate}% GST`}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Wholesale price per {product.unit}. Bulk pricing unlocks at 50+ units.</p>

            <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs">
              <div className="rounded-xl bg-secondary p-3">
                <div className="font-semibold text-foreground">{product.moq}</div>
                <div className="text-muted-foreground">MOQ ({product.unit})</div>
              </div>
              <div className="rounded-xl bg-secondary p-3">
                <div className="font-semibold text-foreground">2-3 days</div>
                <div className="text-muted-foreground">Delivery</div>
              </div>
              <div className="rounded-xl bg-secondary p-3">
                <div className="font-semibold text-foreground">Yes</div>
                <div className="text-muted-foreground">GST invoice</div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button size="lg" disabled className="flex-1 shadow-brand" title="Available after sign in">
                <ShoppingCart className="mr-1.5 h-4 w-4" /> Add to Cart
              </Button>
              <Button size="lg" variant="outline" disabled className="flex-1" title="Available after sign in">
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

          <div className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl gradient-brand text-white font-semibold">
                {product.supplier.name[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-foreground">{product.supplier.name}</div>
                  {product.supplier.verified && <VerifiedBadge />}
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {product.supplier.location}
                  <span>·</span>
                  <Rating value={product.supplier.rating} />
                  <span>·</span>
                  {product.supplier.yearsActive}+ yrs on VyaparSetu
                </div>
              </div>
              <Button variant="outline" size="sm">View Store</Button>
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
            <TabsTrigger value="reviews">Reviews ({REVIEWS.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="desc" className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </TabsContent>
          <TabsContent value="spec" className="mt-6">
            <dl className="grid max-w-2xl grid-cols-1 divide-y divide-border rounded-2xl border border-border bg-card sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              {Object.entries(product.specifications).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between p-4 text-sm">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6 grid gap-4 sm:grid-cols-3">
            {REVIEWS.map((r) => (
              <div key={r.name} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <Rating value={r.rating} />
                <p className="mt-3 text-sm text-foreground">"{r.text}"</p>
                <p className="mt-3 text-xs font-semibold text-muted-foreground">— {r.name}</p>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <SectionHeading align="left" eyebrow="Related" title="You might also like" />
          <div className="mt-8">
            <ProductGrid products={related} />
          </div>
        </div>
      )}
    </div>
  );
}
