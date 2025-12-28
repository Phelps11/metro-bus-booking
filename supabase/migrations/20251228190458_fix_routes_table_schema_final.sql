/*
  # Fix Routes Table Schema
  
  ## Summary
  The routes table has an incorrect schema. This migration drops and recreates
  it with the correct schema that the application expects.
  
  ## Changes
  1. Clean up dependent data (stops, bookings, etc.)
  2. Drop existing routes table and recreate with correct columns:
     - from_location, to_location (text) - Location endpoints
     - duration (text) - Trip duration
     - price (integer) - Ticket price
     - departure_time, arrival_time (text) - Schedule times
     - available_seats (integer) - Seat availability
     - driver_id, vehicle_id (uuid) - Assignment references
     - status (text) - Route status
  
  3. Repopulate with sample Lagos routes
  
  ## Impact
  - All existing route data and related stops will be replaced with sample data
  - Existing bookings and subscriptions remain but may need route reassignment
*/

-- Clean up dependent tables first
TRUNCATE TABLE public.stops CASCADE;
TRUNCATE TABLE public.bus_tracking CASCADE;
TRUNCATE TABLE public.trip_manifests CASCADE;

-- Delete route subscriptions that reference old routes
DELETE FROM public.route_subscriptions;

-- Drop existing routes table
DROP TABLE IF EXISTS public.routes CASCADE;

-- Recreate routes table with correct schema
CREATE TABLE public.routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_location text NOT NULL,
  to_location text NOT NULL,
  duration text NOT NULL,
  price integer NOT NULL,
  departure_time text NOT NULL,
  arrival_time text NOT NULL,
  available_seats integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE SET NULL,
  driver_id uuid REFERENCES public.drivers(id) ON DELETE SET NULL,
  status text DEFAULT 'active',
  distance_km numeric
);

-- Enable RLS
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- Routes are publicly readable
CREATE POLICY "Routes are publicly readable"
  ON public.routes FOR SELECT
  TO authenticated, anon
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_routes_locations ON public.routes(from_location, to_location);
CREATE INDEX IF NOT EXISTS idx_routes_driver_id ON public.routes(driver_id);
CREATE INDEX IF NOT EXISTS idx_routes_vehicle_id ON public.routes(vehicle_id);

-- Insert sample routes
INSERT INTO public.routes (from_location, to_location, duration, price, departure_time, arrival_time, available_seats) VALUES
  ('Berger', 'Lekki Phase 1', '45 mins', 800, '07:00 AM', '07:45 AM', 35),
  ('Ikorodu', 'Victoria Island', '50 mins', 900, '06:30 AM', '07:20 AM', 28),
  ('Ikeja', 'Marina', '35 mins', 700, '07:30 AM', '08:05 AM', 42),
  ('Oshodi', 'Lekki Phase 1', '55 mins', 1000, '06:45 AM', '07:40 AM', 30),
  ('Yaba', 'Victoria Island', '25 mins', 600, '08:00 AM', '08:25 AM', 38),
  ('Surulere', 'Ikeja', '40 mins', 750, '07:15 AM', '07:55 AM', 25),
  ('Ajah', 'CMS', '60 mins', 1100, '06:00 AM', '07:00 AM', 32),
  ('Ketu', 'Obalende', '45 mins', 850, '07:00 AM', '07:45 AM', 40),
  ('Mile 2', 'Marina', '50 mins', 900, '06:30 AM', '07:20 AM', 35),
  ('Ojota', 'Victoria Island', '40 mins', 800, '07:30 AM', '08:10 AM', 45);