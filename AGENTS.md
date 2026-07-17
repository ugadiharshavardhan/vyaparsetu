# VyaparSetu ? AI Assistant Knowledge Base

## Project Identity
- **Project Name:** VyaparSetu
- **Purpose:** Production-grade B2B ordering platform connecting Indian retailers with verified manufacturers, distributors, and wholesalers.
- **Problem being solved:** Streamlining wholesale B2B commerce with a unified marketplace.
- **Target users:** Indian retailers (buyers), manufacturers/distributors/wholesalers (sellers), and marketplace administrators.
- **Current project maturity:** Active development/production-ready. Connected to Lovable.dev.

## High-Level Overview
- **Overall architecture:** SSR-enabled React frontend deployed on edge (via Lovable Cloud), interacting with a Supabase PostgreSQL backend directly via server functions (`createServerFn` from TanStack) and client-side data fetching (TanStack Query).
- **System design:** File-based routing with a clear separation of public and authenticated trees. Heavy reliance on Supabase Row-Level Security (RLS) for data authorization.
- **Major modules:**
  - Marketplace (public catalog, product details, categories).
  - Auth & Onboarding (registration, role selection, document upload).
  - Buyer Portal (cart, checkout, order history, wishlist).
  - Supplier Portal (dashboard, inventory, product CRUD, orders).
  - Admin Portal (user verification, CMS, approvals, reports).
- **Data flow:** Frontend calls TanStack `createServerFn` or hits Supabase directly via auto-generated clients. Supabase handles Auth and RLS.

## Technology Stack
- **Frontend technologies:** TanStack Start v1, React 19, Vite 7
- **Backend technologies:** Lovable Cloud (Supabase PostgreSQL, Auth, Storage, RLS)
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Supabase Auth (Email/Password, Google OAuth)
- **State management:** TanStack Query for server state
- **UI libraries:** Tailwind v4, shadcn/ui, Radix primitives, framer-motion, lucide-react
- **Build tools:** Vite 7, Bun
- **Package manager:** Bun
- **Deployment setup:** Lovable Cloud auto-deploy
- **Development tools:** TypeScript (strict), Zod, ESLint, Prettier

## Repository Structure
- `src/routes/`: File-based routing (TanStack Router). Public routes, `_authenticated/` for protected routes, and `api/` for server endpoints.
- `src/components/`: Reusable React components grouped by domain (admin, auth, cart, common, dashboard, layout, marketplace, supplier, ui).
- `src/hooks/`: Custom React hooks (`useAuth`, `useCart`, etc.).
- `src/lib/`: Commerce logic (GST, coupons), utilities, error handling.
- `src/integrations/supabase/`: Supabase client configuration and types.
- `src/data/`: Mock catalogs for marketplace and supplier seed.
- `supabase/migrations/`: SQL migration files defining database schema, RLS policies, and triggers.
- `public/`: Static assets (favicon, manifest).

## Application Flow
1. **Public Browsing:** Users can browse categories and products on the marketplace.
2. **Auth:** User signs up or logs in.
3. **Onboarding:** Completes profile, selects account type (retailer vs. manufacturer/wholesaler/distributor), uploads GST/business documents.
4. **Buyer Journey:** Browses catalog -> Adds to cart (respecting MOQ) -> Applies coupons -> 4-step checkout (address, payment, etc.) -> Order tracking.
5. **Supplier Journey:** Accesses `supplier.*` routes -> manages inventory -> updates product pricing -> handles incoming orders.
6. **Admin Journey:** Accesses `admin.*` routes -> verifies users -> manages platform configurations.

## Authentication & Authorization
- **Login flow:** Handled by `@lovable.dev/cloud-auth-js` and Supabase.
- **Session management:** Token-based, attached automatically in server middleware.
- **Protected routes:** Routes under `src/routes/_authenticated/` require valid sessions.
- **User roles & Permission model:** Roles are implicit via membership in specific tables (`public.buyers`, `public.sellers`, `public.admins`). Policies use helper functions like `is_admin()`, `is_buyer()`, `is_seller()` for row-level security.

## Features

### Completed (Inferred)
- **Authentication:** Email/password, OAuth, verification.
- **Marketplace:** Catalog browsing, categories, product details.
- **Cart & Checkout:** B2B cart with MOQ, GST, coupons.
- **Buyer & Supplier dashboards:** Order management, product creation, inventory.
- **Admin portal:** Basic user and system management.

### Planned / Roadmap
- Live payment gateway (Razorpay / Stripe)
- Transactional email templates
- Advanced analytics with real-time data
- Multi-warehouse fulfilment routing
- Buyer credit / BNPL
- Native mobile apps via Capacitor

## Database (Supabase PostgreSQL)
- **Tables & Models:**
  - `profiles`: Core user details (business_type, phone, gst_number).
  - `buyers`, `sellers`, `admins`: Role-specific tables linked to `auth.users(id)`.
 - `categories`: Marketplace categories (`slug`, `name`).
 - `subcategories`: Child taxonomy (`category_id` ? `categories`, `slug`, `name`, `sort_order`).
 - `products`: Catalog items (`slug`, `wholesale_price`, `moq`, `gst_rate`, `category_slug`, `subcategory_id`).
  - `cart_items`: Per-user cart lines with `product_snapshot`.
  - `wishlist_items`, `shipping_addresses`, `orders`, `order_items`, `payment_records`, `invoices`, `coupons`.
- **Validation & Constraints:** Row-Level Security (RLS) is heavily used. Check constraints (e.g., `quantity > 0` on `cart_items`).
- **Indexes:** Created for slugs, featured flags, and category mapping.

## APIs
- The application uses TanStack `createServerFn` for server logic and direct Supabase client calls rather than traditional REST APIs. Server routes exist in `src/routes/api/` (likely for webhooks or public endpoints).
- Authentication required for most mutations, enforced by Supabase RLS and `requireSupabaseAuth` middleware.

## Frontend
- **Pages:** Handled in `src/routes/`.
- **Layouts:** `src/routes/__root.tsx` provides global layout and providers.
- **Routing:** TanStack Router (file-based).
- **Reusable UI:** shadcn/ui components in `src/components/ui/`.
- **State Management:** TanStack Query for server state.

## Backend
- **Middleware:** Server functions use `requireSupabaseAuth` via `functionMiddleware` in `src/start.ts`.
- **Error handling:** Custom error capturing in `src/server.ts` to normalize h3 swallowed SSR errors.
- **Models:** Defined in SQL migrations rather than ORM models.

