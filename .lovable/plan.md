# VyaparSetu — Product Requirements Document (PRD)

**Product:** VyaparSetu — India's next-generation B2B wholesale marketplace
**Document type:** PRD (no code)
**Owner:** Principal Architect / PM
**Status:** Draft v1.0

---

## 1. Product Vision
To become India's most trusted digital backbone for wholesale trade — a single platform where Manufacturers, Distributors, Wholesalers, and Retailers discover, negotiate, transact, and finance bulk trade with the speed of a consumer app and the safety of an enterprise ERP.

**Tagline:** *"Vyapar ka naya setu — Trust, Trade, Growth."*

---

## 2. Business Goals
1. Onboard 100K verified businesses in 24 months across 50+ Tier-2/3 cities.
2. Achieve ₹500 Cr annualized GMV by end of Year 2.
3. Take rate of 1.5–3% per transaction + subscription revenue from premium sellers.
4. Reduce retailer procurement cost by 8–15% vs. traditional distributor chain.
5. Enable embedded credit (BNPL) on ≥30% of GMV via NBFC partnerships.
6. Achieve NPS ≥ 55 among active retailers within 12 months.

---

## 3. Target Users
- **Retailers:** Kirana stores, small format retail, HoReCa buyers, D2C resellers.
- **Wholesalers / Distributors:** Regional stockists, super-stockists, C&F agents.
- **Manufacturers:** SMEs, MSMEs, and mid-market brands seeking direct market reach.
- **Support ecosystem:** Logistics partners, NBFCs, GST/tax consultants, QC agencies.
- **Internal:** Ops, Category, Finance, KYC, Support, Admin.

---

## 4. User Personas

**P1 — Ramesh, Kirana Owner (Retailer)**
Age 38, Tier-3 town. Buys ₹2L/month stock. Pain: inconsistent distributor pricing, no credit visibility, delivery delays. Wants: transparent pricing, 15-day credit, WhatsApp-first UX.

**P2 — Priya, Regional Distributor**
Handles 300 SKUs across 4 districts. Pain: manual order books, high returns, cash-flow gaps. Wants: digital order capture, route-level analytics, faster settlements.

**P3 — Arjun, MSME Manufacturer**
Snack brand, ₹40 Cr revenue. Pain: dependent on 3 distributors, no end-retailer data. Wants: direct reach, demand insights, controlled MRP.

**P4 — Neha, Marketplace Admin**
Runs category ops. Needs KYC dashboards, dispute resolution, catalog moderation, seller performance tools.

---

## 5. User Roles & Permissions

| Role | Key Capabilities |
|---|---|
| **Retailer** | Browse, RFQ, order, pay, track, return, credit ledger, reorder |
| **Manufacturer** | List catalog, manage MOQ/tier pricing, accept/reject orders, dispatch, analytics, promotions |
| **Distributor** | Dual role (buy from mfr + sell to retailer), territory mgmt, sub-user staff accounts |
| **Admin** | KYC approval, catalog moderation, dispute resolution, payouts, commissions, fraud, CMS, analytics |
| **Support / Ops (sub-admin)** | Ticket handling, order intervention, refund initiation |
| **Finance (sub-admin)** | Payouts, credit approvals, reconciliation, TDS/GST reports |

Role model: RBAC with `user_roles` table + `has_role()` security-definer checks; multi-role users supported (e.g., distributor is buyer + seller).

---

## 6. Business Workflow (High Level)

```text
Manufacturer ──lists──▶ Catalog ──discovered by──▶ Distributor/Retailer
       ▲                                                │
       │                                                ▼
   Payout ◀── Escrow ◀── Payment ◀── Order + Invoice ──┘
       ▲                                                │
       │                                                ▼
   Analytics ◀── Fulfillment ◀── Logistics ◀── Dispatch ┘
```

Marketplace operates on a **verified-only** basis: no unverified business can transact.

---

## 7. Complete User Journey

**Retailer Journey**
Discover (ad/referral/WhatsApp) → Signup with mobile OTP → Business profile (GSTIN, PAN, shop photo) → KYC pending → Browse catalog → Add to cart / raise RFQ → Choose payment (prepaid / BNPL / credit) → Place order → Track shipment → Receive & confirm → Rate seller → Reorder → Ledger & credit management.

