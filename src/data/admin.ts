// Mock admin data for the enterprise admin portal. Replace with real
// backend queries in later phases; shapes are chosen to mirror future tables.

export type AdminUserStatus = "active" | "suspended" | "pending";
export type AdminUserRole =
  | "retailer"
  | "wholesaler"
  | "manufacturer"
  | "distributor"
  | "super_admin"
  | "platform_admin"
  | "finance_admin"
  | "support_admin"
  | "content_admin"
  | "ops_admin";

export interface AdminUser {
  id: string;
  name: string;
  business: string;
  email: string;
  phone: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  gstVerified: boolean;
  state: string;
  joined: string;
  orders: number;
  gmv: number;
}

const NAMES = [
  ["Rohan Mehta", "Mehta Traders", "Maharashtra"],
  ["Ananya Sharma", "Sharma Wholesalers", "Delhi"],
  ["Vikram Iyer", "Iyer Distributions", "Karnataka"],
  ["Priya Nair", "Nair Retail", "Kerala"],
  ["Aditya Kapoor", "Kapoor Industries", "Punjab"],
  ["Neha Verma", "Verma Bazaar", "Uttar Pradesh"],
  ["Rahul Bose", "Bose Enterprises", "West Bengal"],
  ["Simran Kaur", "Kaur Textiles", "Punjab"],
  ["Arjun Reddy", "Reddy Foods", "Telangana"],
  ["Meera Pillai", "Pillai Mart", "Tamil Nadu"],
  ["Kabir Singh", "Singh & Co", "Rajasthan"],
  ["Ishita Rao", "Rao Suppliers", "Karnataka"],
  ["Devansh Gupta", "Gupta Traders", "Gujarat"],
  ["Sanya Malhotra", "Malhotra Wholesale", "Haryana"],
  ["Ayaan Khan", "Khan Distributors", "Uttar Pradesh"],
  ["Zara Patel", "Patel Retail Hub", "Gujarat"],
  ["Tanvi Joshi", "Joshi Bazaar", "Madhya Pradesh"],
  ["Yash Agarwal", "Agarwal Foods", "Rajasthan"],
  ["Aisha Sheikh", "Sheikh Textile Co", "Maharashtra"],
  ["Nikhil Chawla", "Chawla Enterprises", "Delhi"],
];

const ROLES: AdminUserRole[] = ["retailer", "wholesaler", "manufacturer", "distributor"];
const STATUS: AdminUserStatus[] = ["active", "active", "active", "pending", "suspended"];

export const adminUsers: AdminUser[] = Array.from({ length: 42 }, (_, i) => {
  const [name, business, state] = NAMES[i % NAMES.length];
  const role = ROLES[i % ROLES.length];
  return {
    id: `USR-${String(1001 + i).padStart(5, "0")}`,
    name,
    business: `${business}${i > NAMES.length - 1 ? " " + Math.ceil(i / NAMES.length) : ""}`,
    email: `${name.toLowerCase().replace(/\s/g, ".")}${i}@vyaparsetu.demo`,
    phone: `+91 9${String(800000000 + i * 137).slice(0, 9)}`,
    role,
    status: STATUS[(i * 3) % STATUS.length],
    gstVerified: i % 4 !== 0,
    state,
    joined: new Date(Date.now() - i * 86_400_000 * 4).toISOString(),
    orders: (i * 7) % 240,
    gmv: 25_000 + ((i * 15_073) % 1_240_000),
  };
});

export interface VerificationRequest {
  id: string;
  business: string;
  gst: string;
  pan: string;
  state: string;
  submitted: string;
  status: "pending" | "approved" | "rejected" | "more_info";
  documents: number;
}