## Environment Variables
- `VITE_SUPABASE_URL`: Required for client Supabase connection.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Required for client Supabase auth.
- `VITE_SUPABASE_PROJECT_ID`: Required for Lovable.
- `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `LOVABLE_API_KEY`: Server-only secrets managed by Lovable Cloud.

## External Services
- **Authentication:** Google OAuth (via Supabase).
- **Storage/DB:** Supabase.
- **Future:** Razorpay/Stripe for payments.

## Coding Standards
- **Naming conventions:** Kebab-case or dot-notation for route files (e.g., `admin.settings.tsx`). PascalCase for React components.
- **Folder conventions:** Feature-based organization inside `src/components/` and `src/routes/`.
- **Styling conventions:** Tailwind CSS (v4) utility classes. shadcn/ui patterns.

## Business Rules
- **Permissions:** Admin has full read/write via `is_admin()`. Sellers manage their own products. Buyers can only read public catalog and manage their own cart/orders.
- **Pricing Logic:** Products have `wholesale_price` and `mrp`. GST is explicitly tracked (`gst_included`, `gst_rate`).
- **Ordering:** Minimum Order Quantity (MOQ) applies to B2B cart.

## Reusable Components
- `src/components/ui/`: Contains all shadcn primitive components (buttons, dialogs, inputs, tabs).
- `src/components/common/`: Shared marketplace features like `EmptyState`, `OfflineIndicator`.

## Technical Debt & Known Issues
- Ensure `user_roles` legacy table references are completely replaced by `buyers`/`sellers`/`admins` logic.
- Potential SSR error handling edge cases (partially mitigated in `server.ts`).

## AI Development Guidelines

<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history ? force pushing, or rebasing/amending/squashing commits
> that are already pushed ? as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- **Framework Rules:** Do not introduce alternative routers or data fetching libraries; stick to TanStack Router and Query.
- **Styling:** Use Tailwind CSS v4 and existing shadcn components. Avoid writing raw CSS unless necessary.
- **Database:** Always modify the database via SQL files in `supabase/migrations/` rather than modifying the UI directly. Ensure RLS policies are strict.
- **Auth:** Rely on Supabase Auth. Do not implement custom password hashing or JWT validation manually.
- **Continuous Project Memory:** Whenever you make any change to the codebase, you MUST update this file (AGENTS.md) before finishing your response. See the rules in the "Development History" section.
## Future Recommendations
1. Integrate the planned payment gateway (Razorpay/Stripe).
2. Complete the transactional email setup.
3. Build the backend jobs for multi-warehouse routing.

## Changelog Summary
- **Baseline:** Project initialized with TanStack Start, Supabase, and Tailwind v4. Complex B2B features (cart with MOQ, supplier portal, admin dashboard) are fully scaffolded and routed. RLS policies updated to support `buyers`, `sellers`, and `admins` tables.

# Current Project State

- **Current Phase:** Paid Sample Store flow (buyer samples → checkout → seller Samples section → approval → bulk order)
- **Current Module:** `/samples` buyer page, `/supplier/samples` seller page, sample cart pricing in `commerce.ts`/`useCart`/`useOrders`
- **Overall Progress:** Buyers have a navbar "Samples" section listing Rice Products, Pulses (Dal) and Food Grains & Cereals items grouped by category/subcategory; "Add sample" puts a flat ₹100 sample line in the cart (qty 1, no MOQ/GST) with a flat ₹50 sample delivery at checkout, through the normal address → payment flow. Sellers get a sidebar "Samples" section showing each paid sample order with full buyer details and a Send-approval-request action; buyers approve under Requests and can then order the real item in bulk from the same card. Previous work (payment pill toggle, grouped orders, Chatbot, etc.) unchanged.
- **Last Updated:** 2026-07-18

# Development History

## 2026-07-18 - Buyer topbar spacing fix for 5-link center nav (Samples + Requests)

### Why
With Samples and Requests added, the buyer topbar's center nav (5 pills) collided with the search box at `lg` widths — the Requests pill (and its count badge) overlapped the search input.

### Changes
- `src/components/dashboard/DashboardTopbar.tsx` (buyer header) —
 - Header grid gap/padding tightened at `sm`–`lg` (`sm:gap-4 sm:px-4`, back to `xl:gap-6 xl:px-6`).
 - Center nav pills compacted at `lg` (`px-2.5`, `gap-0.5`; original `px-3.5`/`gap-1` restored at `xl`).
 - Requests badge moved inline (flex `gap-1.5` inside the pill) instead of absolutely positioned at the pill corner, so it no longer bleeds outside the nav toward the search box.
 - Search width rebalanced: `lg:w-[11rem] xl:w-[14rem] 2xl:w-[17rem]` (was `lg:w-[13rem] xl:w-[17rem]`).
 - Heart "Saved items" icon button (duplicate of the center "Saved" link) now hidden between `lg` and `2xl` to free space while the center nav is visible.

## 2026-07-18 - Paid Sample Store: buyer samples nav → ₹100/item + ₹50 delivery checkout → seller Samples section → approve & bulk order

### Why
Buyers should be able to order paid product samples (rice products, pulses/dal, food grains) before committing to bulk MOQ quantities. Each sample costs a flat ₹100 with a ₹50 delivery charge per order. Sellers need a dedicated Samples section showing these orders with buyer details and a way to request approval; after checking the sample, the buyer approves the request and orders the real item.

### How sample lines work (no schema change)
- `ProductSnapshot` gained optional `isSample?: boolean` (preserved by `normalizeSnapshot`). A sample cart line stores `product_id = "sample:<realProductId>"` (so it can coexist with a regular line under `cart_items` UNIQUE(user_id, product_id)) while the snapshot keeps the REAL product id, `wholesalePrice: 100`, `moq: 1`, `gstRate: 0`. `usePlaceOrder` writes the REAL product id onto `order_items` (stock decrement + seller stamping + sample_requests RLS all keep working); the snapshot's `isSample` flag marks the line as a sample order end-to-end. The synthetic cart id also means `fetchLiveMoqMap` never overrides the sample MOQ of 1, so MOQ enforcement is naturally bypassed for samples.

### Changes
- `src/lib/commerce.ts` — `SAMPLE_ITEM_PRICE` (100), `SAMPLE_DELIVERY_FEE` (50), `isSampleLine()`, `toSampleSnapshot()` (flat ₹100, qty 1, no GST). `computeTotals` now splits sample vs regular lines: regular items use the existing slab shipping; any sample in the cart adds a flat ₹50 (`sampleDeliveryTotal`, included in `shippingTotal`); sample-only carts pay exactly ₹100×n + ₹50.
- `src/types/commerce.ts` — `ProductSnapshot.isSample?`, `PriceBreakup.sampleDeliveryTotal`.
- `src/hooks/useCart.ts` — `sampleCartProductId()`, `useAddSampleToCart()` (one sample per product, qty 1, toast), `useSampleCartLine()`; `normalizeSnapshot` preserves `isSample`.
- `src/hooks/useOrders.ts` — `usePlaceOrder` resolves the real product id for sample lines (owner lookup + `order_items.product_id`).
- `src/hooks/useCatalog.ts` — `useProductsByCategories(slugs)` (products across multiple main categories via `.in("category_slug", …)`).
- `src/routes/_authenticated/samples.tsx` [NEW] — buyer Sample Store: header explains ₹100/item + ₹50 delivery, groups the three categories by subcategory (labels from `CATEGORIES` fallback), cards show bulk price/MOQ vs ₹100 sample price with **Add sample** / **In cart** states and a "Checkout N samples" CTA.
- `src/components/dashboard/DashboardTopbar.tsx` — buyer center nav + mobile sheet gained a **Samples** link.
- `src/components/layout/SiteLayout.tsx` — `/samples` added to `APP_PREFIXES`.
- `src/components/cart/CartItemRow.tsx` — sample lines show a "Sample · ₹100 flat" badge, fixed-quantity pill (no stepper), no sample-toggle/MOQ/stock chips.
- `src/components/cart/CartSheet.tsx` — + on a sample line is blocked ("Samples are limited to 1 unit").
- `src/components/cart/PriceSummary.tsx` — shipping row splits into regular Shipping + a "Sample delivery" ₹50 row.
- `src/routes/_authenticated/checkout.tsx` — review list badges SAMPLE lines and shows "flat sample charge" instead of GST.
- `src/types/supplier.ts` / `src/hooks/useSupplier.ts` — `SupplierOrder.isSample` mapped from the order-item snapshot.
- `src/routes/_authenticated/supplier.samples.tsx` [NEW] — seller **Samples** section (sidebar item added in `DashboardSidebar.tsx`): every paid sample line with SAMPLE/status/payment pills, order link, date, sample charge, buyer card (business, contact name, tel:/mailto:, destination), **Mark sample delivered**, and **Send approval request** (reuses `sample_requests`; shows awaiting/approved/declined states).
- `src/routes/_authenticated/supplier.orders.$id.tsx` / `supplier.orders.index.tsx` — sample order lines badge "Sample order"; the amber panel + send-request button now also renders for paid sample lines.
- `src/routes/_authenticated/orders.$id.tsx` — buyer order detail badges "Paid sample — ₹100 flat" lines.
- `src/hooks/useSampleRequests.ts` — `useResolveRequestProduct()` (order_item → real product, fresh price/MOQ).
- `src/routes/_authenticated/requests.tsx` — approved request cards gained **Order this item**: resolves the live product, adds it to the cart at MOQ, navigates to `/cart` — closing the loop sample → check → approve → bulk order.

### Verification
`npx tsc --noEmit` — only the pre-existing errors (SignUpForm / NotificationsMenu / data/products.ts / useSupplier 391/449/488) remain; all touched files clean. `npx vite build` succeeds; `routeTree.gen.ts` registered `/samples` and `/supplier/samples`. Live DB check: rice-products (20), pulses-dal (32), food-grains-cereals (25) products available for the Sample Store.

# Development History (continued)

## 2026-07-18 - Seller login always lands on /seller/dashboard

### Why
A seller signing in on the Seller tab could be bounced to a buyer page (marketplace, cart, product URL) when a stale `redirect` search param or pending-cart `returnTo` was present — the redirect priority honored those before the seller-mode default.

### Changes
- `src/lib/postLoginRedirect.ts` — `resolvePostLoginPath` now short-circuits when session mode is `seller`: it returns `/seller/dashboard` unconditionally, honoring an explicit `redirect` only if it already points inside the seller workspace (`/supplier/*` or `/seller/*`, e.g. a bounced deep link). Buyer-side redirect/pending-cart paths are ignored for seller-mode sign-ins. Buyer behavior unchanged.
- `src/routes/auth.tsx` — `beforeLoad` (already-signed-in visitor on `/auth`) applies the same rule: when `getSessionMode() === "seller"`, any non-seller-workspace `dest` is dropped so the resolver sends them to the dashboard.

### Notes
Covers all entry points: password sign-in and OTP sign-in (`SignInForm.finishSignIn` calls `persistMode()` before resolving), seller signup post-OTP (`SignUpForm` sets mode before resolving), and revisiting `/auth` while signed in. Landing-page redirect (`index.tsx`) already sent seller sessions to the dashboard.

## 2026-07-18 - Round browser-tab favicon

### Why
The browser tab icon used the square/rectangular `logo.png` wordmark; operator wants a round logo in the tab.

### Changes
- `public/favicon-round.png` [NEW] — 512×512 circular favicon generated via `scratch/make-round-favicon.mjs` (jimp): hex brand mark from `logo1.png` centered on a white circular badge with a brand-green (#0F5F4A) ring; transparent outside the circle.
- `src/routes/__root.tsx` — `rel="icon"` and `rel="apple-touch-icon"` now point to `/favicon-round.png?v=2` (query busts favicon cache).
- `public/manifest.webmanifest` — icons entry updated to the round PNG (the referenced `favicon.ico` never existed).

## 2026-07-18 - Buyer profile card padding fix (seller Buyers section)

### Why
On `/supplier/customers/$id` the buyer details card (avatar, name, phone/email/address/GST) rendered with no inner padding — `SectionCard` only applies `p-6` when a `title`/`action` header is passed, and this card passes neither, so content sat flush against the card border.

### Changes
- `src/routes/_authenticated/supplier.customers.$id.tsx` — profile `SectionCard` now gets `className="p-6"`; contact list spacing normalized (`py-4` → `pt-5` under the header divider). Insights / Orders / Invoices cards were already padded correctly.

## 2026-07-18 - Merge main: Supabase Auth & Chatbot Integration

### Why
The buyer interface needed an integrated AI Chatbot widget that securely communicates with the FastAPI backend. Every API request to the backend must dynamically contain the authenticated Supabase JWT. Additionally, the auth context needed extension to expose accessToken, login, and logout. (Merged from `origin/main`; only `AGENTS.md` conflicted and both histories were kept.)

### Changes
- `.env` [NEW] / `.env.example` [MODIFY] — Added `VITE_BACKEND_API_URL`.
- `src/hooks/useAuth.tsx` — Extended `AuthContextValue` and `AuthProvider` to expose `accessToken`, `login`, and `logout`. Clear session mode and redirect to `/auth` on logout.
- `src/lib/apiClient.ts` [NEW] — Created reusable fetch wrapper that automatically retrieves and attaches the Supabase JWT `Authorization: Bearer <access_token>` header. Signs out and redirects on 401/403 errors.
- `src/components/common/Chatbot.tsx` [NEW] — Floating bottom-right chatbot widget visible only to authenticated buyers. Contains dynamic message bubbles, animated typing indicator, clear history button, and quick-prompt suggestion chips. Upgraded styling to meet modern Intercom/HubSpot standards with a custom pulsing gradient FAB and a dismissible floating welcome helper.
- `src/routes/__root.tsx` — Mounted `<Chatbot />` under `<AuthProvider>` context wrapper.

### Verified
Ran `npm run build` with success. The application builds and compiles cleanly.

## 2026-07-18 - Seller payment-status toggle (click pill: pending ↔ completed)

### Why
Buyer orders (esp. COD) show payment "pending" in the seller dashboard with no way for the seller to record that payment was received. Operator wants clicking the pill to flip pending → completed, and clicking again to flip back.

### Changes
- `src/hooks/useSupplier.ts` — `useSupplierOrders` now also returns `updatePaymentStatus(lineId, "paid" | "pending")`: resolves the parent order from the seller's own `order_items` row (same pattern as `updateStatus`) and updates `orders.payment_status` (`paid` → `success`, else `pending`), then invalidates seller orders. Uses the existing seller UPDATE RLS on `orders`.
- `src/routes/_authenticated/supplier.orders.index.tsx` — Payment column pill is now a button (stopPropagation so the row click still opens the detail page): shows **completed** (green) / **pending** (amber), toggles on click with success/error toasts and a hover tooltip.
- `src/routes/_authenticated/supplier.orders.$id.tsx` — the payment pill in the detail header has the same click-to-toggle behavior (COMPLETED/PENDING); the Payment Information sidebar reflects the change via query invalidation.

### Notes
Payment records/`payment_records` untouched — this is the seller's manual settlement flag on the order, mirroring how COD payments get collected on delivery.

## 2026-07-18 - Seller orders list shows one row per ORDER (items revealed on click)

### Why
Each `order_items` line rendered as its own table row, so a buyer order with 3 products appeared as 3 separate "orders" in the seller dashboard. Operator wants an order-wise list first, with the items shown when opening the order.

### Changes
- `src/routes/_authenticated/supplier.orders.index.tsx` —
 - New `SellerOrderGroup` (`SupplierOrder & { lines }`) + `groupByOrder()`: groups fetched lines by parent `orderId` (fallback line id); base fields from the first line, `qty`/`amount` summed across lines. Row `id` = first line id, so existing `updateStatus` (which resolves the parent order from any line id), row selection, bulk actions, and `/supplier/orders/$id` navigation keep working unchanged.
 - Summary cards + status/payment filters + search now operate on grouped orders (search matches order number, retailer, and **every** product name in the order).
 - Products column → "Items": shows `N items · Qty total`, first 2 product names with per-line qty, "+N more items", and **aggregated** sample badges (counts of requested / awaiting approval / approved / declined across all lines).
 - Row invoice download uses `o.lines` directly (all items on one invoice).
- Detail page (`supplier.orders.$id.tsx`) already lists every item of the parent order — no change needed there.

### Verification
`npx tsc --noEmit` + lints — zero errors in the touched file.

## 2026-07-18 - Orders start Pending, seller Mark-as-Delivered button, invoice download fix

### Why
1. New buyer orders were inserted with `status: "confirmed"`, which maps to **Accepted** in the seller dashboard — operator wants every fresh order to arrive as **Pending** with a direct way to mark it **Delivered**.
2. "Download Invoice" on the seller order details page did not download the file.

### Root cause (invoice)
`downloadInvoiceHtml` called `URL.revokeObjectURL(url)` synchronously right after `anchor.click()`. Chromium can abort the blob download if the URL is revoked before the save begins, so the click appeared to do nothing.

### Changes
- `src/hooks/useOrders.ts` — `usePlaceOrder` now inserts orders with `status: "pending"` (was `confirmed`); `status_history` starts with "Order created" and adds a "Payment received" note (still status `pending`) only for non-COD payments. Payment status is unchanged (Razorpay → success/Paid, COD → pending).
- `src/lib/invoice/downloadInvoice.ts` — anchor is hidden and blob-URL cleanup (`remove()` + `revokeObjectURL`) is deferred by 2s so the download reliably starts. Fixes seller *and* buyer invoice downloads.
- `src/routes/_authenticated/supplier.orders.$id.tsx` — new **Mark as Delivered** header button (visible for any non-delivered/cancelled/returned status); invoice error toast now surfaces the real error message.
- `src/routes/_authenticated/supplier.orders.index.tsx` — row dropdown gained **Mark as Delivered** (same visibility rule); row-level "Download Invoice" now aggregates **all** lines of the same parent order (was single-line) and surfaces real error messages.

### Notes
- Status pipeline unchanged otherwise: seller Accept → confirmed, packing → processing, ready → packed, delivered → delivered (existing `mapSupplierStatusToDb`). Buyer sees `pending` until the seller acts; sample-approval (`Requests`) can still bump status to confirmed on buyer approval.

## 2026-07-18 - Fix buyer navbar search (typed text getting cleared / not filtering)

### Why
Typing in the buyer topbar search behaved erratically — characters were dropped/cleared and results didn't reliably update.

### Root cause
The topbar read `useRouterState({ select: (r) => r.location.search })` — the whole search **object**, whose reference changes on every router tick (pending states, background navigations, loaders). The effect `setSearchVal(search.q)` was keyed on that object, so it re-ran constantly and reset the input to the (stale) URL value mid-typing. The live-filter navigate effect also had no guard, re-firing on unrelated transitions.

### Changes
- `src/components/dashboard/DashboardTopbar.tsx` —
  - Select the URL query as a **primitive string** (`urlQuery`) instead of the search object, so the sync effect only runs when `q` actually changes.
  - Guard the URL→input sync so it never overwrites the field while it's focused (`document.activeElement === searchInputRef.current`), preventing keystroke clobbering.
  - Guard the marketplace live-filter navigate effect (`if ((nextQ ?? "") === urlQuery) return;`) so it doesn't emit redundant navigations.
  - Attached a `ref` to the search `Input`; trim the query on Enter and when live-filtering.

### Result
The navbar search types smoothly, live-filters on the marketplace, and Enter (from any page) navigates to `/marketplace?q=…`. Pure frontend fix.

## 2026-07-18 - Product card shows the same first image as the detail page

### Why
On the marketplace a product card showed a different cover than the "main" image on that product's detail page.

### Root cause
The card renders `getProductDisplayImage()` → `images[0]`, but the marketplace list query fetches only the lightweight `products.image` (cover) column (not the heavy `images` array, for performance). The detail page selects `*` and shows `images[0]`. When the DB `image` column was out of sync with `images[0]`, the card and detail page diverged.

### Changes
- Ran `scratch/sync-product-primary-image.mjs` (service role) which sets `products.image = images[0]` for every row whose cover didn't match the gallery's first image. Result: **48 updated, 361 unchanged**. No code changes — the seller `ImageManager` already emits `thumbnailIndex: 0` and saves `image` from `images[0]`, so new/edited products stay in sync.

### Result
Cards and the detail page now show the same first image. Data-only fix.

## 2026-07-18 - Sample confirmation flow: seller request → buyer "Requests" section → approve finalizes order

### Why
The sample isn't packed with the main shipment — it ships 1–2 days before the final delivery. After the buyer checks it, the order should only be finalized on their approval. Seller needed a "send request" action per sample line; buyer needed a "Requests" section to approve/decline, all stored in the DB.

### Database
- `supabase/migrations/20260718030000_sample_confirmation_requests.sql` [NEW] — `public.sample_requests` table: `order_id`/`order_item_id` (UNIQUE — one request per line), `seller_id`, `buyer_id`, denormalized `order_number`/`product_name`/`seller_name` + `message`, `status` (`sent`/`approved`/`rejected`), `created_at`, `responded_at`. RLS: seller INSERT only for their own order line (EXISTS check on `order_items.seller_id`), SELECT for either party, UPDATE buyer-only. Applied live via `scripts/apply-sample-confirmation-requests.mjs` [NEW] (3 policies verified).
- `src/integrations/supabase/types.ts` — `sample_requests` table types.

### Flow / Changes
- `src/hooks/useSampleRequests.ts` [NEW] — `useBuyerSampleRequests` (requests to me), `usePendingSampleRequestCount` (nav badge), `useSellerSampleRequests` (my sent requests + `byOrderItem` map), `useSendSampleRequest` (seller insert; duplicate → friendly error), `useRespondSampleRequest` (buyer updates request status + appends `orders.status_history` note; **approve also sets `orders.status = 'confirmed'`** = finalized; decline only records the note so multi-seller orders aren't cancelled). Invalidates orders/seller-orders caches.
- `src/routes/_authenticated/supplier.orders.$id.tsx` — each sample-flagged line shows an amber panel "ship the sample 1–2 days before the final delivery" with a **Send approval request** button (uses line's `orderId`/`buyerId`/`orderNumber`, seller business name). After sending: "awaiting buyer approval" / "Approved by buyer — order finalized" / "Declined by buyer" badges.
- `src/routes/_authenticated/supplier.orders.index.tsx` — Products column badge now reflects request state (requested / awaiting approval / approved-finalized / declined).
- `src/routes/_authenticated/requests.tsx` [NEW] — buyer Requests page: pending cards (product, order number, seller, message, date) with **Approve & confirm order** / **Decline**, plus a "Responded" history section and empty state. Route registered in `routeTree.gen.ts` via vite build.
- `src/components/dashboard/DashboardTopbar.tsx` — buyer desktop center nav + mobile sheet gained a **Requests** link with a live pending-count badge.
- `src/components/layout/SiteLayout.tsx` — `/requests` added to `APP_PREFIXES` (buyer workspace chrome).
- `src/components/cart/CartItemRow.tsx` — sample toggle toast explains the sample arrives 1–2 days before delivery and the order confirms after approval.

### Verification
`npx tsc --noEmit` — zero errors in touched files (only pre-existing `useSupplier.ts`/`SignUpForm`/`NotificationsMenu`/`data/products.ts` errors remain). Route tree regenerated cleanly; `/requests` present in `routeTree.gen.ts`.

## 2026-07-18 - Product detail page: both columns scroll together (remove sticky split)

### Why
On the buyer item view-details page the left (gallery/tabs) and right (purchase/supplier) halves appeared to scroll independently.

### Root cause
The right column had `lg:sticky lg:top-8`. Because the left column is taller, the right panel froze at the top and the left kept scrolling — reading as two separately-scrolling halves.

### Changes
- `src/routes/products.$slug.tsx` — removed `lg:sticky lg:top-8` from the right column so both grid columns stay in normal document flow and scroll together as one page.

### Result
The item-details page now scrolls as a single unit (no independent/sticky panel). Pure CSS/layout change.

## 2026-07-18 - Per-item "Send sample" toggle in cart, stored on order items, visible to seller

### Why
Buyers should be able to ask the seller to include a sample of a specific item with their order. The request must persist per line item in the database and be visible in the seller dashboard.

### Database
- `supabase/migrations/20260718020000_sample_requested.sql` [NEW] — adds `sample_requested boolean NOT NULL DEFAULT false` to **both** `public.cart_items` (toggle state while shopping) and `public.order_items` (frozen at checkout, per user request for a per-item column on the order data). Applied to the live DB via `scripts/apply-sample-requested.mjs` [NEW] (pooler connection, verified both columns exist with default `false`).

### Changes
- `src/types/commerce.ts` — `CartItem.sample_requested: boolean`, `OrderItem.sample_requested: boolean`.
- `src/types/supplier.ts` — `SupplierOrder.sampleRequested?: boolean`.
- `src/integrations/supabase/types.ts` — `sample_requested` on `cart_items` and `order_items` Row/Insert/Update.
- `src/lib/guestCart.ts` — guest lines default `sample_requested: false`; `updateGuestLine` accepts the flag.
- `src/hooks/useCart.ts` — `normalizeCartRow` reads `sample_requested`; `useUpdateCartItem` supports toggling it (optimistic update + DB patch + guest localStorage); guest→user cart merge carries the flag.
- `src/components/cart/CartItemRow.tsx` — pill-styled toggle row per item ("Send me a sample of this item" + `Switch`, FlaskConical icon, brand highlight when on) with success toasts.
- `src/hooks/useOrders.ts` — `usePlaceOrder` writes `sample_requested: Boolean(i.sample_requested)` on every `order_items` insert (Buy Now items have no flag → false).
- `src/hooks/useSupplier.ts` — `fetchSellerOrders` selects `sample_requested` and maps it to `SupplierOrder.sampleRequested`.
- `src/routes/_authenticated/supplier.orders.index.tsx` — Products column shows an amber "Sample requested" badge on flagged lines.
- `src/routes/_authenticated/supplier.orders.$id.tsx` — Products Ordered lines show "Sample requested — include a sample of this item".
- `src/routes/_authenticated/orders.$id.tsx` — buyer's order detail also shows a "Sample requested" badge per item (uses `order_items(*)` so no query change).

### Verification
`npx tsc --noEmit` — no new errors (only the 3 pre-existing `useSupplier.ts` 391/449/488 errors remain).

## 2026-07-18 - Cart grand total adds CGST/SGST + shipping

### Why
Cart order summary listed CGST/SGST but grand total still equalled the item total (GST was peeled out of GST-inclusive wholesale prices and then added back, so nothing appeared to be charged).

### Changes
- `src/lib/commerce.ts` — `computeTotals` treats listed wholesale as taxable and **always adds GST on top** (`grandTotal = itemTotal − discount + gstTotal + shipping`). No longer peels GST out of `gstIncluded` prices for cart/checkout totals.
- `src/components/cart/PriceSummary.tsx` — Item total → Discount → CGST/SGST (or IGST) → Shipping → Grand total (rows add up: e.g. ₹18,210 + GST + shipping).
- `src/components/cart/CartItemRow.tsx` — each line shows `+ GST ₹…` on top of the line price.
- `src/components/cart/CartSheet.tsx` — footer shows GST and shipping before Est. total.

## 2026-07-18 - Revisit landing while logged in → seller dashboard or marketplace

### Why
After login, opening the website again still showed the marketing landing. Sellers should land on `/seller/dashboard` and buyers on `/marketplace`.

### Changes
- `src/routes/index.tsx` — `beforeLoad` uses `resolveAuthedUser()`; if signed in, redirects by `getSessionMode()` (`seller` → `/seller/dashboard`, `buyer` → `/marketplace`), else `getUserRole()` (`seller` → dashboard, otherwise marketplace). Guests are unchanged. Unexpected auth errors are swallowed so the landing still renders.

## 2026-07-18 - Fix seller Buyers "View" not opening + show buyer details & seller-scoped orders; remove Order Timeline

### Why
Clicking "View" on a buyer in the seller Buyers list never opened a detail page — same Outlet bug as seller/buyer orders. The buyer profile also needed clear name/business/phone/email and the orders that buyer placed with *this* seller. Operator also asked to remove the Order Timeline block from seller order details.

### Root cause (routing)
`supplier.customers.tsx` rendered the full Buyers list with no `<Outlet/>`, while `supplier.customers.$id.tsx` is a child of `/supplier/customers`. Navigation to `/supplier/customers/$id` kept showing the list.

### Changes
- `src/routes/_authenticated/supplier.customers.tsx` — thin layout (`<Outlet />`).
- `src/routes/_authenticated/supplier.customers.index.tsx` [NEW] — previous Buyers list; Contact column shows phone + email.
- `src/routes/_authenticated/supplier.customers.$id.tsx` — loading skeleton + errorComponent; profile shows business name, contact name, clickable phone/email, address, GST; "Orders with you" lists only `order_items` for this buyer+seller, grouped by parent `orderId` (multi-line orders collapse to one row with combined products/qty/amount); View opens the seller order detail.
- `src/routes/_authenticated/supplier.orders.$id.tsx` — removed the entire Order Timeline section (and unused timeline helpers/imports).

### Verification
`npx vite build --mode development` regenerated `routeTree.gen.ts`: `/supplier/customers` now has both `AuthenticatedSupplierCustomersIdRoute` and `AuthenticatedSupplierCustomersIndexRoute` as children.

## 2026-07-18 - Razorpay: Pay Later "amount exceeds maximum" no longer aborts checkout

### Why
Paying with the test "Pay Later" option failed with "Payment could not be completed — Amount exceeds maximum amount allowed", and checkout then dead-ended.

### Root cause
Pay Later providers have a low per-transaction cap, so large B2B orders exceed it (this is a Razorpay method limit, not an amount bug — the client passes `breakup.grandTotal` in rupees and the server converts to paise exactly once). But `openRazorpayCheckout`'s `payment.failed` handler treated a single method attempt as **terminal**: it set `settled = true` and `reject()`-ed, closing our flow and ignoring any subsequent successful payment the buyer made in the still-open Razorpay modal.

### Changes
- `src/lib/razorpay.ts` — `payment.failed` no longer settles/rejects the promise. It shows a `sonner` toast (tailored "This method has a maximum amount limit. Please pay with UPI, Card, or Net Banking." when the failure is an amount-limit error) and leaves the modal open so the buyer can complete with another method. Only `handler` (success) or `ondismiss` (cancel) settles the promise. Terminal errors (script load failure, `open()` throw) still reject and are caught by checkout.

### Result
Pay Later hitting its cap is now a recoverable, clearly-explained hiccup; switching to UPI/Card/Net Banking in the same modal completes and finalizes the order. Pure frontend; no server/amount changes.

## 2026-07-18 - Fix seller order "View" not opening + show buyer contact & full item list on order detail

### Why
Clicking "View" on a seller order never opened a detail page — it just reflashed the orders list. Additionally, the seller order detail page didn't show the buyer's business name/phone/email, and only ever showed a single product line even when an order had multiple items from that seller.

### Root cause (routing)
`supplier.orders.tsx` rendered the full orders-list page directly as a leaf component (no `<Outlet/>`). `supplier.orders.$id.tsx` is registered as a **child** route of `/supplier/orders` (`getParentRoute: () => AuthenticatedSupplierOrdersRoute` in `routeTree.gen.ts`). Without an `<Outlet/>` in the parent, TanStack Router had no slot to render the child into, so navigating to `/supplier/orders/$id` kept showing the parent's list component. This is the exact same bug previously fixed for buyer `/orders` (`orders.tsx` → layout + `orders.index.tsx`).

### Changes
- `src/routes/_authenticated/supplier.orders.tsx` — now a thin layout (`component: () => <Outlet />`), same pattern as `orders.tsx`.
- `src/routes/_authenticated/supplier.orders.index.tsx` [NEW] — the previous full orders-list page content, registered at `/_authenticated/supplier/orders/` (index child). Retailer column now prefers `buyerBusiness` over the shipping-address fallback name.
- `src/types/supplier.ts` — `SupplierOrder` gained `orderId` (parent `orders.id`, so multiple `order_items` lines from the same order can be grouped), `buyerName`, `buyerBusiness`, `buyerPhone`, `buyerEmail`.
- `src/hooks/useSupplier.ts` — `fetchSellerOrders` now also calls the existing `get_seller_buyers()` RPC (SECURITY DEFINER; sellers can't read `buyers` directly under RLS) in parallel with the `order_items` query, and merges buyer name/business/phone/email onto each mapped `SupplierOrder` by `buyed_id`. Also stamps `orderId` from the parent `orders.id`.
- `src/integrations/supabase/types.ts` — added the `get_seller_buyers` RPC signature to `Database["public"]["Functions"]` (was missing, causing a pre-existing `supabase.rpc("get_seller_buyers")` type error at the existing `useSupplierCustomers` call site too).
- `src/routes/_authenticated/supplier.orders.$id.tsx` — "Retailer Information" now shows the buyer's business name (falls back to contact name), a secondary contact-name line when different, and clickable `tel:`/`mailto:` phone/email (with "not available" fallbacks instead of the old static "Contact info available in profile" placeholder). "Products Ordered" now lists **every** `order_items` line sharing the same `orderId` (title shows the count when >1), and the Payment Information subtotal/GST/total are computed by summing all of those lines instead of hardcoding a single 18% GST line.
- `src/lib/invoice/buildSellerInvoiceDocument.ts` — now accepts an optional `items: SupplierOrder[]` so the generated invoice lists every product line in the order (previously always one line); buyer name prefers `buyerBusiness`, buyer phone now populated from `buyerPhone` (was always `null`).
- `src/lib/invoice/downloadSellerInvoice.ts` — passes the optional `items` array through to the builder.

### Verification
- `npx tsc --noEmit` shows zero new errors introduced by these files (the remaining reported errors — `useSupplier.ts:391/449/488`, `useProductReviews.ts`, `suppliers.$id.tsx` — are pre-existing and untouched by this change).
- `npx vite build --mode development` regenerated `routeTree.gen.ts` cleanly: `/supplier/orders` now has both `AuthenticatedSupplierOrdersIdRoute` and `AuthenticatedSupplierOrdersIndexRoute` as children (mirrors the buyer `/orders` tree shape).

### No backend/migration changes
Reused the existing `get_seller_buyers()` SECURITY DEFINER RPC (already applied) instead of adding a new one.

## 2026-07-18 - Map-first shipping address with auto-fill from pin

### Why
Buyers had to type the whole address. Requirement: show the map first, let the buyer search/pin a location, and auto-fill the address form from that pin's lat/long to reduce typing.

### Context
The map picker already existed (Leaflet + OSM Nominatim, lat/long persisted to `shipping_addresses` + `buyers.shipping_address`), but it sat below the form as "optional" and only filled empty fields. Confirmed the live DB has `shipping_addresses.latitude/longitude` (double precision), so coordinates persist.

### Changes
- `src/components/address/AddressForm.tsx` — reordered the dialog to be map-first: step 1 "Find your location on the map" (`AddressMapPicker`), step 2 "Confirm & complete the address" (auto-filled fields + contact details). `applyMapResult` now reliably fills `line1/city/state/pincode/country` from each pin (overwrites geo fields, keeps manual fields like contact/phone/line2/landmark/GSTIN) and clears any validation errors on those fields. Line 2 relabeled "Flat / house / floor no." with a placeholder to guide minimal typing.
- `src/components/address/AddressMapPicker.tsx` — added a "Use my location" button (browser geolocation → center + drop pin + reverse-geocode); search bar and button share a row.
- `src/lib/geocode.ts` — `parseNominatim` builds a richer `line1` (road + house no. + local area; falls back to the leading display-name segments minus the city/state/pincode/country tail) so the auto-filled street line is meaningful. Verified against live Nominatim (Hyderabad → "Research Street Bridge, Kothaguda / Hyderabad / Telangana / 500032").

### Notes
- Pure frontend; no schema change (coords columns already present). Used by both checkout (add) and `/addresses` (add + edit). Free stack: Leaflet + OSM tiles + Nominatim (no API key).

### Follow-up — City/State/Pincode locked to the map pin
- Per request, City, State, and Pincode are now **read-only** and can only be set by the map pin (City/Pincode inputs are `readOnly` + muted/`cursor-not-allowed`; State `Select` is `disabled`). Labels show "(from map pin)" and the step-2 hint explains adjusting the pin changes them. `emptyValues` state default changed from `"Maharashtra"` to `""` so it reflects the pin (or the existing value when editing) instead of a wrong pre-fill; schema still requires all three, so a buyer must pin a location to submit.

## 2026-07-18 - Seller Buyers show real data + larger navbar logo

## 2026-07-18 - Seller orders: reliable detail page, real status updates, invoice download; smaller landing navbar; bigger seller logo

### Why
Landing navbar elements were oversized; the seller order detail page seemed not to open; accept/cancel status changes didn't reflect; seller payments had placeholder invoice buttons; seller sidebar logo was small.

### Changes
- `components/layout/Header.tsx` — reduced landing navbar sizes: header height (`h-16 sm:h-[4.5rem]`), logo (`h-10 sm:h-12`), location picker (text-xs/sm, smaller icons), nav links (`text-sm xl:text-base`, tighter padding), search button (`h-10`, `text-sm`, narrower), Login/Signup button (`h-10`, `text-sm`).
- `components/dashboard/DashboardSidebar.tsx` — seller/buyer sidebar logo enlarged (`imgClassName` `h-12` → `h-16`, header row `h-14` → `h-16`).
- `routes/_authenticated/supplier.orders.$id.tsx` — added a loading skeleton (so it no longer flashes "Order not found" while the seller-orders query loads) and a route `errorComponent`. Status actions now `await updateStatus` and surface failures via toast; "Print Invoice" replaced with a real **Download Invoice** (client-side GST invoice).
- `routes/_authenticated/supplier.orders.tsx` — row + bulk status actions now `await updateStatus` with try/catch so real DB updates reflect and RLS/errors surface (was firing success toasts without awaiting). Row "Print Invoice" → **Download Invoice**.
- `routes/_authenticated/supplier.payments.tsx` — "Download Invoice"/"Download GST Invoice" now generate and download a real invoice for the order line (was toast-only).
- `lib/invoice/buildSellerInvoiceDocument.ts` [NEW] + `lib/invoice/downloadSellerInvoice.ts` [NEW] — build a one-line GST `InvoiceDocument` from a `SupplierOrder` (taxable/CGST/SGST/IGST from `gstRate`/`gstIncluded`, interstate inferred from destination state vs Telangana) and render/download via the existing `renderInvoiceHtml`/`downloadInvoiceHtml`.

### Notes
- Order status mapping (`useSupplier.ts`) already targets the valid `order_status` enum (`confirmed/processing/packed/...`); the fix was awaiting the mutation + surfacing errors, plus the detail-page loading guard. Payment status stays read-only for sellers (it's buyer/checkout-driven); a freshly placed buyer order shows as **Pending** in the seller dashboard by default.

## 2026-07-18 - Buyer navbar spacing fix + shorter height

### Why
The center nav "Saved" link overlapped the search box, and the buyer topbar was a bit tall.

### Changes
- `DashboardTopbar.tsx` (buyer header) — reduced height (`h-16 sm:h-[4.75rem]` → `h-14 sm:h-16`) and widened inter-column gap (`sm:gap-6`). Narrowed the search (`lg:w-[13rem] xl:w-[17rem]`, `min-w-0`, `h-9`/`lg:h-10`, `text-sm`) so it no longer overflows its grid track into the centered nav. Center nav links compacted (`text-sm`, `px-3.5 py-1.5`, `whitespace-nowrap`). Shrunk logo (`h-9 sm:h-11`) and all header icon buttons (menu, mobile search, saved heart, cart, notifications) to `h-9 w-9`.

## 2026-07-18 - Buyer never lands on seller workspace (/supplier/*)

### Why
After signing in on the Buyer tab, users sometimes landed on `/supplier/products`.

### Root cause
Dual-role accounts (buyer + seller row) passed the `_authenticated` seller guard, and `resolvePostLoginPath` honored any explicit `redirect`/pending-cart path — including a stale `/supplier/*` or `/seller/*` target — so a buyer-mode session could open the seller workspace.

### Changes
- `lib/postLoginRedirect.ts` — added `isSellerWorkspacePath()`; when session mode is `buyer`, the resolver now ignores `redirect`/pending paths under `/supplier` or `/seller` and falls through to `/marketplace`.
- `routes/_authenticated/route.tsx` — the seller-workspace guard now redirects to `/marketplace` whenever `getSessionMode() === "buyer"` (before the sellers-row check), so a buyer-mode session can never render `/supplier/*` or `/seller/*` even for dual-role accounts. Also widened the match from `/seller/` to `/seller`. Legit sellers (mode `seller` or null) are unaffected.

## 2026-07-18 - Seller Buyers show real data + larger navbar logo

### Why
The seller "Buyers" section rendered mock `seedCustomers`, and the buyer detail page matched orders by name. The navbar/sidebar logo was also too small.

### Changes
- `supabase/migrations/20260718010000_seller_buyers_rpc.sql` [NEW] — `public.get_seller_buyers()` SECURITY DEFINER RPC: aggregates the calling seller's real buyers from `order_items` (scoped by `seller_id = auth.uid()`) joined to `orders` + `buyers`. Returns per-buyer orders count, lifetime value (sum of that seller's line totals), last order, favorite product (top qty), and name/business/email/phone plus city/GST/address derived from the buyer profile or latest order `shipping_address`. Scoped strictly to `auth.uid()` so a seller only sees their own buyers (bypasses `buyers` RLS safely). Installed via `scripts/apply-seller-buyers-rpc.mjs`. NOTE: live `buyers` table has no `gst_number` column — GST/city fall back to order `shipping_address`.
- `src/hooks/useSupplier.ts` — `useSupplierCustomers()` rewritten to a React Query hook calling `get_seller_buyers` (maps rows → `SupplierCustomer`, computes active/inactive by 90-day recency); returns `{ customers, isLoading, error }`. `fetchSellerOrders` now selects `buyed_id` and sets `SupplierOrder.buyerId`.
- `src/types/supplier.ts` — added `buyerId?: string` to `SupplierOrder`.
- `src/routes/_authenticated/supplier.customers.tsx` — uses `isLoading`; empty state distinguishes loading / no-search-match / no-orders-yet.
- `src/routes/_authenticated/supplier.customers.$id.tsx` — buyer order history now filters by real `o.buyerId === id` (was name matching).
- `src/components/dashboard/DashboardTopbar.tsx` — buyer topbar logo bumped to `h-12 sm:h-14`.
- `src/components/dashboard/DashboardSidebar.tsx` — sidebar logo bumped to `h-12` (header row `h-14`) so the seller workspace logo is larger.

### Verified
`get_seller_buyers()` against live data returned the correct 5 real buyers (orders/spend/favorite product) for the top seller. `seedCustomers` mock no longer used by the Buyers pages.

## 2026-07-18 - New sellers auto-provisioned with default catalog categories

## 2026-07-18 - Buyer wishlist nav + marketplace promo cards (credit popup, order-now scroll)

### Why
Buyers had a working `/wishlist` page but no visible way to reach it. The marketplace promo cards mislabeled the credit offer ("Sell First"), had non-functional buttons, and no eligibility info.

### Changes
- `DashboardTopbar.tsx` — added a "Saved" link to the buyer desktop center nav and a Heart icon button (links to `/wishlist`) in the right actions cluster. Mobile sheet already had "Saved Items". `/wishlist` is already in `SiteLayout` `APP_PREFIXES`, so it renders with buyer chrome. The existing `wishlist.tsx` page already lists saved products via `useWishlist`.
- `marketplace.tsx` — `PromotionalBanners` rewritten:
  - Card 1 renamed **"Sell First, Pay Later" → "Buy First, Pay Later"**; added an "Unlocks after 15 successful orders" pill; "Apply for Credit" now opens `BuyFirstPayLaterDialog` (popup) describing the deferred-payment credit (stock now/pay after sold, interest-free window, flexible settlement) and the 15-successful-orders eligibility.
  - Card 2 "Order Now" now smooth-scrolls to the product shelves below (`#marketplace-shelves`, `scroll-mt-24`).

## 2026-07-18 - New sellers auto-provisioned with default catalog categories

### Why
Operator wanted every newly created seller to start with the products of the `flour-atta`, `cooking-oils`, `salt-sugar`, and `snacks-bakery` categories, and for buyer orders of those items to show up in that seller's dashboard.

### How it works
- Seller rows are created only after OTP verify (`handleVerify` → `upsertMembership`). Products are single-owner (`products.seller_id` + `seller_products.product_id UNIQUE`), and the seller dashboard lists order lines by `order_items.seller_id` (stamped at checkout from `products.seller_id`). So provisioning = reassign those 4 categories to the new seller + verify them so the products are visible/orderable.

### Changes
- `supabase/migrations/20260718000000_assign_default_seller_categories.sql` [NEW] — `public.assign_default_seller_categories(_seller_id uuid)` SECURITY DEFINER: reassigns all products in the 4 default categories to the seller (`seller_id` + `supplier` JSON), syncs/inserts `seller_products`, and sets `verification_status = 'verified'`. Granted to `service_role`. Installed in the live DB (project `juoufayfyzpmscxeiydd`).
- `src/server/authOtpHandler.ts` — after a seller `upsertMembership` in `handleVerify`, calls `assignDefaultSellerCatalog(userId)`: invokes the RPC, with a service-role table-operation fallback (in case PostgREST hasn't refreshed its schema cache). Non-fatal — never blocks signup.
- `scripts/apply-default-seller-categories.mjs` [NEW] — installs the function via the pooler and, with `--email x@y.com`, provisions/backfills an existing seller (also prints per-category product counts). Verified counts: cooking-oils 35, flour-atta 36, salt-sugar 24, snacks-bakery 35.

### Design notes / caveats
- Single-owner constraint means provisioning **moves** those categories to the newest seller (previous owner loses them). Intended: the latest onboarded seller manages the default catalog. To give an existing test seller these products now, run `node scripts/apply-default-seller-categories.mjs --email <seller-email>`.
- New sellers are auto-verified (bypasses admin approval) specifically so their default products are live and orderable; remove the verify step in the SQL function / handler fallback if manual approval is desired.

## 2026-07-18 - Center order confirmation + fix ₹0 total + Razorpay failure handling

### Why
The success screen rendered inside the 2-column checkout grid (left 1fr column) so it looked off-center, showed `₹0` (grand total recomputed from the just-cleared cart), and Razorpay Pay Later / declined payments silently did nothing.

### Changes
- `src/routes/_authenticated/checkout.tsx` — wrapper drops the `1fr_360px` grid on the confirmation step (step 3) so the card centers across the full width; new `placedTotal` state captures `order.grand_total` on success and the confirmation shows `inr(placedTotal)` instead of the recomputed (empty-cart) `breakup.grandTotal`.
- `src/lib/razorpay.ts` — `openRazorpayCheckout` now registers `rzp.on("payment.failed", …)` and rejects with the gateway error description, so Pay Later declines / expired VPA / bank timeouts surface a toast (via `payWithRazorpay`'s catch) instead of leaving the buyer stuck on the modal.

## 2026-07-18 - Razorpay checkout + address remove button

### Why
Checkout used a demo payment grid and had no way to delete a saved address inline. Operator wants a real Razorpay flow (COD + Razorpay), address removal from DB/UI, and payment details persisted for buyer + seller views.

### Changes
- `.env.example` / `.env` — added `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (server) and `VITE_RAZORPAY_KEY_ID` (browser checkout).
- `src/server/razorpayHandler.ts` [NEW] — `/api/razorpay` handler: `create-order` (Razorpay REST orders API via Basic auth, amount in paise) and `verify` (HMAC-SHA256 of `order_id|payment_id` against `RAZORPAY_KEY_SECRET`). Reads keys from `.env` / host env.
- `src/server.ts` — route `/api/razorpay` → `handleRazorpayRequest` (production SSR).
- `vite-plugin-auth-otp.ts` — dev middleware now also serves `/api/razorpay` (new `handleRazorpay`).
- `src/lib/razorpay.ts` [NEW] — client helper: lazy-loads `checkout.js`, `createRazorpayOrder`, `openRazorpayCheckout` (opens modal, resolves success/null on dismiss), `verifyRazorpayPayment`.
- `src/hooks/useOrders.ts` — `PlaceOrderInput.razorpay` optional details; `payment_records` insert stores `gateway: "razorpay"`, `transaction_ref = razorpay_payment_id`, and `meta` (payment/order/signature) for online payments (demo ref for COD).
- `src/routes/_authenticated/checkout.tsx` — payment step replaced with two buttons: **Cash on delivery** (blocked > ₹50,000) and **Continue with Razorpay** (create order → modal → verify → place order with method `upi`, gateway razorpay). Footer no longer shows a Pay button on the payment step. Address cards now pass `onDelete` → `useDeleteAddress` (re-selects a remaining address when the selected one is removed).
- `src/components/address/AddressCard.tsx` — always-visible "Remove" button (destructive) in a card footer alongside "Set as default"; edit stays a hover icon.

### Notes
- Razorpay online payments store `payment_method = 'upi'` (enum has no generic `razorpay`/`card`); gateway + meta capture the real Razorpay identifiers. Order `payment_status = 'success'`, so `fetchSellerOrders` maps it to `paid` for each seller's items automatically.
- Test keys are the operator-provided `rzp_test_*`; use Razorpay test cards/UPI in the modal.

## 2026-07-17 - Cart stepper sized to content (no full-width stretch)

### Why
On the cart page the quantity stepper stretched full-width, forcing the Save-for-later / Wishlist / delete actions to wrap onto a separate row.

### Root cause
`CartQuantityStepper` default container carried `w-full`, so in `CartItemRow` (which passes no `className`) it filled the whole `justify-between` row.

### Changes
- `CartQuantityStepper.tsx` — dropped `w-full` from the default shell so the pill hugs its content (`[minus/trash] qty [plus]`); count keeps `flex-1` (expands only when a consumer opts into full width) with a `min-w-[2.5rem]` floor so the number stays comfortable.
- Consumers unchanged: `AddToCartControl` still passes `flex-1` + min/max width to fill the product-card / PDP Add-button area; `CartItemRow` now renders a compact inline pill beside the row actions.

## 2026-07-17 - GST invoice template + download; remove order tracking block

### Why
Order tracking timeline overlapped labels on the details page; invoice button was a placeholder. Buyers need a downloadable GST tax invoice stored in `invoices`.

### Changes
- `orders.$id.tsx` — removed Order tracking section; Invoice button downloads invoice.
- `lib/invoice/*` — VyaparSetu GST invoice HTML template (bill from/to, line items, HSN, CGST/SGST/IGST, totals).
- `hooks/useInvoice.ts` — fetch invoice by order; `ensureInvoiceRow` inserts into `invoices` if missing (also created at checkout in `usePlaceOrder`); `useDownloadOrderInvoice` builds HTML and saves locally as `.html`.

## 2026-07-17 - Buyer navbar: Marketplace/Orders centered

### Why
Operator wanted nav links in the middle of the topbar, not on the left.

### Changes
- `DashboardTopbar.tsx` — 3-column grid: left (logo + location), center (Marketplace + Orders), right (search + actions).

## 2026-07-17 - Buyer navbar: nav links left, search right

### Why
Logged-in buyer topbar had search centered and Marketplace/Orders on the right; operator wanted those positions swapped.

### Changes
- `DashboardTopbar.tsx` — left cluster: menu, logo, delivery location, Marketplace + Orders links; right cluster: search input, cart, notifications, profile. Mobile keeps a search icon that opens marketplace.

## 2026-07-17 - Fix order "View details" not opening (missing Outlet on orders layout)

### Why
Clicking "View details" changed the URL to `/orders/$id` but kept showing the Orders **list** — the detail page never rendered.

### Root cause
In TanStack flat routing, `_authenticated/orders.tsx` is the PARENT layout of `_authenticated/orders.$id.tsx` (paths nest by segment). `orders.tsx` rendered the full Orders list component with NO `<Outlet/>`, so on `/orders/$id` the parent list rendered and the child detail route had nowhere to mount. (This is the same pattern `categories` already uses correctly: a `categories.tsx` Outlet layout + `categories.index.tsx` + `categories.$slug.tsx`.)

### Changes
- `src/routes/_authenticated/orders.index.tsx` [NEW] — the Orders LIST moved here as the index route (`createFileRoute("/_authenticated/orders/")`).
- `src/routes/_authenticated/orders.tsx` — reduced to a layout shell that renders `<Outlet/>` (route id `/_authenticated/orders`), so `/orders` → index list and `/orders/$id` → detail both mount correctly.
- `src/routeTree.gen.ts` — regenerated by the TanStack Router plugin: `AuthenticatedOrdersRoute` now has children `AuthenticatedOrdersIdRoute` + `AuthenticatedOrdersIndexRoute`.
- (Prior turn, retained) `orders.$id.tsx` shows each ordered item as a detailed card with image, brand, supplier, a Quantity/Unit price/GST/Discount breakdown, line total, a **"View item details"** button → `/products/$slug`, and the review button; plus the earlier `useAuth` import fix and route `errorComponent`.

### No backend changes
Frontend routing structure fix.

## 2026-07-17 - Fix order "View details" crash + richer ordered-items UI

### Why
The order details page ("View details" from Orders) did not open for confirmed/delivered orders, and the items list needed a clearer per-item breakdown.

### Root cause
`orders.$id.tsx` `ProductReviewButton` called `useAuth()` but the hook was never imported. The review button only renders when the order status is not pending/cancelled, so any confirmed/delivered order threw a runtime `ReferenceError` on render → the route crashed to the global "Something went wrong" boundary. (The `OrderCard` "View details" `<Link to="/orders/$id">` was correct all along.)

### Changes
- `src/routes/_authenticated/orders.$id.tsx` —
  - Added the missing `import { useAuth } from "@/hooks/useAuth"` (fixes the crash).
  - Redesigned the Items section: each ordered item is now a bordered card with product image (links to PDP), brand, name, supplier, a 4-cell breakdown (Quantity + unit, Unit price, GST rate/amount or "Incl.", Discount), a prominent line total (with MRP strike-through when higher), a "View item details" button → product page, and the review button (delivered/confirmed). Added an empty-state when an order has no items.
  - Added a route `errorComponent` (Retry + "Back to orders") so any future runtime error shows a scoped, recoverable page instead of the global crash; cleaned up stray empty JSX wrapper blocks in the loading/not-found/main returns.

### No backend changes
Pure frontend fix + UI polish.

## 2026-07-17 - Consistent delivery location after login + real buyer notifications

### Why
1. The delivery city chosen in the pre-login navbar was lost after login: the buyer topbar showed a hardcoded default ("Bengaluru, KA") and offered extra cities (Mumbai, Delhi NCR, Chennai) that don't exist before login.
2. The buyer notification bell showed `DEMO_NOTIFICATIONS` (KYC/offers/mock) instead of the buyer's real activity.

### Changes
- `src/hooks/useBuyerNotifications.ts` [NEW] — derives real buyer notifications from `useOrders()` (orders the buyer placed: number + item count + status) and `useCart()` (items added to cart: name + qty). Sorted newest-first. Unread is tracked with a localStorage "last seen" timestamp (`vs.buyer-notifications.last-seen.v1`); exposes `notifications`, `unreadCount`, `markAllSeen`, `isUnread`, and a `formatRelativeTime` helper.
- `src/components/dashboard/DashboardTopbar.tsx` (buyer layout) —
  - Location picker now uses the SAME source as the pre-login header: `useDeliveryLocation()` + `DELIVERY_LOCATIONS` (Hyderabad, Bengaluru) with "Use my current location". The saved city (localStorage `vs.delivery-location.v1`) persists across login, and the extra hardcoded cities were removed. A detected/custom city (not in the quick list) still shows as a highlighted option.
  - Notification bell now renders `useBuyerNotifications()` data (orders + cart adds), badge shows real `unreadCount`, opening the popover calls `markAllSeen()`, each row links to `/orders` or `/cart`, with an empty state when there's nothing yet.
- `src/routes/_authenticated/notifications.tsx` — the full buyer notifications page now lists real order/cart notifications (with unread highlight + relative time + empty state) instead of `DEMO_NOTIFICATIONS`.

### Notes
- Sellers/admins are unaffected: they still use `NotificationsMenu` (seller → `useSupplierNotifications`); only the buyer layout changed.
- Pure frontend; no DB/schema changes. `DEMO_NOTIFICATIONS` remains for any legacy/admin usage.

## 2026-07-17 - Global text scale, taller navbars, PDP quantity stepper polish

### Why
Operator wanted larger text app-wide, a taller navbar, and the product-page increment/decrement/count control resized to match the Save / Buy Now row.

### Changes
- `styles.css` — root font-size 17px (18px from md+) so rem-based UI scales up globally.
- `button.tsx` — default/lg/icon button heights bumped one step.
- `Header.tsx` — taller bar (5.25–5.75rem), larger nav/search/CTA text.
- `DashboardTopbar.tsx` — buyer + seller headers taller; nav/search text-base.
- `CartQuantityStepper.tsx` — new `lg` size (h-14, w-14 side buttons, text-lg count); flex center count between equal-width controls.
- `AddToCartControl.tsx` — PDP uses `lg` stepper.
- `products.$slug.tsx` — action row h-14; pre-add qty picker matches; cart banner text-sm.

## 2026-07-17 - Breadcrumbs: start at Marketplace (no Home)

### Why
Product detail breadcrumb showed `Home > Marketplace > …`; operator wants the trail to start at Marketplace only.

### Changes
- `products.$slug.tsx` — removed Home link + separator; first crumb is Marketplace.
- `categories.$slug.tsx` — first crumb label corrected from "Home" to "Marketplace".

## 2026-07-17 - Bulletproof navbar Login/Signup (no random "Category not found" / "Something went wrong")

### Why
Clicking the navbar "Login / Signup" button was non-deterministic: sometimes it opened the login page, sometimes it flashed "Category not found", and sometimes the global "Something went wrong" boundary.

### Root cause
1. `Header.goLoginOrDashboard` branched on `useAuth().isAuthenticated`, which is `false` while auth is still hydrating (`loading === true`) even for a genuinely signed-in user — so the same click could route differently depending on timing.
2. The `/auth` route `beforeLoad` computed the signed-in redirect (`resolveAuthedUser` → `is_admin` RPC / `resolvePostLoginPath`/`getUserRole` with a possibly-stale token). Any non-redirect throw there bubbled to the ROOT error boundary → "Something went wrong".
3. The `/categories/$slug` and `/products/$slug` loaders `throw error` on any Supabase hiccup, which also hit the ROOT boundary; a truly missing slug rendered "Category not found". These detail routes are reachable straight from the header `SearchDialog` (right next to the login button), so a transient failure looked like the login button itself misrouting. (Complements the earlier `/categories/undefined` racing-`navigate` fix below.)

### Changes
- `src/components/layout/Header.tsx` — `goLoginOrDashboard` only takes the authenticated fast-path (`/marketplace`) when `!authLoading && isAuthenticated`; otherwise it routes to `/auth` and lets `beforeLoad` decide. Deterministic for guests and signed-in users alike.
- `src/routes/auth.tsx` — wrapped `beforeLoad` in try/catch using `isRedirect(e)`: only intentional `redirect()` throws propagate; any unexpected error (network, RPC, role lookup, token revalidation) is swallowed and the auth page renders instead of the global error boundary.
- `src/routes/categories.$slug.tsx` — loader trims/guards empty slug (→ `notFound()`); added a scoped `errorComponent` (Retry + "Browse all categories") so a transient load failure never surfaces the global "Something went wrong".
- `src/routes/products.$slug.tsx` — added the same scoped `errorComponent` (Retry + "Back to marketplace").

### No backend changes
Pure frontend routing/robustness fix.

## 2026-07-17 - Fix guest "Add" hijacked to /categories/undefined instead of sign-in

### Why
A logged-out user clicking "Add" on a product (from the marketplace or a category page) was sent to `/categories/undefined?mode=signin&role=buyer&redirect=%2Fcart` ("Category not found") instead of the sign-in page.

### Root cause
`AddToCartControl` correctly calls `navigate({ to: "/auth", search: { mode, role, redirect } })`. But `useNavigate({ from })` returns a NEW function identity on every router location change. `marketplace.tsx` and `categories.$slug.tsx` each had a "sync debounced search query → URL" effect that listed `navigate` in its dependency array with no value guard. When the Add click started the transition to `/auth`, those components re-rendered, `navigate` changed identity, and the effect re-fired — calling `navigate({ from: "/categories/$slug", search: (prev) => … })` mid-transition. With the location already moving to `/auth`, the `$slug` param resolved to `undefined`, so it rebuilt `/categories/undefined` and merged the auth search params (`prev`), hijacking the sign-in navigation.

### Changes
- `src/routes/categories.$slug.tsx` — the debounced-query URL sync effect now computes `nextQ` and returns early when `nextQ === search.q` (added `search.q` to deps). No redundant navigate → can't clobber unrelated transitions.
- `src/routes/marketplace.tsx` — same guard applied to its debounced-query URL sync effect.

### Notes
- The marketplace category-redirect effect (`[search.category, navigate]`) was already safe (guarded by `if (!search.category) return`), so it can't emit an undefined slug.
- Pure frontend fix; no backend/DB changes.

## 2026-07-17 - Search dialog: remove block highlight + trending section

### Why
Search result rows showed a heavy accent/block background on click or keyboard focus; operator wanted clean rows and no Trending searches list.

### Changes
- `SearchDialog.tsx` — removed Trending searches group; result rows and cmdk `[data-selected]` / `:hover` forced to transparent (no block highlight).
- `command.tsx` — `CommandDialog` accepts optional `className` for per-dialog item styling overrides.

## 2026-07-17 - Cart stepper: minus at MOQ removes item + instant (optimistic) +/-

### Why
On product cards the quantity stepper's minus button was disabled ("blocked" cursor) once quantity hit the MOQ floor (e.g. 15), so users couldn't remove the item from that control. Increment/decrement also felt slow because every click did a Supabase round-trip and then refetched the whole cart (including a live-MOQ fetch) before the number updated.

### Changes
- `CartQuantityStepper.tsx` — new `onRemove?` prop. At MOQ the minus button is no longer disabled; it shows a `Trash2` icon (destructive hover) and calls `onRemove` to delete the line (Blinkit/Zepto pattern). Removed the `pending`-based disabling on both buttons so rapid clicks aren't dropped (safe now that updates are optimistic).
- `AddToCartControl.tsx` — imports `useRemoveCartItem`; passes `onRemove={() => remove.mutate(line.id)}`; `onBlocked` now only toasts on the increment/stock ceiling (minus at floor removes instead).
- `CartItemRow.tsx` — same `onRemove` wiring on the cart page stepper.
- `useCart.ts` — `useUpdateCartItem` and `useRemoveCartItem` now do optimistic updates via `onMutate` (cancel queries, snapshot previous, patch/remove the line in the `["cart", userId|"guest"]` cache), roll back in `onError`, and reconcile in `onSettled`. The number now changes instantly; the Supabase write + MOQ revalidation happen in the background.

### No backend changes
Pure frontend fix (React Query optimistic cache + stepper UX).

## 2026-07-17 - Guest Add lands on cart after login + auto-detect delivery city

### Why
1. When a logged-out user clicked "Add" on a product, after signing in they were returned to the product/marketplace page instead of the cart. They should land on `/cart` with the clicked item added.
2. On first visit the site should ask for location access and show the detected city as the navbar delivery location.

### Changes
- `src/components/cart/AddToCartControl.tsx` — `requireAuthThenAdd` now sets the pending-cart `returnTo` and the `/auth` `redirect` to `/cart` (was the current page URL). The pending snapshot is still flushed into `cart_items` by the `useCart` post-login effect, so the user arrives on the cart with the item present. `resolvePostLoginPath` honors the `/cart` redirect.
- `src/lib/deliveryLocation.ts` — delivery city is now any string (not just the two quick picks). Added `hasAttemptedGeoDetect` / `markGeoDetectAttempted` flags and `detectCityFromGeolocation()` (browser geolocation → BigDataCloud free, key-less reverse geocode → city name). Kept `DELIVERY_LOCATIONS` for quick picks + stats.
- `src/hooks/useDeliveryLocation.ts` [NEW] — navbar location state; on first visit (no saved city, not yet attempted) it requests geolocation and reverse-geocodes to a city, persisting it. Exposes `location`, `detecting`, `select`, and `detect` (manual re-detect).
- `src/components/layout/Header.tsx` — `LocationPicker` uses the hook, shows "Detecting…" while resolving, lists the detected city (when outside the quick picks) plus a "Use my current location" action; wired into both desktop and mobile navbars.

### Notes
- Geolocation requires a secure context (HTTPS / localhost) and shows the native browser permission prompt. If denied or lookup fails, the picker falls back to "Select Location" and the quick-pick cities.
- Buy Now (product page) still redirects to checkout — only the "Add" button flow was changed to land on the cart.

## 2026-07-17 - Landing search: live results + correct navigation

### Why
The landing search dialog kept showing Recent/Trending while typing because cmdk’s built-in filter hid manually matched results. Clicking a suggestion did not reliably open the matching product or category.

### Changes
- `SearchDialog.tsx` — `shouldFilter={false}`; suggestions only when input empty; typed query shows Categories / Brands / Products + “View all results”.
- `lib/searchNavigation.ts` [NEW] — catalog search helpers + `resolveSearchTarget` (product → PDP, category → `/categories/$slug`, else marketplace `?q=`).
- `command.tsx` — `CommandDialog` accepts `shouldFilter` prop.

## 2026-07-17 - Logo goes to workspace (not landing) after login + center toasts

### Why
After logging in, clicking the brand logo still opened the marketing landing page. The landing page should only be reachable via the logo when logged out; signed-in buyers should go to the marketplace and signed-in sellers to the seller dashboard. Toast popups also needed to be centered.

### Changes
- `src/hooks/useHomeDestination.ts` [NEW] — resolves the logo/home target from auth state: guest → `/`, seller (session mode `seller`, or seller account when mode isn't `buyer`) → `/seller/dashboard`, otherwise buyer → `/marketplace`.
- `src/components/common/Logo.tsx` — the brand `Link` now points to `useHomeDestination()` instead of always `/`. Covers the buyer topbar, marketing header, and footer logos.
- `src/components/dashboard/DashboardSidebar.tsx` — the seller sidebar logo wrapper `Link` now uses `useHomeDestination()` (was hardcoded `/`), so it returns sellers to their dashboard.
- `src/routes/__root.tsx` — `<Toaster />` position changed from `top-right` to `top-center`.

### Notes
- Logged-out marketing pages still show `/` for the logo (landing stays reachable when signed out). No redirect added on `/` itself, matching the prior decision to keep the landing page renderable.
- `useHomeDestination` reuses the shared `useAccountFlags` query (cached), so multiple Logo instances don't trigger extra network calls.

## 2026-07-17 - Cart stepper green hover + decrement above MOQ

### Why
Quantity +/- on product cards lost green hover styling (ProductCard `className` was applied to the stepper wrapper). Decrement from 16→15 failed when `stockCount` was 0 in the snapshot — `stepCartQuantity` treated 0 as a hard ceiling.

### Changes
- `CartQuantityStepper.tsx` [NEW] — shared stepper with `hover:bg-brand hover:text-white` on ± buttons.
- `AddToCartControl.tsx` — `className` applies to Add button only; stepper uses shared component.
- `lib/moq.ts` — `effectiveStockCap()` ignores zero/unknown stock for decrement; only caps increment when stock > 0.
- `CartItemRow.tsx` — uses `CartQuantityStepper`.

## 2026-07-17 - Layout-aware route pending skeletons (stop showing product-card skeleton everywhere)

### Why
Every page flashed the product-card grid skeleton while loading — even dashboards, orders, tables, forms, and detail pages — because the app-wide route pending component always rendered a product grid.

### Root cause
`router.tsx` used `defaultPendingComponent: RoutePending`, and `RoutePending` rendered `PageSkeleton`, which always contained `ProductGridSkeleton`. So during any navigation/chunk load the product-card skeleton appeared regardless of the target page's layout.

### Changes
- `src/components/common/Skeletons.tsx` — made `PageSkeleton` layout-neutral (no product cards) and added layout archetype skeletons: `PageHeaderSkeleton`, `ProductGridPageSkeleton`, `ProductDetailSkeleton`, `DashboardPageSkeleton`, `TablePageSkeleton`, `OrderListSkeleton`, `DetailPageSkeleton`, `FormPageSkeleton`, `ContentPageSkeleton`.
- `src/components/common/RoutePending.tsx` [NEW] — smart default pending component. `classifyRoute(pathname)` maps the destination route (read via `useRouterState`) to an archetype (product-grid, product-detail, dashboard, table, orders-list, detail, form, content) and renders the matching skeleton. One component covers all ~73 routes and matches each page's real shell.
- `src/router.tsx` — `defaultPendingComponent` now imports `RoutePending` from the new smart dispatcher.
- `src/components/common/LoadingSpinner.tsx` — removed the old product-grid `RoutePending`; re-exports the new one for backward compatibility. `MarketplacePending` / `DashboardPending` unchanged.

### Notes
- Product catalog routes (`/marketplace`, `/categories/$slug`, `/suppliers/$id`) still set `pendingComponent: MarketplacePending` (a product grid) — consistent with their classification.
- Pre-existing unrelated `tsc` errors (`SignUpForm.tsx`, `NotificationsMenu.tsx`, `data/products.ts`) were left untouched. Changed files are type/lint clean.

## 2026-07-17 - MOQ-first add with ±1 stepper (floor at seller MOQ)

### Why
For products with MOQ 15, Add should put 15 in the cart immediately; + / − should then move by 1 (16, 17… down to 15), not add another full MOQ batch or drop below minimum.

### Changes
- `lib/moq.ts` — `resolveDisplayMoq`, `stepCartQuantity` helpers.
- `hooks/useCart.ts` — first insert quantity = live `products.moq`; duplicate add heals to MOQ or +1 (not +MOQ); pending-cart flush uses same rules.
- `AddToCartControl.tsx` / `CartItemRow.tsx` — stepper uses ±1 with MOQ floor from catalog + live snapshot.

## 2026-07-17 - Fix empty marketplace: base64 image bloat caused products query 500 (statement timeout)

### Why
The marketplace showed no products. The list request
`GET /rest/v1/products?select=...images...&limit=500` returned **500 Internal Server Error**.

### Root cause
The real error was Postgres `57014 canceling statement due to statement timeout`, not a broken column. The seller `ImageManager` saved uploaded images as **base64 data URIs** (`reader.readAsDataURL`) straight into `products.image` / `products.images`. 16 junk test products (all named "mm") each carried an identical **~1.5 MB base64 cover**, so the marketplace list — which selected the heavy `images` JSON array for up to 500 rows — pulled ~24 MB of base64 and blew past the statement timeout, 500ing the whole query and leaving the grid empty.

### Changes
- `src/hooks/useCatalog.ts` — removed the heavy `images` column from `PRODUCT_LIST_COLUMNS`. Cards/grids only need the single `image` cover (`mapDbProduct` → `normalizeProductImages` falls back to `image` when the `images` array is absent). Product detail (`useProductBySlug`) still `select("*")`, so its gallery is unaffected. List query went from timing-out to ~1.1s for 425 rows.
- `src/components/supplier/ImageManager.tsx` — **root-cause fix**: `addFiles` now uploads each file to the public `product-images` Storage bucket (path `${userId}/product-...`) and stores the **public URL**, never a base64 data URI. Added an "Uploading…" spinner state, image-type guard, per-file error toasts, and input reset. This prevents the bloat from recurring.
- `supabase/migrations/20260717050000_product_images_storage_policies.sql` [NEW] — storage RLS so authenticated sellers can insert/update/delete their own objects in `product-images` (folder = `auth.uid()`), mirroring the `business-documents` policies; ensures the bucket exists and is public. Applied via `scratch/apply-product-images-storage-policies.mjs`.
- `scratch/fix-base64-products.mjs` [NEW] — one-off data cleanup (service role): decoded the 16 base64 covers/arrays, uploaded them to `product-images/seller-uploads/`, and replaced `image`/`images` with the public URLs. Non-destructive (products kept). Result: 0 base64 covers remain; full query (even with `images`) now ~0.6s.

### Verification
- Anon list query (app columns): 425 rows, no error, ~1.1s (was 500/timeout).
- `products.image LIKE 'data:image%'` count: 0 remaining.
- No new lint errors.

## 2026-07-17 - Enforce one role per email on signup (no shared buyer+seller email)

### Why
The same email could end up owning both a buyer and a seller account. New signups should require a different email per role.

### Root cause
`handleRegister` (server OTP handler) only blocked signup when the email already had the SAME role (verified + membership). When an email already registered as a buyer signed up as a seller, `member && confirmed` was false, so it fell through to the "reclaim" path — overwriting the password and later creating a second (seller) membership row for the same auth user.

### Changes
- `src/server/authOtpHandler.ts` — in `handleRegister`, after resolving the existing auth user, check `hasMembership(user.id, otherRole)`. If the email already owns the other role, reject with "This email is already registered as a buyer/seller account. Use a different email…" before any reclaim/password overwrite.
- `src/components/auth/SignUpForm.tsx` — `showSignUpError` now passes cross-role messages (containing "different email") through verbatim instead of collapsing them into the generic "already registered — sign in instead".

### Scope
Applies to NEW signups only; existing accounts that already hold both roles are unchanged (matches the request). Login already enforced role separation via `ensureRoleMembershipForSignIn`.

### No schema changes
Enforcement is in the register handler; no DB migration.

## 2026-07-17 - Auth back button returns to landing page

### Why
Sign-in / sign-up needed a reliable back control that always opens the marketing landing page (`/`), not browser history or a broken in-card link.

### Changes
- `AuthLayout.tsx` — added fixed top-left `AuthBackButton` using `navigate({ to: "/", resetScroll: true })`; removed duplicate in-card link.
- `auth.tsx` — set `ssr: false` so client navigation on the auth route is consistent.

## 2026-07-17 - Auth Buyer/Seller toggle no longer greys out ("block styling")

### Why
The Buyer/Seller segmented toggle on the sign-in/sign-up page intermittently rendered greyed/disabled ("block styling") and locked to Buyer — but only sometimes.

### Root cause
A guest who clicked "Add to cart" once (without completing sign-in) leaves a `pending-cart-add` item in `sessionStorage`. `auth.tsx` computed `pendingProduct = !!peekPendingCartAdd()` and passed `disabled={pendingProduct}` to `AuthRoleToggle` (which applies `opacity-60`) plus a guard blocking the switch to Seller. So whenever a stale pending item existed, the toggle appeared disabled; otherwise it looked normal — hence "sometimes blocked, sometimes correct".

### Changes
- `src/routes/auth.tsx` — `pendingProduct` now also requires `role === "buyer"` (the "add to cart" intent is buyer-only), `AuthRoleToggle` no longer receives `disabled`, and `setRoleAndUrl` no longer blocks switching to Seller. The toggle is always interactive.

### No backend changes
Pure frontend fix.

## 2026-07-17 - Single pending-cart flush + checkout keeps buyer navbar

### Why
1. Adding an item as a guest then signing in showed duplicate "Added to cart" toasts.
2. Entering the checkout shipping address switched the navbar to the public landing header.

### Changes
- `src/hooks/useCart.ts` — module-level `postLoginSyncedUserId` guard so the guest-merge + pending flush + toast runs exactly once per signed-in user.
- `src/components/layout/SiteLayout.tsx` — removed `/checkout` from `skipDashboardChrome` and added it to `APP_PREFIXES`, so authenticated checkout uses the buyer workspace chrome instead of the marketing landing header.

### No backend changes
Pure frontend fix.

## 2026-07-17 - Guest add-to-cart redirects to auth (no silent no-op)

### Why
Logged-out users clicking Add on marketplace/landing cards sometimes did nothing — the button stayed disabled or returned early while auth was still loading.

### Root cause
`AddToCartControl` used `loading={authLoading}` (disabled the button) and `if (authLoading) return;` on click, so taps during session hydration were ignored with no navigation.

### Changes
- `AddToCartControl.tsx` — removed auth-loading gate on the button; `confirmAuthed()` falls back to `resolveAuthedUser()` then redirects guests via `requireAuthThenAdd()` → `/auth?mode=signin&role=buyer&redirect=…` with pending cart in sessionStorage.
- `ProductCard.tsx` / `FeaturedProducts.tsx` — raised add-button z-index and `stopPropagation` so card/link clicks don't swallow the tap.

## 2026-07-17 - Live seller MOQ enforcement (cart → checkout → order)

### Why
Minimum order quantity must follow the seller-entered value on each product. Cart lines stored stale `product_snapshot.moq` (often defaulting to 1), so buyers could checkout below the real MOQ.

### Changes
- `lib/moq.ts` — `fetchLiveMoqMap`, `applyLiveMoqToItems`, `resolveLineMoq`, `assertOrderMeetsMoq` (reads `products.moq`).
- `hooks/useCart.ts` — enrich cart on fetch (logged-in + guest) with live MOQ; add-to-cart/repeat-order persist current MOQ in snapshot; `useUpdateCartItem` rejects quantity below live MOQ.
- `hooks/useOrders.ts` — `usePlaceOrder` calls `assertOrderMeetsMoq` before creating the order.
- `AddToCartControl.tsx` / `CartItemRow.tsx` — minus disabled at MOQ; toast instead of silently removing the line when below MOQ.

### No backend migration
Uses existing `products.moq` column; frontend-only enforcement layered on cart/checkout UI and order mutation.


### Why
1. Adding an item as a guest then signing in showed the item added "multiple" times (duplicate "Added to cart" toasts).
2. When a buyer entered/selected their shipping location on the checkout page, the navbar switched to the public landing header (Login/Signup, Browse catalogue…).

### Root cause
1. The post-login "merge guest cart + flush pending add" effect lives in `useCart`, which mounts in several components at once (`CartSheet`, `CartButton`, PDP, etc.). Each instance awaited the shared flush promise and fired its own `toast.success("Added to cart")`.
2. `SiteLayout` listed `/checkout` in `skipDashboardChrome`, and `/checkout` wasn't in `APP_PREFIXES`/`SHARED_PREFIXES`, so it fell through to the marketing `<Header/>`/`<Footer/>` branch — the landing navbar.

### Changes
- `src/hooks/useCart.ts` — added module-level `postLoginSyncedUserId` guard so the merge/flush/toast runs exactly once per signed-in user (claimed synchronously before any await; reset on sign-out and on failure to allow retry).
- `src/components/layout/SiteLayout.tsx` — removed `/checkout` from `skipDashboardChrome` and added `/checkout` to `APP_PREFIXES`, so authenticated checkout renders the buyer workspace chrome (buyer topbar) instead of the marketing landing header.

### No backend changes
Pure frontend fix.

## 2026-07-17 - Enter key submits forms across the app

### Why
Pressing Enter while filling form fields did not submit on many screens (OTP, address dialog, coupon apply, onboarding steps, messages, admin create dialogs) because inputs were not inside `<form>` elements or submit buttons lacked `type="submit"`.

### Changes
- `lib/formSubmitOnEnter.ts` [NEW] — shared Enter handler calling `form.requestSubmit()` on the nearest submit button.
- `components/ui/input.tsx` — all inputs trigger form submit on Enter when a submit button exists.
- `EmailOtpForm.tsx`, `AddressForm.tsx`, `CouponInput.tsx`, `OnboardingWizard.tsx`, `messages.tsx`, `profile.tsx`, `admin.categories.tsx`, `admin.coupons.tsx`, `admin.banners.tsx`, `admin.notifications.tsx` — wrapped in proper `<form onSubmit>` with `type="submit"` primary actions and `type="button"` for secondary/cancel controls.

## 2026-07-17 - Landing navbar: always "Login / Signup" (smart target)

### Why
Operator wants the landing navbar to always show a single "Login / Signup" button (no profile avatar/cart). Clicking it should go straight to the buyer dashboard (`/marketplace`) when already signed in, else open buyer sign-in / sign-up.

### Changes
- `Header.tsx` — removed the authenticated `CartButton` + `UserMenu` branch (desktop and mobile drawer). The button now always reads "Login / Signup" and calls `goLoginOrDashboard()`: `isAuthenticated` → `/marketplace`, else → `/auth?mode=signin&role=buyer`. Dropped now-unused `UserMenu` / `CartButton` imports; added `useNavigate`.

## 2026-07-17 - Role-scoped sign-in (seller→sellers, buyer→buyers)

### Why
Sign-in had no role gate, so a buyer could log in on the Seller tab (and vice-versa) and land in the wrong workspace. Operator asked that the Seller tab check the sellers table only and the Customer tab check the buyers table only.

### Changes
- `lib/accountMembership.ts` — new `ensureRoleMembershipForSignIn(user, wanted)`:
  - Seller tab → requires an existing `public.sellers` row (never auto-creates a seller). If the email is a customer, rejects with "use the Customer tab".
  - Customer tab → requires `public.buyers`; a seller-only email is rejected with "use the Seller tab"; if neither row exists (failed signup upsert) it heals the buyer row from auth metadata so genuine customers aren't locked out.
- `SignInForm.tsx` — `finishSignIn` now runs the gate (via `supabase.auth.getUser()` for metadata) before persisting mode/redirecting; on mismatch it signs out, clears session mode, and toasts the reason. Applies to both password and email-OTP sign-in paths.

### Notes
- Route guards (`_authenticated/buyer.tsx`, `seller.tsx`) already enforce membership per workspace; this makes the login step itself role-accurate too.
- Post-login navigation stays consistent: `persistMode()` (from the chosen tab) runs before `resolvePostLoginPath`, so seller → `/seller/dashboard`, buyer → `/marketplace`.

## 2026-07-17 - Landing navbar profile + cart checkout redirect fix

### Why
Logged-in buyers on the landing page still saw “Login / Signup” in the navbar instead of their profile. Clicking **Checkout** in the cart drawer could bounce to `/marketplace` or the auth landing page instead of `/checkout`.

### Root cause
- `Header.tsx` always rendered Login / Signup and never read auth state.
- Cart checkout used `user` (can lag behind session) and sent logged-in users through `/auth`; auth `beforeLoad` used a single `getSession()` and `resolvePostLoginPath` fallback → `/marketplace` when redirect was lost.
- Checkout could render the empty-cart state (with a marketplace CTA) while the cart query was still refetching.

### Changes
- `Header.tsx` — when authenticated: `CartButton` + `UserMenu` profile avatar; when guest: Login / Signup (desktop + mobile drawer).
- `lib/resolveAuthedUser.ts` [NEW] — shared session resolver (retry + `getUser()` fallback).
- `_authenticated/route.tsx`, `auth.tsx` — use shared resolver; auth redirect uses `sanitizeReturnPath` + TanStack `redirect({ to, search })`; guest checkout bounce includes `role: buyer`.
- `CartSheet.tsx`, `cart.tsx` — checkout uses `isAuthenticated` (not stale `user`), waits for auth load, MOQ guard, navigates to `/checkout` directly.
- `checkout.tsx` — wait for cart fetch before empty state; empty checkout offers “Back to cart” instead of pushing marketplace.

## 2026-07-17 - Fix logged-in user bounced to auth/marketplace on Proceed to checkout

### Why
Clicking "Proceed to checkout" (only shown to signed-in buyers) sometimes bounced the user to the auth page (which now looks like a marketing landing page) or to `/marketplace` instead of opening the checkout address/payment flow.

### Root cause
`/_authenticated/route.tsx` gates every protected route on a single `supabase.auth.getSession()` in `beforeLoad`. On a client navigation right after the Supabase client (re)initializes or rotates its token, that one call can transiently return `null` for a genuinely signed-in user, so the gate redirected to `/auth`; re-auth with no `redirect` then resolved to `/marketplace`.

### Changes
- `src/routes/_authenticated/route.tsx` — added `resolveAuthedUser()` that retries `getSession()` up to 3 times (120ms spacing) and falls back to `getUser()` (server revalidation) before treating the visitor as a guest. `beforeLoad` now uses it instead of a single `getSession()` call.

### No backend changes
Pure frontend guard hardening. Redirect/`resolvePostLoginPath` logic (which already honors `redirect=/checkout`) is unchanged.

## 2026-07-17 - MOQ enforcement, category copy cleanup, stepper colors, order-success tick

### Why
Category titles said "Buy … Online" and categories index mentioned "Udaan-style"; quantity +/- buttons had washed-out colors; orders below MOQ could still check out; order-success screen used a Sparkles icon instead of a tick.

### Changes
- `categories.$slug.tsx` — title shows the category/subcategory name (no "Buy … Online")
- `categories.index.tsx` — removed "Udaan-style" from the description
- `AddToCartControl.tsx` / `CartItemRow.tsx` — quantity steppers use brand text with `hover:bg-brand hover:text-white` and a brand-tinted border
- `lib/moq.ts` [NEW] — `isBelowMoq` / `findBelowMoqItems` / `moqErrorMessage` helpers
- `cart.tsx` — checkout disabled + toast when any line is below MOQ; warning banner
- `CartItemRow.tsx` — per-item "Add at least N unit" warning when below MOQ
- `checkout.tsx` — `next()` / `submitPayment()` block when below MOQ; order-success icon is a centered `Check` tick

## 2026-07-17 - Category browse: stable order, breadcrumbs, scroll restore, post-login catalog

### Why
Product list order shuffled on return from PDP; breadcrumbs opened wrong marketplace filter UI; scroll jumped to top; category grids empty or stale after login.

### Changes
- `marketplace.tsx` — removed random shelf shuffle; redirect `?category=` to `/categories/$slug`; scroll restore hook
- `products.$slug.tsx` — breadcrumbs link to `/categories/$slug` (+ `sub` for subcategory)
- `SiteLayout.tsx` — removed global scroll-to-top override (router scroll restoration works)
- `DashboardLayout.tsx` — buyer layout no longer remounts main on every path change
- `browseScroll.ts` / `useBrowseScrollRestore.ts` — sessionStorage scroll restore for list → PDP → back
- `ProductCard.tsx`, `ProductListItem.tsx` — save list scroll before opening a product
- `useCatalog.ts` — auth-aware query keys + higher product limits (500 list / 200 category)
- `productFilters.ts` — subcategory filter matches slug or display name

## 2026-07-17 - Buyer/seller auth navigation + retailers CTA card styling

### Why
Guest Add-to-cart and network CTAs did not always open the correct buyer/seller auth; retailers card was solid green instead of two-tone like the seller card.

### Changes
- `NetworkSection.tsx` — seller CTA → `/auth?mode=signup&role=seller`; buyer CTA → `/auth?mode=signin&role=buyer`; retailers card uses light header + white body (matches seller card)
- `auth.tsx` — role derived synchronously from URL + pending cart (always buyer when guest clicked Add)
- `Header.tsx`, `CartSheet.tsx`, `CartItemRow.tsx`, `cart.tsx`, `SaveProductButton.tsx` — buyer auth links include `role=buyer`
- `AddToCartControl.tsx` — already navigates guest Add → buyer sign-in with return URL

## 2026-07-17 - Bigger navbar logo + remove sign-in role gate

### Why
Navbar wordmark looked small, and the Buyer/Seller sign-in role-membership check was blocking valid logins (signing users out with "No buyer/seller account" errors when they used the "wrong" tab).

### Changes
- `Logo.tsx` — new optional `imgClassName` prop to override wordmark height (default stays `h-10 sm:h-11`)
- `Header.tsx` — navbar logo enlarged via `imgClassName="h-14 sm:h-16"`
- `SignInForm.tsx` — removed the `assertAccountMembership` gate in `finishSignIn` (no more forced sign-out on role mismatch) and the "No buyer/seller account for this email" early-return in the invalid-credentials branch. Valid credentials now always sign in from either tab; dropped the unused import. Email-not-confirmed OTP flow is unchanged.

## 2026-07-17 - Back-to-home button on auth pages

### Why
Sign-in / sign-up (and admin) auth screens had no way to return to the landing page.

### Changes
- `AuthLayout.tsx` — added a "Back to home" `Link` (ArrowLeft icon) at the top of the auth card; navigates to `/` (landing). Shared across sign-in, sign-up, and admin login since they all render through `AuthLayout`.

## 2026-07-17 - Center auth marketing logo

### Why
The hex logo on sign-in/sign-up looked shifted right because `logo1.png` had uneven whitespace and the marketing panel lacked full-width center alignment.

### Changes
- `public/logo1.png` — autocropped and re-centered in a square canvas (124×127 → 85×85)
- `AuthLayout.tsx` — logo wrapper uses `mx-auto flex items-center justify-center`; marketing panel uses `items-center` + `w-full max-w-[480px]`

## 2026-07-17 - Logo links to home page

### Why
Clicking the VyaparSetu logo should open the marketing landing page (`/`), not the marketplace.

### Changes
- `Logo.tsx` — brand link `to="/"` (was `/marketplace`)
- `DashboardSidebar.tsx` — sidebar logo wrapper also links to `/`
- `index.tsx` — removed auto-redirect for signed-in users so `/` always renders the landing page

## 2026-07-17 - Auth logo1 hex icon only (no wordmark text)

### Why
Sign-in / sign-up still showed the combined logo1 asset with "Vyapar Setu" text beside the hex mark; operator wants only the hex `logo1` icon, not `logo.png`.

### Changes
- `public/logo1.png` — cropped to hex mark only (124×127)
- `AuthLayout.tsx` — `AuthBrandLogo` square sizing for icon; still uses `/logo1.png` only (never `logo.png`)

## 2026-07-17 - Auth pages use logo1.png brand asset

### Why
Operator provided `logo1` (hex mark + Vyapar Setu text) for sign-in / sign-up; auth was still using `logo.png`.

### Changes
- `public/logo1.png` — synced from operator asset
- `AuthLayout.tsx` — `AuthBrandLogo` renders `/logo1.png` on desktop marketing panel and mobile form header

## 2026-07-17 - Auth wordmark: show logo + text (not cropped icon)

### Why
Auth left panel and mobile header used a square `120×120` / `64×64` crop on `logo.png`, showing only the hex mark and hiding the VyaparSetu wordmark beside it.

### Changes
- `AuthLayout.tsx` — `AuthWordmark` uses `h-* w-auto object-contain` so the full horizontal wordmark (icon + text) renders on desktop marketing panel and mobile form header

## 2026-07-17 - Auth pages match reference design (no Google)

### Why
Operator provided a reference login layout with mint background, dot grids, soft green blobs, left marketing panel, and right white form card. Sign-in and sign-up should match exactly; Google OAuth must stay removed.

### Changes
- `AuthLayout.tsx` — full-page `#F9FBF9` background; dot grids (top-left / bottom-right); soft green blobs + outlined circle; left marketing (logo, headline, feature icons); right white card with user icon; exported shared form field classes
- `SignInForm.tsx` — reference labels/placeholders ("Email Address", "Enter your email"), green Login button, no Google
- `SignUpForm.tsx` — same field styling + Sign up CTA
- `AuthRoleToggle.tsx` — green active pill on gray track
- `auth.tsx` — "Welcome Back!" / "Create Your Account" copy; footer "Don't have an account? Sign up"

## 2026-07-17 - Fix buyer/seller navigation and post-login redirect

### Why
Buyers clicking Orders did not reliably show the orders page; seller sidebar sections appeared stuck on one view (often marketplace); sellers were forced to marketplace after every login.

### Root cause
Dashboard chrome was applied in two different places (`SiteLayout` for `/marketplace`, `_authenticated/route` for app routes like `/orders` and `/supplier/*`), so navigating between shared and app routes remounted the shell inconsistently and could leave stale page content visible.

### Changes
- `SiteLayout.tsx` — single `useWorkspaceChrome` path wraps all authenticated app + shared routes in `DashboardLayout` (excludes onboarding/checkout); added `/seller` prefix
- `_authenticated/route.tsx` — shell is now `<Outlet />` only; supplier/seller paths get seller membership guard; supplier/seller paths skip onboarding trap
- `DashboardLayout.tsx` — `key={pathname}` on `<main>` forces content remount on navigation
- `postLoginRedirect.ts` — seller session/role → `/seller/dashboard` (not marketplace); buyer still → `/marketplace`
- `orders.tsx` — error state + retry when order fetch fails
- `UserMenu.tsx` — buyer "My Orders" link

## 2026-07-17 - Landing performance: image + data fetch optimization

### Why
Deployed landing page was slow to appear; hero/banner and section images loaded slowly and marketplace data was slow to populate.

### Changes
- `scratch/optimize-public-images.mjs` — jimp script that downscales + recompresses oversized `/public` marketing art
  - hero-banner1–3: ~1.5 MB PNG → ~220 KB JPG each (`.png` → `.jpg`)
  - bannerlanding: 1.5 MB PNG → 228 KB JPG
  - retailers 1–5: ~2.4 MB PNG → ~120 KB JPG each
  - logo.png: 904 KB → 35 KB (resized in place, kept PNG for transparency)
- `Hero.tsx` / `CtaBanner.tsx` / `data/testimonials.ts` — point to new `.jpg` assets; deleted old PNG originals
- Image hints: added `loading="lazy"` + `decoding="async"` (+ intrinsic width/height where safe) to `Hero`, `Testimonials`, `CtaBanner`, `ImpactSection`, `DeliveryModels`, `QualityAtEveryStep`, `Logo`, `ProductCard`, `CategoryCard`, `FeaturedProducts`
- `useCatalog.ts` — `fetchCategories` no longer scans all ~409 products (and no longer pulls the heavy `images` JSON). It only queries product cover images for categories still missing a DB image, capped at 300 rows; skips the query entirely when every category already has an image
- `__root.tsx` — narrowed Google Fonts Outfit axis from `100..900` to `400..800` to shrink the render-blocking font payload

## 2026-07-17 - Sync local work with main

### Changes
- Merged the latest `origin/main` order and category updates into the local UI/auth work
- Resolved conflicts in auth redirects and forms by preserving explicit/pending-cart return paths and marketplace-first post-login behavior
- Combined both branches' development history without dropping either change set
- Fixed the merged Orders empty-state animation import and aligned category quick filters with the current `Filters` model

## 2026-07-17 - Network right tags and row spacing

### Changes
- `NetworkSection.tsx` — Kirana & Retail / Marts / Institutions use consistent wider pills
- Extended right paths to x=690 and left paths to x=270 so lines continue behind pills
- Reduced colored flow thickness to 20px (white dash 3px) and left dashed paths to 2.5px
- Reduced vertical row gaps from 12/16/20 to 6/8/10 for a tighter animation

## 2026-07-17 - Network animation landing-only + Add-to-cart return URL

### Why
Sellers & customers network animation was mounted on every buyer/seller dashboard page; guests who clicked Add were not reliably returned to the product/marketplace page after sign-in.

### Changes
- `DashboardLayout.tsx` — removed `NetworkSection` footer (animation stays on landing `index.tsx` only)
- `postLoginRedirect.ts` — priority: explicit `redirect` → pending cart `returnTo` → marketplace
- `SignInForm.tsx` / `SignUpForm.tsx` — use that resolver; paths with query use `location.assign`
- `AddToCartControl.tsx` — auth search includes `role=buyer` + `redirect` to current page
- `auth.tsx` — beforeLoad also respects pending/redirect return path

## 2026-07-17 - Post-login lands on marketplace (not buyer dashboard)

### Why
Successful buyer login was sending users to `/buyer/dashboard`; product-first UX should open the marketplace.

### Changes
- `postLoginRedirect.ts` — buyer/seller/default → `/marketplace` (admin still `/admin`)
- `SignInForm.tsx` — role redirect uses `/marketplace`
- `SignUpForm.tsx` — post-OTP continue uses `/marketplace`

## 2026-07-17 - Buyer/Seller auth page redesign

### Why
Sign-in and sign-up required a separate role-select step and used a green marketing panel on the right, which felt cluttered and unlike the clean split-card reference.

### Changes
- `AuthLayout.tsx` — left soft-gray panel with centered app logo; right white form area with lock icon, title, subtitle
- `AuthRoleToggle.tsx` — Buyer | Seller segmented control above the form heading
- `auth.tsx` — removed RoleSelect step; role lives in URL search (`role=buyer|seller`); default Buyer; Create account / Sign in footer links
- `SignInForm.tsx` — email/password with icons, uppercase labels, Forgot password, full-width SIGN IN
- `SignUpForm.tsx` — removed RoleBanner; shared Create account CTA styling
- `SiteLayout.tsx` — hide marketing Header/Footer on `/auth`, `/forgot-password`, `/reset-password`

## 2026-07-17 - Remove Google from auth forms

### Why
Operator asked to drop Continue with Google on sign-in / sign-up.

### Changes
- `SignInForm.tsx` — removed Google OAuth button, divider, and Lovable OAuth handler

## 2026-07-17 - Network section labels, colors, sticker symmetry

### Changes
- `NetworkSection.tsx`: Hotels → Marts, Cloud Kitchens → Institutions
- Hub label pills alternate green (brand) and orange (warning)
- Removed tilted rotation from seller/retailer card stickers
- Equal row heights + fixed pill widths for left/right column symmetry

## 2026-07-17 - Enrich product prices and descriptions from market rates

### Why
Every catalog SKU used placeholder ₹99 wholesale / ₹129 MRP and one-line stub descriptions, so buyer/seller/landing prices were meaningless.

### Changes
- Researched mid-2026 Indian anchors (FCA mandi, Hyperpure, retail): sugar ~₹43/kg, toor dal ~₹115–125/kg, Everest garam masala 500g ~₹400, Catch turmeric 1kg ~₹260, Fortune sunflower 5L ~₹950–1,100, Tata Salt 1kg ~₹28–30, Daawat rice packs, etc.
- `scratch/enrich-products-prices-descriptions.mjs` — pack-size parser, category/keyword pricing, brand extraction, multi-paragraph descriptions + highlights
- Applied to all **409** products (0 errors): `wholesale_price`, `mrp`, `description`, `highlights`, `brand`, `unit`, `packaging_details`
- UI already reads these via `mapDbProduct` / product cards — hard refresh to see new prices

## 2026-07-17 - Brand logo across navbar, footer, dashboards

### Changes
- Replaced text mark in `Logo.tsx` with `public/logo.png` wordmark
- Compact mode crops to hexagonal icon for collapsed sidebar
- `onBrand` variant adds white plate for footer / auth brand panels
- Dashboard sidebar uses `asLink={false}` to avoid nested links
- Favicon points to `/logo.png`

## 2026-07-17 - Outfit font + first-image product banner queue

### Why
Operator wanted Outfit across the app (titles/headings 600, descriptions 400) and product cards/banners to follow the seller image queue so the first image is always the primary banner.

### Changes
- `__root.tsx` + `styles.css` — load Outfit; set `--font-display` / `--font-sans` to Outfit; body weight 400; headings 600; map Tailwind `font-bold` → 600
- `productImages.ts` — `normalizeProductImages` / `getProductDisplayImage` / `moveImageToFront` (queue[0] = banner)
- `ImageManager.tsx` — first slot is banner; star moves image to front; always emits `thumbnailIndex: 0`
- `supplierProductMap.ts` / `catalogMap.ts` — save and map `image` from `images[0]`
- `ProductCard`, `FeaturedProducts`, `ProductListItem`, `QuickViewDialog`, seller product/inventory lists — display via queue[0]
- Ran `scratch/sync-product-primary-image.mjs` to sync DB `products.image` ← `images[0]`

## 2026-07-17 - Remove "Categories" from Breadcrumb Navigation

### Why
Simplify the breadcrumb navigation by removing the intermediate "Categories" breadcrumb item on category pages, as requested.

### Changes
- `categories.$slug.tsx` — Removed the "Categories" breadcrumb link and its separator, directly connecting "Home" to the current category name.

## 2026-07-17 - Fix wrong Spices category cover in Our Categories

### Why
Landing “Our Categories” still showed a bad `spices.png` (Everest Tikhalal + Tata Salt collage). Slug upload only updated `pulses-dal` / `salt-sugar`; spices kept the old Storage object.

### Changes
- Replaced Storage `category-images/categories/spices.png` with Everest Coriander Powder pack front
- Set `categories.image` for `spices`, `pulses-dal`, `salt-sugar` with `?v=` cache-busters so the UI refreshes

## 2026-07-17 - Upload category images by slug (pulses-dal, salt-sugar)

### Why
Operator asked to run the slug-based category cover upload script.

### Changes
- Ran `node scripts/upload-category-images.mjs --dir ./public`
- Updated: `pulses-dal`, `salt-sugar` → `category-images/categories/<slug>.png` + `categories.image`
- Skipped non-category files in `public/`; remaining 12 categories already had images

## 2026-07-17 - Footer social icons: drop lucide brand exports

### Why
Vercel/Rolldown failed with `[MISSING_EXPORT] "Linkedin" / "Youtube" is not exported` — lucide-react v1 removed brand logo icons.

### Changes
- `Footer.tsx` — replaced `Linkedin` / `Instagram` / `Youtube` lucide imports with inline SVG brand marks (same pattern as Play/App Store badges)

## 2026-07-17 - Restore Logo variant/hideSubtitle props

### Why
Merge left `Logo.tsx` reading `variant` without declaring it, so `Footer` (`variant="onBrand"`) and `DashboardSidebar` (`hideSubtitle`) failed type-check.

### Changes
- `Logo.tsx` — restored `variant?: "default" | "onBrand"` and `hideSubtitle?: boolean`; onBrand uses white mark/wordmark (and muted white subtitle) for the green footer

## 2026-07-17 - Resolve merge conflicts (Footer + AGENTS.md)

### Why
Branch merge left 4 conflict markers across `Footer.tsx` and `AGENTS.md`.

### Changes
- `Footer.tsx` — kept HEAD green Hyperpure footer (LinkedIn/Instagram/YouTube + store badges); dropped older placeholder social icon set
- `AGENTS.md` — kept both landing-page and seller-rating development histories; updated Current Project State

## 2026-07-17 - Green footer + brand store icons

### Why
Footer should use the brand green with white text, and the Play Store / App Store badges needed proper brand logos.

### Changes
- `Footer.tsx` — `bg-brand text-white`; white/80 body text, white headings, white social circles (brand icon), `border-white/20` divider; replaced lucide Play/Apple with inline SVGs (four-color Google Play triangle + Apple mark) on black badges
- `Logo.tsx` — added `variant="onBrand"` (white mark + white wordmark) so the footer logo reads on green

## 2026-07-17 - Footer redesign, Porter card, section image swaps

### Why
Operator wanted a Hyperpure-style footer, a pale Porter delivery card with a rounded logo, and different photos in the Quality/Sustainability sections.

### Changes
- `Footer.tsx` — rebuilt into 4 columns (Company legal details, Know More links, Follow us on brand-circle socials, logo + Google Play/App Store badges) with an FSSAI license + copyright bottom bar
- `DeliveryModels.tsx` — Porter card now pale (`bg-surface` + ring, dark text) instead of dark; Porter logo shown as a rounded app-icon (`rounded-[1.25rem]`, 20-24 size)
- `QualityAtEveryStep.tsx` — Food safety & hygiene image swapped from washing-vegetables to wheat grains (`/quality/food-grains.jpg`, from the provided gstatic link); removed `public/quality/safety.jpg`
- `ImpactSection.tsx` — Sustainability "Working with local sellers" card image swapped from a produce-market photo to a retail-aisle photo (`/sustainability/local-sellers.jpg`)

## 2026-07-17 - Quality section step images

### Why
Operator supplied real photos for the Quality steps (warehouse fulfilment, food washing, handshake support).

### Changes
- Downloaded 3 provided image URLs into `public/quality/` (`fulfilment.jpg`, `safety.jpg`, `support.jpg`) since two were unstable Google thumbnail-cache links
- `QualityAtEveryStep.tsx` — Reliable fulfilment / Food safety & hygiene / Customer centricity steps now use the local `/quality/*` images (Standardized sourcing keeps its Unsplash image)

## 2026-07-17 - Hero banner images + testimonial overlap fix

### Why
Operator added designed 2:1 banners (`hero-banner1-3.png`) to replace the Unsplash hero; testimonial customer name overlapped the portrait.

### Changes
- `Hero.tsx` — carousel now shows `/hero-banner1.png`, `2`, `3` full-bleed (aspect-2/1, object-cover, links to marketplace); removed dark overlay + title/subtitle/CTA (text is baked into the banners); kept arrows + dots + autoplay
- `Testimonials.tsx` — replaced the oversized watermark name with a compact name+role block (`max-w-[45%]`, left) and shrank the portrait to `w-[50%] h-[62%]` so name and image no longer overlap

## 2026-07-17 - Testimonials use Indian local retailer photos

## 2026-07-17 - Testimonials use Indian local retailer photos

### Why
Feedback cards used generic Unsplash portraits; operator wants Indian local kirana-store retailer photos (like the reference shopkeeper image).

### Changes
- Generated 5 photorealistic Indian retailer portraits → `public/retailers/retailer-1..5.png` (male shopkeeper, woman shopkeeper, young male, older man in kurta, wholesale owner)
- `src/data/testimonials.ts` — `photo` now points to `/retailers/retailer-N.png`; renamed t4 `Meera Joshi` → `Ramesh Joshi` (Owner) so the portrait gender matches
- `Testimonials.tsx` — fallback photo → `/retailers/retailer-1.png`

## 2026-07-17 - Hero banner no longer links to marketplace

### Why
Operator did not want clicking the hero carousel to navigate to `/marketplace`.

### Changes
- `Hero.tsx` — removed the `Link` wrapper around the banner image (and its `href` per slide); banner is now a plain, non-clickable image (arrows/dots still work)

## 2026-07-17 - Network diagram full-bleed (logos stream from screen edges)

### Why
Operator wanted the marquee logos to stream in from the actual screen edges (not inset within the container) and the rows nudged up.

### Changes
- `NetworkSection.tsx` — diagram broken out of `container-page` into a full-width `w-full` block (section horizontal padding removed; heading + CTA re-wrapped in `container-page`); SVG connectors constrained to a centered `max-w-4xl` so labels/hub stay near center; diagram top margin `mt-8/10` → `mt-6/8`; CTA gap `mt-32/40` → `mt-24/28`

## 2026-07-17 - Network spacing + white junction fade

### Why
Operator wanted the marquee logos moved up, a white fade where logos meet the label pills, and more gap between the animation and the CTA cards.

### Changes
- `NetworkSection.tsx` — diagram top spacing `mt-16/20` → `mt-8/10` (moves up); new `JunctionFade` white/surface gradient at logo→pill junction (both sides); CTA cards gap `mt-20/24` → `mt-32/40`

## 2026-07-17 - Network marquee uses manufacturer logos (c*/s*), shadow removed

