import { PSD2Transaction, ReconciliationResult, EstimatedTaxLoss } from './types';
import { Invoice, Receipt } from '@/types/database';

/**
 * Calculates estimated tax deduction loss for unreconciled business expenses.
 * In Sweden, missing receipts prevent both VAT (ingående moms) and income tax / egenavgifter deductions.
 */
export function calculateTaxDeductionLoss(missingTransactions: PSD2Transaction[]): EstimatedTaxLoss {
  const missingExpenses = missingTransactions.filter(
    (t) => t.amount < 0 && t.reconciliationStatus === 'missing_receipt'
  );

  const totalMissingAmount = missingExpenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  // Standard 25% moms represents 20% of gross invoice amount (100 / 1.25 * 0.25 = 20)
  const estimatedVatLoss = Math.round(totalMissingAmount * 0.20);
  
  // Untaxed business expense deduction saves ~43% in municipal income tax & egenavgifter for enskild firma
  const netAmount = totalMissingAmount - estimatedVatLoss;
  const estimatedIncomeTaxLoss = Math.round(netAmount * 0.43);
  
  const totalEstimatedLoss = estimatedVatLoss + estimatedIncomeTaxLoss;

  return {
    totalMissingAmount: Math.round(totalMissingAmount * 100) / 100,
    estimatedVatLoss,
    estimatedIncomeTaxLoss,
    totalEstimatedLoss,
    missingCount: missingExpenses.length,
  };
}

/**
 * Automatically reconciles PSD2 bank transactions against Klaro's invoices and receipts.
 */
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
    const updatedTx: PSD2Transaction = { ...tx };

    // If transaction was explicitly marked as private draw by the user, preserve it
    if (tx.reconciliationStatus === 'private_draw') {
      updatedTx.basAccount = tx.basAccount || '2013'; // 2013 Eget uttag
      reconciledTransactions.push(updatedTx);
      continue;
    }

    if (tx.amount > 0) {
      // 1. Incoming Revenue: Match with Invoices (BAS 1510 Kundfordringar)
      const match = invoices.find((inv) => {
        if (usedInvoiceIds.has(inv.id)) return false;

        // Check reference or invoice number match in description
        const desc = (tx.description || '').toUpperCase();
        const invNum = (inv.invoice_number || '').toUpperCase();
        const hasRefMatch = invNum && desc.includes(invNum);

        // Check exact amount match (within 1 SEK for rounding)
        const hasAmountMatch = Math.abs(tx.amount - inv.total_amount) < 1.0;

        return hasRefMatch || hasAmountMatch;
      });

      if (match) {
        updatedTx.reconciliationStatus = 'reconciled';
        updatedTx.matchedInvoiceId = match.id;
        updatedTx.basAccount = '1510'; // Kundfordringar
        usedInvoiceIds.add(match.id);
        matchedInvoices.push({
          transactionId: tx.id,
          invoiceId: match.id,
          amount: tx.amount,
        });
      } else {
        updatedTx.reconciliationStatus = 'pending';
        updatedTx.basAccount = '1930';
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

        return hasAmountMatch || (hasVendorMatch && Math.abs(absAmount - rec.total_amount) < 5.0);
      });

      if (match) {
        updatedTx.reconciliationStatus = 'reconciled';
        updatedTx.matchedReceiptId = match.id;
        updatedTx.basAccount = match.raw_ai_response?.bas_account || deduceBasAccount(tx);
        usedReceiptIds.add(match.id);
        matchedReceipts.push({
          transactionId: tx.id,
          receiptId: match.id,
          amount: absAmount,
        });
      } else {
        // Flag as missing receipt
        updatedTx.reconciliationStatus = 'missing_receipt';
        updatedTx.basAccount = deduceBasAccount(tx);
      }
    }

    reconciledTransactions.push(updatedTx);
  }

  const reconciledCount = reconciledTransactions.filter((t) => t.reconciliationStatus === 'reconciled').length;
  const unreconciledExpensesCount = reconciledTransactions.filter((t) => t.reconciliationStatus === 'missing_receipt').length;
  const unreconciledRevenueCount = reconciledTransactions.filter((t) => t.amount > 0 && t.reconciliationStatus === 'pending').length;
  const privateDrawCount = reconciledTransactions.filter((t) => t.reconciliationStatus === 'private_draw').length;

  const estimatedTaxLoss = calculateTaxDeductionLoss(reconciledTransactions);

  return {
    reconciledTransactions,
    result: {
      reconciledCount,
      unreconciledExpensesCount,
      unreconciledRevenueCount,
      privateDrawCount,
      estimatedTaxLoss,
      matchedInvoices,
      matchedReceipts,
    },
  };
}

/**
 * Deduce Swedish BAS account based on merchant or description keywords
 */
export function deduceBasAccount(tx: PSD2Transaction): string {
  const desc = (tx.description + ' ' + (tx.merchantName || '')).toLowerCase();

  if (desc.includes('adobe') || desc.includes('apple') || desc.includes('software') || desc.includes('github') || desc.includes('figma') || desc.includes('aws') || desc.includes('google')) {
    return '5420'; // Programvaror & molntjänster
  }
  if (desc.includes('sj ') || desc.includes('flygbuss') || desc.includes('taxi') || desc.includes('uber') || desc.includes('sas ') || desc.includes('sl ')) {
    return '5800'; // Resekostnader & transport
  }
  if (desc.includes('espresso') || desc.includes('restaurang') || desc.includes('café') || desc.includes('lunch') || desc.includes('mat')) {
    return '6072'; // Representation ej avdragsgill / personalmat
  }
  if (desc.includes('webhallen') || desc.includes('elgiganten') || desc.includes('dustin') || desc.includes('komplett') || desc.includes('ikea')) {
    return '5410'; // Förbrukningsinventarier & datatillbehör
  }
  if (desc.includes('stripe') || desc.includes('bank') || desc.includes('avgift')) {
    return '6570'; // Bankkostnader
  }
  if (desc.includes('swish') || desc.includes('privat') || desc.includes('uttag') || desc.includes('ica') || desc.includes('coop')) {
    return '2013'; // Eget uttag
  }

  return '6990'; // Övriga externa kostnader
}
