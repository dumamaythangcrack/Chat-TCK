import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

/**
 * Payment webhook handler for SePay/VietQR
 * Verifies payment and credits user's wallet
 */
export async function POST(req: NextRequest) {
  const body = await req.json();

  // Verify webhook signature/API key
  const apiKey = req.headers.get('x-api-key');
  if (apiKey !== process.env.SEPAY_API_KEY) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 403 });
  }

  const { transaction_id, amount, user_id, status, package_id } = body;

  if (!transaction_id || !amount || !user_id || status !== 'success') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Check for duplicate transaction (idempotency)
  const { data: existing } = await supabase
    .from('transactions')
    .select('id')
    .eq('reference_id', transaction_id)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'Duplicate transaction' }, { status: 409 });
  }

  // Get coin package if specified
  let coinsToAdd = 0;
  if (package_id) {
    const { data: pkg } = await supabase
      .from('coin_packages')
      .select('coins, bonus_coins')
      .eq('id', package_id)
      .single();

    if (pkg) {
      coinsToAdd = pkg.coins + (pkg.bonus_coins ?? 0);
    }
  }

  if (coinsToAdd === 0) {
    return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
  }

  // Credit wallet
  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance_coins')
    .eq('user_id', user_id)
    .single();

  if (!wallet) {
    return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
  }

  await supabase
    .from('wallets')
    .update({ balance_coins: wallet.balance_coins + coinsToAdd })
    .eq('user_id', user_id);

  // Record transaction
  await supabase.from('transactions').insert({
    user_id,
    tx_type: 'recharge',
    amount: coinsToAdd,
    currency: 'coin',
    status: 'completed',
    reference_id: transaction_id,
    description: `Recharged ${coinsToAdd} coins`,
  });

  return NextResponse.json({ success: true, coins_added: coinsToAdd });
}
