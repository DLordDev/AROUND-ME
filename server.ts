import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import apiRouter from './server/api.ts';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// API routes
app.use('/api', apiRouter);

// Serve static assets in production
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

// SPA catch-all
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`AroundMe AI server listening on port ${port}`);
});
