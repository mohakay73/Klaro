import { Receipt, Invoice, SwedishVatRate } from '@/types/database';

/**
 * SIE-4 (Standard Import Export) File Generator
 * Complies with the Swedish SIE standard (www.sie.se) supported by
 * Fortnox, Visma Spcs, Bokio, Wint, and Björn Lundén.
 */

export function generateSIE4File(options: {
  companyName: string;
  orgNr: string;
  year: number;
  invoices: Invoice[];
  receipts: Receipt[];
}): string {
  const { companyName, orgNr, year, invoices, receipts } = options;
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');

  let lines: string[] = [];

  // 1. SIE-4 Headers
  lines.push('#FLAGGA 0');
  lines.push('#PROGRAM "Klaro Swedish Tax & AI Relief" 1.0');
  lines.push('#FORMAT PC8');
  lines.push(`#GEN ${dateStr} ${timeStr}`);
  lines.push('#SIETYP 4');
  lines.push(`#FNAMN "${companyName}"`);
  lines.push(`#ORGNR ${orgNr.replace(/[^0-9]/g, '')}`);
  lines.push(`#RAR 0 ${year}0101 ${year}1231`);
  lines.push('#KPTYP EUBAS97');

  // 2. Standard Swedish BAS Accounts definition
  const accounts: Record<string, string> = {
    '1930': 'Företagskonto / Bank',
    '1510': 'Kundfordringar',
    '2440': 'Leverantörsskulder',
    '2611': 'Utgående moms 25%',
    '2621': 'Utgående moms 12%',
    '2631': 'Utgående moms 6%',
    '2641': 'Debiterad ingående moms',
    '3001': 'Försäljning tjänster 25% moms',
    '3002': 'Försäljning tjänster 12% moms',
    '3003': 'Försäljning tjänster 6% moms',
    '3004': 'Försäljning momsfri 0%',
    '5410': 'Förbrukningsinventarier & Datatillbehör',
    '5420': 'Programvaror & Molntjänster',
    '5800': 'Resekostnader & Persontransport',
    '5831': 'Hotell & Logi',
    '6071': 'Representation avdragsgill',
    '6072': 'Representation måltider',
    '6210': 'Telekommunikation & Internet',
    '6570': 'Bankkostnader & Kortavgifter',
    '6970': 'Facklitteratur & Tidskrifter',
    '6990': 'Övriga externa kostnader',
  };

  for (const [acc, desc] of Object.entries(accounts)) {
    lines.push(`#KONTO ${acc} "${desc}"`);
  }

  lines.push('');

  // 3. Verifications for Invoices (Sales / Utgående Moms)
  let verNr = 1;
  for (const inv of invoices) {
    if (inv.status === 'draft') continue;
    const invDateStr = inv.invoice_date.replace(/-/g, '');
    const series = 'A'; // Kundfakturor series

    let salesAccount = '3001';
    let vatAccount = '2611';
    if (inv.vat_rate === 12) {
      salesAccount = '3002';
      vatAccount = '2621';
    } else if (inv.vat_rate === 6) {
      salesAccount = '3003';
      vatAccount = '2631';
    } else if (inv.vat_rate === 0) {
      salesAccount = '3004';
      vatAccount = '';
    }

    lines.push(`#VER ${series} ${verNr} ${invDateStr} "Kundfaktura: ${inv.customer_name}"`);
    lines.push('{');
    // Debet Bank/Kundfordran
    lines.push(`  #TRANS 1930 {} ${inv.total_amount.toFixed(2)} ${invDateStr} "Betalning ${inv.invoice_number || ''}"`);
    // Kredit Försäljning (Netto)
    lines.push(`  #TRANS ${salesAccount} {} -${inv.subtotal_amount.toFixed(2)} ${invDateStr} "Intäkt exkl moms"`);
    // Kredit Utgående moms
    if (inv.vat_amount > 0 && vatAccount) {
      lines.push(`  #TRANS ${vatAccount} {} -${inv.vat_amount.toFixed(2)} ${invDateStr} "Utgående moms ${inv.vat_rate}%"`);
    }
    lines.push('}');
    verNr++;
  }

  // 4. Verifications for Receipts (Expenses & Ingående Moms)
  for (const rec of receipts) {
    const recDateStr = rec.invoice_date.replace(/-/g, '');
    const series = 'B'; // Leverantörsfakturor / Kvitton series

    // Map category to BAS expense account
    let expenseAccount = rec.raw_ai_response?.bas_account || '6990';
    // Clean up if composite e.g. "5420 / 6540" -> take first
    if (expenseAccount.includes('/')) {
      expenseAccount = expenseAccount.split('/')[0].trim();
    }
    if (!accounts[expenseAccount]) {
      expenseAccount = '6990';
    }

    const netExpense = rec.total_amount - rec.vat_amount;

    lines.push(`#VER ${series} ${verNr} ${recDateStr} "Kvitto: ${rec.vendor_name}"`);
    lines.push('{');
    // Debet Kostnadskonto (exkl moms)
    lines.push(`  #TRANS ${expenseAccount} {} ${netExpense.toFixed(2)} ${recDateStr} "${rec.category}"`);
    // Debet Ingående moms (2641)
    if (rec.vat_amount > 0) {
      lines.push(`  #TRANS 2641 {} ${rec.vat_amount.toFixed(2)} ${recDateStr} "Ingående moms ${rec.vat_rate}%"`);
    }
    // Kredit Bank/Företagskonto (1930)
    lines.push(`  #TRANS 1930 {} -${rec.total_amount.toFixed(2)} ${recDateStr} "Utlägg/Kortbetalning"`);
    lines.push('}');
    verNr++;
  }

  return lines.join('\r\n');
}

export function downloadSIE4File(content: string, filename = 'klaro-bokforing-2026.se') {
  const blob = new Blob([content], { type: 'text/plain;charset=windows-1252' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
