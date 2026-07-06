import type { LucideIcon } from "lucide-react";
import { Bell, CheckCircle2, MessageSquare, Package, Tag } from "lucide-react";

export type NotificationType = "order" | "verification" | "offer" | "message" | "announcement";

export type DemoNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  icon: LucideIcon;
};

export const DEMO_NOTIFICATIONS: DemoNotification[] = [
  { id: "n1", type: "verification", title: "KYC under review", body: "Our team is verifying your GST certificate. Usually takes < 24h.", time: "2h ago", unread: true, icon: CheckCircle2 },
  { id: "n2", type: "offer", title: "10% off on Parle bulk pack", body: "Limited-time bulk deal from a verified supplier in Mumbai.", time: "5h ago", unread: true, icon: Tag },
  { id: "n3", type: "order", title: "Order #VS-1042 shipped", body: "Your order left the warehouse and is en-route.", time: "1d ago", unread: false, icon: Package },
  { id: "n4", type: "message", title: "New message from Shree Traders", body: "We can offer better rates on your last inquiry.", time: "2d ago", unread: false, icon: MessageSquare },
  { id: "n5", type: "announcement", title: "Business credit line now live", body: "Unlock interest-free 30-day credit after KYC verification.", time: "3d ago", unread: false, icon: Bell },
];

export const DEMO_ACTIVITY = [
  { id: "a1", label: "Placed an inquiry with Shree Traders", time: "2h ago" },
  { id: "a2", label: "Added 3 products to wishlist", time: "4h ago" },
  { id: "a3", label: "Updated business address", time: "Yesterday" },
  { id: "a4", label: "Uploaded GST certificate", time: "2d ago" },
];

export const DEMO_SUPPLIERS = [
  { id: "s1", name: "Shree Traders", city: "Mumbai", rating: 4.8, products: 240 },
  { id: "s2", name: "Ganesh Wholesalers", city: "Ahmedabad", rating: 4.6, products: 180 },
  { id: "s3", name: "Krishna Distributors", city: "Delhi", rating: 4.9, products: 320 },
];
