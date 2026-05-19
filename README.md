# PayGate ⚡️

**The "Stripe Checkout" for the Agent Economy.** 

Turn any existing API into a storefront for AI Agents in seconds. PayGate provides zero-code Circle Gateway integration to accept gasless USDC nanopayments via x402, automatically issue `402 Payment Required` responses, and track your revenue in real-time.

---

## 🌟 Why PayGate?

Currently, monetizing an API for AI agents requires manually building x402 payment handlers, formatting viem units, managing Circle Gateway endpoints, and tracking manual balances in the CLI.

**PayGate abstracts all of this into a single middleware and a YAML config file.**

- **Zero-Code Billing**: Set prices and routes in a simple `paygate.yaml` file instead of writing billing logic.
- **Framework Agnostic**: Drop-in adapters for both **Express.js** and **Next.js**.
- **Instant Monetization**: Sub-cent USDC payments powered by Circle Gateway.
- **Built-in Analytics**: Run one CLI command to spin up a local dashboard to track your live revenue.

---

## 📦 Installation

Install the core package and the adapter for your framework of choice:

```bash
# For Express.js
npm install @emmanue5002k/paygate-core @emmanue5002k/paygate-express

# For Next.js (App Router)
npm install @emmanue5002k/paygate-core @emmanue5002k/paygate-next
```

You can also install the global CLI to access the Analytics Dashboard:

```bash
npm install -g @emmanue5002k/paygate-cli
```

---

## 🚀 Quick Start

### 1. The Configuration File
Create a `paygate.config.yaml` at the root of your project. This is where you declare which routes cost money and how much they cost.

```yaml
version: "1.0"
environment: "testnet" # or "mainnet"

seller:
  walletAddress: "0xYourSellerWalletAddressHere"
  facilitatorUrl: "https://gateway-api-testnet.circle.com"

pricing:
  defaultCurrency: "USDC"
  routes:
    # Exact match route
    "/api/premium-data":
      price: 0.05
      description: "Generates high-accuracy crypto trading signals for BTC and ETH."
    
    # Wildcard route for dynamic endpoints
    "/api/models/*":
      price: 0.01
```

### 2. Express.js Integration

Simply drop the PayGate middleware into your Express app. Any route defined in your YAML file will automatically be locked behind an x402 USDC paywall!

```typescript
import express from 'express';
import { paygate } from '@emmanue5002k/paygate-express';

const app = express();

// 1. Apply the middleware globally
app.use(paygate());

// 2. Write your route normally!
// If an agent hasn't paid, they receive a 402 Payment Required.
// If they have paid, this code executes!
app.get('/api/premium-data', (req, res) => {
  res.json({
    data: "This is premium intelligence data.",
    paid: req.paygate // Contains transaction details (amount, payer, network)
  });
});

app.listen(3000, () => console.log('Agent Storefront listening on port 3000'));
```

### 3. Next.js Integration

Wrap your Route Handlers in Next.js using the `withPaygate` adapter:

```typescript
// app/api/premium-data/route.ts
import { NextResponse } from 'next/server';
import { withPaygate } from '@emmanue5002k/paygate-next';

async function handler(req: Request) {
  // This only runs if the agent has successfully paid!
  return NextResponse.json({ 
    data: "Exclusive research report.",
  });
}

// Wrap the standard handler with PayGate
export const GET = withPaygate(handler);
export const POST = withPaygate(handler);
```

---

## ⚡️ Advanced Features

### 1. Automatic Receipt Injection
AI agents need to log their receipts to audit their spend. Instead of you manually returning receipt data, PayGate automatically injects a `_paygateReceipt` metadata object into all JSON API responses upon successful payment verification.

#### Express & Next.js Output:
```json
{
  "data": "This is premium intelligence data.",
  "_paygateReceipt": {
    "payer": "0xAgentWalletAddress...",
    "amount": "1000", 
    "network": "arc-testnet",
    "transaction": "0xTxHash..."
  }
}
```
*Note: You can easily disable this in your `paygate.config.yaml` by setting `injectReceipt: false`.*

### 2. Marketplace Publisher CLI
List your API directly on the official **Circle Agent Marketplace**! PayGate helps you auto-generate standard OpenAPI 3.0 documentation with built-in `x402-payment` security specs.

#### Run the publish command:
```bash
npx @emmanue5002k/paygate-cli publish
```
This generates a production-ready `openapi.json` file in your root folder. Submit this file to [agents.circle.com/services](https://agents.circle.com/services) to list your new API storefront!

---

## 📊 Analytics Dashboard

Stop running CLI commands to guess if you made money. PayGate comes with a beautiful, real-time analytics dashboard to track your API revenue.

Run this command in the directory containing your `paygate.config.yaml`:

```bash
npx @emmanue5002k/paygate-cli dashboard
```

This will instantly spin up a local UI on `http://localhost:3001` showing your total USDC revenue, top-performing endpoints, and a live ledger of agent transactions.

---

## 🤖 The Client SDK (For Agents)

If you are building an AI Agent that needs to *consume* a PayGate-protected API, use our Client SDK to easily automate the x402 handshake:

```bash
npm install @emmanue5002k/paygate-client
```

```typescript
import { PaygateClient } from '@emmanue5002k/paygate-client';

const client = new PaygateClient({
  agentWalletPrivateKey: process.env.PRIVATE_KEY
});

// The client automatically detects the 402, signs the transaction, 
// pays the fee from the agent's Gateway balance, and returns the data.
const response = await client.fetch('http://api.example.com/premium-data');
const data = await response.json();
```

---

## License

MIT © Emmanuel
