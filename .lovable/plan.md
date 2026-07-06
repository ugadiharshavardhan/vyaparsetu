# VyaparSetu — Technical Architecture & Design Blueprint (v1.0)

Stack: **TanStack Start v1 (React 19) + Vite 7 + Tailwind v4 + shadcn/ui + Lovable Cloud (Supabase)**. No code — planning only.

---

## PART A — SYSTEM ARCHITECTURE

### 1. Folder Structure

```text
src/
├─ routes/                        # File-based routing (TanStack)
│  ├─ __root.tsx                  # Root shell, providers, head, auth listener
│  ├─ index.tsx                   # Landing
│  ├─ marketplace.tsx             # Marketplace layout (<Outlet/>)
│  ├─ marketplace.index.tsx       # Catalog grid
│  ├─ marketplace.category.$slug.tsx
│  ├─ marketplace.search.tsx
│  ├─ product.$id.tsx
│  ├─ supplier.$id.tsx
│  ├─ auth.tsx                    # Login / OTP / signup (public)
│  ├─ reset-password.tsx
│  ├─ onboarding.tsx              # Business registration wizard (public but session-required)
│  ├─ legal.terms.tsx / legal.privacy.tsx
│  ├─ _authenticated/
│  │  ├─ route.tsx                # Integration-managed auth gate (ssr:false)
│  │  ├─ dashboard.tsx            # Role-aware dashboard router
│  │  ├─ cart.tsx
│  │  ├─ checkout.tsx
│  │  ├─ orders.index.tsx
│  │  ├─ orders.$id.tsx           # Order detail + tracking
│  │  ├─ notifications.tsx
│  │  ├─ finance.index.tsx        # Ledger, credit, payouts
│  │  ├─ profile.tsx
│  │  ├─ settings.tsx
│  │  ├─ seller/                  # Manufacturer / Distributor
│  │  │  ├─ products.index.tsx
│  │  │  ├─ products.new.tsx
│  │  │  ├─ products.$id.edit.tsx
│  │  │  ├─ orders.index.tsx
│  │  │  ├─ analytics.tsx
│  │  │  └─ promotions.tsx
│  │  └─ admin/                   # RBAC-gated inside beforeLoad
│  │     ├─ index.tsx
│  │     ├─ kyc.tsx
│  │     ├─ users.tsx
│  │     ├─ catalog-moderation.tsx
│  │     ├─ disputes.tsx
│  │     ├─ payouts.tsx
│  │     └─ cms.tsx
│  └─ api/public/
│     ├─ webhooks.payment.ts
│     ├─ webhooks.logistics.ts
│     └─ health.ts
├─ components/
│  ├─ ui/                         # shadcn primitives
│  ├─ layout/                     # AppShell, Header, Footer, Sidebar, MobileNav
│  ├─ marketplace/                # ProductCard, TierPriceTable, MoqBadge, Filters
│  ├─ orders/                     # OrderTimeline, StatusPill, InvoiceViewer
│  ├─ cart/                       # CartLine, SellerGroup, Summary
│  ├─ seller/                     # CatalogTable, BulkUploader, PricingMatrix
│  ├─ admin/                      # KycReviewer, DisputeCard, PayoutRun
│  ├─ finance/                    # LedgerTable, CreditMeter, RepaymentSchedule
│  ├─ common/                     # EmptyState, ErrorState, DataTable, PageHeader
│  └─ brand/                      # Logo, VerifiedBadge, TrustBadges
├─ features/                      # Feature-scoped hooks, queries, schemas
│  ├─ auth/  catalog/  cart/  orders/  payments/  credit/
│  ├─ kyc/  notifications/  admin/  analytics/  logistics/
├─ lib/
│  ├─ *.functions.ts              # createServerFn modules (client-safe)
│  ├─ *.server.ts                 # server-only helpers (never imported by components)
│  ├─ query-keys.ts               # Central query key factory
│  ├─ query-options.ts            # queryOptions() factories
│  ├─ formatters.ts               # ₹, GST, dates, phone
│  ├─ validators.ts               # Zod schemas (GSTIN, PAN, IFSC, HSN)
│  ├─ rbac.ts                     # Role/permission helpers
│  ├─ error-page.ts / error-capture.ts / lovable-error-reporting.ts
│  └─ utils.ts
├─ hooks/                         # Cross-feature reusable hooks
├─ integrations/supabase/         # Managed client, auth-middleware, types
├─ styles.css                     # Tailwind v4 + tokens
├─ router.tsx  server.ts  start.ts
```

