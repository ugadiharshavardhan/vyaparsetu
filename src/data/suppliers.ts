import type { Supplier } from "@/types";
import { PRODUCTS } from "./products";

type SupplierMeta = Pick<Supplier, "description" | "businessType" | "gstVerified" | "responseRate" | "established" | "categories">;

const META: Record<string, SupplierMeta> = {
  s1: {
    description: "One of Western India's largest FMCG distributors, serving 8,000+ retailers across Maharashtra and Gujarat.",
    businessType: "Distributor",
    gstVerified: true,
    responseRate: 96,
    established: 2011,
    categories: ["fmcg", "staples", "beverages"],
  },
  s2: {
    description: "North India flagship wholesaler for pantry staples and dairy. Cold-chain enabled warehousing in Delhi NCR.",
    businessType: "Wholesaler",
    gstVerified: true,
    responseRate: 98,
    established: 2007,
    categories: ["staples", "fmcg", "beverages"],
  },
  s3: {
    description: "Trusted trading house for biscuits, snacks and packaged foods. FSSAI certified warehouse in Ahmedabad.",
    businessType: "Trading Company",
    gstVerified: true,
    responseRate: 94,
    established: 2014,
    categories: ["fmcg"],
  },
  s4: {
    description: "South India distributor for HPC brands. Serves 3,500+ kirana and modern trade outlets across Tamil Nadu.",
    businessType: "Distributor",
    gstVerified: true,
    responseRate: 92,
    established: 2015,
    categories: ["cleaning", "personal-care"],
  },
  s5: {
    description: "Bengaluru-based stationery and office supplies wholesaler serving schools, colleges and corporates.",
    businessType: "Wholesaler",
    gstVerified: true,
    responseRate: 95,
    established: 2013,
    categories: ["stationery"],
  },
  s6: {
    description: "Eastern India distributor for personal care and OTC pharmaceuticals. GST-registered in West Bengal.",
    businessType: "Distributor",
    gstVerified: false,
    responseRate: 88,
    established: 2018,
    categories: ["personal-care", "medical"],
  },
  s7: {
    description: "Industrial supplies, hardware and consumer electronics wholesaler. Warehousing in Pune and Mumbai.",
    businessType: "Wholesaler",
    gstVerified: true,
    responseRate: 93,
    established: 2010,
    categories: ["industrial", "electronics", "packaging"],
  },
};

const BASE_SUPPLIERS: Record<string, Supplier> = {};
for (const p of PRODUCTS) {
  BASE_SUPPLIERS[p.supplier.id] = p.supplier;
}

export const SUPPLIERS: Supplier[] = Object.values(BASE_SUPPLIERS).map((s) => ({
  ...s,
  ...META[s.id],
  totalProducts: PRODUCTS.filter((p) => p.supplier.id === s.id).length,
}));

export function getSupplierById(id: string): Supplier | undefined {
  return SUPPLIERS.find((s) => s.id === id);
}
