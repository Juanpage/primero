import express from 'express';
import pool from '../db/pool.js';
import { parseDateRange, buildDateSeries } from '../utils/dates.js';
import { sanitizeString } from '../utils/validate.js';

const router = express.Router();
const ALERT_THRESHOLD = Number(process.env.ALERT_RATING_THRESHOLD || 3);

const buildVesselFilter = (slug, values) => {
  if (!slug) return '';
  values.push(slug);
  return `AND v.slug = $${values.length}`;
};

router.get('/summary', async (req, res, next) => {
  const vesselSlug = sanitizeString(req.query.vessel);
  const { fromDate, toDate } = parseDateRange({ from: req.query.from, to: req.query.to });
  const values = [fromDate.toISOString(), toDate.toISOString()];
  const vesselFilter = buildVesselFilter(vesselSlug, values);
  const thresholdIndex = values.length + 1;

  try {
    const { rows } = await pool.query(
      `SELECT
         COUNT(*)::int AS total_feedback,
         COALESCE(AVG(rating), 0)::float AS average_rating,
         COALESCE(SUM(CASE WHEN rating <= $${thresholdIndex} THEN 1 ELSE 0 END), 0)::int AS negative_count,
         COALESCE(SUM(CASE WHEN alert_status = 'Pending' THEN 1 ELSE 0 END), 0)::int AS pending_alerts,
         COALESCE(SUM(CASE WHEN alert_status = 'Managed' THEN 1 ELSE 0 END), 0)::int AS managed_alerts
       FROM feedback f
       JOIN vessels v ON v.id = f.vessel_id
       WHERE f.created_at BETWEEN $1 AND $2
       ${vesselFilter}`,
      [...values, ALERT_THRESHOLD]
    );

    const total = rows[0]?.total_feedback || 0;
    const negativeCount = rows[0]?.negative_count || 0;
    const negativePercent = total === 0 ? 0 : Number(((negativeCount / total) * 100).toFixed(2));

    return res.json({
      total_feedback: total,
      average_rating: Number(rows[0]?.average_rating || 0),
      negative_percent: negativePercent,
      pending_alerts: rows[0]?.pending_alerts || 0,
      managed_alerts: rows[0]?.managed_alerts || 0
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/ratings-timeseries', async (req, res, next) => {
  const vesselSlug = sanitizeString(req.query.vessel);
  const { fromDate, toDate } = parseDateRange({ from: req.query.from, to: req.query.to });
  const values = [fromDate.toISOString(), toDate.toISOString()];
  const vesselFilter = buildVesselFilter(vesselSlug, values);

  try {
    const { rows } = await pool.query(
      `SELECT date_trunc('day', f.created_at) AS day,
              AVG(f.rating)::float AS average_rating
       FROM feedback f
       JOIN vessels v ON v.id = f.vessel_id
       WHERE f.created_at BETWEEN $1 AND $2
       ${vesselFilter}
       GROUP BY day
       ORDER BY day`,
      values
    );

    const series = buildDateSeries(fromDate, toDate);
    const averages = series.map((label) => {
      const match = rows.find((row) => row.day.toISOString().slice(0, 10) === label);
      return match ? Number(match.average_rating.toFixed(2)) : null;
    });

    return res.json({
      labels: series,
      datasets: [
        {
          label: 'Average Rating',
          data: averages
        }
      ]
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/alerts-timeseries', async (req, res, next) => {
  const vesselSlug = sanitizeString(req.query.vessel);
  const { fromDate, toDate } = parseDateRange({ from: req.query.from, to: req.query.to });
  const values = [fromDate.toISOString(), toDate.toISOString()];
  const vesselFilter = buildVesselFilter(vesselSlug, values);

  try {
    const { rows } = await pool.query(
      `SELECT date_trunc('day', f.created_at) AS day,
              SUM(CASE WHEN f.alert_status = 'Pending' THEN 1 ELSE 0 END)::int AS pending_count,
              SUM(CASE WHEN f.alert_status = 'Managed' THEN 1 ELSE 0 END)::int AS managed_count
       FROM feedback f
       JOIN vessels v ON v.id = f.vessel_id
       WHERE f.created_at BETWEEN $1 AND $2
       ${vesselFilter}
       GROUP BY day
       ORDER BY day`,
      values
    );

    const series = buildDateSeries(fromDate, toDate);
    const pending = series.map((label) => {
      const match = rows.find((row) => row.day.toISOString().slice(0, 10) === label);
      return match ? match.pending_count : 0;
    });
    const managed = series.map((label) => {
      const match = rows.find((row) => row.day.toISOString().slice(0, 10) === label);
      return match ? match.managed_count : 0;
    });

    return res.json({
      labels: series,
      datasets: [
        {
          label: 'Pending',
          data: pending
        },
        {
          label: 'Managed',
          data: managed
        }
      ]
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
