/**
 * Enrich all products with market-informed wholesale/MRP and richer descriptions.
 *
 * Pricing anchors (India B2B / Hyperpure / mandi / retail, mid-2026 research):
 * - Sugar ~₹43/kg wholesale; Tata Salt 1kg ~₹28 MRP
 * - Toor dal ~₹115–125/kg; rice common ~₹38–45/kg; basmati packs higher
 * - Everest Garam Masala 500g ~₹400; Catch Turmeric 1kg ~₹260
 * - Fortune sunflower oil 5L ~₹950–1,100; Daawat rice 5kg ~₹250–300 wholesale
 *
 * Usage:
 *   node scratch/enrich-products-prices-descriptions.mjs --dry-run
 *   node scratch/enrich-products-prices-descriptions.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  const path = resolve(process.cwd(), ".env");
  if (!existsSync(path)) return {};
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    env[m[1]] = v;
  }
  return env;
}

const dryRun = process.argv.includes("--dry-run");

/** @typedef {{ qty: number, unit: 'kg'|'l'|'ml'|'g'|'pcs' }} Pack */

function parsePack(name, categorySlug = "") {
  const n = String(name);

  let m =
    n.match(/(\d+(?:\.\d+)?)\s*kg\b/i) ||
    n.match(/(\d+(?:\.\d+)?)\s*kgs?\b/i);
  if (m) return { qty: Number(m[1]), unit: "kg", explicit: true };

  m = n.match(/(\d+(?:\.\d+)?)\s*(?:l|ltr|litre|liter)\b/i);
  if (m) return { qty: Number(m[1]), unit: "l", explicit: true };

  m = n.match(/(\d+(?:\.\d+)?)\s*ml\b/i);
  if (m) return { qty: Number(m[1]), unit: "ml", explicit: true };

  m = n.match(/(\d+(?:\.\d+)?)\s*(?:g|gm|gms|grams?)\b/i);
  if (m) return { qty: Number(m[1]), unit: "g", explicit: true };

  m = n.match(/\b(\d+)\s*(?:pcs|pieces|pack|bottles?|cans?)\b/i);
  if (m) return { qty: Number(m[1]), unit: "pcs", explicit: true };

  // Typical retail pack when size is missing from the title
  const defaults = {
    beverages: { qty: 1, unit: "pcs" },
    "cooking-oils": { qty: 1, unit: "l" },
    "dry-fruits-nuts": { qty: 0.5, unit: "kg" },
    "flour-atta": { qty: 5, unit: "kg" },
    "food-grains-cereals": { qty: 1, unit: "kg" },
    "household-essentials": { qty: 1, unit: "pcs" },
    "packaged-foods": { qty: 1, unit: "pcs" },
    "personal-care": { qty: 1, unit: "pcs" },
    "pulses-dal": { qty: 1, unit: "kg" },
    "rice-products": { qty: 5, unit: "kg" },
    "salt-sugar": { qty: 1, unit: "kg" },
    "snacks-bakery": { qty: 1, unit: "pcs" },
    spices: { qty: 0.2, unit: "kg" },
    "tea-coffee": { qty: 0.5, unit: "kg" },
  };
  return { ...(defaults[categorySlug] || { qty: 1, unit: "pcs" }), explicit: false };
}

function toKg(pack) {
  if (pack.unit === "kg") return pack.qty;
  if (pack.unit === "g") return pack.qty / 1000;
  return null;
}

function toL(pack) {
  if (pack.unit === "l") return pack.qty;
  if (pack.unit === "ml") return pack.qty / 1000;
  return null;
}

