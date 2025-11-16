/*
  # Create Bus Booking System Schema

  1. New Tables
    - `routes`
      - `id` (uuid, primary key)
      - `from_location` (text) - Starting location
      - `to_location` (text) - Destination location
      - `duration` (text) - Trip duration (e.g., "1h 30m")
      - `price` (integer) - Price in cents/kobo
      - `departure_time` (text) - Departure time (e.g., "05:40")
      - `arrival_time` (text) - Arrival time (e.g., "07:50")
      - `available_seats` (integer) - Number of available seats
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `bookings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `route_id` (uuid, foreign key to routes)
      - `passenger_name` (text)
      - `passenger_age` (integer)
      - `passenger_gender` (text)
      - `passenger_email` (text)
      - `passenger_phone` (text)
      - `boarding_point` (text)
      - `deboarding_point` (text)
      - `booking_date` (date)
      - `total_fare` (integer)
      - `ticket_number` (text, unique)
      - `status` (text) - 'confirmed', 'delayed', 'cancelled'
      - `delay_minutes` (integer, nullable)
      - `subscribe_to_updates` (boolean, default false)
      - `receive_alerts` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `route` (text) - Route description
      - `duration_weeks` (integer) - Subscription duration in weeks
      - `start_date` (date)
      - `end_date` (date)
      - `discount` (integer) - Discount percentage
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `user_profiles`
      - `id` (uuid, primary key, foreign key to auth.users)
      - `full_name` (text)
      - `phone_number` (text)
      - `email` (text)
      - `emergency_contact` (text)
      - `wallet_balance` (integer, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Routes are publicly readable
    - Bookings, subscriptions, and profiles are user-specific

  3. Important Notes
    - Prices stored as integers (in smallest currency unit)
    - Ticket numbers are unique identifiers
    - All timestamps use timestamptz for proper timezone handling
    - User profiles linked to Supabase auth.users
*/

-- Create routes table
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
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  route_id uuid REFERENCES routes(id) ON DELETE CASCADE,
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
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
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
  emergency_contact text,
  wallet_balance integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Routes policies (public read, admin write)
CREATE POLICY "Routes are publicly readable"
  ON routes FOR SELECT
  TO authenticated, anon
  USING (true);

-- Bookings policies
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

-- Subscriptions policies
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

-- User profiles policies
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_routes_locations ON routes(from_location, to_location);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_ticket_number ON bookings(ticket_number);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Insert sample routes
INSERT INTO routes (from_location, to_location, duration, price, departure_time, arrival_time, available_seats) VALUES
  ('Berger', 'Lekki Phase 1', '1h 30m', 2400, '05:40', '07:50', 12),
  ('Berger', 'Lekki Phase 1', '1h 45m', 2400, '08:30', '10:15', 8)
ON CONFLICT DO NOTHING;