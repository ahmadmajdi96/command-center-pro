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
      app_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: []
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
      carriers: {
        Row: {
          active: boolean
          code: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          name: string
          service_level: string | null
          tracking_url_template: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          code?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          name: string
          service_level?: string | null
          tracking_url_template?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          name?: string
          service_level?: string | null
          tracking_url_template?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cc_orders: {
        Row: {
          customer: string | null
          external_id: string | null
          id: string
          order_number: string
          raw: Json | null
          received_at: string
          status: string | null
          total: number | null
        }
        Insert: {
          customer?: string | null
          external_id?: string | null
          id?: string
          order_number: string
          raw?: Json | null
          received_at?: string
          status?: string | null
          total?: number | null
        }
        Update: {
          customer?: string | null
          external_id?: string | null
          id?: string
          order_number?: string
          raw?: Json | null
          received_at?: string
          status?: string | null
          total?: number | null
        }
        Relationships: []
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
      cycle_counts: {
        Row: {
          completed_at: string | null
          counted_by: string | null
          created_at: string
          id: string
          reference: string
          scheduled_for: string | null
          status: Database["public"]["Enums"]["doc_status"]
          updated_at: string
          variance: number | null
          warehouse_id: string | null
          zone_id: string | null
        }
        Insert: {
          completed_at?: string | null
          counted_by?: string | null
          created_at?: string
          id?: string
          reference: string
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          updated_at?: string
          variance?: number | null
          warehouse_id?: string | null
          zone_id?: string | null
        }
        Update: {
          completed_at?: string | null
          counted_by?: string | null
          created_at?: string
          id?: string
          reference?: string
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          updated_at?: string
          variance?: number | null
          warehouse_id?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cycle_counts_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cycle_counts_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_events: {
        Row: {
          created_at: string
          error: string | null
          event_type: string
          external_id: string | null
          id: string
          payload: Json
          processed_at: string | null
          status: string
          system: Database["public"]["Enums"]["integration_system"]
        }
        Insert: {
          created_at?: string
          error?: string | null
          event_type: string
          external_id?: string | null
          id?: string
          payload?: Json
          processed_at?: string | null
          status?: string
          system: Database["public"]["Enums"]["integration_system"]
        }
        Update: {
          created_at?: string
          error?: string | null
          event_type?: string
          external_id?: string | null
          id?: string
          payload?: Json
          processed_at?: string | null
          status?: string
          system?: Database["public"]["Enums"]["integration_system"]
        }
        Relationships: []
      }
      integration_sync_runs: {
        Row: {
          detail: Json | null
          errors: number | null
          finished_at: string | null
          id: string
          pulled: number | null
          reconciled: number | null
          started_at: string
          status: string
          system: Database["public"]["Enums"]["integration_system"]
        }
        Insert: {
          detail?: Json | null
          errors?: number | null
          finished_at?: string | null
          id?: string
          pulled?: number | null
          reconciled?: number | null
          started_at?: string
          status?: string
          system: Database["public"]["Enums"]["integration_system"]
        }
        Update: {
          detail?: Json | null
          errors?: number | null
          finished_at?: string | null
          id?: string
          pulled?: number | null
          reconciled?: number | null
          started_at?: string
          status?: string
          system?: Database["public"]["Enums"]["integration_system"]
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
      inventory_adjustments: {
        Row: {
          bin_id: string | null
          created_at: string
          created_by: string | null
          id: string
          product_id: string | null
          quantity_delta: number
          reason: string
          reference: string
          status: Database["public"]["Enums"]["doc_status"]
          updated_at: string
        }
        Insert: {
          bin_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          product_id?: string | null
          quantity_delta: number
          reason: string
          reference: string
          status?: Database["public"]["Enums"]["doc_status"]
          updated_at?: string
        }
        Update: {
          bin_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          product_id?: string | null
          quantity_delta?: number
          reason?: string
          reference?: string
          status?: Database["public"]["Enums"]["doc_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_adjustments_bin_id_fkey"
            columns: ["bin_id"]
            isOneToOne: false
            referencedRelation: "bins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_adjustments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      packs: {
        Row: {
          created_at: string
          dimensions: string | null
          id: string
          packed_at: string | null
          reference: string
          sales_order_id: string | null
          station: string | null
          status: Database["public"]["Enums"]["doc_status"]
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          dimensions?: string | null
          id?: string
          packed_at?: string | null
          reference: string
          sales_order_id?: string | null
          station?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          dimensions?: string | null
          id?: string
          packed_at?: string | null
          reference?: string
          sales_order_id?: string | null
          station?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "packs_sales_order_id_fkey"
            columns: ["sales_order_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      pick_tasks: {
        Row: {
          assigned_to: string | null
          bin_id: string | null
          created_at: string
          id: string
          product_id: string | null
          quantity: number
          quantity_picked: number
          sales_order_id: string | null
          status: Database["public"]["Enums"]["doc_status"]
          updated_at: string
          wave_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          bin_id?: string | null
          created_at?: string
          id?: string
          product_id?: string | null
          quantity?: number
          quantity_picked?: number
          sales_order_id?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          updated_at?: string
          wave_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          bin_id?: string | null
          created_at?: string
          id?: string
          product_id?: string | null
          quantity?: number
          quantity_picked?: number
          sales_order_id?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          updated_at?: string
          wave_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pick_tasks_bin_id_fkey"
            columns: ["bin_id"]
            isOneToOne: false
            referencedRelation: "bins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pick_tasks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pick_tasks_sales_order_id_fkey"
            columns: ["sales_order_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pick_tasks_wave_id_fkey"
            columns: ["wave_id"]
            isOneToOne: false
            referencedRelation: "pick_waves"
            referencedColumns: ["id"]
          },
        ]
      }
      pick_waves: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          reference: string
          released_at: string | null
          status: Database["public"]["Enums"]["doc_status"]
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          reference: string
          released_at?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          reference?: string
          released_at?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pick_waves_warehouse_id_fkey"
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
      putaway_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          from_location: string | null
          id: string
          product_id: string | null
          quantity: number
          receiving_id: string | null
          reference: string
          status: Database["public"]["Enums"]["doc_status"]
          to_bin_id: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          from_location?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          receiving_id?: string | null
          reference: string
          status?: Database["public"]["Enums"]["doc_status"]
          to_bin_id?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          from_location?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          receiving_id?: string | null
          reference?: string
          status?: Database["public"]["Enums"]["doc_status"]
          to_bin_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "putaway_tasks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "putaway_tasks_receiving_id_fkey"
            columns: ["receiving_id"]
            isOneToOne: false
            referencedRelation: "receiving_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "putaway_tasks_to_bin_id_fkey"
            columns: ["to_bin_id"]
            isOneToOne: false
            referencedRelation: "bins"
            referencedColumns: ["id"]
          },
        ]
      }
      qc_inspections: {
        Row: {
          created_at: string
          external_id: string | null
          id: string
          inspected_at: string
          inspector: string | null
          lot: string | null
          notes: string | null
          product_id: string | null
          result: string
        }
        Insert: {
          created_at?: string
          external_id?: string | null
          id?: string
          inspected_at?: string
          inspector?: string | null
          lot?: string | null
          notes?: string | null
          product_id?: string | null
          result: string
        }
        Update: {
          created_at?: string
          external_id?: string | null
          id?: string
          inspected_at?: string
          inspector?: string | null
          lot?: string | null
          notes?: string | null
          product_id?: string | null
          result?: string
        }
        Relationships: [
          {
            foreignKeyName: "qc_inspections_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_holds: {
        Row: {
          created_at: string
          created_by: string | null
          external_ref: string | null
          id: string
          lot: string | null
          product_id: string | null
          qc_source: string | null
          quantity: number
          reason: string
          reference: string
          released_at: string | null
          severity: string | null
          status: Database["public"]["Enums"]["doc_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          external_ref?: string | null
          id?: string
          lot?: string | null
          product_id?: string | null
          qc_source?: string | null
          quantity?: number
          reason: string
          reference: string
          released_at?: string | null
          severity?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          external_ref?: string | null
          id?: string
          lot?: string | null
          product_id?: string | null
          qc_source?: string | null
          quantity?: number
          reason?: string
          reference?: string
          released_at?: string | null
          severity?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quality_holds_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
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
      receiving_lines: {
        Row: {
          created_at: string
          id: string
          lot: string | null
          product_id: string | null
          quantity_expected: number
          quantity_received: number
          receiving_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lot?: string | null
          product_id?: string | null
          quantity_expected?: number
          quantity_received?: number
          receiving_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lot?: string | null
          product_id?: string | null
          quantity_expected?: number
          quantity_received?: number
          receiving_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receiving_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receiving_lines_receiving_id_fkey"
            columns: ["receiving_id"]
            isOneToOne: false
            referencedRelation: "receiving_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      receiving_orders: {
        Row: {
          created_at: string
          created_by: string | null
          expected_at: string | null
          id: string
          notes: string | null
          purchase_order_id: string | null
          received_at: string | null
          reference: string
          status: Database["public"]["Enums"]["doc_status"]
          supplier_id: string | null
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expected_at?: string | null
          id?: string
          notes?: string | null
          purchase_order_id?: string | null
          received_at?: string | null
          reference: string
          status?: Database["public"]["Enums"]["doc_status"]
          supplier_id?: string | null
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expected_at?: string | null
          id?: string
          notes?: string | null
          purchase_order_id?: string | null
          received_at?: string | null
          reference?: string
          status?: Database["public"]["Enums"]["doc_status"]
          supplier_id?: string | null
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receiving_orders_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receiving_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receiving_orders_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
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
      shipments: {
        Row: {
          carrier_id: string | null
          created_at: string
          delivered_at: string | null
          destination: string | null
          id: string
          reference: string
          sales_order_id: string | null
          shipped_at: string | null
          status: Database["public"]["Enums"]["doc_status"]
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          carrier_id?: string | null
          created_at?: string
          delivered_at?: string | null
          destination?: string | null
          id?: string
          reference: string
          sales_order_id?: string | null
          shipped_at?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          carrier_id?: string | null
          created_at?: string
          delivered_at?: string | null
          destination?: string | null
          id?: string
          reference?: string
          sales_order_id?: string | null
          shipped_at?: string | null
          status?: Database["public"]["Enums"]["doc_status"]
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipments_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "carriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_sales_order_id_fkey"
            columns: ["sales_order_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
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
      doc_status:
        | "draft"
        | "open"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "on_hold"
      integration_system:
        | "mes"
        | "qms"
        | "oms"
        | "cmms"
        | "qc_system"
        | "command_center"
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
      doc_status: [
        "draft",
        "open",
        "in_progress",
        "completed",
        "cancelled",
        "on_hold",
      ],
      integration_system: [
        "mes",
        "qms",
        "oms",
        "cmms",
        "qc_system",
        "command_center",
      ],
    },
  },
} as const
