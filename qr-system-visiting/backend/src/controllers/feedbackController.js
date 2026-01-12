import pool from '../db/pool.js';
import { validateFeedbackPayload, sanitizeString } from '../utils/validate.js';
import { sendAlertEmail } from '../services/alertService.js';

const ALERT_THRESHOLD = Number(process.env.ALERT_RATING_THRESHOLD || 3);

export const createFeedback = async (req, res, next) => {
  const { rating, comment, email } = req.body;
  const vessel = req.vessel;

  const sanitizedComment = sanitizeString(comment);
  const sanitizedEmail = sanitizeString(email);

  const errors = validateFeedbackPayload({
    rating,
    comment: sanitizedComment,
    email: sanitizedEmail
  });

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  const alertStatus = rating <= ALERT_THRESHOLD ? 'Pending' : 'Managed';

  try {
    const { rows } = await pool.query(
      `INSERT INTO feedback (vessel_id, rating, comment, email, alert_status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, vessel_id, rating, comment, email, created_at, alert_status`,
      [vessel.id, rating, sanitizedComment || null, sanitizedEmail || null, alertStatus]
    );

    const feedback = rows[0];

    if (alertStatus === 'Pending') {
      sendAlertEmail({
        vesselName: vessel.name,
        feedback
      }).catch((error) => {
        console.error('Alert email failed:', error.message);
      });
    }

    return res.status(201).json({
      message: 'Feedback received',
      feedback
    });
  } catch (error) {
    return next(error);
  }
};

export const listFeedback = async (req, res, next) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const offset = (page - 1) * limit;
  const status = sanitizeString(req.query.status);
  const vesselSlug = sanitizeString(req.query.vessel);
  const from = sanitizeString(req.query.from);
  const to = sanitizeString(req.query.to);

  const whereClauses = [];
  const values = [];

  if (status) {
    values.push(status);
    whereClauses.push(`f.alert_status = $${values.length}`);
  }

  if (vesselSlug) {
    values.push(vesselSlug);
    whereClauses.push(`v.slug = $${values.length}`);
  }

  if (from) {
    values.push(`${from}T00:00:00Z`);
    whereClauses.push(`f.created_at >= $${values.length}`);
  }

  if (to) {
    values.push(`${to}T23:59:59Z`);
    whereClauses.push(`f.created_at <= $${values.length}`);
  }

  const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  try {
    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM feedback f
       JOIN vessels v ON v.id = f.vessel_id
       ${whereSQL}`,
      values
    );

    const itemsResult = await pool.query(
      `SELECT f.id, f.rating, f.comment, f.email, f.created_at, f.alert_status,
              v.name AS vessel_name, v.slug AS vessel_slug
       FROM feedback f
       JOIN vessels v ON v.id = f.vessel_id
       ${whereSQL}
       ORDER BY f.created_at DESC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, limit, offset]
    );

    return res.json({
      page,
      limit,
      total: countResult.rows[0]?.total || 0,
      items: itemsResult.rows
    });
  } catch (error) {
    return next(error);
  }
};

export const manageFeedback = async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Invalid feedback id' });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE feedback
       SET alert_status = 'Managed'
       WHERE id = $1
       RETURNING id, vessel_id, rating, comment, email, created_at, alert_status`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    return res.json(rows[0]);
  } catch (error) {
    return next(error);
  }
};