export const verificationQueue: VerificationRequest[] = adminUsers.slice(0, 14).map((u, i) => ({
  id: `VRF-${String(2001 + i).padStart(5, "0")}`,
  business: u.business,
  gst: `27${String(100000 + i * 13).slice(0, 5)}A${i}Z${i}`,
  pan: `AAAPZ${String(1234 + i).padStart(4, "0")}F`,
  state: u.state,
  submitted: u.joined,
  status: (["pending", "pending", "approved", "more_info", "rejected"] as const)[i % 5],
  documents: 3 + (i % 4),
}));

export interface AdminProduct {
  id: string;
  name: string;
  category: string;
  supplier: string;
  price: number;
  moq: number;
  stock: number;
  status: "live" | "pending" | "rejected" | "archived";
  createdAt: string;
  reports: number;
}

const CATS = ["Grains & Pulses", "Textiles", "Electronics", "Home & Kitchen", "Beauty", "Packaging", "Stationery", "FMCG"];
const PRODUCT_NAMES = [
  "Basmati Rice 25kg", "Cotton Kurta Bulk", "LED Bulb 9W", "Steel Utensil Set",
  "Herbal Shampoo 1L", "Corrugated Boxes", "A4 Paper Ream", "Instant Noodles Case",
  "Turmeric Powder 5kg", "Denim Jeans Bulk", "Bluetooth Speaker", "Cast Iron Tawa",
  "Face Serum 100ml", "Bubble Wrap Roll", "Notebook Pack", "Cooking Oil 15L",
];

export const adminProducts: AdminProduct[] = Array.from({ length: 60 }, (_, i) => ({
  id: `PRD-${String(3001 + i).padStart(5, "0")}`,
  name: PRODUCT_NAMES[i % PRODUCT_NAMES.length] + (i > PRODUCT_NAMES.length ? ` v${i}` : ""),
  category: CATS[i % CATS.length],
  supplier: adminUsers[(i * 3) % adminUsers.length].business,
  price: 200 + ((i * 137) % 12000),
  moq: 5 + ((i * 3) % 45),
  stock: (i * 41) % 500,
  status: (["live", "live", "live", "pending", "pending", "rejected", "archived"] as const)[i % 7],
  createdAt: new Date(Date.now() - i * 86_400_000 * 2).toISOString(),
  reports: i % 9 === 0 ? Math.ceil(i / 10) : 0,
}));

export interface AdminOrder {
  id: string;
  buyer: string;
  supplier: string;
  amount: number;
  items: number;
  status: "pending" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled" | "refunded" | "disputed";
  payment: "paid" | "pending" | "failed" | "refunded";
  method: "upi" | "card" | "netbanking" | "wallet";
  createdAt: string;
  state: string;
}

const ORDER_STATUS = ["pending", "confirmed", "packed", "shipped", "delivered", "delivered", "cancelled", "refunded", "disputed"] as const;
const PAY_METHODS = ["upi", "card", "netbanking", "wallet"] as const;

export const adminOrders: AdminOrder[] = Array.from({ length: 80 }, (_, i) => {
  const status = ORDER_STATUS[i % ORDER_STATUS.length];
  return {
    id: `ORD-${String(9001 + i).padStart(6, "0")}`,
    buyer: adminUsers[i % adminUsers.length].business,
    supplier: adminUsers[(i * 5 + 3) % adminUsers.length].business,
    amount: 1500 + ((i * 971) % 240000),
    items: 1 + (i % 12),
    status,
    payment: status === "cancelled" ? "refunded" : status === "pending" ? "pending" : i % 11 === 0 ? "failed" : "paid",
    method: PAY_METHODS[i % PAY_METHODS.length],
    createdAt: new Date(Date.now() - i * 3_600_000 * 6).toISOString(),
    state: adminUsers[i % adminUsers.length].state,
  };
});

export interface AdminCategory {
  id: string;
  name: string;
  parent: string | null;
  products: number;
  visible: boolean;
  order: number;
}

