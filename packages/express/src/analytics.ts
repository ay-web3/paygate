import { PaygateConfig } from '../config/schema';
import { getCollector } from '@emmanue5002k/paygate-core';
import { Request, Response, NextFunction } from 'express';

// Middleware to inject analytics tracking
export function createAnalyticsMiddleware(config: PaygateConfig) {
  const collector = getCollector();

  return (req: Request, res: Response, next: NextFunction) => {
    // Overwrite res.json/res.send to capture payment info when it's successful
    // However, in x402, the payment happens before the request reaches the handler,
    // and the payment info is attached to req.payment (or similar, depending on @x402/express)
    // We can capture it if @x402/express attaches it.
    
    // For now, we will intercept the completion of the request.
    const originalSend = res.send;
    res.send = function (body) {
      // @ts-ignore - Assuming req.payment is attached by @x402/express
      if (req.payment && req.payment.verified) {
        // @ts-ignore
        const { payer, amount, network } = req.payment;
        collector.recordPayment({
          route: `${req.method} ${req.route ? req.route.path : req.url}`,
          payer,
          amount: String(amount),
          network,
          timestamp: Date.now()
        }).catch(console.error);
      }
      return originalSend.call(this, body);
    };

    next();
  };
}
