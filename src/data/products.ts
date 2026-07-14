import type { Product, Supplier } from "@/types";

const S = (
  id: string,
  name: string,
  location: string,
  verified = true,
  rating = 4.6,
  yearsActive = 8,
): Supplier => ({
  id,
  name,
  location,
  verified,
  rating,
  yearsActive,
});

const suppliers = {
  shree: S("s1", "Shree Distributors Pvt Ltd", "Mumbai, MH"),
  annapurna: S("s2", "Annapurna Wholesale", "Delhi, DL", true, 4.8, 12),
  balaji: S("s3", "Balaji Trading Co.", "Ahmedabad, GJ"),
  royal: S("s4", "Royal Enterprises", "Chennai, TN", true, 4.4, 6),
  metro: S("s5", "Metro Bazaar Supplies", "Bengaluru, KA"),
  laxmi: S("s6", "Laxmi Traders", "Kolkata, WB", false, 4.2, 4),
  vedika: S("s7", "Vedika Corp", "Pune, MH"),
};

const img = (q: string) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=800&q=70`;

type Seed = Omit<Product, "sku" | "images" | "highlights" | "packagingDetails" | "deliveryEstimate"> & {
  deliveryDays?: number;
};

const RAW_PRODUCTS: Seed[] = [
  // —— Food & FMCG ——
  {
    id: "p1", slug: "aashirvaad-atta-10kg", name: "Aashirvaad Shudh Chakki Atta 10kg", brand: "Aashirvaad",
    category: "food-fmcg", subCategory: "atta", image: img("photo-1509440159596-0249088772ff"),
    wholesalePrice: 420, mrp: 495, moq: 20, unit: "bag", gstIncluded: true, gstRate: 5,
    supplier: suppliers.annapurna, rating: 4.7, reviewCount: 328, inStock: true, stockCount: 1240, featured: true,
    description: "100% whole wheat atta made from finest MP wheat. Ideal for soft, fluffy rotis in bulk kitchens and retail.",
    specifications: { "Pack Size": "10 kg", Type: "Whole Wheat", Shelf: "6 months", HSN: "1101" },
    deliveryDays: 2,
  },
  {
    id: "p2", slug: "fortune-sunflower-oil-15l", name: "Fortune Sunlite Refined Sunflower Oil 15L Jar", brand: "Fortune",
    category: "food-fmcg", subCategory: "cooking-oil", image: img("photo-1474979266404-7eaacbcd87c5"),
    wholesalePrice: 1780, mrp: 2050, moq: 4, unit: "jar", gstIncluded: true, gstRate: 5,
    supplier: suppliers.shree, rating: 4.6, reviewCount: 512, inStock: true, stockCount: 320, featured: true,
    description: "Light, healthy refined sunflower oil rich in Vitamin A, D and E. Preferred by restaurants and caterers.",
    specifications: { "Pack Size": "15 L", Type: "Refined Sunflower", HSN: "1512" },
    deliveryDays: 3,
  },
  {
    id: "p3", slug: "parle-g-carton", name: "Parle-G Glucose Biscuits Family Pack Carton", brand: "Parle",
    category: "food-fmcg", subCategory: "biscuits", image: img("photo-1558961363-fa8fdf82db35"),
    wholesalePrice: 890, mrp: 1080, moq: 10, unit: "carton", gstIncluded: true, gstRate: 18,
    supplier: suppliers.balaji, rating: 4.8, reviewCount: 890, inStock: true, stockCount: 540, featured: true,
    description: "India's favourite glucose biscuit in wholesale carton packing for kirana and modern trade.",
    specifications: { Packs: "120 pcs", HSN: "1905" },
    deliveryDays: 2,
  },
  {
    id: "p4", slug: "tata-salt-1kg-carton", name: "Tata Salt Iodized 1kg Carton (26 packs)", brand: "Tata",
    category: "food-fmcg", subCategory: "salt", image: img("photo-1587049352846-4a222e784d38"),
    wholesalePrice: 520, mrp: 650, moq: 5, unit: "carton", gstIncluded: true, gstRate: 5,
    supplier: suppliers.annapurna, rating: 4.9, reviewCount: 1102, inStock: true, stockCount: 890, featured: true,
    description: "Vacuum evaporated iodized salt trusted across India. Carton of 26 x 1kg packs.",
    specifications: { Packs: "26 x 1kg", HSN: "2501" },
    deliveryDays: 2,
  },
  {
    id: "p5", slug: "india-gate-basmati-5kg", name: "India Gate Classic Basmati Rice 5kg", brand: "India Gate",
    category: "food-fmcg", subCategory: "rice", image: img("photo-1536304993881-ff6e9eefa2a6"),
    wholesalePrice: 620, mrp: 745, moq: 10, unit: "bag", gstIncluded: true, gstRate: 5,
    supplier: suppliers.shree, rating: 4.7, reviewCount: 456, inStock: true, stockCount: 670,
    description: "Aged basmati rice with long grain and rich aroma. Ideal for hotels and retail.",
    specifications: { "Pack Size": "5 kg", Grade: "Classic", HSN: "1006" },
    deliveryDays: 3,
  },
  {
    id: "p6", slug: "britannia-good-day-carton", name: "Britannia Good Day Cashew Cookies Carton", brand: "Britannia",
    category: "food-fmcg", subCategory: "biscuits", image: img("photo-1606313564200-e75d5e30476c"),
    wholesalePrice: 960, mrp: 1200, moq: 8, unit: "carton", gstIncluded: true, gstRate: 18,
    supplier: suppliers.balaji, rating: 4.5, reviewCount: 210, inStock: true, stockCount: 280,
    description: "Premium cashew cookies in wholesale carton for high-velocity biscuit aisles.",
    specifications: { Packs: "48 pcs", HSN: "1905" },
    deliveryDays: 2,
  },
  {
    id: "p8", slug: "mdh-garam-masala-100g", name: "MDH Garam Masala 100g Carton (48)", brand: "MDH",
    category: "food-fmcg", subCategory: "masalas", image: img("photo-1596040033229-a9821ebd058d"),
    wholesalePrice: 1850, mrp: 2300, moq: 4, unit: "carton", gstIncluded: true, gstRate: 5,
    supplier: suppliers.shree, rating: 4.6, reviewCount: 188, inStock: true, stockCount: 220,
    description: "Authentic garam masala blend for restaurants and grocery shelves.",
    specifications: { Packs: "48 x 100g", HSN: "0910" },
    deliveryDays: 3,
  },
  {
    id: "p9", slug: "lay-classic-carton", name: "Lay's Classic Salted Chips Carton", brand: "Lay's",
    category: "food-fmcg", subCategory: "snacks", image: img("photo-1558961363-fa8fdf82db35"),
    wholesalePrice: 1120, mrp: 1400, moq: 6, unit: "carton", gstIncluded: true, gstRate: 18,
    supplier: suppliers.balaji, rating: 4.4, reviewCount: 302, inStock: true, stockCount: 350,
    description: "High-velocity snack SKU for kirana and modern trade.",
    specifications: { Packs: "48 x 52g", HSN: "2005" },
    deliveryDays: 2,
  },
  {
    id: "p10", slug: "red-label-tea-1kg", name: "Brooke Bond Red Label Tea 1kg", brand: "Brooke Bond",
    category: "food-fmcg", subCategory: "beverages", image: img("photo-1564890369478-c89ca6d9cde9"),
    wholesalePrice: 380, mrp: 450, moq: 12, unit: "pack", gstIncluded: true, gstRate: 5,
    supplier: suppliers.royal, rating: 4.5, reviewCount: 275, inStock: true, stockCount: 560,
    description: "Strong blend tea preferred by households and tea stalls.",
    specifications: { "Pack Size": "1 kg", HSN: "0902" },
    deliveryDays: 3,
  },
  {
    id: "p11", slug: "toor-dal-1kg-carton", name: "Unpolished Toor Dal 1kg Carton (20)", brand: "Annapurna Select",
    category: "food-fmcg", subCategory: "pulses", image: img("photo-1516684669134-de6f7c473a2a"),
    wholesalePrice: 2100, mrp: 2500, moq: 5, unit: "carton", gstIncluded: true, gstRate: 5,
    supplier: suppliers.annapurna, rating: 4.3, reviewCount: 96, inStock: true, stockCount: 180,
    description: "Cleaned unpolished toor dal for bulk kitchens and retail.",
    specifications: { Packs: "20 x 1kg", HSN: "0713" },
    deliveryDays: 4,
  },
  {
    id: "p12", slug: "madhur-sugar-1kg", name: "Madhur Pure Sugar 1kg Carton (20)", brand: "Madhur",
    category: "food-fmcg", subCategory: "sugar", image: img("photo-1587049352846-4a222e784d38"),
    wholesalePrice: 980, mrp: 1100, moq: 8, unit: "carton", gstIncluded: true, gstRate: 5,
    supplier: suppliers.shree, rating: 4.4, reviewCount: 140, inStock: true, stockCount: 400,
    description: "Refined white sugar in sealed 1kg packs.",
    specifications: { Packs: "20 x 1kg", HSN: "1701" },
    deliveryDays: 3,
  },
  {
    id: "p13", slug: "maggi-noodles-carton", name: "Maggi 2-Minute Noodles Masala Carton", brand: "Maggi",
    category: "food-fmcg", subCategory: "packaged-foods", image: img("photo-1585032226651-759b368d7246"),
    wholesalePrice: 720, mrp: 900, moq: 10, unit: "carton", gstIncluded: true, gstRate: 18,
    supplier: suppliers.balaji, rating: 4.7, reviewCount: 520, inStock: true, stockCount: 610, featured: true,
    description: "Fast-moving packaged noodles carton for wholesale restock.",
    specifications: { Packs: "72 x 70g", HSN: "1902" },
    deliveryDays: 2,
  },
  {
    id: "p14", slug: "cadbury-dairy-milk-carton", name: "Cadbury Dairy Milk Silk Carton Assorted", brand: "Cadbury",
    category: "food-fmcg", subCategory: "chocolates", image: img("photo-1481391319762-47dff72954d9"),
    wholesalePrice: 2450, mrp: 3100, moq: 4, unit: "carton", gstIncluded: true, gstRate: 18,
    supplier: suppliers.metro, rating: 4.6, reviewCount: 198, inStock: true, stockCount: 150,
    description: "Assorted Dairy Milk Silk SKUs for festive and daily retail.",
    specifications: { Units: "48 bars", HSN: "1806" },
    deliveryDays: 3,
  },

  // —— Healthcare & Pharma ——
  {
    id: "p15", slug: "dettol-antiseptic-1l", name: "Dettol Antiseptic Liquid 1L", brand: "Dettol",
    category: "healthcare-pharma", subCategory: "personal-hygiene", image: img("photo-1584308666744-24d5c474f2ae"),
    wholesalePrice: 245, mrp: 310, moq: 12, unit: "bottle", gstIncluded: true, gstRate: 18,
    supplier: suppliers.laxmi, rating: 4.7, reviewCount: 410, inStock: true, stockCount: 520, featured: true,
    description: "Trusted antiseptic liquid for homes, clinics and workplaces.",
    specifications: { "Pack Size": "1 L", HSN: "3808" },
    deliveryDays: 2,
  },
  {
    id: "p16", slug: "volini-spray-60g", name: "Volini Pain Relief Spray 60g Carton", brand: "Volini",
    category: "healthcare-pharma", subCategory: "otc-medicines", image: img("photo-1587854692152-cbe660dbde88"),
    wholesalePrice: 1680, mrp: 2100, moq: 6, unit: "carton", gstIncluded: true, gstRate: 12,
    supplier: suppliers.laxmi, rating: 4.5, reviewCount: 220, inStock: true, stockCount: 190,
    description: "Fast-moving OTC pain relief spray for pharmacies.",
    specifications: { Packs: "24 x 60g", HSN: "3004" },
    deliveryDays: 3,
  },
  {
    id: "p17", slug: "digene-gel-200ml", name: "Digene Gel 200ml Carton (24)", brand: "Digene",
    category: "healthcare-pharma", subCategory: "otc-medicines", image: img("photo-1471864190281-a93a3070b6de"),
    wholesalePrice: 1320, mrp: 1680, moq: 5, unit: "carton", gstIncluded: true, gstRate: 12,
    supplier: suppliers.royal, rating: 4.4, reviewCount: 156, inStock: true, stockCount: 210,
    description: "Antacid gel carton for pharmacy wholesale.",
    specifications: { Packs: "24 x 200ml", HSN: "3004" },
    deliveryDays: 3,
  },
  {
    id: "p18", slug: "surgical-gloves-box", name: "Sterile Surgical Gloves Box (100 pairs)", brand: "MediSafe",
    category: "healthcare-pharma", subCategory: "surgical-supplies", image: img("photo-1584515933487-779824d29309"),
    wholesalePrice: 380, mrp: 520, moq: 20, unit: "box", gstIncluded: true, gstRate: 12,
    supplier: suppliers.vedika, rating: 4.3, reviewCount: 88, inStock: true, stockCount: 740,
    description: "Latex surgical gloves for clinics and hospitals.",
    specifications: { Pairs: "100", Size: "M", HSN: "4015" },
    deliveryDays: 4,
  },
  {
    id: "p19", slug: "n95-masks-box", name: "N95 Protective Masks Box (50 pcs)", brand: "CareShield",
    category: "healthcare-pharma", subCategory: "medical-devices", image: img("photo-1584017911766-d451b3d0e843"),
    wholesalePrice: 420, mrp: 650, moq: 10, unit: "box", gstIncluded: true, gstRate: 5,
    supplier: suppliers.vedika, rating: 4.2, reviewCount: 310, inStock: true, stockCount: 980,
    description: "ISI-marked N95 masks for clinics and workplaces.",
    specifications: { Count: "50 pcs", HSN: "6307" },
    deliveryDays: 2,
  },
  {
    id: "p20", slug: "horlicks-classic-1kg", name: "Horlicks Classic Malt 1kg", brand: "Horlicks",
    category: "healthcare-pharma", subCategory: "nutrition", image: img("photo-1576091160550-2173dba999ef"),
    wholesalePrice: 410, mrp: 520, moq: 8, unit: "jar", gstIncluded: true, gstRate: 18,
    supplier: suppliers.metro, rating: 4.6, reviewCount: 265, inStock: true, stockCount: 300,
    description: "Nutrition drink for pharmacy and grocery channels.",
    specifications: { "Pack Size": "1 kg", HSN: "1901" },
    deliveryDays: 3,
  },

  // —— Electronics & Appliances ——
  {
    id: "p21", slug: "boat-rockerz-235v2", name: "boAt Rockerz 235V2 Neckband Earphones", brand: "boAt",
    category: "electronics-appliances", subCategory: "earphones", image: img("photo-1590658268037-6bf12165a8df"),
    wholesalePrice: 780, mrp: 1299, moq: 10, unit: "pc", gstIncluded: true, gstRate: 18,
    supplier: suppliers.vedika, rating: 4.4, reviewCount: 890, inStock: true, stockCount: 450, featured: true,
    description: "Wireless neckband earphones with ASAP charge — high-velocity mobile accessory.",
    specifications: { Colour: "Black", HSN: "8518" },
    deliveryDays: 3,
  },
  {
    id: "p22", slug: "mi-33w-charger", name: "Mi 33W SonicCharge Fast Charger", brand: "Xiaomi",
    category: "electronics-appliances", subCategory: "chargers", image: img("photo-1583394838336-acd977736f90"),
    wholesalePrice: 520, mrp: 799, moq: 15, unit: "pc", gstIncluded: true, gstRate: 18,
    supplier: suppliers.metro, rating: 4.5, reviewCount: 420, inStock: true, stockCount: 380,
    description: "Official Mi 33W fast charger with Type-C cable.",
    specifications: { Output: "33W", HSN: "8504" },
    deliveryDays: 2,
  },
  {
    id: "p23", slug: "ambrane-powerbank-10000", name: "Ambrane 10000mAh Power Bank", brand: "Ambrane",
    category: "electronics-appliances", subCategory: "power-banks", image: img("photo-1597872200969-2b65d56bd16b"),
    wholesalePrice: 690, mrp: 1199, moq: 12, unit: "pc", gstIncluded: true, gstRate: 18,
    supplier: suppliers.vedika, rating: 4.3, reviewCount: 210, inStock: true, stockCount: 260,
    description: "Compact dual-output power bank for retail mobile counters.",
    specifications: { Capacity: "10000mAh", HSN: "8507" },
    deliveryDays: 3,
  },
  {
    id: "p24", slug: "philips-led-9w", name: "Philips LED Bulb 9W B22 Pack of 10", brand: "Philips",
    category: "electronics-appliances", subCategory: "electrical-accessories", image: img("photo-1565814329452-e1efa11c5b89"),
    wholesalePrice: 480, mrp: 790, moq: 20, unit: "pack", gstIncluded: true, gstRate: 18,
    supplier: suppliers.royal, rating: 4.6, reviewCount: 340, inStock: true, stockCount: 720,
    description: "Energy-efficient LED bulbs for electrical & general stores.",
    specifications: { Wattage: "9W", Pack: "10 pcs", HSN: "8539" },
    deliveryDays: 4,
  },
  {
    id: "p25", slug: "prestige-mixer-750w", name: "Prestige Iris Plus Mixer Grinder 750W", brand: "Prestige",
    category: "electronics-appliances", subCategory: "kitchen-appliances", image: img("photo-1574269909862-7e1d70bb8078"),
    wholesalePrice: 2850, mrp: 4495, moq: 4, unit: "pc", gstIncluded: true, gstRate: 18,
    supplier: suppliers.shree, rating: 4.5, reviewCount: 178, inStock: true, stockCount: 95,
    description: "3-jar mixer grinder for home appliance retail counters.",
    specifications: { Power: "750W", Jars: "3", HSN: "8509" },
    deliveryDays: 5,
  },

  // —— Clothing & Accessories ——
  {
    id: "p26", slug: "mens-cotton-tee-pack", name: "Men's Cotton Round Neck T-Shirt Pack of 5", brand: "VyaparWear",
    category: "clothing-accessories", subCategory: "mens-wear", image: img("photo-1521572163474-6864f9cf17ab"),
    wholesalePrice: 640, mrp: 999, moq: 10, unit: "pack", gstIncluded: true, gstRate: 5,
    supplier: suppliers.metro, rating: 4.2, reviewCount: 120, inStock: true, stockCount: 340,
    description: "Assorted colour cotton tees — sizes M–XXL.",
    specifications: { Pieces: "5", Fabric: "100% Cotton", HSN: "6109" },
    deliveryDays: 4,
  },
  {
    id: "p27", slug: "womens-kurti-set", name: "Women's Printed Cotton Kurti (Assorted)", brand: "Vastra",
    category: "clothing-accessories", subCategory: "ethnic-wear", image: img("photo-1594633312681-425c7b97ccd1"),
    wholesalePrice: 380, mrp: 799, moq: 12, unit: "pc", gstIncluded: true, gstRate: 5,
    supplier: suppliers.royal, rating: 4.3, reviewCount: 86, inStock: true, stockCount: 280,
    description: "Ready-to-retail ethnic kurtis in mixed prints.",
    specifications: { Fabric: "Cotton", Sizes: "S–XL", HSN: "6204" },
    deliveryDays: 5,
  },
  {
    id: "p28", slug: "school-bag-20l", name: "Kids School Bag 20L Waterproof", brand: "CarryKids",
    category: "clothing-accessories", subCategory: "bags", image: img("photo-1553062407-98eeb64c6a62"),
    wholesalePrice: 290, mrp: 599, moq: 15, unit: "pc", gstIncluded: true, gstRate: 18,
    supplier: suppliers.metro, rating: 4.1, reviewCount: 64, inStock: true, stockCount: 410,
    description: "Lightweight school bags for kids wear & accessory counters.",
    specifications: { Capacity: "20L", HSN: "4202" },
    deliveryDays: 4,
  },

  // —— Footwear ——
  {
    id: "p29", slug: "mens-sports-shoes", name: "Men's Running Sports Shoes Assorted", brand: "SprintX",
    category: "footwear", subCategory: "sports-shoes", image: img("photo-1542291026-7eec264c27ff"),
    wholesalePrice: 720, mrp: 1499, moq: 8, unit: "pair", gstIncluded: true, gstRate: 18,
    supplier: suppliers.vedika, rating: 4.2, reviewCount: 145, inStock: true, stockCount: 220, featured: true,
    description: "Lightweight sports shoes for wholesale footwear outlets.",
    specifications: { Sizes: "6–10", Material: "Mesh", HSN: "6404" },
    deliveryDays: 5,
  },
  {
    id: "p30", slug: "hawaii-slippers-pack", name: "Hawaii Rubber Slippers Pack of 12", brand: "Relaxo",
    category: "footwear", subCategory: "slippers", image: img("photo-1603487742131-4160ec999306"),
    wholesalePrice: 540, mrp: 840, moq: 10, unit: "pack", gstIncluded: true, gstRate: 18,
    supplier: suppliers.balaji, rating: 4.5, reviewCount: 390, inStock: true, stockCount: 600,
    description: "Everyday rubber slippers — high velocity SKU.",
    specifications: { Pairs: "12", HSN: "6402" },
    deliveryDays: 3,
  },
  {
    id: "p31", slug: "womens-sandals", name: "Women's Comfort Sandals Assorted", brand: "Bata",
    category: "footwear", subCategory: "sandals", image: img("photo-1560769629-975ec94e6a86"),
    wholesalePrice: 410, mrp: 899, moq: 10, unit: "pair", gstIncluded: true, gstRate: 18,
    supplier: suppliers.royal, rating: 4.3, reviewCount: 112, inStock: true, stockCount: 175,
    description: "Comfort sandals for women's footwear retail.",
    specifications: { Sizes: "4–8", HSN: "6403" },
    deliveryDays: 4,
  },

  // —— Home & Kitchen ——
  {
    id: "p32", slug: "milton-thermos-1l", name: "Milton Thermosteel Water Bottle 1L", brand: "Milton",
    category: "home-kitchen", subCategory: "kitchenware", image: img("photo-1602143407151-7111542de6e8"),
    wholesalePrice: 420, mrp: 799, moq: 12, unit: "pc", gstIncluded: true, gstRate: 18,
    supplier: suppliers.metro, rating: 4.6, reviewCount: 280, inStock: true, stockCount: 360, featured: true,
    description: "Stainless steel insulated bottle for home & kitchen retail.",
    specifications: { Capacity: "1 L", HSN: "9617" },
    deliveryDays: 3,
  },
  {
    id: "p33", slug: "cello-storage-set", name: "Cello Plastic Storage Container Set (6 pcs)", brand: "Cello",
    category: "home-kitchen", subCategory: "storage-containers", image: img("photo-1584568694244-14fbdf83bd30"),
    wholesalePrice: 310, mrp: 599, moq: 10, unit: "set", gstIncluded: true, gstRate: 18,
    supplier: suppliers.shree, rating: 4.4, reviewCount: 198, inStock: true, stockCount: 440,
    description: "Airtight storage containers for kitchen utility aisles.",
    specifications: { Pieces: "6", HSN: "3924" },
    deliveryDays: 3,
  },
  {
    id: "p34", slug: "prestige-cooker-5l", name: "Prestige Deluxe Plus Pressure Cooker 5L", brand: "Prestige",
    category: "home-kitchen", subCategory: "cookware", image: img("photo-1585515320310-259814833e62"),
    wholesalePrice: 1450, mrp: 2495, moq: 4, unit: "pc", gstIncluded: true, gstRate: 18,
    supplier: suppliers.annapurna, rating: 4.7, reviewCount: 356, inStock: true, stockCount: 120,
    description: "ISI-marked aluminium pressure cooker — staple cookware SKU.",
    specifications: { Capacity: "5 L", HSN: "7615" },
    deliveryDays: 4,
  },
  {
    id: "p35", slug: "surf-excel-5kg", name: "Surf Excel Matic Front Load 5kg", brand: "Surf Excel",
    category: "home-kitchen", subCategory: "cleaning-products", image: img("photo-1583947215259-38e31be8751f"),
    wholesalePrice: 680, mrp: 890, moq: 6, unit: "pack", gstIncluded: true, gstRate: 18,
    supplier: suppliers.royal, rating: 4.6, reviewCount: 410, inStock: true, stockCount: 290,
    description: "Front-load detergent for grocery & home care shelves.",
    specifications: { "Pack Size": "5 kg", HSN: "3402" },
    deliveryDays: 2,
  },
  {
    id: "p36", slug: "disposable-cups-carton", name: "Paper Disposable Cups 100ml Carton (1000)", brand: "EcoServe",
    category: "home-kitchen", subCategory: "disposables", image: img("photo-1578662996442-48f60103fc96"),
    wholesalePrice: 380, mrp: 550, moq: 10, unit: "carton", gstIncluded: true, gstRate: 18,
    supplier: suppliers.balaji, rating: 4.1, reviewCount: 72, inStock: true, stockCount: 500,
    description: "Food-grade disposable cups for HORECA and retail.",
    specifications: { Count: "1000 pcs", HSN: "4823" },
    deliveryDays: 3,
  },

  // —— Electricals ——
  {
    id: "p37", slug: "havells-extension-board", name: "Havells 4-Socket Extension Board 1.5m", brand: "Havells",
    category: "electricals", subCategory: "extension-boards", image: img("photo-1621905251189-08b45d6a269e"),
    wholesalePrice: 520, mrp: 899, moq: 10, unit: "pc", gstIncluded: true, gstRate: 18,
    supplier: suppliers.vedika, rating: 4.5, reviewCount: 168, inStock: true, stockCount: 310, featured: true,
    description: "Spike-protected extension board for electrical retail.",
    specifications: { Sockets: "4", Cable: "1.5m", HSN: "8536" },
    deliveryDays: 3,
  },
  {
    id: "p38", slug: "syska-led-12w", name: "Syska LED Bulb 12W Pack of 10", brand: "Syska",
    category: "electricals", subCategory: "led-bulbs", image: img("photo-1565814329452-e1efa11c5b89"),
    wholesalePrice: 560, mrp: 950, moq: 15, unit: "pack", gstIncluded: true, gstRate: 18,
    supplier: suppliers.metro, rating: 4.4, reviewCount: 240, inStock: true, stockCount: 580,
    description: "Bright LED bulbs for electrical hardware counters.",
    specifications: { Wattage: "12W", Pack: "10", HSN: "8539" },
    deliveryDays: 3,
  },
  {
    id: "p39", slug: "anchor-switch-pack", name: "Anchor Roma Modular Switch Pack of 10", brand: "Anchor",
    category: "electricals", subCategory: "switches", image: img("photo-1558618666-fcd25c85cd64"),
    wholesalePrice: 380, mrp: 650, moq: 20, unit: "pack", gstIncluded: true, gstRate: 18,
    supplier: suppliers.royal, rating: 4.3, reviewCount: 95, inStock: true, stockCount: 420,
    description: "Modular switches for electrical contractors and stores.",
    specifications: { Pieces: "10", Type: "6A", HSN: "8536" },
    deliveryDays: 4,
  },
  {
    id: "p40", slug: "orient-ceiling-fan", name: "Orient Electric Ceiling Fan 1200mm", brand: "Orient",
    category: "electricals", subCategory: "fans", image: img("photo-1621905252507-b35492cc74b4"),
    wholesalePrice: 1680, mrp: 2690, moq: 4, unit: "pc", gstIncluded: true, gstRate: 18,
    supplier: suppliers.vedika, rating: 4.5, reviewCount: 132, inStock: true, stockCount: 85,
    description: "High-airflow ceiling fan for electrical retail.",
    specifications: { Sweep: "1200mm", HSN: "8414" },
    deliveryDays: 5,
  },

  // —— Toys, Baby & Sports ——
  {
    id: "p41", slug: "pampers-pants-l", name: "Pampers Pants Diaper L (56 pcs)", brand: "Pampers",
    category: "toys-baby-sports", subCategory: "baby-care", image: img("photo-1515488042361-ee00e0ddd4e4"),
    wholesalePrice: 620, mrp: 899, moq: 8, unit: "pack", gstIncluded: true, gstRate: 12,
    supplier: suppliers.laxmi, rating: 4.6, reviewCount: 310, inStock: true, stockCount: 240, featured: true,
    description: "Baby pants diapers — high-velocity baby care SKU.",
    specifications: { Count: "56", Size: "L", HSN: "9619" },
    deliveryDays: 2,
  },
  {
    id: "p42", slug: "lego-classic-box", name: "Building Blocks Classic Box 500 pcs", brand: "PlayBuild",
    category: "toys-baby-sports", subCategory: "toys", image: img("photo-1587654780291-39c9404d746b"),
    wholesalePrice: 480, mrp: 999, moq: 6, unit: "box", gstIncluded: true, gstRate: 18,
    supplier: suppliers.metro, rating: 4.4, reviewCount: 88, inStock: true, stockCount: 160,
    description: "Creative building blocks for toy wholesale.",
    specifications: { Pieces: "500", Age: "3+", HSN: "9503" },
    deliveryDays: 4,
  },
  {
    id: "p43", slug: "classmate-notebook-pack", name: "Classmate Long Notebook Pack of 12", brand: "Classmate",
    category: "toys-baby-sports", subCategory: "school-products", image: img("photo-1517971071642-34a2d3ecc9cd"),
    wholesalePrice: 360, mrp: 540, moq: 10, unit: "pack", gstIncluded: true, gstRate: 12,
    supplier: suppliers.metro, rating: 4.7, reviewCount: 520, inStock: true, stockCount: 780,
    description: "Ruled notebooks for school & stationery counters.",
    specifications: { Pages: "172", Pack: "12", HSN: "4820" },
    deliveryDays: 2,
  },
  {
    id: "p44", slug: "nivia-football-5", name: "Nivia Storm Football Size 5", brand: "Nivia",
    category: "toys-baby-sports", subCategory: "sports-goods", image: img("photo-1574629810360-7efbbe195018"),
    wholesalePrice: 390, mrp: 799, moq: 8, unit: "pc", gstIncluded: true, gstRate: 18,
    supplier: suppliers.vedika, rating: 4.3, reviewCount: 74, inStock: true, stockCount: 130,
    description: "Training football for sports goods retail.",
    specifications: { Size: "5", HSN: "9506" },
    deliveryDays: 4,
  },

  // —— General Merchandise ——
  {
    id: "p45", slug: "plastic-bucket-20l", name: "Plastic Bucket with Lid 20L Pack of 6", brand: "Nilkamal",
    category: "general-merchandise", subCategory: "plastic-products-gm", image: img("photo-1581578731548-c64695cc6952"),
    wholesalePrice: 720, mrp: 1080, moq: 5, unit: "pack", gstIncluded: true, gstRate: 18,
    supplier: suppliers.shree, rating: 4.2, reviewCount: 95, inStock: true, stockCount: 260,
    description: "Heavy-duty household buckets for general merchandise.",
    specifications: { Capacity: "20L", Pack: "6", HSN: "3924" },
    deliveryDays: 4,
  },
  {
    id: "p46", slug: "carry-bags-carton", name: "Non-Woven Carry Bags Assorted Carton", brand: "EcoBag",
    category: "general-merchandise", subCategory: "utility-products", image: img("photo-1597484661643-2f5fef640dd1"),
    wholesalePrice: 450, mrp: 700, moq: 10, unit: "carton", gstIncluded: true, gstRate: 18,
    supplier: suppliers.balaji, rating: 4.0, reviewCount: 58, inStock: true, stockCount: 390,
    description: "Reusable carry bags for retail checkout counters.",
    specifications: { Count: "500", HSN: "6305" },
    deliveryDays: 3,
  },
  {
    id: "p47", slug: "cello-pens-box", name: "Cello Butterflow Ball Pens Box of 50", brand: "Cello",
    category: "general-merchandise", subCategory: "stationery", image: img("photo-1452860606245-08befc0ff44b"),
    wholesalePrice: 280, mrp: 450, moq: 20, unit: "box", gstIncluded: true, gstRate: 18,
    supplier: suppliers.metro, rating: 4.5, reviewCount: 410, inStock: true, stockCount: 900, featured: true,
    description: "Smooth-writing pens for stationery wholesale.",
    specifications: { Count: "50", Colour: "Blue", HSN: "9608" },
    deliveryDays: 2,
  },
  {
    id: "p48", slug: "gift-mug-set", name: "Ceramic Gift Mug Set Pack of 6", brand: "HomeGift",
    category: "general-merchandise", subCategory: "gift-items", image: img("photo-1495474472287-4d71bcdd2085"),
    wholesalePrice: 360, mrp: 720, moq: 8, unit: "set", gstIncluded: true, gstRate: 18,
    supplier: suppliers.royal, rating: 4.1, reviewCount: 42, inStock: true, stockCount: 140,
    description: "Assorted gift mugs for festive merchandise.",
    specifications: { Pieces: "6", HSN: "6912" },
    deliveryDays: 5,
  },

  // —— Fill remaining subcategories (one SKU each) ——
  {
    id: "p49", slug: "staple-combo-carton", name: "Daily Staples Combo Carton (Rice+Dal+Atta)", brand: "Annapurna Select",
    category: "food-fmcg", subCategory: "staples", image: img("photo-1542838132-92c53300491e"),
    wholesalePrice: 1890, mrp: 2300, moq: 5, unit: "carton", gstIncluded: true, gstRate: 5,
    supplier: suppliers.annapurna, rating: 4.5, reviewCount: 88, inStock: true, stockCount: 210,
    description: "Assorted staple combo carton for kirana restock.",
    specifications: { Packs: "Mixed", HSN: "1006" },
    deliveryDays: 3,
  },
  {
    id: "p50", slug: "azithromycin-500-strip", name: "Azithromycin 500mg Strip Carton (10x10)", brand: "Cipla",
    category: "healthcare-pharma", subCategory: "prescription-medicines", image: img("photo-1471864190281-a93a3070b6de"),
    wholesalePrice: 1450, mrp: 1900, moq: 4, unit: "carton", gstIncluded: true, gstRate: 12,
    supplier: suppliers.laxmi, rating: 4.4, reviewCount: 64, inStock: true, stockCount: 120,
    description: "Prescription antibiotic strips for licensed pharmacies.",
    specifications: { Packs: "10 x 10", HSN: "3004" },
    deliveryDays: 2,
  },
  {
    id: "p51", slug: "ashwagandha-capsules", name: "Ashwagandha Capsules Bottle Pack of 12", brand: "Himalaya",
    category: "healthcare-pharma", subCategory: "wellness", image: img("photo-1576091160550-2173dba999ef"),
    wholesalePrice: 1680, mrp: 2160, moq: 6, unit: "pack", gstIncluded: true, gstRate: 12,
    supplier: suppliers.laxmi, rating: 4.3, reviewCount: 110, inStock: true, stockCount: 260,
    description: "Ayurvedic wellness capsules for pharmacy shelves.",
    specifications: { Bottles: "12 x 60", HSN: "3004" },
    deliveryDays: 3,
  },
  {
    id: "p52", slug: "redmi-note-carton", name: "Redmi Note Series Handset Carton (Assorted)", brand: "Xiaomi",
    category: "electronics-appliances", subCategory: "mobile-phones", image: img("photo-1519558260268-cde7e03a0152"),
    wholesalePrice: 48500, mrp: 56000, moq: 2, unit: "carton", gstIncluded: true, gstRate: 18,
    supplier: suppliers.vedika, rating: 4.6, reviewCount: 74, inStock: true, stockCount: 40, featured: true,
    description: "Assorted Redmi Note handsets for authorised retail.",
    specifications: { Units: "10", HSN: "8517" },
    deliveryDays: 4,
  },
  {
    id: "p53", slug: "tempered-glass-carton", name: "Tempered Glass Screen Guard Carton (100)", brand: "Spigen",
    category: "electronics-appliances", subCategory: "mobile-accessories", image: img("photo-1597872200969-2b65d56bd16b"),
    wholesalePrice: 2200, mrp: 4500, moq: 5, unit: "carton", gstIncluded: true, gstRate: 18,
    supplier: suppliers.metro, rating: 4.2, reviewCount: 190, inStock: true, stockCount: 320,
    description: "Universal tempered glass packs for mobile counters.",
    specifications: { Count: "100", HSN: "7007" },
    deliveryDays: 2,
  },
  {
    id: "p54", slug: "mixer-grinder-750w", name: "750W Mixer Grinder Wholesale Carton", brand: "Preethi",
    category: "electronics-appliances", subCategory: "home-appliances", image: img("photo-1574269909862-7e1d70bb8078"),
    wholesalePrice: 9200, mrp: 12500, moq: 3, unit: "carton", gstIncluded: true, gstRate: 18,
    supplier: suppliers.vedika, rating: 4.5, reviewCount: 132, inStock: true, stockCount: 90,
    description: "Home appliance mixer grinders for appliance stores.",
    specifications: { Units: "4", Wattage: "750W", HSN: "8509" },
    deliveryDays: 4,
  },
  {
    id: "p55", slug: "womens-kurti-pack", name: "Women's Cotton Kurti Pack of 12", brand: "Biba",
    category: "clothing-accessories", subCategory: "womens-wear", image: img("photo-1594633312681-425c7b97ccd1"),
    wholesalePrice: 5400, mrp: 9600, moq: 4, unit: "pack", gstIncluded: true, gstRate: 5,
    supplier: suppliers.royal, rating: 4.4, reviewCount: 98, inStock: true, stockCount: 160,
    description: "Assorted women's kurtis for fashion wholesale.",
    specifications: { Pieces: "12", HSN: "6204" },
    deliveryDays: 3,
  },
  {
    id: "p56", slug: "kids-tee-pack", name: "Kids Cotton T-Shirt Assorted Pack of 24", brand: "Gini & Jony",
    category: "clothing-accessories", subCategory: "kids-wear", image: img("photo-1515488042361-ee00e0ddd4e4"),
    wholesalePrice: 3600, mrp: 7200, moq: 5, unit: "pack", gstIncluded: true, gstRate: 5,
    supplier: suppliers.royal, rating: 4.3, reviewCount: 76, inStock: true, stockCount: 200,
    description: "Colourful kids tees for apparel retailers.",
    specifications: { Pieces: "24", HSN: "6109" },
    deliveryDays: 3,
  },
  {
    id: "p57", slug: "mens-innerwear-dozen", name: "Men's Cotton Vest & Brief Combo Dozen", brand: "Jockey",
    category: "clothing-accessories", subCategory: "innerwear", image: img("photo-1521572163474-6864f9cf17ab"),
    wholesalePrice: 2100, mrp: 3600, moq: 8, unit: "dozen", gstIncluded: true, gstRate: 5,
    supplier: suppliers.metro, rating: 4.6, reviewCount: 220, inStock: true, stockCount: 340,
    description: "Everyday men's innerwear combo for garment shops.",
    specifications: { Sets: "12", HSN: "6107" },
    deliveryDays: 2,
  },
  {
    id: "p58", slug: "fashion-watch-pack", name: "Fashion Analog Watch Assorted Pack of 10", brand: "Titan",
    category: "clothing-accessories", subCategory: "fashion-accessories", image: img("photo-1572635196237-14b3f281503f"),
    wholesalePrice: 7800, mrp: 14500, moq: 3, unit: "pack", gstIncluded: true, gstRate: 18,
    supplier: suppliers.royal, rating: 4.5, reviewCount: 84, inStock: true, stockCount: 95,
    description: "Assorted fashion watches for accessory counters.",
    specifications: { Pieces: "10", HSN: "9102" },
    deliveryDays: 4,
  },
  {
    id: "p59", slug: "mens-formal-shoes", name: "Men's Formal Leather Shoes Pair Carton", brand: "Bata",
    category: "footwear", subCategory: "mens-footwear", image: img("photo-1542291026-7eec264c27ff"),
    wholesalePrice: 6200, mrp: 11000, moq: 4, unit: "carton", gstIncluded: true, gstRate: 18,
    supplier: suppliers.royal, rating: 4.4, reviewCount: 150, inStock: true, stockCount: 110,
    description: "Men's formal shoes assortment for footwear stores.",
    specifications: { Pairs: "8", HSN: "6403" },
    deliveryDays: 3,
  },
  {
    id: "p60", slug: "womens-flats-carton", name: "Women's Casual Flats Assorted Carton", brand: "Catwalk",
    category: "footwear", subCategory: "womens-footwear", image: img("photo-1560769629-975ec94e6a86"),
    wholesalePrice: 4800, mrp: 9000, moq: 5, unit: "carton", gstIncluded: true, gstRate: 18,
    supplier: suppliers.metro, rating: 4.2, reviewCount: 91, inStock: true, stockCount: 130,
    description: "Women's flats assortment for fashion footwear.",
    specifications: { Pairs: "12", HSN: "6404" },
    deliveryDays: 3,
  },
  {
    id: "p61", slug: "kids-sneakers-carton", name: "Kids Sneakers Assorted Carton", brand: "Sparx",
    category: "footwear", subCategory: "kids-footwear", image: img("photo-1460353581641-37baddab0fa2"),
    wholesalePrice: 3900, mrp: 7200, moq: 5, unit: "carton", gstIncluded: true, gstRate: 18,
    supplier: suppliers.balaji, rating: 4.1, reviewCount: 67, inStock: true, stockCount: 150,
    description: "Kids sneakers for school and casual wear retail.",
    specifications: { Pairs: "12", HSN: "6404" },
    deliveryDays: 3,
  },
  {
    id: "p62", slug: "plastic-bucket-set", name: "Plastic Bucket & Mug Set Carton", brand: "Nilkamal",
    category: "home-kitchen", subCategory: "plastic-products", image: img("photo-1581578731548-c64695cc6952"),
    wholesalePrice: 1650, mrp: 2600, moq: 6, unit: "carton", gstIncluded: true, gstRate: 18,
    supplier: suppliers.shree, rating: 4.3, reviewCount: 102, inStock: true, stockCount: 280,
    description: "Durable plastic bucket sets for home utility wholesale.",
    specifications: { Sets: "8", HSN: "3924" },
    deliveryDays: 3,
  },
  {
    id: "p63", slug: "door-mat-pack", name: "Anti-Slip Door Mat Pack of 20", brand: "HomeGuard",
    category: "home-kitchen", subCategory: "home-utility", image: img("photo-1556909114-f6e7ad7d3136"),
    wholesalePrice: 2100, mrp: 3800, moq: 5, unit: "pack", gstIncluded: true, gstRate: 18,
    supplier: suppliers.balaji, rating: 4.0, reviewCount: 55, inStock: true, stockCount: 190,
    description: "Anti-slip door mats for home utility aisles.",
    specifications: { Count: "20", HSN: "5705" },
    deliveryDays: 4,
  },
  {
    id: "p64", slug: "house-wire-90m", name: "FR House Wire 1.5 sq.mm Coil 90m", brand: "Havells",
    category: "electricals", subCategory: "wires", image: img("photo-1621905251189-08b45d6a269e"),
    wholesalePrice: 1850, mrp: 2400, moq: 10, unit: "coil", gstIncluded: true, gstRate: 18,
    supplier: suppliers.vedika, rating: 4.7, reviewCount: 240, inStock: true, stockCount: 420, featured: true,
    description: "ISI house wiring coil for electrical contractors.",
    specifications: { Length: "90 m", Gauge: "1.5 sq.mm", HSN: "8544" },
    deliveryDays: 2,
  },
  {
    id: "p65", slug: "mcb-pack", name: "Single Pole MCB 16A Pack of 12", brand: "Legrand",
    category: "electricals", subCategory: "electrical-hardware", image: img("photo-1558618666-fcd25c85cd64"),
    wholesalePrice: 2400, mrp: 3600, moq: 6, unit: "pack", gstIncluded: true, gstRate: 18,
    supplier: suppliers.vedika, rating: 4.6, reviewCount: 175, inStock: true, stockCount: 310,
    description: "MCB hardware packs for electrical wholesale.",
    specifications: { Count: "12", Rating: "16A", HSN: "8536" },
    deliveryDays: 2,
  },
  {
    id: "p66", slug: "broom-dustpan-set", name: "Broom & Dustpan Household Set Carton", brand: "Gala",
    category: "general-merchandise", subCategory: "household-goods", image: img("photo-1581578731548-c64695cc6952"),
    wholesalePrice: 980, mrp: 1600, moq: 8, unit: "carton", gstIncluded: true, gstRate: 18,
    supplier: suppliers.shree, rating: 4.2, reviewCount: 88, inStock: true, stockCount: 260,
    description: "Everyday household cleaning sets for general stores.",
    specifications: { Sets: "12", HSN: "9603" },
    deliveryDays: 3,
  },
  {
    id: "p67", slug: "toothpaste-carton-daily", name: "Toothpaste Family Pack Carton (Assorted)", brand: "Colgate",
    category: "general-merchandise", subCategory: "daily-use", image: img("photo-1604719312566-8912e9227c6a"),
    wholesalePrice: 2100, mrp: 2800, moq: 6, unit: "carton", gstIncluded: true, gstRate: 18,
    supplier: suppliers.balaji, rating: 4.5, reviewCount: 310, inStock: true, stockCount: 480,
    description: "Daily-use toothpaste carton for kirana restock.",
    specifications: { Tubes: "72", HSN: "3306" },
    deliveryDays: 2,
  },
];

const skuFor = (p: Seed) =>
  `VS-${p.id.toUpperCase()}-${p.brand.replace(/\s+/g, "").slice(0, 4).toUpperCase()}`;

function defaultHighlights(p: Seed): string[] {
  const days = p.deliveryDays ?? 3;
  return [
    `100% authentic ${p.brand} SKU — direct from verified supplier`,
    `Ships pan-India in ${days}–${days + 1} business days`,
    p.gstIncluded ? `GST ${p.gstRate}% invoice included` : `${p.gstRate}% GST charged separately`,
    `Bulk pricing unlocks at ${p.moq * 3}+ ${p.unit}`,
    `Replacement guarantee on damaged units`,
  ];
}

export const PRODUCTS: Product[] = RAW_PRODUCTS.map((p) => {
  const days = p.deliveryDays ?? 3;
  return {
    ...p,
    sku: skuFor(p),
    subCategory: p.subCategory,
    packagingDetails: `Original ${p.brand} packaging inside a 5-ply master carton.`,
    highlights: defaultHighlights(p),
    images: [p.image, p.image, p.image, p.image],
    deliveryDays: days,
    deliveryEstimate: `${days}–${days + 1} days`,
  };
});

export const FEATURED_PRODUCTS = PRODUCTS.filter((p) => p.featured);

export function getProductBySlug(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product, limit = 4) {
  return PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, limit);
}

export function getProductsBySupplier(supplierId: string) {
  return PRODUCTS.filter((p) => p.supplier.id === supplierId);
}

export function getProductsByCategory(slug: string) {
  return PRODUCTS.filter((p) => p.category === slug);
}

export function getProductsBySubCategory(categorySlug: string, subSlug: string) {
  return PRODUCTS.filter((p) => p.category === categorySlug && p.subCategory === subSlug);
}
