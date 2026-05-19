# PayGate

PayGate is the "Stripe for x402" — a developer toolkit that dramatically simplifies setting up x402 paid APIs. Instead of manually wiring packages and managing configurations, you define your monetization rules in a single config file.

## Why PayGate?

The x402 protocol allows AI agents and humans to pay for API usage seamlessly using USDC. However, setting it up manually requires writing 40-60 lines of boilerplate, registering chains, and managing facilitator configurations.

PayGate turns that into:

```yaml
# paygate.config.yaml
seller:
  wallet: "0xYourWalletAddress"
  networks: ["base-sepolia"]

routes:
  "GET /weather":
    price: "$0.001"
```

```typescript
// server.ts
import express from "express";
import { paygate } from "@emmanue5002k/paygate-express";

const app = express();
app.use(paygate()); 

app.get("/weather", (req, res) => {
  res.json({ weather: "sunny" });
});

app.listen(3000);
```

## Features

- **Config-driven setup**: Define your paid routes and prices in `paygate.config.yaml`.
- **Smart Pricing**: Support for flat fees, tiered pricing, burst/surge pricing, and freemium quotas.
- **Framework adapters**: Drop-in middleware for Express, Next.js, and more.
- **Dashboard**: Real-time revenue analytics and transaction monitoring.
- **CLI scaffolding**: `npx @emmanue5002k/paygate-cli init` to set up your project instantly.

## Getting Started

*(Documentation coming soon)*
