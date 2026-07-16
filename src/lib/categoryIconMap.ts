import React from "react";
import {
  CupSoda,
  Droplets,
  Sprout,
  Wheat,
  Home,
  Package,
  User,
  Candy,
  Cookie,
  CookingPot,
  Coffee,
  HelpCircle,
} from "lucide-react";

export interface CategoryTheme {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;      // Tailwind class for icon color
  bgColor: string;        // Tailwind class for light background color
  borderColor: string;    // Tailwind border class on hover
}

const THEMES: Record<string, CategoryTheme> = {
  beverages: {
    icon: CupSoda,
    iconColor: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/40",
    borderColor: "hover:border-cyan-400",
  },
  "cooking-oils": {
    icon: Droplets,
    iconColor: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/40",
    borderColor: "hover:border-amber-400",
  },
  "dry-fruits-nuts": {
    icon: Sprout,
    iconColor: "text-orange-700 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/40",
    borderColor: "hover:border-orange-400",
  },
  "flour-atta": {
    icon: Wheat,
    iconColor: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/40",
    borderColor: "hover:border-yellow-400",
  },
  "food-grains-cereals": {
    icon: Wheat,
    iconColor: "text-emerald-700 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
    borderColor: "hover:border-emerald-400",
  },
  "household-essentials": {
    icon: Home,
    iconColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/40",
    borderColor: "hover:border-blue-400",
  },
  "packaged-foods": {
    icon: Package,
    iconColor: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-950/40",
    borderColor: "hover:border-rose-400",
  },
  "personal-care": {
    icon: User,
    iconColor: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-50 dark:bg-teal-950/40",
    borderColor: "hover:border-teal-400",
  },
  "pulses-dal": {
    icon: Sprout,
    iconColor: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/40",
    borderColor: "hover:border-green-400",
  },
  "salt-sugar": {
    icon: Candy,
    iconColor: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-50 dark:bg-violet-950/40",
    borderColor: "hover:border-violet-400",
  },
  "snacks-bakery": {
    icon: Cookie,
    iconColor: "text-amber-800 dark:text-amber-500",
    bgColor: "bg-amber-100/50 dark:bg-amber-950/30",
    borderColor: "hover:border-amber-600",
  },
  spices: {
    icon: CookingPot,
    iconColor: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/40",
    borderColor: "hover:border-red-400",
  },
  "tea-coffee": {
    icon: Coffee,
    iconColor: "text-yellow-800 dark:text-yellow-500",
    bgColor: "bg-yellow-100/40 dark:bg-yellow-950/30",
    borderColor: "hover:border-yellow-600",
  },
};

const FALLBACK_THEMES: CategoryTheme[] = [
  {
    icon: Package,
    iconColor: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-50 dark:bg-gray-950/40",
    borderColor: "hover:border-gray-400",
  },
  {
    icon: HelpCircle,
    iconColor: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/40",
    borderColor: "hover:border-indigo-400",
  },
  {
    icon: Sprout,
    iconColor: "text-lime-600 dark:text-lime-400",
    bgColor: "bg-lime-50 dark:bg-lime-950/40",
    borderColor: "hover:border-lime-400",
  },
];

/**
 * Gets a deterministic icon and color theme for a category slug.
 */
export function getCategoryTheme(slug: string): CategoryTheme {
  const normalized = slug.toLowerCase().trim();
  if (THEMES[normalized]) {
    return THEMES[normalized];
  }

  // Deterministic fallback based on hash of the slug
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % FALLBACK_THEMES.length;
  return FALLBACK_THEMES[index];
}