### Why
Operator wanted the network animation to stream real `manufacturers` logos: c1–c10 on the left (sellers), s1–s10 on the right (buyers); and the junction shadow removed.

### Changes
- `useCatalog.ts` — new `useManufacturers()` hook (id, name, slug, logo, sort_order)
- `NetworkSection.tsx` — pulls logos from `manufacturers`; `c*` slugs feed left rows, `s*` slugs feed right rows (sorted by numeric suffix); `Avatar` now white chip + `object-contain` for logos; removed `JunctionShadow`, `AvatarRowWrap` edge fade, and directional pill shadow

## 2026-07-17 - CTA card icons, network junction shadows, Porter brand mark

### Why
Operator wanted stock photos removed from seller/retailer CTA cards (icons instead); stronger shadow where network marquees meet label pills; Porter delivery card to show rounded-2xl logo chip plus “Porter” title text.

### Changes
- `NetworkSection.tsx` — CTA cards use `Factory` / `Store` icon headers + corner stickers (no Unsplash images); `JunctionShadow` + `AvatarRowWrap` edge fade + directional pill shadow at tag/image junction
- `DeliveryModels.tsx` — `PorterBrandMark`: logo in `rounded-2xl` white chip + “Porter” heading below

## 2026-07-17 - Network junction shadows, CTA stickers, Porter logo asset

