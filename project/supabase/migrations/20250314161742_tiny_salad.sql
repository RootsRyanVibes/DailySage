/*
  # Create quotes and categories tables

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp)
    
    - `quotes`
      - `id` (uuid, primary key)
      - `text` (text)
      - `author` (text)
      - `category_id` (uuid, foreign key)
      - `source` (text) - either 'curated' or 'llm'
      - `created_at` (timestamp)
      - `times_shown` (integer)
      - `likes` (integer)
      
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read all quotes
    - Add policies for admins to manage quotes
*/

-- Create categories table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create quotes table
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

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Policies for categories
CREATE POLICY "Allow public read access to categories"
  ON categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admins to manage categories"
  ON categories
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Policies for quotes
CREATE POLICY "Allow public read access to quotes"
  ON quotes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admins to manage quotes"
  ON quotes
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Insert initial categories
INSERT INTO categories (name) VALUES
  ('Spiritual'),
  ('Motivational'),
  ('Stoic'),
  ('Zen'),
  ('Leadership'),
  ('Eastern Philosophy'),
  ('Western Philosophy'),
  ('Indigenous Wisdom');

-- Insert some initial quotes
INSERT INTO quotes (text, author, category_id, source) VALUES
  (
    'Be water, my friend.',
    'Bruce Lee',
    (SELECT id FROM categories WHERE name = 'Eastern Philosophy'),
    'curated'
  ),
  (
    'The obstacle is the way.',
    'Marcus Aurelius',
    (SELECT id FROM categories WHERE name = 'Stoic'),
    'curated'
  ),
  (
    'Wisdom begins in wonder.',
    'Socrates',
    (SELECT id FROM categories WHERE name = 'Western Philosophy'),
    'curated'
  );