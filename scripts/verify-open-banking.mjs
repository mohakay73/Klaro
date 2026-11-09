// Pure JS test for Node 24

const SWEDISH_BANKS = [
  { id: 'handelsbanken', name: 'Handelsbanken', bic: 'HANDSEHH' },
  { id: 'swedbank', name: 'Swedbank', bic: 'SWEDSSESS' },
  { id: 'seb', name: 'SEB', bic: 'ESSESTSS' },
  { id: 'nordea', name: 'Nordea Sverige', bic: 'NDEASTSS' },
  { id: 'danske_bank', name: 'Danske Bank', bic: 'DABASESX' },
  { id: 'lansforsakringar', name: 'Länsförsäkringar Bank', bic: 'LFBASEST' },
];

function reconcileTransactions(transactions, invoices, receipts) {
  const reconciled = [];
  const matchedInvoices = [];
  const matchedReceipts = [];
  const usedInvoiceIds = new Set();
  const usedReceiptIds = new Set();

  for (const tx of transactions) {
    const updated = { ...tx };
    if (tx.amount > 0) {
      const match = invoices.find((inv) => {
        if (usedInvoiceIds.has(inv.id)) return false;
        const desc = (tx.description || '').toUpperCase();
        const invNum = (inv.invoice_number || '').toUpperCase();
        return (invNum && desc.includes(invNum)) || Math.abs(tx.amount - inv.total_amount) < 1.0;
      });
      if (match) {
        updated.reconciliationStatus = 'reconciled';
        updated.matchedInvoiceId = match.id;
        usedInvoiceIds.add(match.id);
        matchedInvoices.push({ txId: tx.id, invId: match.id, amount: tx.amount });
      } else {
        updated.reconciliationStatus = 'pending';
      }
    } else {
      const abs = Math.abs(tx.amount);
      const match = receipts.find((rec) => {
        if (usedReceiptIds.has(rec.id)) return false;
        return Math.abs(abs - rec.total_amount) < 0.5;
      });
      if (match) {
        updated.reconciliationStatus = 'reconciled';
        updated.matchedReceiptId = match.id;
        usedReceiptIds.add(match.id);
        matchedReceipts.push({ txId: tx.id, recId: match.id, amount: abs });
      } else {
        updated.reconciliationStatus = 'missing_receipt';
      }
    }
    reconciled.push(updated);
  }

  return {
    reconciled,
    result: {
      reconciledCount: reconciled.filter((t) => t.reconciliationStatus === 'reconciled').length,
      missingCount: reconciled.filter((t) => t.reconciliationStatus === 'missing_receipt').length,
      matchedInvoices,
      matchedReceipts,
    },
  };
}

const mockTxs = [
  { id: 't1', amount: 106250, description: 'Bankgiro inbet: SPOTIFY AB FAKTURA-2026-001' },
  { id: 't2', amount: -720, description: 'Kortköp ADOBE *CREATIVE CLOUD' },
  { id: 't3', amount: -1195, description: 'Kortköp SJ AB' },
  { id: 't4', amount: -149, description: 'Kortköp APPLE.COM/BILL' }, // Missing
];

const mockInvoices = [
  { id: 'inv-1', invoice_number: 'FAKTURA-2026-001', total_amount: 106250 }
];

const mockReceipts = [
  { id: 'rec-1', total_amount: 720, vendor_name: 'Adobe' },
  { id: 'rec-2', total_amount: 1195, vendor_name: 'SJ' },
];

console.log('Testing Swedish PSD2 Bank Reconciliation Engine...');
const { reconciled, result } = reconcileTransactions(mockTxs, mockInvoices, mockReceipts);

console.log('Total Transactions:', reconciled.length);
console.log('Reconciled Count (3 expected):', result.reconciledCount);
console.log('Missing Receipts Count (1 expected):', result.missingCount);

if (result.reconciledCount !== 3 || result.missingCount !== 1) {
  throw new Error('Reconciliation test failed');
}

console.log('✅ OPEN BANKING RECONCILIATION SUCCEEDED 100%!');
