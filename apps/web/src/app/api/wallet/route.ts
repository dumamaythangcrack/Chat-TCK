import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

// GET /api/wallet — Get user's wallet
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  const supabase = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: wallet } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const { data: recentTransactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  const { data: coinPackages } = await supabase
    .from('coin_packages')
    .select('*')
    .eq('is_active', true)
    .order('coins', { ascending: true });

  return NextResponse.json({
    wallet,
    recentTransactions: recentTransactions ?? [],
    coinPackages: coinPackages ?? [],
  });
}

// POST /api/wallet — Wallet operations (recharge, send gift, etc.)
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  const supabase = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const actionSchema = z.discriminatedUnion('action', [
    z.object({
      action: z.literal('send_gift'),
      recipient_id: z.string().uuid(),
      gift_id: z.string().uuid(),
      livestream_id: z.string().uuid().optional(),
      quantity: z.number().min(1).max(999).default(1),
    }),
    z.object({
      action: z.literal('withdraw'),
      amount: z.number().min(10),
      currency: z.enum(['usd', 'vnd']).default('usd'),
      bank_info: z.object({
        bank_name: z.string(),
        account_number: z.string(),
        account_holder: z.string(),
      }),
    }),
  ]);

  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.action === 'send_gift') {
    const { recipient_id, gift_id, quantity, livestream_id } = parsed.data;

    // Get gift cost
    const { data: gift } = await supabase.from('gifts').select('coin_cost').eq('id', gift_id).single();
    if (!gift) return NextResponse.json({ error: 'Gift not found' }, { status: 404 });

    const totalCost = gift.coin_cost * quantity;

    // Check balance
    const { data: wallet } = await supabase.from('wallets').select('balance_coins').eq('user_id', user.id).single();
    if (!wallet || wallet.balance_coins < totalCost) {
      return NextResponse.json({ error: 'Insufficient coins' }, { status: 400 });
    }

    // Deduct from sender
    await supabase.from('wallets')
      .update({ balance_coins: wallet.balance_coins - totalCost, total_spent_coins: (wallet as any).total_spent_coins + totalCost })
      .eq('user_id', user.id);

    // Credit recipient
    await supabase.rpc('increment_wallet_coins', { p_user_id: recipient_id, p_amount: totalCost });

    // Record transactions
    await supabase.from('transactions').insert([
      { user_id: user.id, tx_type: 'gift_sent', amount: -totalCost, currency: 'coin', description: `Sent gift x${quantity}` },
      { user_id: recipient_id, tx_type: 'gift_received', amount: totalCost, currency: 'coin', description: `Received gift x${quantity}` },
    ]);

    // Record in creator earnings
    await supabase.from('creator_earnings').insert({
      creator_id: recipient_id,
      source: 'gift',
      amount: totalCost,
      reference_id: gift_id,
    });

    // If in livestream, record gift
    if (livestream_id) {
      await supabase.from('livestream_gifts').insert({
        livestream_id,
        sender_id: user.id,
        gift_type: gift_id,
        quantity,
        coin_value: totalCost,
      });
    }

    return NextResponse.json({ success: true, spent: totalCost });
  }

  if (parsed.data.action === 'withdraw') {
    const { amount, currency, bank_info } = parsed.data;

    const { data: withdrawal, error } = await supabase
      .from('withdrawal_requests')
      .insert({
        user_id: user.id,
        amount,
        currency,
        bank_info,
        status: 'pending',
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ withdrawal }, { status: 201 });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