### Why
Operator wanted depth where network label pills meet streaming category circles; sticker badges on seller/retailer CTA card images; real Porter logo in delivery models instead of CSS wordmark.

### Changes
- `NetworkSection.tsx` — `JunctionShadow` gradient + blur between avatar rows and label pills; `CardImageSticker` on CTA card images (bottom-right); image→text seam gradient on both cards
- `DeliveryModels.tsx` — Porter card uses `/porterlogo.png` in a white chip (removed Truck icon approximation)

## 2026-07-17 - Sliced a1/k1 logo sheets into manufacturers (c1–c10, s1–s10)

### Why
Operator added `public/a1.png` (10 brand logos) and `public/k1.png` (10 kirana-store logos); each logo cut out, uploaded, and inserted with codes c1–c10 (from a1) and s1–s10 (from k1).

### Changes
- Applied `manufacturers` table via `scripts/apply-manufacturers-pg.mjs` (direct db host is IPv6-only; used IPv4 transaction pooler `aws-0-ap-northeast-1.pooler.supabase.com:6543`, user `postgres.juoufayfyzpmscxeiydd`)
- `scripts/slice-manufacturer-logos.mjs` — added `--prefix` and `--map a1=c,k1=s`; storage object `<tag>/<code>.png`, id `mf-<code>`, slug `<code>`, name from `<base>.names.json`
- `public/a1.names.json`, `public/k1.names.json` — real company/store names (reading order)
- Ran `--files a1,k1 --map a1=c,k1=s --grid 2x5 --expect 10` → 20 rows inserted, 0 errors (verified: a1=10, k1=10)

