/*
  # Create Support Messages Table

  1. New Tables
    - `support_messages`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `user_email` (text)
      - `user_name` (text)
      - `subject` (text)
      - `message` (text, max 500 characters)
      - `status` (text, default 'pending')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `support_messages` table
    - Add policy for authenticated users to insert their own messages
    - Add policy for authenticated users to read their own messages
*/

CREATE TABLE IF NOT EXISTS support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  user_email text NOT NULL,
  user_name text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own support messages"
  ON support_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own support messages"
  ON support_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);