### 2. Component Architecture
Four layers:
1. **Primitives** (`components/ui/*`) — shadcn atoms.
2. **Composites** (`components/<domain>/*`) — domain-aware, stateless where possible.
3. **Feature blocks** — orchestrate queries + composites (e.g., `<ProductDetail/>`, `<KycReviewPanel/>`).
4. **Route components** — thin; compose feature blocks; own `head()` + loaders.

Rules: no direct Supabase calls in components; data via `useSuspenseQuery(queryOptions)`; mutations via `useMutation` calling server fns.

### 3. Feature Modules
`auth`, `business`, `kyc`, `catalog`, `search`, `pricing`, `cart`, `checkout`, `orders`, `payments`, `credit`, `logistics`, `invoicing`, `notifications`, `chat`, `reviews`, `analytics`, `admin`, `cms`, `promotions`.

Each module owns: Zod schemas, query-options, server functions, mutations, components, and its slice of query-keys.

### 4. Route Structure (public vs protected)

| Public (SSR on) | Protected (`_authenticated`) |
|---|---|
| `/`, `/marketplace`, `/marketplace/category/$slug`, `/marketplace/search`, `/product/$id`, `/supplier/$id`, `/auth`, `/reset-password`, `/onboarding`, `/legal/*` | `/dashboard`, `/cart`, `/checkout`, `/orders`, `/orders/$id`, `/notifications`, `/finance`, `/profile`, `/settings`, `/seller/*`, `/admin/*` |

Admin gated by nested `beforeLoad` calling `hasRole('admin')`. Seller gated by `hasAnyRole(['manufacturer','distributor'])`.

### 5. Authentication Architecture
- Email/password + Google OAuth (Lovable broker) + phone OTP (Phase 2).
- Managed `_authenticated/route.tsx` (`ssr:false`) checks `supabase.auth.getUser()`.
- Root route registers a single `onAuthStateChange` filtered to SIGNED_IN / SIGNED_OUT / USER_UPDATED → `router.invalidate()` + selective `queryClient.invalidateQueries()`.
- RBAC via `user_roles` table + `has_role()` security-definer function; roles: `retailer | manufacturer | distributor | admin | ops | finance`.
- Sign-out hygiene: cancelQueries → clear → signOut → `navigate('/auth', replace:true)`.
- MFA (TOTP) required for admin, seller, and any user with active BNPL.
- Password HIBP check enabled.

### 6. Supabase (Lovable Cloud) Architecture
- **Browser client** for auth flows only.
- **`requireSupabaseAuth`** server-fn middleware for all user-scoped reads/writes.
- **Server publishable client** for public catalog reads (narrow anon SELECT policies).
- **`supabaseAdmin`** only inside `.server.ts` / verified webhooks (payments, logistics).
- Webhooks under `/api/public/webhooks/*` with HMAC verification.
- No Supabase Edge Functions for app-internal logic — use `createServerFn`.

### 7. Database Tables (logical)

Identity & Business
- `profiles` (id ⇄ auth.users, full_name, phone, avatar_url, locale, default_business_id)
- `businesses` (id, legal_name, display_name, type[retailer|manufacturer|distributor], gstin, pan, cin, address, city, state, pincode, status[pending|approved|rejected|suspended], created_by)
- `business_members` (business_id, user_id, role_in_business, status)
- `user_roles` (id, user_id, role: app_role enum)
- `kyc_documents` (id, business_id, doc_type, file_path, status, reviewer_id, reason)
- `bank_accounts` (id, business_id, holder, account_number_enc, ifsc, verified_at)

Catalog
- `categories` (id, parent_id, slug, name, image, level, sort)
- `brands` (id, business_id, name, logo)
- `products` (id, seller_business_id, brand_id, category_id, title, description, hsn, gst_rate, moq, lead_time_days, status[draft|pending|live|blocked], images[])
- `product_variants` (id, product_id, sku, attributes jsonb, weight, dimensions, stock)
- `price_tiers` (id, variant_id, min_qty, unit_price, currency)
- `inventory` (variant_id, warehouse_id, on_hand, reserved)
- `warehouses` (id, business_id, address, pincode)

Discovery
- `search_index` (mat view) / `product_search_tsv`
- `saved_lists`, `saved_list_items`
- `rfqs`, `rfq_responses` (Phase 2)

Commerce
- `carts` (id, buyer_business_id, user_id)
- `cart_items` (cart_id, variant_id, qty, unit_price_snapshot)
- `orders` (id, order_no, buyer_business_id, seller_business_id, status enum, subtotal, tax, shipping, total, payment_mode, credit_days, placed_at)
- `order_items` (order_id, variant_id, qty, unit_price, gst_amount, hsn)
- `order_events` (order_id, from_status, to_status, actor_id, reason, meta, created_at)
- `invoices` (id, order_id, invoice_no, pdf_path, gst_breakup jsonb)
- `shipments` (id, order_id, carrier, awb, status, eta, pod_path)
- `returns` (id, order_id, reason, status, refund_amount)
- `disputes` (id, order_id, opened_by, status, resolution)

