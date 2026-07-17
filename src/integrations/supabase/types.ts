export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          product_snapshot: Json
          quantity: number
          saved_for_later: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          product_snapshot: Json
          quantity?: number
          saved_for_later?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          product_snapshot?: Json
          quantity?: number
          saved_for_later?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          description: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          id: string
          is_active: boolean
          max_discount: number | null
          min_order_value: number
          usage_limit: number | null
          used_count: number
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          id?: string
          is_active?: boolean
          max_discount?: number | null
          min_order_value?: number
          usage_limit?: number | null
          used_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          id?: string
          is_active?: boolean
          max_discount?: number | null
          min_order_value?: number
          usage_limit?: number | null
          used_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          gst_amount: number
          id: string
          invoice_number: string
          issued_at: string
          order_id: string
          pdf_url: string | null
          user_id: string
        }
        Insert: {
          amount: number
          gst_amount?: number
          id?: string
          invoice_number: string
          issued_at?: string
          order_id: string
          pdf_url?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          gst_amount?: number
          id?: string
          invoice_number?: string
          issued_at?: string
          order_id?: string
          pdf_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          discount_amount: number
          gst_amount: number
          gst_rate: number
          id: string
          line_total: number
          order_id: string
          product_id: string
          product_snapshot: Json
          quantity: number
          unit_price: number
          seller_id: string | null
          seller_order_id: string | null
          buyed_id: string
        }
        Insert: {
          created_at?: string
          discount_amount?: number
          gst_amount?: number
          gst_rate?: number
          id?: string
          line_total: number
          order_id: string
          product_id: string
          product_snapshot: Json
          quantity: number
          unit_price: number
          seller_id?: string | null
          seller_order_id?: string | null
          buyed_id?: string
        }
        Update: {
          created_at?: string
          discount_amount?: number
          gst_amount?: number
          gst_rate?: number
          id?: string
          line_total?: number
          order_id?: string
          product_id?: string
          product_snapshot?: Json
          quantity?: number
          unit_price?: number
          seller_id?: string | null
          seller_order_id?: string | null
          buyed_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_seller_order_id_fkey"
            columns: ["seller_order_id"]
            isOneToOne: false
            referencedRelation: "seller_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_buyed_id_fkey"
            columns: ["buyed_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cgst: number
          coupon_code: string | null
          coupon_id: string | null
          created_at: string
          delivery_partner: string | null
          discount_total: number
          estimated_delivery: string | null
          grand_total: number
          gst_total: number
          id: string
          igst: number
          notes: string | null
          order_number: string
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          sgst: number
          shipping_address: Json
          shipping_total: number
          status: Database["public"]["Enums"]["order_status"]
          status_history: Json
          subtotal: number
          tracking_number: string | null
          updated_at: string
          user_id: string
          buyer_id: string | null
        }
        Insert: {
          cgst?: number
          coupon_code?: string | null
          coupon_id?: string | null
          created_at?: string
          delivery_partner?: string | null
          discount_total?: number
          estimated_delivery?: string | null
          grand_total?: number
          gst_total?: number
          id?: string
          igst?: number
          notes?: string | null
          order_number: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          sgst?: number
          shipping_address: Json
          shipping_total?: number
          status?: Database["public"]["Enums"]["order_status"]
          status_history?: Json
          subtotal?: number
          tracking_number?: string | null
          updated_at?: string
          user_id: string
          buyer_id?: string | null
        }
        Update: {
          cgst?: number
          coupon_code?: string | null
          coupon_id?: string | null
          created_at?: string
          delivery_partner?: string | null
          discount_total?: number
          estimated_delivery?: string | null
          grand_total?: number
          gst_total?: number
          id?: string
          igst?: number
          notes?: string | null
          order_number?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          sgst?: number
          shipping_address?: Json
          shipping_total?: number
          status?: Database["public"]["Enums"]["order_status"]
          status_history?: Json
          subtotal?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
          buyer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_records: {
        Row: {
          amount: number
          created_at: string
          gateway: string | null
          id: string
          meta: Json | null
          method: Database["public"]["Enums"]["payment_method"]
          order_id: string
          status: Database["public"]["Enums"]["payment_status"]
          transaction_ref: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          gateway?: string | null
          id?: string
          meta?: Json | null
          method: Database["public"]["Enums"]["payment_method"]
          order_id: string
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_ref?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          gateway?: string | null
          id?: string
          meta?: Json | null
          method?: Database["public"]["Enums"]["payment_method"]
          order_id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_ref?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_records_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          alternate_phone: string | null
          avatar_url: string | null
          business_category: string | null
          business_email: string | null
          business_name: string | null
          business_type: Database["public"]["Enums"]["business_type"] | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          full_name: string | null
          gst_certificate_url: string | null
          gst_number: string | null
          id: string
          logo_url: string | null
          onboarding_completed: boolean
          owner_name: string | null
          pan_document_url: string | null
          pan_number: string | null
          phone: string | null
          pincode: string | null
          shop_image_url: string | null
          state: string | null
          updated_at: string
          verification_status: Database["public"]["Enums"]["verification_status"]
          website: string | null
          whatsapp: string | null
          years_in_business: number | null
        }
        Insert: {
          address?: string | null
          alternate_phone?: string | null
          avatar_url?: string | null
          business_category?: string | null
          business_email?: string | null
          business_name?: string | null
          business_type?: Database["public"]["Enums"]["business_type"] | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          gst_certificate_url?: string | null
          gst_number?: string | null
          id: string
          logo_url?: string | null
          onboarding_completed?: boolean
          owner_name?: string | null
          pan_document_url?: string | null
          pan_number?: string | null
          phone?: string | null
          pincode?: string | null
          shop_image_url?: string | null
          state?: string | null
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          website?: string | null
          whatsapp?: string | null
          years_in_business?: number | null
        }
        Update: {
          address?: string | null
          alternate_phone?: string | null
          avatar_url?: string | null
          business_category?: string | null
          business_email?: string | null
          business_name?: string | null
          business_type?: Database["public"]["Enums"]["business_type"] | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          gst_certificate_url?: string | null
          gst_number?: string | null
          id?: string
          logo_url?: string | null
          onboarding_completed?: boolean
          owner_name?: string | null
          pan_document_url?: string | null
          pan_number?: string | null
          phone?: string | null
          pincode?: string | null
          shop_image_url?: string | null
          state?: string | null
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          website?: string | null
          whatsapp?: string | null
          years_in_business?: number | null
        }
        Relationships: []
      }
      shipping_addresses: {
        Row: {
          city: string
          contact_name: string
          country: string
          created_at: string
          gst_number: string | null
          id: string
          is_default: boolean
          label: string | null
          landmark: string | null
          latitude: number | null
          longitude: number | null
          line1: string
          line2: string | null
          phone: string
          pincode: string
          state: string
          type: Database["public"]["Enums"]["address_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          city: string
          contact_name: string
          country?: string
          created_at?: string
          gst_number?: string | null
          id?: string
          is_default?: boolean
          label?: string | null
          landmark?: string | null
          latitude?: number | null
          longitude?: number | null
          line1: string
          line2?: string | null
          phone: string
          pincode: string
          state: string
          type?: Database["public"]["Enums"]["address_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          contact_name?: string
          country?: string
          created_at?: string
          gst_number?: string | null
          id?: string
          is_default?: boolean
          label?: string | null
          landmark?: string | null
          latitude?: number | null
          longitude?: number | null
          line1?: string
          line2?: string | null
          phone?: string
          pincode?: string
          state?: string
          type?: Database["public"]["Enums"]["address_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      buyers: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          business_name: string | null
          phone: string | null
          address: string | null
          whatsapp: string | null
          shipping_address: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          business_name?: string | null
          phone?: string | null
          address?: string | null
          whatsapp?: string | null
          shipping_address?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          business_name?: string | null
          phone?: string | null
          address?: string | null
          whatsapp?: string | null
          shipping_address?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          slug: string
          name: string
          icon: string | null
          image: string | null
          product_count: number
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          slug: string
          name: string
          icon?: string | null
          image?: string | null
          product_count?: number
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          icon?: string | null
          image?: string | null
          product_count?: number
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          id: string
          category_id: string
          slug: string
          name: string
          image: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          category_id: string
          slug: string
          name: string
          image?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          slug?: string
          name?: string
          image?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          id: string
          slug: string
          name: string
          brand: string
          category_slug: string
          sub_category: string | null
          subcategory_id: string | null
          sku: string | null
          image: string
          images: Json
          wholesale_price: number
          mrp: number
          moq: number
          unit: string
          gst_included: boolean
          gst_rate: number
          supplier: Json
          seller_id: string | null
          rating: number
          review_count: number
          in_stock: boolean
          stock_count: number
          featured: boolean
          description: string | null
          specifications: Json
          highlights: Json
          packaging_details: string | null
          delivery_days: number | null
          delivery_estimate: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          slug: string
          name: string
          brand: string
          category_slug: string
          sub_category?: string | null
          subcategory_id?: string | null
          sku?: string | null
          image: string
          images?: Json
          wholesale_price: number
          mrp: number
          moq?: number
          unit?: string
          gst_included?: boolean
          gst_rate?: number
          supplier?: Json
          seller_id?: string | null
          rating?: number
          review_count?: number
          in_stock?: boolean
          stock_count?: number
          featured?: boolean
          description?: string | null
          specifications?: Json
          highlights?: Json
          packaging_details?: string | null
          delivery_days?: number | null
          delivery_estimate?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          brand?: string
          category_slug?: string
          sub_category?: string | null
          subcategory_id?: string | null
          sku?: string | null
          image?: string
          images?: Json
          wholesale_price?: number
          mrp?: number
          moq?: number
          unit?: string
          gst_included?: boolean
          gst_rate?: number
          supplier?: Json
          seller_id?: string | null
          rating?: number
          review_count?: number
          in_stock?: boolean
          stock_count?: number
          featured?: boolean
          description?: string | null
          specifications?: Json
          highlights?: Json
          packaging_details?: string | null
          delivery_days?: number | null
          delivery_estimate?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_products: {
        Row: {
          id: string
          seller_id: string
          product_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          seller_id: string
          product_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          product_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      sellers: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          owner_name: string | null
          business_name: string | null
          phone: string | null
          whatsapp: string | null
          business_email: string | null
          website: string | null
          business_type: Database["public"]["Enums"]["business_type"] | null
          business_category: string | null
          gst_number: string | null
          pan_number: string | null
          years_in_business: number | null
          address: string | null
          city: string | null
          state: string | null
          country: string | null
          pincode: string | null
          logo_url: string | null
          shop_image_url: string | null
          gst_certificate_url: string | null
          pan_document_url: string | null
          alternate_phone: string | null
          avatar_url: string | null
          verification_status: Database["public"]["Enums"]["verification_status"]
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          owner_name?: string | null
          business_name?: string | null
          phone?: string | null
          whatsapp?: string | null
          business_email?: string | null
          website?: string | null
          business_type?: Database["public"]["Enums"]["business_type"] | null
          business_category?: string | null
          gst_number?: string | null
          pan_number?: string | null
          years_in_business?: number | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          pincode?: string | null
          logo_url?: string | null
          shop_image_url?: string | null
          gst_certificate_url?: string | null
          pan_document_url?: string | null
          alternate_phone?: string | null
          avatar_url?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          owner_name?: string | null
          business_name?: string | null
          phone?: string | null
          whatsapp?: string | null
          business_email?: string | null
          website?: string | null
          business_type?: Database["public"]["Enums"]["business_type"] | null
          business_category?: string | null
          gst_number?: string | null
          pan_number?: string | null
          years_in_business?: number | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          pincode?: string | null
          logo_url?: string | null
          shop_image_url?: string | null
          gst_certificate_url?: string | null
          pan_document_url?: string | null
          alternate_phone?: string | null
          avatar_url?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      admins: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          product_snapshot: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          product_snapshot: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          product_snapshot?: Json
          user_id?: string
        }
        Relationships: []
      }
    }
      inventory_movements: {
        Row: {
          id: string
          product_id: string
          warehouse_id: string | null
          quantity_change: number
          type: string
          order_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          warehouse_id?: string | null
          quantity_change: number
          type: string
          order_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          warehouse_id?: string | null
          quantity_change?: number
          type?: string
          order_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          body?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          body?: string | null
          read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          order_ref: string | null
          product_ref: string | null
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          order_ref?: string | null
          product_ref?: string | null
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          order_ref?: string | null
          product_ref?: string | null
          content?: string
          read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          reviewer_id: string
          rating: number
          comment: string | null
          verified_buyer: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          reviewer_id: string
          rating: number
          comment?: string | null
          verified_buyer?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          reviewer_id?: string
          rating?: number
          comment?: string | null
          verified_buyer?: boolean
          created_at?: string
        }
        Relationships: []
      }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: {
          _user_id: string
        }
        Returns: boolean
      }
      is_buyer: {
        Args: {
          _user_id: string
        }
        Returns: boolean
      }
      is_seller: {
        Args: {
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      address_type: "home" | "business" | "warehouse"
      app_role:
        | "retailer"
        | "wholesaler"
        | "manufacturer"
        | "distributor"
        | "admin"
      business_type:
        | "retailer"
        | "wholesaler"
        | "manufacturer"
        | "distributor"
        | "other"
      discount_type: "percentage" | "flat"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "packed"
        | "shipped"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
        | "return_requested"
        | "returned"
      payment_method:
        | "upi"
        | "netbanking"
        | "credit_card"
        | "debit_card"
        | "wallet"
        | "cod"
      payment_status:
        | "pending"
        | "processing"
        | "success"
        | "failed"
        | "refunded"
      verification_status: "pending" | "under_review" | "verified" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      address_type: ["home", "business", "warehouse"],
      app_role: [
        "retailer",
        "wholesaler",
        "manufacturer",
        "distributor",
        "admin",
      ],
      business_type: [
        "retailer",
        "wholesaler",
        "manufacturer",
        "distributor",
        "other",
      ],
      discount_type: ["percentage", "flat"],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "packed",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "return_requested",
        "returned",
      ],
      payment_method: [
        "upi",
        "netbanking",
        "credit_card",
        "debit_card",
        "wallet",
        "cod",
      ],
      payment_status: [
        "pending",
        "processing",
        "success",
        "failed",
        "refunded",
      ],
      verification_status: ["pending", "under_review", "verified", "rejected"],
    },
  },
} as const
