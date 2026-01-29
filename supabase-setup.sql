-- Manual AI Manager Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Manuals table
CREATE TABLE IF NOT EXISTS manuals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('pdf', 'web')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  chunk_count INTEGER DEFAULT 0
);

-- Manual chunks with embeddings
CREATE TABLE IF NOT EXISTS manual_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manual_id UUID REFERENCES manuals(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536),
  chunk_index INTEGER NOT NULL
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS manual_chunks_embedding_idx 
ON manual_chunks USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding vector(1536),
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  manual_id UUID,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    mc.id,
    mc.manual_id,
    mc.content,
    1 - (mc.embedding <=> query_embedding) AS similarity
  FROM manual_chunks mc
  ORDER BY mc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Enable Row Level Security (optional but recommended)
ALTER TABLE manuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_chunks ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your auth setup)
CREATE POLICY "Allow public read access to manuals" ON manuals
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to manuals" ON manuals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete access to manuals" ON manuals
  FOR DELETE USING (true);

CREATE POLICY "Allow public update access to manuals" ON manuals
  FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to manual_chunks" ON manual_chunks
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to manual_chunks" ON manual_chunks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete access to manual_chunks" ON manual_chunks
  FOR DELETE USING (true);

-- Grant permissions to service role
GRANT ALL ON manuals TO service_role;
GRANT ALL ON manual_chunks TO service_role;
GRANT EXECUTE ON FUNCTION match_chunks TO service_role;
