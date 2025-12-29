import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import feedbackRoutes from './routes/feedbackRoutes.js';
import { initDb } from './db/pool.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.resolve(__dirname, '../../frontend/src');
const pagesPath = path.join(frontendPath, 'pages');

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    }
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', feedbackRoutes);
app.use(express.static(frontendPath));

app.get('/feedback', (_req, res) => {
  res.sendFile(path.join(pagesPath, 'feedback.html'));
});

app.get('/admin', (_req, res) => {
  res.sendFile(path.join(pagesPath, 'admin.html'));
});

app.get('/thanks.html', (_req, res) => {
  res.sendFile(path.join(pagesPath, 'thanks.html'));
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

initDb()
  .then(() => {
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((error) => {
    console.error('Failed to initialize database', error);
    process.exit(1);
  });
