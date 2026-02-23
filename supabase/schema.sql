-- Wanderly Database Schema (v2 - Expo Edition)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'web',
  title TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  extracted_content TEXT NOT NULL DEFAULT '',
  thumbnail TEXT,                           -- URL to thumbnail image
  category TEXT NOT NULL DEFAULT 'other',
  tags TEXT[] DEFAULT '{}',
  collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS items_category_idx ON items(category);
CREATE INDEX IF NOT EXISTS items_platform_idx ON items(platform);
CREATE INDEX IF NOT EXISTS items_collection_id_idx ON items(collection_id);
CREATE INDEX IF NOT EXISTS items_created_at_idx ON items(created_at DESC);

-- Realtime: enable for live feed updates
ALTER PUBLICATION supabase_realtime ADD TABLE items;
ALTER PUBLICATION supabase_realtime ADD TABLE collections;

-- Row Level Security (disabled for MVP — enable when auth is set up)
-- ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Migration: add thumbnail to existing items table (run if upgrading from v1)
-- ALTER TABLE items ADD COLUMN IF NOT EXISTS thumbnail TEXT;
