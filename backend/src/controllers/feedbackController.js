import pool from '../db/pool.js';

const VALID_VESSELS = ['LETTY', 'CALIPSO', 'NAREL'];

function mapLikelihoodToNps(value) {
  switch (value) {
    case 'Very Likely':
      return 10;
    case 'Likely':
      return 7;
    case 'Not Likely':
      return 0;
    default:
      return null;
  }
}

function parseRating(value) {
  const num = Number(value);
  if (!Number.isInteger(num) || num < 1 || num > 5) {
    return null;
  }
  return num;
}

export async function submitFeedback(req, res) {
  try {
    const {
      vessel_id,
      nationality,
      cabin_number,
      likelihood,
      best_part,
      improvement,
      name,
      email,
      guide_score,
      crew_friendliness_score,
      cleanliness_score,
      professionalism_score,
      meals_score,
      cabin_score,
      interior_areas_score,
      sundeck_score,
      value_score
    } = req.body;

    if (!vessel_id || !VALID_VESSELS.includes(vessel_id)) {
      return res.status(400).json({ message: 'Invalid vessel' });
    }

    if (!nationality) {
      return res.status(400).json({ message: 'Nationality is required' });
    }

    if (!cabin_number) {
      return res.status(400).json({ message: 'Cabin number is required' });
    }

    const nps = mapLikelihoodToNps(likelihood);
    if (nps === null) {
      return res.status(400).json({ message: 'Likelihood selection is required' });
    }

    const scores = [
      parseRating(guide_score),
      parseRating(crew_friendliness_score),
      parseRating(cleanliness_score),
      parseRating(professionalism_score),
      parseRating(meals_score),
      parseRating(cabin_score),
      parseRating(interior_areas_score),
      parseRating(sundeck_score),
      parseRating(value_score)
    ];

    if (scores.some((score) => score === null)) {
      return res.status(400).json({ message: 'All service ratings must be between 1 and 5' });
    }

    const rating_general = Math.round(scores.reduce((sum, val) => sum + val, 0) / scores.length);

    const insertQuery = `
      INSERT INTO feedback (
        vessel_id, nationality, cabin_number, rating_general, nps,
        punctuality_score, organization_score, safety_score,
        guide_score, crew_friendliness_score, cleanliness_score, professionalism_score,
        meals_score, cabin_score, interior_areas_score, sundeck_score, value_score,
        best_part, improvement, name, email
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8,
        $9, $10, $11, $12,
        $13, $14, $15, $16, $17,
        $18, $19, $20, $21
      )
      RETURNING id;
    `;

    const values = [
      vessel_id,
      nationality,
      cabin_number,
      rating_general,
      nps,
      rating_general,
      rating_general,
      rating_general,
      scores[0],
      scores[1],
      scores[2],
      scores[3],
      scores[4],
      scores[5],
      scores[6],
      scores[7],
      scores[8],
      best_part || null,
      improvement || null,
      name || null,
      email || null
    ];

    await pool.query(insertQuery, values);

    return res.status(201).json({ message: 'Feedback submitted' });
  } catch (error) {
    console.error('Error saving feedback', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

function buildFilters({ vessel, cruise_date }) {
  const clauses = [];
  const params = [];

  if (vessel && VALID_VESSELS.includes(vessel)) {
    params.push(vessel);
    clauses.push(`vessel_id = $${params.length}`);
  }

  if (cruise_date) {
    params.push(cruise_date);
    clauses.push(`cruise_date = $${params.length}`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, params };
}

export async function getDashboardStats(req, res) {
  const { password } = req.query;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { vessel, cruise_date } = req.query;
  const { where, params } = buildFilters({ vessel, cruise_date });

  try {
    const statsQuery = `
      SELECT
        COUNT(*) AS total_responses,
        AVG(rating_general)::numeric(10,2) AS average_rating,
        AVG(nps)::numeric(10,2) AS average_nps,
        COUNT(*) FILTER (WHERE cruise_date >= CURRENT_DATE - INTERVAL '30 days') AS last_30_days
      FROM feedback
      ${where};
    `;
    const statsResult = await pool.query(statsQuery, params);

    const latestQuery = `
      SELECT id, vessel_id, nationality, cruise_date, cabin_number, rating_general, nps, created_at
      FROM feedback
      ${where}
      ORDER BY created_at DESC
      LIMIT 100;
    `;
    const latestResult = await pool.query(latestQuery, params);

    res.json({
      stats: statsResult.rows[0],
      recent: latestResult.rows
    });
  } catch (error) {
    console.error('Error fetching dashboard data', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function exportCsv(req, res) {
  const { password } = req.query;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { vessel, cruise_date } = req.query;
  const { where, params } = buildFilters({ vessel, cruise_date });

  try {
    const columns = [
      'id',
      'vessel_id',
      'nationality',
      'cruise_date',
      'cabin_number',
      'rating_general',
      'nps',
      'punctuality_score',
      'organization_score',
      'safety_score',
      'guide_score',
      'crew_friendliness_score',
      'cleanliness_score',
      'professionalism_score',
      'meals_score',
      'cabin_score',
      'interior_areas_score',
      'sundeck_score',
      'value_score',
      'best_part',
      'improvement',
      'name',
      'email',
      'created_at'
    ];

    const query = `
      SELECT ${columns.join(', ')}
      FROM feedback
      ${where}
      ORDER BY created_at DESC;
    `;

    const { rows } = await pool.query(query, params);
    const header = columns.join(',');
    const lines = rows.map((row) =>
      columns
        .map((column) => {
          const value = row[column];
          if (value === null || value === undefined) return '';
          const stringValue = value instanceof Date ? value.toISOString() : String(value);
          return `"${stringValue.replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    const csv = [header, ...lines].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="feedback_export.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting CSV', error);
    res.status(500).json({ message: 'Server error' });
  }
}
