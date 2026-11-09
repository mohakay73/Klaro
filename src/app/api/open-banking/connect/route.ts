import { NextRequest, NextResponse } from 'next/server';
import { tinkClient } from '@/lib/open-banking/tink-client';
import { SwedishBankId } from '@/lib/open-banking/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { bankId, redirectUri } = body;

    const selectedBankId: SwedishBankId = bankId || 'handelsbanken';
    const callback = redirectUri || 'http://localhost:3000/api/open-banking/callback';

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
