-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

CREATE TABLE IF NOT EXISTS metrics_cache (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Allow public read, authenticated write
ALTER TABLE metrics_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON metrics_cache
  FOR SELECT USING (true);

CREATE POLICY "Allow insert/update via service key" ON metrics_cache
  FOR ALL USING (true) WITH CHECK (true);

-- Insert initial empty row
INSERT INTO metrics_cache (key, data) VALUES ('global_metrics', '{}')
ON CONFLICT (key) DO NOTHING;
