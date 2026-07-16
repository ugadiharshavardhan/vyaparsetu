export type SupplierProductStatus = "draft" | "published" | "archived";

export type SupplierProduct = {
  id: string;
  name: string;
  brand: string;
  sku: string;
  hsn: string;
  category: string;
  subCategory: string;
  gstRate: number;
  description: string;
  highlights: string[];
  specifications: Record<string, string>;
  countryOfOrigin: string;
  images: string[];
  thumbnailIndex: number;
  videoUrl?: string;
  moq: number;
  maxOrderQty?: number;
  unit: string;
  packageSize: string;
  wholesalePrice: number;
  mrp: number;
  stock: number;
  reserved: number;
  incoming: number;
  reorderLevel?: number;
  warehouseId: string;
  deliveryDays: number;
  returnPolicy: string;
  warranty: string;
  weight?: string;
  dimensions?: string;
  manufacturerName?: string;
  featured: boolean;
  visible: boolean;
  status: SupplierProductStatus;
  createdAt: string;
  updatedAt: string;
};

export type Warehouse = {
  id: string;
  name: string;
  location: string;
  city: string;
  state: string;
  pincode: string;
  capacity: number;
  used: number;
  managerName: string;
  managerPhone: string;
  createdAt: string;
};

export type StockMovement = {
  id: string;
  productId: string;
  productName: string;
  type: "restock" | "adjustment" | "sale" | "return" | "damaged";
  qty: number;
  note: string;
  createdAt: string;
};

export type Promotion = {
  id: string;
  name: string;
  type: "percentage" | "flat" | "category" | "bxgy";
  value: number;
  code: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
  scope: string;
  redemptions: number;
};

export type SupplierNotification = {
  id: string;
  type: "order" | "stock" | "review" | "payment" | "verification";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};

export type SupplierReview = {
  id: string;
  productId: string;
  productName: string;
  customer: string;
  rating: number;
  comment: string;
  reply?: string;
  createdAt: string;
};

export type SupplierCustomer = {
  id: string;
  name: string;
  business: string;
  city: string;
  orders: number;
  spent: number;
  lastOrderAt: string;
  favoriteProduct: string;
  gstNumber?: string;
  address?: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  status?: "active" | "inactive";
};

export type SupplierOrder = {
  id: string;
  orderNumber: string;
  customer: string;
  product: string;
  qty: number;
  amount: number;
  status: "pending" | "accepted" | "packing" | "ready" | "picked_up" | "shipped" | "delivered" | "cancelled" | "returned";
  createdAt: string;
  expectedDelivery?: string;
  destination: string;
  paymentStatus: "paid" | "pending";
  gstDetails?: string;
  gstRate?: number;
  gstIncluded?: boolean;
  porterName?: string;
  porterContact?: string;
  vehicleDetails?: string;
  pickupTime?: string;
  pickupAddress?: string;
};

export type SupplierRFQ = {
  id: string;
  rfqNumber: string;
  retailerId: string;
  retailerName: string;
  products: string;
  qty: number;
  targetPrice: number;
  status: "new" | "pending_response" | "quoted" | "accepted" | "rejected" | "expired";
  expiryDate: string;
  createdAt: string;
  sellerResponse?: string;
  deliveryTimeline?: string;
};
