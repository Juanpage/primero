import crypto from 'crypto';
import pool from '../db/pool.js';
import { sanitizeString } from '../utils/validate.js';

const hashToken = (token, salt) => {
  return crypto.createHash('sha256').update(`${token}${salt}`).digest('hex');
};

export const qrAuth = async (req, res, next) => {
  const vesselSlug = sanitizeString(req.body.vessel_slug);
  const qrToken = sanitizeString(req.body.qr_token);

  if (!vesselSlug || !qrToken) {
    return res.status(400).json({ error: 'vessel_slug and qr_token are required' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, name, slug, qr_token, active FROM vessels WHERE slug = $1',
      [vesselSlug]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Vessel not found' });
    }

    const vessel = rows[0];

    if (!vessel.active) {
      return res.status(403).json({ error: 'Vessel is inactive' });
    }

    const salt = process.env.QR_TOKEN_SALT || '';
    const incomingHash = hashToken(qrToken, salt);
    const storedHash = hashToken(vessel.qr_token, salt);

    if (!crypto.timingSafeEqual(Buffer.from(incomingHash), Buffer.from(storedHash))) {
      return res.status(401).json({ error: 'Invalid QR token' });
    }

    req.vessel = vessel;
    return next();
  } catch (error) {
    return next(error);
  }
};
