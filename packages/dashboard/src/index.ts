import express from 'express';
import cors from 'cors';
import path from 'path';
import { getCollector } from '@emmanue5002k/paygate-core';

export function launchDashboard(config: any) {
  if (!config?.dashboard?.enabled) return;

  const app = express();
  app.use(cors());
  app.use(express.json());

  // Static files
  const publicPath = path.join(__dirname, 'public');
  app.use(express.static(publicPath));

  // Analytics API
  const collector = getCollector();

  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await collector.getStats();
      res.json(stats);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  const port = config.dashboard.port || 3001;
  app.listen(port, () => {
    console.log(`📊 PayGate Analytics Dashboard running at http://localhost:${port}`);
  });

  return app;
}