Payments & Credit
- `payments` (id, order_id, gateway, gateway_ref, method, amount, status, captured_at)
- `payouts` (id, seller_business_id, cycle, amount, status, utr)
- `credit_accounts` (business_id, limit, exposure, dpd, status, nbfc_ref)
- `credit_transactions` (id, credit_account_id, order_id, type[debit|repay|fee], amount, due_at)
- `ledger_entries` (id, business_id, ref_type, ref_id, dr, cr, balance, at)

Engagement
- `notifications` (id, user_id, channel, template, payload jsonb, status, sent_at)
- `notification_preferences` (user_id, channel, event, enabled)
- `reviews` (id, order_id, buyer_business_id, seller_business_id, rating, text)
- `messages` (thread_id, sender_id, body, attachments)
- `threads` (id, buyer_business_id, seller_business_id, order_id?)

Ops & Trust
- `audit_logs` (id, actor_id, action, entity, entity_id, meta, at)
- `feature_flags`, `cms_banners`, `coupons`, `coupon_redemptions`
- `blacklist` (kind, value, reason)

Enums: `app_role`, `business_type`, `order_status`, `payment_method`, `payment_status`, `kyc_status`, `doc_type`.

### 8. Relationships (key)
```text
auth.users 1─1 profiles
profiles *─* businesses  (via business_members)
businesses 1─* products 1─* product_variants 1─* price_tiers
businesses 1─* warehouses 1─* inventory *─1 product_variants
buyer businesses 1─* orders *─1 seller businesses
orders 1─* order_items *─1 product_variants
orders 1─* order_events / 1─1 invoice / 1─* shipments / 1─* payments
businesses 1─1 credit_account 1─* credit_transactions
```

### 9. Storage Buckets
| Bucket | Visibility | Purpose |
|---|---|---|
| `product-images` | public read | Catalog images, thumbnails |
| `brand-assets` | public read | Logos, banners |
| `kyc-docs` | private | GST/PAN/bank proofs (signed URLs, admin-only) |
| `invoices` | private | GST invoice PDFs (owner + counterparty signed URL) |
| `pod` | private | Proof-of-delivery photos |
| `dispute-evidence` | private | Chat attachments, images |
| `cms` | public read | Banners, promo art |

### 10. RLS Plan (per table, principle-level)
- `profiles`: owner select/update.
- `businesses`: members select; creator update; admin all.
- `business_members`: business admins manage; users see own memberships.
- `user_roles`: user reads own; only `service_role` / admin fn inserts. Never modifiable from client.
- `products`, `variants`, `price_tiers`, `brands`, `categories`: **public SELECT** limited to `status='live'` (anon + authenticated); owner (seller) full CRUD via `has_business_role()`; admin all.
- `carts`, `cart_items`: owner user only.
- `orders`, `order_items`, `order_events`, `invoices`, `shipments`, `returns`: buyer members OR seller members OR admin. Writes gated by state machine via SECURITY DEFINER functions (`place_order`, `advance_order_status`).
- `payments`, `payouts`, `credit_*`, `ledger_entries`: owner business members read; writes only via server functions using service role.
- `notifications`: user_id = auth.uid().
- `reviews`: buyer of order can insert once post-delivery; public SELECT.
- `messages/threads`: participants only.
- `audit_logs`: admin read only; append-only via triggers.
- `kyc_documents`: uploader + admin; storage bucket policy mirrors.

Every `public.<table>` migration includes explicit `GRANT`s to `authenticated` (+ `anon` only where public SELECT policy exists) and `service_role`.

### 11. API Layer
- Primary: **TanStack server functions** (`createServerFn`) in `src/lib/*.functions.ts`.
- Middleware: `requireSupabaseAuth` on all user-scoped fns; `requireRole('admin')` composed for admin fns.
- Public reads via server publishable client (catalog, category tree, supplier public profile).
- Server routes (`/api/public/*`) for: payment gateway webhook, logistics webhook, health check, sitemap.xml.
- All inputs validated with Zod (`.inputValidator`).
- All mutations return typed result; errors thrown as typed `AppError` with code + user-safe message.

### 12. State Management
- **Server state**: TanStack Query (loader `ensureQueryData` + `useSuspenseQuery`), `defaultPreloadStaleTime: 0`.
- **URL state**: TanStack Router search params for filters, pagination, tabs.
- **Ephemeral UI**: local `useState`.
- **Cross-cutting client state**: Zustand slices for cart drawer, notification bell, command palette.
- No Redux. No Context for server data.

