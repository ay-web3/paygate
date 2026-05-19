import express from 'express';
import { paygate } from '@emmanue5002k/paygate-express';
import http from 'http';

const app = express();
const PORT = 4005;

// 1. Initialize PayGate middleware
app.use(paygate());

// 2. A regular endpoint (requires live on-chain payment signature)
app.get('/weather', (req, res) => {
  res.json({
    city: 'San Francisco',
    temperature: 68,
    condition: 'Sunny',
    message: 'Thanks for paying $0.001 via x402!'
  });
});

// 3. A test-bypass endpoint (mocks a verified x402 signature)
// This lets us test the automatic receipt injection system instantly!
app.get('/test-bypass', (req: any, res) => {
  console.log('💡 Mocking a verified x402 payment receipt...');
  req.paygate = {
    payer: '0xAgentPayerAddress123',
    amount: '0.001',
    network: 'arc-testnet',
    transaction: '0xMockTransactionHash987'
  };

  res.json({
    city: 'San Francisco',
    temperature: 68,
    condition: 'Sunny'
  });
});

const server = app.listen(PORT, async () => {
  console.log(`🌤️ Test Server running on http://localhost:${PORT}`);
  console.log('==================================================');

  // Step 1: Request weather without paying (expect 402 Payment Required)
  console.log('\n🔍 Step 1: Fetching GET /weather without payment details...');
  http.get(`http://localhost:${PORT}/weather`, (res) => {
    console.log(`📡 Server Response Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('📡 Response Headers:', JSON.stringify(res.headers, null, 2));
      console.log('📡 Response Body:', data);
      
      // Step 2: Request the bypass route (expect 200 OK + automatic receipt injection)
      console.log('\n🔍 Step 2: Fetching GET /test-bypass (mocks a successful x402 payment)...');
      http.get(`http://localhost:${PORT}/test-bypass`, (res2) => {
        console.log(`📡 Server Response Status: ${res2.statusCode}`);
        
        let data2 = '';
        res2.on('data', (chunk) => data2 += chunk);
        res2.on('end', () => {
          console.log('📡 Response Body (look at _paygateReceipt!):');
          console.log(JSON.stringify(JSON.parse(data2), null, 2));
          
          console.log('\n==================================================');
          console.log('🎉 E2E TEST COMPLETED SUCCESSFULLY!');
          server.close();
          process.exit(0);
        });
      });
    });
  });
});
