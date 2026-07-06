export const SITE = {
  name: "VyaparSetu",
  tagline: "India's B2B Wholesale Marketplace",
  description:
    "Source verified wholesale products at factory prices. Connect directly with manufacturers, distributors and suppliers across India.",
  email: "hello@vyaparsetu.in",
  phone: "+91 80000 00000",
  address: "Bengaluru, Karnataka, India",
  social: {
    twitter: "https://twitter.com/vyaparsetu",
    linkedin: "https://linkedin.com/company/vyaparsetu",
    instagram: "https://instagram.com/vyaparsetu",
    youtube: "https://youtube.com/@vyaparsetu",
  },
};

export const NAV_LINKS = [
  { label: "Marketplace", to: "/marketplace" },
  { label: "Categories", to: "/categories" },
  { label: "Suppliers", to: "/suppliers" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
] as const;

export const FOOTER_LINKS = {
  Company: [
    { label: "About", to: "/about" },
    { label: "Careers", to: "/about" },
    { label: "Press", to: "/about" },
    { label: "Contact", to: "/contact" },
  ],
  Marketplace: [
    { label: "Browse Products", to: "/marketplace" },
    { label: "Categories", to: "/categories" },
    { label: "Top Suppliers", to: "/suppliers" },
    { label: "Become a Seller", to: "/suppliers" },
  ],
  Resources: [
    { label: "Help Center", to: "/contact" },
    { label: "GST Guide", to: "/about" },
    { label: "Bulk Pricing", to: "/about" },
    { label: "API Docs", to: "/about" },
  ],
  Legal: [
    { label: "Privacy Policy", to: "/about" },
    { label: "Terms of Service", to: "/about" },
    { label: "Refund Policy", to: "/about" },
    { label: "Seller Policy", to: "/about" },
  ],
};

export const TRENDING_SEARCHES = [
  "Aashirvaad Atta 10kg",
  "Fortune Sunflower Oil",
  "Parle-G bulk",
  "Surf Excel 5kg",
  "Tata Salt carton",
  "Classmate notebook pack",
];
