import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { reviewRoutes } from './routes/reviews';
import { reputationRoutes } from './routes/reputation';
import { stakeRoutes } from './routes/stake';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'kindred-api',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/reviews', reviewRoutes);
app.use('/reputation', reputationRoutes);
app.use('/stake', stakeRoutes);

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🦞 Kindred API running on http://localhost:${PORT}`);
});

export default app;
