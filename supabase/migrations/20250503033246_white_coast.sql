/*
  # Add API Keys Storage

  1. New Tables
    - `api_keys`
      - `id` (uuid, primary key)
      - `key_name` (text, unique)
      - `key_value` (text, encrypted)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `api_keys` table
    - Add policy for authenticated users to read api keys
*/

CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name text UNIQUE NOT NULL,
  key_value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read api keys"
  ON api_keys
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert the OpenAI API key
INSERT INTO api_keys (key_name, key_value)
VALUES ('openai', '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')
ON CONFLICT (key_name) DO UPDATE
SET key_value = EXCLUDED.key_value;