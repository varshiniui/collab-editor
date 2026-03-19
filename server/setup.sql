-- Run this in PostgreSQL to set up the database
-- psql -U postgres -f setup.sql

CREATE DATABASE collab_editor;

\c collab_editor

CREATE TABLE IF NOT EXISTS documents (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL DEFAULT 'Untitled Document',
  content     TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: create an index for faster lookups by updated_at
CREATE INDEX IF NOT EXISTS idx_documents_updated ON documents(updated_at DESC);

SELECT 'Database setup complete!' AS status;