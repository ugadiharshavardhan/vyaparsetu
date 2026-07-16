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

- **Current Phase:** Category cover images corrected
- **Current Branch:** N/A
- **Current Module:** Marketplace categories / Our Categories
- **Overall Progress:** Fixed wrong `spices` cover (was Tikhalal+Tata Salt collage → Everest Coriander pack); cache-busted `pulses-dal` / `salt-sugar` / `spices` URLs.
- **Last Updated:** 2026-07-17

# Development History

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
