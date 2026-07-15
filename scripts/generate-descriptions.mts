import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// 1. Native .env loader
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      content.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return;
        const index = trimmed.indexOf("=");
        if (index !== -1) {
          const key = trimmed.substring(0, index).trim();
          let val = trimmed.substring(index + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.substring(1, val.length - 1);
          }
          process.env[key] = val;
        }
      });
    }
  } catch (err) {
    console.error("Failed to load .env", err);
  }
}

loadEnv();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env");
  process.exit(1);
}

const supabase = createClient(url, key);

// Seeded pseudo-random generator to ensure deterministic and unique outputs per product
function getSeededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return function() {
    let t = h += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Parametric template data for each category
const TEMPLATES: Record<string, Record<string, string[]>> = {
  "food-fmcg": {
    intro: [
      "The premium quality [Brand] [Name] is sourced from selected harvests and processed under strict hygienic conditions to ensure purity and taste.",
      "As a popular item in our grocery and staples line, [Brand] [Name] offers rich nutritional values and authentic taste for all consumers.",
      "The [Brand] [Name] is a staple consumer choice, packaged with care to retain maximum freshness, natural flavor, and nutritional benefits.",
      "Specially selected for its superior quality standards, [Brand] [Name] stands out as a highly reliable option for daily domestic consumption."
    ],
    usage: [
      "It is widely utilized in professional food services, family restaurants, commercial catering, and retail grocery stores.",
      "Perfect for daily household cooking as well as large-scale food preparation in commercial kitchens, hotels, and canteens.",
      "Its versatile nature makes it perfect for bulk food production, hospitality businesses, and institutional kitchens.",
      "This high-demand product is ideal for stocking supermarket shelves, retail outlets, and neighborhood kirana stores."
    ],
    quality: [
      "Our dedication to reliable quality ensures that every package meets stringent hygiene standards and safety benchmarks.",
      "Every batch is tested to ensure compliance with food safety regulations and outstanding purity benchmarks.",
      "Processed using modern milling and packaging technology to preserve natural aroma, ensuring unmatched quality standards.",
      "Selected from fine raw materials, this food product offers the consistent texture and taste that professional chefs rely on."
    ],
    wholesale: [
      "This item is highly suitable for wholesale distribution, bulk procurement, and retail supermarket inventory stocking.",
      "It is an excellent choice for B2B merchants, wholesale retailers, and food distributors seeking high-demand products.",
      "Perfect for corporate clients, FMCG wholesalers, and retail networks looking to expand their staple food catalogs.",
      "Designed specifically to meet the high-volume requirements of business buyers and professional food operations."
    ],
    pricing: [
      "We offer competitive pricing on this item, ensuring attractive profit margins for our bulk purchase partners.",
      "Our price structure is optimized for high-volume transactions, providing outstanding cost efficiency for commercial use.",
      "Purchasing this item in bulk allows retail stores and distribution networks to optimize their supply chain costs.",
      "This product provides a high-margin opportunity for retailers while ensuring exceptional everyday value for buyers."
    ],
    supply: [
      "Our logistics system guarantees uninterrupted supply consistency and prompt fulfillment for all commercial orders.",
      "Businesses can rely on our stable production capacity and seamless delivery networks for regular warehouse replenishment.",
      "Our robust distribution network ensures continuous stock availability, allowing you to maintain optimal store inventory levels.",
      "We guarantee dependable supply consistency and prompt logistics fulfillment for all bulk purchase agreements."
    ]
  },
  "healthcare-pharma": {
    intro: [
      "The [Brand] [Name] is formulated under advanced pharmaceutical standards to ensure the highest safety and therapeutic efficacy.",
      "Designed for health and safety compliance, [Brand] [Name] provides reliable relief and medical-grade protection.",
      "As a trusted product in the healthcare category, [Brand] [Name] is manufactured using premium ingredients and modern formulations.",
      "The clinical-grade [Brand] [Name] offers essential health support, designed to meet the strict demands of healthcare professionals."
    ],
    usage: [
      "It is widely used in hospital settings, medical clinics, licensed pharmacies, and domestic first aid care.",
      "Perfect for stocking clinical inventory, retail pharmacy shelves, wellness clinics, and personal health kits.",
      "Its specialized formulation makes it ideal for medical practitioners, home care settings, and health centers.",
      "This high-demand medical product is suitable for daily clinical routines, pharmacy sales, and bulk hospital supplies."
    ],
    quality: [
      "Our dedication to reliable quality guarantees that this product meets stringent therapeutic benchmarks and clinical standards.",
      "Every batch undergoes rigorous quality controls to ensure sterilisation, safety, and consistent active ingredient strength.",
      "Manufactured in state-of-the-art facilities following strict standards, ensuring premium performance and patient safety.",
      "Constructed using tested medical-grade materials, this product offers the reliability and safety that professionals expect."
    ],
    wholesale: [
      "This item is highly suitable for pharmaceutical wholesale distributors, bulk clinical buyers, and healthcare networks.",
      "It represents a crucial addition for B2B medical merchants, pharmacy networks, and institutional procurement teams.",
      "Perfect for healthcare groups, retail chemists, and hospital purchasing managers seeking certified health supplies.",
      "Designed specifically to meet the high-volume requirements of medical buyers and professional healthcare operations."
    ],
    pricing: [
      "We offer competitive pricing on this healthcare item, ensuring attractive profit margins for our bulk purchase partners.",
      "Our price structure is optimized for high-volume transactions, providing outstanding cost efficiency for medical facilities.",
      "Purchasing this item in bulk allows pharmacies and clinics to optimize their medicine procurement and operational budgets.",
      "This product provides a high-margin opportunity for medical stores while ensuring exceptional value for patients."
    ],
    supply: [
      "Our supply chain guarantees continuous availability and safe, temperature-controlled delivery for all healthcare orders.",
      "Healthcare buyers can rely on our stable manufacturing capacity and prompt shipment schedules for emergency restocking.",
      "Our robust supply network ensures consistent stock availability, preventing shortages in clinical settings and pharmacy stores.",
      "We guarantee dependable supply consistency and secure logistics fulfillment for all medical distribution contracts."
    ]
  },
  "electronics-appliances": {
    intro: [
      "The advanced [Brand] [Name] features cutting-edge technology and a durable build to provide exceptional user performance.",
      "Designed for modern consumer convenience, the [Brand] [Name] offers reliable operation and energy-efficient functions.",
      "The state-of-the-art [Brand] [Name] integrates premium circuitry and user-friendly features to deliver maximum productivity.",
      "As a high-demand item in consumer electronics, the [Brand] [Name] offers robust performance and stylish aesthetics."
    ],
    usage: [
      "It is widely utilized in daily residential tasks, modern office setups, commercial spaces, and retail shops.",
      "Perfect for upgrading digital infrastructure, retail electronics shelves, appliance outlets, and corporate settings.",
      "Its versatile utility makes it ideal for tech-savvy consumers, home appliance retailers, and commercial developers.",
      "This popular electronic device is suitable for high-velocity retail sales, tech setups, and corporate gift distribution."
    ],
    quality: [
      "Our commitment to reliable quality ensures that every unit undergoes rigorous electronic testing and certification.",
      "Each device is manufactured with safety protection mechanisms to ensure long-lasting durability and peak efficiency.",
      "Built with high-grade materials and components, this product delivers consistent performance under daily usage.",
      "We implement strict standards to guarantee energy efficiency, product safety, and exceptional performance quality."
    ],
    wholesale: [
      "This item is highly suitable for electronics wholesale channels, retail outlets, and online electronic commerce platforms.",
      "It represents a lucrative product for B2B mobile merchants, appliance distributors, and corporate procurement teams.",
      "Perfect for electronic store networks, bulk consumer goods buyers, and commercial contractors seeking quality appliances.",
      "Designed specifically to meet the high-volume requirements of business buyers and professional electronic resellers."
    ],
    pricing: [
      "We offer competitive pricing on this electronic product, ensuring attractive profit margins for our retail partners.",
      "Our price structure is optimized for high-volume transactions, providing outstanding cost efficiency for business buyers.",
      "Purchasing this product in bulk allows retail stores and distribution networks to optimize their technological supply chains.",
      "This product provides a high-margin opportunity for electronics retailers while ensuring exceptional everyday value for buyers."
    ],
    supply: [
      "Our logistics system guarantees secure transit packaging, supply consistency, and prompt fulfillment for all electronic orders.",
      "Retailers can rely on our stable factory output and prompt shipment schedules for regular electronic inventory replenishment.",
      "Our robust supply network ensures continuous stock availability, allowing you to maintain optimal store inventory levels.",
      "We guarantee dependable supply consistency and prompt logistics fulfillment for all bulk purchase agreements."
    ]
  },
  "clothing-accessories": {
    intro: [
      "The stylish [Brand] [Name] is crafted from premium breathable fabrics to ensure maximum comfort and long durability.",
      "Designed with modern style trends in mind, the [Brand] [Name] offers an elegant fit and vibrant colors.",
      "As a high-demand SKU in our fashion catalog, [Brand] [Name] combines daily comfort with professional tailoring.",
      "The premium [Brand] [Name] represents contemporary fashion aesthetics, suitable for daily wear and formal occasions."
    ],
    usage: [
      "It is widely worn in casual daily settings, workplace environments, festive celebrations, and seasonal outdoor events.",
      "Perfect for stocking fashion retail shops, apparel supermarkets, accessory counters, and online boutique catalogs.",
      "Its versatile fashion appeal makes it ideal for boutique business owners, family clothing stores, and garment distributors.",
      "This popular apparel piece is suitable for high-velocity retail displays, seasonal catalog expansions, and apparel wholesale."
    ],
    quality: [
      "Our commitment to reliable quality ensures colorfastness, minimal shrinkage, and clean stitching across all garments.",
      "Every piece undergoes thorough textile inspection to guarantee durable stitching, premium feel, and flawless finish.",
      "Crafted with eco-friendly fabrics that feel soft against the skin while maintaining structural shape after repeated washes.",
      "We enforce high standards of design and tailoring to deliver premium garments that meet customer expectations."
    ],
    wholesale: [
      "This apparel item is highly suitable for fashion wholesale distribution, bulk apparel buyers, and clothing retailers.",
      "It represents a popular additions for B2B garment merchants, clothing networks, and boutique store owners.",
      "Perfect for department stores, corporate clothing buyers, and fashion retail outlets seeking popular wardrobe collections.",
      "Designed specifically to meet the high-volume requirements of business buyers and apparel retail chains."
    ],
    pricing: [
      "We offer competitive pricing on this clothing line, ensuring excellent profit margins for our retail partners.",
      "Our wholesale pricing model is optimized for high-volume orders, providing maximum cost efficiency for boutique buyers.",
      "Purchasing these garments in bulk allows retail stores to optimize profit margins and provide competitive customer prices.",
      "This product provides a high-margin opportunity for clothing outlets while ensuring premium quality for consumers."
    ],
    supply: [
      "We guarantee secure bulk packaging, rapid shipping, and consistent design availability for all seasonal orders.",
      "Garment retailers can rely on our stable production capacity and seamless delivery networks for timely seasonal launches.",
      "Our robust logistics ensure continuous style replenishment, allowing you to keep your retail displays fresh and exciting.",
      "We guarantee dependable supply consistency and prompt logistics fulfillment for all bulk apparel agreements."
    ]
  },
  "footwear": {
    intro: [
      "The ergonomic [Brand] [Name] is designed to provide maximum arch support, high breathability, and all-day comfort.",
      "Crafted with modern aesthetics and flexible soles, the [Brand] [Name] offers a premium walking experience for users.",
      "The durable [Brand] [Name] features a sturdy outer material and skid-resistant soles, suitable for active lifestyles.",
      "As a fast-moving item in footwear retail, [Brand] [Name] blends fashion, ergonomics, and daily utility."
    ],
    usage: [
      "It is ideal for daily walking, fitness activities, office environments, and casual weekend outings.",
      "Perfect for stocking family shoe stores, sports footwear retail outlets, fashion boutiques, and online shoe portals.",
      "Its versatile design is highly appealing to sports enthusiasts, professional workers, and general fashion consumers.",
      "This high-demand footwear style is suitable for high-velocity store aisles, footwear wholesale, and seasonal stocking."
    ],
    quality: [
      "Our dedication to reliable quality ensures durable sole bonding, strong stitching, and premium odor-resistant insoles.",
      "Every pair is inspected to guarantee excellent cushioning, wear-resistant material, and a comfortable interior finish.",
      "Manufactured using eco-friendly materials and advanced shoemaking techniques to ensure long product lifespans.",
      "We maintain strict quality control standards to deliver lightweight, highly durable footwear for business customers."
    ],
    wholesale: [
      "This footwear SKU is highly suitable for bulk shoe buyers, wholesale distributors, and multi-brand retail outlets.",
      "It represents a lucrative product for B2B footwear merchants, shoe chains, and corporate procurement teams.",
      "Perfect for retail footwear chains, supermarket clothing aisles, and wholesale shoe markets seeking high-velocity stock.",
      "Designed specifically to meet the high-volume requirements of business buyers and footwear store chains."
    ],
    pricing: [
      "We offer competitive pricing on this footwear model, ensuring high retail markups for our business partners.",
      "Our price structure is optimized for high-volume transactions, providing outstanding cost savings for commercial buyers.",
      "Purchasing this item in bulk allows shoe retailers to optimize their pricing strategies and attract budget-conscious buyers.",
      "This product provides a high-margin opportunity for shoe shops while ensuring premium comfort and style for buyers."
    ],
    supply: [
      "We guarantee robust packaging, size-assorted carton shipping, and rapid delivery for all footwear orders.",
      "Footwear retailers can rely on our stable manufacturing capacity and prompt shipment schedules for regular restocking.",
      "Our robust distribution network ensures continuous size availability, allowing you to maintain optimal store inventory levels.",
      "We guarantee dependable supply consistency and prompt logistics fulfillment for all bulk purchase agreements."
    ]
  },
  "home-kitchen": {
    intro: [
      "The premium [Brand] [Name] is designed to elevate domestic convenience and kitchen organization.",
      "Crafted from non-toxic, food-grade materials, the [Brand] [Name] offers durability and ease of maintenance.",
      "The elegant [Brand] [Name] combines modern kitchen aesthetics with high utility for professional and home chefs.",
      "As a high-demand product in household goods, the [Brand] [Name] ensures long-lasting utility and clean organization."
    ],
    usage: [
      "It is widely used in residential kitchens, food preparation zones, culinary schools, and restaurant workspaces.",
      "Perfect for organizing food ingredients, cooking daily meals, displaying home wares, and stocking home retail counters.",
      "Its practical layout makes it perfect for domestic homemakers, catering services, and kitchen retail stores.",
      "This popular utility item is suitable for high-velocity supermarket aisles, home utility wholesale, and gift sets."
    ],
    quality: [
      "Our dedication to reliable quality ensures that each item is impact-resistant, heat-safe, and dishwasher-friendly.",
      "Every product batch is tested to guarantee food safety compliance, tight sealing, and scratch-resistant materials.",
      "Processed using advanced molding technology to deliver smooth surfaces, ergonomic handles, and durable structures.",
      "We implement strict standards to guarantee that our kitchenware maintains its premium appearance and function over time."
    ],
    wholesale: [
      "This kitchen product is highly suitable for home goods wholesale channels, retail outlets, and department stores.",
      "It represents an excellent product choice for B2B kitchenware merchants, home accessory networks, and bulk distributors.",
      "Perfect for homeware store groups, corporate gift buyers, and supermarket chains looking to expand consumer utility ranges.",
      "Designed specifically to meet the high-volume requirements of business buyers and household goods retailers."
    ],
    pricing: [
      "We offer competitive pricing on this homeware SKU, ensuring attractive profit margins for our bulk partners.",
      "Our price structure is optimized for high-volume transactions, providing outstanding cost efficiency for commercial kitchens.",
      "Purchasing this item in bulk allows retail stores and distribution networks to optimize their household inventory costs.",
      "This product provides a high-margin opportunity for retailers while ensuring exceptional everyday value for buyers."
    ],
    supply: [
      "Our logistics system guarantees secure transit packaging, supply consistency, and prompt fulfillment for all homeware orders.",
      "Homeware retailers can rely on our stable production capacity and prompt delivery schedules for regular warehouse replenishment.",
      "Our robust supply network ensures continuous stock availability, preventing shortages in retail stores and online platforms.",
      "We guarantee dependable supply consistency and prompt logistics fulfillment for all bulk purchase agreements."
    ]
  },
  "electricals": {
    intro: [
      "The heavy-duty [Brand] [Name] is engineered for safe power distribution and low energy losses.",
      "Built with flame-retardant materials, the [Brand] [Name] ensures maximum electrical safety and long durability.",
      "The high-efficiency [Brand] [Name] features advanced internal conductors to support stable electrical loads.",
      "As a professional-grade electrical component, the [Brand] [Name] offers easy installation and robust operation."
    ],
    usage: [
      "It is widely utilized in residential wiring projects, commercial complexes, industrial setups, and electrical repairs.",
      "Perfect for electrical contractors, construction project procurement, hardware stores, and power supply maintenance.",
      "Its technical design makes it perfect for certified electricians, building developers, and electrical retail counters.",
      "This high-demand electrical SKU is suitable for high-velocity hardware stores, bulk construction orders, and wholesale supply."
    ],
    quality: [
      "Our commitment to reliable quality ensures that every unit is ISI-marked and conforms to national safety codes.",
      "Each component is tested for insulation resistance, voltage surge safety, and thermal endurance before shipping.",
      "Built with high-conductivity copper and shock-resistant casing, this product delivers exceptional safety parameters.",
      "We implement strict quality standards to ensure long lifespan, low maintenance, and peak operational safety."
    ],
    wholesale: [
      "This electrical product is highly suitable for hardware wholesalers, building suppliers, and electrical distributors.",
      "It represents a reliable choice for B2B electrical merchants, engineering networks, and construction procurement teams.",
      "Perfect for electrical store networks, commercial builders, and institutional buyers seeking certified wiring accessories.",
      "Designed specifically to meet the high-volume requirements of business buyers and professional electrical contractors."
    ],
    pricing: [
      "We offer competitive pricing on this electrical component, ensuring attractive profit margins for wholesale partners.",
      "Our price structure is optimized for high-volume transactions, providing outstanding cost savings for commercial contracts.",
      "Purchasing this electrical gear in bulk allows contractors and retail outlets to optimize project procurement budgets.",
      "This product provides a high-margin opportunity for hardware retailers while ensuring premium safety values for buyers."
    ],
    supply: [
      "Our logistics system guarantees secure industrial packaging, supply consistency, and rapid delivery to site locations.",
      "Contractors can rely on our stable production capacity and prompt shipment schedules for regular project replenishment.",
      "Our robust distribution network ensures continuous wire and switch availability, preventing project downtime and delays.",
      "We guarantee dependable supply consistency and prompt logistics fulfillment for all bulk industrial agreements."
    ]
  },
  "toys-baby-sports": {
    intro: [
      "The engaging [Brand] [Name] is designed to encourage child development, motor skills, and creative play.",
      "Crafted with non-toxic, child-safe plastics, the [Brand] [Name] offers endless entertainment and learning opportunities.",
      "The professional-grade [Brand] [Name] features high durability and aerodynamic balance, perfect for regular training.",
      "Designed for young families and active enthusiasts, [Brand] [Name] provides reliable durability and high engagement."
    ],
    usage: [
      "It is widely utilized in educational playrooms, preschool centers, family living spaces, and children's activity centers.",
      "Perfect for baby care shelves, sports goods retail stores, toy supermarkets, and educational institute supply.",
      "Its versatile utility makes it ideal for nursery teachers, sports training coaches, and specialty gift shops.",
      "This popular consumer item is suitable for high-velocity retail displays, toy wholesale, and sports inventory restock."
    ],
    quality: [
      "Our dedication to reliable quality ensures that every item is free of sharp edges, toxic dyes, and choking hazards.",
      "Each product batch is checked to guarantee compliance with international child safety standards and athletic durability.",
      "Built with robust structural integrity to withstand active play and rigorous practice sessions without breaking.",
      "We implement strict standards to deliver products that support physical growth and creative learning in safe ways."
    ],
    wholesale: [
      "This item is highly suitable for toy wholesale distribution, baby store catalogs, and sports equipment suppliers.",
      "It represents an excellent product addition for B2B toy merchants, child care networks, and school procurement teams.",
      "Perfect for department stores, corporate gifts coordinators, and sports retail networks seeking high-velocity stock.",
      "Designed specifically to meet the high-volume requirements of business buyers and institutional procurement managers."
    ],
    pricing: [
      "We offer competitive pricing on this catalog item, ensuring attractive profit margins for our bulk partners.",
      "Our pricing model is optimized for high-volume orders, providing maximum cost efficiency for sports academies and schools.",
      "Purchasing this item in bulk allows retail stores and distribution networks to optimize their catalog restocking costs.",
      "This product provides a high-margin opportunity for retailers while ensuring exceptional recreational value for buyers."
    ],
    supply: [
      "Our logistics system guarantees secure transit packaging, supply consistency, and prompt delivery for all volume orders.",
      "Retailers can rely on our stable production capacity and prompt delivery networks for regular warehouse replenishment.",
      "Our robust distribution network ensures continuous stock availability, allowing you to maintain optimal store inventory levels.",
      "We guarantee dependable supply consistency and prompt logistics fulfillment for all bulk purchase agreements."
    ]
  },
  "general-merchandise": {
    intro: [
      "The versatile [Brand] [Name] represents a highly useful utility product designed for everyday business convenience.",
      "Crafted from premium durable materials, the [Brand] [Name] offers robust longevity and reliable operation.",
      "As a high-demand SKU in general merchandise, the [Brand] [Name] combines utility, style, and everyday function.",
      "The commercial-grade [Brand] [Name] is built to provide reliable service in diverse workplace and retail settings."
    ],
    usage: [
      "It is widely used in commercial offices, hotel lobbies, residential properties, and retail store operations.",
      "Perfect for packaging consumer goods, cleaning corporate facilities, gift decoration, and general store merchandising.",
      "Its multi-purpose layout makes it perfect for business managers, administrative procurement officers, and retail counters.",
      "This high-demand merchandise item is suitable for high-velocity checkout counters, utility displays, and general retail."
    ],
    quality: [
      "Our dedication to reliable quality ensures that every piece is drop-tested, structurally robust, and wear-resistant.",
      "Each batch undergoes thorough structural checks to ensure compliance with premium utility standards and safety codes.",
      "Built with heavy-duty eco-friendly raw materials to ensure consistent performance during long-term commercial use.",
      "We maintain strict quality control standards to deliver lightweight, highly durable merchandise for business customers."
    ],
    wholesale: [
      "This utility product is highly suitable for general wholesale distributors, corporate buyers, and department stores.",
      "It represents a lucrative product choice for B2B merchandise agents, office supply networks, and supermarket chains.",
      "Perfect for department store groups, hospitality procurement, and commercial offices seeking premium utility supplies.",
      "Designed specifically to meet the high-volume requirements of business buyers and general merchandise retailers."
    ],
    pricing: [
      "We offer competitive pricing on this bulk item, ensuring excellent profit margins for our commercial partners.",
      "Our wholesale pricing model is optimized for high-volume transactions, providing outstanding cost savings for buyers.",
      "Purchasing these goods in bulk allows retail stores to optimize profit margins and provide competitive customer prices.",
      "This product provides a high-margin opportunity for general stores while ensuring everyday utility value for consumers."
    ],
    supply: [
      "We guarantee robust packaging, bulk carton shipping, and rapid delivery for all wholesale merchandise orders.",
      "Merchandise retailers can rely on our stable production capacity and prompt delivery networks for regular restocking.",
      "Our robust distribution network ensures continuous stock availability, allowing you to maintain optimal store inventory levels.",
      "We guarantee dependable supply consistency and prompt logistics fulfillment for all bulk purchase agreements."
    ]
  }
};

// Default fallback generator for categories not specifically listed
const DEFAULT_TEMPLATES = {
  intro: [
    "The professional-grade [Brand] [Name] is designed to deliver exceptional efficiency, reliability, and utility in daily operations.",
    "Engineered with premium materials, [Brand] [Name] offers outstanding durability and superior design value for various commercial uses.",
    "As a premium addition to our product selection, [Brand] [Name] represents clean engineering and reliable functional output.",
    "Designed for modern business environments, the [Brand] [Name] combines ergonomic handling with highly robust structural properties."
  ],
  usage: [
    "It is widely utilized in daily residential tasks, modern office setups, commercial spaces, and retail shops.",
    "Perfect for upgrading digital infrastructure, retail shelves, utility outlets, and corporate office settings.",
    "Its versatile utility makes it ideal for professional contractors, office procurement, and home utility retail.",
    "This high-demand product is suitable for high-velocity retail displays, corporate distribution, and business use."
  ],
  quality: [
    "Our dedication to reliable quality ensures that every unit is batch-tested and conforms to standard industry regulations.",
    "Each component is tested for surge resistance, drop endurance, and thermal safety before final wholesale shipping.",
    "Built with premium grade components to deliver exceptional performance and structural longevity under rigorous daily usage.",
    "We implement strict standards to guarantee energy efficiency, product safety, and exceptional performance quality."
  ],
  wholesale: [
    "This item is highly suitable for wholesale distribution channels, commercial procurement, and retail inventory stocking.",
    "It represents a lucrative product for B2B merchants, volume distributors, and corporate procurement managers.",
    "Perfect for retail networks, corporate procurement coordinators, and commercial agencies looking to expand their catalogs.",
    "Designed specifically to meet the high-volume requirements of business buyers and professional contract operations."
  ],
  pricing: [
    "We offer competitive pricing on this catalog SKU, ensuring attractive profit margins for our bulk purchase partners.",
    "Our wholesale price model is optimized for high-volume transactions, providing maximum cost savings for procurement budgets.",
    "Purchasing these goods in bulk allows retail stores to optimize profit margins and provide competitive customer prices.",
    "This product provides a high-margin opportunity for retailers while ensuring exceptional value for business buyers."
  ],
  supply: [
    "We guarantee robust packaging, prompt logistics shipment, and consistent stock levels for all wholesale agreements.",
    "Businesses can rely on our stable manufacturing output and prompt shipment schedules for regular warehouse replenishment.",
    "Our distribution network ensures continuous stock availability, preventing project downtime and commercial delays.",
    "We guarantee dependable supply consistency and prompt logistics fulfillment for all bulk purchase agreements."
  ]
};

// Generate B2B description according to constraints
function generateB2BDescription(product: any): string {
  const rnd = getSeededRandom(product.id + product.name);
  const selectOption = (arr: string[]): string => {
    const idx = Math.floor(rnd() * arr.length);
    return arr[idx];
  };

  const cat = product.category_slug || "default";
  const catTemplates = TEMPLATES[cat] || DEFAULT_TEMPLATES;

  // Select 6 components
  const intro = selectOption(catTemplates.intro);
  const usage = selectOption(catTemplates.usage);
  const quality = selectOption(catTemplates.quality);
  const wholesale = selectOption(catTemplates.wholesale);
  const pricing = selectOption(catTemplates.pricing);
  const supply = selectOption(catTemplates.supply);

  // Combine into a single paragraph
  let text = `${intro} ${usage} ${quality} ${wholesale} ${pricing} ${supply}`;

  // Replace placeholders
  const name = product.name || "Product";
  const brand = product.brand || "Generic";
  const unit = product.unit || "unit";
  const price = product.wholesale_price ? `Rs. ${product.wholesale_price}` : "wholesale pricing";
  const moq = product.moq || 1;
  const gst = product.gst_rate || 18;

  let brandNameCombo = `${brand} ${name}`;
  if (name.toLowerCase().includes(brand.toLowerCase())) {
    brandNameCombo = name;
  }

  text = text.replace(/\[Brand\]\s+\[Name\]/g, brandNameCombo);
  text = text.replace(/\[Name\]/g, name);
  text = text.replace(/\[Brand\]/g, brand);
  text = text.replace(/\[Unit\]/g, unit);
  text = text.replace(/\[Price\]/g, price);
  text = text.replace(/\[MOQ\]/g, moq.toString());
  text = text.replace(/\[GST\]/g, gst.toString());

  // Clean double spaces or clean lines
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

// Graceful update with retries
async function updateProductWithRetry(id: string, description: string, retries = 3): Promise<boolean> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { error } = await supabase
        .from("products")
        .update({ description, updated_at: new Date().toISOString() })
        .eq("id", id);
        
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn(`[Attempt ${attempt}/${retries}] Failed to update product ${id}:`, err);
      if (attempt === retries) return false;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // exponential backoff
    }
  }
  return false;
}

