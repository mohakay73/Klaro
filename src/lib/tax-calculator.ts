import { Receipt, Invoice, SwedishVatRate } from '@/types/database';
import { SwedishTaxBuffer, MomsCalculation, VatRateBreakdown } from '@/types/tax';

const SWEDISH_VAT_RATES: SwedishVatRate[] = [25, 12, 6, 0];

export function calculateSwedishMoms(
  invoices: Invoice[],
  receipts: Receipt[]
): MomsCalculation {
  const initBreakdown = (): Record<SwedishVatRate, VatRateBreakdown> => ({
    25: { rate: 25, netBase: 0, vatAmount: 0 },
    12: { rate: 12, netBase: 0, vatAmount: 0 },
    6: { rate: 6, netBase: 0, vatAmount: 0 },
    0: { rate: 0, netBase: 0, vatAmount: 0 },
  });

  const utgaendeBreakdown = initBreakdown();
  const ingaendeBreakdown = initBreakdown();

  let utgaendeMoms = 0;
  for (const inv of invoices) {
    if (inv.status === 'draft') continue; // only count sent/paid invoices
    const rate = inv.vat_rate as SwedishVatRate;
    if (utgaendeBreakdown[rate]) {
      utgaendeBreakdown[rate].netBase += inv.subtotal_amount;
      utgaendeBreakdown[rate].vatAmount += inv.vat_amount;
    }
    utgaendeMoms += inv.vat_amount;
  }

  let ingaendeMoms = 0;
  for (const rec of receipts) {
    const rate = rec.vat_rate as SwedishVatRate;
    const net = rec.total_amount - rec.vat_amount;
    if (ingaendeBreakdown[rate]) {
      ingaendeBreakdown[rate].netBase += net;
      ingaendeBreakdown[rate].vatAmount += rec.vat_amount;
    }
    ingaendeMoms += rec.vat_amount;
  }

  const netMoms = utgaendeMoms - ingaendeMoms;

  return {
    utgaendeMoms: Math.round(utgaendeMoms * 100) / 100,
    ingaendeMoms: Math.round(ingaendeMoms * 100) / 100,
    netMoms: Math.round(netMoms * 100) / 100,
    utgaendeBreakdown,
    ingaendeBreakdown,
    status: netMoms > 0 ? 'to_pay' : netMoms < 0 ? 'refund' : 'balanced',
  };
}

export function calculateSwedishTaxBuffer(
  invoices: Invoice[],
  receipts: Receipt[],
  options?: {
    estimatedMunicipalTaxRate?: number; // default 0.32 (32%)
    companyType?: 'enskild_firma' | 'aktiebolag';
  }
): SwedishTaxBuffer {
  const municipalRate = options?.estimatedMunicipalTaxRate ?? 0.32;
  const companyType = options?.companyType ?? 'enskild_firma';

  // 1. Calculate Gross & Net Revenue
  let totalGrossRevenue = 0;
  let netRevenue = 0;
  for (const inv of invoices) {
    if (inv.status === 'draft') continue;
    totalGrossRevenue += inv.total_amount;
    netRevenue += inv.subtotal_amount;
  }

  // 2. Calculate Gross & Deductible Expenses
  let totalGrossExpenses = 0;
  let deductibleExpenses = 0;
  for (const rec of receipts) {
    totalGrossExpenses += rec.total_amount;
    deductibleExpenses += rec.total_amount - rec.vat_amount;
  }

  // 3. VAT (Moms)
  const moms = calculateSwedishMoms(invoices, receipts);

  // 4. Taxable Profit before taxes
  const taxableProfit = Math.max(0, netRevenue - deductibleExpenses);

  // 5. Enskild Firma Specific Tax Calculation according to Skatteverket
  let schablonavdrag = 0;
  let egenavgifter = 0;
  let kommunalskatt = 0;
  let totalFSkattReserve = 0;

  if (companyType === 'enskild_firma') {
    // Skatteverket standard deduction: 25% schablonavdrag for self-employed social security
    schablonavdrag = taxableProfit * 0.25;
    const baseForEgenavgifter = taxableProfit - schablonavdrag;
    // Standard egenavgifter rate in Sweden: 28.97%
    egenavgifter = baseForEgenavgifter * 0.2897;
    // Municipal tax on profit after deducting actual social fees
    const taxableAfterFees = Math.max(0, taxableProfit - egenavgifter);
    kommunalskatt = taxableAfterFees * municipalRate;
    totalFSkattReserve = egenavgifter + kommunalskatt;
  } else {
    // Micro-Aktiebolag (Bolagsskatt 20.6% on profit)
    totalFSkattReserve = taxableProfit * 0.206;
  }

  // 6. Total Tax Buffer = Net Moms (if positive) + F-skatt reserve
  const netMomsBuffer = Math.max(0, moms.netMoms);
  const totalTaxBuffer = netMomsBuffer + totalFSkattReserve;

  // 7. Safe to Spend:
  // Gross Revenue - Gross Expenses - Net Moms buffer - F-skatt reserve
  // Or simply: Taxable Profit - Total F-skatt Reserve (since moms is net neutral when collected & remitted)
  const safeToSpend = Math.max(0, taxableProfit - totalFSkattReserve);
  const safeToSpendPercentage =
    taxableProfit > 0 ? Math.round((safeToSpend / taxableProfit) * 100) : 0;

  // Next standard Swedish tax dates (quarterly moms & monthly F-skatt)
  const nextMomsDeadline = '12 Maj 2026';
  const nextFSkattDeadline = '12 Varje månad';

  return {
    totalGrossRevenue: Math.round(totalGrossRevenue * 100) / 100,
    netRevenue: Math.round(netRevenue * 100) / 100,
    totalGrossExpenses: Math.round(totalGrossExpenses * 100) / 100,
    deductibleExpenses: Math.round(deductibleExpenses * 100) / 100,
    taxableProfit: Math.round(taxableProfit * 100) / 100,
    moms,
    schablonavdrag: Math.round(schablonavdrag * 100) / 100,
    egenavgifter: Math.round(egenavgifter * 100) / 100,
    kommunalskatt: Math.round(kommunalskatt * 100) / 100,
    totalFSkattReserve: Math.round(totalFSkattReserve * 100) / 100,
    totalTaxBuffer: Math.round(totalTaxBuffer * 100) / 100,
    safeToSpend: Math.round(safeToSpend * 100) / 100,
    safeToSpendPercentage,
    nextMomsDeadline,
    nextFSkattDeadline,
  };
}