export const adminCategories: AdminCategory[] = [
  { id: "cat-1", name: "Grains & Pulses", parent: null, products: 128, visible: true, order: 1 },
  { id: "cat-1-1", name: "Rice", parent: "cat-1", products: 42, visible: true, order: 1 },
  { id: "cat-1-2", name: "Wheat & Flour", parent: "cat-1", products: 31, visible: true, order: 2 },
  { id: "cat-2", name: "Textiles", parent: null, products: 214, visible: true, order: 2 },
  { id: "cat-2-1", name: "Cotton", parent: "cat-2", products: 98, visible: true, order: 1 },
  { id: "cat-2-2", name: "Synthetic", parent: "cat-2", products: 62, visible: true, order: 2 },
  { id: "cat-3", name: "Electronics", parent: null, products: 176, visible: true, order: 3 },
  { id: "cat-4", name: "Home & Kitchen", parent: null, products: 251, visible: true, order: 4 },
  { id: "cat-5", name: "Beauty & Personal Care", parent: null, products: 143, visible: true, order: 5 },
  { id: "cat-6", name: "Packaging", parent: null, products: 87, visible: true, order: 6 },
  { id: "cat-7", name: "Stationery", parent: null, products: 64, visible: false, order: 7 },
  { id: "cat-8", name: "FMCG", parent: null, products: 312, visible: true, order: 8 },
];

export interface AdminTicket {
  id: string;
  subject: string;
  user: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "pending" | "resolved" | "escalated";
  assignee: string | null;
  createdAt: string;
  lastReply: string;
  channel: "email" | "chat" | "phone";
}

export const adminTickets: AdminTicket[] = Array.from({ length: 22 }, (_, i) => ({
  id: `TKT-${String(4001 + i).padStart(5, "0")}`,
  subject: [
    "Order not delivered", "GST verification stuck", "Refund pending", "Bulk pricing question",
    "Unable to login", "Product listing rejected", "Payment failed but debited",
    "Change business address", "Wrong item shipped", "Coupon not applying",
  ][i % 10],
  user: adminUsers[i % adminUsers.length].business,
  priority: (["low", "medium", "high", "urgent"] as const)[i % 4],
  status: (["open", "open", "pending", "resolved", "escalated"] as const)[i % 5],
  assignee: i % 3 === 0 ? null : ["Aditi (Support)", "Rohan (Ops)", "Neha (Finance)"][i % 3],
  createdAt: new Date(Date.now() - i * 86_400_000).toISOString(),
  lastReply: new Date(Date.now() - i * 3_600_000).toISOString(),
  channel: (["email", "chat", "phone"] as const)[i % 3],
}));

export interface AdminCoupon {
  id: string;
  code: string;
  type: "percent" | "flat";
  value: number;
  minOrder: number;
  usage: number;
  cap: number;
  active: boolean;
  expiry: string;
}

export const adminCoupons: AdminCoupon[] = [
  { id: "cp1", code: "WELCOME10", type: "percent", value: 10, minOrder: 2000, usage: 1284, cap: 5000, active: true, expiry: "2026-12-31" },
  { id: "cp2", code: "FLAT500", type: "flat", value: 500, minOrder: 5000, usage: 642, cap: 2000, active: true, expiry: "2026-09-30" },
  { id: "cp3", code: "BULK15", type: "percent", value: 15, minOrder: 15000, usage: 318, cap: 1000, active: true, expiry: "2026-11-30" },
  { id: "cp4", code: "DIWALI25", type: "percent", value: 25, minOrder: 10000, usage: 0, cap: 3000, active: false, expiry: "2026-10-30" },
  { id: "cp5", code: "GST0", type: "flat", value: 1000, minOrder: 20000, usage: 71, cap: 500, active: false, expiry: "2026-07-31" },
];

export interface AdminBanner {
  id: string;
  title: string;
  placement: "homepage" | "category" | "campaign" | "popup";
  status: "live" | "scheduled" | "draft" | "expired";
  starts: string;
  ends: string;
  clicks: number;
  impressions: number;
}

