/*
  # Create Route Subscriptions Table

  1. New Tables
    - `route_subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `route_id` (uuid, references routes)
      - `from_location` (text)
      - `to_location` (text)
      - `notify_before` (interval, default 1 day)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `route_subscriptions` table
    - Add policy for users to read their own subscriptions
    - Add policy for users to create their own subscriptions
    - Add policy for users to update their own subscriptions
    - Add policy for users to delete their own subscriptions
  
  3. Indexes
    - Index on user_id for fast lookups
    - Index on route_id for fast lookups
    - Unique constraint on user_id + route_id to prevent duplicates
*/

CREATE TABLE IF NOT EXISTS route_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  route_id uuid REFERENCES routes(id) ON DELETE CASCADE NOT NULL,
  from_location text NOT NULL,
  to_location text NOT NULL,
  notify_before interval DEFAULT '1 day',
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, route_id)
);

ALTER TABLE route_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON route_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscriptions"
  ON route_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON route_subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON route_subscriptions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_route_subscriptions_user_id ON route_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_route_subscriptions_route_id ON route_subscriptions(route_id);
CREATE INDEX IF NOT EXISTS idx_route_subscriptions_active ON route_subscriptions(is_active) WHERE is_active = true;