### 13. Context Providers (in `__root.tsx` order)
1. `QueryClientProvider`
2. `ThemeProvider` (light/dark/system)
3. `LocaleProvider` (en/hi + regional)
4. `AuthContext` (session snapshot for root routes; auth truth still Supabase)
5. `ToastProvider` (sonner)
6. `TooltipProvider`
7. `SidebarProvider` (inside authenticated shell only)
8. `CommandPaletteProvider`

### 14. Custom Hooks (representative)
`useSession`, `useCurrentBusiness`, `useRole`, `useHasPermission`, `useCart`, `useCartMutations`, `usePriceForQty`, `useProductSearch`, `useCategoryTree`, `useOrder`, `useOrderTimeline`, `useCheckout`, `usePaymentIntent`, `useCreditAccount`, `useNotifications`, `useRealtimeChannel`, `useDebouncedValue`, `useMediaQuery`, `useIsMobile`, `useCommandPalette`, `useCsvUpload`, `usePagination`, `useTableState`.

### 15. Utility Functions
Formatters (INR, qty, GST, phone, GSTIN mask), validators (GSTIN checksum, PAN, IFSC, HSN, pincode), invoice number generator, order-no generator, price calculator (tier + GST + shipping), stock reservation helpers, slugify, tsvector helpers, retry/backoff, HMAC verify, safe-URL redirect guard, date helpers (IST), CSV parser, image optimizer proxy URL builder.

### 16. Error Handling Strategy
- Route-level `errorComponent` + `notFoundComponent` on every route with a loader.
- Root `defaultErrorComponent` + reporting via `lovable-error-reporting`.
- Server fns throw `AppError { code, message, httpStatus }`; mutations surface via toast + inline field errors.
- Payment/webhook errors: idempotent handlers keyed by gateway_ref; DLQ table `webhook_failures`.
- Sentry-equivalent capture wired to `error-capture.ts`.
- User-facing copy is plain-language; technical details logged only.

### 17. Loading Strategy
- SSR + streaming for public routes (landing, catalog, PDP, supplier).
- Loader `ensureQueryData` warms cache → `useSuspenseQuery` renders instantly on nav.
- Route-level `pendingComponent` shows skeletons ≥200ms.
- Skeletons per component family: card grid, table row, detail hero, list, chart.
- `defaultPreload: 'intent'` on all Links; images lazy-loaded with LQIP.
- Mutations use optimistic updates for cart, wishlist, notifications-read.

### 18. Empty States
Standard `<EmptyState/>` with: illustration, headline, 1-line explainer, primary CTA, optional secondary link. Variants: empty cart, no orders, no products yet, KYC pending, search no-results (with suggestions), no notifications, no disputes.

### 19. Responsive Strategy
- Mobile-first; breakpoints `sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536`.
- Mobile nav: bottom tab bar (Home, Search, Cart, Orders, Menu). Desktop: top nav + collapsible sidebar for authenticated shells.
- Tables → cards on `<md`. Filters → bottom sheet on mobile, sidebar on ≥lg.
- Checkout: single column mobile, two column (form + summary) ≥lg.
- Touch targets ≥44px; safe-area padding for iOS.

### 20. Performance Strategy
- Edge SSR (Cloudflare Worker) with cache-tag invalidation for catalog.
- Query cache + Router preloading (intent, 50ms).
- Image CDN (WebP/AVIF, responsive srcset, LQIP).
- Search via Postgres FTS + trigram; upgrade path to Meilisearch.
- Code-split by route (automatic); dynamic import for heavy admin charts and CSV parser.
- DB: indexes on FKs, `(status, category_id)`, `(seller_business_id, status)`, GIN on tsvector and jsonb.
- Rate limits via edge middleware on write endpoints.

### 21. Security Strategy
- OWASP ASVS L2 baseline.
- RBAC + RLS everywhere; roles only in `user_roles`.
- All secrets via Lovable Cloud secrets manager; never in client.
- HMAC-verified webhooks; idempotency keys on payments.
- CSP, HSTS, X-Content-Type-Options, Referrer-Policy set at edge.
- PII encryption at rest (PAN, Aadhaar last-4, bank acc via pgsodium).
- Audit logs append-only via triggers; admin actions require re-auth for high-risk (payout run, role grant).
- HIBP password check, MFA for admin/seller/BNPL.
- DPDP: consent capture, data export & deletion server fns.

---

## PART B — SCREEN SPECIFICATIONS

