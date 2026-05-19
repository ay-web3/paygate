import { Router } from 'express';
import { loadConfig, resolve, PaygateConfigInput } from '@emmanue5002k/paygate-core';
import { paymentMiddleware, setSettlementOverrides } from '@x402/express';

import { createAnalyticsMiddleware } from './analytics';

export function paygate(configOverrides?: Partial<PaygateConfigInput>) {
  const config = loadConfig(configOverrides);
  const { routeConfig, resourceServer } = resolve(config);

  const router = Router();

  // Apply x402 payment middleware
  router.use(paymentMiddleware(routeConfig, resourceServer));

  // Add Analytics Tracking Middleware
  router.use(createAnalyticsMiddleware(config));

  return router;
}

export { setSettlementOverrides };