function extractBrand(name, existing) {
  if (existing && existing !== "Generic") return existing;
  const brands = [
    "Tata Sampann",
    "Tata Salt",
    "Tata",
    "Everest",
    "Catch",
    "MDH",
    "Daawat",
    "India Gate",
    "Fortune",
    "Saffola",
    "Dabur",
    "Patanjali",
    "Britannia",
    "Parle",
    "Sunfeast",
    "Maggi",
    "Nestle",
    "Cadbury",
    "Amul",
    "Mother Dairy",
    "Bisleri",
    "Aquafina",
    "Kinley",
    "Bailley",
    "Coca Cola",
    "Coca-Cola",
    "Pepsi",
    "Sprite",
    "Limca",
    "Maaza",
    "Minute Maid",
    "Tropicana",
    "Paper Boat",
    "Red Bull",
    "Monster",
    "Sting",
    "Hell",
    "B Natural",
    "Colgate",
    "Pears",
    "Lux",
    "Dove",
    "Himalaya",
    "Vicco",
    "Santoor",
    "Surf Excel",
    "Ariel",
    "Tide",
    "Vim",
    "Harpic",
    "Lizol",
    "Dettol",
    "Savlon",
    "Brooke Bond",
    "Tata Tea",
    "Taj Mahal",
    "Red Label",
    "Society",
    "Wagh Bakri",
    "Nescafe",
    "Bru",
    "Continental",
    "Pillsbury",
    "Aashirvaad",
    "Nature Fresh",
    "Annapurna",
    "Madhur",
    "Dhampur",
    "Trust",
    "I-Shakti",
    "Organic Tattva",
    "24 Mantra",
    "Pro Nature",
    "Nutriorg",
    "Farmley",
    "Happilo",
    "Nutraj",
    "Rostaa",
    "Wonderland",
    "Kalbavi",
    "Whole Harvest",
    "Eastmade",
    "ADH",
    "ES ",
    "Chukde",
    "Minar",
    "Bajaj",
    "Aroga",
    "Engine",
    "Emami",
  "A4",
  "A.S.",
  "BestValue",
  "Popular Essentials",
  "Daily Good",
  "Rajdhani",
  "Parry",
  "Santoor",
  "Gowardhan",
  "Nandini",
];
  for (const b of brands) {
    if (name.toLowerCase().includes(b.toLowerCase().trim())) {
      return b.trim();
    }
  }
  const first = name.split(/[\s,]+/)[0];
  return first && first.length > 2 ? first : "VyaparSetu Select";
}