Every screen follows this schema: **Purpose · Components · Layout · Interactions · Navigation · Data · API · Responsive**.

### B1. Landing (`/`)
- **Purpose:** Convert visitors into signups; communicate trust and value for retailers + sellers.
- **Components:** Hero (headline, dual CTA Buy/Sell), TrustBar (GSTIN, secure payments, verified badges), CategoryGrid (top 12), FeaturedSuppliers, HowItWorks (3-step per persona), TestimonialCarousel, StatsStrip (GMV, sellers, cities), CTA Banner, Footer.
- **Layout:** Full-bleed hero, alternating sections, magazine-style.
- **Interactions:** Role toggle (Buy/Sell) swaps CTA and copy; category card → `/marketplace/category/$slug`.
- **Navigation:** Header (Marketplace, Sell on VS, About, Sign in), Footer.
- **Data:** Featured categories, featured suppliers, aggregate stats.
- **API:** `getLandingData` (public server fn, cached 5m).
- **Responsive:** Hero stacks; category grid 2→3→4→6 cols.

### B2. Marketplace (`/marketplace`)
- **Purpose:** Browse full catalog with filters.
- **Components:** FiltersSidebar (category, price, MOQ, location, brand, rating, verified-only), SortBar, ProductGrid (`ProductCard`), Pagination, ActiveFilterChips, PromotedRail.
- **Layout:** Sidebar (280px) + grid; sticky sort bar.
- **Interactions:** Filter chips reflect URL; infinite scroll or paged; hover on card shows tier snippet.
- **Navigation:** Card → `/product/$id`; supplier name → `/supplier/$id`.
- **Data:** Paginated products with facet counts.
- **API:** `searchProducts({filters, sort, page})` public.
- **Responsive:** Filters → bottom-sheet on mobile; grid 2→3→4 cols.

### B3. Categories (`/marketplace/category/$slug`)
- **Purpose:** Category landing with sub-tree + curated content.
- **Components:** Breadcrumbs, SubcategoryChips, HeroBanner, TopBrands, ProductGrid, RelatedCategories.
- **Layout:** Same as Marketplace with category header block.
- **Interactions:** Sub-chip refines; brand pill filters.
- **Navigation:** Deep-linked filters preserved in URL.
- **Data:** Category tree slice + filtered products.
- **API:** `getCategory(slug)`, `searchProducts({category_id})`.
- **Responsive:** Hero collapses; chips horizontally scrollable on mobile.

### B4. Search (`/marketplace/search`)
- **Purpose:** Typo-tolerant search with suggestions.
- **Components:** SearchInput (autocomplete), SuggestionsList (recent, popular, categories), Results grid, ZeroResults with alternatives.
- **Layout:** Full-width search hero → results grid.
- **Interactions:** Debounced typing, keyboard nav in suggestions, "Did you mean".
- **Navigation:** Result → PDP.
- **Data:** `q`, filters via URL; autocomplete stream.
- **API:** `autocomplete(q)`, `searchProducts({q})`.
- **Responsive:** Suggestions become full-screen sheet on mobile.

### B5. Product Details (`/product/$id`)
- **Purpose:** Convert to add-to-cart / RFQ.
- **Components:** ImageGallery, TitleBlock, VerifiedSupplierChip, TierPriceTable, MoqNotice, VariantSelector, QtyStepper, Add-to-Cart / RFQ buttons, LeadTime, ShippingCalc (pincode), HSN/GST info, DescriptionTabs (Details, Specs, Returns), ReviewsSection, SimilarProducts, RecentlyViewed.
- **Layout:** Two-column desktop (gallery / info); tabs below.
- **Interactions:** Qty updates unit price via tier; pincode check triggers ETA & COD availability; add-to-cart shows toast + mini-cart.
- **Navigation:** Supplier chip → `/supplier/$id`.
- **Data:** Product + variants + tiers + reviews + related.
- **API:** `getProduct(id)`, `checkPincode(id,pincode)`, `getRelated(id)`.
- **Responsive:** Gallery on top; sticky bottom "Add to Cart" bar on mobile.

### B6. Supplier Profile (`/supplier/$id`)
- **Purpose:** Trust-building and full catalog per seller.
- **Components:** Cover + Logo, VerifiedBadge + KYC tier, About, Metrics (years, orders fulfilled, on-time %), Category chips, Catalog grid (paginated), Ratings, ContactSellerButton, ReportButton.
- **Layout:** Profile header + tabs (Catalog, About, Reviews, Policies).
- **Interactions:** Contact opens chat drawer (auth required → CTA if not).
- **Navigation:** Products → PDP.
- **Data:** Public supplier profile + paginated products + reviews.
- **API:** `getSupplier(id)`, `searchProducts({seller_id})`.
- **Responsive:** Metrics wrap to 2×2 on mobile; tabs scroll horizontally.

