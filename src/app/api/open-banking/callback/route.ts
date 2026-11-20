import { NextRequest, NextResponse } from 'next/server';
import { tinkClient } from '@/lib/open-banking/tink-client';
import { getDb, DEFAULT_USER_ID } from '@/lib/neon';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    const credentialsId = searchParams.get('credentials_id');

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    if (error) {
      console.warn('Tink Link redirected with error:', error, message);
      return NextResponse.redirect(`${baseUrl}/?view=bank&error=${encodeURIComponent(message || error)}`);
    }

    if (!code) {
      return NextResponse.redirect(`${baseUrl}/?view=bank&error=Ingen%20auktoriseringskod%20erh%C3%B6lls%20fr%C3%A5n%20Tink`);
    }

    // Identify user from session cookie
    const cookie = req.cookies.get('klaro_user');
    let sessionUserId = DEFAULT_USER_ID;
    if (cookie?.value) {
      try {
        const parsed = JSON.parse(cookie.value);
        if (parsed.id) sessionUserId = parsed.id;
      } catch {}
    }

    // Exchange authorization code for Tink Access Token
    const accessToken = await tinkClient.exchangeCodeForToken(code);

    // Fetch live accounts from Tink
    const accounts = await tinkClient.getAccounts(accessToken);
    const primaryAccount = accounts[0];

    if (!primaryAccount) {
      return NextResponse.redirect(`${baseUrl}/?view=bank&error=Inga%20aktiva%20bankkonton%20hittades`);
    }

    // Fetch live transactions for the primary account
    const transactions = await tinkClient.getTransactions(accessToken, primaryAccount.id);

    // Persist account and transactions in Neon PostgreSQL
    try {
      const sql = getDb();

      // Upsert bank account
      await sql.query(
        `INSERT INTO bank_accounts (
          id, user_id, bank_id, bank_name, account_number, iban, balance, currency, last_synced_at, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), 'active')
        ON CONFLICT (id) DO UPDATE SET
          balance = EXCLUDED.balance,
          last_synced_at = NOW(),
          status = 'active';`,
        [
          primaryAccount.id,
          sessionUserId,
          primaryAccount.bankId,
          primaryAccount.bankName,
          primaryAccount.accountNumber,
          primaryAccount.iban,
          primaryAccount.balance,
          primaryAccount.currency,
        ]
      );

      // Insert bank transactions
      for (const tx of transactions) {
        await sql.query(
          `INSERT INTO bank_transactions (
            id, user_id, account_id, booking_date, value_date, amount, currency,
            description, merchant_name, category, bas_account, reconciliation_status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (id) DO UPDATE SET
            reconciliation_status = EXCLUDED.reconciliation_status;`,
          [
            tx.id,
            sessionUserId,
            primaryAccount.id,
            tx.bookingDate,
            tx.valueDate || tx.bookingDate,
            tx.amount,
            tx.currency,
            tx.description,
            tx.merchantName || null,
            tx.category || null,
            tx.basAccount || null,
            tx.reconciliationStatus || 'missing_receipt',
          ]
        );
      }
    } catch (dbErr) {
      console.error('Failed to persist Tink data to Neon:', dbErr);
    }

    // Redirect to dashboard with success status
    const response = NextResponse.redirect(
      `${baseUrl}/?view=bank&bankConnected=true&bankName=${encodeURIComponent(primaryAccount.bankName)}`
    );

    // Cache the connected account for immediate client pickup
    response.cookies.set('klaro_connected_bank', JSON.stringify({
      id: primaryAccount.id,
      bankName: primaryAccount.bankName,
      accountNumber: primaryAccount.accountNumber,
      balance: primaryAccount.balance,
      lastSyncedAt: new Date().toISOString(),
    }), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error('Error handling Tink callback:', error);
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    return NextResponse.redirect(
      `${protocol}://${host}/?view=bank&error=${encodeURIComponent(error.message || 'Kunde inte slutföra bankkopplingen')}`
    );
  }
}
