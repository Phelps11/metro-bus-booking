import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
  public: {
    Tables: {
      routes: {
        Row: {
          id: string;
          from_location: string;
          to_location: string;
          duration: string;
          price: number;
          departure_time: string;
          arrival_time: string;
          available_seats: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['routes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['routes']['Insert']>;
      };
      bookings: {
        Row: {
          id: string;
          user_id: string | null;
          route_id: string;
          passenger_name: string;
          passenger_age: number;
          passenger_gender: string;
          passenger_email: string;
          passenger_phone: string;
          boarding_point: string;
          deboarding_point: string;
          booking_date: string;
          total_fare: number;
          ticket_number: string;
          status: 'confirmed' | 'delayed' | 'cancelled';
          delay_minutes: number | null;
          subscribe_to_updates: boolean;
          receive_alerts: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>;
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          route: string;
          duration_weeks: number;
          start_date: string;
          end_date: string;
          discount: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
      };
      user_profiles: {
        Row: {
          id: string;
          full_name: string;
          phone_number: string;
          email: string;
          emergency_contact: string | null;
          wallet_balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>;
      };
    };
  };
}
