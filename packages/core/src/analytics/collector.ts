export interface PaymentEvent {
  route: string;
  payer: string;
  amount: string;
  network: string;
  timestamp: number;
}

export interface EndpointStats {
  route: string;
  calls: number;
  revenueAtomic: bigint;
  uniquePayers: Set<string>;
  lastCall: number;
}

export interface AnalyticsData {
  totalRevenueAtomic: bigint;
  totalCalls: number;
  uniquePayers: Set<string>;
  endpoints: Map<string, EndpointStats>;
  recentTransactions: PaymentEvent[];
}

export interface AnalyticsStore {
  save(event: PaymentEvent): Promise<void>;
  getData(): Promise<AnalyticsData>;
}

export class MemoryStore implements AnalyticsStore {
  private data: AnalyticsData = {
    totalRevenueAtomic: 0n,
    totalCalls: 0,
    uniquePayers: new Set(),
    endpoints: new Map(),
    recentTransactions: []
  };

  async save(event: PaymentEvent): Promise<void> {
    const amountBigInt = BigInt(event.amount);

    this.data.totalRevenueAtomic += amountBigInt;
    this.data.totalCalls++;
    this.data.uniquePayers.add(event.payer);

    let epStats = this.data.endpoints.get(event.route);
    if (!epStats) {
      epStats = {
        route: event.route,
        calls: 0,
        revenueAtomic: 0n,
        uniquePayers: new Set(),
        lastCall: 0
      };
      this.data.endpoints.set(event.route, epStats);
    }

    epStats.calls++;
    epStats.revenueAtomic += amountBigInt;
    epStats.uniquePayers.add(event.payer);
    epStats.lastCall = event.timestamp;

    this.data.recentTransactions.unshift(event);
    if (this.data.recentTransactions.length > 100) {
      this.data.recentTransactions.pop();
    }
  }

  async getData(): Promise<AnalyticsData> {
    return this.data;
  }
}

export class AnalyticsCollector {
  private store: AnalyticsStore;

  constructor(store?: AnalyticsStore) {
    this.store = store || new MemoryStore();
  }

  async recordPayment(event: PaymentEvent) {
    await this.store.save(event);
  }

  async getStats() {
    const data = await this.store.getData();
    return {
      totalRevenueAtomic: data.totalRevenueAtomic.toString(),
      totalCalls: data.totalCalls,
      uniquePayersCount: data.uniquePayers.size,
      endpoints: Array.from(data.endpoints.values()).map(ep => ({
        route: ep.route,
        calls: ep.calls,
        revenueAtomic: ep.revenueAtomic.toString(),
        uniquePayersCount: ep.uniquePayers.size,
        lastCall: ep.lastCall
      })),
      recentTransactions: data.recentTransactions
    };
  }
}

let defaultCollector: AnalyticsCollector | null = null;

export function getCollector(): AnalyticsCollector {
  if (!defaultCollector) {
    defaultCollector = new AnalyticsCollector();
  }
  return defaultCollector;
}
