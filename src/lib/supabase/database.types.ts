// This file will be generated from Supabase CLI later
// For now, we define a minimal type to satisfy TypeScript

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'admin' | 'user'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'admin' | 'user'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'user'
          created_at?: string
          updated_at?: string
        }
      }
      routes: {
        Row: {
          id: string
          origin: string
          destination: string
          depart_at: string
          capacity_total: number
          reserve_offline: number
          capacity_online: number
          price_cents: number
          currency: string
          status: 'active' | 'cancelled' | 'draft'
          image_url: string | null
          description: string | null
          homepage_position: number | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          origin: string
          destination: string
          depart_at: string
          capacity_total: number
          reserve_offline?: number
          capacity_online: number
          price_cents: number
          currency?: string
          status?: 'active' | 'cancelled' | 'draft'
          image_url?: string | null
          description?: string | null
          homepage_position?: number | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          origin?: string
          destination?: string
          depart_at?: string
          capacity_total?: number
          reserve_offline?: number
          capacity_online?: number
          price_cents?: number
          currency?: string
          status?: 'active' | 'cancelled' | 'draft'
          image_url?: string | null
          description?: string | null
          homepage_position?: number | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      seats: {
        Row: {
          id: string
          route_id: string
          seat_no: number
          pool: 'online' | 'offline'
          created_at: string
        }
        Insert: {
          id?: string
          route_id: string
          seat_no: number
          pool: 'online' | 'offline'
          created_at?: string
        }
        Update: {
          id?: string
          route_id?: string
          seat_no?: number
          pool?: 'online' | 'offline'
          created_at?: string
        }
      }
      route_seats: {
        Row: {
          id: string
          route_id: string
          seat_no: number
          pool: 'online' | 'offline'
          created_at: string
        }
        Insert: {
          id?: string
          route_id: string
          seat_no: number
          pool: 'online' | 'offline'
          created_at?: string
        }
        Update: {
          id?: string
          route_id?: string
          seat_no?: number
          pool?: 'online' | 'offline'
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          route_id: string
          user_id: string | null
          quantity: number
          amount_cents: number
          currency: string
          status: 'created' | 'paid' | 'paid_offline' | 'cancelled' | 'failed' | 'refund_required'
          source: 'online' | 'offline'
          metadata: Json
          stripe_session_id: string
          stripe_payment_intent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          route_id: string
          user_id?: string | null
          quantity: number
          amount_cents: number
          currency?: string
          status?: 'created' | 'paid' | 'paid_offline' | 'cancelled' | 'failed' | 'refund_required'
          source?: 'online' | 'offline'
          metadata?: Json
          stripe_session_id: string
          stripe_payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          route_id?: string
          user_id?: string | null
          quantity?: number
          amount_cents?: number
          currency?: string
          status?: 'created' | 'paid' | 'paid_offline' | 'cancelled' | 'failed' | 'refund_required'
          source?: 'online' | 'offline'
          metadata?: Json
          stripe_session_id?: string
          stripe_payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          route_id: string
          order_id: string
          seat_no: number
          status: 'paid' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          route_id: string
          order_id: string
          seat_no: number
          status?: 'paid' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          route_id?: string
          order_id?: string
          seat_no?: number
          status?: 'paid' | 'cancelled'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