**Manufacturer Journey**
Signup → Company KYC (GST, PAN, CIN, bank, address proof) → Catalog upload (bulk CSV / single) → Set tiered pricing + MOQ + lead time → Receive orders → Accept/counter → Generate invoice → Dispatch (self / VS-logistics) → Payout post delivery + return window → Analytics + promotions.

**Distributor Journey**
Combined buyer + seller flows + territory mgmt + staff sub-accounts + route/beat planning.

**Admin Journey**
KYC queue → Approve/Reject with reason → Catalog moderation → Order anomaly review → Dispute mediation → Payout runs → Reports.

---

## 8. Feature List (Master)

**Discovery & Catalog**
Category tree, search (typo-tolerant, vernacular), filters, brand pages, RFQ, price-comparison, "similar SKUs", bulk-order builder, saved lists, reorder.

**Pricing & Offers**
Tiered/slab pricing, MOQ, region-based pricing, coupons, scheme discounts (e.g., 10+2 free), volume rebates, TOT (turnover-based) incentives.

**Orders**
Cart, multi-seller checkout, split shipments, partial fulfillment, order edits before dispatch, cancellations, returns, replacements.

**Payments**
UPI, netbanking, cards, wallets, RTGS/NEFT, escrow, BNPL, credit-line, invoice financing.

**Credit System**
Credit-limit assignment, dynamic scoring, repayment tracker, aging report, auto-block on default, NBCF partner integration.

**Logistics**
Aggregator integrations (Delhivery, Shiprocket, Porter), self-ship, hyperlocal, COD, POD (proof of delivery), returns pickup.

**Compliance**
GST-compliant e-invoice, e-way bill, TCS/TDS handling, HSN code mgmt, GSTR reports.

**Trust & Safety**
Verified badges, ratings/reviews, dispute center, blacklist, fraud scoring, transaction limits.

**Communication**
In-app chat (buyer↔seller), WhatsApp Business API, email, SMS, push, notification center.

**Admin & Ops**
KYC console, catalog moderation, commission engine, payout engine, CMS, banners, feature flags, audit logs.

**Analytics**
Seller dashboard (GMV, AOV, repeat rate, funnel), buyer insights, category heatmaps, cohort analysis.

**Platform**
Multilingual (EN/HI + 6 regional), mobile-first PWA, offline cart, dark mode, accessibility.

---

## 9. MVP Features (Hackathon Scope)
- Multi-role auth (Retailer / Manufacturer / Admin) with mobile OTP + email/password.
- Business registration + basic KYC upload (manual admin approval).
- Catalog: category browse, search, product detail with tiered pricing + MOQ.
- Cart + single-seller checkout.
- Order lifecycle: Placed → Accepted → Dispatched → Delivered → Completed.
- Prepaid payment (UPI/card via gateway) + simple credit-days flag (no NBFC).
- Basic seller dashboard (orders, revenue).
- Basic admin dashboard (KYC queue, orders, users).
- Notifications: in-app + email.
- Ratings & reviews (post-delivery).

---

## 10. Future Features
- BNPL / embedded credit with NBFC.
- RFQ & negotiation workflow.
- Logistics aggregator + e-way bill automation.
- WhatsApp commerce (order via WA).
- AI recommendations, demand forecasting, dynamic pricing.
- Multi-warehouse inventory, franchise/dealer network mgmt.
- ERP/Tally integrations, open API for sellers.
- Invoice discounting marketplace.
- Vernacular voice search.
- Loyalty / VyaparSetu Coins.

---

## 11. Success Metrics
- **Acquisition:** verified sellers, verified buyers, KYC approval TAT.
- **Activation:** % buyers placing first order in 7 days.
- **Engagement:** MAU, repeat-order rate, DAU/MAU.
- **Commerce:** GMV, AOV, take rate, contribution margin.
- **Credit:** BNPL adoption %, default rate, DPD 30/60/90.
- **Ops:** on-time dispatch %, delivery SLA, dispute rate, refund TAT.
- **Quality:** NPS, catalog accuracy, RTO %.

---

