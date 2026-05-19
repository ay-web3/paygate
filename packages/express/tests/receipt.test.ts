import { describe, it, expect, vi } from 'vitest';
import { paygate } from '../src/middleware';

vi.mock('@emmanue5002k/paygate-core', () => {
  return {
    loadConfig: () => ({
      seller: { wallet: '0x123', networks: ['base-sepolia'] },
      routes: {},
      injectReceipt: true
    }),
    resolve: () => ({
      routeConfig: {},
      resourceServer: {}
    })
  };
});

vi.mock('@x402/express', () => {
  return {
    paymentMiddleware: () => (req: any, res: any, next: any) => next()
  };
});

describe('Express Receipt Injection Middleware', () => {
  it('should automatically inject receipt into json responses if req.paygate is present', () => {
    const middleware = paygate();
    
    // We expect the middleware to return a router, which has router.use stack.
    // For unit testing the interceptor directly, let's grab the interceptor from the router stack
    // or just simulate the middleware function.
    
    const req: any = {
      paygate: {
        payer: '0xAgent',
        amount: '1000',
        network: 'base-sepolia',
        transaction: '0xTxHash'
      }
    };
    
    let sentBody: any = null;
    const res: any = {
      json: function(body: any) {
        sentBody = body;
        return this;
      }
    };
    
    // Get the third middleware (the interceptor)
    const interceptor = (middleware as any).stack[1].handle;
    
    interceptor(req, res, () => {});
    
    const originalData = { success: true, balance: 100 };
    res.json(originalData);
    
    expect(sentBody).toBeDefined();
    expect(sentBody._paygateReceipt).toEqual(req.paygate);
    expect(sentBody.success).toBe(true);
  });

  it('should not inject receipt if req.paygate is missing', () => {
    const middleware = paygate();
    const req: any = {};
    
    let sentBody: any = null;
    const res: any = {
      json: function(body: any) {
        sentBody = body;
        return this;
      }
    };
    
    const interceptor = (middleware as any).stack[1].handle;
    interceptor(req, res, () => {});
    
    const originalData = { success: true };
    res.json(originalData);
    
    expect(sentBody._paygateReceipt).toBeUndefined();
  });
});