### B7. Cart (`/cart`)
- **Purpose:** Review items grouped per seller before checkout.
- **Components:** SellerGroupCard (items list with qty steppers, remove, MOQ warning), CouponInput, SummaryPanel (subtotal, GST breakup, shipping estimate, total), CheckoutButton, SaveForLater, RecommendedRail.
- **Layout:** Two columns (items / sticky summary) desktop; stacked mobile with sticky footer summary.
- **Interactions:** Qty change updates price live; below-MOQ blocks checkout with inline message; coupon validates async.
- **Navigation:** Continue → `/checkout`.
- **Data:** Cart with priced snapshots.
- **API:** `getCart`, `updateCartItem`, `removeCartItem`, `applyCoupon`.
- **Responsive:** Summary collapses to expandable bottom sheet.

### B8. Checkout (`/checkout`)
- **Purpose:** Complete purchase safely.
- **Components:** Stepper (Address → Payment → Review), AddressPicker (saved + new), ShippingOptions (per seller), PaymentMethodSelector (UPI, Card, NetBanking, BNPL, Credit-line, COD), GSTBreakup, PlaceOrderButton, TrustFootnote.
- **Layout:** Two columns (steps / sticky OrderSummary).
- **Interactions:** Address validation; BNPL shows credit meter; place order triggers gateway modal; blocks if KYC pending.
- **Navigation:** Success → `/orders/$id?new=1`; failure → retry inline.
- **Data:** Cart, addresses, credit account, payment methods.
- **API:** `createOrderIntent`, `confirmPayment`, `placeOrder`, webhook reconciles.
- **Responsive:** Stepper becomes vertical accordion on mobile.