export const adminBanners: AdminBanner[] = [
  { id: "bn1", title: "Diwali Wholesale Fest", placement: "homepage", status: "live", starts: "2026-10-01", ends: "2026-11-15", clicks: 12_432, impressions: 184_211 },
  { id: "bn2", title: "New Textile Season", placement: "category", status: "scheduled", starts: "2026-09-15", ends: "2026-10-30", clicks: 0, impressions: 0 },
  { id: "bn3", title: "GST Filing Reminder", placement: "popup", status: "live", starts: "2026-07-01", ends: "2026-07-31", clicks: 3_284, impressions: 42_100 },
  { id: "bn4", title: "Free Shipping Above ₹10k", placement: "campaign", status: "expired", starts: "2026-05-01", ends: "2026-06-30", clicks: 8_120, impressions: 118_243 },
  { id: "bn5", title: "Refer & Earn", placement: "homepage", status: "draft", starts: "", ends: "", clicks: 0, impressions: 0 },
];

export interface AuditLogEntry {
  id: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  ip: string;
  at: string;
}

export const auditLogs: AuditLogEntry[] = Array.from({ length: 26 }, (_, i) => ({
  id: `LOG-${String(7001 + i).padStart(5, "0")}`,
  actor: ["Rohan (Super)", "Aditi (Support)", "Neha (Finance)", "Vikram (Ops)", "Sanya (Content)"][i % 5],
  role: ["super_admin", "support_admin", "finance_admin", "ops_admin", "content_admin"][i % 5],
  action: [
    "Approved verification", "Rejected product", "Refunded order", "Deactivated user",
    "Updated coupon", "Published banner", "Modified tax rules", "Sent broadcast",
    "Escalated ticket", "Assigned role",
  ][i % 10],
  target: ["USR-01023", "PRD-03041", "ORD-009123", "VRF-02007", "CPN-DIWALI25"][i % 5],
  ip: `10.${(i * 7) % 250}.${(i * 3) % 250}.${(i * 11) % 250}`,
  at: new Date(Date.now() - i * 3_600_000 * 3).toISOString(),
}));

export interface AdminNotification {
  id: string;
  title: string;
  body: string;
  audience: "all" | "buyers" | "suppliers" | "admins";
  channel: "in_app" | "email" | "push";
  status: "draft" | "scheduled" | "sent";
  sentAt: string | null;
  reach: number;
}

export const adminBroadcasts: AdminNotification[] = [
  { id: "nb1", title: "Scheduled maintenance", body: "Platform will be offline 2am–3am IST on Sunday.", audience: "all", channel: "in_app", status: "sent", sentAt: new Date(Date.now() - 86400000).toISOString(), reach: 8_240 },
  { id: "nb2", title: "New payout policy", body: "T+2 settlements are now available for verified suppliers.", audience: "suppliers", channel: "email", status: "sent", sentAt: new Date(Date.now() - 5 * 86400000).toISOString(), reach: 1_842 },
  { id: "nb3", title: "GST invoice reminder", body: "Download your July invoices before 10th August.", audience: "buyers", channel: "in_app", status: "scheduled", sentAt: null, reach: 0 },
  { id: "nb4", title: "Diwali sale is live", body: "Up to 25% off across categories.", audience: "all", channel: "push", status: "draft", sentAt: null, reach: 0 },
];

// Analytics series
export const revenueDaily = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  revenue: 240_000 + Math.round(Math.sin(i / 3) * 80_000 + i * 5_200),
  orders: 120 + Math.round(Math.cos(i / 4) * 30 + i),
}));

export const revenueMonthly = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => ({
  month: m,
  revenue: 4_200_000 + i * 320_000 + Math.round(Math.sin(i) * 500_000),
  orders: 2_800 + i * 240,
}));

export const userGrowth = revenueMonthly.map((m, i) => ({
  month: m.month,
  buyers: 800 + i * 240 + Math.round(Math.sin(i) * 80),
  suppliers: 120 + i * 42,
}));