function categoryLabel(slug) {
  return String(slug || "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Base wholesale ₹ per kg / L / piece from mid-2026 Indian market research.
 * Returns { wholesale, mrp } for the pack.
 */
function priceFor(product) {
  const name = product.name.toLowerCase();
  const cat = product.category_slug;
  const pack = parsePack(product.name, cat);
  const kg = toKg(pack);
  const litres = toL(pack);

  /** @type {(wholesalePerUnit: number, mrpPerUnit: number, units: number) => {wholesale: number, mrp: number}} */
  const scale = (w, m, units) => ({
    wholesale: Math.max(8, Math.round(w * units)),
    mrp: Math.max(10, Math.round(m * units)),
  });

  // --- Category + keyword pricing ---
  if (cat === "salt-sugar" || /salt|sugar|jaggery|gur|sweetener/.test(name)) {
    if (/salt/.test(name)) {
      const perKgW = /tata|lite|rock|himalayan/.test(name) ? 26 : 18;
      const perKgM = /tata|lite|rock|himalayan/.test(name) ? 30 : 22;
      return scale(perKgW, perKgM, kg ?? 1);
    }
    if (/sugar|madhur|dhampur/.test(name)) {
      return scale(44, 55, kg ?? 1); // ~₹43–45/kg wholesale (FCA)
    }
    if (/jaggery|gur/.test(name)) return scale(55, 70, kg ?? 1);
  }

  if (cat === "pulses-dal" || /dal|toor|arhar|moong|masoor|chana|urad|rajma|kabuli/.test(name)) {
    let perKgW = 95;
    let perKgM = 120;
    if (/toor|arhar|tur/.test(name)) {
      perKgW = 118;
      perKgM = 145;
    } // ~₹115–125/kg mandi
    else if (/moong/.test(name)) {
      perKgW = 110;
      perKgM = 135;
    } else if (/masoor|masur/.test(name)) {
      perKgW = 98;
      perKgM = 125;
    } else if (/chana|gram/.test(name)) {
      perKgW = 85;
      perKgM = 105;
    } else if (/urad/.test(name)) {
      perKgW = 125;
      perKgM = 155;
    } else if (/rajma|kabuli/.test(name)) {
      perKgW = 105;
      perKgM = 130;
    }
    if (/tata sampann|organic|unpolished/.test(name)) {
      perKgW *= 1.08;
      perKgM *= 1.1;
    }
    return scale(perKgW, perKgM, kg ?? 1);
  }

  if (
    (cat === "rice-products" || (/rice|basmati|sona|jeera|biryani|pulav|poha|idli/.test(name) && !/oil|bran oil/.test(name))) &&
    cat !== "cooking-oils"
  ) {
    let perKgW = 42;
    let perKgM = 55;
    if (/basmati|daawat|india gate|biryani|pulav/.test(name)) {
      perKgW = 78;
      perKgM = 105;
    } // branded basmati
    if (/brown|organic|quinoa/.test(name)) {
      perKgW = 95;
      perKgM = 125;
    }
    if (/rozana|everyday|steam/.test(name)) {
      perKgW = 58;
      perKgM = 78;
    } // Daawat Rozana ~₹60/kg wholesale
    return scale(perKgW, perKgM, kg ?? 5);
  }

  if (cat === "spices" || /masala|haldi|turmeric|chilli|chili|dhaniya|coriander|jeera|cumin|garam|pepper|elaichi|cardamom|clove|cinnamon|dalchini|methi|saunf/.test(name)) {
    let perKgW = 220;
    let perKgM = 280;
    if (/garam masala/.test(name)) {
      perKgW = 760;
      perKgM = 920;
    } // Everest 500g ~₹404
    else if (/tikhalal|chilli|chili|lal mirch/.test(name)) {
      perKgW = 320;
      perKgM = 400;
    } else if (/turmeric|haldi/.test(name)) {
      perKgW = 260;
      perKgM = 320;
    } // Catch 1kg ~₹260
    else if (/coriander|dhaniya/.test(name)) {
      perKgW = 240;
      perKgM = 300;
    } else if (/cumin|jeera/.test(name)) {
      perKgW = 420;
      perKgM = 520;
    } else if (/black pepper|kali mirch/.test(name)) {
      perKgW = 680;
      perKgM = 850;
    } else if (/cardamom|elaichi/.test(name)) {
      perKgW = 2200;
      perKgM = 2800;
    } else if (/clove|laung/.test(name)) {
      perKgW = 1400;
      perKgM = 1750;
    } else if (/cinnamon|dalchini|cassia/.test(name)) {
      perKgW = 520;
      perKgM = 650;
    }
    if (/everest|mdh|catch/.test(name)) {
      perKgW *= 1.05;
      perKgM *= 1.08;
    }
    return scale(perKgW, perKgM, kg ?? 0.1);
  }

  if (cat === "cooking-oils" || /oil|ghee|vanaspati/.test(name)) {
    let perLW = 165;
    let perLM = 210;
    if (/sunflower|sun lite|sunlite/.test(name)) {
      perLW = 190;
      perLM = 230;
    } // 5L ~₹950–1100
    else if (/mustard|sarson/.test(name)) {
      perLW = 175;
      perLM = 215;
    } else if (/groundnut|peanut/.test(name)) {
      perLW = 210;
      perLM = 260;
    } else if (/sesame|til|gingelly/.test(name)) {
      perLW = 320;
      perLM = 400;
    } else if (/coconut/.test(name)) {
      perLW = 280;
      perLM = 350;
    } else if (/rice bran/.test(name)) {
      perLW = 145;
      perLM = 185;
    } else if (/olive/.test(name)) {
      perLW = 850;
      perLM = 1100;
    } else if (/ghee/.test(name)) {
      perLW = 620;
      perLM = 720;
    } // Amul ~₹620/L
    if (/cold pressed|organic/.test(name)) {
      perLW *= 1.25;
      perLM *= 1.3;
    }
    // Tin oils often listed in kg ≈ litre for edible oil density
    const units = litres ?? kg ?? 1;
    return scale(perLW, perLM, units);
  }

  if (cat === "flour-atta" || /atta|flour|maida|sooji|rava|besan|multigrain/.test(name)) {
    let perKgW = 38;
    let perKgM = 48;
    if (/aashirvaad|fortune|pillsbury|nature fresh/.test(name)) {
      perKgW = 45;
      perKgM = 58;
    }
    if (/besan/.test(name)) {
      perKgW = 72;
      perKgM = 90;
    }
    if (/maida/.test(name)) {
      perKgW = 42;
      perKgM = 52;
    }
    if (/sooji|rava/.test(name)) {
      perKgW = 48;
      perKgM = 60;
    }
    if (/multigrain|organic/.test(name)) {
      perKgW = 55;
      perKgM = 72;
    }
    return scale(perKgW, perKgM, kg ?? 5);
  }

  if (cat === "food-grains-cereals" || /wheat|bajra|jowar|ragi|oats|poha|daliya|barley|quinoa|millet/.test(name)) {
    let perKgW = 35;
    let perKgM = 45;
    if (/oats/.test(name)) {
      perKgW = 120;
      perKgM = 160;
    }
    if (/quinoa/.test(name)) {
      perKgW = 280;
      perKgM = 360;
    }
    if (/ragi|bajra|jowar|millet/.test(name)) {
      perKgW = 48;
      perKgM = 62;
    }
    if (/poha/.test(name)) {
      perKgW = 55;
      perKgM = 70;
    }
    return scale(perKgW, perKgM, kg ?? 1);
  }

  if (cat === "dry-fruits-nuts" || /cashew|almond|pista|raisin|dates|walnut|anacard|kaju|badam|kishmish/.test(name)) {
    let perKgW = 650;
    let perKgM = 850;
    if (/cashew|kaju/.test(name)) {
      perKgW = 780;
      perKgM = 980;
    }
    if (/almond|badam/.test(name)) {
      perKgW = 720;
      perKgM = 920;
    }
    if (/pista|pistachio/.test(name)) {
      perKgW = 1400;
      perKgM = 1800;
    }
    if (/walnut|akhrot/.test(name)) {
      perKgW = 950;
      perKgM = 1200;
    }
    if (/raisin|kishmish/.test(name)) {
      perKgW = 280;
      perKgM = 360;
    }
    if (/dates|khajoor/.test(name)) {
      perKgW = 220;
      perKgM = 290;
    }
    return scale(perKgW, perKgM, kg ?? 0.5);
  }

  if (cat === "tea-coffee" || /tea|coffee|chai|nescafe|bru/.test(name)) {
    let perKgW = 280;
    let perKgM = 360;
    if (/green tea/.test(name)) {
      perKgW = 420;
      perKgM = 550;
    }
    if (/coffee|nescafe|bru/.test(name)) {
      perKgW = 480;
      perKgM = 620;
    }
    if (/taj mahal|premium|orthodox/.test(name)) {
      perKgW = 520;
      perKgM = 680;
    }
    return scale(perKgW, perKgM, kg ?? 0.25);
  }

  if (cat === "beverages") {
    if (/water|bisleri|aquafina|kinley|bailley/.test(name)) {
      const units = pack.unit === "pcs" ? pack.qty : 1;
      // Single bottle wholesale ~₹12–18; treat as pack of 1 unless size says otherwise
      if (/20\s*l|jar|can\b/.test(name)) return { wholesale: 85, mrp: 110 };
      return { wholesale: 14 * units, mrp: 20 * units };
    }
    if (/red bull/.test(name)) return { wholesale: 105, mrp: 125 };
    if (/monster|hell|sting|zyro|energy/.test(name)) return { wholesale: 75, mrp: 99 };
    if (/coca|pepsi|sprite|limca|soft drink|fanta/.test(name)) return { wholesale: 32, mrp: 40 };
    if (/maaza|minute maid|tropicana|paper boat|juice|b natural/.test(name))
      return { wholesale: 55, mrp: 75 };
    return { wholesale: 40, mrp: 55 };
  }

  if (cat === "snacks-bakery" || /biscuit|cookie|namkeen|chips|noodles|pasta|cake|rusk|toast/.test(name)) {
    if (/maggi|noodles/.test(name)) return { wholesale: 48, mrp: 60 };
    if (/biscuit|britannia|parle|sunfeast|cookie/.test(name)) return { wholesale: 55, mrp: 72 };
    if (/namkeen|bhujia|sev/.test(name)) return scale(180, 230, kg ?? 0.4);
    if (/chips|lays|kurkure/.test(name)) return { wholesale: 35, mrp: 50 };
    if (/sponge|whip|chocolate compound|bakery|pillsbury/.test(name)) {
      if (kg) return scale(220, 290, kg);
      if (litres) return scale(180, 240, litres);
      return { wholesale: 280, mrp: 360 };
    }
    return { wholesale: 65, mrp: 85 };
  }

  if (cat === "packaged-foods" || /sauce|pickle|jam|honey|ready|instant|ketchup|mayonnaise/.test(name)) {
    if (/honey/.test(name)) return scale(320, 420, kg ?? 0.5);
    if (/pickle|achar/.test(name)) return scale(160, 210, kg ?? 0.5);
    if (/ketchup|sauce/.test(name)) return { wholesale: 85, mrp: 115 };
    if (/jam|spread/.test(name)) return { wholesale: 95, mrp: 130 };
    return { wholesale: 90, mrp: 120 };
  }

  if (cat === "personal-care" || /toothpaste|soap|shampoo|hand wash|cream|lotion|colgate/.test(name)) {
    if (/colgate|toothpaste|oral/.test(name)) return { wholesale: 85, mrp: 115 };
    if (/shampoo/.test(name)) return { wholesale: 145, mrp: 199 };
    if (/soap|bath/.test(name)) return { wholesale: 38, mrp: 52 };
    if (/hand wash|sanitizer/.test(name)) return { wholesale: 95, mrp: 130 };
    return { wholesale: 75, mrp: 99 };
  }

  if (cat === "household-essentials" || /detergent|cleaner|disinfectant|harpic|lizol|vim|surf|ariel|tide/.test(name)) {
    if (/detergent|surf|ariel|tide|washing/.test(name)) return scale(95, 125, kg ?? 1);
    if (/harpic|toilet/.test(name)) return { wholesale: 85, mrp: 115 };
    if (/lizol|phenyl|floor/.test(name)) return { wholesale: 110, mrp: 145 };
    if (/vim|dish|utensil/.test(name)) return { wholesale: 55, mrp: 75 };
    return { wholesale: 80, mrp: 105 };
  }

  // Fallback by category average pack
  const fallback = {
    beverages: [45, 60],
    "cooking-oils": [180, 230],
    "dry-fruits-nuts": [350, 450],
    "flour-atta": [180, 230],
    "food-grains-cereals": [90, 120],
    "household-essentials": [85, 110],
    "packaged-foods": [95, 125],
    "personal-care": [80, 110],
    "pulses-dal": [110, 140],
    "rice-products": [220, 290],
    "salt-sugar": [45, 58],
    "snacks-bakery": [70, 95],
    spices: [95, 125],
    "tea-coffee": [140, 185],
  };
  const [w, m] = fallback[cat] || [99, 129];
  return { wholesale: w, mrp: m };
}

function ensureMrpAboveWholesale(wholesale, mrp) {
  const w = Math.round(wholesale);
  let m = Math.round(mrp);
  if (m <= w) m = Math.round(w * 1.22);
  return { wholesale: w, mrp: m };
}

function buildDescription(product, brand, pack) {
  const cat = categoryLabel(product.category_slug);
  const packText = !pack.explicit
    ? "a standard retail pack"
    : pack.unit === "kg"
      ? `a ${pack.qty} kg pack`
      : pack.unit === "g"
        ? `a ${pack.qty} g pack`
        : pack.unit === "l"
          ? `a ${pack.qty} L pack`
          : pack.unit === "ml"
            ? `a ${pack.qty} ml pack`
            : pack.qty > 1
              ? `a ${pack.qty}-unit pack`
              : "a standard retail pack";

  const name = product.name;
  const lower = name.toLowerCase();

  const useCases = [];
  if (/dal|pulse|rajma|chana/.test(lower))
    useCases.push("Ideal for daily home cooking, hotels, messes, and cloud kitchens that need consistent dal quality.");
  else if (/rice|basmati/.test(lower))
    useCases.push("Suited for biryani, pulav, steamed rice, and high-volume restaurant service.");
  else if (/oil|ghee/.test(lower))
    useCases.push("Use for deep frying, tadka, sautéing, and everyday Indian cooking with a clean finish.");
  else if (/masala|spice|haldi|chilli|jeera/.test(lower))
    useCases.push("Adds authentic aroma and colour to curries, gravies, snacks, and marinades.");
  else if (/tea|coffee/.test(lower))
    useCases.push("Perfect for office pantries, cafés, kirana counters, and HORECA beverage stations.");
  else if (/soap|shampoo|toothpaste|wash/.test(lower))
    useCases.push("Fast-moving personal care SKU for kirana, pharmacies, and general trade.");
  else if (/detergent|cleaner|harpic|lizol|vim/.test(lower))
    useCases.push("Stock for households, PGs, offices, and janitorial supply routes.");
  else
    useCases.push(`A dependable ${cat.toLowerCase()} SKU for kirana stores and bulk B2B buyers.`);

  const quality = [];
  if (/tata|everest|catch|daawat|fortune|aashirvaad|colgate|bisleri|amul|24 mantra/.test(lower))
    quality.push(`Trusted ${brand} brand with strong consumer pull and repeat demand.`);
  else quality.push(`Sourced for consistent grade, hygiene, and shelf presence under the ${brand} line.`);

  if (/unpolished|organic|cold pressed|pure|premium/.test(lower))
    quality.push("Positioned as a quality-forward pack for health-conscious and premium retail shelves.");

  quality.push("Sealed packaging helps protect freshness during warehouse storage and last-mile delivery.");

  const trade = `VyaparSetu wholesale listing for verified retailers. Order in multiples of the MOQ to unlock better landed cost versus open-market piecemeal buying. GST-ready invoices available on fulfilled orders.`;

  return [
    `${name} is a ${cat} product from ${brand}, supplied in ${packText} for Indian retail and HORECA buyers.`,
    quality.join(" "),
    useCases[0],
    `Store in a cool, dry place away from direct sunlight. Check the pack for manufacturing and best-before details before display.`,
    trade,
  ].join("\n\n");
}

function buildHighlights(product, brand, pack) {
  const packText = !pack.explicit
    ? "Retail-ready pack"
    : pack.unit === "kg"
      ? `${pack.qty} kg pack`
      : pack.unit === "g"
        ? `${pack.qty} g pack`
        : pack.unit === "l"
          ? `${pack.qty} L pack`
          : pack.unit === "ml"
            ? `${pack.qty} ml pack`
            : "Retail-ready pack";

  const highlights = [
    `${brand} — ${categoryLabel(product.category_slug)}`,
    packText,
    "B2B wholesale pricing for retailers",
    "GST invoice on order fulfilment",
  ];

  const lower = product.name.toLowerCase();
  if (
    [
      "pulses-dal",
      "rice-products",
      "spices",
      "cooking-oils",
      "beverages",
      "snacks-bakery",
      "packaged-foods",
      "tea-coffee",
      "flour-atta",
      "food-grains-cereals",
      "salt-sugar",
      "dry-fruits-nuts",
    ].includes(product.category_slug)
  ) {
    highlights.push("Suitable for food retail & HORECA");
  }
  if (/unpolished|organic|cold pressed|iodised|iodized|pure/.test(lower)) {
    highlights.push("Quality-focused formulation / processing");
  }
  return highlights.slice(0, 6);
}

function inferUnit(product, pack) {
  if (pack.unit === "kg" || pack.unit === "g") return pack.qty >= 1 && pack.unit === "kg" ? "kg" : "pack";
  if (pack.unit === "l" || pack.unit === "ml") return "litre";
  if (/bag|sack/.test(product.name.toLowerCase())) return "bag";
  if (/carton|case/.test(product.name.toLowerCase())) return "carton";
  if (/bottle/.test(product.name.toLowerCase())) return "piece";
  return product.unit && product.unit !== "unit" ? product.unit : "pack";
}

async function main() {
  const env = { ...loadEnv(), ...process.env };
  const sb = createClient(
    env.SUPABASE_URL || env.VITE_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );

  const { data: products, error } = await sb
    .from("products")
    .select(
      "id, name, brand, category_slug, unit, moq, wholesale_price, mrp, description, highlights, packaging_details",
    )
    .order("name");
  if (error) throw error;

  console.log(`Products: ${products.length}`);
  console.log(`Mode: ${dryRun ? "DRY RUN" : "APPLY"}`);

  const preview = [];
  let updated = 0;
  let errors = 0;

  for (const p of products) {
    const pack = parsePack(p.name, p.category_slug);
    const brand = extractBrand(p.name, p.brand);
    const raw = priceFor(p);
    const { wholesale, mrp } = ensureMrpAboveWholesale(raw.wholesale, raw.mrp);
    const description = buildDescription(p, brand, pack);
    const highlights = buildHighlights(p, brand, pack);
    const unit = inferUnit(p, pack);
    const packaging =
      p.packaging_details && String(p.packaging_details).length > 3
        ? p.packaging_details
        : pack.explicit
          ? `${pack.qty} ${pack.unit === "pcs" ? "pcs" : pack.unit} sealed retail pack`
          : "Sealed retail pack";

    const patch = {
      brand,
      wholesale_price: wholesale,
      mrp,
      description,
      highlights,
      unit,
      packaging_details: packaging,
    };

    if (preview.length < 12) {
      preview.push({
        name: p.name,
        before: { w: p.wholesale_price, m: p.mrp, brand: p.brand },
        after: { w: wholesale, m: mrp, brand, unit },
        descPreview: description.slice(0, 120) + "…",
      });
    }

    if (dryRun) {
      updated += 1;
      continue;
    }

    const { error: updErr } = await sb.from("products").update(patch).eq("id", p.id);
    if (updErr) {
      errors += 1;
      console.error(`ERR ${p.name}: ${updErr.message}`);
    } else {
      updated += 1;
    }
  }

  console.log("\nSample updates:");
  console.log(JSON.stringify(preview, null, 2));
  writeFileSync(
    resolve("scratch/enrichment-preview.json"),
    JSON.stringify(preview, null, 2),
  );
  console.log(`\nDone. Updated: ${updated}, Errors: ${errors}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