### Codes
- a1 → c1 Shree Laxmi Foods, c2 Sri Sai Agro Foods, c3 Vijay Masala, c4 Natural Harvest, c5 Hillside Dairy, c6 Britannia, c7 Sunfeast, c8 Parle, c9 Surf Excel, c10 Colgate
- k1 → s1 Shivam, s2 Gupta Ji, s3 Patel, s4 Agrawal, s5 Mahajan, s6 Singh, s7 Dubey, s8 Yadav, s9 Verma, s10 Sharma (Kirana Store)

## 2026-07-17 - Network marquee uses DB category images

### Why
Hardcoded `/public` category PNGs were stale; animation must show live `categories.image` from the database.

### Changes
- `NetworkSection.tsx` — removed static image list; `useCategories()` feeds circular marquee rows

## 2026-07-17 - Manufacturers table + logo-sheet slicing script

### Why
Operator uploads sheets (a1, a2, a3) each containing ~10 company logos; each logo must be cut out, stored in Storage, and inserted as its own `manufacturers` row.

### Files Created
- `supabase/migrations/20260717000000_manufacturers_table.sql` + `scratch/APPLY_MANUFACTURERS.sql` — `manufacturers` (id, name, slug, logo, source_image, sort_order) with public-read / admin-write RLS
- `scripts/slice-manufacturer-logos.mjs` — auto-detects logos via row/column projection segmentation (no fixed grid), trims whitespace, uploads to bucket `manufacturer-logos`, upserts rows; supports `--grid RxC`, `--files`, `--expect`, `--dry-run`, and optional `<base>.names.json`