export const topCategories = CATS.map((c, i) => ({
  category: c,
  revenue: 800_000 + ((i * 1_331_211) % 4_800_000),
  orders: 240 + ((i * 97) % 2400),
}));

export const stateBreakdown = [
  "Maharashtra", "Delhi", "Karnataka", "Gujarat", "Tamil Nadu",
  "Uttar Pradesh", "West Bengal", "Rajasthan", "Punjab", "Telangana",
].map((state, i) => ({
  state,
  revenue: 1_200_000 + ((i * 731_211) % 4_200_000),
  orders: 320 + ((i * 71) % 1800),
  suppliers: 40 + i * 6,
}));

export const paymentFailures = Array.from({ length: 12 }, (_, i) => ({
  id: `PAY-${String(6001 + i).padStart(5, "0")}`,
  order: `ORD-${String(9001 + i * 3).padStart(6, "0")}`,
  amount: 1200 + ((i * 431) % 24000),
  method: PAY_METHODS[i % PAY_METHODS.length],
  reason: ["Insufficient funds", "OTP timeout", "Bank declined", "Session expired", "Card blocked"][i % 5],
  at: new Date(Date.now() - i * 3_600_000).toISOString(),
}));

export const refundQueue = Array.from({ length: 9 }, (_, i) => ({
  id: `RFD-${String(8001 + i).padStart(5, "0")}`,
  order: `ORD-${String(9001 + i * 5).padStart(6, "0")}`,
  buyer: adminUsers[i].business,
  amount: 800 + ((i * 971) % 42000),
  reason: ["Wrong item", "Damaged package", "Never delivered", "Duplicate charge", "Cancelled order"][i % 5],
  status: (["pending", "pending", "processing", "approved"] as const)[i % 4],
  raised: new Date(Date.now() - i * 86400000).toISOString(),
}));

export const supplierPayouts = Array.from({ length: 12 }, (_, i) => ({
  id: `PYT-${String(5001 + i).padStart(5, "0")}`,
  supplier: adminUsers[(i * 3) % adminUsers.length].business,
  gross: 42_000 + ((i * 71_211) % 480_000),
  commission: 4_200 + ((i * 7_121) % 32_000),
  net: 0,
  status: (["scheduled", "processed", "processed", "on_hold"] as const)[i % 4],
  scheduled: new Date(Date.now() + i * 86400000).toISOString(),
})).map((p) => ({ ...p, net: p.gross - p.commission }));

export const gstReports = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((m, i) => ({
  month: m,
  taxable: 4_200_000 + i * 480_000,
  cgst: 378_000 + i * 43_000,
  sgst: 378_000 + i * 43_000,
  igst: 121_000 + i * 12_000,
}));

export const adminRoles = [
  { key: "super_admin", label: "Super Admin", members: 2, description: "Full access. Can grant roles, manage billing and infrastructure." },
  { key: "platform_admin", label: "Platform Admin", members: 4, description: "Manage users, products, categories, orders and content." },
  { key: "finance_admin", label: "Finance Admin", members: 3, description: "Payments, payouts, refunds, GST and financial reports." },
  { key: "support_admin", label: "Support Admin", members: 8, description: "Tickets, live chat, FAQs and buyer/supplier assistance." },
  { key: "content_admin", label: "Content Admin", members: 3, description: "CMS pages, banners, categories and marketing content." },
  { key: "ops_admin", label: "Operations Admin", members: 5, description: "Verifications, order management, shipping and warehouse ops." },
];

