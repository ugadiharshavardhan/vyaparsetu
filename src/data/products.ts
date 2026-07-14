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

export const suppliers = {
  s1: S("s1", "ITC Foods Limited", "Kolkata, WB", true, 4.9, 25),
  s2: S("s2", "Britannia Industries", "Bengaluru, KA", true, 4.8, 30),
  s3: S("s3", "Parle Products", "Mumbai, MH", true, 4.8, 50),
  s4: S("s4", "Nestlé India", "Gurugram, HR", true, 4.9, 40),
  s5: S("s5", "HUL", "Mumbai, MH", true, 4.9, 60),
  s6: S("s6", "Dabur India", "Ghaziabad, UP", true, 4.7, 35),
  s7: S("s7", "Godrej Consumer", "Mumbai, MH", true, 4.7, 25),
  s8: S("s8", "Marico", "Mumbai, MH", true, 4.8, 20),
  s9: S("s9", "Emami", "Kolkata, WB", true, 4.6, 22),
  s10: S("s10", "Patanjali", "Haridwar, UK", true, 4.5, 15),
  s11: S("s11", "Tata Consumer", "Mumbai, MH", true, 4.9, 30),
  s12: S("s12", "Amul", "Anand, GJ", true, 4.9, 45),
  s13: S("s13", "Aachi Masala", "Chennai, TN", true, 4.6, 18),
  s14: S("s14", "Generic Wholesale Supply", "Delhi, DL", false, 4.2, 5),
};

const img = (q: string) => `https://images.unsplash.com/${q}?auto=format&fit=crop&w=800&q=70`;

type Seed = Omit<Product, "sku" | "images" | "highlights" | "packagingDetails" | "deliveryEstimate"> & {
  deliveryDays?: number;
  supplierId: string;
};

