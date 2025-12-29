CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  vessel_id TEXT NOT NULL,
  nationality TEXT NOT NULL,
  cruise_date DATE NOT NULL DEFAULT CURRENT_DATE,
  cabin_number TEXT NOT NULL,
  rating_general SMALLINT NOT NULL CHECK (rating_general BETWEEN 1 AND 5),
  nps SMALLINT NOT NULL CHECK (nps BETWEEN 0 AND 10),
  punctuality_score SMALLINT NOT NULL CHECK (punctuality_score BETWEEN 1 AND 5),
  organization_score SMALLINT NOT NULL CHECK (organization_score BETWEEN 1 AND 5),
  safety_score SMALLINT NOT NULL CHECK (safety_score BETWEEN 1 AND 5),
  guide_score SMALLINT NOT NULL CHECK (guide_score BETWEEN 1 AND 5),
  crew_friendliness_score SMALLINT NOT NULL CHECK (crew_friendliness_score BETWEEN 1 AND 5),
  cleanliness_score SMALLINT NOT NULL CHECK (cleanliness_score BETWEEN 1 AND 5),
  professionalism_score SMALLINT NOT NULL CHECK (professionalism_score BETWEEN 1 AND 5),
  meals_score SMALLINT NOT NULL CHECK (meals_score BETWEEN 1 AND 5),
  cabin_score SMALLINT NOT NULL CHECK (cabin_score BETWEEN 1 AND 5),
  interior_areas_score SMALLINT NOT NULL CHECK (interior_areas_score BETWEEN 1 AND 5),
  sundeck_score SMALLINT NOT NULL CHECK (sundeck_score BETWEEN 1 AND 5),
  value_score SMALLINT NOT NULL CHECK (value_score BETWEEN 1 AND 5),
  best_part TEXT,
  improvement TEXT,
  name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_vessel_date ON feedback (vessel_id, cruise_date);
