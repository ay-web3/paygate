import { z } from 'zod';

export const NetworkNameSchema = z.enum([
  'base',
  'base-sepolia',
  'arc-testnet',
  'ethereum',
  'polygon',
  'arbitrum',
  'solana',
  'solana-devnet'
]);

export type NetworkName = z.infer<typeof NetworkNameSchema>;

export const PricingFlatSchema = z.object({
  type: z.literal('flat').optional(),
  price: z.string()
});

export const TierSchema = z.object({
  up_to: z.number().optional(),
  above: z.number().optional(),
  price: z.string()
}).refine(data => data.up_to !== undefined || data.above !== undefined, {
  message: "Tier must specify 'up_to' or 'above'"
});

export const PricingTieredSchema = z.object({
  type: z.literal('tiered'),
  tiers: z.array(TierSchema)
});

export const PricingMeteredSchema = z.object({
  type: z.literal('metered'),
  price: z.string(), // Max authorized price
  scheme: z.literal('upto').optional()
});

export const RouteSchema = z.object({
  price: z.string().optional(),
  description: z.string().optional(),
  scheme: z.enum(['exact', 'upto', 'batch-settlement']).optional(),
  pricing: z.union([PricingFlatSchema, PricingTieredSchema, PricingMeteredSchema]).optional()
});

export const DashboardSchema = z.object({
  enabled: z.boolean().default(false),
  port: z.number().default(3001),
  auth: z.string().optional()
});

export const AnalyticsSchema = z.object({
  store: z.enum(['memory', 'file']).default('memory')
});

export const SellerSchema = z.object({
  wallet: z.string(),
  networks: z.array(NetworkNameSchema).min(1),
  facilitator: z.string().default('testnet')
});

export const PaygateConfigSchema = z.object({
  seller: SellerSchema,
  routes: z.record(z.string(), RouteSchema),
  dashboard: DashboardSchema.default({}),
  analytics: AnalyticsSchema.default({}),
  injectReceipt: z.boolean().default(true)
});

export type PaygateConfigInput = z.input<typeof PaygateConfigSchema>;
export type PaygateConfig = z.infer<typeof PaygateConfigSchema>;
