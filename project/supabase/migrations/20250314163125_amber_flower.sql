/*
  # Add quotes and categories tables

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp)

    - `quotes`
      - `id` (uuid, primary key)
      - `text` (text)
      - `author` (text)
      - `category_id` (uuid, references categories)
      - `source` (text, default 'curated')
      - `created_at` (timestamp)
      - `times_shown` (integer, default 0)
      - `likes` (integer, default 0)

  2. Security
    - Enable RLS
    - Public read access for quotes and categories
    - Admin-only write access
*/

-- Categories table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to categories"
  ON categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admins to manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'admin'::text);

-- Quotes table
CREATE TABLE quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  author text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  source text NOT NULL DEFAULT 'curated',
  created_at timestamptz DEFAULT now(),
  times_shown integer DEFAULT 0,
  likes integer DEFAULT 0
);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to quotes"
  ON quotes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admins to manage quotes"
  ON quotes
  FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'admin'::text);