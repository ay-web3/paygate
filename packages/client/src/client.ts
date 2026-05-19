import { wrapFetchWithPayment } from '@x402/fetch';
import { x402Client } from '@x402/core/client';
import { ExactEvmScheme } from '@x402/evm/exact/client';
import { UptoEvmScheme } from '@x402/evm/upto/client';
import { ExactSvmScheme } from '@x402/svm/exact/client';
import { UptoSvmScheme } from '@x402/svm/upto/client';
import { NetworkName, getNetworkInfo } from '@emmanue5002k/paygate-core';

export interface PaygateClientOptions {
  privateKey: string;
  networks: NetworkName[];
}

export class PaygateClient {
  private fetchFn: typeof fetch;
  public x402: x402Client;

  constructor(options: PaygateClientOptions) {
    if (!options.privateKey) {
      throw new Error("PaygateClient requires a privateKey");
    }

    this.x402 = new x402Client();

    // In a full implementation, we'd take the privateKey and create signers for the appropriate chains
    // Example:
    // const evmSigner = new Wallet(options.privateKey);
    // const svmSigner = Keypair.fromSecretKey(bs58.decode(options.privateKey));
    
    // For MVP compilation, we stub the signers
    const mockSigner = {
      signMessage: async () => new Uint8Array(),
      getAddress: async () => '0xmock'
    } as any;

    for (const netAlias of options.networks) {
      const info = getNetworkInfo(netAlias);
      if (info.type === 'evm') {
        this.x402.register(info.caip2, new ExactEvmScheme(mockSigner));
        this.x402.register(info.caip2, new UptoEvmScheme(mockSigner));
      } else if (info.type === 'svm') {
        this.x402.register(info.caip2, new ExactSvmScheme(mockSigner));
        this.x402.register(info.caip2, new UptoSvmScheme(mockSigner));
      }
    }

    this.fetchFn = wrapFetchWithPayment(this.x402, fetch);
  }

  async get(url: string, init?: RequestInit) {
    const response = await this.fetchFn(url, { ...init, method: 'GET' });
    return this.handleResponse(response);
  }

  async post(url: string, body: any, init?: RequestInit) {
    const response = await this.fetchFn(url, {
      ...init,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...init?.headers },
      body: JSON.stringify(body)
    });
    return this.handleResponse(response);
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}: ${await response.text()}`);
    }
    
    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return {
      data,
      payment: {
        // Mock payment details, in reality this comes from the wrapped fetch receipt
        status: 'completed',
        timestamp: Date.now()
      }
    };
  }
}
