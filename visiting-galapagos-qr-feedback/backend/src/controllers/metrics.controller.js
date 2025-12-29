import pool from '../db/pool.js';

export const getOverview = async (_req, res) => {
  try {
    const overviewQuery = `
      SELECT
        COUNT(*) AS total_responses,
        ROUND(AVG(rating_general)::numeric, 2) AS avg_rating,
        ROUND(AVG(nps)::numeric, 2) AS avg_nps,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS last_30_days
      FROM feedback;
    `;
    const { rows } = await pool.query(overviewQuery);
    return res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching overview metrics', error);
    return res.status(500).json({ message: 'Failed to fetch metrics' });
  }
};

export const getByVessel = async (_req, res) => {
  try {
    const byVesselQuery = `
      SELECT
        vessel_id,
        COUNT(*) AS responses,
        ROUND(AVG(rating_general)::numeric, 2) AS avg_rating,
        ROUND(AVG(nps)::numeric, 2) AS avg_nps,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS last_30_days
      FROM feedback
      GROUP BY vessel_id
      ORDER BY vessel_id;
    `;
    const { rows } = await pool.query(byVesselQuery);
    return res.json(rows);
  } catch (error) {
    console.error('Error fetching vessel metrics', error);
    return res.status(500).json({ message: 'Failed to fetch metrics' });
  }
};
