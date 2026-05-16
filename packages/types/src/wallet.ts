import { z } from 'zod';

export const WalletSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  balance_coins: z.number(),
  balance_fiat: z.number(),
  total_earned_coins: z.number(),
  total_spent_coins: z.number(),
});

export type Wallet = z.infer<typeof WalletSchema>;

export const TransactionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  tx_type: z.enum(['recharge','purchase','gift_sent','gift_received','withdrawal','subscription','ad_spend','refund','reward','transfer']),
  amount: z.number(),
  currency: z.enum(['coin','usd','vnd']),
  status: z.enum(['pending','completed','failed','cancelled']),
  reference_id: z.string().optional(),
  description: z.string().optional(),
  created_at: z.string().datetime(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

export const CoinPackageSchema = z.object({
  id: z.string().uuid(),
  coins: z.number(),
  bonus_coins: z.number(),
  price_usd: z.number(),
  is_popular: z.boolean(),
});

export type CoinPackage = z.infer<typeof CoinPackageSchema>;