const RAW_PRODUCTS: Seed[] = [
  {
    id: "p1", slug: "aashirvaad-shudh-chakki-atta-10kg", name: "Aashirvaad Shudh Chakki Atta 10kg", brand: "Aashirvaad",
    category: "food-fmcg", subCategory: "atta", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 420, mrp: 495, moq: 20, unit: "bag",
    gstIncluded: true, gstRate: 5, supplierId: "s1",
    rating: Number(4.6), reviewCount: 140, inStock: true,
    stockCount: 445, featured: false,
    description: "High-quality Aashirvaad Shudh Chakki Atta 10kg for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p2", slug: "india-gate-classic-basmati-rice-5kg", name: "India Gate Classic Basmati Rice 5kg", brand: "India Gate",
    category: "food-fmcg", subCategory: "rice", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 620, mrp: 745, moq: 10, unit: "bag",
    gstIncluded: true, gstRate: 5, supplierId: "s14",
    rating: Number(4.2), reviewCount: 194, inStock: true,
    stockCount: 560, featured: true,
    description: "High-quality India Gate Classic Basmati Rice 5kg for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p3", slug: "fortune-sunlite-refined-sunflower-oil-15l-jar", name: "Fortune Sunlite Refined Sunflower Oil 15L Jar", brand: "Fortune",
    category: "food-fmcg", subCategory: "cooking-oil", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 1780, mrp: 2050, moq: 4, unit: "jar",
    gstIncluded: true, gstRate: 5, supplierId: "s14",
    rating: Number(4.2), reviewCount: 482, inStock: true,
    stockCount: 1321, featured: false,
    description: "High-quality Fortune Sunlite Refined Sunflower Oil 15L Jar for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p4", slug: "tata-salt-iodized-1kg-carton-26-packs-", name: "Tata Salt Iodized 1kg Carton (26 packs)", brand: "Tata",
    category: "food-fmcg", subCategory: "salt", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 520, mrp: 650, moq: 5, unit: "carton",
    gstIncluded: true, gstRate: 5, supplierId: "s11",
    rating: Number(4.5), reviewCount: 81, inStock: true,
    stockCount: 748, featured: true,
    description: "High-quality Tata Salt Iodized 1kg Carton (26 packs) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p5", slug: "mdh-garam-masala-100g-carton-48-", name: "MDH Garam Masala 100g Carton (48)", brand: "MDH",
    category: "food-fmcg", subCategory: "masalas", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 1850, mrp: 2300, moq: 4, unit: "carton",
    gstIncluded: true, gstRate: 5, supplierId: "s13",
    rating: Number(4.8), reviewCount: 19, inStock: true,
    stockCount: 63, featured: true,
    description: "High-quality MDH Garam Masala 100g Carton (48) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p6", slug: "everest-chilli-powder-500g", name: "Everest Chilli Powder 500g", brand: "Everest",
    category: "food-fmcg", subCategory: "masalas", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 210, mrp: 260, moq: 10, unit: "pack",
    gstIncluded: true, gstRate: 5, supplierId: "s13",
    rating: Number(4.4), reviewCount: 253, inStock: true,
    stockCount: 1480, featured: true,
    description: "High-quality Everest Chilli Powder 500g for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p7", slug: "parle-g-glucose-biscuits-family-pack-carton", name: "Parle-G Glucose Biscuits Family Pack Carton", brand: "Parle",
    category: "food-fmcg", subCategory: "biscuits", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 890, mrp: 1080, moq: 10, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s3",
    rating: Number(4.6), reviewCount: 125, inStock: true,
    stockCount: 734, featured: true,
    description: "High-quality Parle-G Glucose Biscuits Family Pack Carton for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p8", slug: "britannia-good-day-cashew-cookies-carton", name: "Britannia Good Day Cashew Cookies Carton", brand: "Britannia",
    category: "food-fmcg", subCategory: "biscuits", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 960, mrp: 1200, moq: 8, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s2",
    rating: Number(4.1), reviewCount: 77, inStock: true,
    stockCount: 444, featured: false,
    description: "High-quality Britannia Good Day Cashew Cookies Carton for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p9", slug: "britannia-marie-gold-120g-carton", name: "Britannia Marie Gold 120g Carton", brand: "Britannia",
    category: "food-fmcg", subCategory: "biscuits", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 740, mrp: 900, moq: 10, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s2",
    rating: Number(4.7), reviewCount: 266, inStock: true,
    stockCount: 1182, featured: true,
    description: "High-quality Britannia Marie Gold 120g Carton for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p10", slug: "maggi-2-minute-noodles-masala-pack-of-12", name: "Maggi 2-Minute Noodles Masala Pack of 12", brand: "Maggi",
    category: "food-fmcg", subCategory: "noodles", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 145, mrp: 168, moq: 20, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s4",
    rating: Number(4.6), reviewCount: 483, inStock: true,
    stockCount: 1514, featured: true,
    description: "High-quality Maggi 2-Minute Noodles Masala Pack of 12 for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p11", slug: "sunfeast-yippee-noodles-magic-masala", name: "Sunfeast Yippee Noodles Magic Masala", brand: "Sunfeast",
    category: "food-fmcg", subCategory: "noodles", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 130, mrp: 150, moq: 20, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s1",
    rating: Number(4.4), reviewCount: 431, inStock: true,
    stockCount: 798, featured: true,
    description: "High-quality Sunfeast Yippee Noodles Magic Masala for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p12", slug: "lay-s-classic-salted-chips-carton-60-", name: "Lay's Classic Salted Chips Carton (60)", brand: "Lay's",
    category: "food-fmcg", subCategory: "snacks", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 980, mrp: 1200, moq: 5, unit: "carton",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(4.7), reviewCount: 235, inStock: true,
    stockCount: 1853, featured: true,
    description: "High-quality Lay's Classic Salted Chips Carton (60) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p13", slug: "kurkure-masala-munch-carton-60-", name: "Kurkure Masala Munch Carton (60)", brand: "Kurkure",
    category: "food-fmcg", subCategory: "snacks", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 980, mrp: 1200, moq: 5, unit: "carton",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(4.6), reviewCount: 30, inStock: true,
    stockCount: 567, featured: false,
    description: "High-quality Kurkure Masala Munch Carton (60) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p14", slug: "haldiram-s-bhujia-sev-1kg", name: "Haldiram's Bhujia Sev 1kg", brand: "Haldiram's",
    category: "food-fmcg", subCategory: "snacks", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 210, mrp: 260, moq: 10, unit: "pack",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(4.4), reviewCount: 105, inStock: true,
    stockCount: 1600, featured: false,
    description: "High-quality Haldiram's Bhujia Sev 1kg for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p15", slug: "cadbury-dairy-milk-silk-chocolate-box-24-", name: "Cadbury Dairy Milk Silk Chocolate Box (24)", brand: "Cadbury",
    category: "food-fmcg", subCategory: "chocolates", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 1560, mrp: 1920, moq: 3, unit: "box",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.7), reviewCount: 502, inStock: true,
    stockCount: 1594, featured: false,
    description: "High-quality Cadbury Dairy Milk Silk Chocolate Box (24) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p16", slug: "amul-spray-milk-powder-1kg", name: "Amul Spray Milk Powder 1kg", brand: "Amul",
    category: "food-fmcg", subCategory: "dairy", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 420, mrp: 470, moq: 12, unit: "tin",
    gstIncluded: true, gstRate: 5, supplierId: "s12",
    rating: Number(4.1), reviewCount: 211, inStock: true,
    stockCount: 126, featured: true,
    description: "High-quality Amul Spray Milk Powder 1kg for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p17", slug: "nescafe-classic-coffee-200g-jar", name: "Nescafe Classic Coffee 200g Jar", brand: "Nescafe",
    category: "food-fmcg", subCategory: "beverages", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 480, mrp: 550, moq: 12, unit: "jar",
    gstIncluded: true, gstRate: 18, supplierId: "s4",
    rating: Number(4.4), reviewCount: 430, inStock: true,
    stockCount: 1498, featured: true,
    description: "High-quality Nescafe Classic Coffee 200g Jar for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p18", slug: "tata-tea-premium-1kg", name: "Tata Tea Premium 1kg", brand: "Tata Tea",
    category: "food-fmcg", subCategory: "beverages", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 380, mrp: 450, moq: 10, unit: "pack",
    gstIncluded: true, gstRate: 5, supplierId: "s11",
    rating: Number(4.2), reviewCount: 432, inStock: true,
    stockCount: 519, featured: true,
    description: "High-quality Tata Tea Premium 1kg for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p19", slug: "bru-instant-coffee-200g", name: "Bru Instant Coffee 200g", brand: "Bru",
    category: "food-fmcg", subCategory: "beverages", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 310, mrp: 380, moq: 12, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.3), reviewCount: 128, inStock: true,
    stockCount: 1152, featured: false,
    description: "High-quality Bru Instant Coffee 200g for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p20", slug: "red-label-tea-1kg", name: "Red Label Tea 1kg", brand: "Brooke Bond",
    category: "food-fmcg", subCategory: "beverages", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 410, mrp: 480, moq: 10, unit: "pack",
    gstIncluded: true, gstRate: 5, supplierId: "s5",
    rating: Number(4.4), reviewCount: 154, inStock: true,
    stockCount: 373, featured: true,
    description: "High-quality Red Label Tea 1kg for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p21", slug: "lux-soft-glow-rose-soap-100g-pack-of-4-", name: "Lux Soft Glow Rose Soap 100g (Pack of 4)", brand: "Lux",
    category: "personal-care", subCategory: "soap", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 110, mrp: 140, moq: 20, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(5.0), reviewCount: 314, inStock: true,
    stockCount: 1799, featured: true,
    description: "High-quality Lux Soft Glow Rose Soap 100g (Pack of 4) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p22", slug: "dove-cream-beauty-bathing-bar-100g-pack-of-3-", name: "Dove Cream Beauty Bathing Bar 100g (Pack of 3)", brand: "Dove",
    category: "personal-care", subCategory: "soap", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 145, mrp: 180, moq: 20, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.8), reviewCount: 30, inStock: true,
    stockCount: 1884, featured: true,
    description: "High-quality Dove Cream Beauty Bathing Bar 100g (Pack of 3) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p23", slug: "lifebuoy-total-10-soap-carton-72x100g-", name: "Lifebuoy Total 10 Soap Carton (72x100g)", brand: "Lifebuoy",
    category: "personal-care", subCategory: "soap", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 1650, mrp: 2016, moq: 3, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.1), reviewCount: 166, inStock: true,
    stockCount: 1283, featured: true,
    description: "High-quality Lifebuoy Total 10 Soap Carton (72x100g) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p24", slug: "pears-pure-gentle-soap-125g-pack-of-3-", name: "Pears Pure & Gentle Soap 125g (Pack of 3)", brand: "Pears",
    category: "personal-care", subCategory: "soap", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 175, mrp: 220, moq: 15, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.6), reviewCount: 438, inStock: true,
    stockCount: 1665, featured: false,
    description: "High-quality Pears Pure & Gentle Soap 125g (Pack of 3) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p25", slug: "clinic-plus-strong-long-shampoo-650ml", name: "Clinic Plus Strong & Long Shampoo 650ml", brand: "Clinic Plus",
    category: "personal-care", subCategory: "haircare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 290, mrp: 350, moq: 10, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.6), reviewCount: 48, inStock: true,
    stockCount: 637, featured: true,
    description: "High-quality Clinic Plus Strong & Long Shampoo 650ml for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p26", slug: "sunsilk-black-shine-shampoo-650ml", name: "Sunsilk Black Shine Shampoo 650ml", brand: "Sunsilk",
    category: "personal-care", subCategory: "haircare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 320, mrp: 399, moq: 10, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.7), reviewCount: 49, inStock: true,
    stockCount: 1319, featured: false,
    description: "High-quality Sunsilk Black Shine Shampoo 650ml for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p27", slug: "pantene-advanced-hair-fall-solution-650ml", name: "Pantene Advanced Hair Fall Solution 650ml", brand: "Pantene",
    category: "personal-care", subCategory: "haircare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 340, mrp: 425, moq: 10, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.8), reviewCount: 127, inStock: true,
    stockCount: 1919, featured: true,
    description: "High-quality Pantene Advanced Hair Fall Solution 650ml for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p28", slug: "head-shoulders-anti-dandruff-650ml", name: "Head & Shoulders Anti Dandruff 650ml", brand: "Head & Shoulders",
    category: "personal-care", subCategory: "haircare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 410, mrp: 510, moq: 10, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.3), reviewCount: 52, inStock: true,
    stockCount: 747, featured: true,
    description: "High-quality Head & Shoulders Anti Dandruff 650ml for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p29", slug: "colgate-strong-teeth-500g-carton-24x500g-", name: "Colgate Strong Teeth 500g Carton (24x500g)", brand: "Colgate",
    category: "personal-care", subCategory: "oralcare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 3150, mrp: 3840, moq: 2, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.7), reviewCount: 190, inStock: true,
    stockCount: 290, featured: false,
    description: "High-quality Colgate Strong Teeth 500g Carton (24x500g) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p30", slug: "closeup-everfresh-red-hot-150g-pack-of-2-", name: "Closeup Everfresh Red Hot 150g (Pack of 2)", brand: "Closeup",
    category: "personal-care", subCategory: "oralcare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 145, mrp: 180, moq: 15, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.2), reviewCount: 317, inStock: true,
    stockCount: 1356, featured: false,
    description: "High-quality Closeup Everfresh Red Hot 150g (Pack of 2) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p31", slug: "pepsodent-germi-check-150g", name: "Pepsodent Germi Check 150g", brand: "Pepsodent",
    category: "personal-care", subCategory: "oralcare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 78, mrp: 95, moq: 24, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.1), reviewCount: 99, inStock: true,
    stockCount: 1468, featured: false,
    description: "High-quality Pepsodent Germi Check 150g for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p32", slug: "vaseline-intensive-care-body-lotion-400ml", name: "Vaseline Intensive Care Body Lotion 400ml", brand: "Vaseline",
    category: "personal-care", subCategory: "skincare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 245, mrp: 315, moq: 12, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.2), reviewCount: 196, inStock: true,
    stockCount: 1771, featured: true,
    description: "High-quality Vaseline Intensive Care Body Lotion 400ml for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p33", slug: "nivea-soft-light-moisturiser-200ml", name: "Nivea Soft Light Moisturiser 200ml", brand: "Nivea",
    category: "personal-care", subCategory: "skincare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 210, mrp: 270, moq: 12, unit: "tub",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.5), reviewCount: 173, inStock: true,
    stockCount: 54, featured: true,
    description: "High-quality Nivea Soft Light Moisturiser 200ml for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p34", slug: "pond-s-white-beauty-face-wash-100g", name: "Pond's White Beauty Face Wash 100g", brand: "Pond's",
    category: "personal-care", subCategory: "skincare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 130, mrp: 165, moq: 15, unit: "tube",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.8), reviewCount: 62, inStock: true,
    stockCount: 1251, featured: false,
    description: "High-quality Pond's White Beauty Face Wash 100g for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p35", slug: "lakme-peach-milk-moisturizer-120ml", name: "Lakme Peach Milk Moisturizer 120ml", brand: "Lakme",
    category: "personal-care", subCategory: "skincare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 165, mrp: 210, moq: 12, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.2), reviewCount: 304, inStock: true,
    stockCount: 970, featured: false,
    description: "High-quality Lakme Peach Milk Moisturizer 120ml for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p36", slug: "surf-excel-easy-wash-detergent-powder-3kg", name: "Surf Excel Easy Wash Detergent Powder 3kg", brand: "Surf Excel",
    category: "home-care", subCategory: "detergent", image: img("photo-1583947215259-38e31be8751f"),
    wholesalePrice: 360, mrp: 420, moq: 10, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.4), reviewCount: 121, inStock: true,
    stockCount: 1929, featured: false,
    description: "High-quality Surf Excel Easy Wash Detergent Powder 3kg for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p37", slug: "ariel-matic-front-load-detergent-2kg", name: "Ariel Matic Front Load Detergent 2kg", brand: "Ariel",
    category: "home-care", subCategory: "detergent", image: img("photo-1583947215259-38e31be8751f"),
    wholesalePrice: 450, mrp: 540, moq: 8, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.5), reviewCount: 79, inStock: true,
    stockCount: 1443, featured: false,
    description: "High-quality Ariel Matic Front Load Detergent 2kg for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p38", slug: "wheel-active-lemon-jasmine-1kg-carton-20-", name: "Wheel Active Lemon & Jasmine 1kg Carton (20)", brand: "Wheel",
    category: "home-care", subCategory: "detergent", image: img("photo-1583947215259-38e31be8751f"),
    wholesalePrice: 1100, mrp: 1300, moq: 5, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.1), reviewCount: 139, inStock: true,
    stockCount: 1063, featured: true,
    description: "High-quality Wheel Active Lemon & Jasmine 1kg Carton (20) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p39", slug: "ghadi-detergent-powder-1kg-carton-24-", name: "Ghadi Detergent Powder 1kg Carton (24)", brand: "Ghadi",
    category: "home-care", subCategory: "detergent", image: img("photo-1583947215259-38e31be8751f"),
    wholesalePrice: 1250, mrp: 1560, moq: 5, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.3), reviewCount: 414, inStock: true,
    stockCount: 1213, featured: false,
    description: "High-quality Ghadi Detergent Powder 1kg Carton (24) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p40", slug: "lizol-surface-cleaner-pine-2l", name: "Lizol Surface Cleaner Pine 2L", brand: "Lizol",
    category: "home-care", subCategory: "cleaner", image: img("photo-1583947215259-38e31be8751f"),
    wholesalePrice: 290, mrp: 350, moq: 6, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.3), reviewCount: 484, inStock: true,
    stockCount: 484, featured: true,
    description: "High-quality Lizol Surface Cleaner Pine 2L for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p41", slug: "harpic-power-plus-toilet-cleaner-1l", name: "Harpic Power Plus Toilet Cleaner 1L", brand: "Harpic",
    category: "home-care", subCategory: "cleaner", image: img("photo-1583947215259-38e31be8751f"),
    wholesalePrice: 165, mrp: 199, moq: 12, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.9), reviewCount: 292, inStock: true,
    stockCount: 1151, featured: true,
    description: "High-quality Harpic Power Plus Toilet Cleaner 1L for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p42", slug: "vim-dishwash-liquid-gel-lemon-1-5l", name: "Vim Dishwash Liquid Gel Lemon 1.5L", brand: "Vim",
    category: "home-care", subCategory: "dishwash", image: img("photo-1583947215259-38e31be8751f"),
    wholesalePrice: 250, mrp: 310, moq: 6, unit: "jar",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.5), reviewCount: 360, inStock: true,
    stockCount: 1729, featured: true,
    description: "High-quality Vim Dishwash Liquid Gel Lemon 1.5L for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p43", slug: "exo-dish-shine-bar-carton-60-x-250g-", name: "Exo Dish Shine Bar Carton (60 x 250g)", brand: "Exo",
    category: "home-care", subCategory: "dishwash", image: img("photo-1583947215259-38e31be8751f"),
    wholesalePrice: 1450, mrp: 1800, moq: 3, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.7), reviewCount: 221, inStock: true,
    stockCount: 65, featured: false,
    description: "High-quality Exo Dish Shine Bar Carton (60 x 250g) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p44", slug: "colin-glass-cleaner-500ml", name: "Colin Glass Cleaner 500ml", brand: "Colin",
    category: "home-care", subCategory: "cleaner", image: img("photo-1583947215259-38e31be8751f"),
    wholesalePrice: 82, mrp: 100, moq: 12, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(5.0), reviewCount: 453, inStock: true,
    stockCount: 476, featured: false,
    description: "High-quality Colin Glass Cleaner 500ml for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p45", slug: "comfort-fabric-conditioner-blue-2l", name: "Comfort Fabric Conditioner Blue 2L", brand: "Comfort",
    category: "home-care", subCategory: "detergent", image: img("photo-1583947215259-38e31be8751f"),
    wholesalePrice: 380, mrp: 460, moq: 6, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.8), reviewCount: 291, inStock: true,
    stockCount: 2038, featured: false,
    description: "High-quality Comfort Fabric Conditioner Blue 2L for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p46", slug: "boat-bassheads-100-in-ear-wired-earphones", name: "boAt BassHeads 100 In-Ear Wired Earphones", brand: "boAt",
    category: "electronics", subCategory: "audio", image: img("photo-1498049794561-7780e7231661"),
    wholesalePrice: 299, mrp: 399, moq: 20, unit: "piece",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.7), reviewCount: 293, inStock: true,
    stockCount: 232, featured: false,
    description: "High-quality boAt BassHeads 100 In-Ear Wired Earphones for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p47", slug: "mi-10000mah-power-bank-3i", name: "Mi 10000mAH Power Bank 3i", brand: "Mi",
    category: "electronics", subCategory: "accessories", image: img("photo-1498049794561-7780e7231661"),
    wholesalePrice: 899, mrp: 1199, moq: 10, unit: "piece",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.4), reviewCount: 390, inStock: true,
    stockCount: 772, featured: true,
    description: "High-quality Mi 10000mAH Power Bank 3i for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p48", slug: "realme-18w-fast-charger-adapter", name: "Realme 18W Fast Charger Adapter", brand: "Realme",
    category: "electronics", subCategory: "accessories", image: img("photo-1498049794561-7780e7231661"),
    wholesalePrice: 399, mrp: 599, moq: 15, unit: "piece",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.0), reviewCount: 473, inStock: true,
    stockCount: 1957, featured: false,
    description: "High-quality Realme 18W Fast Charger Adapter for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p49", slug: "philips-9w-led-bulb-pack-of-10-", name: "Philips 9W LED Bulb (Pack of 10)", brand: "Philips",
    category: "electronics", subCategory: "lighting", image: img("photo-1498049794561-7780e7231661"),
    wholesalePrice: 850, mrp: 1200, moq: 5, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.5), reviewCount: 162, inStock: true,
    stockCount: 1106, featured: false,
    description: "High-quality Philips 9W LED Bulb (Pack of 10) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p50", slug: "havells-crabtree-switches-carton-50-", name: "Havells Crabtree Switches Carton (50)", brand: "Havells",
    category: "electronics", subCategory: "electricals", image: img("photo-1498049794561-7780e7231661"),
    wholesalePrice: 2500, mrp: 3250, moq: 2, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.9), reviewCount: 407, inStock: true,
    stockCount: 802, featured: false,
    description: "High-quality Havells Crabtree Switches Carton (50) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p51", slug: "syska-15w-led-bulb-carton-20-", name: "Syska 15W LED Bulb Carton (20)", brand: "Syska",
    category: "electronics", subCategory: "lighting", image: img("photo-1498049794561-7780e7231661"),
    wholesalePrice: 2200, mrp: 3000, moq: 2, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.1), reviewCount: 425, inStock: true,
    stockCount: 641, featured: false,
    description: "High-quality Syska 15W LED Bulb Carton (20) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p52", slug: "eveready-aa-batteries-carton-100-", name: "Eveready AA Batteries Carton (100)", brand: "Eveready",
    category: "electronics", subCategory: "electricals", image: img("photo-1498049794561-7780e7231661"),
    wholesalePrice: 1200, mrp: 1500, moq: 5, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.1), reviewCount: 179, inStock: true,
    stockCount: 319, featured: false,
    description: "High-quality Eveready AA Batteries Carton (100) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p53", slug: "anchor-4-way-extension-board", name: "Anchor 4-Way Extension Board", brand: "Anchor",
    category: "electronics", subCategory: "electricals", image: img("photo-1498049794561-7780e7231661"),
    wholesalePrice: 250, mrp: 350, moq: 10, unit: "piece",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.0), reviewCount: 476, inStock: true,
    stockCount: 677, featured: false,
    description: "High-quality Anchor 4-Way Extension Board for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p54", slug: "dettol-antiseptic-liquid-1l", name: "Dettol Antiseptic Liquid 1L", brand: "Dettol",
    category: "healthcare", subCategory: "first-aid", image: img("photo-1584308666744-24d59b298715"),
    wholesalePrice: 280, mrp: 335, moq: 10, unit: "bottle",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(4.8), reviewCount: 282, inStock: true,
    stockCount: 802, featured: false,
    description: "High-quality Dettol Antiseptic Liquid 1L for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p55", slug: "savlon-antiseptic-disinfectant-liquid-1l", name: "Savlon Antiseptic Disinfectant Liquid 1L", brand: "Savlon",
    category: "healthcare", subCategory: "first-aid", image: img("photo-1584308666744-24d59b298715"),
    wholesalePrice: 260, mrp: 315, moq: 10, unit: "bottle",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(4.6), reviewCount: 207, inStock: true,
    stockCount: 1707, featured: false,
    description: "High-quality Savlon Antiseptic Disinfectant Liquid 1L for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p56", slug: "volini-pain-relief-spray-60g", name: "Volini Pain Relief Spray 60g", brand: "Volini",
    category: "healthcare", subCategory: "pain-relief", image: img("photo-1584308666744-24d59b298715"),
    wholesalePrice: 125, mrp: 155, moq: 20, unit: "piece",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(4.5), reviewCount: 92, inStock: true,
    stockCount: 1098, featured: true,
    description: "High-quality Volini Pain Relief Spray 60g for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p57", slug: "digene-acidity-gas-relief-tablets-150-", name: "Digene Acidity & Gas Relief Tablets (150)", brand: "Digene",
    category: "healthcare", subCategory: "digestion", image: img("photo-1584308666744-24d59b298715"),
    wholesalePrice: 180, mrp: 225, moq: 10, unit: "pack",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(4.6), reviewCount: 396, inStock: true,
    stockCount: 1634, featured: true,
    description: "High-quality Digene Acidity & Gas Relief Tablets (150) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p58", slug: "crocin-advance-500mg-tablets-carton-20-strips-", name: "Crocin Advance 500mg Tablets Carton (20 strips)", brand: "Crocin",
    category: "healthcare", subCategory: "pain-relief", image: img("photo-1584308666744-24d59b298715"),
    wholesalePrice: 280, mrp: 340, moq: 5, unit: "carton",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(5.0), reviewCount: 476, inStock: true,
    stockCount: 668, featured: true,
    description: "High-quality Crocin Advance 500mg Tablets Carton (20 strips) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p59", slug: "disposable-surgical-gloves-carton-100-pairs-", name: "Disposable Surgical Gloves Carton (100 pairs)", brand: "Generic",
    category: "healthcare", subCategory: "medical", image: img("photo-1584308666744-24d59b298715"),
    wholesalePrice: 450, mrp: 600, moq: 10, unit: "carton",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(4.7), reviewCount: 451, inStock: true,
    stockCount: 1490, featured: true,
    description: "High-quality Disposable Surgical Gloves Carton (100 pairs) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p60", slug: "3-ply-surgical-face-masks-carton-500-pcs-", name: "3-Ply Surgical Face Masks Carton (500 pcs)", brand: "Generic",
    category: "healthcare", subCategory: "medical", image: img("photo-1584308666744-24d59b298715"),
    wholesalePrice: 650, mrp: 1000, moq: 10, unit: "carton",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(4.3), reviewCount: 236, inStock: true,
    stockCount: 1556, featured: false,
    description: "High-quality 3-Ply Surgical Face Masks Carton (500 pcs) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p61", slug: "lifebuoy-hand-sanitizer-500ml", name: "Lifebuoy Hand Sanitizer 500ml", brand: "Lifebuoy",
    category: "healthcare", subCategory: "first-aid", image: img("photo-1584308666744-24d59b298715"),
    wholesalePrice: 180, mrp: 250, moq: 12, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.6), reviewCount: 224, inStock: true,
    stockCount: 1849, featured: true,
    description: "High-quality Lifebuoy Hand Sanitizer 500ml for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p62", slug: "cello-plastic-bucket-20l-carton-10-", name: "Cello Plastic Bucket 20L Carton (10)", brand: "Cello",
    category: "general", subCategory: "home", image: img("photo-1542838132-92c53300491e"),
    wholesalePrice: 1500, mrp: 2200, moq: 3, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.4), reviewCount: 273, inStock: true,
    stockCount: 1259, featured: false,
    description: "High-quality Cello Plastic Bucket 20L Carton (10) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p63", slug: "eco-friendly-carry-bags-bundle-1000-pcs-", name: "Eco-Friendly Carry Bags Bundle (1000 pcs)", brand: "Generic",
    category: "general", subCategory: "packaging", image: img("photo-1542838132-92c53300491e"),
    wholesalePrice: 850, mrp: 1200, moq: 5, unit: "bundle",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(4.9), reviewCount: 69, inStock: true,
    stockCount: 1506, featured: false,
    description: "High-quality Eco-Friendly Carry Bags Bundle (1000 pcs) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p64", slug: "paper-coffee-cups-150ml-carton-1000-", name: "Paper Coffee Cups 150ml Carton (1000)", brand: "Generic",
    category: "general", subCategory: "disposables", image: img("photo-1542838132-92c53300491e"),
    wholesalePrice: 900, mrp: 1300, moq: 5, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.6), reviewCount: 258, inStock: true,
    stockCount: 1094, featured: false,
    description: "High-quality Paper Coffee Cups 150ml Carton (1000) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p65", slug: "disposable-plastic-plates-carton-500-", name: "Disposable Plastic Plates Carton (500)", brand: "Generic",
    category: "general", subCategory: "disposables", image: img("photo-1542838132-92c53300491e"),
    wholesalePrice: 1100, mrp: 1500, moq: 5, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.6), reviewCount: 268, inStock: true,
    stockCount: 1052, featured: false,
    description: "High-quality Disposable Plastic Plates Carton (500) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p66", slug: "brown-packaging-tape-2-inch-carton-72-", name: "Brown Packaging Tape 2 Inch Carton (72)", brand: "Wonder Tape",
    category: "general", subCategory: "packaging", image: img("photo-1542838132-92c53300491e"),
    wholesalePrice: 1800, mrp: 2500, moq: 3, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.1), reviewCount: 266, inStock: true,
    stockCount: 1943, featured: false,
    description: "High-quality Brown Packaging Tape 2 Inch Carton (72) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p67", slug: "nayasa-storage-boxes-set-carton-12-sets-", name: "Nayasa Storage Boxes Set Carton (12 sets)", brand: "Nayasa",
    category: "general", subCategory: "home", image: img("photo-1542838132-92c53300491e"),
    wholesalePrice: 3200, mrp: 4500, moq: 2, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.2), reviewCount: 508, inStock: true,
    stockCount: 644, featured: true,
    description: "High-quality Nayasa Storage Boxes Set Carton (12 sets) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p68", slug: "classmate-notebooks-regular-carton-100-", name: "Classmate Notebooks Regular Carton (100)", brand: "Classmate",
    category: "general", subCategory: "stationery", image: img("photo-1542838132-92c53300491e"),
    wholesalePrice: 3400, mrp: 4000, moq: 3, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.6), reviewCount: 359, inStock: true,
    stockCount: 578, featured: true,
    description: "High-quality Classmate Notebooks Regular Carton (100) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p69", slug: "scotch-brite-scrub-pad-carton-100-", name: "Scotch-Brite Scrub Pad Carton (100)", brand: "Scotch-Brite",
    category: "general", subCategory: "cleaning", image: img("photo-1542838132-92c53300491e"),
    wholesalePrice: 1100, mrp: 1500, moq: 5, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.3), reviewCount: 229, inStock: true,
    stockCount: 506, featured: false,
    description: "High-quality Scotch-Brite Scrub Pad Carton (100) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p70", slug: "aashirvaad-shudh-chakki-atta-10kg-1", name: "Aashirvaad Shudh Chakki Atta 10kg (Variant 2)", brand: "Aashirvaad",
    category: "food-fmcg", subCategory: "atta", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 441, mrp: 520, moq: 20, unit: "bag",
    gstIncluded: true, gstRate: 5, supplierId: "s1",
    rating: Number(4.3), reviewCount: 387, inStock: true,
    stockCount: 1886, featured: false,
    description: "High-quality Aashirvaad Shudh Chakki Atta 10kg for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p71", slug: "india-gate-classic-basmati-rice-5kg-1", name: "India Gate Classic Basmati Rice 5kg (Variant 2)", brand: "India Gate",
    category: "food-fmcg", subCategory: "rice", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 651, mrp: 782, moq: 10, unit: "bag",
    gstIncluded: true, gstRate: 5, supplierId: "s14",
    rating: Number(4.8), reviewCount: 17, inStock: true,
    stockCount: 486, featured: false,
    description: "High-quality India Gate Classic Basmati Rice 5kg for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p72", slug: "fortune-sunlite-refined-sunflower-oil-15l-jar-1", name: "Fortune Sunlite Refined Sunflower Oil 15L Jar (Variant 2)", brand: "Fortune",
    category: "food-fmcg", subCategory: "cooking-oil", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 1869, mrp: 2153, moq: 4, unit: "jar",
    gstIncluded: true, gstRate: 5, supplierId: "s14",
    rating: Number(4.5), reviewCount: 53, inStock: true,
    stockCount: 1977, featured: false,
    description: "High-quality Fortune Sunlite Refined Sunflower Oil 15L Jar for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p73", slug: "tata-salt-iodized-1kg-carton-26-packs--1", name: "Tata Salt Iodized 1kg Carton (26 packs) (Variant 2)", brand: "Tata",
    category: "food-fmcg", subCategory: "salt", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 546, mrp: 683, moq: 5, unit: "carton",
    gstIncluded: true, gstRate: 5, supplierId: "s11",
    rating: Number(4.4), reviewCount: 129, inStock: true,
    stockCount: 981, featured: false,
    description: "High-quality Tata Salt Iodized 1kg Carton (26 packs) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p74", slug: "mdh-garam-masala-100g-carton-48--1", name: "MDH Garam Masala 100g Carton (48) (Variant 2)", brand: "MDH",
    category: "food-fmcg", subCategory: "masalas", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 1943, mrp: 2415, moq: 4, unit: "carton",
    gstIncluded: true, gstRate: 5, supplierId: "s13",
    rating: Number(4.3), reviewCount: 205, inStock: true,
    stockCount: 964, featured: false,
    description: "High-quality MDH Garam Masala 100g Carton (48) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p75", slug: "everest-chilli-powder-500g-1", name: "Everest Chilli Powder 500g (Variant 2)", brand: "Everest",
    category: "food-fmcg", subCategory: "masalas", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 221, mrp: 273, moq: 10, unit: "pack",
    gstIncluded: true, gstRate: 5, supplierId: "s13",
    rating: Number(4.1), reviewCount: 224, inStock: true,
    stockCount: 360, featured: false,
    description: "High-quality Everest Chilli Powder 500g for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p76", slug: "parle-g-glucose-biscuits-family-pack-carton-1", name: "Parle-G Glucose Biscuits Family Pack Carton (Variant 2)", brand: "Parle",
    category: "food-fmcg", subCategory: "biscuits", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 935, mrp: 1134, moq: 10, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s3",
    rating: Number(4.6), reviewCount: 182, inStock: true,
    stockCount: 1218, featured: false,
    description: "High-quality Parle-G Glucose Biscuits Family Pack Carton for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p77", slug: "britannia-good-day-cashew-cookies-carton-1", name: "Britannia Good Day Cashew Cookies Carton (Variant 2)", brand: "Britannia",
    category: "food-fmcg", subCategory: "biscuits", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 1008, mrp: 1260, moq: 8, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s2",
    rating: Number(4.6), reviewCount: 148, inStock: true,
    stockCount: 762, featured: false,
    description: "High-quality Britannia Good Day Cashew Cookies Carton for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p78", slug: "britannia-marie-gold-120g-carton-1", name: "Britannia Marie Gold 120g Carton (Variant 2)", brand: "Britannia",
    category: "food-fmcg", subCategory: "biscuits", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 777, mrp: 945, moq: 10, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s2",
    rating: Number(4.4), reviewCount: 233, inStock: true,
    stockCount: 1000, featured: false,
    description: "High-quality Britannia Marie Gold 120g Carton for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p79", slug: "maggi-2-minute-noodles-masala-pack-of-12-1", name: "Maggi 2-Minute Noodles Masala Pack of 12 (Variant 2)", brand: "Maggi",
    category: "food-fmcg", subCategory: "noodles", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 152, mrp: 176, moq: 20, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s4",
    rating: Number(4.3), reviewCount: 53, inStock: true,
    stockCount: 232, featured: false,
    description: "High-quality Maggi 2-Minute Noodles Masala Pack of 12 for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p80", slug: "sunfeast-yippee-noodles-magic-masala-1", name: "Sunfeast Yippee Noodles Magic Masala (Variant 2)", brand: "Sunfeast",
    category: "food-fmcg", subCategory: "noodles", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 137, mrp: 158, moq: 20, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s1",
    rating: Number(4.4), reviewCount: 63, inStock: true,
    stockCount: 1513, featured: false,
    description: "High-quality Sunfeast Yippee Noodles Magic Masala for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p81", slug: "lay-s-classic-salted-chips-carton-60--1", name: "Lay's Classic Salted Chips Carton (60) (Variant 2)", brand: "Lay's",
    category: "food-fmcg", subCategory: "snacks", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 1029, mrp: 1260, moq: 5, unit: "carton",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(4.9), reviewCount: 471, inStock: true,
    stockCount: 533, featured: false,
    description: "High-quality Lay's Classic Salted Chips Carton (60) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p82", slug: "kurkure-masala-munch-carton-60--1", name: "Kurkure Masala Munch Carton (60) (Variant 2)", brand: "Kurkure",
    category: "food-fmcg", subCategory: "snacks", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 1029, mrp: 1260, moq: 5, unit: "carton",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(4.5), reviewCount: 224, inStock: true,
    stockCount: 1647, featured: false,
    description: "High-quality Kurkure Masala Munch Carton (60) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p83", slug: "haldiram-s-bhujia-sev-1kg-1", name: "Haldiram's Bhujia Sev 1kg (Variant 2)", brand: "Haldiram's",
    category: "food-fmcg", subCategory: "snacks", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 221, mrp: 273, moq: 10, unit: "pack",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(4.8), reviewCount: 345, inStock: true,
    stockCount: 287, featured: false,
    description: "High-quality Haldiram's Bhujia Sev 1kg for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p84", slug: "cadbury-dairy-milk-silk-chocolate-box-24--1", name: "Cadbury Dairy Milk Silk Chocolate Box (24) (Variant 2)", brand: "Cadbury",
    category: "food-fmcg", subCategory: "chocolates", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 1638, mrp: 2016, moq: 3, unit: "box",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.5), reviewCount: 30, inStock: true,
    stockCount: 863, featured: false,
    description: "High-quality Cadbury Dairy Milk Silk Chocolate Box (24) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p85", slug: "amul-spray-milk-powder-1kg-1", name: "Amul Spray Milk Powder 1kg (Variant 2)", brand: "Amul",
    category: "food-fmcg", subCategory: "dairy", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 441, mrp: 494, moq: 12, unit: "tin",
    gstIncluded: true, gstRate: 5, supplierId: "s12",
    rating: Number(4.2), reviewCount: 451, inStock: true,
    stockCount: 1692, featured: false,
    description: "High-quality Amul Spray Milk Powder 1kg for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p86", slug: "nescafe-classic-coffee-200g-jar-1", name: "Nescafe Classic Coffee 200g Jar (Variant 2)", brand: "Nescafe",
    category: "food-fmcg", subCategory: "beverages", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 504, mrp: 578, moq: 12, unit: "jar",
    gstIncluded: true, gstRate: 18, supplierId: "s4",
    rating: Number(4.5), reviewCount: 359, inStock: true,
    stockCount: 1557, featured: false,
    description: "High-quality Nescafe Classic Coffee 200g Jar for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p87", slug: "tata-tea-premium-1kg-1", name: "Tata Tea Premium 1kg (Variant 2)", brand: "Tata Tea",
    category: "food-fmcg", subCategory: "beverages", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 399, mrp: 473, moq: 10, unit: "pack",
    gstIncluded: true, gstRate: 5, supplierId: "s11",
    rating: Number(4.6), reviewCount: 68, inStock: true,
    stockCount: 784, featured: false,
    description: "High-quality Tata Tea Premium 1kg for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p88", slug: "bru-instant-coffee-200g-1", name: "Bru Instant Coffee 200g (Variant 2)", brand: "Bru",
    category: "food-fmcg", subCategory: "beverages", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 326, mrp: 399, moq: 12, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.7), reviewCount: 307, inStock: true,
    stockCount: 200, featured: false,
    description: "High-quality Bru Instant Coffee 200g for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p89", slug: "red-label-tea-1kg-1", name: "Red Label Tea 1kg (Variant 2)", brand: "Brooke Bond",
    category: "food-fmcg", subCategory: "beverages", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 431, mrp: 504, moq: 10, unit: "pack",
    gstIncluded: true, gstRate: 5, supplierId: "s5",
    rating: Number(4.4), reviewCount: 305, inStock: true,
    stockCount: 848, featured: false,
    description: "High-quality Red Label Tea 1kg for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p90", slug: "lux-soft-glow-rose-soap-100g-pack-of-4--1", name: "Lux Soft Glow Rose Soap 100g (Pack of 4) (Variant 2)", brand: "Lux",
    category: "personal-care", subCategory: "soap", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 116, mrp: 147, moq: 20, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.5), reviewCount: 315, inStock: true,
    stockCount: 1547, featured: false,
    description: "High-quality Lux Soft Glow Rose Soap 100g (Pack of 4) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p91", slug: "dove-cream-beauty-bathing-bar-100g-pack-of-3--1", name: "Dove Cream Beauty Bathing Bar 100g (Pack of 3) (Variant 2)", brand: "Dove",
    category: "personal-care", subCategory: "soap", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 152, mrp: 189, moq: 20, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.7), reviewCount: 313, inStock: true,
    stockCount: 1903, featured: false,
    description: "High-quality Dove Cream Beauty Bathing Bar 100g (Pack of 3) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p92", slug: "lifebuoy-total-10-soap-carton-72x100g--1", name: "Lifebuoy Total 10 Soap Carton (72x100g) (Variant 2)", brand: "Lifebuoy",
    category: "personal-care", subCategory: "soap", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 1733, mrp: 2117, moq: 3, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.0), reviewCount: 83, inStock: true,
    stockCount: 131, featured: false,
    description: "High-quality Lifebuoy Total 10 Soap Carton (72x100g) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p93", slug: "pears-pure-gentle-soap-125g-pack-of-3--1", name: "Pears Pure & Gentle Soap 125g (Pack of 3) (Variant 2)", brand: "Pears",
    category: "personal-care", subCategory: "soap", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 184, mrp: 231, moq: 15, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.9), reviewCount: 308, inStock: true,
    stockCount: 1429, featured: false,
    description: "High-quality Pears Pure & Gentle Soap 125g (Pack of 3) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p94", slug: "clinic-plus-strong-long-shampoo-650ml-1", name: "Clinic Plus Strong & Long Shampoo 650ml (Variant 2)", brand: "Clinic Plus",
    category: "personal-care", subCategory: "haircare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 305, mrp: 368, moq: 10, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.4), reviewCount: 413, inStock: true,
    stockCount: 665, featured: false,
    description: "High-quality Clinic Plus Strong & Long Shampoo 650ml for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p95", slug: "sunsilk-black-shine-shampoo-650ml-1", name: "Sunsilk Black Shine Shampoo 650ml (Variant 2)", brand: "Sunsilk",
    category: "personal-care", subCategory: "haircare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 336, mrp: 419, moq: 10, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.3), reviewCount: 47, inStock: true,
    stockCount: 1933, featured: false,
    description: "High-quality Sunsilk Black Shine Shampoo 650ml for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p96", slug: "pantene-advanced-hair-fall-solution-650ml-1", name: "Pantene Advanced Hair Fall Solution 650ml (Variant 2)", brand: "Pantene",
    category: "personal-care", subCategory: "haircare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 357, mrp: 446, moq: 10, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.6), reviewCount: 320, inStock: true,
    stockCount: 1754, featured: false,
    description: "High-quality Pantene Advanced Hair Fall Solution 650ml for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p97", slug: "head-shoulders-anti-dandruff-650ml-1", name: "Head & Shoulders Anti Dandruff 650ml (Variant 2)", brand: "Head & Shoulders",
    category: "personal-care", subCategory: "haircare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 431, mrp: 536, moq: 10, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.1), reviewCount: 310, inStock: true,
    stockCount: 249, featured: false,
    description: "High-quality Head & Shoulders Anti Dandruff 650ml for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p98", slug: "colgate-strong-teeth-500g-carton-24x500g--1", name: "Colgate Strong Teeth 500g Carton (24x500g) (Variant 2)", brand: "Colgate",
    category: "personal-care", subCategory: "oralcare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 3308, mrp: 4032, moq: 2, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.5), reviewCount: 162, inStock: true,
    stockCount: 520, featured: false,
    description: "High-quality Colgate Strong Teeth 500g Carton (24x500g) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p99", slug: "closeup-everfresh-red-hot-150g-pack-of-2--1", name: "Closeup Everfresh Red Hot 150g (Pack of 2) (Variant 2)", brand: "Closeup",
    category: "personal-care", subCategory: "oralcare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 152, mrp: 189, moq: 15, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.3), reviewCount: 113, inStock: true,
    stockCount: 1291, featured: false,
    description: "High-quality Closeup Everfresh Red Hot 150g (Pack of 2) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p100", slug: "pepsodent-germi-check-150g-1", name: "Pepsodent Germi Check 150g (Variant 2)", brand: "Pepsodent",
    category: "personal-care", subCategory: "oralcare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 82, mrp: 100, moq: 24, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.2), reviewCount: 331, inStock: true,
    stockCount: 872, featured: false,
    description: "High-quality Pepsodent Germi Check 150g for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p101", slug: "vaseline-intensive-care-body-lotion-400ml-1", name: "Vaseline Intensive Care Body Lotion 400ml (Variant 2)", brand: "Vaseline",
    category: "personal-care", subCategory: "skincare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 257, mrp: 331, moq: 12, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.9), reviewCount: 328, inStock: true,
    stockCount: 753, featured: false,
    description: "High-quality Vaseline Intensive Care Body Lotion 400ml for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p102", slug: "nivea-soft-light-moisturiser-200ml-1", name: "Nivea Soft Light Moisturiser 200ml (Variant 2)", brand: "Nivea",
    category: "personal-care", subCategory: "skincare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 221, mrp: 284, moq: 12, unit: "tub",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.9), reviewCount: 454, inStock: true,
    stockCount: 1192, featured: false,
    description: "High-quality Nivea Soft Light Moisturiser 200ml for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p103", slug: "pond-s-white-beauty-face-wash-100g-1", name: "Pond's White Beauty Face Wash 100g (Variant 2)", brand: "Pond's",
    category: "personal-care", subCategory: "skincare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 137, mrp: 173, moq: 15, unit: "tube",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.9), reviewCount: 148, inStock: true,
    stockCount: 1801, featured: false,
    description: "High-quality Pond's White Beauty Face Wash 100g for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p104", slug: "lakme-peach-milk-moisturizer-120ml-1", name: "Lakme Peach Milk Moisturizer 120ml (Variant 2)", brand: "Lakme",
    category: "personal-care", subCategory: "skincare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 173, mrp: 221, moq: 12, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.1), reviewCount: 272, inStock: true,
    stockCount: 939, featured: false,
    description: "High-quality Lakme Peach Milk Moisturizer 120ml for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p105", slug: "surf-excel-easy-wash-detergent-powder-3kg-1", name: "Surf Excel Easy Wash Detergent Powder 3kg (Variant 2)", brand: "Surf Excel",
    category: "home-care", subCategory: "detergent", image: img("photo-1583947215259-38e31be8751f"),
    wholesalePrice: 378, mrp: 441, moq: 10, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.6), reviewCount: 242, inStock: true,
    stockCount: 758, featured: false,
    description: "High-quality Surf Excel Easy Wash Detergent Powder 3kg for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p106", slug: "ariel-matic-front-load-detergent-2kg-1", name: "Ariel Matic Front Load Detergent 2kg (Variant 2)", brand: "Ariel",
    category: "home-care", subCategory: "detergent", image: img("photo-1583947215259-38e31be8751f"),
    wholesalePrice: 473, mrp: 567, moq: 8, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.8), reviewCount: 42, inStock: true,
    stockCount: 1408, featured: false,
    description: "High-quality Ariel Matic Front Load Detergent 2kg for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p107", slug: "wheel-active-lemon-jasmine-1kg-carton-20--1", name: "Wheel Active Lemon & Jasmine 1kg Carton (20) (Variant 2)", brand: "Wheel",
    category: "home-care", subCategory: "detergent", image: img("photo-1583947215259-38e31be8751f"),
    wholesalePrice: 1155, mrp: 1365, moq: 5, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.4), reviewCount: 315, inStock: true,
    stockCount: 1642, featured: false,
    description: "High-quality Wheel Active Lemon & Jasmine 1kg Carton (20) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p108", slug: "ghadi-detergent-powder-1kg-carton-24--1", name: "Ghadi Detergent Powder 1kg Carton (24) (Variant 2)", brand: "Ghadi",
    category: "home-care", subCategory: "detergent", image: img("photo-1583947215259-38e31be8751f"),
    wholesalePrice: 1313, mrp: 1638, moq: 5, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.2), reviewCount: 114, inStock: true,
    stockCount: 1871, featured: false,
    description: "High-quality Ghadi Detergent Powder 1kg Carton (24) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p109", slug: "lizol-surface-cleaner-pine-2l-1", name: "Lizol Surface Cleaner Pine 2L (Variant 2)", brand: "Lizol",
    category: "home-care", subCategory: "cleaner", image: img("photo-1583947215259-38e31be8751f"),
    wholesalePrice: 305, mrp: 368, moq: 6, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.2), reviewCount: 401, inStock: true,
    stockCount: 418, featured: false,
    description: "High-quality Lizol Surface Cleaner Pine 2L for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p110", slug: "harpic-power-plus-toilet-cleaner-1l-1", name: "Harpic Power Plus Toilet Cleaner 1L (Variant 2)", brand: "Harpic",
    category: "home-care", subCategory: "cleaner", image: img("photo-1583947215259-38e31be8751f"),
    wholesalePrice: 173, mrp: 209, moq: 12, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.1), reviewCount: 131, inStock: true,
    stockCount: 1111, featured: false,
    description: "High-quality Harpic Power Plus Toilet Cleaner 1L for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p111", slug: "vim-dishwash-liquid-gel-lemon-1-5l-1", name: "Vim Dishwash Liquid Gel Lemon 1.5L (Variant 2)", brand: "Vim",
    category: "home-care", subCategory: "dishwash", image: img("photo-1583947215259-38e31be8751f"),
    wholesalePrice: 263, mrp: 326, moq: 6, unit: "jar",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(5.0), reviewCount: 233, inStock: true,
    stockCount: 1964, featured: false,
    description: "High-quality Vim Dishwash Liquid Gel Lemon 1.5L for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p112", slug: "exo-dish-shine-bar-carton-60-x-250g--1", name: "Exo Dish Shine Bar Carton (60 x 250g) (Variant 2)", brand: "Exo",
    category: "home-care", subCategory: "dishwash", image: img("photo-1583947215259-38e31be8751f"),
    wholesalePrice: 1523, mrp: 1890, moq: 3, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.1), reviewCount: 225, inStock: true,
    stockCount: 1761, featured: false,
    description: "High-quality Exo Dish Shine Bar Carton (60 x 250g) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p113", slug: "colin-glass-cleaner-500ml-1", name: "Colin Glass Cleaner 500ml (Variant 2)", brand: "Colin",
    category: "home-care", subCategory: "cleaner", image: img("photo-1583947215259-38e31be8751f"),
    wholesalePrice: 86, mrp: 105, moq: 12, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.1), reviewCount: 170, inStock: true,
    stockCount: 165, featured: false,
    description: "High-quality Colin Glass Cleaner 500ml for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p114", slug: "comfort-fabric-conditioner-blue-2l-1", name: "Comfort Fabric Conditioner Blue 2L (Variant 2)", brand: "Comfort",
    category: "home-care", subCategory: "detergent", image: img("photo-1583947215259-38e31be8751f"),
    wholesalePrice: 399, mrp: 483, moq: 6, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.9), reviewCount: 352, inStock: true,
    stockCount: 1133, featured: false,
    description: "High-quality Comfort Fabric Conditioner Blue 2L for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p115", slug: "boat-bassheads-100-in-ear-wired-earphones-1", name: "boAt BassHeads 100 In-Ear Wired Earphones (Variant 2)", brand: "boAt",
    category: "electronics", subCategory: "audio", image: img("photo-1498049794561-7780e7231661"),
    wholesalePrice: 314, mrp: 419, moq: 20, unit: "piece",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.6), reviewCount: 169, inStock: true,
    stockCount: 1107, featured: false,
    description: "High-quality boAt BassHeads 100 In-Ear Wired Earphones for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p116", slug: "mi-10000mah-power-bank-3i-1", name: "Mi 10000mAH Power Bank 3i (Variant 2)", brand: "Mi",
    category: "electronics", subCategory: "accessories", image: img("photo-1498049794561-7780e7231661"),
    wholesalePrice: 944, mrp: 1259, moq: 10, unit: "piece",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.2), reviewCount: 194, inStock: true,
    stockCount: 797, featured: false,
    description: "High-quality Mi 10000mAH Power Bank 3i for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p117", slug: "realme-18w-fast-charger-adapter-1", name: "Realme 18W Fast Charger Adapter (Variant 2)", brand: "Realme",
    category: "electronics", subCategory: "accessories", image: img("photo-1498049794561-7780e7231661"),
    wholesalePrice: 419, mrp: 629, moq: 15, unit: "piece",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.8), reviewCount: 140, inStock: true,
    stockCount: 1964, featured: false,
    description: "High-quality Realme 18W Fast Charger Adapter for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p118", slug: "philips-9w-led-bulb-pack-of-10--1", name: "Philips 9W LED Bulb (Pack of 10) (Variant 2)", brand: "Philips",
    category: "electronics", subCategory: "lighting", image: img("photo-1498049794561-7780e7231661"),
    wholesalePrice: 893, mrp: 1260, moq: 5, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.7), reviewCount: 66, inStock: true,
    stockCount: 1213, featured: false,
    description: "High-quality Philips 9W LED Bulb (Pack of 10) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p119", slug: "havells-crabtree-switches-carton-50--1", name: "Havells Crabtree Switches Carton (50) (Variant 2)", brand: "Havells",
    category: "electronics", subCategory: "electricals", image: img("photo-1498049794561-7780e7231661"),
    wholesalePrice: 2625, mrp: 3413, moq: 2, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.8), reviewCount: 131, inStock: true,
    stockCount: 172, featured: false,
    description: "High-quality Havells Crabtree Switches Carton (50) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p120", slug: "syska-15w-led-bulb-carton-20--1", name: "Syska 15W LED Bulb Carton (20) (Variant 2)", brand: "Syska",
    category: "electronics", subCategory: "lighting", image: img("photo-1498049794561-7780e7231661"),
    wholesalePrice: 2310, mrp: 3150, moq: 2, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.6), reviewCount: 31, inStock: true,
    stockCount: 1924, featured: false,
    description: "High-quality Syska 15W LED Bulb Carton (20) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p121", slug: "eveready-aa-batteries-carton-100--1", name: "Eveready AA Batteries Carton (100) (Variant 2)", brand: "Eveready",
    category: "electronics", subCategory: "electricals", image: img("photo-1498049794561-7780e7231661"),
    wholesalePrice: 1260, mrp: 1575, moq: 5, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.5), reviewCount: 116, inStock: true,
    stockCount: 51, featured: false,
    description: "High-quality Eveready AA Batteries Carton (100) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p122", slug: "anchor-4-way-extension-board-1", name: "Anchor 4-Way Extension Board (Variant 2)", brand: "Anchor",
    category: "electronics", subCategory: "electricals", image: img("photo-1498049794561-7780e7231661"),
    wholesalePrice: 263, mrp: 368, moq: 10, unit: "piece",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.4), reviewCount: 505, inStock: true,
    stockCount: 932, featured: false,
    description: "High-quality Anchor 4-Way Extension Board for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p123", slug: "dettol-antiseptic-liquid-1l-1", name: "Dettol Antiseptic Liquid 1L (Variant 2)", brand: "Dettol",
    category: "healthcare", subCategory: "first-aid", image: img("photo-1584308666744-24d59b298715"),
    wholesalePrice: 294, mrp: 352, moq: 10, unit: "bottle",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(4.1), reviewCount: 443, inStock: true,
    stockCount: 521, featured: false,
    description: "High-quality Dettol Antiseptic Liquid 1L for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p124", slug: "savlon-antiseptic-disinfectant-liquid-1l-1", name: "Savlon Antiseptic Disinfectant Liquid 1L (Variant 2)", brand: "Savlon",
    category: "healthcare", subCategory: "first-aid", image: img("photo-1584308666744-24d59b298715"),
    wholesalePrice: 273, mrp: 331, moq: 10, unit: "bottle",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(4.6), reviewCount: 482, inStock: true,
    stockCount: 445, featured: false,
    description: "High-quality Savlon Antiseptic Disinfectant Liquid 1L for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p125", slug: "volini-pain-relief-spray-60g-1", name: "Volini Pain Relief Spray 60g (Variant 2)", brand: "Volini",
    category: "healthcare", subCategory: "pain-relief", image: img("photo-1584308666744-24d59b298715"),
    wholesalePrice: 131, mrp: 163, moq: 20, unit: "piece",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(4.6), reviewCount: 271, inStock: true,
    stockCount: 1576, featured: false,
    description: "High-quality Volini Pain Relief Spray 60g for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p126", slug: "digene-acidity-gas-relief-tablets-150--1", name: "Digene Acidity & Gas Relief Tablets (150) (Variant 2)", brand: "Digene",
    category: "healthcare", subCategory: "digestion", image: img("photo-1584308666744-24d59b298715"),
    wholesalePrice: 189, mrp: 236, moq: 10, unit: "pack",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(4.2), reviewCount: 161, inStock: true,
    stockCount: 1339, featured: false,
    description: "High-quality Digene Acidity & Gas Relief Tablets (150) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p127", slug: "crocin-advance-500mg-tablets-carton-20-strips--1", name: "Crocin Advance 500mg Tablets Carton (20 strips) (Variant 2)", brand: "Crocin",
    category: "healthcare", subCategory: "pain-relief", image: img("photo-1584308666744-24d59b298715"),
    wholesalePrice: 294, mrp: 357, moq: 5, unit: "carton",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(4.0), reviewCount: 415, inStock: true,
    stockCount: 1942, featured: false,
    description: "High-quality Crocin Advance 500mg Tablets Carton (20 strips) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p128", slug: "disposable-surgical-gloves-carton-100-pairs--1", name: "Disposable Surgical Gloves Carton (100 pairs) (Variant 2)", brand: "Generic",
    category: "healthcare", subCategory: "medical", image: img("photo-1584308666744-24d59b298715"),
    wholesalePrice: 473, mrp: 630, moq: 10, unit: "carton",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(4.6), reviewCount: 59, inStock: true,
    stockCount: 587, featured: false,
    description: "High-quality Disposable Surgical Gloves Carton (100 pairs) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p129", slug: "3-ply-surgical-face-masks-carton-500-pcs--1", name: "3-Ply Surgical Face Masks Carton (500 pcs) (Variant 2)", brand: "Generic",
    category: "healthcare", subCategory: "medical", image: img("photo-1584308666744-24d59b298715"),
    wholesalePrice: 683, mrp: 1050, moq: 10, unit: "carton",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(4.0), reviewCount: 12, inStock: true,
    stockCount: 1515, featured: false,
    description: "High-quality 3-Ply Surgical Face Masks Carton (500 pcs) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p130", slug: "lifebuoy-hand-sanitizer-500ml-1", name: "Lifebuoy Hand Sanitizer 500ml (Variant 2)", brand: "Lifebuoy",
    category: "healthcare", subCategory: "first-aid", image: img("photo-1584308666744-24d59b298715"),
    wholesalePrice: 189, mrp: 263, moq: 12, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.5), reviewCount: 35, inStock: true,
    stockCount: 284, featured: false,
    description: "High-quality Lifebuoy Hand Sanitizer 500ml for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p131", slug: "cello-plastic-bucket-20l-carton-10--1", name: "Cello Plastic Bucket 20L Carton (10) (Variant 2)", brand: "Cello",
    category: "general", subCategory: "home", image: img("photo-1542838132-92c53300491e"),
    wholesalePrice: 1575, mrp: 2310, moq: 3, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.3), reviewCount: 261, inStock: true,
    stockCount: 1318, featured: false,
    description: "High-quality Cello Plastic Bucket 20L Carton (10) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p132", slug: "eco-friendly-carry-bags-bundle-1000-pcs--1", name: "Eco-Friendly Carry Bags Bundle (1000 pcs) (Variant 2)", brand: "Generic",
    category: "general", subCategory: "packaging", image: img("photo-1542838132-92c53300491e"),
    wholesalePrice: 893, mrp: 1260, moq: 5, unit: "bundle",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(4.8), reviewCount: 238, inStock: true,
    stockCount: 381, featured: false,
    description: "High-quality Eco-Friendly Carry Bags Bundle (1000 pcs) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p133", slug: "paper-coffee-cups-150ml-carton-1000--1", name: "Paper Coffee Cups 150ml Carton (1000) (Variant 2)", brand: "Generic",
    category: "general", subCategory: "disposables", image: img("photo-1542838132-92c53300491e"),
    wholesalePrice: 945, mrp: 1365, moq: 5, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.5), reviewCount: 286, inStock: true,
    stockCount: 1564, featured: false,
    description: "High-quality Paper Coffee Cups 150ml Carton (1000) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p134", slug: "disposable-plastic-plates-carton-500--1", name: "Disposable Plastic Plates Carton (500) (Variant 2)", brand: "Generic",
    category: "general", subCategory: "disposables", image: img("photo-1542838132-92c53300491e"),
    wholesalePrice: 1155, mrp: 1575, moq: 5, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(5.0), reviewCount: 468, inStock: true,
    stockCount: 775, featured: false,
    description: "High-quality Disposable Plastic Plates Carton (500) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p135", slug: "brown-packaging-tape-2-inch-carton-72--1", name: "Brown Packaging Tape 2 Inch Carton (72) (Variant 2)", brand: "Wonder Tape",
    category: "general", subCategory: "packaging", image: img("photo-1542838132-92c53300491e"),
    wholesalePrice: 1890, mrp: 2625, moq: 3, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.6), reviewCount: 58, inStock: true,
    stockCount: 1667, featured: false,
    description: "High-quality Brown Packaging Tape 2 Inch Carton (72) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p136", slug: "nayasa-storage-boxes-set-carton-12-sets--1", name: "Nayasa Storage Boxes Set Carton (12 sets) (Variant 2)", brand: "Nayasa",
    category: "general", subCategory: "home", image: img("photo-1542838132-92c53300491e"),
    wholesalePrice: 3360, mrp: 4725, moq: 2, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.2), reviewCount: 80, inStock: true,
    stockCount: 739, featured: false,
    description: "High-quality Nayasa Storage Boxes Set Carton (12 sets) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p137", slug: "classmate-notebooks-regular-carton-100--1", name: "Classmate Notebooks Regular Carton (100) (Variant 2)", brand: "Classmate",
    category: "general", subCategory: "stationery", image: img("photo-1542838132-92c53300491e"),
    wholesalePrice: 3570, mrp: 4200, moq: 3, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.9), reviewCount: 496, inStock: true,
    stockCount: 585, featured: false,
    description: "High-quality Classmate Notebooks Regular Carton (100) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p138", slug: "scotch-brite-scrub-pad-carton-100--1", name: "Scotch-Brite Scrub Pad Carton (100) (Variant 2)", brand: "Scotch-Brite",
    category: "general", subCategory: "cleaning", image: img("photo-1542838132-92c53300491e"),
    wholesalePrice: 1155, mrp: 1575, moq: 5, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.7), reviewCount: 336, inStock: true,
    stockCount: 1921, featured: false,
    description: "High-quality Scotch-Brite Scrub Pad Carton (100) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p139", slug: "aashirvaad-shudh-chakki-atta-10kg-2", name: "Aashirvaad Shudh Chakki Atta 10kg (Variant 3)", brand: "Aashirvaad",
    category: "food-fmcg", subCategory: "atta", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 462, mrp: 545, moq: 20, unit: "bag",
    gstIncluded: true, gstRate: 5, supplierId: "s1",
    rating: Number(4.2), reviewCount: 98, inStock: true,
    stockCount: 581, featured: false,
    description: "High-quality Aashirvaad Shudh Chakki Atta 10kg for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p140", slug: "india-gate-classic-basmati-rice-5kg-2", name: "India Gate Classic Basmati Rice 5kg (Variant 3)", brand: "India Gate",
    category: "food-fmcg", subCategory: "rice", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 682, mrp: 820, moq: 10, unit: "bag",
    gstIncluded: true, gstRate: 5, supplierId: "s14",
    rating: Number(4.9), reviewCount: 505, inStock: true,
    stockCount: 413, featured: false,
    description: "High-quality India Gate Classic Basmati Rice 5kg for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p141", slug: "fortune-sunlite-refined-sunflower-oil-15l-jar-2", name: "Fortune Sunlite Refined Sunflower Oil 15L Jar (Variant 3)", brand: "Fortune",
    category: "food-fmcg", subCategory: "cooking-oil", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 1958, mrp: 2255, moq: 4, unit: "jar",
    gstIncluded: true, gstRate: 5, supplierId: "s14",
    rating: Number(4.0), reviewCount: 411, inStock: true,
    stockCount: 1906, featured: false,
    description: "High-quality Fortune Sunlite Refined Sunflower Oil 15L Jar for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p142", slug: "tata-salt-iodized-1kg-carton-26-packs--2", name: "Tata Salt Iodized 1kg Carton (26 packs) (Variant 3)", brand: "Tata",
    category: "food-fmcg", subCategory: "salt", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 572, mrp: 715, moq: 5, unit: "carton",
    gstIncluded: true, gstRate: 5, supplierId: "s11",
    rating: Number(4.5), reviewCount: 282, inStock: true,
    stockCount: 629, featured: false,
    description: "High-quality Tata Salt Iodized 1kg Carton (26 packs) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p143", slug: "mdh-garam-masala-100g-carton-48--2", name: "MDH Garam Masala 100g Carton (48) (Variant 3)", brand: "MDH",
    category: "food-fmcg", subCategory: "masalas", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 2035, mrp: 2530, moq: 4, unit: "carton",
    gstIncluded: true, gstRate: 5, supplierId: "s13",
    rating: Number(4.4), reviewCount: 39, inStock: true,
    stockCount: 128, featured: false,
    description: "High-quality MDH Garam Masala 100g Carton (48) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p144", slug: "everest-chilli-powder-500g-2", name: "Everest Chilli Powder 500g (Variant 3)", brand: "Everest",
    category: "food-fmcg", subCategory: "masalas", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 231, mrp: 286, moq: 10, unit: "pack",
    gstIncluded: true, gstRate: 5, supplierId: "s13",
    rating: Number(4.7), reviewCount: 202, inStock: true,
    stockCount: 1805, featured: false,
    description: "High-quality Everest Chilli Powder 500g for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p145", slug: "parle-g-glucose-biscuits-family-pack-carton-2", name: "Parle-G Glucose Biscuits Family Pack Carton (Variant 3)", brand: "Parle",
    category: "food-fmcg", subCategory: "biscuits", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 979, mrp: 1188, moq: 10, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s3",
    rating: Number(4.9), reviewCount: 271, inStock: true,
    stockCount: 1619, featured: false,
    description: "High-quality Parle-G Glucose Biscuits Family Pack Carton for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p146", slug: "britannia-good-day-cashew-cookies-carton-2", name: "Britannia Good Day Cashew Cookies Carton (Variant 3)", brand: "Britannia",
    category: "food-fmcg", subCategory: "biscuits", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 1056, mrp: 1320, moq: 8, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s2",
    rating: Number(5.0), reviewCount: 478, inStock: true,
    stockCount: 1371, featured: false,
    description: "High-quality Britannia Good Day Cashew Cookies Carton for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p147", slug: "britannia-marie-gold-120g-carton-2", name: "Britannia Marie Gold 120g Carton (Variant 3)", brand: "Britannia",
    category: "food-fmcg", subCategory: "biscuits", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 814, mrp: 990, moq: 10, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s2",
    rating: Number(4.7), reviewCount: 367, inStock: true,
    stockCount: 1839, featured: false,
    description: "High-quality Britannia Marie Gold 120g Carton for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p148", slug: "maggi-2-minute-noodles-masala-pack-of-12-2", name: "Maggi 2-Minute Noodles Masala Pack of 12 (Variant 3)", brand: "Maggi",
    category: "food-fmcg", subCategory: "noodles", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 160, mrp: 185, moq: 20, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s4",
    rating: Number(4.8), reviewCount: 128, inStock: true,
    stockCount: 1642, featured: false,
    description: "High-quality Maggi 2-Minute Noodles Masala Pack of 12 for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p149", slug: "sunfeast-yippee-noodles-magic-masala-2", name: "Sunfeast Yippee Noodles Magic Masala (Variant 3)", brand: "Sunfeast",
    category: "food-fmcg", subCategory: "noodles", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 143, mrp: 165, moq: 20, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s1",
    rating: Number(4.2), reviewCount: 147, inStock: true,
    stockCount: 1992, featured: false,
    description: "High-quality Sunfeast Yippee Noodles Magic Masala for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p150", slug: "lay-s-classic-salted-chips-carton-60--2", name: "Lay's Classic Salted Chips Carton (60) (Variant 3)", brand: "Lay's",
    category: "food-fmcg", subCategory: "snacks", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 1078, mrp: 1320, moq: 5, unit: "carton",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(4.5), reviewCount: 231, inStock: true,
    stockCount: 1231, featured: false,
    description: "High-quality Lay's Classic Salted Chips Carton (60) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p151", slug: "kurkure-masala-munch-carton-60--2", name: "Kurkure Masala Munch Carton (60) (Variant 3)", brand: "Kurkure",
    category: "food-fmcg", subCategory: "snacks", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 1078, mrp: 1320, moq: 5, unit: "carton",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(4.4), reviewCount: 476, inStock: true,
    stockCount: 2010, featured: false,
    description: "High-quality Kurkure Masala Munch Carton (60) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p152", slug: "haldiram-s-bhujia-sev-1kg-2", name: "Haldiram's Bhujia Sev 1kg (Variant 3)", brand: "Haldiram's",
    category: "food-fmcg", subCategory: "snacks", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 231, mrp: 286, moq: 10, unit: "pack",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(4.4), reviewCount: 43, inStock: true,
    stockCount: 1280, featured: false,
    description: "High-quality Haldiram's Bhujia Sev 1kg for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p153", slug: "cadbury-dairy-milk-silk-chocolate-box-24--2", name: "Cadbury Dairy Milk Silk Chocolate Box (24) (Variant 3)", brand: "Cadbury",
    category: "food-fmcg", subCategory: "chocolates", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 1716, mrp: 2112, moq: 3, unit: "box",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.5), reviewCount: 416, inStock: true,
    stockCount: 1945, featured: false,
    description: "High-quality Cadbury Dairy Milk Silk Chocolate Box (24) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p154", slug: "amul-spray-milk-powder-1kg-2", name: "Amul Spray Milk Powder 1kg (Variant 3)", brand: "Amul",
    category: "food-fmcg", subCategory: "dairy", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 462, mrp: 517, moq: 12, unit: "tin",
    gstIncluded: true, gstRate: 5, supplierId: "s12",
    rating: Number(4.3), reviewCount: 457, inStock: true,
    stockCount: 659, featured: false,
    description: "High-quality Amul Spray Milk Powder 1kg for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p155", slug: "nescafe-classic-coffee-200g-jar-2", name: "Nescafe Classic Coffee 200g Jar (Variant 3)", brand: "Nescafe",
    category: "food-fmcg", subCategory: "beverages", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 528, mrp: 605, moq: 12, unit: "jar",
    gstIncluded: true, gstRate: 18, supplierId: "s4",
    rating: Number(4.6), reviewCount: 406, inStock: true,
    stockCount: 370, featured: false,
    description: "High-quality Nescafe Classic Coffee 200g Jar for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p156", slug: "tata-tea-premium-1kg-2", name: "Tata Tea Premium 1kg (Variant 3)", brand: "Tata Tea",
    category: "food-fmcg", subCategory: "beverages", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 418, mrp: 495, moq: 10, unit: "pack",
    gstIncluded: true, gstRate: 5, supplierId: "s11",
    rating: Number(4.2), reviewCount: 368, inStock: true,
    stockCount: 799, featured: false,
    description: "High-quality Tata Tea Premium 1kg for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p157", slug: "bru-instant-coffee-200g-2", name: "Bru Instant Coffee 200g (Variant 3)", brand: "Bru",
    category: "food-fmcg", subCategory: "beverages", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 341, mrp: 418, moq: 12, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.4), reviewCount: 446, inStock: true,
    stockCount: 1304, featured: false,
    description: "High-quality Bru Instant Coffee 200g for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p158", slug: "red-label-tea-1kg-2", name: "Red Label Tea 1kg (Variant 3)", brand: "Brooke Bond",
    category: "food-fmcg", subCategory: "beverages", image: img("photo-1606914501449-5a96b6ce24ca"),
    wholesalePrice: 451, mrp: 528, moq: 10, unit: "pack",
    gstIncluded: true, gstRate: 5, supplierId: "s5",
    rating: Number(4.9), reviewCount: 74, inStock: true,
    stockCount: 1120, featured: false,
    description: "High-quality Red Label Tea 1kg for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p159", slug: "lux-soft-glow-rose-soap-100g-pack-of-4--2", name: "Lux Soft Glow Rose Soap 100g (Pack of 4) (Variant 3)", brand: "Lux",
    category: "personal-care", subCategory: "soap", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 121, mrp: 154, moq: 20, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.5), reviewCount: 463, inStock: true,
    stockCount: 513, featured: false,
    description: "High-quality Lux Soft Glow Rose Soap 100g (Pack of 4) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p160", slug: "dove-cream-beauty-bathing-bar-100g-pack-of-3--2", name: "Dove Cream Beauty Bathing Bar 100g (Pack of 3) (Variant 3)", brand: "Dove",
    category: "personal-care", subCategory: "soap", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 160, mrp: 198, moq: 20, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.2), reviewCount: 250, inStock: true,
    stockCount: 1542, featured: false,
    description: "High-quality Dove Cream Beauty Bathing Bar 100g (Pack of 3) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p161", slug: "lifebuoy-total-10-soap-carton-72x100g--2", name: "Lifebuoy Total 10 Soap Carton (72x100g) (Variant 3)", brand: "Lifebuoy",
    category: "personal-care", subCategory: "soap", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 1815, mrp: 2218, moq: 3, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.8), reviewCount: 169, inStock: true,
    stockCount: 1263, featured: false,
    description: "High-quality Lifebuoy Total 10 Soap Carton (72x100g) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p162", slug: "pears-pure-gentle-soap-125g-pack-of-3--2", name: "Pears Pure & Gentle Soap 125g (Pack of 3) (Variant 3)", brand: "Pears",
    category: "personal-care", subCategory: "soap", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 193, mrp: 242, moq: 15, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.2), reviewCount: 443, inStock: true,
    stockCount: 1666, featured: false,
    description: "High-quality Pears Pure & Gentle Soap 125g (Pack of 3) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p163", slug: "clinic-plus-strong-long-shampoo-650ml-2", name: "Clinic Plus Strong & Long Shampoo 650ml (Variant 3)", brand: "Clinic Plus",
    category: "personal-care", subCategory: "haircare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 319, mrp: 385, moq: 10, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.8), reviewCount: 277, inStock: true,
    stockCount: 139, featured: false,
    description: "High-quality Clinic Plus Strong & Long Shampoo 650ml for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p164", slug: "sunsilk-black-shine-shampoo-650ml-2", name: "Sunsilk Black Shine Shampoo 650ml (Variant 3)", brand: "Sunsilk",
    category: "personal-care", subCategory: "haircare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 352, mrp: 439, moq: 10, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(5.0), reviewCount: 126, inStock: true,
    stockCount: 1511, featured: false,
    description: "High-quality Sunsilk Black Shine Shampoo 650ml for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p165", slug: "pantene-advanced-hair-fall-solution-650ml-2", name: "Pantene Advanced Hair Fall Solution 650ml (Variant 3)", brand: "Pantene",
    category: "personal-care", subCategory: "haircare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 374, mrp: 468, moq: 10, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.4), reviewCount: 78, inStock: true,
    stockCount: 761, featured: false,
    description: "High-quality Pantene Advanced Hair Fall Solution 650ml for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p166", slug: "head-shoulders-anti-dandruff-650ml-2", name: "Head & Shoulders Anti Dandruff 650ml (Variant 3)", brand: "Head & Shoulders",
    category: "personal-care", subCategory: "haircare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 451, mrp: 561, moq: 10, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.0), reviewCount: 470, inStock: true,
    stockCount: 1578, featured: false,
    description: "High-quality Head & Shoulders Anti Dandruff 650ml for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p167", slug: "colgate-strong-teeth-500g-carton-24x500g--2", name: "Colgate Strong Teeth 500g Carton (24x500g) (Variant 3)", brand: "Colgate",
    category: "personal-care", subCategory: "oralcare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 3465, mrp: 4224, moq: 2, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.7), reviewCount: 229, inStock: true,
    stockCount: 1367, featured: false,
    description: "High-quality Colgate Strong Teeth 500g Carton (24x500g) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p168", slug: "closeup-everfresh-red-hot-150g-pack-of-2--2", name: "Closeup Everfresh Red Hot 150g (Pack of 2) (Variant 3)", brand: "Closeup",
    category: "personal-care", subCategory: "oralcare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 160, mrp: 198, moq: 15, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.4), reviewCount: 234, inStock: true,
    stockCount: 294, featured: false,
    description: "High-quality Closeup Everfresh Red Hot 150g (Pack of 2) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p169", slug: "pepsodent-germi-check-150g-2", name: "Pepsodent Germi Check 150g (Variant 3)", brand: "Pepsodent",
    category: "personal-care", subCategory: "oralcare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 86, mrp: 105, moq: 24, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.5), reviewCount: 452, inStock: true,
    stockCount: 283, featured: false,
    description: "High-quality Pepsodent Germi Check 150g for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p170", slug: "vaseline-intensive-care-body-lotion-400ml-2", name: "Vaseline Intensive Care Body Lotion 400ml (Variant 3)", brand: "Vaseline",
    category: "personal-care", subCategory: "skincare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 270, mrp: 347, moq: 12, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.3), reviewCount: 275, inStock: true,
    stockCount: 607, featured: false,
    description: "High-quality Vaseline Intensive Care Body Lotion 400ml for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p171", slug: "nivea-soft-light-moisturiser-200ml-2", name: "Nivea Soft Light Moisturiser 200ml (Variant 3)", brand: "Nivea",
    category: "personal-care", subCategory: "skincare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 231, mrp: 297, moq: 12, unit: "tub",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.5), reviewCount: 489, inStock: true,
    stockCount: 1127, featured: false,
    description: "High-quality Nivea Soft Light Moisturiser 200ml for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p172", slug: "pond-s-white-beauty-face-wash-100g-2", name: "Pond's White Beauty Face Wash 100g (Variant 3)", brand: "Pond's",
    category: "personal-care", subCategory: "skincare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 143, mrp: 182, moq: 15, unit: "tube",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(5.0), reviewCount: 292, inStock: true,
    stockCount: 554, featured: false,
    description: "High-quality Pond's White Beauty Face Wash 100g for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p173", slug: "lakme-peach-milk-moisturizer-120ml-2", name: "Lakme Peach Milk Moisturizer 120ml (Variant 3)", brand: "Lakme",
    category: "personal-care", subCategory: "skincare", image: img("photo-1556228578-8d89ce4a0378"),
    wholesalePrice: 182, mrp: 231, moq: 12, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.5), reviewCount: 32, inStock: true,
    stockCount: 1254, featured: false,
    description: "High-quality Lakme Peach Milk Moisturizer 120ml for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p174", slug: "surf-excel-easy-wash-detergent-powder-3kg-2", name: "Surf Excel Easy Wash Detergent Powder 3kg (Variant 3)", brand: "Surf Excel",
    category: "home-care", subCategory: "detergent", image: img("photo-1583947215259-38e31be8751f"),
    wholesalePrice: 396, mrp: 462, moq: 10, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.2), reviewCount: 21, inStock: true,
    stockCount: 1002, featured: false,
    description: "High-quality Surf Excel Easy Wash Detergent Powder 3kg for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p175", slug: "ariel-matic-front-load-detergent-2kg-2", name: "Ariel Matic Front Load Detergent 2kg (Variant 3)", brand: "Ariel",
    category: "home-care", subCategory: "detergent", image: img("photo-1583947215259-38e31be8751f"),
    wholesalePrice: 495, mrp: 594, moq: 8, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.2), reviewCount: 77, inStock: true,
    stockCount: 1054, featured: false,
    description: "High-quality Ariel Matic Front Load Detergent 2kg for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p176", slug: "wheel-active-lemon-jasmine-1kg-carton-20--2", name: "Wheel Active Lemon & Jasmine 1kg Carton (20) (Variant 3)", brand: "Wheel",
    category: "home-care", subCategory: "detergent", image: img("photo-1583947215259-38e31be8751f"),
    wholesalePrice: 1210, mrp: 1430, moq: 5, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.7), reviewCount: 208, inStock: true,
    stockCount: 669, featured: false,
    description: "High-quality Wheel Active Lemon & Jasmine 1kg Carton (20) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p177", slug: "ghadi-detergent-powder-1kg-carton-24--2", name: "Ghadi Detergent Powder 1kg Carton (24) (Variant 3)", brand: "Ghadi",
    category: "home-care", subCategory: "detergent", image: img("photo-1583947215259-38e31be8751f"),
    wholesalePrice: 1375, mrp: 1716, moq: 5, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.6), reviewCount: 404, inStock: true,
    stockCount: 291, featured: false,
    description: "High-quality Ghadi Detergent Powder 1kg Carton (24) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p178", slug: "lizol-surface-cleaner-pine-2l-2", name: "Lizol Surface Cleaner Pine 2L (Variant 3)", brand: "Lizol",
    category: "home-care", subCategory: "cleaner", image: img("photo-1583947215259-38e31be8751f"),
    wholesalePrice: 319, mrp: 385, moq: 6, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.2), reviewCount: 326, inStock: true,
    stockCount: 1408, featured: false,
    description: "High-quality Lizol Surface Cleaner Pine 2L for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p179", slug: "harpic-power-plus-toilet-cleaner-1l-2", name: "Harpic Power Plus Toilet Cleaner 1L (Variant 3)", brand: "Harpic",
    category: "home-care", subCategory: "cleaner", image: img("photo-1583947215259-38e31be8751f"),
    wholesalePrice: 182, mrp: 219, moq: 12, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.2), reviewCount: 235, inStock: true,
    stockCount: 1377, featured: false,
    description: "High-quality Harpic Power Plus Toilet Cleaner 1L for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p180", slug: "vim-dishwash-liquid-gel-lemon-1-5l-2", name: "Vim Dishwash Liquid Gel Lemon 1.5L (Variant 3)", brand: "Vim",
    category: "home-care", subCategory: "dishwash", image: img("photo-1583947215259-38e31be8751f"),
    wholesalePrice: 275, mrp: 341, moq: 6, unit: "jar",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.1), reviewCount: 379, inStock: true,
    stockCount: 123, featured: false,
    description: "High-quality Vim Dishwash Liquid Gel Lemon 1.5L for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p181", slug: "exo-dish-shine-bar-carton-60-x-250g--2", name: "Exo Dish Shine Bar Carton (60 x 250g) (Variant 3)", brand: "Exo",
    category: "home-care", subCategory: "dishwash", image: img("photo-1583947215259-38e31be8751f"),
    wholesalePrice: 1595, mrp: 1980, moq: 3, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(5.0), reviewCount: 157, inStock: true,
    stockCount: 997, featured: false,
    description: "High-quality Exo Dish Shine Bar Carton (60 x 250g) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p182", slug: "colin-glass-cleaner-500ml-2", name: "Colin Glass Cleaner 500ml (Variant 3)", brand: "Colin",
    category: "home-care", subCategory: "cleaner", image: img("photo-1583947215259-38e31be8751f"),
    wholesalePrice: 90, mrp: 110, moq: 12, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.0), reviewCount: 326, inStock: true,
    stockCount: 447, featured: false,
    description: "High-quality Colin Glass Cleaner 500ml for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p183", slug: "comfort-fabric-conditioner-blue-2l-2", name: "Comfort Fabric Conditioner Blue 2L (Variant 3)", brand: "Comfort",
    category: "home-care", subCategory: "detergent", image: img("photo-1583947215259-38e31be8751f"),
    wholesalePrice: 418, mrp: 506, moq: 6, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.4), reviewCount: 207, inStock: true,
    stockCount: 910, featured: false,
    description: "High-quality Comfort Fabric Conditioner Blue 2L for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p184", slug: "boat-bassheads-100-in-ear-wired-earphones-2", name: "boAt BassHeads 100 In-Ear Wired Earphones (Variant 3)", brand: "boAt",
    category: "electronics", subCategory: "audio", image: img("photo-1498049794561-7780e7231661"),
    wholesalePrice: 329, mrp: 439, moq: 20, unit: "piece",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.1), reviewCount: 105, inStock: true,
    stockCount: 219, featured: false,
    description: "High-quality boAt BassHeads 100 In-Ear Wired Earphones for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p185", slug: "mi-10000mah-power-bank-3i-2", name: "Mi 10000mAH Power Bank 3i (Variant 3)", brand: "Mi",
    category: "electronics", subCategory: "accessories", image: img("photo-1498049794561-7780e7231661"),
    wholesalePrice: 989, mrp: 1319, moq: 10, unit: "piece",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.0), reviewCount: 133, inStock: true,
    stockCount: 1435, featured: false,
    description: "High-quality Mi 10000mAH Power Bank 3i for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p186", slug: "realme-18w-fast-charger-adapter-2", name: "Realme 18W Fast Charger Adapter (Variant 3)", brand: "Realme",
    category: "electronics", subCategory: "accessories", image: img("photo-1498049794561-7780e7231661"),
    wholesalePrice: 439, mrp: 659, moq: 15, unit: "piece",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.8), reviewCount: 306, inStock: true,
    stockCount: 1214, featured: false,
    description: "High-quality Realme 18W Fast Charger Adapter for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p187", slug: "philips-9w-led-bulb-pack-of-10--2", name: "Philips 9W LED Bulb (Pack of 10) (Variant 3)", brand: "Philips",
    category: "electronics", subCategory: "lighting", image: img("photo-1498049794561-7780e7231661"),
    wholesalePrice: 935, mrp: 1320, moq: 5, unit: "pack",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.2), reviewCount: 345, inStock: true,
    stockCount: 1389, featured: false,
    description: "High-quality Philips 9W LED Bulb (Pack of 10) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p188", slug: "havells-crabtree-switches-carton-50--2", name: "Havells Crabtree Switches Carton (50) (Variant 3)", brand: "Havells",
    category: "electronics", subCategory: "electricals", image: img("photo-1498049794561-7780e7231661"),
    wholesalePrice: 2750, mrp: 3575, moq: 2, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.4), reviewCount: 116, inStock: true,
    stockCount: 1131, featured: false,
    description: "High-quality Havells Crabtree Switches Carton (50) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 5
  },
  {
    id: "p189", slug: "syska-15w-led-bulb-carton-20--2", name: "Syska 15W LED Bulb Carton (20) (Variant 3)", brand: "Syska",
    category: "electronics", subCategory: "lighting", image: img("photo-1498049794561-7780e7231661"),
    wholesalePrice: 2420, mrp: 3300, moq: 2, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.2), reviewCount: 170, inStock: true,
    stockCount: 797, featured: false,
    description: "High-quality Syska 15W LED Bulb Carton (20) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p190", slug: "eveready-aa-batteries-carton-100--2", name: "Eveready AA Batteries Carton (100) (Variant 3)", brand: "Eveready",
    category: "electronics", subCategory: "electricals", image: img("photo-1498049794561-7780e7231661"),
    wholesalePrice: 1320, mrp: 1650, moq: 5, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.8), reviewCount: 240, inStock: true,
    stockCount: 562, featured: false,
    description: "High-quality Eveready AA Batteries Carton (100) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p191", slug: "anchor-4-way-extension-board-2", name: "Anchor 4-Way Extension Board (Variant 3)", brand: "Anchor",
    category: "electronics", subCategory: "electricals", image: img("photo-1498049794561-7780e7231661"),
    wholesalePrice: 275, mrp: 385, moq: 10, unit: "piece",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.9), reviewCount: 238, inStock: true,
    stockCount: 1511, featured: false,
    description: "High-quality Anchor 4-Way Extension Board for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p192", slug: "dettol-antiseptic-liquid-1l-2", name: "Dettol Antiseptic Liquid 1L (Variant 3)", brand: "Dettol",
    category: "healthcare", subCategory: "first-aid", image: img("photo-1584308666744-24d59b298715"),
    wholesalePrice: 308, mrp: 369, moq: 10, unit: "bottle",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(4.5), reviewCount: 162, inStock: true,
    stockCount: 641, featured: false,
    description: "High-quality Dettol Antiseptic Liquid 1L for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p193", slug: "savlon-antiseptic-disinfectant-liquid-1l-2", name: "Savlon Antiseptic Disinfectant Liquid 1L (Variant 3)", brand: "Savlon",
    category: "healthcare", subCategory: "first-aid", image: img("photo-1584308666744-24d59b298715"),
    wholesalePrice: 286, mrp: 347, moq: 10, unit: "bottle",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(4.4), reviewCount: 187, inStock: true,
    stockCount: 689, featured: false,
    description: "High-quality Savlon Antiseptic Disinfectant Liquid 1L for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p194", slug: "volini-pain-relief-spray-60g-2", name: "Volini Pain Relief Spray 60g (Variant 3)", brand: "Volini",
    category: "healthcare", subCategory: "pain-relief", image: img("photo-1584308666744-24d59b298715"),
    wholesalePrice: 138, mrp: 171, moq: 20, unit: "piece",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(4.5), reviewCount: 180, inStock: true,
    stockCount: 1197, featured: false,
    description: "High-quality Volini Pain Relief Spray 60g for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p195", slug: "digene-acidity-gas-relief-tablets-150--2", name: "Digene Acidity & Gas Relief Tablets (150) (Variant 3)", brand: "Digene",
    category: "healthcare", subCategory: "digestion", image: img("photo-1584308666744-24d59b298715"),
    wholesalePrice: 198, mrp: 248, moq: 10, unit: "pack",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(4.3), reviewCount: 352, inStock: true,
    stockCount: 946, featured: false,
    description: "High-quality Digene Acidity & Gas Relief Tablets (150) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p196", slug: "crocin-advance-500mg-tablets-carton-20-strips--2", name: "Crocin Advance 500mg Tablets Carton (20 strips) (Variant 3)", brand: "Crocin",
    category: "healthcare", subCategory: "pain-relief", image: img("photo-1584308666744-24d59b298715"),
    wholesalePrice: 308, mrp: 374, moq: 5, unit: "carton",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(4.8), reviewCount: 357, inStock: true,
    stockCount: 177, featured: false,
    description: "High-quality Crocin Advance 500mg Tablets Carton (20 strips) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p197", slug: "disposable-surgical-gloves-carton-100-pairs--2", name: "Disposable Surgical Gloves Carton (100 pairs) (Variant 3)", brand: "Generic",
    category: "healthcare", subCategory: "medical", image: img("photo-1584308666744-24d59b298715"),
    wholesalePrice: 495, mrp: 660, moq: 10, unit: "carton",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(4.2), reviewCount: 96, inStock: true,
    stockCount: 1578, featured: false,
    description: "High-quality Disposable Surgical Gloves Carton (100 pairs) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p198", slug: "3-ply-surgical-face-masks-carton-500-pcs--2", name: "3-Ply Surgical Face Masks Carton (500 pcs) (Variant 3)", brand: "Generic",
    category: "healthcare", subCategory: "medical", image: img("photo-1584308666744-24d59b298715"),
    wholesalePrice: 715, mrp: 1100, moq: 10, unit: "carton",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(4.8), reviewCount: 344, inStock: true,
    stockCount: 1745, featured: false,
    description: "High-quality 3-Ply Surgical Face Masks Carton (500 pcs) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p199", slug: "lifebuoy-hand-sanitizer-500ml-2", name: "Lifebuoy Hand Sanitizer 500ml (Variant 3)", brand: "Lifebuoy",
    category: "healthcare", subCategory: "first-aid", image: img("photo-1584308666744-24d59b298715"),
    wholesalePrice: 198, mrp: 275, moq: 12, unit: "bottle",
    gstIncluded: true, gstRate: 18, supplierId: "s5",
    rating: Number(4.6), reviewCount: 238, inStock: true,
    stockCount: 744, featured: false,
    description: "High-quality Lifebuoy Hand Sanitizer 500ml for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p200", slug: "cello-plastic-bucket-20l-carton-10--2", name: "Cello Plastic Bucket 20L Carton (10) (Variant 3)", brand: "Cello",
    category: "general", subCategory: "home", image: img("photo-1542838132-92c53300491e"),
    wholesalePrice: 1650, mrp: 2420, moq: 3, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.6), reviewCount: 477, inStock: true,
    stockCount: 1578, featured: false,
    description: "High-quality Cello Plastic Bucket 20L Carton (10) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p201", slug: "eco-friendly-carry-bags-bundle-1000-pcs--2", name: "Eco-Friendly Carry Bags Bundle (1000 pcs) (Variant 3)", brand: "Generic",
    category: "general", subCategory: "packaging", image: img("photo-1542838132-92c53300491e"),
    wholesalePrice: 935, mrp: 1320, moq: 5, unit: "bundle",
    gstIncluded: true, gstRate: 12, supplierId: "s14",
    rating: Number(4.2), reviewCount: 327, inStock: true,
    stockCount: 1697, featured: false,
    description: "High-quality Eco-Friendly Carry Bags Bundle (1000 pcs) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p202", slug: "paper-coffee-cups-150ml-carton-1000--2", name: "Paper Coffee Cups 150ml Carton (1000) (Variant 3)", brand: "Generic",
    category: "general", subCategory: "disposables", image: img("photo-1542838132-92c53300491e"),
    wholesalePrice: 990, mrp: 1430, moq: 5, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.9), reviewCount: 188, inStock: true,
    stockCount: 84, featured: false,
    description: "High-quality Paper Coffee Cups 150ml Carton (1000) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p203", slug: "disposable-plastic-plates-carton-500--2", name: "Disposable Plastic Plates Carton (500) (Variant 3)", brand: "Generic",
    category: "general", subCategory: "disposables", image: img("photo-1542838132-92c53300491e"),
    wholesalePrice: 1210, mrp: 1650, moq: 5, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.1), reviewCount: 82, inStock: true,
    stockCount: 349, featured: false,
    description: "High-quality Disposable Plastic Plates Carton (500) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 2
  },
  {
    id: "p204", slug: "brown-packaging-tape-2-inch-carton-72--2", name: "Brown Packaging Tape 2 Inch Carton (72) (Variant 3)", brand: "Wonder Tape",
    category: "general", subCategory: "packaging", image: img("photo-1542838132-92c53300491e"),
    wholesalePrice: 1980, mrp: 2750, moq: 3, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.3), reviewCount: 166, inStock: true,
    stockCount: 1454, featured: false,
    description: "High-quality Brown Packaging Tape 2 Inch Carton (72) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 4
  },
  {
    id: "p205", slug: "nayasa-storage-boxes-set-carton-12-sets--2", name: "Nayasa Storage Boxes Set Carton (12 sets) (Variant 3)", brand: "Nayasa",
    category: "general", subCategory: "home", image: img("photo-1542838132-92c53300491e"),
    wholesalePrice: 3520, mrp: 4950, moq: 2, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.8), reviewCount: 124, inStock: true,
    stockCount: 56, featured: false,
    description: "High-quality Nayasa Storage Boxes Set Carton (12 sets) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
  {
    id: "p206", slug: "classmate-notebooks-regular-carton-100--2", name: "Classmate Notebooks Regular Carton (100) (Variant 3)", brand: "Classmate",
    category: "general", subCategory: "stationery", image: img("photo-1542838132-92c53300491e"),
    wholesalePrice: 3740, mrp: 4400, moq: 3, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.7), reviewCount: 255, inStock: true,
    stockCount: 904, featured: false,
    description: "High-quality Classmate Notebooks Regular Carton (100) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 1
  },
  {
    id: "p207", slug: "scotch-brite-scrub-pad-carton-100--2", name: "Scotch-Brite Scrub Pad Carton (100) (Variant 3)", brand: "Scotch-Brite",
    category: "general", subCategory: "cleaning", image: img("photo-1542838132-92c53300491e"),
    wholesalePrice: 1210, mrp: 1650, moq: 5, unit: "carton",
    gstIncluded: true, gstRate: 18, supplierId: "s14",
    rating: Number(4.2), reviewCount: 162, inStock: true,
    stockCount: 1415, featured: false,
    description: "High-quality Scotch-Brite Scrub Pad Carton (100) for wholesale purchase. Ideal for retail stores and commercial use.", deliveryDays: 3
  },
];

export const mockProducts: Product[] = RAW_PRODUCTS.map((p) => ({
  ...p,
  sku: `SKU-${p.id.toUpperCase()}`,
  images: [p.image],
  supplier: suppliers[p.supplierId as keyof typeof suppliers],
  highlights: [],
  packagingDetails: { dimensions: "Standard", weight: "Standard", boxContains: p.unit },
  deliveryEstimate: `${p.deliveryDays} - ${p.deliveryDays + 2} Days`
}));

export const categoriesMeta = [
  { slug: "food-fmcg", name: "Food & FMCG", count: mockProducts.filter(p => p.category === "food-fmcg").length },
  { slug: "personal-care", name: "Personal Care", count: mockProducts.filter(p => p.category === "personal-care").length },
  { slug: "home-care", name: "Home Care", count: mockProducts.filter(p => p.category === "home-care").length },
  { slug: "electronics", name: "Electronics", count: mockProducts.filter(p => p.category === "electronics").length },
  { slug: "healthcare", name: "Healthcare", count: mockProducts.filter(p => p.category === "healthcare").length },
  { slug: "general", name: "General Merchandise", count: mockProducts.filter(p => p.category === "general").length },
];
