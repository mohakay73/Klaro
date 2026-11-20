import { ConnectedBankAccount, PSD2Transaction, SwedishBankId, SWEDISH_BANKS } from './types';
import { Receipt, Invoice } from '@/types/database';

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
      balance: acc.balances?.booked?.amount?.value || 0,
      lastSyncedAt: new Date().toISOString(),
      status: 'active' as const,
    }));
  }

  /**
   * Fetches transactions for an account
   */
  public async getTransactions(
    accessToken: string,
    accountId: string,
    currentReceipts: Receipt[] = [],
    currentInvoices: Invoice[] = []
  ): Promise<PSD2Transaction[]> {
    if (!this.isLiveConfigured()) {
      return this.getMockSandboxTransactions(accountId, currentReceipts, currentInvoices);
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
      const amount = t.amount?.value?.unscaledValue 
        ? t.amount.value.unscaledValue / Math.pow(10, t.amount.value.scale) 
        : 0;

      return {
        id: t.id,
        accountId: t.accountId,
        bookingDate: t.dates?.booked || new Date().toISOString().split('T')[0],
        valueDate: t.dates?.value || new Date().toISOString().split('T')[0],
        amount,
        currency: t.amount?.currencyCode || 'SEK',
        description: t.descriptions?.original || 'Okänd korttransaktion',
        merchantName: t.descriptions?.display,
        category: t.categories?.pfm?.name,
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

  /**
   * Generates realistic Swedish bank transactions matching the user's real receipts
   * plus authentic missing-receipt expenses (Hotel, Gas, Hardware) to showcase tax risk alerts.
   */
  public getMockSandboxTransactions(
    accountId: string,
    currentReceipts: Receipt[] = [],
    currentInvoices: Invoice[] = []
  ): PSD2Transaction[] {
    const txs: PSD2Transaction[] = [];

    // 1. If user has real receipts, create matching bank transactions for each
    if (currentReceipts && currentReceipts.length > 0) {
      currentReceipts.forEach((rec, idx) => {
        const rawDate = typeof rec.invoice_date === 'string' 
          ? rec.invoice_date.split('T')[0] 
          : String(rec.invoice_date).split('T')[0];

        txs.push({
          id: `tx-match-${rec.id}`,
          accountId,
          bookingDate: rawDate,
          valueDate: rawDate,
          amount: -Number(rec.total_amount),
          currency: rec.currency || 'SEK',
          description: `Kortköp ${rec.vendor_name.toUpperCase()}`,
          merchantName: rec.vendor_name,
          category: rec.category,
          basAccount: rec.raw_ai_response?.bas_account || '5400',
          matchedReceiptId: rec.id,
          reconciliationStatus: 'reconciled',
        });
      });
    }

    // 2. Realistic business transactions that SAKNAR KVITTO (Unreconciled) -> Triggers Skatterisk banner!
    txs.push(
      {
        id: 'psd2-missing-1',
        accountId,
        bookingDate: '2026-11-17',
        valueDate: '2026-11-17',
        amount: -2450.00,
        currency: 'SEK',
        description: 'Kortköp HOTEL AT SIX STOCKHOLM',
        merchantName: 'Hotel At Six Stockholm',
        category: 'Hotell & Resor',
        basAccount: '5800',
        reconciliationStatus: 'missing_receipt',
      },
      {
        id: 'psd2-missing-2',
        accountId,
        bookingDate: '2026-11-18',
        valueDate: '2026-11-18',
        amount: -680.00,
        currency: 'SEK',
        description: 'Kortköp CIRCLE K SÖDERMÄLARSTRAND',
        merchantName: 'Circle K Sverige AB',
        category: 'Drivmedel & Transport',
        basAccount: '5800',
        reconciliationStatus: 'missing_receipt',
      },
      {
        id: 'psd2-missing-3',
        accountId,
        bookingDate: '2026-11-16',
        valueDate: '2026-11-16',
        amount: -1290.00,
        currency: 'SEK',
        description: 'Klarna Bankgiro utb: KONTORSMATERIAL',
        merchantName: 'Klarna Bank AB',
        category: 'Kontorsmaterial & Trycksaker',
        basAccount: '5410',
        reconciliationStatus: 'missing_receipt',
      }
    );

    // 3. Private draw (Eget uttag 2013)
    txs.push({
      id: 'psd2-private-1',
      accountId,
      bookingDate: '2026-11-15',
      valueDate: '2026-11-15',
      amount: -1500.00,
      currency: 'SEK',
      description: 'Swish till privat konto',
      merchantName: 'Swish Privat',
      category: 'Privat / Eget uttag',
      basAccount: '2013',
      reconciliationStatus: 'private_draw',
      note: 'Eget uttag (Enskild firma) - påverkar ej resultatet',
    });

    // 4. Inbound customer invoice revenue
    txs.push({
      id: 'psd2-income-1',
      accountId,
      bookingDate: '2026-11-14',
      valueDate: '2026-11-14',
      amount: 45000.00,
      currency: 'SEK',
      description: 'Bankgiro inbetalning: SPOTIFY AB FAKTURA-2026-001',
      merchantName: 'Spotify AB',
      reference: 'FAKTURA-2026-001',
      category: 'Försäljning tjänster 25%',
      basAccount: '1510',
      reconciliationStatus: 'reconciled',
    });

    // Sort by bookingDate DESC
    return txs.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
  }
}

export const tinkClient = new TinkOpenBankingClient();
