export interface PricingContext {
  route: string;
  payer?: string;
  history?: any; // To be expanded
}

export interface PriceResult {
  price: string;
}

export interface PricingStrategy {
  getPrice(context: PricingContext): PriceResult;
  getScheme(): "exact" | "upto" | "batch-settlement";
  getMaxPrice(): string;
}

export class FlatPricing implements PricingStrategy {
  constructor(private price: string) {}

  getPrice() {
    return { price: this.price };
  }

  getScheme() {
    return "exact" as const;
  }

  getMaxPrice() {
    return this.price;
  }
}

// Others (Tiered, Metered, etc.) can be added similarly.
