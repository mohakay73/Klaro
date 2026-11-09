// Pure JavaScript ESM verification test for Node 24

const SWEDISH_VAT_RATES = [25, 12, 6, 0];

function calculateSwedishMoms(invoices, receipts) {
  const initBreakdown = () => ({
    25: { rate: 25, netBase: 0, vatAmount: 0 },
    12: { rate: 12, netBase: 0, vatAmount: 0 },
    6: { rate: 6, netBase: 0, vatAmount: 0 },
    0: { rate: 0, netBase: 0, vatAmount: 0 },
  });

  const utgaendeBreakdown = initBreakdown();
  const ingaendeBreakdown = initBreakdown();

  let utgaendeMoms = 0;
  for (const inv of invoices) {
    if (inv.status === 'draft') continue;
    const rate = inv.vat_rate;
    if (utgaendeBreakdown[rate]) {
      utgaendeBreakdown[rate].netBase += inv.subtotal_amount;
      utgaendeBreakdown[rate].vatAmount += inv.vat_amount;
    }
    utgaendeMoms += inv.vat_amount;
  }

  let ingaendeMoms = 0;
  for (const rec of receipts) {
    const rate = rec.vat_rate;
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

function calculateSwedishTaxBuffer(invoices, receipts, options = {}) {
  const municipalRate = options.estimatedMunicipalTaxRate ?? 0.32;
  const companyType = options.companyType ?? 'enskild_firma';

  let totalGrossRevenue = 0;
  let netRevenue = 0;
  for (const inv of invoices) {
    if (inv.status === 'draft') continue;
    totalGrossRevenue += inv.total_amount;
    netRevenue += inv.subtotal_amount;
  }

  let totalGrossExpenses = 0;
  let deductibleExpenses = 0;
  for (const rec of receipts) {
    totalGrossExpenses += rec.total_amount;
    deductibleExpenses += rec.total_amount - rec.vat_amount;
  }

  const moms = calculateSwedishMoms(invoices, receipts);
  const taxableProfit = Math.max(0, netRevenue - deductibleExpenses);

  let schablonavdrag = 0;
  let egenavgifter = 0;
  let kommunalskatt = 0;
  let totalFSkattReserve = 0;

  if (companyType === 'enskild_firma') {
    schablonavdrag = taxableProfit * 0.25;
    const baseForEgenavgifter = taxableProfit - schablonavdrag;
    egenavgifter = baseForEgenavgifter * 0.2897;
    const taxableAfterFees = Math.max(0, taxableProfit - egenavgifter);
    kommunalskatt = taxableAfterFees * municipalRate;
    totalFSkattReserve = egenavgifter + kommunalskatt;
  } else {
    totalFSkattReserve = taxableProfit * 0.206;
  }

  const netMomsBuffer = Math.max(0, moms.netMoms);
  const totalTaxBuffer = netMomsBuffer + totalFSkattReserve;
  const safeToSpend = Math.max(0, taxableProfit - totalFSkattReserve);

  return {
    totalGrossRevenue,
    netRevenue,
    totalGrossExpenses,
    deductibleExpenses,
    taxableProfit,
    moms,
    schablonavdrag: Math.round(schablonavdrag * 100) / 100,
    egenavgifter: Math.round(egenavgifter * 100) / 100,
    kommunalskatt: Math.round(kommunalskatt * 100) / 100,
    totalFSkattReserve: Math.round(totalFSkattReserve * 100) / 100,
    totalTaxBuffer: Math.round(totalTaxBuffer * 100) / 100,
    safeToSpend: Math.round(safeToSpend * 100) / 100,
  };
}

console.log('Testing Swedish Tax Calculations...');

const invoices = [
  { subtotal_amount: 100000, vat_amount: 25000, total_amount: 125000, vat_rate: 25, status: 'paid' }
];

const receipts = [
  { total_amount: 1060, vat_amount: 60, vat_rate: 6 },
  { total_amount: 112, vat_amount: 12, vat_rate: 12 },
  { total_amount: 12500, vat_amount: 2500, vat_rate: 25 },
];

const moms = calculateSwedishMoms(invoices, receipts);
console.log('Utgående moms:', moms.utgaendeMoms);
console.log('Ingående moms:', moms.ingaendeMoms);
console.log('Netto moms att inbetala (Skatteverket):', moms.netMoms);
console.log('Status:', moms.status);

if (moms.netMoms !== 22428) throw new Error('Moms mismatch');

const buffer = calculateSwedishTaxBuffer(invoices, receipts, { companyType: 'enskild_firma' });
console.log('Vinst före skatt:', buffer.taxableProfit);
console.log('Schablonavdrag 25%:', buffer.schablonavdrag);
console.log('Egenavgifter 28.97%:', buffer.egenavgifter);
console.log('Kommunalskatt ~32%:', buffer.kommunalskatt);
console.log('Total F-skatt reserv:', buffer.totalFSkattReserve);
console.log('Total Skattebuffert (Moms + F-skatt):', buffer.totalTaxBuffer);
console.log('SÄKERT ATT TA UT:', buffer.safeToSpend);

console.log('✅ ALL VERIFICATIONS SUCCEEDED!');
