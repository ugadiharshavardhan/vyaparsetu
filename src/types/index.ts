export type Category = {
  id: string;
  slug: string;
  name: string;
  icon: string; // lucide icon name
  image: string;
  productCount: number;
  description: string;
  subCategories?: string[];
};

export type Supplier = {
  id: string;
  name: string;
  location: string;
  verified: boolean;
  rating: number;
  yearsActive: number;
  logo?: string;
  description?: string;
  businessType?: "Manufacturer" | "Wholesaler" | "Distributor" | "Trading Company";
  gstVerified?: boolean;
  responseRate?: number; // 0-100
  totalProducts?: number;
  categories?: string[]; // category slugs
  established?: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string; // slug
  subCategory?: string;
  sku?: string;
  image: string;
  images?: string[];
  wholesalePrice: number;
  mrp: number;
  moq: number;
  unit: string;
  gstIncluded: boolean;
  gstRate: number;
  supplier: Supplier;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  featured?: boolean;
  description: string;
  specifications: Record<string, string>;
  highlights?: string[];
  packagingDetails?: string;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  company: string;
  logo: string;
  quote: string;
  rating: number;
};

export type FAQ = {
  id: string;
  q: string;
  a: string;
};

