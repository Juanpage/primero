CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS vessels (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  qr_token TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  vessel_id INT NOT NULL REFERENCES vessels(id),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  alert_status TEXT NOT NULL CHECK (alert_status IN ('Pending','Managed'))
);

CREATE INDEX IF NOT EXISTS idx_feedback_vessel_id ON feedback(vessel_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(alert_status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

INSERT INTO vessels (name, slug, qr_token)
VALUES
  ('Vessel A', 'vessel-a', encode(gen_random_bytes(24), 'hex')),
  ('Vessel B', 'vessel-b', encode(gen_random_bytes(24), 'hex')),
  ('Vessel C', 'vessel-c', encode(gen_random_bytes(24), 'hex'))
ON CONFLICT (slug) DO NOTHING;
