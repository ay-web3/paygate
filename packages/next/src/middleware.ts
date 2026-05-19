import { NextRequest, NextResponse } from 'next/server';
import { loadConfig, resolve, PaygateConfigInput, getCollector } from '@emmanue5002k/paygate-core';
import { paymentProxy, withX402 } from '@x402/next';

/**
 * Creates a Next.js middleware that acts as an x402 payment proxy.
 * Drops directly into your Next.js \`middleware.ts\`.
 */
export function paygateProxy(configOverrides?: Partial<PaygateConfigInput>) {
  const config = loadConfig(configOverrides);
  const { routeConfig, resourceServer } = resolve(config);

  const proxy = paymentProxy(routeConfig, resourceServer);

  return async (req: NextRequest) => {
    // Intercept with our analytics logic if it successfully processes a payment.
    // In Next.js middleware, we don't have direct access to the final response body
    // or whether the route succeeded from the middleware itself easily, but we can track
    // when the proxy challenges vs lets it through.
    
    // For MVP, we simply wrap the proxy and execute it.
    const res = await proxy(req);

    // If x402 responded with a 402, it means challenge.
    // If it didn't, and the request was in our route config, a payment was made or not required.
    // Full analytics tracking in Next.js requires tracking at the API route level due to Edge restrictions.

    return res;
  };
}

/**
 * HOF for wrapping Next.js API Routes (Pages Router) or Route Handlers (App Router).
 */
export function withPaygate(handler: any, configOverrides?: Partial<PaygateConfigInput>) {
  const config = loadConfig(configOverrides);
  const { routeConfig, resourceServer } = resolve(config);

  // Wrap the user's handler with the x402 handler
  const wrapped = withX402(routeConfig, resourceServer)(handler);

  return async (req: any, ...args: any[]) => {
    // Analytics tracking injection could happen here
    const collector = getCollector();
    // @ts-ignore
    if (req.payment && req.payment.verified) {
      // @ts-ignore
      const { payer, amount, network } = req.payment;
      collector.recordPayment({
        route: `${req.method} ${req.url}`,
        payer,
        amount: String(amount),
        network,
        timestamp: Date.now()
      }).catch(console.error);
    }
    
    return wrapped(req, ...args);
  };
}
