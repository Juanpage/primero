import pool from '../db/pool.js';

const VESSELS = ['LETTY', 'CALIPSO', 'NAREL'];

const validateScores = (body) => {
  const errors = [];
  const requiredRange = [
    ['rating_general', 1, 5],
    ['nps', 0, 10],
  ];
  const optionalRange = [
    ['guide_score', 1, 5],
    ['punctuality_score', 1, 5],
    ['organization_score', 1, 5],
    ['safety_score', 1, 5],
  ];

  requiredRange.forEach(([field, min, max]) => {
    const value = body[field];
    if (value === undefined || value === null || Number.isNaN(Number(value))) {
      errors.push(`${field} is required`);
    } else if (Number(value) < min || Number(value) > max) {
      errors.push(`${field} must be between ${min} and ${max}`);
    }
  });

  optionalRange.forEach(([field, min, max]) => {
    const value = body[field];
    if (value === undefined || value === null || value === '') return;
    if (Number.isNaN(Number(value)) || Number(value) < min || Number(value) > max) {
      errors.push(`${field} must be between ${min} and ${max}`);
    }
  });

  if (!body.nationality || String(body.nationality).trim() === '') {
    errors.push('nationality is required');
  }

  if (!body.vessel_id || !VESSELS.includes(String(body.vessel_id).toUpperCase())) {
    errors.push('Invalid vessel_id');
  }

  return errors;
};

export const createFeedback = async (req, res) => {
  const payload = req.body;
  const errors = validateScores(payload);
  if (errors.length) {
    return res.status(400).json({ errors });
  }

  const {
    vessel_id,
    nationality,
    guide_id = null,
    crew_id = null,
    service_type = null,
    tour_date = null,
    rating_general,
    nps,
    guide_score = null,
    punctuality_score = null,
    organization_score = null,
    safety_score = null,
    best_part = null,
    improvement = null,
  } = payload;

  const query = `
    INSERT INTO feedback (
      vessel_id, nationality, guide_id, crew_id, service_type, tour_date,
      rating_general, nps, guide_score, punctuality_score,
      organization_score, safety_score, best_part, improvement
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id;
  `;
  const values = [
    vessel_id.toUpperCase(),
    String(nationality).trim(),
    guide_id || null,
    crew_id || null,
    service_type || null,
    tour_date || null,
    Number(rating_general),
    Number(nps),
    guide_score ? Number(guide_score) : null,
    punctuality_score ? Number(punctuality_score) : null,
    organization_score ? Number(organization_score) : null,
    safety_score ? Number(safety_score) : null,
    best_part ? String(best_part).trim() : null,
    improvement ? String(improvement).trim() : null,
  ];

  try {
    const result = await pool.query(query, values);
    return res.status(201).json({ ok: true, id: result.rows[0].id });
  } catch (error) {
    console.error('Error saving feedback', error);
    const isBadRequest = ['22', '23'].includes(String(error.code || '').slice(0, 2));
    const status = isBadRequest ? 400 : 500;
    return res.status(status).json({ message: 'Failed to save feedback' });
  }
};

export const listFeedback = async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 1000);
  try {
    const { rows } = await pool.query(
      `SELECT * FROM feedback ORDER BY created_at DESC LIMIT $1`,
      [limit]
    );
    return res.json(rows);
  } catch (error) {
    console.error('Error fetching feedback', error);
    return res.status(500).json({ message: 'Failed to fetch feedback' });
  }
};
