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
      aisles: {
        Row: {
          code: string
          id: string
          length_m: number
          orientation: string
          x: number
          y: number
          zone_id: string
        }
        Insert: {
          code: string
          id?: string
          length_m?: number
          orientation?: string
          x?: number
          y?: number
          zone_id: string
        }
        Update: {
          code?: string
          id?: string
          length_m?: number
          orientation?: string
          x?: number
          y?: number
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aisles_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      bins: {
        Row: {
          code: string
          id: string
          level: number
          position: number
          rack_id: string
          status: string
        }
        Insert: {
          code: string
          id?: string
          level?: number
          position?: number
          rack_id: string
          status?: string
        }
        Update: {
          code?: string
          id?: string
          level?: number
          position?: number
          rack_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "bins_rack_id_fkey"
            columns: ["rack_id"]
            isOneToOne: false
            referencedRelation: "racks"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          code: string
          contact_email: string | null
          country: string | null
          created_at: string
          id: string
          name: string
          status: string | null
        }
        Insert: {
          code: string
          contact_email?: string | null
          country?: string | null
          created_at?: string
          id?: string
          name: string
          status?: string | null
        }
        Update: {
          code?: string
          contact_email?: string | null
          country?: string | null
          created_at?: string
          id?: string
          name?: string
          status?: string | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          bin_id: string | null
          expiry: string | null
          id: string
          lot: string | null
          product_id: string
          qty: number
          status: string
          updated_at: string
          warehouse_id: string
        }
        Insert: {
          bin_id?: string | null
          expiry?: string | null
          id?: string
          lot?: string | null
          product_id: string
          qty?: number
          status?: string
          updated_at?: string
          warehouse_id: string
        }
        Update: {
          bin_id?: string | null
          expiry?: string | null
          id?: string
          lot?: string | null
          product_id?: string
          qty?: number
          status?: string
          updated_at?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_bin_id_fkey"
            columns: ["bin_id"]
            isOneToOne: false
            referencedRelation: "bins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          abc_class: string | null
          category: string | null
          created_at: string
          hazmat: boolean
          id: string
          max_stock: number | null
          min_stock: number | null
          name: string
          sku: string
          uom: string
          updated_at: string
        }
        Insert: {
          abc_class?: string | null
          category?: string | null
          created_at?: string
          hazmat?: boolean
          id?: string
          max_stock?: number | null
          min_stock?: number | null
          name: string
          sku: string
          uom?: string
          updated_at?: string
        }
        Update: {
          abc_class?: string | null
          category?: string | null
          created_at?: string
          hazmat?: boolean
          id?: string
          max_stock?: number | null
          min_stock?: number | null
          name?: string
          sku?: string
          uom?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: []
      }
      purchase_order_lines: {
        Row: {
          id: string
          po_id: string
          product_id: string
          qty_ordered: number
          qty_received: number
          unit_price: number | null
        }
        Insert: {
          id?: string
          po_id: string
          product_id: string
          qty_ordered?: number
          qty_received?: number
          unit_price?: number | null
        }
        Update: {
          id?: string
          po_id?: string
          product_id?: string
          qty_ordered?: number
          qty_received?: number
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_lines_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          expected_at: string | null
          id: string
          po_number: string
          status: string
          supplier_id: string | null
          total_value: number | null
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string
          expected_at?: string | null
          id?: string
          po_number: string
          status?: string
          supplier_id?: string | null
          total_value?: number | null
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string
          expected_at?: string | null
          id?: string
          po_number?: string
          status?: string
          supplier_id?: string | null
          total_value?: number | null
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      racks: {
        Row: {
          aisle_id: string
          code: string
          d: number
          id: string
          levels: number
          w: number
          x: number
          y: number
        }
        Insert: {
          aisle_id: string
          code: string
          d?: number
          id?: string
          levels?: number
          w?: number
          x?: number
          y?: number
        }
        Update: {
          aisle_id?: string
          code?: string
          d?: number
          id?: string
          levels?: number
          w?: number
          x?: number
          y?: number
        }
        Relationships: [
          {
            foreignKeyName: "racks_aisle_id_fkey"
            columns: ["aisle_id"]
            isOneToOne: false
            referencedRelation: "aisles"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_order_lines: {
        Row: {
          id: string
          product_id: string
          qty_ordered: number
          qty_shipped: number
          so_id: string
          unit_price: number | null
        }
        Insert: {
          id?: string
          product_id: string
          qty_ordered?: number
          qty_shipped?: number
          so_id: string
          unit_price?: number | null
        }
        Update: {
          id?: string
          product_id?: string
          qty_ordered?: number
          qty_shipped?: number
          so_id?: string
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_order_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_order_lines_so_id_fkey"
            columns: ["so_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_orders: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          requested_at: string | null
          so_number: string
          status: string
          total_value: number | null
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          requested_at?: string | null
          so_number: string
          status?: string
          total_value?: number | null
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          requested_at?: string | null
          so_number?: string
          status?: string
          total_value?: number | null
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_orders_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          code: string
          contact_email: string | null
          country: string | null
          created_at: string
          id: string
          name: string
          status: string | null
        }
        Insert: {
          code: string
          contact_email?: string | null
          country?: string | null
          created_at?: string
          id?: string
          name: string
          status?: string | null
        }
        Update: {
          code?: string
          contact_email?: string | null
          country?: string | null
          created_at?: string
          id?: string
          name?: string
          status?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
          warehouse_id?: string | null
        }
        Relationships: []
      }
      warehouses: {
        Row: {
          city: string | null
          code: string
          country: string | null
          created_at: string
          id: string
          length_m: number
          name: string
          status: string
          timezone: string | null
          updated_at: string
          width_m: number
        }
        Insert: {
          city?: string | null
          code: string
          country?: string | null
          created_at?: string
          id?: string
          length_m?: number
          name: string
          status?: string
          timezone?: string | null
          updated_at?: string
          width_m?: number
        }
        Update: {
          city?: string | null
          code?: string
          country?: string | null
          created_at?: string
          id?: string
          length_m?: number
          name?: string
          status?: string
          timezone?: string | null
          updated_at?: string
          width_m?: number
        }
        Relationships: []
      }
      zones: {
        Row: {
          code: string
          color: string | null
          h: number
          id: string
          kind: string
          name: string
          w: number
          warehouse_id: string
          x: number
          y: number
        }
        Insert: {
          code: string
          color?: string | null
          h?: number
          id?: string
          kind?: string
          name: string
          w?: number
          warehouse_id: string
          x?: number
          y?: number
        }
        Update: {
          code?: string
          color?: string | null
          h?: number
          id?: string
          kind?: string
          name?: string
          w?: number
          warehouse_id?: string
          x?: number
          y?: number
        }
        Relationships: [
          {
            foreignKeyName: "zones_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
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
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "manager"
        | "supervisor"
        | "operator"
        | "quality"
        | "maintenance"
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
      app_role: [
        "admin",
        "manager",
        "supervisor",
        "operator",
        "quality",
        "maintenance",
      ],
    },
  },
} as const
