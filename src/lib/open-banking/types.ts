export type SwedishBankId = 
  | 'handelsbanken'
  | 'swedbank'
  | 'seb'
  | 'nordea'
  | 'danske_bank'
  | 'lansforsakringar';

export interface SwedishBank {
  id: SwedishBankId;
  name: string;
  bic: string;
  clearingNumberExample: string;
  logoColor: string;
  supportedAccountTypes: string[];
}

export const SWEDISH_BANKS: SwedishBank[] = [
  {
    id: 'handelsbanken',
    name: 'Handelsbanken',
    bic: 'HANDSEHH',
    clearingNumberExample: '6123',
    logoColor: '#005b94',
    supportedAccountTypes: ['Företagskonto', 'Skattekonto', 'Valutakonto'],
  },
  {
    id: 'swedbank',
    name: 'Swedbank',
    bic: 'SWEDSSESS',
    clearingNumberExample: '8327-9',
    logoColor: '#f35b25',
    supportedAccountTypes: ['Företagskonto', 'Placeringskonto'],
  },
  {
    id: 'seb',
    name: 'SEB (Skandinaviska Enskilda Banken)',
    bic: 'ESSESTSS',
    clearingNumberExample: '5234',
    logoColor: '#007a3d',
    supportedAccountTypes: ['Enskild Firma Företagskonto', 'Valutakonto'],
  },
  {
    id: 'nordea',
    name: 'Nordea Sverige',
    bic: 'NDEASTSS',
    clearingNumberExample: '3300',
    logoColor: '#0000a0',
    supportedAccountTypes: ['PlusGirot Företagskonto', 'Nordea Business'],
  },
  {
    id: 'danske_bank',
    name: 'Danske Bank Sverige',
    bic: 'DABASESX',
    clearingNumberExample: '1234',
    logoColor: '#002855',
    supportedAccountTypes: ['Affärskonto', 'Valutakonto'],
  },
  {
    id: 'lansforsakringar',
    name: 'Länsförsäkringar Bank',
    bic: 'LFBASEST',
    clearingNumberExample: '9020',
    logoColor: '#004f9e',
    supportedAccountTypes: ['Företagskonto'],
  },
];

export interface ConnectedBankAccount {
  id: string;
  bankId: SwedishBankId;
  bankName: string;
  accountNumber: string;
  iban: string;
  currency: string;
  balance: number;
  lastSyncedAt: string;
  status: 'active' | 'disconnected' | 'expired';
}

export interface PSD2Transaction {
  id: string;
  accountId: string;
  bookingDate: string; // YYYY-MM-DD
  valueDate: string;
  amount: number; // positive = incoming revenue, negative = expense
  currency: string;
  description: string;
  merchantName?: string;
  reference?: string; // OCR or invoice reference
  category?: string;
  matchedReceiptId?: string;
  matchedInvoiceId?: string;
  reconciliationStatus: 'reconciled' | 'missing_receipt' | 'pending';
  rawPsd2Data?: Record<string, any>;
}

export interface ReconciliationResult {
  reconciledCount: number;
  unreconciledExpensesCount: number;
  unreconciledRevenueCount: number;
  matchedInvoices: Array<{ transactionId: string; invoiceId: string; amount: number }>;
  matchedReceipts: Array<{ transactionId: string; receiptId: string; amount: number }>;
}
