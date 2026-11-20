import { NextRequest, NextResponse } from 'next/server';
import { getDb, DEFAULT_USER_ID } from '@/lib/neon';
import { tinkClient } from '@/lib/open-banking/tink-client';

export async function GET(req: NextRequest) {
  try {
    const cookie = req.cookies.get('klaro_user');
    let sessionUser: { id?: string; email?: string } | null = null;
    if (cookie?.value) {
      try {
        sessionUser = JSON.parse(cookie.value);
      } catch {}
    }

    let customClientId: string | null = null;
    let isConfigured = tinkClient.isLiveConfigured();

    if (sessionUser?.email) {
      const sql = getDb();
      const rows = await sql.query(
        'SELECT tink_client_id, tink_client_secret FROM profiles WHERE email = $1 LIMIT 1',
        [sessionUser.email]
      );
      if (rows.length > 0 && rows[0].tink_client_id) {
        customClientId = rows[0].tink_client_id;
        isConfigured = Boolean(rows[0].tink_client_id && rows[0].tink_client_secret);
      }
    }

    return NextResponse.json({
      isLiveConfigured: isConfigured,
      clientId: customClientId || (tinkClient.isLiveConfigured() ? '***' : null),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientId, clientSecret, environment = 'sandbox' } = body;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'Client ID och Client Secret krävs.' }, { status: 400 });
    }

    const cookie = req.cookies.get('klaro_user');
    let sessionUser: { id?: string; email?: string } | null = null;
    if (cookie?.value) {
      try {
        sessionUser = JSON.parse(cookie.value);
      } catch {}
    }

    const email = sessionUser?.email || 'mohakay73@gmail.com';

    // Persist to Neon
    const sql = getDb();
    await sql.query(
      `UPDATE profiles
       SET tink_client_id = $1, tink_client_secret = $2, updated_at = NOW()
       WHERE email = $3 OR id = $4;`,
      [clientId.trim(), clientSecret.trim(), email, sessionUser?.id || DEFAULT_USER_ID]
    );

    // Update active runtime Tink client instance
    tinkClient.setCredentials(clientId.trim(), clientSecret.trim(), environment);

    return NextResponse.json({
      success: true,
      message: 'Tink API-uppgifter har sparats i din profil i Neon.',
      isLiveConfigured: true,
    });
  } catch (error: any) {
    console.error('Error saving Tink credentials:', error);
    return NextResponse.json({ error: error.message || 'Kunde inte spara Tink-uppgifter' }, { status: 500 });
  }
}
