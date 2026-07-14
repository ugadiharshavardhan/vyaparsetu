import type { Supplier } from "@/types";

/** Static supplier directory (product counts come from the DB products table at runtime). */
export const SUPPLIERS: Supplier[] = [
  {
    id: "s1",
    name: "Shree Distributors Pvt Ltd",
    location: "Mumbai, MH",
    verified: true,
    rating: 4.6,
    yearsActive: 8,
    description:
      "One of Western India's largest FMCG distributors, serving 8,000+ retailers across Maharashtra and Gujarat.",
    businessType: "Distributor",
    gstVerified: true,
    responseRate: 96,
    established: 2011,
    categories: ["food-fmcg", "home-kitchen"],
  },
  {
    id: "s2",
    name: "Annapurna Wholesale",
    location: "Delhi, DL",
    verified: true,
    rating: 4.8,
    yearsActive: 12,
    description:
      "North India flagship wholesaler for pantry staples and packaged foods. Cold-chain enabled warehousing in Delhi NCR.",
    businessType: "Wholesaler",
    gstVerified: true,
    responseRate: 98,
    established: 2007,
    categories: ["food-fmcg"],
  },
  {
    id: "s3",
    name: "Balaji Trading Co.",
    location: "Ahmedabad, GJ",
    verified: true,
    rating: 4.6,
    yearsActive: 8,
    description:
      "Trusted trading house for biscuits, snacks and packaged foods. FSSAI certified warehouse in Ahmedabad.",
    businessType: "Trading Company",
    gstVerified: true,
    responseRate: 94,
    established: 2014,
    categories: ["food-fmcg", "home-kitchen", "general-merchandise"],
  },
  {
    id: "s4",
    name: "Royal Enterprises",
    location: "Chennai, TN",
    verified: true,
    rating: 4.4,
    yearsActive: 6,
    description:
      "South India distributor for HPC brands. Serves 3,500+ kirana and modern trade outlets across Tamil Nadu.",
    businessType: "Distributor",
    gstVerified: true,
    responseRate: 92,
    established: 2015,
    categories: ["home-kitchen", "healthcare-pharma", "clothing-accessories", "footwear"],
  },
  {
    id: "s5",
    name: "Metro Bazaar Supplies",
    location: "Bengaluru, KA",
    verified: true,
    rating: 4.6,
    yearsActive: 8,
    description:
      "Bengaluru-based stationery and office supplies wholesaler serving schools, colleges and corporates.",
    businessType: "Wholesaler",
    gstVerified: true,
    responseRate: 95,
    established: 2013,
    categories: ["general-merchandise", "toys-baby-sports", "electronics-appliances", "clothing-accessories"],
  },
  {
    id: "s6",
    name: "Laxmi Traders",
    location: "Kolkata, WB",
    verified: false,
    rating: 4.2,
    yearsActive: 4,
    description:
      "Eastern India distributor for personal care and OTC pharmaceuticals. GST-registered in West Bengal.",
    businessType: "Distributor",
    gstVerified: false,
    responseRate: 88,
    established: 2018,
    categories: ["healthcare-pharma", "toys-baby-sports"],
  },
  {
    id: "s7",
    name: "Vedika Corp",
    location: "Pune, MH",
    verified: true,
    rating: 4.6,
    yearsActive: 8,
    description:
      "Industrial supplies, hardware and consumer electronics wholesaler. Warehousing in Pune and Mumbai.",
    businessType: "Wholesaler",
    gstVerified: true,
    responseRate: 93,
    established: 2010,
    categories: ["electronics-appliances", "electricals", "footwear", "healthcare-pharma", "toys-baby-sports"],
  },
];

export function getSupplierById(id: string): Supplier | undefined {
  return SUPPLIERS.find((s) => s.id === id);
}
