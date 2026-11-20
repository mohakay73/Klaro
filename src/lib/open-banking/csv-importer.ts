import { PSD2Transaction } from './types';

/**
 * Universal Swedish Bank CSV Parser
 * Supports:
 * - Swedbank (semicolon or comma, Bokföringsdatum / Transaktionsdatum / Belopp)
 * - SEB (Bokföringsdatum / Text / Belopp / Saldo)
 * - Handelsbanken (Datum / Transaktion / Belopp / Saldo)
 * - Nordea (Bokföringsdag / Belopp / Avsändare / Mottagare / Rubrik)
 * - Danske Bank / Länsförsäkringar
 * - Generic / Revolut (Date, Description, Amount)
 */
export function parseSwedishBankCsv(csvContent: string, accountId: string = 'imported-csv-account'): PSD2Transaction[] {
  if (!csvContent || typeof csvContent !== 'string') return [];

  // 1. Clean BOM and split into lines
  const cleanContent = csvContent.replace(/^\uFEFF/, '').trim();
  const rawLines = cleanContent.split(/\r?\n/).filter((l) => l.trim().length > 0);

  if (rawLines.length === 0) return [];

  // 2. Detect separator (; or , or \t)
  const firstLine = rawLines[0];
  const countSemi = (firstLine.match(/;/g) || []).length;
  const countComma = (firstLine.match(/,/g) || []).length;
  const countTab = (firstLine.match(/\t/g) || []).length;

  let separator = ';';
  if (countTab > countSemi && countTab > countComma) separator = '\t';
  else if (countComma > countSemi) separator = ',';

  // 3. Find header line index
  let headerIndex = -1;
  let dateColIdx = -1;
  let amountColIdx = -1;
  let descColIdx = -1;
  let refColIdx = -1;

  for (let i = 0; i < Math.min(rawLines.length, 10); i++) {
    const cols = splitCsvLine(rawLines[i], separator).map((c) => c.toLowerCase().trim());

    const dIdx = cols.findIndex((c) => 
      c.includes('datum') || c.includes('bokföring') || c.includes('date') || c.includes('transaktionsdag')
    );
    const aIdx = cols.findIndex((c) => 
      c.includes('belopp') || c.includes('amount') || c.includes('summa') || c.includes('valuta') && !c.includes('datum')
    );
    const descIdx = cols.findIndex((c) => 
      c.includes('text') || c.includes('beskrivning') || c.includes('transaktion') || 
      c.includes('description') || c.includes('mottagare') || c.includes('meddelande') || c.includes('rubrik')
    );

    if (dIdx !== -1 && aIdx !== -1) {
      headerIndex = i;
      dateColIdx = dIdx;
      amountColIdx = aIdx;
      descColIdx = descIdx !== -1 ? descIdx : (cols.length > 2 ? 1 : 0);
      refColIdx = cols.findIndex((c) => c.includes('referens') || c.includes('ocr') || c.includes('ref'));
      break;
    }
  }

  // Fallback defaults if no header matched
  if (headerIndex === -1) {
    headerIndex = -1;
    dateColIdx = 0;
    descColIdx = 1;
    amountColIdx = 2;
  }

  const transactions: PSD2Transaction[] = [];
  const startRow = headerIndex + 1;

  for (let i = startRow; i < rawLines.length; i++) {
    const row = rawLines[i].trim();
    if (!row) continue;

    const cols = splitCsvLine(row, separator);
    if (cols.length < 2) continue;

    const rawDate = cols[dateColIdx]?.trim() || '';
    const rawAmount = cols[amountColIdx]?.trim() || '';
    const rawDesc = descColIdx !== -1 ? (cols[descColIdx]?.trim() || '') : 'Banktransaktion';
    const rawRef = refColIdx !== -1 ? (cols[refColIdx]?.trim() || undefined) : undefined;

    // Parse date
    const parsedDate = parseDateString(rawDate);
    if (!parsedDate) continue;

    // Parse amount
    const parsedAmount = parseAmountString(rawAmount);
    if (isNaN(parsedAmount) || parsedAmount === 0) continue;

    transactions.push({
      id: `csv-tx-${Date.now()}-${i}`,
      accountId,
      bookingDate: parsedDate,
      valueDate: parsedDate,
      amount: parsedAmount,
      currency: 'SEK',
      description: rawDesc || 'Banköverföring / Kortköp',
      merchantName: extractMerchantName(rawDesc),
      reference: rawRef,
      reconciliationStatus: parsedAmount > 0 ? 'pending' : 'missing_receipt',
    });
  }

  return transactions;
}

function splitCsvLine(line: string, separator: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === separator && !inQuotes) {
      result.push(current.trim().replace(/^["']|["']$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^["']|["']$/g, ''));
  return result;
}

function parseDateString(raw: string): string | null {
  if (!raw) return null;
  const clean = raw.trim().replace(/^["']|["']$/g, '');

  // 1. YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD
  const isoMatch = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // 2. DD/MM/YYYY or DD.MM.YYYY or DD-MM-YYYY
  const eurMatch = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (eurMatch) {
    const [, d, m, y] = eurMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // 3. YY-MM-DD (e.g. 26-04-15)
  const shortMatch = clean.match(/^(\d{2})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (shortMatch) {
    const [, y, m, d] = shortMatch;
    const fullYear = Number(y) > 70 ? `19${y}` : `20${y}`;
    return `${fullYear}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  return null;
}

function parseAmountString(raw: string): number {
  if (!raw) return NaN;
  // Remove spaces, currency symbols like kr, SEK, :-
  let clean = raw.replace(/\s+/g, '').replace(/kr|sek|:-/gi, '');

  // Handle European numbers like "-1.502,00" or "-1 502,00" or "-1502.00"
  if (clean.includes(',') && clean.includes('.')) {
    // Determine which is thousand separator and which is decimal
    const commaPos = clean.lastIndexOf(',');
    const dotPos = clean.lastIndexOf('.');
    if (commaPos > dotPos) {
      // 1.500,50 -> 1500.50
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else {
      // 1,500.50 -> 1500.50
      clean = clean.replace(/,/g, '');
    }
  } else if (clean.includes(',')) {
    clean = clean.replace(',', '.');
  }

  return parseFloat(clean);
}

function extractMerchantName(desc: string): string | undefined {
  if (!desc) return undefined;
  const clean = desc.replace(/^(kortköp|klarna|bankgiro inbet|bankgiro utb|swish betalning|autogiro|bg inbet|bg utb)[\s:]*/gi, '').trim();
  return clean || undefined;
}