export const permissionsMatrix = [
  { area: "Users", super_admin: true, platform_admin: true, finance_admin: false, support_admin: "read", content_admin: false, ops_admin: "read" },
  { area: "Verifications", super_admin: true, platform_admin: true, finance_admin: false, support_admin: false, content_admin: false, ops_admin: true },
  { area: "Products", super_admin: true, platform_admin: true, finance_admin: false, support_admin: false, content_admin: "read", ops_admin: true },
  { area: "Categories", super_admin: true, platform_admin: true, finance_admin: false, support_admin: false, content_admin: true, ops_admin: false },
  { area: "Orders", super_admin: true, platform_admin: true, finance_admin: "read", support_admin: true, content_admin: false, ops_admin: true },
  { area: "Payments", super_admin: true, platform_admin: "read", finance_admin: true, support_admin: false, content_admin: false, ops_admin: false },
  { area: "Finance", super_admin: true, platform_admin: false, finance_admin: true, support_admin: false, content_admin: false, ops_admin: false },
  { area: "Support", super_admin: true, platform_admin: "read", finance_admin: false, support_admin: true, content_admin: false, ops_admin: "read" },
  { area: "Coupons", super_admin: true, platform_admin: true, finance_admin: "read", support_admin: false, content_admin: true, ops_admin: false },
  { area: "Banners & CMS", super_admin: true, platform_admin: true, finance_admin: false, support_admin: false, content_admin: true, ops_admin: false },
  { area: "Notifications", super_admin: true, platform_admin: true, finance_admin: false, support_admin: true, content_admin: true, ops_admin: false },
  { area: "Audit Logs", super_admin: true, platform_admin: "read", finance_admin: "read", support_admin: false, content_admin: false, ops_admin: false },
  { area: "Settings", super_admin: true, platform_admin: false, finance_admin: false, support_admin: false, content_admin: false, ops_admin: false },
] as const;

export const failedLogins = Array.from({ length: 10 }, (_, i) => ({
  id: `FL-${1000 + i}`,
  email: `attacker${i}@unknown.com`,
  attempts: 3 + (i % 5),
  ip: `102.${i * 3}.${i * 7}.${i * 11}`,
  at: new Date(Date.now() - i * 3_600_000).toISOString(),
  location: ["Mumbai, IN", "Delhi, IN", "Unknown", "Bengaluru, IN", "Singapore", "Dubai"][i % 6],
}));

export const adminSessions = [
  { id: "s1", user: "Rohan (Super)", device: "Mac • Chrome", ip: "10.20.4.11", started: new Date(Date.now() - 3_600_000).toISOString(), current: true },
  { id: "s2", user: "Aditi (Support)", device: "Windows • Edge", ip: "10.20.4.22", started: new Date(Date.now() - 7_200_000).toISOString(), current: false },
  { id: "s3", user: "Neha (Finance)", device: "iPhone • Safari", ip: "10.20.4.33", started: new Date(Date.now() - 1_800_000).toISOString(), current: false },
];

export const cmsPages = [
  { id: "cms-1", slug: "about", title: "About VyaparSetu", status: "published", updated: "2026-06-14" },
  { id: "cms-2", slug: "privacy", title: "Privacy Policy", status: "published", updated: "2026-05-02" },
  { id: "cms-3", slug: "terms", title: "Terms of Service", status: "published", updated: "2026-05-02" },
  { id: "cms-4", slug: "contact", title: "Contact Us", status: "published", updated: "2026-04-18" },
  { id: "cms-5", slug: "shipping", title: "Shipping Policy", status: "draft", updated: "2026-07-01" },
  { id: "cms-6", slug: "returns", title: "Returns & Refunds", status: "published", updated: "2026-05-30" },
];

export const homepageSections = [
  { id: "hs1", title: "Hero Banner", enabled: true, order: 1 },
  { id: "hs2", title: "Trusted By", enabled: true, order: 2 },
  { id: "hs3", title: "Featured Categories", enabled: true, order: 3 },
  { id: "hs4", title: "Featured Products", enabled: true, order: 4 },
  { id: "hs5", title: "Why VyaparSetu", enabled: true, order: 5 },
  { id: "hs6", title: "How It Works", enabled: true, order: 6 },
  { id: "hs7", title: "Testimonials", enabled: true, order: 7 },
  { id: "hs8", title: "FAQ", enabled: true, order: 8 },
  { id: "hs9", title: "CTA Banner", enabled: true, order: 9 },
];
