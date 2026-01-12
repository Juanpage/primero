const requests = new Map();

const pruneOld = (now, windowMs) => {
  for (const [key, entry] of requests.entries()) {
    if (now - entry.start >= windowMs) {
      requests.delete(key);
    }
  }
};

export const rateLimit = (windowMs, max) => (req, res, next) => {
  const now = Date.now();
  pruneOld(now, windowMs);

  const key = req.ip;
  const entry = requests.get(key) || { start: now, count: 0 };

  if (now - entry.start >= windowMs) {
    entry.start = now;
    entry.count = 0;
  }

  entry.count += 1;
  requests.set(key, entry);

  if (entry.count > max) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  return next();
};
