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
 * Normalizes vendor strings by removing Swedish bank transaction noise,
 * prefixes (kortköp, bankgiro, klarna), suffixes (AB, Sweden), and special characters.
 */
export function normalizeVendorName(raw: string): string {
  if (!raw) return '';
  return raw
    .toLowerCase()
    .replace(/^kortk[öo]p\s+/gi, '')
    .replace(/^k[öo]p\s+/gi, '')
    .replace(/^klarna\s+(bankgiro\s+utb:?)?\s*/gi, '')
    .replace(/^bankgiro\s+(inb|utb):?\s*/gi, '')
    .replace(/^bg\s+\d+[- ]?\d*\s*/gi, '')
    .replace(/^plusgiro\s+/gi, '')
    .replace(/^swish\s+(till|fr[åa]n)?\s*/gi, '')
    .replace(/\b(aktiebolag|ab|sverige|sweden|stockholm|nordic|group|filial| filial)\b/gi, '')
    .replace(/[^a-z0-9åäö]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates difference in days between two ISO date strings (YYYY-MM-DD or full timestamp).
 */
export function calculateDaysDifference(dateStr1: string, dateStr2: string): number {
  try {
    const d1 = new Date(dateStr1.split('T')[0]);
    const d2 = new Date(dateStr2.split('T')[0]);
    const diffTime = Math.abs(d1.getTime() - d2.getTime());
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 999;
  }
}

/**
 * Determines whether two merchant strings have high vendor similarity.
 */
function isVendorSimilar(txDesc: string, txMerchant: string | undefined, recVendor: string): boolean {
  const normRec = normalizeVendorName(recVendor);
  if (!normRec) return false;

  const normDesc = normalizeVendorName(txDesc);
  const normMerch = txMerchant ? normalizeVendorName(txMerchant) : '';

  // 1. Direct substring match
  if (normDesc.includes(normRec) || normRec.includes(normDesc)) return true;
  if (normMerch && (normMerch.includes(normRec) || normRec.includes(normMerch))) return true;

  // 2. Word tokens match (e.g. "Circle K" vs "Circle K Södermälarstrand")
  const recTokens = normRec.split(' ').filter((t) => t.length >= 3);
  if (recTokens.length > 0) {
    const matches = recTokens.filter((token) => normDesc.includes(token) || (normMerch && normMerch.includes(token)));
    if (matches.length >= Math.min(2, recTokens.length)) {
      return true;
    }
  }

  return false;
}

/**
 * Scores the match likelihood between an outgoing transaction and an expense receipt.
 * Returns score 0 - 100, confidence (0.00 - 1.00), and a descriptive reason.
 */
export function scoreReceiptMatch(
  tx: PSD2Transaction,
  rec: Receipt
): { score: number; confidence: number; reason: string } {
  if (tx.amount >= 0) return { score: 0, confidence: 0, reason: '' };

  const absAmount = Math.abs(tx.amount);
  const recAmount = Number(rec.total_amount);
  const amountDiff = Math.abs(absAmount - recAmount);
  const daysDiff = calculateDaysDifference(tx.bookingDate, rec.invoice_date);
  const vendorMatch = isVendorSimilar(tx.description, tx.merchantName, rec.vendor_name);

  // Exact amount match (< 0.05 SEK)
  if (amountDiff < 0.05) {
    if (vendorMatch && daysDiff <= 10) {
      return {
        score: 99,
        confidence: 0.99,
        reason: `Exakt belopp (${absAmount} kr) & handlare '${rec.vendor_name}' (${daysDiff} d differens)`,
      };
    }
    if (daysDiff <= 3) {
      return {
        score: 94,
        confidence: 0.94,
        reason: `Exakt belopp (${absAmount} kr) bokat ${daysDiff === 0 ? 'samma dag' : `${daysDiff} dagar efter kvittot`}`,
      };
    }
    if (vendorMatch && daysDiff <= 30) {
      return {
        score: 90,
        confidence: 0.90,
        reason: `Exakt belopp & matchande leverantör '${rec.vendor_name}' (${daysDiff} dagar)`,
      };
    }
    if (daysDiff <= 14) {
      return {
        score: 82,
        confidence: 0.82,
        reason: `Exakt belopp (${absAmount} kr) bokat inom 2 veckor (${daysDiff} d)`,
      };
    }
    return {
      score: 65,
      confidence: 0.65,
      reason: `Samma belopp (${absAmount} kr), men ${daysDiff} dagars mellanrum`,
    };
  }

  // Small rounding or tip difference (< 1.00 SEK)
  if (amountDiff < 1.00) {
    if (vendorMatch && daysDiff <= 14) {
      return {
        score: 88,
        confidence: 0.88,
        reason: `Öresavrundning (<1 kr) & leverantör '${rec.vendor_name}' (${daysDiff} d)`,
      };
    }
    if (daysDiff <= 3) {
      return {
        score: 75,
        confidence: 0.75,
        reason: `Avrundat belopp diffar ${amountDiff.toFixed(2)} kr (${daysDiff} d)`,
      };
    }
  }

  // Currency conversion or minor fee diff (< 5.00 SEK)
  if (amountDiff <= 5.00 && vendorMatch && daysDiff <= 7) {
    return {
      score: 70,
      confidence: 0.70,
      reason: `Leverantör '${rec.vendor_name}' matchar, belopp diffar ${amountDiff.toFixed(2)} kr (valutakurs/dricks)`,
    };
  }

  return { score: 0, confidence: 0, reason: '' };
}

/**
 * Scores incoming bank payment against customer invoices.
 */
export function scoreInvoiceMatch(
  tx: PSD2Transaction,
  inv: Invoice
): { score: number; confidence: number; reason: string } {
  if (tx.amount <= 0) return { score: 0, confidence: 0, reason: '' };

  const txDesc = (tx.description || '').toUpperCase();
  const invNumber = (inv.invoice_number || '').toUpperCase();
  const invAmount = Number(inv.total_amount);
  const amountDiff = Math.abs(tx.amount - invAmount);
  const daysDiff = calculateDaysDifference(tx.bookingDate, inv.invoice_date);

  // 1. Invoice Number in transaction reference/text
  if (invNumber && txDesc.includes(invNumber)) {
    return {
      score: 100,
      confidence: 1.0,
      reason: `Fakturanr ${invNumber} identifierat i banktexten`,
    };
  }

  // 2. Exact amount match with customer name in description
  const customerName = (inv.customer_name || '').toLowerCase();
  const hasCustomerMatch = customerName && txDesc.toLowerCase().includes(customerName);

  if (amountDiff < 1.0) {
    if (hasCustomerMatch) {
      return {
        score: 96,
        confidence: 0.96,
        reason: `Exakt belopp (${tx.amount} kr) & kundnamn '${inv.customer_name}' i betalningen`,
      };
    }
    if (daysDiff <= 45) {
      return {
        score: 90,
        confidence: 0.90,
        reason: `Exakt fakturabelopp (${tx.amount} kr) för faktura #${invNumber}`,
      };
    }
    return {
      score: 70,
      confidence: 0.70,
      reason: `Matchande fakturabelopp (${tx.amount} kr)`,
    };
  }

  return { score: 0, confidence: 0, reason: '' };
}

/**
 * Automatically reconciles PSD2 bank transactions against Klaro's invoices and receipts
 * using multi-tier heuristic matching.
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

  // Collect already manually reconciled IDs to not double-assign
  for (const tx of transactions) {
    if (tx.reconciliationStatus === 'reconciled') {
      if (tx.matchedReceiptId) usedReceiptIds.add(tx.matchedReceiptId);
      if (tx.matchedInvoiceId) usedInvoiceIds.add(tx.matchedInvoiceId);
    }
  }

  for (const tx of transactions) {
    const updatedTx: PSD2Transaction = { ...tx };

    // 1. Explicit Private Draw preserved
    if (tx.reconciliationStatus === 'private_draw') {
      updatedTx.basAccount = tx.basAccount || '2013'; // 2013 Eget uttag
      reconciledTransactions.push(updatedTx);
      continue;
    }

    // 2. Already manually reconciled preserved
    if (tx.reconciliationStatus === 'reconciled' && (tx.matchedReceiptId || tx.matchedInvoiceId)) {
      reconciledTransactions.push(updatedTx);
      continue;
    }

    // Reset temporary suggestions
    delete updatedTx.suggestedReceiptId;
    delete updatedTx.suggestedInvoiceId;

    if (tx.amount > 0) {
      // 3. Incoming Revenue -> Match Invoices
      let bestInvoiceMatch: { invoice: Invoice; score: number; confidence: number; reason: string } | null = null;

      for (const inv of invoices) {
        if (usedInvoiceIds.has(inv.id)) continue;
        const evaluation = scoreInvoiceMatch(tx, inv);
        if (evaluation.score > 0 && (!bestInvoiceMatch || evaluation.score > bestInvoiceMatch.score)) {
          bestInvoiceMatch = { invoice: inv, ...evaluation };
        }
      }

      if (bestInvoiceMatch && bestInvoiceMatch.score >= 85) {
        // High confidence match -> Auto reconcile!
        updatedTx.reconciliationStatus = 'reconciled';
        updatedTx.matchedInvoiceId = bestInvoiceMatch.invoice.id;
        updatedTx.basAccount = '1510'; // Kundfordringar
        updatedTx.matchConfidence = bestInvoiceMatch.confidence;
        updatedTx.matchReason = bestInvoiceMatch.reason;
        usedInvoiceIds.add(bestInvoiceMatch.invoice.id);
        matchedInvoices.push({
          transactionId: tx.id,
          invoiceId: bestInvoiceMatch.invoice.id,
          amount: tx.amount,
        });
      } else if (bestInvoiceMatch && bestInvoiceMatch.score >= 60) {
        // Suggested candidate
        updatedTx.reconciliationStatus = 'pending';
        updatedTx.suggestedInvoiceId = bestInvoiceMatch.invoice.id;
        updatedTx.matchConfidence = bestInvoiceMatch.confidence;
        updatedTx.matchReason = bestInvoiceMatch.reason;
        updatedTx.basAccount = '1930';
      } else {
        updatedTx.reconciliationStatus = 'pending';
        updatedTx.basAccount = '1930';
      }
    } else {
      // 4. Outgoing Expense -> Match Receipts
      let bestReceiptMatch: { receipt: Receipt; score: number; confidence: number; reason: string } | null = null;

      for (const rec of receipts) {
        if (usedReceiptIds.has(rec.id)) continue;
        const evaluation = scoreReceiptMatch(tx, rec);
        if (evaluation.score > 0 && (!bestReceiptMatch || evaluation.score > bestReceiptMatch.score)) {
          bestReceiptMatch = { receipt: rec, ...evaluation };
        }
      }

      if (bestReceiptMatch && bestReceiptMatch.score >= 85) {
        // High confidence match -> Auto reconcile!
        updatedTx.reconciliationStatus = 'reconciled';
        updatedTx.matchedReceiptId = bestReceiptMatch.receipt.id;
        updatedTx.basAccount = bestReceiptMatch.receipt.raw_ai_response?.bas_account || deduceBasAccount(tx);
        updatedTx.matchConfidence = bestReceiptMatch.confidence;
        updatedTx.matchReason = bestReceiptMatch.reason;
        usedReceiptIds.add(bestReceiptMatch.receipt.id);
        matchedReceipts.push({
          transactionId: tx.id,
          receiptId: bestReceiptMatch.receipt.id,
          amount: Math.abs(tx.amount),
        });
      } else if (bestReceiptMatch && bestReceiptMatch.score >= 60) {
        // Suggested candidate
        updatedTx.reconciliationStatus = 'missing_receipt';
        updatedTx.suggestedReceiptId = bestReceiptMatch.receipt.id;
        updatedTx.matchConfidence = bestReceiptMatch.confidence;
        updatedTx.matchReason = bestReceiptMatch.reason;
        updatedTx.basAccount = bestReceiptMatch.receipt.raw_ai_response?.bas_account || deduceBasAccount(tx);
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
 * Automatically evaluates a newly ingested receipt against unreconciled bank transactions.
 * If a match is found (score >= 85), returns the matched transaction and the updated transaction list.
 */
export function autoMatchNewReceipt(
  newReceipt: Receipt,
  transactions: PSD2Transaction[]
): {
  matchedTx: PSD2Transaction | null;
  updatedTransactions: PSD2Transaction[];
  reason?: string;
} {
  let bestTx: PSD2Transaction | null = null;
  let bestScore = 0;
  let bestReason = '';
  let bestConfidence = 0;

  for (const tx of transactions) {
    if (tx.amount >= 0) continue;
    if (tx.reconciliationStatus === 'reconciled' || tx.reconciliationStatus === 'private_draw') continue;

    const evaluation = scoreReceiptMatch(tx, newReceipt);
    if (evaluation.score >= 85 && evaluation.score > bestScore) {
      bestScore = evaluation.score;
      bestTx = tx;
      bestReason = evaluation.reason;
      bestConfidence = evaluation.confidence;
    }
  }

  if (!bestTx) {
    return { matchedTx: null, updatedTransactions: transactions };
  }

  const matchedId = bestTx.id;
  const updatedTransactions = transactions.map((t) => {
    if (t.id === matchedId) {
      return {
        ...t,
        reconciliationStatus: 'reconciled' as const,
        matchedReceiptId: newReceipt.id,
        basAccount: newReceipt.raw_ai_response?.bas_account || t.basAccount || '5420',
        matchConfidence: bestConfidence,
        matchReason: bestReason,
      };
    }
    return t;
  });

  const matchedTx = updatedTransactions.find((t) => t.id === matchedId) || null;

  return {
    matchedTx,
    updatedTransactions,
    reason: bestReason,
  };
}

/**
 * Deduce Swedish BAS account based on merchant or description keywords
 */
export function deduceBasAccount(tx: PSD2Transaction): string {
  const desc = (tx.description + ' ' + (tx.merchantName || '')).toLowerCase();

  if (desc.includes('adobe') || desc.includes('apple') || desc.includes('software') || desc.includes('github') || desc.includes('figma') || desc.includes('aws') || desc.includes('google') || desc.includes('openai') || desc.includes('vercel')) {
    return '5420'; // Programvaror & molntjänster
  }
  if (desc.includes('sj ') || desc.includes('flygbuss') || desc.includes('taxi') || desc.includes('uber') || desc.includes('sas ') || desc.includes('sl ') || desc.includes('parkering') || desc.includes('easypark')) {
    return '5800'; // Resekostnader & transport
  }
  if (desc.includes('espresso') || desc.includes('restaurang') || desc.includes('café') || desc.includes('lunch') || desc.includes('mat')) {
    return '6072'; // Representation ej avdragsgill / personalmat
  }
  if (desc.includes('webhallen') || desc.includes('elgiganten') || desc.includes('dustin') || desc.includes('komplett') || desc.includes('ikea')) {
    return '5410'; // Förbrukningsinventarier & datatillbehör
  }
  if (desc.includes('circle k') || desc.includes('okq8') || desc.includes('preem') || desc.includes('st1') || desc.includes('bensin') || desc.includes('drivmedel')) {
    return '5611'; // Drivmedel personbilar
  }
  if (desc.includes('stripe') || desc.includes('bank') || desc.includes('avgift')) {
    return '6570'; // Bankkostnader
  }
  if (desc.includes('swish') || desc.includes('privat') || desc.includes('uttag') || desc.includes('ica') || desc.includes('coop')) {
    return '2013'; // Eget uttag
  }

  return '6990'; // Övriga externa kostnader
}
