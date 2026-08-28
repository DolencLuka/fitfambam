CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  ip_hash TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_comments_slug_status_created
  ON comments (slug, status, created_at);

CREATE INDEX IF NOT EXISTS idx_comments_ip_hash_created
  ON comments (ip_hash, created_at);
