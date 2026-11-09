export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number; // positive = incoming, negative = outgoing
  currency: string;
  matchedReceiptId?: string;
  matchedInvoiceId?: string;
  status: 'reconciled' | 'missing_receipt' | 'pending';
}

export const INITIAL_BANK_TRANSACTIONS: BankTransaction[] = [
  {
    id: 'tx-001',
    date: '2026-04-05',
    description: 'Bankgiro inbet: SPOTIFY AB FAKTURA-2026-001',
    amount: 106250.00,
    currency: 'SEK',
    matchedInvoiceId: 'inv-101',
    status: 'reconciled',
  },
  {
    id: 'tx-002',
    date: '2026-04-10',
    description: 'Kortköp ADOBE *CREATIVE CLOUD DUBLIN',
    amount: -720.00,
    currency: 'SEK',
    matchedReceiptId: 'rec-201',
    status: 'reconciled',
  },
  {
    id: 'tx-003',
    date: '2026-04-15',
    description: 'Kortköp SJ AB INTERNET STOCKHOLM',
    amount: -1195.00,
    currency: 'SEK',
    matchedReceiptId: 'rec-202',
    status: 'reconciled',
  },
  {
    id: 'tx-004',
    date: '2026-04-16',
    description: 'Kortköp ESPRESSO HOUSE STOCKHOLM C',
    amount: -185.00,
    currency: 'SEK',
    matchedReceiptId: 'rec-203',
    status: 'reconciled',
  },
  {
    id: 'tx-005',
    date: '2026-04-20',
    description: 'Klarna Bankgiro utb: WEBHALLEN SVERIGE AB',
    amount: -6490.00,
    currency: 'SEK',
    matchedReceiptId: 'rec-204',
    status: 'reconciled',
  },
  {
    id: 'tx-006',
    date: '2026-04-24',
    description: 'Kortköp APPLE.COM/BILL ITUNES.COM',
    amount: -149.00,
    currency: 'SEK',
    status: 'missing_receipt', // Unreconciled! Missing receipt
  },
  {
    id: 'tx-007',
    date: '2026-04-28',
    description: 'Kortköp FLYGBUSSARNA STOCKHOLM',
    amount: -129.00,
    currency: 'SEK',
    status: 'missing_receipt', // Unreconciled! Missing receipt
  },
];
