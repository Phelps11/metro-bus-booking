/*
  # Create Bus Booking System Tables
  
  This migration creates the complete schema for the bus booking application.
  
  1. New Tables
    - `routes` - Bus routes with schedules and pricing
    - `bookings` - User bookings and tickets
    - `subscriptions` - Weekly route subscriptions
    - `user_profiles` - Extended user profile information
  
  2. Security
    - Enable RLS on all tables
    - Routes are publicly readable by authenticated and anonymous users
    - Bookings are restricted to owner access only
    - Subscriptions are restricted to owner access only
    - User profiles are restricted to owner access only
  
  3. Sample Data
    - Inserts popular routes for immediate testing
*/

-- Drop existing routes table if it has wrong schema
DROP TABLE IF EXISTS routes CASCADE;

-- Create routes table for bus booking
CREATE TABLE IF NOT EXISTS routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_location text NOT NULL,
  to_location text NOT NULL,
  duration text NOT NULL,
  price integer NOT NULL,
  departure_time text NOT NULL,
  arrival_time text NOT NULL,
  available_seats integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  route_id uuid REFERENCES routes(id) ON DELETE CASCADE NOT NULL,
  passenger_name text NOT NULL,
  passenger_age integer NOT NULL,
  passenger_gender text NOT NULL,
  passenger_email text NOT NULL,
  passenger_phone text NOT NULL,
  boarding_point text NOT NULL,
  deboarding_point text NOT NULL,
  booking_date date NOT NULL,
  total_fare integer NOT NULL,
  ticket_number text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  delay_minutes integer,
  subscribe_to_updates boolean DEFAULT false,
  receive_alerts boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  route text NOT NULL,
  duration_weeks integer NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  discount integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone_number text NOT NULL,
  email text NOT NULL,
  emergency_contact text DEFAULT '',
  wallet_balance integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Routes policies (publicly readable)
CREATE POLICY "Routes are publicly readable"
  ON routes FOR SELECT
  TO authenticated, anon
  USING (true);

-- Bookings policies (user-specific)
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookings"
  ON bookings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Subscriptions policies (user-specific)
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON subscriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- User profiles policies (user-specific)
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can create own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_routes_locations ON routes(from_location, to_location);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_ticket_number ON bookings(ticket_number);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Insert sample routes for testing
INSERT INTO routes (from_location, to_location, duration, price, departure_time, arrival_time, available_seats) VALUES
  ('Berger', 'Lekki Phase 1', '45 mins', 800, '07:00 AM', '07:45 AM', 35),
  ('Ikorodu', 'Victoria Island', '50 mins', 900, '06:30 AM', '07:20 AM', 28),
  ('Ikeja', 'Marina', '35 mins', 700, '07:30 AM', '08:05 AM', 42),
  ('Oshodi', 'Lekki Phase 1', '55 mins', 1000, '06:45 AM', '07:40 AM', 30),
  ('Yaba', 'Victoria Island', '25 mins', 600, '08:00 AM', '08:25 AM', 38),
  ('Surulere', 'Ikeja', '40 mins', 750, '07:15 AM', '07:55 AM', 25),
  ('Ajah', 'CMS', '60 mins', 1100, '06:00 AM', '07:00 AM', 32),
  ('Ketu', 'Obalende', '45 mins', 850, '07:00 AM', '07:45 AM', 40),
  ('Mile 2', 'Marina', '50 mins', 900, '06:30 AM', '07:20 AM', 35),
  ('Ojota', 'Victoria Island', '40 mins', 800, '07:30 AM', '08:10 AM', 45)
ON CONFLICT DO NOTHING;
