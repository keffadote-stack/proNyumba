export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          employee_id: string | null
          full_name: string
          hired_date: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          performance_rating: number | null
          phone_number: string | null
          updated_at: string | null
          user_role: 'super_admin' | 'property_admin' | 'tenant'
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          employee_id?: string | null
          full_name: string
          hired_date?: string | null
          id: string
          is_active?: boolean | null
          is_verified?: boolean | null
          performance_rating?: number | null
          phone_number?: string | null
          updated_at?: string | null
          user_role: 'super_admin' | 'property_admin' | 'tenant'
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          employee_id?: string | null
          full_name?: string
          hired_date?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          performance_rating?: number | null
          phone_number?: string | null
          updated_at?: string | null
          user_role?: 'super_admin' | 'property_admin' | 'tenant'
        }
        Relationships: []
      }
      properties: {
        Row: {
          amenities: string[] | null
          area: string
          assigned_admin_id: string
          bathrooms: number
          bedrooms: number
          bookings_count: number | null
          city: string
          contact_preferences: Json | null
          created_at: string | null
          description: string
          full_address: string | null
          id: string
          images: string[] | null
          inquiries_count: number | null
          is_available: boolean | null
          occupancy_rate: number | null
          parking_available: boolean | null
          pet_policy: string | null
          property_type: 'house' | 'apartment' | 'room' | 'studio'
          rent_amount: number
          service_fee_amount: number | null
          square_footage: number | null
          title: string
          total_amount: number | null
          updated_at: string | null
          utilities: Json | null
          views_count: number | null
        }
        Insert: {
          amenities?: string[] | null
          area: string
          assigned_admin_id: string
          bathrooms: number
          bedrooms: number
          bookings_count?: number | null
          city: string
          contact_preferences?: Json | null
          created_at?: string | null
          description: string
          full_address?: string | null
          id?: string
          images?: string[] | null
          inquiries_count?: number | null
          is_available?: boolean | null
          occupancy_rate?: number | null
          parking_available?: boolean | null
          pet_policy?: string | null
          property_type: 'house' | 'apartment' | 'room' | 'studio'
          rent_amount: number
          service_fee_amount?: number | null
          square_footage?: number | null
          title: string
          total_amount?: number | null
          updated_at?: string | null
          utilities?: Json | null
          views_count?: number | null
        }
        Update: {
          amenities?: string[] | null
          area?: string
          assigned_admin_id?: string
          bathrooms?: number
          bedrooms?: number
          bookings_count?: number | null
          city?: string
          contact_preferences?: Json | null
          created_at?: string | null
          description?: string
          full_address?: string | null
          id?: string
          images?: string[] | null
          inquiries_count?: number | null
          is_available?: boolean | null
          occupancy_rate?: number | null
          parking_available?: boolean | null
          pet_policy?: string | null
          property_type?: 'house' | 'apartment' | 'room' | 'studio'
          rent_amount?: number
          service_fee_amount?: number | null
          square_footage?: number | null
          title?: string
          total_amount?: number | null
          updated_at?: string | null
          utilities?: Json | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_assigned_admin_id_fkey"
            columns: ["assigned_admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_property_views: {
        Args: { property_id: string }
        Returns: undefined
      }
    }
    Enums: {
      user_role: 'super_admin' | 'property_admin' | 'tenant'
      property_type: 'house' | 'apartment' | 'room' | 'studio'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience types for common operations
export type User = Database['public']['Tables']['users']['Row']
export type Property = Database['public']['Tables']['properties']['Row']

export type UserInsert = Database['public']['Tables']['users']['Insert']
export type PropertyInsert = Database['public']['Tables']['properties']['Insert']

export type UserUpdate = Database['public']['Tables']['users']['Update']
export type PropertyUpdate = Database['public']['Tables']['properties']['Update']

export type UserRole = Database['public']['Enums']['user_role']
export type PropertyType = Database['public']['Enums']['property_type']