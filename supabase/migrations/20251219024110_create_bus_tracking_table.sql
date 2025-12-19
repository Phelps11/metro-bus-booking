/*
  # Create Bus Tracking Table

  ## Summary
  This migration creates tables and infrastructure for real-time bus tracking without maps.
  The system tracks bus status, location progress, and provides ETA updates to passengers.

  ## 1. New Tables
  
  ### `bus_tracking`
  - `id` (uuid, primary key) - Unique tracking record ID
  - `booking_id` (uuid, references bookings) - Associated booking
  - `route_id` (uuid, references routes) - Route being tracked
  - `bus_number` (text) - Bus identifier (e.g., "Bus 07")
  - `driver_name` (text) - Driver name
  - `status` (text) - Current status: 'idle', 'en_route', 'delayed', 'arrived'
  - `current_stage` (text) - Progress stage: 'departed', 'approaching', 'arriving_shortly', 'completed'
  - `distance_to_pickup_km` (numeric) - Distance to passenger pickup in km
  - `eta_minutes` (integer) - Estimated time of arrival in minutes
  - `last_updated` (timestamptz) - Last status update time
  - `status_message` (text) - Human-friendly status message
  - `notify_10min` (boolean) - Notify when 10 minutes away
  - `notify_delay` (boolean) - Notify on delays
  - `created_at` (timestamptz) - Record creation time
  - `updated_at` (timestamptz) - Record update time

  ## 2. Security
  - Enable RLS on `bus_tracking` table
  - Users can read tracking for their own bookings
  - Only authenticated users can access tracking data

  ## 3. Indexes
  - Index on booking_id for fast lookups
  - Index on route_id for route-based queries
  - Index on status for filtering active tracking

  ## 4. Important Notes
  - Status is updated by driver app or admin panel
  - Distance and ETA are calculated based on route segments
  - Real-time updates use Supabase subscriptions
  - No map APIs required - status-based tracking only
*/

CREATE TABLE IF NOT EXISTS bus_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  route_id uuid REFERENCES routes(id) ON DELETE CASCADE NOT NULL,
  bus_number text NOT NULL DEFAULT 'Bus 01',
  driver_name text DEFAULT 'Driver',
  status text NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'en_route', 'delayed', 'arrived')),
  current_stage text NOT NULL DEFAULT 'departed' CHECK (current_stage IN ('departed', 'approaching', 'arriving_shortly', 'completed')),
  distance_to_pickup_km numeric(5,2) DEFAULT 10.0 NOT NULL,
  eta_minutes integer DEFAULT 30 NOT NULL,
  last_updated timestamptz DEFAULT now() NOT NULL,
  status_message text DEFAULT 'Your bus is preparing to depart.' NOT NULL,
  notify_10min boolean DEFAULT true NOT NULL,
  notify_delay boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE bus_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tracking for own bookings"
  ON bus_tracking
  FOR SELECT
  TO authenticated
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update notification preferences"
  ON bus_tracking
  FOR UPDATE
  TO authenticated
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    booking_id IN (
      SELECT id FROM bookings WHERE user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_bus_tracking_booking_id ON bus_tracking(booking_id);
CREATE INDEX IF NOT EXISTS idx_bus_tracking_route_id ON bus_tracking(route_id);
CREATE INDEX IF NOT EXISTS idx_bus_tracking_status ON bus_tracking(status) WHERE status != 'arrived';
CREATE INDEX IF NOT EXISTS idx_bus_tracking_updated ON bus_tracking(last_updated DESC);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_bus_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating timestamp
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_bus_tracking_updated_at'
  ) THEN
    CREATE TRIGGER set_bus_tracking_updated_at
      BEFORE UPDATE ON bus_tracking
      FOR EACH ROW
      EXECUTE FUNCTION update_bus_tracking_updated_at();
  END IF;
END $$;