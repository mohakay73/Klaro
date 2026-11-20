import { NextRequest, NextResponse } from 'next/server';
import {
  getBankTransactionsFromNeon,
  updateBankTransactionInNeon,
  upsertBankTransactionsInNeon,
  DEFAULT_USER_ID,
} from '@/lib/neon';
import { PSD2Transaction } from '@/lib/open-banking/types';

export async function GET(req: NextRequest) {
  try {
    const cookie = req.cookies.get('klaro_user');
    let userId = DEFAULT_USER_ID;
    if (cookie?.value) {
      try {
        const parsed = JSON.parse(cookie.value);
        if (parsed.id) userId = parsed.id;
      } catch {}
    }

    const transactions = await getBankTransactionsFromNeon(userId);
    return NextResponse.json({ success: true, transactions });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Kunde inte hämta banktransaktioner.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id, updates, userId } = body;

    if (!id || !updates) {
      return NextResponse.json(
        { error: 'id and updates are required' },
        { status: 400 }
      );
    }

    const cookie = req.cookies.get('klaro_user');
    let sessionUserId = userId || DEFAULT_USER_ID;
    if (!userId && cookie?.value) {
      try {
        const parsed = JSON.parse(cookie.value);
        if (parsed.id) sessionUserId = parsed.id;
      } catch {}
    }

    const success = await updateBankTransactionInNeon(id, updates, sessionUserId);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Kunde inte uppdatera transaktion.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { transactions, accountId, userId } = body;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json(
        { error: 'transactions array is required' },
        { status: 400 }
      );
    }

    const cookie = req.cookies.get('klaro_user');
    let sessionUserId = userId || DEFAULT_USER_ID;
    if (!userId && cookie?.value) {
      try {
        const parsed = JSON.parse(cookie.value);
        if (parsed.id) sessionUserId = parsed.id;
      } catch {}
    }

    await upsertBankTransactionsInNeon(transactions, sessionUserId, accountId);
    return NextResponse.json({ success: true, count: transactions.length });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Kunde inte spara transaktioner.' },
      { status: 500 }
    );
  }
}
