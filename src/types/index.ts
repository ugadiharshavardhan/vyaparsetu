export type Category = {
  id: string;
  slug: string;
  name: string;
  icon: string; // lucide icon name
  image: string;
  productCount: number;
  description: string;
};

export type Supplier = {
  id: string;
  name: string;
  location: string;
  verified: boolean;
  rating: number;
  yearsActive: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string; // slug
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
