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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          address: string | null
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          tenant_id: string
        }
        Insert: {
          address?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          tenant_id: string
        }
        Update: {
          address?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          deal_id: string | null
          id: string
          paid: boolean | null
          paid_at: string | null
          salesperson_id: string | null
          tenant_id: string
          value: number
        }
        Insert: {
          deal_id?: string | null
          id?: string
          paid?: boolean | null
          paid_at?: string | null
          salesperson_id?: string | null
          tenant_id: string
          value: number
        }
        Update: {
          deal_id?: string | null
          id?: string
          paid?: boolean | null
          paid_at?: string | null
          salesperson_id?: string | null
          tenant_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "commissions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          accepted_price: number | null
          asking_price: number | null
          client_id: string | null
          created_at: string
          id: string
          offered_price: number | null
          salesperson_id: string | null
          signal_amount: number | null
          signal_method: string | null
          stage: string
          tenant_id: string
          vehicle_id: string | null
        }
        Insert: {
          accepted_price?: number | null
          asking_price?: number | null
          client_id?: string | null
          created_at?: string
          id?: string
          offered_price?: number | null
          salesperson_id?: string | null
          signal_amount?: number | null
          signal_method?: string | null
          stage?: string
          tenant_id: string
          vehicle_id?: string | null
        }
        Update: {
          accepted_price?: number | null
          asking_price?: number | null
          client_id?: string | null
          created_at?: string
          id?: string
          offered_price?: number | null
          salesperson_id?: string | null
          signal_amount?: number | null
          signal_method?: string | null
          stage?: string
          tenant_id?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          created_at: string
          id: string
          message: string | null
          name: string
          phone: string | null
          status: string
          tenant_id: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          status?: string
          tenant_id: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          status?: string
          tenant_id?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          actual_cost: number | null
          created_at: string
          description: string | null
          estimated_cost: number | null
          id: string
          mechanic: string | null
          parts: Json | null
          status: string
          tenant_id: string
          type: string
          vehicle_id: string | null
        }
        Insert: {
          actual_cost?: number | null
          created_at?: string
          description?: string | null
          estimated_cost?: number | null
          id?: string
          mechanic?: string | null
          parts?: Json | null
          status?: string
          tenant_id: string
          type: string
          vehicle_id?: string | null
        }
        Update: {
          actual_cost?: number | null
          created_at?: string
          description?: string | null
          estimated_cost?: number | null
          id?: string
          mechanic?: string | null
          parts?: Json | null
          status?: string
          tenant_id?: string
          type?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          address: string | null
          cnpj: string | null
          created_at: string
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          plan: string | null
          slug: string | null
        }
        Insert: {
          address?: string | null
          cnpj?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          plan?: string | null
          slug?: string | null
        }
        Update: {
          address?: string | null
          cnpj?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          plan?: string | null
          slug?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          category: string | null
          created_at: string
          date: string
          description: string
          id: string
          tenant_id: string
          type: string
          value: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          date?: string
          description: string
          id?: string
          tenant_id: string
          type: string
          value: number
        }
        Update: {
          category?: string | null
          created_at?: string
          date?: string
          description?: string
          id?: string
          tenant_id?: string
          type?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          brand: string
          color: string | null
          cost_price: number | null
          created_at: string
          features: Json | null
          fuel: string | null
          id: string
          km: number | null
          min_price: number | null
          model: string
          observations: string | null
          photos: Json | null
          plate: string | null
          sale_price: number | null
          status: string
          tenant_id: string
          transmission: string | null
          version: string | null
          year: number
        }
        Insert: {
          brand: string
          color?: string | null
          cost_price?: number | null
          created_at?: string
          features?: Json | null
          fuel?: string | null
          id?: string
          km?: number | null
          min_price?: number | null
          model: string
          observations?: string | null
          photos?: Json | null
          plate?: string | null
          sale_price?: number | null
          status?: string
          tenant_id: string
          transmission?: string | null
          version?: string | null
          year: number
        }
        Update: {
          brand?: string
          color?: string | null
          cost_price?: number | null
          created_at?: string
          features?: Json | null
          fuel?: string | null
          id?: string
          km?: number | null
          min_price?: number | null
          model?: string
          observations?: string | null
          photos?: Json | null
          plate?: string | null
          sale_price?: number | null
          status?: string
          tenant_id?: string
          transmission?: string | null
          version?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      vistorias: {
        Row: {
          checklist: Json | null
          client_signature: string | null
          created_at: string
          damage_map: Json | null
          fuel_level: string | null
          id: string
          inspector: string | null
          observations: string | null
          odometer: number | null
          photos: Json | null
          status: string
          tenant_id: string
          type: string
          vehicle_id: string | null
        }
        Insert: {
          checklist?: Json | null
          client_signature?: string | null
          created_at?: string
          damage_map?: Json | null
          fuel_level?: string | null
          id?: string
          inspector?: string | null
          observations?: string | null
          odometer?: number | null
          photos?: Json | null
          status?: string
          tenant_id: string
          type: string
          vehicle_id?: string | null
        }
        Update: {
          checklist?: Json | null
          client_signature?: string | null
          created_at?: string
          damage_map?: Json | null
          fuel_level?: string | null
          id?: string
          inspector?: string | null
          observations?: string | null
          odometer?: number | null
          photos?: Json | null
          status?: string
          tenant_id?: string
          type?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vistorias_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vistorias_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_tenant_onboarding: {
        Args: {
          _address?: string
          _cnpj?: string
          _name: string
          _phone?: string
          _slug?: string
        }
        Returns: string
      }
      get_user_tenant_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "vendedor" | "gerente" | "superadmin"
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
      app_role: ["admin", "vendedor", "gerente", "superadmin"],
    },
  },
} as const