### Files Modified
- `src/integrations/supabase/types.ts` — added `manufacturers` table type
- `.gitignore` — ignore `manufacturer-logos-upload/`
- Added dep `jimp` (pure-JS image cropping)

### Apply / Usage
```bash
# 1) create the table (direct DB host is IPv6-only from here) — run
#    scratch/APPLY_MANUFACTURERS.sql in Supabase SQL Editor (project juoufayfyzpmscxeiydd)
# 2) put sheets in public/ named a1.png, a2.png, a3.png (optional public/a1.names.json)
node scripts/slice-manufacturer-logos.mjs --dry-run
node scripts/slice-manufacturer-logos.mjs --expect 10
# if auto-detect miscounts, force a uniform grid:
node scripts/slice-manufacturer-logos.mjs --grid 2x5
```

### Notes
- `a1`, `a2`, `a3` were NOT in the repo when this was built — add them to `public/` then run
- Names default to `<base>-01`… unless a `<base>.names.json` sidecar (reading order) is provided; rename in DB anytime

## 2026-07-17 - Network polish + 5 retailer feedback cards

### Why
White edge fades hid product circles; CTA cards needed imagery; Restaurants copy removed; feedback should show five Indian retailers with edge shadows.

### Changes
- `NetworkSection.tsx` — removed end masks/fades; more space under animation; CTA cards with images; right pill “Hotels”; buyer CTA “Retailers” only
- `testimonials.ts` — 5 Indian retailer stories with portraits
- `Testimonials.tsx` — edge fade shadows on marquee left/right

## 2026-07-17 - Flip testimonial cards on infinite marquee

### Why
Feedback section needed Hyperpure-style portrait cards with front/back flip on hover while keeping continuous carousel motion.

### Changes
- `Testimonials.tsx` — 3D flip cards (company/logo, snippet, watermark name, photo, +); back shows full quote + rating
- `testimonials.ts` / `Testimonial` type — accents, portrait photos
- `InfiniteCarousel.tsx` — `pauseOnChildHoverSelector` so hovering a card pauses the marquee for readable flip

## 2026-07-17 - Junction shadows, testimonial elevation, Porter delivery

### Why
Operator wanted shadows where network images meet the label tags, elevated corners on testimonial carousel cards, and the EXPRESS delivery model renamed to Porter with a Porter logo.