### B9. Orders (`/orders`)
- **Purpose:** List and filter past/active orders.
- **Components:** FiltersBar (status, date range, seller/buyer, amount), OrdersTable (order#, seller, items, total, status pill, actions), Pagination, ExportCsv.
- **Layout:** Full-width table; mobile → OrderCard list.
- **Interactions:** Row → detail; quick actions (Reorder, Invoice, Track).
- **Navigation:** Row → `/orders/$id`.
- **Data:** Orders for current business (buyer or seller view based on role).
- **API:** `listOrders(filters)`.
- **Responsive:** Table → cards; filters → sheet.

### B10. Order Tracking (`/orders/$id`)
- **Purpose:** Show full lifecycle, invoice, shipment.
- **Components:** OrderHeader (status pill, order#, dates), Timeline (`order_events`), ItemsList, InvoiceDownload, ShipmentTracker (AWB, carrier, map/steps, POD), PaymentSummary, ActionsMenu (Cancel, Return, Raise Dispute, Chat Seller), DisputePanel (if any).
- **Layout:** Two columns (timeline+items / side card with totals & actions).
- **Interactions:** Cancel/return open confirm dialog; chat opens drawer.
- **Navigation:** Back to `/orders`; seller → `/supplier/$id`.
- **Data:** Order + events + shipments + invoice + payment.
- **API:** `getOrder(id)`, realtime channel for status.
- **Responsive:** Actions dock to sticky bottom bar on mobile.

### B11. Dashboard (`/dashboard`)
Role-aware.
- **Retailer:** ReorderRail, ActiveOrdersWidget, CreditMeter, RecommendedSuppliers, NotificationsPreview.
- **Seller:** GMV chart, OrdersFunnel, LowStockAlerts, TopSKUs, PayoutStatus, ReviewsSnapshot.
- **Layout:** Bento grid of widgets.
- **Interactions:** Widget → deep-link route.
- **Navigation:** Sidebar to sub-modules.
- **Data:** Aggregated KPIs (last 30/90/365 days toggle).
- **API:** `getDashboard(role, range)`.
- **Responsive:** Widgets stack single column on mobile.

### B12. Business Registration (`/onboarding`)
- **Purpose:** Convert signup into verified business.
- **Components:** Stepper (Role → Business → KYC docs → Bank → Review), forms per step, DocumentUploader, StatusBanner.
- **Layout:** Centered card, max 720px, progress at top.
- **Interactions:** Autofill from GSTIN (Phase 2); save-and-resume.
- **Navigation:** Submit → dashboard with "KYC pending" banner.
- **Data:** Draft business + documents.
- **API:** `upsertBusinessDraft`, `uploadKycDoc`, `submitForReview`.
- **Responsive:** Full-screen wizard on mobile.

### B13. Profile (`/profile`)
- **Purpose:** Manage personal + business identity.
- **Components:** AvatarUploader, PersonalForm, BusinessesList (switcher), MembersManager (invite by email, assign role), AddressesManager.
- **Layout:** Left nav sections + right pane.
- **Interactions:** Business switcher updates active context globally.
- **Navigation:** From avatar menu.
- **Data:** Profile + memberships.
- **API:** `updateProfile`, `inviteMember`, `switchBusiness`.
- **Responsive:** Left nav → top tabs on mobile.

### B14. Notifications (`/notifications`)
- **Purpose:** Central inbox across channels.
- **Components:** Filters (All/Orders/Payments/System), NotificationList, PreferencesLink, MarkAllRead.
- **Layout:** List with grouped-by-day headers.
- **Interactions:** Click marks read + deep-links; swipe to dismiss on mobile.
- **Navigation:** Item → related order/dispute.
- **Data:** User notifications paginated; realtime channel for new.
- **API:** `listNotifications`, `markRead`, `updatePreferences`.
- **Responsive:** Single column list.

### B15. Finance (`/finance`)
- **Purpose:** Ledger, credit, payouts, GST reports.
- **Components:** Tabs (Ledger, Credit, Payouts, GST Reports), LedgerTable, CreditMeter + RepaymentSchedule, PayoutsTable, ReportGenerator (date range → PDF/CSV).
- **Layout:** Tabs + filter bar + data area.
- **Interactions:** Repay Now (UPI intent), download invoice/report.
- **Navigation:** Row → order detail.
- **Data:** Ledger entries, credit account, payouts, invoices.
- **API:** `getLedger`, `getCredit`, `initiateRepayment`, `getPayouts`, `generateReport`.
- **Responsive:** Table → card list.

### B16. Settings (`/settings`)
- **Purpose:** Preferences, security, integrations.
- **Components:** Sections (Account, Security [password/MFA/sessions], Notifications, Language, Business [tax defaults, invoice prefix], Integrations [Tally webhook, API keys], DangerZone [export data, delete]).
- **Layout:** Left nav + right forms.
- **Interactions:** MFA setup dialog; session revoke; export triggers async job.
- **Navigation:** From avatar menu.
- **Data:** User + business settings.
- **API:** `updateSettings`, `enrollMfa`, `revokeSession`, `requestDataExport`.
- **Responsive:** Accordion sections on mobile.

### B17. Admin Dashboard (`/admin`)
- **Purpose:** Ops control plane.
- **Sub-screens:** Overview (KPIs, alerts), KYC Queue, Users & Businesses, Catalog Moderation, Disputes, Payouts, CMS (banners/coupons/flags), Audit Log.
- **Components:** DataTables with server pagination, ReviewDrawer (docs preview, decision + reason codes), BulkActions, ChartCards, FiltersBar.
- **Layout:** Persistent sidebar (Admin nav) + top bar with global search.
- **Interactions:** Approve/Reject KYC with mandatory reason; suspend user; block product; run payout batch (requires re-auth).
- **Navigation:** Sidebar sections; row → detail drawer.
- **Data:** Cross-tenant with admin RLS bypass via secure server fns.
- **API:** `adminListKyc`, `adminDecideKyc`, `adminModerateProduct`, `adminRunPayouts`, `adminResolveDispute`, all `requireRole('admin')`.
- **Responsive:** Admin is desktop-first; mobile shows read-only summaries.

---

## PART C — DESIGN SYSTEM

**Brand direction:** Confident, trustworthy, distinctly Indian-modern — not another purple-gradient SaaS. Editorial layouts, generous negative space, warm neutrals, one bold accent inspired by saffron/indigo trade cloth. Avoid Inter/Poppins.

### C1. Typography
- **Display:** *Fraunces* (serif, expressive) — hero, section headers, marketing.
- **UI/Body:** *General Sans* (geometric humanist sans) — app chrome, body.
- **Numeric/Mono:** *JetBrains Mono* — invoice numbers, order IDs, tabular figures.
- Fonts loaded via `<link>` in `__root.tsx` (never CSS `@import`).
- Scale (rem): 0.75, 0.875, 1, 1.125, 1.25, 1.5, 1.875, 2.25, 3, 3.75, 4.5.
- Line heights: 1.2 display, 1.5 body, 1.4 UI.
- Weights: 400/500/600 sans; 400/600 serif.

### C2. Color Palette (semantic oklch tokens in `styles.css`)
- **Background:** warm ivory `oklch(0.985 0.008 90)` / dark `oklch(0.16 0.02 260)`.
- **Foreground:** ink `oklch(0.20 0.03 260)` / off-white `oklch(0.97 0.01 90)`.
- **Primary (Indigo Trade):** `oklch(0.42 0.15 265)` + glow `oklch(0.55 0.18 265)`.
- **Accent (Saffron):** `oklch(0.78 0.16 65)` — CTAs, highlights.
- **Success:** `oklch(0.68 0.15 150)`. **Warning:** `oklch(0.80 0.15 85)`. **Destructive:** `oklch(0.58 0.22 27)`. **Info:** `oklch(0.65 0.12 235)`.
- **Muted:** neutral warm greys 4-step ramp.
- **Verified badge:** teal `oklch(0.68 0.10 190)`.
- Gradients: `--gradient-primary`, `--gradient-hero`, `--gradient-trust`. Shadows: `--shadow-elegant`, `--shadow-card`, `--shadow-overlay` (color-mix with primary at low alpha).
- All tokens defined once in `@theme inline`; no hardcoded colors in components.

### C3. Spacing
4-px base. Scale: 0, 1, 2, 3, 4, 6, 8, 12, 16, 20, 24, 32, 40, 56, 72, 96. Section vertical rhythm: 96 desktop / 56 mobile. Card padding: 24 desktop / 16 mobile.

### C4. Grid
- Container max 1280 (2xl 1440 for admin).
- 12-col desktop, 8-col tablet, 4-col mobile.
- Gutter: 24 desktop, 16 mobile.
- Product grid: `minmax(220px, 1fr)` auto-fill.

### C5. Buttons (variants)
`primary` (saffron on ink), `secondary` (indigo outline), `ghost`, `link`, `destructive`, `success`, `premium` (gradient + shadow-elegant). Sizes: `sm 32`, `md 40`, `lg 48`, `xl 56`. Icon buttons square. Loading spinner replaces label. Focus ring: 2px accent with 2px offset.

### C6. Cards
- `elevated` (shadow-card, radius-xl), `outline` (border, radius-lg), `flat`, `interactive` (hover lift + border tint).
- ProductCard: image 4:3, title 2-line clamp, tier hint, MOQ badge, verified chip, price range.
- KpiCard: label, value (mono), delta chip, sparkline.

### C7. Tables
- Sticky header, zebra optional, hover row highlight, column sort arrows, row selection, bulk action bar.
- Density: comfortable / compact toggle for admin.
- Empty, loading (skeleton rows), and error states built in.
- Mobile transformation → cards.

### C8. Forms
- Field: label (500, 14), input, helper, error (destructive).
- Inputs 40-tall, radius-md, subtle inner shadow on focus.
- Grouped fieldsets with divider.
- Async validators show inline spinner (GSTIN check, coupon).
- File uploader: drag-drop zone, preview thumbs, progress, remove.
- Multi-step wizard with progress and save state.

### C9. Badges
Status pills mapping to order lifecycle colors: Placed (info), Accepted (indigo), Dispatched (accent), Delivered (success), Cancelled (muted), Disputed (destructive), Pending KYC (warning), Verified (teal). Sizes sm/md. Icon-optional.

### C10. Alerts
Variants: info, success, warning, destructive. Composition: icon + title + body + optional actions. Banner variant for page-top (KYC pending, credit due). Inline variant for forms.

### C11. Dialogs
- Modal (centered, max 560), Sheet (right on desktop, bottom on mobile), Drawer (side), AlertDialog (destructive confirmations require typed confirmation for payouts).
- Focus trap, ESC close, backdrop blur, motion: 200ms ease-out.

### C12. Icons
- **Lucide** primary set for UI.
- Custom brand icon set (24×24, 1.75 stroke) for: verified, MOQ, tier-price, ledger, escrow, e-way, credit, rupee.
- Sizes 16/20/24; align to text baseline.

### C13. Animations (framer-motion + tw-animate-css)
- Page transitions: 200ms fade + 8px translateY.
- Hero: staged reveal (headline → sub → CTA) 400ms cascade.
- Card hover: lift 2px + shadow soften.
- Toast: slide-in-right 180ms.
- Skeleton shimmer 1.2s linear infinite.
- Order timeline: sequential dot fill.
- Respect `prefers-reduced-motion`.

### C14. Accessibility & Localization
- WCAG 2.1 AA contrast on all tokens (verify light + dark).
- Focus visible everywhere; skip-to-content link.
- All interactive icons have `aria-label`.
- i18n keys namespaced per feature; number/date/currency via `Intl` with `en-IN` / `hi-IN`.
- RTL-ready utilities kept in Tailwind logical props.

---

**End of Architecture Blueprint v1.0** — ready for hand-off to build phase (Phase 1 MVP scaffolding).
