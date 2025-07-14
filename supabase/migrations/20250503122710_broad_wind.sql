/*
  # Add history tracking tables

  1. New Tables
    - `audio_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `file_name` (text)
      - `duration` (numeric)
      - `created_at` (timestamp with time zone)
      - `transcript` (text)
      - `analysis` (jsonb)
      - `status` (text)

  2. Security
    - Enable RLS on `audio_history` table
    - Add policies for authenticated users to manage their own history
*/

CREATE TABLE IF NOT EXISTS audio_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  file_name text NOT NULL,
  duration numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  transcript text,
  analysis jsonb,
  status text DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'transcribed', 'analyzed'))
);

ALTER TABLE audio_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own history"
  ON audio_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own history"
  ON audio_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own history"
  ON audio_history
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);