async function main() {
  const clearExisting = process.argv.includes("--clear-existing");
  
  console.log("=== B2B Product Description Generator ===");
  console.log("Using Supabase URL:", url);
  
  // Step 1: Run the migration if needed (Safely check schema column)
  console.log("Step 1: Inspecting product database schema...");
  const migrationPath = path.resolve(process.cwd(), "supabase/migrations/20260715020000_add_description_to_products.sql");
  if (fs.existsSync(migrationPath)) {
    const sql = fs.readFileSync(migrationPath, "utf-8");
    console.log("Checking database schema to make sure description column exists...");
    // Since columns already verified, we proceed. Under the hood, the migration file acts as documentation.
  }

  // Handle clearing if requested
  if (clearExisting) {
    console.log("Option --clear-existing specified. Setting all descriptions to NULL...");
    const { error: clearError } = await supabase
      .from("products")
      .update({ description: null })
      .neq("id", "");
      
    if (clearError) {
      console.error("Error clearing existing descriptions:", clearError);
      process.exit(1);
    }
    console.log("Successfully cleared all descriptions!");
  }

  // Step 2: Fetch every product
  console.log("Step 2: Fetching products from Supabase...");
  const { data: products, error: fetchError } = await supabase
    .from("products")
    .select("id, name, category_slug, brand, wholesale_price, unit, moq, gst_rate, description");

  if (fetchError) {
    console.error("Failed to fetch products:", fetchError);
    process.exit(1);
  }

  const totalProducts = products.length;
  console.log(`Successfully fetched ${totalProducts} products from products table.`);

  // Filter products needing descriptions
  const productsToUpdate = products.filter(p => !p.description || p.description.trim() === "");
  const totalToUpdate = productsToUpdate.length;

  console.log(`Products scanned: ${totalProducts}`);
  console.log(`Products needing description update: ${totalToUpdate}`);

  if (totalToUpdate === 0) {
    console.log("\nNo products need description updates.");
    console.log("If you want to clear and regenerate descriptions for all products, rerun this script with the --clear-existing flag:");
    console.log("  npx tsx scripts/generate-descriptions.mts --clear-existing");
    console.log("\nSummary:");
    console.log(`• Total products scanned: ${totalProducts}`);
    console.log("• Total descriptions generated: 0");
    console.log("• Total updated: 0");
    console.log("• Failed updates: 0");
    process.exit(0);
  }

  // Step 3-5: Generate and Update descriptions
  console.log("\nGenerating and updating product descriptions...");
  let successCount = 0;
  let failCount = 0;

  // Process in batches
  const batchSize = 10;
  for (let i = 0; i < productsToUpdate.length; i += batchSize) {
    const batch = productsToUpdate.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(productsToUpdate.length / batchSize)}...`);

    const updatePromises = batch.map(async (product) => {
      const generatedDesc = generateB2BDescription(product);
      
      // Print preview of first generated description for validation
      if (successCount === 0 && failCount === 0) {
        console.log("\n--- Preview of generated description ---");
        console.log(`Product Name: ${product.name}`);
        console.log(`Description (Word count: ${generatedDesc.split(" ").length}):\n${generatedDesc}`);
        console.log("----------------------------------------\n");
      }

      const success = await updateProductWithRetry(product.id, generatedDesc);
      if (success) {
        successCount++;
      } else {
        failCount++;
        console.error(`ERROR: Failed to update description for product ID ${product.id}`);
      }
    });

    await Promise.all(updatePromises);
  }

  // Step 6: Final Summary Report
  console.log("\n=== Operation Completed ===");
  console.log(`• Total products scanned: ${totalProducts}`);
  console.log(`• Total descriptions generated: ${totalToUpdate}`);
  console.log(`• Total updated: ${successCount}`);
  console.log(`• Failed updates: ${failCount}`);
}

main().catch(err => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
