/*
  # Add user favorites and collections

  1. New Tables
    - `collections`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `favorite_quotes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `quote_id` (uuid, references quotes)
      - `collection_id` (uuid, references collections)
      - `note` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for users to manage their collections and favorites
*/

-- Collections table
CREATE TABLE collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own collections"
  ON collections
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Favorite quotes table
CREATE TABLE favorite_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  quote_id uuid REFERENCES quotes(id) ON DELETE CASCADE,
  collection_id uuid REFERENCES collections(id) ON DELETE SET NULL,
  note text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE favorite_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their favorite quotes"
  ON favorite_quotes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update trigger for collections
CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();