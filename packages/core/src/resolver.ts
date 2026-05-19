import { HTTPFacilitatorClient } from '@x402/core/server';
import { x402ResourceServer } from '@x402/core/server';
import { ExactEvmScheme } from '@x402/evm/exact/server';
import { UptoEvmScheme } from '@x402/evm/upto/server';
import { ExactSvmScheme } from '@x402/svm/exact/server';
import { UptoSvmScheme } from '@x402/svm/upto/server';

import { PaygateConfig } from './config/schema';
import { getNetworkInfo, resolveFacilitatorUrl } from './networks/registry';

export function resolve(config: PaygateConfig) {
  const facilitatorUrl = resolveFacilitatorUrl(config.seller.facilitator);
  const facilitatorClient = new HTTPFacilitatorClient({ url: facilitatorUrl });
  
  const resourceServer = new x402ResourceServer(facilitatorClient);
  
  // Track which scheme/network combos we need to register
  const needsEvmExact = new Set<string>();
  const needsEvmUpto = new Set<string>();
  const needsSvmExact = new Set<string>();
  const needsSvmUpto = new Set<string>();

  const routeConfig: Record<string, any> = {};

  for (const [routePath, route] of Object.entries(config.routes)) {
    const accepts: any[] = [];
    
    // Determine scheme and price based on pricing config
    let scheme = route.scheme || 'exact';
    let price = route.price || '$0.00';

    if (route.pricing) {
      if (route.pricing.type === 'flat') {
        scheme = 'exact';
        price = route.pricing.price;
      } else if (route.pricing.type === 'metered') {
        scheme = 'upto';
        price = route.pricing.price;
      } else if (route.pricing.type === 'tiered') {
        scheme = 'upto';
        // The max price a client must authorize for tiered is the highest tier price
        // Simplified for MVP: take the first tier price, or ideally we'd parse the tiers to find max
        price = route.pricing.tiers[0]?.price || '$1.00'; 
      }
    }

    for (const networkAlias of config.seller.networks) {
      const netInfo = getNetworkInfo(networkAlias);
      
      accepts.push({
        scheme,
        price,
        network: netInfo.caip2,
        payTo: config.seller.wallet
      });

      // Mark for registration
      if (netInfo.type === 'evm') {
        if (scheme === 'exact') needsEvmExact.add(netInfo.caip2);
        if (scheme === 'upto') needsEvmUpto.add(netInfo.caip2);
      } else if (netInfo.type === 'svm') {
        if (scheme === 'exact') needsSvmExact.add(netInfo.caip2);
        if (scheme === 'upto') needsSvmUpto.add(netInfo.caip2);
      }
    }

    routeConfig[routePath] = {
      description: route.description,
      mimeType: "application/json",
      accepts
    };
  }

  // Register required schemes
  for (const network of needsEvmExact) {
    resourceServer.register(network, new ExactEvmScheme());
  }
  for (const network of needsEvmUpto) {
    resourceServer.register(network, new UptoEvmScheme());
  }
  for (const network of needsSvmExact) {
    resourceServer.register(network, new ExactSvmScheme());
  }
  for (const network of needsSvmUpto) {
    resourceServer.register(network, new UptoSvmScheme());
  }

  return { routeConfig, resourceServer, facilitatorClient };
}