## 12. Functional Requirements
- Role-based signup/login with OTP; session mgmt with refresh tokens.
- Business profile with GSTIN validation (format + optional gov API).
- Product catalog with variants, HSN, GST%, MOQ, tier pricing, images.
- Search & filter with relevance ranking; category taxonomy up to 4 levels.
- Cart supports multi-seller; checkout splits into per-seller orders.
- Order state machine with immutable audit log.
- Payment gateway integration with webhook-based reconciliation.
- Credit ledger per buyer with limit, exposure, repayments.
- Notification service (in-app, email, SMS, WhatsApp, push) with templates.
- Admin console for KYC, disputes, payouts, CMS.
- Reporting: CSV/PDF export, GST-ready invoices.

---

## 13. Non-Functional Requirements
- **Performance:** P95 page < 2s on 4G; search < 400ms.
- **Availability:** 99.9% monthly uptime for core commerce.
- **Scalability:** 100K concurrent sessions, 1M SKUs, 10K orders/hour peak.
- **Security:** OWASP ASVS L2, PCI-DSS SAQ-A (via gateway tokenization), data-at-rest AES-256, TLS 1.2+.
- **Compliance:** GST, DPDP Act 2023, RBI guidelines for credit partners.
- **Observability:** centralized logging, tracing, metrics; SLO dashboards.
- **Accessibility:** WCAG 2.1 AA.
- **Localization:** i18n framework, RTL-ready.

---

## 14. Marketplace Workflow
1. Seller lists SKU → moderation → live.
2. Buyer discovers → adds to cart → checkout.
3. Order split per seller → payment authorized to escrow.
4. Seller accepts within SLA (else auto-cancel).
5. Seller invoices + dispatches → tracking updates.
6. Buyer confirms delivery → return window opens (e.g., 48h).
7. Post window → payout to seller minus commission/TDS.
8. Ratings & analytics update.

---

## 15. Order Lifecycle (State Machine)

```text
DRAFT → PLACED → SELLER_ACCEPTED → INVOICED → DISPATCHED →
   IN_TRANSIT → DELIVERED → COMPLETED
         │             │            │
         ▼             ▼            ▼
      CANCELLED    RETURN_REQ    DISPUTED
                      │             │
                      ▼             ▼
                   RETURNED      RESOLVED
```
Each transition writes to `order_events` with actor, timestamp, reason.

---

## 16. Authentication Flow
- Mobile OTP primary; email/password secondary.
- Optional social login (Google).
- JWT access + refresh; device binding for BNPL users.
- MFA (TOTP/OTP) mandatory for Manufacturer, Distributor, Admin.
- Session revocation, device list, forced logout on role/KYC change.

---

## 17. Business Registration Flow
1. Choose role.
2. Enter business name, GSTIN, PAN, address, category.
3. Upload proofs (GST cert, PAN, cancelled cheque, shop photo).
4. Add bank account for payouts (sellers).
5. Submit → status = `PENDING_KYC`.
6. Admin review → `APPROVED` / `REJECTED (reason)` / `INFO_REQUESTED`.
7. Approved users unlocked for transactions.

---

## 18. KYC Verification Flow
- **Auto checks:** GSTIN format + gov API, PAN Luhn + NSDL API, bank penny-drop.
- **Manual review:** documents, selfie/live-photo for proprietor.
- **Risk scoring:** address match, blacklists, duplicate PAN/GST.
- **Outcomes:** Approved / Rejected / Conditional (limits capped).
- **Re-KYC:** every 24 months or on flag.

---

## 19. Payment Flow
1. Buyer selects method (Prepaid / BNPL / Credit-line / COD where allowed).
2. Prepaid: gateway → escrow hold → order confirmed.
3. BNPL: NBFC underwriting → sanction → disbursed to seller escrow.
4. Post delivery + return window → payout to seller (T+2).
5. Refunds: reverse via original method within SLA.
6. Reconciliation: daily settlement report; disputed txns held.

---

## 20. Credit System Flow
- Buyer applies → NBFC KYC + bureau pull → credit limit assigned.
- Limit stored with exposure counter; each order decrements available.
- Repayment via UPI mandate / autopay; reminders D-3, D0, D+3.
- Delinquency: soft-block → hard-block → report to bureau.
- Dynamic re-scoring based on repayment + GMV behavior.

---

## 21. Notification Flow
- Event bus publishes domain events (OrderPlaced, KYCApproved, PaymentFailed…).
- Notification service maps event → template → channel(s) → user preference.
- Channels: In-app, Push, Email, SMS, WhatsApp.
- Retry with backoff; delivery receipts; user preference center; DND respect.

