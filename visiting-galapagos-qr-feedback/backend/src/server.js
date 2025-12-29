import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import feedbackRoutes from './routes/feedback.routes.js';
import metricsRoutes from './routes/metrics.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = process.env.FRONTEND_PATH || path.join(__dirname, '../../frontend/src');

app.use(cors());
app.use(express.json());

app.use('/api', feedbackRoutes);
app.use('/api', metricsRoutes);

app.use(express.static(frontendPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendPath, 'pages', 'feedback.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
