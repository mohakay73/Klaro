import { PSD2Transaction, ReconciliationResult } from './types';
import { Invoice, Receipt } from '@/types/database';

export function reconcileTransactions(
  transactions: PSD2Transaction[],
  invoices: Invoice[],
  receipts: Receipt[]
): {
  reconciledTransactions: PSD2Transaction[];
  result: ReconciliationResult;
} {
  const reconciledTransactions: PSD2Transaction[] = [];
  const matchedInvoices: Array<{ transactionId: string; invoiceId: string; amount: number }> = [];
  const matchedReceipts: Array<{ transactionId: string; receiptId: string; amount: number }> = [];

  const usedInvoiceIds = new Set<string>();
  const usedReceiptIds = new Set<string>();

  for (const tx of transactions) {
    const updatedTx = { ...tx };

    if (tx.amount > 0) {
      // 1. Incoming Revenue: Match with Invoices
      const match = invoices.find((inv) => {
        if (usedInvoiceIds.has(inv.id)) return false;

        // Check reference or invoice number match in description
        const desc = (tx.description || '').toUpperCase();
        const invNum = (inv.invoice_number || '').toUpperCase();
        const hasRefMatch = invNum && desc.includes(invNum);

        // Check exact amount match
        const hasAmountMatch = Math.abs(tx.amount - inv.total_amount) < 1.0;

        return hasRefMatch || hasAmountMatch;
      });

      if (match) {
        updatedTx.reconciliationStatus = 'reconciled';
        updatedTx.matchedInvoiceId = match.id;
        usedInvoiceIds.add(match.id);
        matchedInvoices.push({
          transactionId: tx.id,
          invoiceId: match.id,
          amount: tx.amount,
        });
      } else {
        updatedTx.reconciliationStatus = 'pending';
      }
    } else {
      // 2. Outgoing Expense: Match with Receipts
      const absAmount = Math.abs(tx.amount);

      const match = receipts.find((rec) => {
        if (usedReceiptIds.has(rec.id)) return false;

        // Check exact amount match
        const hasAmountMatch = Math.abs(absAmount - rec.total_amount) < 0.5;

        // Check vendor or merchant name similarity
        const desc = (tx.description || '').toLowerCase();
        const vendor = (rec.vendor_name || '').toLowerCase();
        const hasVendorMatch = desc.includes(vendor) || vendor.includes(desc);

        return hasAmountMatch;
      });

      if (match) {
        updatedTx.reconciliationStatus = 'reconciled';
        updatedTx.matchedReceiptId = match.id;
        usedReceiptIds.add(match.id);
        matchedReceipts.push({
          transactionId: tx.id,
          receiptId: match.id,
          amount: absAmount,
        });
      } else {
        // Flag as missing receipt if older than 2 days
        updatedTx.reconciliationStatus = 'missing_receipt';
      }
    }

    reconciledTransactions.push(updatedTx);
  }

  const reconciledCount = reconciledTransactions.filter((t) => t.reconciliationStatus === 'reconciled').length;
  const unreconciledExpensesCount = reconciledTransactions.filter((t) => t.reconciliationStatus === 'missing_receipt').length;
  const unreconciledRevenueCount = reconciledTransactions.filter((t) => t.amount > 0 && t.reconciliationStatus === 'pending').length;

  return {
    reconciledTransactions,
    result: {
      reconciledCount,
      unreconciledExpensesCount,
      unreconciledRevenueCount,
      matchedInvoices,
      matchedReceipts,
    },
  };
}