### Changes
- `NetworkSection.tsx` — `LabelPill` now `shadow-elevated` + ring; junction gradient fade strip so streaming images tuck under each label; symmetric mask on both edges
- `Testimonials.tsx` — carousel cards use `shadow-elevated` + ring + vertical margin so corner shadows show
- `DeliveryModels.tsx` — renamed `EXPRESS` → `Porter`; added `PorterLogo` wordmark chip (Truck icon + "Porter" in Porter's indigo/yellow); note: brand-colour wordmark approximation, not an official asset file

## 2026-07-17 - Network section coded animation (revert video)

### Why
Operator wanted the network animation recreated in code (like the reference image), not an embedded video.

### Changes
- `NetworkSection.tsx` — coded diagram: 3 left rows (Manufacturers/Distributors/Wholesalers) stream in, 3 right rows (Kirana & Retail/Restaurants/Cloud Kitchens) stream out, central VyaparSetu hub, dashed SVG converge/diverge curves, edge-fade masks (uses `InfiniteCarousel` with `reverse`)
- Deleted `public/itemsvideo.mp4`

## 2026-07-17 - Navbar overlap fix + network diagram animation

### Why
Centered nav was absolutely positioned and overlapped the search box; the "Building a wide network" section needed the Hyperpure-style layout — 3 rows of category images animating into a central VyaparSetu hub and out to buyer types.

### Changes
- `Header.tsx` — nav is now a flowing `flex-1` centered item (no absolute overlap); search box fixed-width (`lg:w-[180px] xl:w-[260px]`), nav text shrinks at lg
- `InfiniteCarousel.tsx` — added `reverse` prop (`vs-marquee-reverse` keyframes) for left→right drift
- `NetworkSection.tsx` — 3 left rows (Manufacturers/Distributors/Wholesalers) + 3 right rows (Kirana & Retail/Restaurants/Cloud Kitchens) of category-image avatars via `InfiniteCarousel`; central card hub; dashed SVG connector curves converging/diverging; edge fade masks

## 2026-07-17 - Landing CTA uses bannerlanding.png

### Why
Replace the solid green HTML CTA (“Ready to scale…”) with the credit-limit promo art in `public/bannerlanding.png`.

### Changes
- `CtaBanner.tsx` — show `/bannerlanding.png` (links to marketplace); removed old text/button block
- Re-ran `upload-category-images.mjs --dir ./public` (14 categories; skipped `bannerlanding.png`)

## 2026-07-17 - Infinite marquee carousels + delivery cards without images

### Why
Stepped 3-at-a-time carousels felt jumpy; delivery model cards should be color blocks only.

### Changes
- `InfiniteCarousel.tsx` — continuous CSS marquee (duplicated track, pause on hover)
- `ImpactSection.tsx` / `Testimonials.tsx` — use infinite marquee instead of index jumps
- `DeliveryModels.tsx` — remove bottom images; Wholesale / EXPRESS colored cards only

## 2026-07-17 - Delivery models, carousels, navbar & scroll-to-top

### Why
Landing polish: categories margin; product links opened mid-page; delivery/sustainability/testimonials needed Hyperpure-style layouts; navbar felt small.

### Changes
- `CategoriesPreview.tsx` — outer side margin around green panel
- `SiteLayout.tsx` + `resetScroll` on category/product links — scroll to top on navigation
- `DeliveryModels.tsx` — Wholesale / EXPRESS curved cards (brand + foreground, no neon)
- `ImpactSection.tsx` — left copy + 2s auto image carousel
- `Testimonials.tsx` + `testimonials.ts` — 2s auto carousel, more partner quotes
- `Header.tsx` — taller bar, larger nav/search/CTA sizing

## 2026-07-17 - Category product carousels + wider categories panel

### Why
Our Categories title/width needed tweak; per-category product rows needed Hyperpure carousel UI without visible scrollbars.

### Changes
- `CategoriesPreview.tsx` — smaller title; near full-bleed green panel
- `FeaturedProducts.tsx` — category rows with icon/title/subtitle, arrow controls, See all pill, compact cards, hidden scrollbar; DeliveryModels left as-is

## 2026-07-17 - Main category image bulk upload script

### Why
Operators add cover images named after main categories; those must land in Storage and `categories.image` for marketplace/landing category tiles.

### Changes
- `scripts/upload-category-images.mjs` — match by category name/slug, upload to public bucket `category-images`, set `categories.image`
- Removed `scripts/upload-subcategory-images.mjs` (superseded)
- `.gitignore` — ignore local `category-images/` upload tree
- UI already maps `categories.image` via `useCategories` → `CategoryCard` / `CategoriesPreview`

### Usage
```bash
# Put files in ./category-images named like: Spices.jpg, Food Grains & Cereals.png, pulses-dal.webp
node scripts/upload-category-images.mjs --dry-run
node scripts/upload-category-images.mjs
# Or from public/:
node scripts/upload-category-images.mjs --dir ./public
```

### Applied 2026-07-17
- Ran `--dir ./public`: created bucket `category-images`, uploaded 11 images, updated `categories.image`
- Renamed `public/bevarages.png` → `beverages.png` so Beverages matched
- Still missing files for: `personal-care`, `pulses-dal`, `snacks-bakery`

## 2026-07-17 - Our Categories Hyperpure-style panel

### Why
Categories strip needed white outer / green inner panel, larger titles, card padding, and main categories from DB.

### Changes
- `CategoriesPreview.tsx` — white section → `bg-brand-soft` rounded panel; “Our Categories” with side rules; 7-col white cards with padding + larger titles; tiles from main `categories` (not subcategories)

## 2026-07-16 - Quality section interactive 2s loop UI

### Why
Static two-column quality block felt weak; needed first-image accordion UI with continuous highlight cycling.

### Changes
- `QualityAtEveryStep.tsx` — left list with active description + brand indicator bar; auto-advances every 2s (pauses on hover); right image swaps per step with pin highlight card; VyaparSetu content + brand green

## 2026-07-16 - Landing nav center + live stats + location cache

### Why
Nav links were left-aligned; location did not persist; stats showed animated zeros from mock data; operator asked for Hyderabad/Bengaluru only and Hyperpure-style stats typography.

### Changes
- `Header.tsx` — nav centered; cities limited to Hyderabad & Bengaluru; selection saved in `localStorage` (`vs.delivery-location.v1`)
- `src/lib/deliveryLocation.ts` — read/write helpers
- `ImpactStats.tsx` — divider stats row + “Quality at every step / Built on trust” (brand green)
- `useMarketplaceStats.ts` — live counts (RPC when available, else public products aggregation); cities = 2
- Migration `20260716220000_marketplace_public_stats.sql` + `scratch/APPLY_MARKETPLACE_STATS.sql`

### Apply (for exact verified seller / buyer counts)
Run `scratch/APPLY_MARKETPLACE_STATS.sql` in Supabase SQL Editor.

## 2026-07-16 - Landing navbar (location + Login/Signup)

### Why
Landing chrome still showed cart, notifications, Get Started, and inline “B2B Marketplace” beside the logo; needed Hyperpure-style public nav.

### Changes
- `Logo.tsx` — “B2B Marketplace” stacked under VyaparSetu; solid `bg-brand` mark (no gradient)
- `Header.tsx` — removed cart, notifications, UserMenu, Get Started; added location picker, Browse catalogue (NEW) / Quality / Sustainability / Blogs, inline search, Login/Signup
- Quality & sustainability sections get `id` anchors for nav hash links

## 2026-07-16 - Landing page Hyperpure-style redesign

### Why
Operator requested a full landing UI redesign matching a clean B2B food-supply long-form layout, using existing VyaparSetu theme tokens only (solid brand green, soft surfaces — no neon or gradient accents).

### Changes
- `src/routes/index.tsx` — new section order: Hero carousel → Impact stats → Quality → Network CTAs → Categories (DB) → Product rows → Delivery models → Impact → Testimonials → FAQ → CTA
- `Hero.tsx` — full-bleed image carousel with solid brand CTA
- `ImpactStats.tsx` — four-column metric strip
- `QualityAtEveryStep.tsx` — feature list + process checklist image
- `NetworkSection.tsx` — sellers/customers network + dual register cards
- `CategoriesPreview.tsx` — shop-by-categories grid from `useCategories()` (Supabase)
- `FeaturedProducts.tsx` — horizontal product carousels (featured + top 3 DB categories)
- `DeliveryModels.tsx`, `ImpactSection.tsx` — solid brand/foreground blocks (no gradients)
- `Testimonials.tsx`, `FaqSection.tsx`, `CtaBanner.tsx` — restyled to match layout; CTA uses solid `bg-brand`

## 2026-07-17 - Holistic Seller Rating System

### Why
Build a dynamic, secure, and aggregated review & rating system for sellers and products based on authentic buyer transactions, displaying live rating counts and average ratings across the platform.

### Changes
- `supabase/migrations/20260717024000_holistic_seller_rating_system.sql` — Created migration file adding rating columns to sellers table, creating the product_reviews table, defining the purchase check helper, setting up RLS, and creating rating calculation and propagation triggers.
- `scripts/apply-rating-migration.mjs` — Added node pg database migration applier script.
- `src/hooks/useProductReviews.ts` — Implemented React hooks to query, submit, and delete product reviews and check purchase status.
- `src/hooks/useSupplier.ts` — Updated `useSupplierReviews` hook to fetch reviews from the database for the active seller and save review replies to Supabase.
- `src/types/index.ts` — Added `reviewCount` to the Supplier type definition.
- `src/lib/catalogMap.ts` — Updated `asSupplier` parsing helper to parse `reviewCount` from the database payload.
- `src/components/common/Rating.tsx` & `RatingBadge.tsx` — Modified rating components to render a neutral "No ratings yet" label when rating or count is 0.
- `src/components/marketplace/SupplierCard.tsx` — Updated search card to display live supplier rating and count.
- `src/routes/suppliers.$id.tsx` — Modified resolveSupplier loader to fetch dynamic rating profiles via `get_public_supplier` RPC.
- `src/routes/products.$slug.tsx` — Rendered live product reviews and supplier rating metrics.
- `src/routes/_authenticated/orders.$id.tsx` — Added review dialog/star selector allowing buyers to submit, edit, or delete reviews from their order details page.

## 2026-07-16 - Preserve Complete Product List State After Editing a Product

### Why
Improve the seller workflow UX by retaining filters, pagination page, search queries, sorting order, and scroll position on the Product Management page when returning from editing or deleting a product, rather than resetting everything back to defaults.

### Changes
- `src/components/supplier/DataTable.tsx` — Added optional `page` and `onPageChange` props to allow controlled pagination from the URL query string.
- `src/routes/_authenticated/supplier.products.index.tsx` — Registered a Zod typed search validation schema `productSearchSchema` on the route, bound UI filters to `Route.useSearch()`, and added sessionStorage sync, load/restore, and scroll position restoration hooks.

## 2026-07-16 - Premium UI Polish for Seller Product Management

### Why
Refine and polish the visual details of the Seller Product Management index page and related components (DataTable and Pill) to make them look clean, spacious, and production-ready, without structural or layout alterations.

### Changes
- `src/routes/_authenticated/supplier.products.index.tsx` — Styled header buttons, fully rounded search input, select dropdown inputs, category tags, price formatting, thinner progress bars, and icon hover effects.
- `src/components/supplier/DataTable.tsx` — Styled bulk actions wrapper, moved table footer/pagination inside the card container with a soft bg and border, increased row padding, and styled pagination buttons to be fully rounded.
- `src/components/supplier/Pill.tsx` — Added borders matching tones, updated typography to smaller uppercase medium-weight style.

## 2026-07-16 - Remove Dispatch from Seller UI

### Why
Clean up the Seller interface by removing the Dispatch feature on the frontend, keeping the dashboard and selection screens concise.

### Changes
- `src/components/dashboard/DashboardSidebar.tsx` — Removed Dispatch from the seller sidebar array.
- `src/routes/_authenticated/seller.dashboard.tsx` — Removed "Ready for pickup" StatCard, "Dispatch orders" QuickAction, updated layout to grid-5/grid-3 columns, and refined header text.
- `src/components/auth/RoleSelect.tsx` — Changed "Dispatch" to "Sales analytics" (with `TrendingUp` icon) in the features overview list for sellers.
- Deleted `src/routes/_authenticated/supplier.dispatch.tsx`.

## 2026-07-16 - Remove Quotations, Suppliers, and Saved Items from Seller UI

### Why
Clean up the Seller interface by removing features (Quotations, Suppliers, Saved Items) strictly on the frontend, leaving the buyer features and the backend logic intact.

### Changes
- `src/components/dashboard/DashboardSidebar.tsx` — Removed Quotations and Saved items from the seller sidebar arrays, deleted the empty explore group rendering.
- `src/components/layout/UserMenu.tsx` — Wrapped Saved items option to only render when the user is not a seller (`!isSeller`).
- `src/routes/_authenticated/profile.tsx` — Removed Saved Items section and related `useWishlist` query/variables from the seller profile view (`SellerOrFullProfilePage`).
- Deleted `src/routes/_authenticated/supplier.rfqs.tsx` and `src/routes/_authenticated/supplier.rfqs.$id.tsx` (seller quotations page routes).
## 2026-07-16 - Category Card & Product Card Styling updates (Requirement 13)

### Why
Category icons were uncolored or generic and required dynamic semantic coloring, sizing improvements, and flat aesthetics. Product cards needed larger images and absolute flattening (no shadows or scale animations).

### Changes
- `categoryIconMap.ts` [NEW] — Created a central helper mapping categories to semantic Lucide icons, complementary colors, and background highlights, featuring deterministic fallbacks for new categories.
- `CategoryCard.tsx` — Redesigned category cards and tiles to use the new central theme mapping with larger icons, removing all shadows, transitions, and hover-lifts.
- `marketplace.tsx` — Integrated the new categories styling on the home page view and removed old hardcoded icon maps.
- `ProductCard.tsx` — Maximized product image aspect box container space, reduced empty paddings, and removed all card hover elevations/shadows.

## 2026-07-16 - Zepto-style product cards, logo marketplace nav, buyer dashboard removal

### Why
Product cards were too detailed for browse-mode, showing supplier info, GST, stock counts, and delivery on the grid. The logo pointed to the landing page instead of the marketplace. Buyers had a Dashboard link that served no unique purpose.

### Changes
- `ProductCard.tsx` — complete rewrite to Zepto-compact layout: image-dominant square, overlaid ADD button, compact price+discount row, 2-line name, MOQ, and inline star rating. Removed supplier, GST, stock, delivery, and save/view buttons from the card (moved to product detail page).
- `ProductGrid.tsx` — denser grid (2→3→4→5→6 columns) to show more products at once.
- `Logo.tsx` — changed `to="/"` to `to="/marketplace"` so clicking the brand returns to the marketplace from any page.
- `UserMenu.tsx` — buyers now see "Marketplace" instead of "Dashboard" in their account dropdown. Sellers keep "Seller Dashboard" link.
- `AGENTS.md` — documented these changes.

## 2026-07-16 - Completely remove buyer sidebar, redesign top search bar, & fix navigation dead ends

### Why
The buyer-facing workspace required a more spacious, full-width design without a left sidebar, along with a prominent, modern, and responsive top search bar inspired by Swiggy's clean header layout. Additionally, removing the sidebar introduced potential navigation dead ends for pages like `/orders`, `/wishlist`, or `/profile`; hence, a comprehensive header navigation audit was conducted.

### Changes
- `DashboardLayout.tsx` — conditionally bypassed the `SidebarProvider`/`SidebarInset`/`DashboardSidebar` wrapper structure for buyer-facing workspaces to span full viewport width without side margins.
- `DashboardTopbar.tsx` — added `isBuyerLayout` prop support. For buyers, the sidebar toggle/collapse button is removed, the VyaparSetu logo is placed on the left, the search bar is redesigned into a prominent, wide, rounded container in the middle that triggers the `SearchDialog`, and cart/notifications/user actions are aligned on the right. Added desktop navigation links (`Marketplace`, `Orders`, `Saved Items`) next to the logo, and a responsive mobile nav drawer (`Sheet` menu) for tablets/mobile screens to resolve navigation dead ends. Added responsive logo sizing (compact icon on mobile). Bypassed standalone "Suppliers" link from both desktop and mobile header systems to focus on a product-first marketplace experience. Implemented real-time search synchronization between the header input and marketplace view using URL search query parameters (`q`).
- `marketplace.tsx` — redesigned the page into a Zepto-inspired product-first layout. Removed the redundant page-level search bar, and added category-grouped shelf displays. When no search queries or filters are active, products are grouped into dynamic, clean horizontal shelves with a "View All" redirection button. Incorporated modern responsive promotional B2B banners (bulk offers, supplier trust flags, shipping benefits) before the product listing shelves. Shuffled the category-grouped product arrays on initial render to dynamically vary the displayed selection on page refresh. Hides the subcategory list and promotional banners automatically when a search query is active to present a dedicated, clutter-free search results view. Added a brand new "Shop by Category" section featuring clean individual cards, custom mapped semantic icons (e.g. Wheat, Droplets, Cookie) from `lucide-react`, and a "View All Categories" redirection link. Configured the cards to wrap gracefully into rows via `flex-wrap` rather than displaying a horizontal scrollbar. Removed the redundant `CategoryNavBar` strip and `AllSubcategoriesStrip` (Shop by wholesale subcategory) from the marketplace landing page to streamline header spacing and flow. Styled both the "Shop by Category" section and each dynamic product shelf wrapper as container cards with rounded corners, subtle borders, padding, and soft hover shadows to make the layout feel cohesive and premium.
- `CategoryNavBar.tsx` — removed from both the marketplace homepage and category-specific details pages to optimize layout real estate and avoid duplicate category paths.
- `AllSubcategoriesStrip.tsx` — refactored the "Shop by wholesale subcategory" strip. Rather than hardcoded images/subcategories, the list is dynamically filtered to show only subcategories that contain active products in the database, mapping a real product image as the subcategory's visual asset. Added keyword filters (excluding "back", "label", "nutrition", "barcode", etc.) to search both primary and secondary product images and select a clear front-facing representative product packaging image. Removed from the main Marketplace homepage to show subcategories only after selecting a main category.
- `useCatalog.ts` — refactored `fetchCategories` hook to dynamically fetch and map front-facing representative product packaging images from the products table for any category listing (on `/categories`) that lacks custom graphics.
- `categories.$slug.tsx` — completely redesigned the category details browsing layout to use the Zepto split-screen experience. Built a vertical subcategory sidebar navigation panel on the left (showing subcategory icons/images and active category highlights) and aligned category title, breadcrumb pathways, a horizontal filters row (In Stock, GST, Sorts), and a dense responsive B2B product card grid on the right. Refactored the TanStack router loader query to explicitly join and select nested relational subcategories from the database rather than selecting `*`.
- `postLoginRedirect.ts` — updated the default redirect for sellers to land on the `/marketplace` rather than `/seller/dashboard`.
- `DashboardSidebar.tsx` — added a link to the `/marketplace` under the `SELLER_EXPLORE` group in the seller sidebar to allow sellers to easily transition from dashboard view to public buying views.
- `AGENTS.md` — documented these changes.

## 2026-07-16 - Hide admin nav from buyer/seller workspaces

### Why
Primary admin account is also buyer/seller; Admin sidebar group and UserMenu link appeared on buyer dashboard.

### Changes
- `DashboardSidebar.tsx` — Admin nav only when path is `/admin*`; buyer/seller workspaces never show it
- `UserMenu.tsx` — removed Admin console menu item (admin uses dedicated `/admin` login)

## 2026-07-16 - Remove all application console logs

### Changes
- Stripped `console.log/warn/error/info/debug` from all files under `src/`
- Cleaned empty leftover `if` blocks; kept error UI/toasts intact

## 2026-07-16 - OTP delivery diagnostics & clearer failures

### Findings
- SMTP (`harsha224684@gmail.com` via Gmail) verifies OK
- OTP rows are created for both Gmail and `chaitanya.edu.in` — send path runs
- Institutional domains often accept then filter Gmail into Spam or delay delivery

### Changes
- `src/server/authOtpHandler.ts` — richer SMTP logging, rejected-recipient errors, OTP rollback on send failure, spam hint for .edu
- `src/components/auth/EmailOtpForm.tsx` — spam/junk note for college emails

## 2026-07-16 - Assign category products to pending seller (hidden from buyers)

### Why
Operator requested Salt & Sugar, Snacks & Bakery, Spices, Tea & Coffee products under `madhusethusagar576@gmail.com` (pending) so buyers cannot see them until admin verifies.

### Changes
- SQL / `scripts/assign-categories-to-pending-seller.mjs`
- Categories: `salt-sugar`, `snacks-bakery`, `spices`, `tea-coffee`
- Updates `products.seller_id`, `supplier` JSON, `seller_products`; seller kept `pending`
- Marketplace RLS already hides non-verified seller products

## 2026-07-16 - Fix verified seller products not showing + assign all to primary seller

### Why
Marketplace returned zero products: products RLS called `is_admin()` without EXECUTE for `anon`, and catalog queries used `sellers!inner` which buyers cannot read under sellers RLS.

### Changes
- Granted `EXECUTE` on `is_admin` / `is_verified_seller` to `anon`
- Assigned all products + supplier JSON + seller_products to `ugadiharshavardhan@gmail.com` (verified)
- Removed `sellers!inner` from `useCatalog.ts` marketplace queries (RLS gate remains)

### Verify
Anon product count should be 409; all owned by primary verified seller.

## 2026-07-16 - Strict verified-seller product visibility for buyers

### Why
Products with `seller_id IS NULL` were still publicly readable, and marketplace queries did not explicitly require `verification_status = verified`.

### Changes
- Migration / `scratch/APPLY_STRICT_VERIFIED_PRODUCTS.sql` — assign orphan products to verified primary seller; drop NULL seller public read
- `src/hooks/useCatalog.ts` — marketplace queries use `sellers!inner` + `verification_status = verified`; admin `useAllProducts` bypasses that filter
- `src/hooks/useSupplier.ts` — no longer inserts products without `seller_id`

### Rule
Until admin sets seller to `verified`, that seller's products are hidden from buyers/marketplace.

## 2026-07-16 - Fix admin crash + live sellers/buyers/products

### Why
Admin overview crashed with `Box is not defined` and still used mock stats instead of DB data.

### Changes
- `src/routes/_authenticated/admin.index.tsx` — fixed `Box` import; live sellers/buyers/products tables + stats
- `src/routes/_authenticated/admin.users.tsx` — live buyers + sellers list
- `src/hooks/useAdminSellers.ts` — added `useAdminBuyers`

## 2026-07-16 - Dedicated admin login (no buyer/seller chooser)

### Why
Visiting `/admin` while logged out sent users to Customer/Seller role select, blocking admin access.

### Changes
- `src/components/auth/AdminSignInForm.tsx` — admin-only email/password form
- `src/routes/auth.tsx` — when `redirect` is `/admin`, show admin form only
- `src/routes/_authenticated/admin.tsx` — non-admin sessions signed out, then admin login
- `scripts/set-admin-password.mjs` — sets password `123456` for `ugadiharshavardhan@gmail.com`

### Admin credentials
- Email: `ugadiharshavardhan@gmail.com`
- Password: `123456`
- URL: `/admin`

## 2026-07-16 - Defer buyers/sellers until email OTP verified

### Why
Signup wrote `buyers`/`sellers` immediately (via `handleRegister` + `handle_new_user` trigger), and `auto_confirm_auth_user` marked emails confirmed before OTP — so unverified accounts appeared in the DB.

### Changes
- `src/server/authOtpHandler.ts` — register only creates/updates `auth.users` + metadata + sends OTP; `upsertMembership` runs in `handleVerify` after successful OTP
- Migration `20260716210000_defer_membership_until_otp.sql` — drop auto-confirm trigger; noop `handle_new_user`; promote `ugadiharshavardhan@gmail.com` to `public.admins`
- Apply: `node scripts/apply-defer-membership-otp.mjs`

### Admin path
- Sign in as `ugadiharshavardhan@gmail.com` → open `/admin` (or `/admin/verifications`)

## 2026-07-16 - Seller verification gate & admin approval

### Feature/Task Name
Admin seller verification with brand-asset signup and buyer catalog gating.

### Why
Unverified sellers' products were publicly visible; admin Verifications page used mock data; seller signup lacked logo/shop image uploads required for review.

### Files Created
- `supabase/migrations/20260716200000_seller_verification_gate.sql`
- `scratch/APPLY_SELLER_VERIFICATION.sql`
- `scripts/apply-seller-verification.mjs`
- `src/hooks/useAdminSellers.ts`
- `src/components/auth/LocalAssetDropzone.tsx`
- `src/lib/sellerBrandAssets.ts`

### Files Modified
- `src/routes/_authenticated/admin.verifications.tsx` — live sellers list, detail dialog, approve/reject
- `src/routes/_authenticated/admin.index.tsx` — live verified/pending seller counts
- `src/components/auth/SignUpForm.tsx` — required Brand assets (logo + shop image)
- `src/components/onboarding/OnboardingWizard.tsx` — logo/shop required on Documents step
- `AGENTS.md`

### Database
- `is_verified_seller(uuid)` SECURITY DEFINER helper
- Products SELECT RLS: buyers/anon only see verified sellers' products (sellers see own; admins see all)
- Trigger protects `verification_status` (sellers may only move pending/rejected → under_review)
- Backfilled existing product-owning sellers to `verified`

### Apply
```bash
node scripts/apply-seller-verification.mjs
# or run scratch/APPLY_SELLER_VERIFICATION.sql in Supabase SQL Editor
```

### Next
- Ensure admin account exists in `public.admins` to use `/admin/verifications`
- New sellers stay under_review until admin approves

## 2026-07-16 - Ran catalog image upload for dry-fruits-nuts and personal-care

### Changes
- Executed `node scripts/upload-product-images.mjs --seller-email ugadiharshavardhan@gmail.com`
- Result: Created 52, Updated 0, Errors 0; skipped `Raw Peanuts` (no images)
- Images uploaded to Storage bucket `product-images`; products linked via category_slug + subcategory_id

## 2026-07-16 ? Create products from public/ slug image folders

### Feature/Task Name
Bulk create products from `public/<categories.slug>/<subcategories.slug>/<item-folder>/`.

### Why
Operators upload image trees using DB slug folder names; script creates new products linked to category + subcategory and uploads images to Supabase Storage.

### Files Modified
- `scripts/upload-product-images.mjs` (rewritten: create products by slug path)
- `AGENTS.md`

### Usage
```bash
node scripts/upload-product-images.mjs --dry-run
node scripts/upload-product-images.mjs --seller-email ugadiharshavardhan@gmail.com
```

## 2026-07-16 - Relational categories and subcategories

### Feature/Task Name
Split category taxonomy into categories + subcategories tables; seed FMCG wholesale list.

### Why
Subcategories lived in JSON on categories, blocking proper product relations and admin CRUD.

### Files Created
- supabase/migrations/20260716170000_subcategories_table.sql
- scratch/APPLY_SUBCATEGORIES.sql
- scripts/seed-categories.mjs

### Files Modified
- src/hooks/useCatalog.ts, useSupplier.ts
- src/lib/catalogMap.ts, catalogAdminMap.ts, supplierProductMap.ts
- src/integrations/supabase/types.ts, src/data/categories.ts, src/types/index.ts
- src/routes/_authenticated/admin.categories.tsx
- AGENTS.md

### Database
- New subcategories table (category_id FK)
- products.subcategory_id FK
- Drop categories.sub_categories JSON (via migration)
- Seeded 14 categories + 80+ subcategories (duplicate Barley removed)

### Next
- Re-run scratch/APPLY_SUBCATEGORIES.sql in Supabase SQL Editor (fixed is_admin(auth.uid()))
- Then node scripts/seed-categories.mjs if relational rows need refill

## 2026-07-16 ? Bulk product image upload script

### Feature/Task Name
Folder-tree bulk image upload for catalog products.

### Why the change was made
Operators need to attach local product photos using a `Main Category ? Subcategory ? Item Name` folder layout, matching folder names to catalog product names and writing public URLs into the database.

### Files Created
- `scripts/upload-product-images.mjs`

### Files Modified
- `.gitignore` ? ignore local `catalog-images/` upload trees
- `AGENTS.md`

### Usage
```bash
node scripts/upload-product-images.mjs --dir ./catalog-images --dry-run
node scripts/upload-product-images.mjs --dir ./catalog-images
```

### Design Decisions
- Match by normalized equality (case/spacing/punctuation insensitive), preferring category + subcategory + name, then name-only fallback.
- Creates public Storage bucket `product-images` if missing (service role).
- `--dry-run` reports matches without uploading.

### Known Limitations
- Ambiguous duplicate product names require renaming folders or products for a unique match.
- Category folder must roughly match `products.category_slug` (hyphens treated as spaces) or matching falls back to name/subcategory.

## 2026-07-14 ? Baseline Setup
### Objective
Create initial comprehensive project documentation in AGENTS.md.
### Changes
- Analyzed the repository structure, code, and database logic.
- Created `AGENTS.md` as the continuous project memory.
- Added Continuous Project Memory guidelines.

## 2026-07-14 ? RBAC Foundation

### Feature/Task Name
Scalable Role-Based Authentication (RBAC) foundation for Buyer and Seller.

### Why the change was made
To separate buyer and seller workflows natively at the router level, preventing accidental or unauthorized access to different portal sides, and establishing a robust security posture for upcoming features.

### Files Created
- `src/lib/rbac.ts`
- `src/routes/unauthorized.tsx`
- `src/routes/_authenticated/buyer.tsx`
- `src/routes/_authenticated/seller.tsx`

### Files Modified
- `src/components/auth/RoleSelect.tsx`
- `src/components/auth/SignInForm.tsx`
- `src/components/onboarding/OnboardingWizard.tsx`
- `src/lib/postLoginRedirect.ts`
- `src/components/layout/SiteLayout.tsx`
- `src/components/dashboard/DashboardSidebar.tsx`
- `src/components/layout/UserMenu.tsx`
- `AGENTS.md`

### Files Deleted
- None (Renamed `dashboard.tsx` -> `buyer.dashboard.tsx`, `supplier.index.tsx` -> `seller.dashboard.tsx`)

### Database Changes
- None (Leveraged existing `buyers`, `sellers`, `admins` tables).

### API Changes
- None

### UI Changes
- Updated the Registration flow role-selection cards with new descriptions and icons.
- Added a full-page `unauthorized` component.

### Configuration / Env Changes
- None

### Breaking Changes
- Dashboard paths explicitly require `/buyer/dashboard` and `/seller/dashboard`.

### Dependencies
- None

### Design Decisions Made
- Used TanStack Router `beforeLoad` on layout files (`buyer.tsx`, `seller.tsx`) instead of cluttering every page with role checks.
- Kept the centralized role query logic in `src/lib/rbac.ts`.

### Assumptions Taken
- It's safe to rename the root dashboards and update navigation links.

### Known Limitations Introduced
- Currently, only the primary dashboards are guarded by prefixes. The rest of the `supplier.*.tsx` routes would theoretically need to move to the `seller.*.tsx` prefix to be protected under the layout.

### Next Recommended Tasks
- Migrate all `supplier.*.tsx` routes to `seller.*.tsx` to fully encompass them under the new seller route guard.

## 2026-07-14 ? Seller Product Management Phase
### Objective
Transform the Product Management module into an enterprise-grade system mimicking professional workspaces like Shopify and Amazon Seller Central.
### Changes
- Replaced the product listing page's tab design with Metric Summary Cards (Total, Active, Draft, Out of Stock, Low Stock).
- Upgraded the data table to support bulk selection, bulk actions, and pagination.
- Expanded table columns to include precise metrics: Product Image, SKU, Brand, Category, MOQ, Unit Price, GST, Stock, Status, and Last Updated.
- Re-architected `ProductForm` into a multi-step wizard (Basic Info, Pricing, Inventory & Shipping, Images, Review & Publish).
- Added missing fields to the schema and forms: `Weight`, `Dimensions`, `Manufacturer Name`.
- Added Brand and Stock filtering alongside a new Sort By mechanism.
- Handled empty states with beautiful placeholder illustrations and actionable prompts.
### Files Created
- None
### Files Modified
- `src/types/supplier.ts`
- `src/data/supplierSeed.ts`
- `src/components/supplier/DataTable.tsx`
- `src/components/supplier/ProductForm.tsx`
- `src/routes/_authenticated/supplier.products.index.tsx`
- `AGENTS.md`
### Files Deleted
- None
### Database Changes
- None (Mock data structures upgraded with `weight`, `dimensions`, `manufacturerName`, and `updatedAt`).
### API Changes
- None
### UI Changes
- Complete layout overhaul of `/supplier/products` leveraging the new `DataTable` checkboxes and metrics cards.
- Replacement of long scrolling product edit forms with Wizard steps in `ProductForm.tsx`.
### Configuration / Env Changes
- None
### Breaking Changes
- None (Backwards compatible layout update).
### Dependencies
- None
### Design Decisions Made
- Chose a step-based wizard for the `ProductForm` to eliminate "form fatigue" standard in complex B2B applications.
- Created `SummaryCard` explicitly as a top-level component in `supplier.products.index.tsx` rather than extracting it globally to reduce premature abstractions.
- Pushed filtering logic strictly to the frontend for now, since this phase doesn't implement the true Supabase backend integration yet.
### Assumptions Taken
- It's safe to process bulk actions client-side by looping over existing state functions for the mock UI phase.
### Known Limitations Introduced
- Sorting by "bestselling" is partially mocked based on lowest stock rather than true lifetime order counts.
### Next Recommended Tasks
- Fully connect the upgraded Product schemas and views to actual Supabase database schemas and TanStack Query mutations.

## 2026-07-14 ? Seller Order Management Phase
### Objective
Transform the Orders module into a professional B2B Order Management System and introduce Buyers and RFQs logic.
### Changes
- Updated `SupplierOrder` schema to handle a full lifecycle (`packing`, `ready`, `shipped`, `delivered`, etc.) and `expectedDelivery`.
- Updated `SupplierCustomer` schema to add enterprise fields (`gstNumber`, `address`, `ownerName`, `phone`, `email`).
- Created `SupplierRFQ` schema and mock data logic inside `useSupplierRfqs`.
- Overhauled `/supplier/orders` with Top Summary Cards, bulk actions, and deep filtering.
- Created `/supplier/orders/$id` for a dedicated Order Details view, featuring an interactive visual timeline and Retailer Info sidebar.
- Overhauled `/supplier/customers` into a proper Buyers directory with GST and lifetime value metrics.
- Created `/supplier/customers/$id` for a dedicated Buyer Profile view (Insights, Order History, contact methods).
- Created `/supplier/rfqs` for Quotations listing.
- Created `/supplier/rfqs/$id` for Quote Details, enabling the seller to respond, negotiate, or reject bulk requests.
- Added `Buyers` and `Quotations` links to the `DashboardSidebar` for Seller workspace.
### Files Created
- `src/routes/_authenticated/supplier.orders.$id.tsx`
- `src/routes/_authenticated/supplier.customers.$id.tsx`
- `src/routes/_authenticated/supplier.rfqs.tsx`
- `src/routes/_authenticated/supplier.rfqs.$id.tsx`
### Files Modified
- `src/types/supplier.ts`
- `src/data/supplierSeed.ts`
- `src/hooks/useSupplier.ts`
- `src/routes/_authenticated/supplier.orders.tsx`
- `src/routes/_authenticated/supplier.customers.tsx`
- `src/components/dashboard/DashboardSidebar.tsx`
- `AGENTS.md`
### Files Deleted
- None
### Database Changes
- None (Mock types and seed data updated with extended schemas).
### API Changes
- None
### UI Changes
- Complete layout overhaul of orders and customers pages. Introduced dedicated Details/Profile pages for Orders, Customers, and RFQs, replacing basic slide-outs.
### Configuration / Env Changes
- None
### Breaking Changes
- None (Routing preserved for `/supplier/orders` and `/supplier/customers`).
### Dependencies
- None
### Design Decisions Made
- Reused `DataTable` to ensure consistent enterprise aesthetic.
- Stored mock statuses directly into `useSupplier` memory for real-time UI interactions across the session.
- Maintained existing route paths (`/supplier/customers`) but visually renamed the feature to "Buyers" in the UI to match domain language.
### Assumptions Taken
- It's safe to run bulk updates locally.
### Known Limitations Introduced
- RFQ negotiation is purely client-side state for now.
### Next Recommended Tasks
- Fully implement real backend integration for Orders, Buyers, and RFQs via Supabase.

## 2026-07-14 ? Inventory & Dispatch Management Phase
### Objective
Transform the Inventory and Dispatch modules into professional, enterprise-grade systems mimicking top-tier B2B seller tools.
### Changes
- Updated `SupplierProduct` to include `reorderLevel` for low stock alerts.
- Updated `StockMovement` to track `damaged` stock.
- Updated `SupplierOrder` to support extensive logistics fields (`porterName`, `porterContact`, `pickupTime`, `vehicleDetails`).
- Overhauled `supplier.inventory.tsx`: Built out metric summary cards (Total Inventory, Inventory Value, etc.). Replaced the basic table with an advanced Data Table displaying reorder levels. Created a dedicated Low Stock Alerts tab. Designed an integrated Warehouse Management tab. Enhanced Stock Movement timeline UI.
- Overhauled `supplier.dispatch.tsx`: Re-architected as a Logistics workspace. Replaced the generic table with specialized logistics columns. Created a Logistics Workflow Dialog allowing sellers to Assign Porters and track detailed shipment timelines visually.
### Files Created
- None
### Files Modified
- `src/types/supplier.ts`
- `src/data/supplierSeed.ts`
- `src/hooks/useSupplier.ts`
- `src/routes/_authenticated/supplier.inventory.tsx`
- `src/routes/_authenticated/supplier.dispatch.tsx`
- `AGENTS.md`
### Files Deleted
- None
### Database Changes
- None (Mock models updated with logistics fields).
### API Changes
- Expanded `updateStatus` in `useSupplierOrders` to accept an optional logistics payload.
### UI Changes
- Deep layout and functionality upgrades for Inventory and Dispatch using `Tabs`, `SectionCard`, and `DataTable`. Complete removal of basic layouts in favor of data-dense, actionable dashboards.
### Configuration / Env Changes
- None
### Breaking Changes
- None (Backwards compatible logic).
### Dependencies
- None
### Design Decisions Made
- Used Tabs within the existing routes rather than creating multiple new sub-routes to keep the Seller workflow clean and centralized.
- Designed Porter Assignment as an interactive dialog rather than forcing a full page redirect.
### Assumptions Taken
- It's safe to use client-side state for mock porter assignments.
### Known Limitations Introduced
- "Batch Print" and "Scan Parcel" are currently UI-only placeholders.
### Next Recommended Tasks
- Integrate these advanced workflows with the Supabase database.

## 2026-07-14 ? Bug Fix: Missing TrendingUp Import
### Objective
Fix the "TrendingUp is not defined" error when accessing the Seller Product Management page.
### Changes
- Added missing `TrendingUp` import from `lucide-react` in `supplier.products.index.tsx`.
### Files Modified
- `src/routes/_authenticated/supplier.products.index.tsx`
- `AGENTS.md`
# #   2 0 2 6 - 0 7 - 1 4   ? ? 
   P r o d u c t i o n   M a r k e t p l a c e   T r a n s f o r m a t i o n   P h a s e 
 
 
 
 # # #   F e a t u r e / T a s k   N a m e 
 
 P r o d u c t i o n   M a r k e t p l a c e   T r a n s f o r m a t i o n   ( A n a l y t i c s ,   P a y m e n t s ,   R e p o r t s ,   D a t a ) 
 
 
 
 # # #   W h y   t h e   c h a n g e   w a s   m a d e 
 
 T o   t r a n s f o r m   V y a p a r S e t u   f r o m   a   d e m o n s t r a t i o n   s t a t e   i n t o   a   h i g h l y   r e a l i s t i c   p r o d u c t i o n   B 2 B   p l a t f o r m ,   f o c u s i n g   o n   A n a l y t i c s ,   P a y m e n t s ,   R e p o r t s ,   a n d   a   m a s s i v e l y   e x p a n d e d   r e a l i s t i c   p r o d u c t   c a t a l o g . 
 
 
 
 # # #   F i l e s   C r e a t e d 
 
 -   ` s c r a t c h / g e n e r a t e _ c a t a l o g . j s `   ( S c r i p t   t o   g e n e r a t e   r e a l i s t i c   p r o d u c t s ) 
 
 -   ` s r c / r o u t e s / _ a u t h e n t i c a t e d / s u p p l i e r . r e p o r t s . t s x `   ( N e w   R e p o r t s   m o d u l e ) 
 
 
 
 # # #   F i l e s   M o d i f i e d 
 
 -   ` s r c / d a t a / p r o d u c t s . t s `   ( R e p l a c e d   p l a c e h o l d e r   d a t a   w i t h   2 0 0 +   g e n e r a t e d   r e a l i s t i c   p r o d u c t s ) 
 
 -   ` s r c / d a t a / s u p p l i e r S e e d . t s `   ( E x p a n d e d   m o c k   b u y e r   d a t a   a n d   u p d a t e d   n a m e s ) 
 
 -   ` s r c / h o o k s / u s e S u p p l i e r . t s `   ( U p d a t e d   s e e d   o r d e r s   t o   u s e   r e a l i s t i c   c u s t o m e r   n a m e s ) 
 
 -   ` s r c / r o u t e s / _ a u t h e n t i c a t e d / s u p p l i e r . a n a l y t i c s . t s x `   ( C o m p l e t e   o v e r h a u l   o f   c h a r t s   a n d   m e t r i c s ) 
 
 -   ` s r c / r o u t e s / _ a u t h e n t i c a t e d / s u p p l i e r . p a y m e n t s . t s x `   ( C o m p l e t e   o v e r h a u l   w i t h   r e a l i s t i c   m e t r i c s   a n d   t r a n s a c t i o n   t a b l e ) 
 
 -   ` s r c / c o m p o n e n t s / d a s h b o a r d / D a s h b o a r d S i d e b a r . t s x `   ( A d d e d   A n a l y t i c s   a n d   R e p o r t s   l i n k s   t o   t h e   S e l l e r   s i d e b a r ) 
 
 -   ` A G E N T S . m d `   ( A d d e d   t h i s   c h a n g e l o g ) 
 
 
 
 # # #   F i l e s   D e l e t e d 
 
 -   N o n e 
 
 
 
 # # #   D a t a b a s e   C h a n g e s 
 
 -   N o n e   ( M o c k   d a t a   l a y e r   w a s   e x p a n d e d   m a s s i v e l y ) . 
 
 
 
 # # #   A P I   C h a n g e s 
 
 -   N o n e 
 
 
 
 # # #   U I   C h a n g e s 
 
 -   * * P a y m e n t s : * *   I n t r o d u c e d   a   n e w   p r o f e s s i o n a l   s u m m a r y   c a r d   l a y o u t   a n d   a   d e t a i l e d   t r a n s a c t i o n   t a b l e   w i t h   e x p o r t   a c t i o n s . 
 
 -   * * A n a l y t i c s : * *   R e p l a c e d   b a s i c   c h a r t s   w i t h   a d v a n c e d   R e c h a r t s   c o m p o n e n t s   ( A r e a C h a r t   f o r   g r o w t h ,   B a r C h a r t   f o r   m o n t h l y   r e v e n u e ,   P i e C h a r t   f o r   c a t e g o r y   s h a r e ) . 
 
 -   * * R e p o r t s : * *   C r e a t e d   a   n e w   R e p o r t s   p a g e   w i t h   e x p o r t   b u t t o n s   f o r   S a l e s ,   I n v e n t o r y ,   G S T ,   R e v e n u e ,   a n d   O r d e r s . 
 
 -   * * D a s h b o a r d   S i d e b a r : * *   A d d e d   A n a l y t i c s   a n d   R e p o r t s   t o   t h e   S e l l e r   n a v i g a t i o n   m e n u . 
 
 
 
 # # #   C o n f i g u r a t i o n   /   E n v   C h a n g e s 
 
 -   N o n e 
 
 
 
 # # #   B r e a k i n g   C h a n g e s 
 
 -   N o n e 
 
 
 
 # # #   D e p e n d e n c i e s 
 
 -   N o n e   ( U s e d   e x i s t i n g   ` r e c h a r t s `   a n d   ` l u c i d e - r e a c t ` ) . 
 
 
 
 # # #   D e s i g n   D e c i s i o n s   M a d e 
 
 -   W r o t e   a   N o d e   s c r i p t   ( ` g e n e r a t e _ c a t a l o g . j s ` )   t o   p r o c e d u r a l l y   c o n s t r u c t   t h e   p r o d u c t   c a t a l o g   d a t a   i n s t e a d   o f   t y p i n g   m a n u a l l y ,   g u a r a n t e e i n g   r e a l i s t i c   m o c k   d a t a   a n d   p r o p e r   U n s p l a s h   i m a g e r y   a t   s c a l e . 
 
 -   A u d i t e d   ` P r o d u c t C a r d . t s x `   a n d   d e t e r m i n e d   i t s   e x i s t i n g   U I   f u l l y   m e t   t h e   n e w   r e q u i r e m e n t s   ( o f f e r i n g   F r a m e r   M o t i o n   a n i m a t i o n s ,   %   O F F   t a g s ,   G S T   t a g s ,   e t c . ) ,   s a v i n g   t i m e   b y   r e u s i n g   t h e   c o m p o n e n t   a s - i s . 
 
 
 
 # # #   A s s u m p t i o n s   T a k e n 
 
 -   I t ' s   s a f e   t o   o v e r w r i t e   ` p r o d u c t s . t s `   s i n c e   t h e   o l d   d a t a   w a s   m o s t l y   p l a c e h o l d e r s ,   a n d   t h e   n e w   d a t a   i n c l u d e s   a l l   r e q u e s t e d   c a t e g o r i e s   a n d   m a n u f a c t u r e r s . 
 
 
 
 # # #   K n o w n   L i m i t a t i o n s   I n t r o d u c e d 
 
 -   " E x p o r t "   f u n c t i o n a l i t y   o n   P a y m e n t s   a n d   R e p o r t s   i s   c u r r e n t l y   U I - o n l y   ( d i s p l a y s   a   t o a s t )   u n t i l   t h e   a c t u a l   b a c k e n d   P D F / C S V   g e n e r a t i o n   l o g i c   i s   w i r e d   u p . 
 
 
 
 # # #   N e x t   R e c o m m e n d e d   T a s k s 
 
 -   F u l l y   c o n n e c t   P a y m e n t s ,   A n a l y t i c s ,   a n d   R e p o r t s   t o   a   l i v e   S u p a b a s e   b a c k e n d . 
 
 -   B u i l d   o u t   t h e   a c t u a l   P D F   a n d   C S V   e x p o r t   g e n e r a t i o n   l o g i c . 
 
 ## 2026-07-14 ? Final UI Polish, Business Intelligence & UX Enhancements

### Feature/Task Name
Final UX Polish (Notifications, AI Insights, Messages, Search)

### Why the change was made
To achieve Udaan/Shopify level of production polish, providing contextual Business Intelligence, advanced search workflows, and seamless buyer-seller communication channels.

### Files Created
- `src/components/layout/NotificationsMenu.tsx` (Global dropdown for alerts)
- `src/routes/_authenticated/messages.tsx` (B2B negotiation chat interface)
- `scratch/agents_update_2.md`

### Files Modified
- `src/components/layout/Header.tsx` (Integrated NotificationsMenu)
- `src/components/search/SearchDialog.tsx` (Added robust Categorized Search for Brands, Categories, and Products)
- `src/routes/_authenticated/buyer.dashboard.tsx` (Added AI Restock & Trending Insights)
- `src/routes/_authenticated/seller.dashboard.tsx` (Added AI Fast Moving & Low Stock Insights)
- `src/routes/_authenticated/admin.index.tsx` (Added AI GMV Growth Insights)
- `src/routes/products.$slug.tsx` (Upgraded Reviews tab with Rating header and "Write Review" button)

### Files Deleted
- None

### Database Changes
- None (Mock AI Insights layer added on frontend).

### API Changes
- None

### UI Changes
- **Notifications**: Users can now click the Bell icon globally to see a real-time summary of alerts with blue unread dots.
- **Messages**: A brand-new `/messages` layout supports split-view conversation lists and chat windows with product references.
- **AI Insights**: Injecting smart UI cards across all three dashboards (Buyer, Seller, Admin) pointing users to immediate business actions (e.g., restocking soon).
- **Search**: `Cmd+K` now groups results cleanly by Categories, Brands, and Products.
- **Reviews**: Product details now show a massive 4.5 overall rating badge with a clear CTA to write reviews.

### Configuration / Env Changes
- None

### Breaking Changes
- None

### Dependencies
- None

### Design Decisions Made
- For AI Insights, we chose **not** to build backend inference models (as requested), but rather display highly contextual UI cards using `lucide-react` icons and the existing `bg-brand-soft/20` theme tokens to make the platform *feel* intelligent and responsive.
- Used the `CommandGroup` feature of shadcn/ui to split search results, drastically improving scanability for B2B users.

### Assumptions Taken
- Mock data in `/messages` is sufficient for the final presentation phase to demonstrate the intended B2B negotiation flow.

### Known Limitations Introduced
- The "Write a Review" and "Send Message" buttons currently show toast notifications rather than writing to the database.

### Next Recommended Tasks
- Fully wire up the Postgres database for real-time WebSockets messaging.
## 2026-07-14 ? Phase 5: Production Database Migration Planning

### Objective
Transition VyaparSetu from a mock-data prototype to a real-time, production-ready B2B marketplace using Supabase.

### Changes
- Audited all existing mock data stores (`src/data/`, `src/hooks/useSupplier.ts`).
- Created a comprehensive `production_schema.sql` migration containing schemas for `orders`, `order_items`, `inventory_movements`, `payments`, `notifications`, `messages`, and `reviews`.
- Created robust Row Level Security (RLS) policies to isolate Buyer and Seller data.
- Enabled Supabase Realtime subscriptions in the schema via publication adjustments.
- Manually injected the new table definitions into `src/integrations/supabase/types.ts` to ensure type safety.
- Created `implementation_plan.md` to map out the frontend React Query migration strategy.

### Next Recommended Tasks
- **Execute SQL**: The user must run `scratch/production_schema.sql` in their Supabase dashboard.
- **Migrate Orders Module**: Refactor `useSupplierOrders` to use `@tanstack/react-query` and `@supabase/supabase-js`.
- **Migrate Inventory Module**: Move stock adjustments to rely on `inventory_movements` rather than client-side `localStorage`.
- **Real-time Wiring**: Add `supabase.channel('public:orders').on('postgres_changes', ...)` to the Seller Dashboard.

## 2026-07-16 ? Seller-owned products & seller Orders (DB-scoped)

### Feature/Task Name
Per-seller product ownership table and buyer-order visibility limited to that seller?s SKUs.

### Why the change was made
Sellers must only manage products they created, and Seller Orders must show only buyer order lines for those products ? not mock/shared catalog data.

### Files Created
- `supabase/migrations/20260716010000_seller_products_and_order_seller.sql`

### Files Modified
- `src/hooks/useSupplier.ts` ? `useSupplierProducts` / `useSupplierOrders` query Supabase by seller id; stock adjust scoped
- `src/hooks/useOrders.ts` ? checkout stamps `order_items.seller_id` from `products.seller_id`
- `src/lib/supplierProductMap.ts` ? inserts set `seller_id`
- `src/integrations/supabase/types.ts` ? `seller_products`, `seller_id` on products/order_items
- `AGENTS.md`

### Database Changes
- `products.seller_id` ? `sellers(id)`
- Table `seller_products` (seller_id + product_id) with RLS
- `order_items.seller_id` + seller SELECT/UPDATE RLS on orders/order_items
- Trigger `trg_order_items_set_seller_id` auto-fills seller from product owner

### API Changes
- None (Supabase client queries)

### UI Changes
- Seller Products / Orders screens now bind to live seller-scoped data (empty until migration + real creates/orders)

### Configuration / Env Changes
- None

### Breaking Changes
- Mock localStorage supplier orders (`vs.supplier.orders.v1`) no longer used

### Known Limitations Introduced
- Migration must be run in the Lovable/Supabase SQL editor for project `juoufayfyzpmscxeiydd` (MCP apply may lack permission)
- Seed/catalog products without `seller_id` will not appear in any seller Orders until claimed/owned

### Next Recommended Tasks
- Apply `supabase/migrations/20260716010000_seller_products_and_order_seller.sql` in Supabase SQL Editor
- Smoke-test: seller create product ? buyer order ? only that seller sees the line in Orders
- Migrate remaining seller modules (inventory movements, customers) off localStorage

## 2026-07-16 ? Backfill catalog to ugadiharshavardhan@gmail.com seller

### Feature/Task Name
Assign all existing DB products to primary seller account and show in Seller Products.

### Why the change was made
65 catalog products existed without seller ownership; seller `ugadiharshavardhan@gmail.com` should see and manage all of them.

### Files Created
- `supabase/migrations/20260716130000_assign_catalog_to_primary_seller.sql`
- `scripts/backfill-seller-products.mjs`
- `scripts/apply-seller-migration-and-backfill.mjs`

### Files Modified
- `src/hooks/useSupplier.ts` ? fetch/update/delete by `products.seller_id` or `supplier->>id` fallback
- `AGENTS.md`

### Database Changes
- Backfilled `products.supplier.id` = `0f96cf1c-0664-48d6-8c42-4e16c2d43648` for all 65 products (via service role script)
- SQL migration ready for `seller_id` + `seller_products` when run in Supabase SQL Editor

### Known Limitations Introduced
- `products.seller_id` / `seller_products` / `order_items.seller_id` columns not yet applied remotely; seller orders still need schema migration

## 2026-07-16 ? Remove legacy profiles table (sellers/buyers only)

### Feature/Task Name
Stop writing new sellers to `public.profiles`; drop table and fix signup trigger.

### Why the change was made
Remote DB still had `handle_new_user()` inserting into `profiles` on every auth signup, duplicating data instead of using `sellers` / `buyers` only.

### Files Created
- `supabase/migrations/20260716140000_remove_profiles_table.sql`
- `scratch/REMOVE_PROFILES_TABLE.sql`

### Files Modified
- `src/server/authOtpHandler.ts` ? delete legacy `profiles` row after seller/buyer upsert
- `src/lib/accountMembership.ts` ? same cleanup helper
- `AGENTS.md`

### Database Changes (must run SQL in Supabase editor)
- Replace `handle_new_user()` ? inserts `sellers` or `buyers` only
- Migrate remaining `profiles` data ? `sellers` / `buyers`
- `DROP TABLE public.profiles`

### Next Recommended Tasks
- Run `scratch/REMOVE_PROFILES_TABLE.sql` in Supabase SQL Editor
- Register a new seller and confirm row appears in `sellers` only

## 2026-07-16 ? Order stock decrement & seller stock UX

### Feature/Task Name
Sync available stock with buyer orders; seller stock compare/set; full stock bar; redirect after product save.

### Why the change was made
Buyer checkout did not reduce inventory; stock bar used a hard max of 200 (looked incomplete); edit-product save stayed on the form instead of returning to the products list.

### Files Created
- `supabase/migrations/20260716150000_order_stock_decrement.sql`

### Files Modified
- `src/hooks/useOrders.ts` ? invalidate catalog/seller product queries after place/cancel
- `src/hooks/useSupplier.ts` ? stock update compares DB `stock_count`; inventory `setStock` helper
- `src/routes/_authenticated/supplier.products.$id.tsx` ? navigate to `/supplier/products` after save
- `src/routes/_authenticated/supplier.products.index.tsx` ? available-stock bar full when stock > 0
- `src/routes/_authenticated/supplier.inventory.tsx` ? adjustment mode sets new stock vs current
- `AGENTS.md`

### Database Changes
- Trigger `trg_order_items_apply_stock`: AFTER INSERT on `order_items` decrements `products.stock_count` (SECURITY DEFINER)
- Trigger `trg_orders_restore_stock_on_cancel`: restores stock when order status ? cancelled

### Next Recommended Tasks
- Smoke-test: place buyer order ? seller products stock drops; cancel order ? stock restores
- Smoke-test: Save changes on edit product ? lands on `/supplier/products`

## 2026-07-16 ? Fix seller onboarding redirect trap

### Why
All sellers had `onboarding_completed = false`, so authenticated routes redirected to `/onboarding` instead of the seller dashboard.

### Changes
- Migration `20260716160000_mark_sellers_onboarding_complete.sql`
- `src/routes/_authenticated/route.tsx` ? established sellers (business name / GST) skip the gate

## 2026-07-17 — Fix Product List State Preservation After Edit/Create/Delete

### Why
After editing, creating, or deleting a product, the seller was navigated to `/supplier/products` with no search params, resetting all filters, pagination, sort order, search text, and scroll position.

### Root Cause
`supplier.products.$id.tsx` and `supplier.products.new.tsx` both called `navigate({ to: "/supplier/products" })` without passing the current URL search params. This overwrote the URL state that the list page relies on for filters/pagination/sort.

### Changes
- `src/routes/_authenticated/supplier.products.$id.tsx` — Added `goBackToList()` helper that reads saved search state from sessionStorage and navigates with those params, preserving filters, pagination, sort, and search. Fallback to `router.history.back()` or plain navigate.
- `src/routes/_authenticated/supplier.products.new.tsx` — Same `goBackToList()` pattern applied.
- `src/routes/_authenticated/supplier.products.index.tsx` — Added `useRef` guards to prevent double-firing of sessionStorage restore and scroll position restore effects. Improved `hasParamsInUrl` condition to properly handle optional/default values. Added `hasSavedState` check to avoid unnecessary navigate calls.

### No Backend Changes
This was a pure frontend fix. No Supabase, database, or API changes were needed.

## 2026-07-17 — Premium UI Polish for Seller Dashboard Sidebar

### Why
Modernize the seller sidebar to match the premium design language of the polished Product Management page and other dashboard components.

### Changes
- `src/components/dashboard/DashboardSidebar.tsx` — Added `cn` utility import. Refined `renderItems` with larger hit targets (h-9), brand-colored active state with inset left accent indicator (`shadow-[inset_3px_0_0_0_var(--color-brand)]`), improved icon-to-text gap (gap-3), conditional icon color transitions, refined typography (13px, semibold active vs medium inactive, tight tracking). Section group labels now use 10px uppercase with 0.08em letter-spacing and 40% opacity for maximum subtlety. Header and footer borders softened to 60% opacity with adjusted padding. Logo link has hover state. Sign-out button uses destructive hover color. Badge count uses tabular-nums and shadow-sm.

### No Backend Changes
UI-only. No navigation logic, routes, permissions, Supabase, or backend changes.

## 2026-07-17 — Polish Product Edit Wizard, Fix Back Navigation, and Improve Product List Container UI

### Why
Enhance the Product edit/new wizard UI with a modern stepper design and smooth connector transitions, fix the non-functional/disabled back button when on step 0, and fix visual overlap / double borders between Search & Filters and Products Table.

### Changes
- `src/components/supplier/ProductForm.tsx` — Redesigned step indicator: custom step circle states (completed, current, upcoming) using Check icon, thin absolute horizontal connector line centered at `top-[18px]` with smooth width transition (`duration-300 ease-in-out`), and properly aligned label typography. Added `onCancel` callback prop; updated back button on step 0 to invoke `onCancel` instead of being disabled. Allowed navigation clicking on previously completed steps.
- `src/routes/_authenticated/supplier.products.$id.tsx` — Passed `onCancel={goBackToList}` to ProductForm to ensure clicking "Back" on step 0 returns to the product list with full browsing context (filters, pagination, sort, search, scroll position).
- `src/routes/_authenticated/supplier.products.new.tsx` — Passed `onCancel={goBackToList}` to ProductForm.
- `src/components/supplier/DataTable.tsx` — Added optional `embedded` boolean prop. When `embedded={true}`, it hides the outer card border, background, and shadow, preventing double borders and nested curves inside other card wrappers. Rounds the bottom corners of the pagination footer to visually match the parent container.
- `src/routes/_authenticated/supplier.products.index.tsx` — Passed `embedded={true}` to the DataTable rendering to integrate it seamlessly into the main outer card container.

### No Backend Changes
All fixes are implemented on the frontend. Existing business rules, API queries, database schema, and server endpoints are untouched.

## 2026-07-17 — Dynamic and Premium Seller Payments Page

### Why
Remove all hardcoded mock figures and offsets from the Payments & Settlements page, connect stats and transaction tables to live Supabase data, and improve the UI styling (spacing, hover effects, page padding, nested card double-borders) to look high-end and premium.

### Changes
- `src/types/supplier.ts` — Added optional `gstRate?: number` and `gstIncluded?: boolean` to the `SupplierOrder` type.
- `src/hooks/useSupplier.ts` — Updated `fetchSellerOrders` to read `gstRate` and `gstIncluded` from the order item's `product_snapshot` JSON and pass them into the mapped `SupplierOrder`.
- `src/components/dashboard/StatCard.tsx` — Upgraded stat cards globally: adjusted height to `h-9` for the icon container, added smooth hover translations (`hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.06)] hover:border-border/80`), refined border radius, and polished font weights/margins. Added `"default"` tone.
- `src/routes/_authenticated/supplier.payments.tsx` — Completely decoupled from mock stats. Dynamic calculations computed straight from the seller's active orders:
  - *Total Revenue*: sum of valid order line amounts.
  - *Pending Payments*: sum of valid orders awaiting settlement (`paymentStatus === "pending"`).
  - *Released Payments*: `totalRevenue - pendingPayments`.
  - *GST Collected*: dynamically computed for each line based on inclusive/exclusive settings (`gstIncluded` vs `gstRate`).
  - *Next Settlement*: set to the pending payments amount.
  - *Transaction History*: populated with real order lines and their exact GST amounts. Added `embedded={true}` to `DataTable` to prevent card-nesting double borders. Added premium loading skeleton loaders, a custom styled empty state, and an error boundary with reload capability. Refined `DataTable` to show a clean borderless layout for the empty state when `embedded` is true, avoiding double nested dashed borders.


### Backend & Database Changes
- Created a PostgreSQL migration `supabase/migrations/20260717000000_fix_orders_rls_recursion.sql` to resolve an infinite recursion loop in Supabase Row-Level Security (RLS) policies.
- The loop occurred because the select/update RLS policies on `orders` and `order_items` (and the helper `seller_orders` table policies) queried each other directly.
- Added `SECURITY DEFINER` helper functions `public.buyer_owns_order(order_id, user_id)` and `public.seller_owns_order_item(order_id, seller_id)`, and `public.seller_owns_seller_order(order_id, seller_id)`. These functions run with postgres bypass privileges, preventing recursive RLS execution.
- Updated `orders`, `order_items`, and `seller_orders` RLS policies to use these helper functions, breaking the loops.
- Created `scripts/apply-fix-orders-rls.mjs` to connect to pooler port `6543` and execute the migration SQL.
- Verified that authenticated queries now execute successfully without errors.

## 2026-07-17 - Premium Seller Workspace Header

### Why
The shared `DashboardTopbar` showed buyer-oriented elements (marketplace search bar, cart icon) on seller routes, making the seller workspace feel like a storefront rather than a professional dashboard.

### Changes
- `src/components/dashboard/DashboardTopbar.tsx` — Split into two rendering paths: the original buyer topbar (unchanged) and a new `SellerTopbar` component. The seller header removes marketplace search and cart, adds a workspace title derived from `business_name` with a subtle "Seller" badge, vertical dividers between sections, and improved spacing/padding matching the polished seller design system.
- `src/components/layout/UserMenu.tsx` — Wrapped the "Cart" dropdown menu item with `!isSeller` so sellers don't see cart in their profile menu (matching the existing "Saved items" pattern).

### Design
- Workspace title shows business name (up to 3 words) + a subtle brand-colored "Seller" pill
- Thin vertical dividers separate sidebar trigger, workspace title, and right-side actions
- Improved horizontal padding (px-5 on sm+) for better breathing room
- All changes scoped to `/seller/*` and `/supplier/*` routes only
- Buyer/Admin topbars remain completely unchanged

## 2026-07-17 - Logo Subtitle Clipping Fix in Sidebar

### Why
The Logo's "B2B Marketplace" subtitle text was wrapping and getting clipped at the sidebar border on screens larger than `sm` due to limited horizontal workspace width in the sidebar container.

### Changes
- `src/components/common/Logo.tsx` — Added a `hideSubtitle?: boolean` prop that conditionally omits the "B2B Marketplace" text.
- `src/components/dashboard/DashboardSidebar.tsx` — Passed `hideSubtitle` to the `Logo` component when rendering the sidebar header.

## 2026-07-17 - Header Bottom Line Alignment Fix

### Why
The bottom border of the `SidebarHeader` (64px) did not align vertically with the bottom border of the topbar header (56px) because their heights were different, creating an uneven split-line appearance.

### Changes
- `src/components/dashboard/DashboardTopbar.tsx` — Changed both default and Seller topbar container heights to `h-16` (64px) so that the bottom borders of the sidebar header and topbar header are at the exact same level.

## 2026-07-17 - Verify and Fix Buyer to Seller Order Flow

### Why
1. A PL/pgSQL variable reference ambiguity error in the `buyer_owns_order` helper function caused `INSERT INTO public.order_items` queries to fail and roll back for buyers, leaving orders created with zero items.
2. The `DROP FUNCTION ... CASCADE` in the previous session's migration accidentally deleted the RLS policies depending on the helper functions.
3. The `useOrders` query selected a non-existent column (`tax_total`), causing database query failures on order history list.

### Changes
- `supabase/migrations/20260717013200_fix_ambiguous_rls_variables.sql` — Prefixed input argument names of helper functions (`buyer_owns_order`, `seller_owns_order_item`, `seller_owns_seller_order`) with an underscore (`_`) to eliminate column name ambiguity, and explicitly recreated all of the cascaded RLS policies on `orders`, `order_items`, and `seller_orders` to restore security configuration.
- `src/hooks/useOrders.ts` — Updated the select columns in `useOrders` query to fetch the correct `gst_total` column instead of the non-existent `tax_total`.

## 2026-07-17 - Round Off Output Tax GST Value

### Why
The GST Collected output tax stat card displayed unrounded decimals (e.g. `₹4.71428571428572`) instead of a rounded integer value.

### Changes
- `src/lib/format.ts` — Modified `compactInr` utility function to wrap the returned value in `Math.round()` for values less than 1,000. This rounds the displayed tax to clean whole rupees.

## 2026-07-17 - Spacing & Padding Polish on Supplier Reports Page

### Why
The Business Reports grid cards had zero padding because `SectionCard` did not apply padding by default when no title or action header props were passed. This left elements glued directly to the edges of the cards.

- `src/routes/_authenticated/supplier.reports.tsx` — Added a clean `p-6` padding class to the `SectionCard` elements inside the Business Reports grid.

## 2026-07-17 - Professional Progress Stepper for Product Wizard

### Why
Improve the supplier product creation/edit wizard UX by introducing animated segmented progress lines between circles and styling step indicators following high-fidelity design standards.

- `src/components/supplier/ProductForm.tsx` — Replaced the single background line with dynamically filled progress segment elements using performant CSS `scaleX` transforms, enhanced circle states (completed checkmark, current highlighted scale-105, and light gray upcoming steps), and aligned label typography weights and spacing. Fixed CSS stacking context issues by changing line z-index to `z-0` and parent container to `relative z-0` (so lines are not hidden behind card backgrounds).
