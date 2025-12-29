CREATE TABLE IF NOT EXISTS feedback (
  id BIGSERIAL PRIMARY KEY,
  vessel_id TEXT NOT NULL,
  nationality TEXT NOT NULL DEFAULT 'UNKNOWN',
  guide_id TEXT,
  crew_id TEXT,
  service_type TEXT,
  tour_date DATE,
  rating_general SMALLINT NOT NULL CHECK (rating_general BETWEEN 1 AND 5),
  nps SMALLINT NOT NULL CHECK (nps BETWEEN 0 AND 10),
  guide_score SMALLINT CHECK (guide_score BETWEEN 1 AND 5),
  punctuality_score SMALLINT CHECK (punctuality_score BETWEEN 1 AND 5),
  organization_score SMALLINT CHECK (organization_score BETWEEN 1 AND 5),
  safety_score SMALLINT CHECK (safety_score BETWEEN 1 AND 5),
  best_part TEXT,
  improvement TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE feedback
  ADD COLUMN IF NOT EXISTS nationality TEXT;

UPDATE feedback SET nationality = COALESCE(nationality, 'UNKNOWN');

ALTER TABLE feedback ALTER COLUMN nationality SET NOT NULL;
ALTER TABLE feedback ALTER COLUMN nationality SET DEFAULT 'UNKNOWN';

CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON feedback (created_at);
CREATE INDEX IF NOT EXISTS feedback_vessel_id_idx ON feedback (vessel_id);
CREATE INDEX IF NOT EXISTS feedback_guide_id_idx ON feedback (guide_id);
