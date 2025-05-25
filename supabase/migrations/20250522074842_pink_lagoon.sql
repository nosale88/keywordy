/*
  # Create scheduled searches tables

  1. New Tables
    - `scheduled_searches`
      - `id` (uuid, primary key)
      - `search_tags` (jsonb array of search tags)
      - `type` (text, either 'daily' or 'weekly')
      - `time` (text, HH:mm format)
      - `days` (integer array, for weekly schedules)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
    
    - `search_results`
      - `id` (uuid, primary key)
      - `schedule_id` (uuid, references scheduled_searches)
      - `search_tag` (jsonb, the tag used for this search)
      - `title` (text)
      - `content` (text)
      - `link` (text)
      - `source` (text)
      - `type` (text)
      - `date` (text)
      - `thumbnail` (text)
      - `searched_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create scheduled_searches table
CREATE TABLE IF NOT EXISTS scheduled_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_tags jsonb[] NOT NULL,
  type text NOT NULL CHECK (type IN ('daily', 'weekly')),
  time text NOT NULL,
  days integer[] DEFAULT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create search_results table
CREATE TABLE IF NOT EXISTS search_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid REFERENCES scheduled_searches(id),
  search_tag jsonb NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  link text NOT NULL,
  source text,
  type text NOT NULL,
  date text,
  thumbnail text,
  searched_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE scheduled_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_results ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their scheduled searches"
  ON scheduled_searches
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read search results"
  ON search_results
  FOR SELECT
  TO authenticated
  USING (true);