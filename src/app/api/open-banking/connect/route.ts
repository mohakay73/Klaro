import { NextRequest, NextResponse } from 'next/server';
import { tinkClient } from '@/lib/open-banking/tink-client';
import { SwedishBankId } from '@/lib/open-banking/types';
import { getDb } from '@/lib/neon';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { bankId, redirectUri } = body;

    const selectedBankId: SwedishBankId = bankId || 'handelsbanken';
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const callback = redirectUri || `${protocol}://${host}/api/open-banking/callback`;

    // Check if user has custom Tink credentials in Neon
    const cookie = req.cookies.get('klaro_user');
    let sessionUser: { id?: string; email?: string } | null = null;
    if (cookie?.value) {
      try {
        sessionUser = JSON.parse(cookie.value);
      } catch {}
    }

    if (sessionUser?.email) {
      try {
        const sql = getDb();
        const rows = await sql.query(
          'SELECT tink_client_id, tink_client_secret FROM profiles WHERE email = $1 LIMIT 1',
          [sessionUser.email]
        );
        if (rows.length > 0 && rows[0].tink_client_id && rows[0].tink_client_secret) {
          tinkClient.setCredentials(rows[0].tink_client_id, rows[0].tink_client_secret);
        }
      } catch (e) {
        console.warn('Note on loading custom Tink credentials from Neon:', e);
      }
    }

    // If live credentials are set, return live Tink Link URL
    if (tinkClient.isLiveConfigured()) {
      const authUrl = tinkClient.generateAuthorizationUrl({
        redirectUri: callback,
        bankId: selectedBankId,
        market: 'SE',
        locale: 'sv_SE',
      });

      return NextResponse.json({
        success: true,
        mode: 'live_tink',
        authUrl,
      });
    }

    // In sandbox / simulated mode, return sandbox BankID auth session
    const accounts = tinkClient.getMockSandboxAccounts(selectedBankId);
    return NextResponse.json({
      success: true,
      mode: 'sandbox_simulation',
      bankId: selectedBankId,
      accounts,
      message: 'Ansluten till svensk PSD2 Sandbox via BankID.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Kunde inte starta Open Banking anslutning.' },
      { status: 500 }
    );
  }
}
