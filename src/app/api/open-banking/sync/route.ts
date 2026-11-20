import { NextRequest, NextResponse } from 'next/server';
import { tinkClient } from '@/lib/open-banking/tink-client';
import { reconcileTransactions } from '@/lib/open-banking/reconciliation-engine';
import { INITIAL_INVOICES, INITIAL_RECEIPTS } from '@/lib/mock-data';
import { upsertBankTransactionsInNeon, DEFAULT_USER_ID } from '@/lib/neon';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { accountId, invoices, receipts } = body;

    const accId = accountId || 'acc-handelsbanken-main';
    const invList = invoices || INITIAL_INVOICES;
    const recList = receipts || INITIAL_RECEIPTS;

    // Identify user from session cookie
    const cookie = req.cookies.get('klaro_user');
    let sessionUserId = DEFAULT_USER_ID;
    if (cookie?.value) {
      try {
        const parsed = JSON.parse(cookie.value);
        if (parsed.id) sessionUserId = parsed.id;
      } catch {}
    }

    // Fetch raw transactions from PSD2 provider
    const rawTransactions = await tinkClient.getTransactions('token', accId);

    // Run reconciliation against invoices and receipts
    const { reconciledTransactions, result } = reconcileTransactions(
      rawTransactions,
      invList,
      recList
    );

    // Persist to Neon
    try {
      await upsertBankTransactionsInNeon(reconciledTransactions, sessionUserId, accId);
    } catch (dbErr) {
      console.warn('Could not persist synced transactions to Neon:', dbErr);
    }

    return NextResponse.json({
      success: true,
      lastSyncedAt: new Date().toISOString(),
      transactions: reconciledTransactions,
      summary: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Kunde inte synka transaktioner.' },
      { status: 500 }
    );
  }
}