---

## 22. Admin Workflow
- **KYC queue:** filter, review, approve/reject with reason codes.
- **Catalog moderation:** flagged listings, prohibited items, image checks.
- **Dispute center:** SLA timers, evidence upload, resolution templates.
- **Finance:** payout runs, TDS/TCS, GSTR exports, reconciliation.
- **Growth:** banners, coupons, category promotions, featured sellers.
- **Trust:** fraud alerts, blacklist, transaction limits.
- **Audit:** every admin action logged; segregation of duties.

---

## 23. Security Requirements
- RBAC + attribute checks; roles in dedicated `user_roles` table.
- Row-Level Security on all tenant data.
- Secrets in managed vault; no keys in client.
- Encrypted PII at rest; field-level encryption for PAN/Aadhaar last-4.
- Signed webhooks (HMAC) for payment & logistics partners.
- Rate limiting, bot protection, WAF.
- Audit log immutable (append-only).
- DPDP-compliant consent + data-subject-request workflow.
- Regular VAPT; bug-bounty program post-launch.

---

## 24. Scalability Requirements
- Stateless app tier behind autoscaling edge runtime.
- Read-replica DB; caching (CDN + edge KV) for catalog & search.
- Search via dedicated engine (typo-tolerant, faceted).
- Event-driven async processing (queues) for orders, notifications, payouts.
- Multi-region asset CDN; India-primary data residency.
- Horizontal shardability of catalog & orders by seller_id / region.
- Feature flags for gradual rollout.

---

## 25. Risks & Assumptions

**Risks**
- KYC fraud / fake GSTINs → mitigate with gov APIs + manual review.
- Credit defaults → NBFC risk-sharing, dynamic limits.
- Logistics failures in Tier-3 → multi-partner + self-ship fallback.
- Price wars eroding margin → subscription + value-added services.
- Regulatory shifts (RBI, DPDP, GST) → dedicated compliance owner.
- Low digital literacy → WhatsApp + vernacular + tele-onboarding.

**Assumptions**
- Sellers willing to digitize catalog with onboarding support.
- UPI + BNPL adoption continues to rise in B2B.
- Logistics partners provide reliable APIs and coverage.
- Gov APIs (GST/PAN) remain accessible with reasonable SLAs.

---

## Phased Feature Classification

### Phase 1 — Hackathon MVP
- Multi-role auth (Retailer, Manufacturer, Admin) + OTP.
- Business registration + manual KYC.
- Catalog browse/search, product detail, tiered pricing, MOQ.
- Cart + single-seller checkout.
- Order lifecycle (Placed → Delivered → Completed).
- Prepaid payments via gateway + simple credit-days flag.
- Seller dashboard (orders, revenue basics).
- Admin dashboard (KYC queue, orders, users, basic CMS).
- Ratings & reviews.
- In-app + email notifications.
- GST-compliant invoice (basic PDF).

### Phase 2 — Post MVP
- Distributor role + territory & sub-users.
- RFQ & negotiation, multi-seller checkout, split shipments.
- Automated KYC (GSTIN/PAN/penny-drop APIs).
- Logistics aggregator integration + e-way bill.
- Returns, replacements, dispute center.
- BNPL v1 with NBFC partner + credit ledger.
- WhatsApp + SMS + push notifications.
- Coupons, schemes, volume rebates.
- Vernacular UI (HI + 4 regional).
- Advanced analytics for sellers.
- Fraud scoring, blacklist, rate limiting hardening.

### Phase 3 — Enterprise Scale
- AI recommendations, demand forecasting, dynamic pricing.
- Invoice discounting marketplace, TReDS-like flows.
- Open Seller APIs, ERP/Tally/SAP connectors.
- Multi-warehouse inventory, franchise/dealer network.
- Voice search, WhatsApp full-commerce.
- Loyalty program (VyaparSetu Coins).
- International sourcing / cross-border B2B.
- Advanced risk engine + in-house NBFC co-lending stack.
- Data platform (lakehouse), self-serve BI for sellers.
- Multi-region active-active infra, 99.99% SLO tier.

---

**End of PRD v1.0** — ready for engineering breakdown, wireframes, and sprint planning.
