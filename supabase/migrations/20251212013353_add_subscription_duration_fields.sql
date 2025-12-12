/*
  # Add Duration Fields to Route Subscriptions

  1. Changes to Tables
    - Add `duration_weeks` (integer) - number of weeks for the subscription
    - Add `start_date` (date) - when the subscription starts
    - Add `end_date` (date) - when the subscription ends
    - Add `auto_renew` (boolean) - whether to auto-renew the subscription

  2. Notes
    - These fields allow users to subscribe to routes for specific periods
    - Duration options: 2 weeks, 3 weeks, or 4 weeks
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'route_subscriptions' AND column_name = 'duration_weeks'
  ) THEN
    ALTER TABLE route_subscriptions ADD COLUMN duration_weeks integer DEFAULT 4 NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'route_subscriptions' AND column_name = 'start_date'
  ) THEN
    ALTER TABLE route_subscriptions ADD COLUMN start_date date DEFAULT CURRENT_DATE NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'route_subscriptions' AND column_name = 'end_date'
  ) THEN
    ALTER TABLE route_subscriptions ADD COLUMN end_date date NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'route_subscriptions' AND column_name = 'auto_renew'
  ) THEN
    ALTER TABLE route_subscriptions ADD COLUMN auto_renew boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Add a constraint to ensure end_date is after start_date
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'route_subscriptions_date_check'
  ) THEN
    ALTER TABLE route_subscriptions
    ADD CONSTRAINT route_subscriptions_date_check
    CHECK (end_date > start_date);
  END IF;
END $$;