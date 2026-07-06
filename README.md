# VyaparSetu — B2B Wholesale Marketplace

Production-grade B2B ordering platform connecting Indian retailers with verified manufacturers, distributors and wholesalers. Built on TanStack Start, React 19, Tailwind v4, shadcn/ui, and Lovable Cloud (Supabase).

## Highlights

- **Marketplace** — categories, suppliers, product detail, filters, recently viewed
- **Auth** — email/password + Google OAuth, email verification, password reset, protected routes
- **Onboarding** — multi-step business profile with document upload
- **Buyer flows** — cart with MOQ, coupons, GST-aware pricing, 4-step checkout, order history, wishlist, saved addresses
- **Supplier portal** — 16 routes: dashboard, product CRUD, inventory, warehouse, orders, pricing, promotions, reviews, analytics, business profile, notifications, settings
- **Admin portal** — user management, verification queue, product approvals, orders, coupons, reports, notifications, roles, audit, security, settings
- **Production polish** — SEO metadata, robots + sitemap, PWA manifest, JSON-LD, offline indicator, error/404 boundaries, skeleton loaders, empty states, accessibility

## Stack

| Layer | Choice |
| --- | --- |
| Framework | TanStack Start v1 (React 19, Vite 7) |
| Routing | TanStack Router (file-based, SSR) |
| Data | TanStack Query, `createServerFn` |
| Styling | Tailwind v4, shadcn/ui, Radix primitives |
| Animation | framer-motion |
| Backend | Lovable Cloud (Supabase Postgres, Auth, Storage, RLS) |
| Type-safety | TypeScript strict, Zod validation |

## Local development

```bash
bun install
bun run dev        # http://localhost:8080
bun run build      # production build
bunx tsgo --noEmit # typecheck
```

## Environment

Client-visible (`.env`):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

Server-only (Lovable Cloud secrets — never commit):

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `LOVABLE_API_KEY`

Lovable Cloud auto-provisions and injects all of the above; no manual setup required.

## Folder structure

```
src/
  routes/               file-based routes
    __root.tsx          root layout, head, providers
    _authenticated/     protected subtree (auth gate managed by integration)
    api/                server routes (webhooks, public APIs)
  components/
    common/             EmptyState, Skeletons, OfflineIndicator, badges
    layout/             SiteLayout, Header, Footer, UserMenu
    dashboard/          buyer dashboard chrome
    supplier/           supplier portal shared components
    admin/              admin portal shared components
    auth/ marketplace/ product/ cart/ checkout/ orders/ address/ onboarding/
    ui/                 shadcn primitives
  hooks/                useAuth, useProfile, useCart, useWishlist, useOrders, ...
  integrations/supabase/  auto-generated clients, types, middleware
  lib/                  commerce logic (GST, coupons, shipping), utils
  data/                 mock catalogs for marketplace and supplier seed
  types/                shared TypeScript types
supabase/migrations/    SQL migrations (auth, profiles, commerce, RLS)
public/                 favicon, robots.txt, sitemap.xml, manifest.webmanifest
```

## Data model

Tables live in the `public` schema with row-level security enabled and policies scoped to `auth.uid()`:

- `profiles`, `user_roles` (enum: `retailer | wholesaler | manufacturer | distributor | admin`)
- `wishlist_items`, `cart_items`, `shipping_addresses`
- `orders`, `order_items`, `payment_records`, `invoices`
- `coupons` (seeded with `WELCOME10`, `FLAT500`, `BULK15`)

Roles are stored in a separate `user_roles` table and checked via a `has_role(user_id, role)` `SECURITY DEFINER` function — never on `profiles`, to prevent privilege escalation.

## Auth flow

1. Sign up (email/password or Google OAuth via Lovable broker)
2. Email verification
3. Onboarding wizard → profile completion
4. Access to `_authenticated/*` routes (dashboard, cart, checkout, orders, portals)

Server functions use `requireSupabaseAuth` middleware; the bearer token is attached automatically via `functionMiddleware` in `src/start.ts`.

## Deployment

Click **Publish** in the Lovable editor. Frontend changes require an explicit publish; backend (migrations, server functions) deploys immediately.

Custom domains: Project Settings → Domains (after first publish).

## Future roadmap

- Live payment gateway (Razorpay / Stripe)
- Transactional email templates
- Advanced analytics with real-time data
- Multi-warehouse fulfilment routing
- Buyer credit / BNPL
- Native mobile apps via Capacitor

## License

Proprietary — © VyaparSetu.
