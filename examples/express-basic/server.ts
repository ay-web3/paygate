import express from 'express';
import { paygate } from '@emmanue5002k/paygate-express';

const app = express();
const PORT = 3000;

// 1. Initialize PayGate middleware
// This automatically reads paygate.config.yaml, sets up x402 schemas, 
// validates headers, and intercepts payments.
app.use(paygate());

// 2. Define your protected routes
app.get('/weather', (req, res) => {
  res.json({
    city: 'San Francisco',
    temperature: 68,
    condition: 'Sunny',
    message: 'Thanks for paying $0.001 via x402!'
  });
});

app.get('/forecast', (req, res) => {
  res.json({
    forecast: ['Sunny', 'Cloudy', 'Rain', 'Sunny', 'Sunny', 'Sunny', 'Cloudy'],
    message: 'Thanks for paying $0.005 via x402!'
  });
});

// 3. Start the server
app.listen(PORT, () => {
  console.log(`🌤️  Weather API running on http://localhost:${PORT}`);
  console.log('🔒 Endpoints are protected by x402');
  console.log('   - GET /weather   ($0.001)');
  console.log('   - GET /forecast  ($0.005)');
});
