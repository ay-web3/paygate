import { NetworkName } from '../config/schema';

export interface NetworkInfo {
  caip2: string;
  type: 'evm' | 'svm' | 'avm';
  name: string;
}

export const NETWORK_REGISTRY: Record<NetworkName, NetworkInfo> = {
  'base': { caip2: 'eip155:8453', type: 'evm', name: 'Base Mainnet' },
  'base-sepolia': { caip2: 'eip155:84532', type: 'evm', name: 'Base Sepolia' },
  'arc-testnet': { caip2: 'eip155:5042002', type: 'evm', name: 'Arc Testnet' },
  'ethereum': { caip2: 'eip155:1', type: 'evm', name: 'Ethereum Mainnet' },
  'polygon': { caip2: 'eip155:137', type: 'evm', name: 'Polygon Mainnet' },
  'arbitrum': { caip2: 'eip155:42161', type: 'evm', name: 'Arbitrum One' },
  'solana': { caip2: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', type: 'svm', name: 'Solana Mainnet' },
  'solana-devnet': { caip2: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1', type: 'svm', name: 'Solana Devnet' }
};

export function getNetworkInfo(network: NetworkName): NetworkInfo {
  const info = NETWORK_REGISTRY[network];
  if (!info) {
    throw new Error(`Unknown network: ${network}`);
  }
  return info;
}

export function resolveFacilitatorUrl(urlOrAlias: string): string {
  if (urlOrAlias === 'testnet') {
    return 'https://x402.org/facilitator';
  }
  if (urlOrAlias === 'mainnet') {
    return 'https://api.cdp.coinbase.com/platform/v2/x402';
  }
  return urlOrAlias;
}
