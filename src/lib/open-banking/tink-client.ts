import { ConnectedBankAccount, PSD2Transaction, SwedishBankId, SWEDISH_BANKS } from './types';

export class TinkOpenBankingClient {
  private clientId: string;
  private clientSecret: string;
  private environment: string;

  constructor() {
    this.clientId = process.env.TINK_CLIENT_ID || 'mock-tink-client-id';
    this.clientSecret = process.env.TINK_CLIENT_SECRET || 'mock-tink-secret';
    this.environment = process.env.TINK_ENVIRONMENT || 'sandbox';
  }

  public isLiveConfigured(): boolean {
    return (
      Boolean(this.clientId) &&
      !this.clientId.startsWith('mock-') &&
      Boolean(this.clientSecret) &&
      !this.clientSecret.startsWith('mock-')
    );
  }

  /**
   * Generates a Tink Link URL for Swedish PSD2 account aggregation
   */
  public generateAuthorizationUrl(options: {
    redirectUri: string;
    bankId?: SwedishBankId;
    market?: string;
    locale?: string;
  }): string {
    const market = options.market || 'SE';
    const locale = options.locale || 'sv_SE';
    const base = 'https://link.tink.com/1.0/transactions/connect-accounts';

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: options.redirectUri,
      market,
      locale,
      test: this.environment === 'sandbox' ? 'true' : 'false',
    });

    return `${base}?${params.toString()}`;
  }

  /**
   * Exchanges authorization code for Tink Access Token
   */
  public async exchangeCodeForToken(code: string): Promise<string> {
    if (!this.isLiveConfigured()) {
      return `sandbox-tink-token-${Date.now()}`;
    }

    const res = await fetch('https://api.tink.com/api/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'authorization_code',
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to exchange Tink code: ${res.statusText}`);
    }

    const data = await res.json();
    return data.access_token;
  }

  /**
   * Fetches bank accounts for connected user
   */
  public async getAccounts(accessToken: string): Promise<ConnectedBankAccount[]> {
    if (!this.isLiveConfigured()) {
      return this.getMockSandboxAccounts();
    }

    const res = await fetch('https://api.tink.com/data/v2/accounts', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch Tink accounts: ${res.statusText}`);
    }

    const json = await res.json();
    return json.accounts.map((acc: any) => ({
      id: acc.id,
      bankId: 'handelsbanken' as SwedishBankId,
      bankName: acc.financialInstitutionId || 'Handelsbanken',
      accountNumber: acc.accountNumber || '6123-123 456 789',
      iban: acc.identifiers?.iban?.iban || 'SE4560000000000123456789',
      currency: acc.currencyCode || 'SEK',
      balance: acc.balances?.booked?.amount?.value?.unscaledValue 
        ? acc.balances.booked.amount.value.unscaledValue / 100 
        : 154285,
      lastSyncedAt: new Date().toISOString(),
      status: 'active' as const,
    }));
  }

  /**
   * Fetches booked transactions for an account
   */
  public async getTransactions(accessToken: string, accountId: string): Promise<PSD2Transaction[]> {
    if (!this.isLiveConfigured()) {
      return this.getMockSandboxTransactions(accountId);
    }

    const res = await fetch(`https://api.tink.com/data/v2/transactions?accountId=${accountId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch Tink transactions: ${res.statusText}`);
    }

    const json = await res.json();
    return json.transactions.map((t: any) => {
      const amount = (t.amount?.value?.unscaledValue || 0) / 100;
      return {
        id: t.id,
        accountId,
        bookingDate: t.dates?.booked || new Date().toISOString().split('T')[0],
        valueDate: t.dates?.value || t.dates?.booked,
        amount,
        currency: t.amount?.currencyCode || 'SEK',
        description: t.descriptions?.original || 'Korttransaktion',
        merchantName: t.merchantInformation?.merchantName,
        reference: t.reference,
        reconciliationStatus: 'pending' as const,
      };
    });
  }

  // Swedish PSD2 Sandbox Mock Data
  public getMockSandboxAccounts(bankId: SwedishBankId = 'handelsbanken'): ConnectedBankAccount[] {
    const bank = SWEDISH_BANKS.find((b) => b.id === bankId) || SWEDISH_BANKS[0];

    return [
      {
        id: `acc-${bank.id}-main`,
        bankId: bank.id,
        bankName: `${bank.name} Företagskonto`,
        accountNumber: `${bank.clearingNumberExample}-892 419 012`,
        iban: `SE45 6000 0000 0001 2345 6789`,
        currency: 'SEK',
        balance: 154285.00,
        lastSyncedAt: new Date().toISOString(),
        status: 'active',
      },
      {
        id: `acc-${bank.id}-skatt`,
        bankId: bank.id,
        bankName: `${bank.name} Moms- & Skattekonto (Buffert)`,
        accountNumber: `${bank.clearingNumberExample}-892 419 999`,
        iban: `SE45 6000 0000 0001 2345 9999`,
        currency: 'SEK',
        balance: 64010.00,
        lastSyncedAt: new Date().toISOString(),
        status: 'active',
      },
    ];
  }

  public getMockSandboxTransactions(accountId: string): PSD2Transaction[] {
    return [
      {
        id: 'psd2-tx-101',
        accountId,
        bookingDate: '2026-04-05',
        valueDate: '2026-04-05',
        amount: 106250.00,
        currency: 'SEK',
        description: 'Bankgiro inbetalning: SPOTIFY AB FAKTURA-2026-001',
        merchantName: 'Spotify AB',
        reference: 'FAKTURA-2026-001',
        category: 'Försäljning tjänster 25%',
        basAccount: '1510',
        matchedInvoiceId: 'inv-101',
        reconciliationStatus: 'reconciled',
      },
      {
        id: 'psd2-tx-102',
        accountId,
        bookingDate: '2026-04-10',
        valueDate: '2026-04-10',
        amount: -720.00,
        currency: 'SEK',
        description: 'Kortköp ADOBE *CREATIVE CLOUD DUBLIN',
        merchantName: 'Adobe Systems Software',
        category: 'Programvaror & Molntjänster',
        basAccount: '5420',
        matchedReceiptId: 'rec-201',
        reconciliationStatus: 'reconciled',
      },
      {
        id: 'psd2-tx-103',
        accountId,
        bookingDate: '2026-04-15',
        valueDate: '2026-04-15',
        amount: -1195.00,
        currency: 'SEK',
        description: 'Kortköp SJ AB INTERNET STOCKHOLM',
        merchantName: 'SJ AB',
        category: 'Persontransport',
        basAccount: '5800',
        matchedReceiptId: 'rec-202',
        reconciliationStatus: 'reconciled',
      },
      {
        id: 'psd2-tx-104',
        accountId,
        bookingDate: '2026-04-16',
        valueDate: '2026-04-16',
        amount: -185.00,
        currency: 'SEK',
        description: 'Kortköp ESPRESSO HOUSE STOCKHOLM C',
        merchantName: 'Espresso House Sweden AB',
        category: 'Måltider & Representation',
        basAccount: '6072',
        matchedReceiptId: 'rec-203',
        reconciliationStatus: 'reconciled',
      },
      {
        id: 'psd2-tx-105',
        accountId,
        bookingDate: '2026-04-20',
        valueDate: '2026-04-20',
        amount: -6490.00,
        currency: 'SEK',
        description: 'Klarna Bankgiro utb: WEBHALLEN SVERIGE AB',
        merchantName: 'Webhallen Sverige AB',
        category: 'Kontorsmaterial & Datatillbehör',
        basAccount: '5410',
        matchedReceiptId: 'rec-204',
        reconciliationStatus: 'reconciled',
      },
      {
        id: 'psd2-tx-106',
        accountId,
        bookingDate: '2026-04-24',
        valueDate: '2026-04-24',
        amount: -149.00,
        currency: 'SEK',
        description: 'Kortköp APPLE.COM/BILL ITUNES.COM',
        merchantName: 'Apple Distribution International',
        category: 'Programvaror & Molntjänster',
        basAccount: '5420',
        reconciliationStatus: 'missing_receipt',
      },
      {
        id: 'psd2-tx-107',
        accountId,
        bookingDate: '2026-04-28',
        valueDate: '2026-04-28',
        amount: -129.00,
        currency: 'SEK',
        description: 'Kortköp FLYGBUSSARNA STOCKHOLM C',
        merchantName: 'Flygbussarna Airport Coaches',
        category: 'Persontransport',
        basAccount: '5800',
        reconciliationStatus: 'missing_receipt',
      },
      {
        id: 'psd2-tx-108',
        accountId,
        bookingDate: '2026-05-02',
        valueDate: '2026-05-02',
        amount: 19080.00,
        currency: 'SEK',
        description: 'Bankgiro inbetalning: GÖTEBORGS STAD FAKTURA-2026-003',
        merchantName: 'Göteborgs Stad',
        reference: 'FAKTURA-2026-003',
        category: 'Försäljning kultur/skola 6%',
        basAccount: '1510',
        matchedInvoiceId: 'inv-103',
        reconciliationStatus: 'reconciled',
      },
      {
        id: 'psd2-tx-109',
        accountId,
        bookingDate: '2026-05-05',
        valueDate: '2026-05-05',
        amount: -340.00,
        currency: 'SEK',
        description: 'Swish betalning: ICA Supermarket Hornstull',
        merchantName: 'ICA Supermarket',
        category: 'Privat / Eget uttag',
        basAccount: '2013',
        reconciliationStatus: 'private_draw',
        note: 'Privat matinköp - bokförs som eget uttag (påverkar ej resultatet)',
      },
      {
        id: 'psd2-tx-110',
        accountId,
        bookingDate: '2026-05-12',
        valueDate: '2026-05-12',
        amount: 56250.00,
        currency: 'SEK',
        description: 'Bankgiro inbetalning: KLARNA BANK AB FAKTURA-2026-002',
        merchantName: 'Klarna Bank AB',
        reference: 'FAKTURA-2026-002',
        category: 'Försäljning tjänster 25%',
        basAccount: '1510',
        matchedInvoiceId: 'inv-102',
        reconciliationStatus: 'reconciled',
      },
    ];
  }
}

export const tinkClient = new TinkOpenBankingClient();
