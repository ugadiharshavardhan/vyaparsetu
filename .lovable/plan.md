# Phase 8 — Refine & Simplify Buyer & Seller Workspaces

Refinement-only phase. No new modules, no route deletions, no design-system changes. All existing routes remain reachable by URL; only sidebar visibility and page density/hierarchy change.

## 1. Sidebar simplification (`src/components/dashboard/DashboardSidebar.tsx`)

Split existing arrays into "primary" (visible) and "secondary" (hidden but routed). No route deletions.

**Buyer MAIN — visible:**
Dashboard, Marketplace, Orders, Cart, Payments *(new route)*, Profile

**Buyer — hidden (routes preserved):**
Wishlist, Suppliers, Addresses, Help, Settings

**Seller SUPPLIER — visible:**
Dashboard, Products, Orders, Inventory, Dispatch, Payments, Settings

**Seller — moved to hidden (drop the "More tools" group entirely from nav):**
Customers, Warehouse, Pricing, Promotions, Reviews, Documents, Notifications, Analytics, Support

Implementation: keep the constants but render only the primary subset. Retain badges (cart count) on visible items only.

## 2. Buyer Dashboard (`src/routes/_authenticated/dashboard.tsx`)

Reduce to a single retailer-focused layout (drop wholesaler/manufacturer branches from this file — sellers already land on `/supplier`).

- **StatCards (4):** Total Orders · Pending Deliveries · Monthly Purchases · Wholesale Savings — reuse `StatCard`.
- **Quick Actions row:** Browse Marketplace · Reorder Products · View Orders — three `Button` tiles linking to existing routes.
- **Sections:**
  - Recommended Products — reuse `ProductGrid` with 4 items from `src/data/products.ts`.
  - Recent Orders — reuse `OrderCard` list, top 3 from `useOrders`.
  - Pending Deliveries — filtered `OrderCard` list (status ∈ shipped/packed).
- Remove: marketing widgets, duplicate KPI blocks, large charts, low-value tiles.

## 3. Buyer Orders (`src/routes/_authenticated/orders.tsx` + `orders.$id.tsx`)

Tighten only — no logic changes.
- List: ensure columns Order ID · Seller · Amount · Payment Status · Order Status; row actions Track / Reorder / Download Invoice.
- Detail: verify `OrderTimeline` steps match: Placed → Accepted → Packing → Ready for Pickup → Out for Delivery → Delivered (adjust labels in `OrderTimeline.tsx` if needed).
- Improve spacing, sticky table header, add `TableSkeleton` and `EmptyState`.

## 4. Buyer Payments — new lightweight route

`src/routes/_authenticated/payments.tsx` (new; buyer-side only).
- Summary cards: Total Transactions · Outstanding Amount · Completed Payments.
- Payment History table: Order ID · Date · Amount · Method · Status (derive from `useOrders` + existing `payment_records` shape; static mock allowed if hook not present).
- Invoices column: "Download GST Invoice" button (stub — reuses existing invoice download util if present, otherwise toast "Invoice ready").
- Reuse `StatCard`, `AdminTable`/`DataTable` pattern, `Pill` for status.

## 5. Seller Dashboard (`src/routes/_authenticated/supplier.index.tsx`)

- **StatCards (5):** Today's Sales · New Orders · Pending Orders · Ready for Pickup · Revenue.
- **Quick Actions:** Add Product (`/supplier/products/new`) · Manage Inventory (`/supplier/inventory`) · Dispatch Orders (`/supplier/dispatch`).
- **Sections:** Incoming Orders table · Inventory Overview with health bars.
- **Remove:** Monthly Sales chart (analytics stays on its own page).

## 6. Seller Products (`src/routes/_authenticated/supplier.products.index.tsx`)

- Verify columns: Product · Category · MOQ · Stock · Price · Status.
- Row actions: View · Edit · Delete (with `ConfirmDialog`).
- Keep "Add Product" primary button.
- Replace/add "Bulk Upload" button rendered as disabled with `Pill tone="muted"` "Coming soon".

## 7. Seller Orders (`src/routes/_authenticated/supplier.orders.tsx`)

Columns: Order ID · Retailer · Items · Amount · Status. Actions: View · Accept · Reject · Start Packing · Ready for Pickup. Improve spacing, sticky header. No workflow change.

## 8. Seller Inventory (`src/routes/_authenticated/supplier.inventory.tsx`)

Ensure columns: Available Stock · Reserved Stock · Warehouse · Reorder Level · Inventory Health (progress bar / `Pill`). Trim extras.

## 9. Seller Dispatch (`src/routes/_authenticated/supplier.dispatch.tsx`)

Sections/columns: Ready for Pickup · Assigned Porter · Pickup Schedule · Shipment Status · Completed Deliveries. Static/mock data preserved.

## 10. Seller Payments (`src/routes/_authenticated/supplier.payments.tsx`)

Summary: Revenue · Pending Settlements · Released Payments · GST Reports (card with link). Transaction table below. Remove any advanced finance sections.

## 11. General UX pass (targeted, reusing existing primitives)

Apply across the 10 pages touched above only:
- Add `TableSkeleton` / `ProductGridSkeleton` where async loads exist.
- Add `EmptyState` where lists can be empty.
- Sticky `thead` (`sticky top-0 bg-muted/40 z-10`) on long tables.
- Simple client-side pagination (10/page) using existing `AdminTable` where already available; otherwise a lightweight footer with prev/next.
- Normalize card heights via `min-h` on StatCards row.
- Horizontal-scroll wrappers on tables for mobile (already in `DataTable` — verify).
- `sonner` toasts on Accept/Reject/Reorder/Delete confirmations.
- `ConfirmDialog` on Delete/Reject.

## Explicitly out of scope

Landing, Auth, Marketplace, Product Detail, Cart, Checkout, Admin, Onboarding, Porter, AI, Finance module, Distributor, OCR, Voice, ERP, Multi-warehouse, Advanced analytics. No DB migrations. No new npm packages.

## File change summary

**Edit:** `DashboardSidebar.tsx`, `dashboard.tsx`, `orders.tsx`, `orders.$id.tsx`, `OrderTimeline.tsx` (labels only if needed), `supplier.index.tsx`, `supplier.products.index.tsx`, `supplier.orders.tsx`, `supplier.inventory.tsx`, `supplier.dispatch.tsx`, `supplier.payments.tsx`.

**Create:** `src/routes/_authenticated/payments.tsx` (buyer payments).

No deletions.
