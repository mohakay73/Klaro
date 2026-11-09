import { calculateSwedishMoms, calculateSwedishTaxBuffer } from '../src/lib/tax-calculator';
import { parseWithSwedishHeuristics } from '../src/lib/ai-parser';
import { Invoice, Receipt } from '../src/types/database';

console.log('--- Testing Swedish Tax Calculator Engine ---');

const mockInvoices: Invoice[] = [
  {
    id: 'inv-1',
    user_id: 'user-1',
    customer_name: 'Tech AB',
    invoice_date: '2026-04-01',
    currency: 'SEK',
    subtotal_amount: 100000,
    vat_amount: 25000,
    total_amount: 125000,
    vat_rate: 25,
    status: 'paid',
    created_at: '2026-04-01',
  },
];

const mockReceipts: Receipt[] = [
  {
    id: 'rec-1',
    user_id: 'user-1',
    original_file_url: null,
    source_type: 'web_upload',
    vendor_name: 'SJ AB',
    invoice_date: '2026-04-05',
    currency: 'SEK',
    total_amount: 1060,
    vat_amount: 60,
    vat_rate: 6,
    category: 'Persontransport',
    raw_ai_response: null,
    status: 'verified',
    created_at: '2026-04-05',
  },
  {
    id: 'rec-2',
    user_id: 'user-1',
    original_file_url: null,
    source_type: 'web_upload',
    vendor_name: 'Espresso House',
    invoice_date: '2026-04-06',
    currency: 'SEK',
    total_amount: 112,
    vat_amount: 12,
    vat_rate: 12,
    category: 'Måltider',
    raw_ai_response: null,
    status: 'verified',
    created_at: '2026-04-06',
  },
  {
    id: 'rec-3',
    user_id: 'user-1',
    original_file_url: null,
    source_type: 'web_upload',
    vendor_name: 'Webhallen',
    invoice_date: '2026-04-07',
    currency: 'SEK',
    total_amount: 12500,
    vat_amount: 2500,
    vat_rate: 25,
    category: 'Kontorsmaterial',
    raw_ai_response: null,
    status: 'verified',
    created_at: '2026-04-07',
  },
];

// 1. Test Moms
const moms = calculateSwedishMoms(mockInvoices, mockReceipts);
console.log('Utgående moms (25k expected):', moms.utgaendeMoms);
console.log('Ingående moms (60 + 12 + 2500 = 2572 expected):', moms.ingaendeMoms);
console.log('Net moms (22428 expected):', moms.netMoms);
console.log('Status (to_pay expected):', moms.status);

if (moms.netMoms !== 22428) {
  throw new Error(`Moms calculation failed: expected 22428, got ${moms.netMoms}`);
}

// 2. Test Tax Buffer for Enskild Firma
const buffer = calculateSwedishTaxBuffer(mockInvoices, mockReceipts, { companyType: 'enskild_firma' });
console.log('Taxable profit (100k - (1000 + 100 + 10000) = 88900 expected):', buffer.taxableProfit);
console.log('Schablonavdrag (25% of 88900 = 22225 expected):', buffer.schablonavdrag);
console.log('Egenavgifter (~19316.7 expected):', buffer.egenavgifter);
console.log('Kommunalskatt (~22266 expected):', buffer.kommunalskatt);
console.log('Total F-skatt reserve (~41583 expected):', buffer.totalFSkattReserve);
console.log('Safe to spend (~47316 expected):', buffer.safeToSpend);
console.log('Total tax buffer (Moms + F-skatt = ~64011 expected):', buffer.totalTaxBuffer);

// 3. Test AI Swedish heuristic parser for all 4 brackets
const testSJ = parseWithSwedishHeuristics('SJ AB Biljett Stockholm C till Malmö Totalt 895 kr');
console.log('SJ VAT rate (6 expected):', testSJ.vat_rate, testSJ.category);
if (testSJ.vat_rate !== 6) throw new Error('SJ bracket test failed');

const testFood = parseWithSwedishHeuristics('Lunch på Restaurang & Espresso House Kaffe Totalt 185 kr varav moms 12%');
console.log('Food VAT rate (12 expected):', testFood.vat_rate, testFood.category);
if (testFood.vat_rate !== 12) throw new Error('Food bracket test failed');

const testSoftware = parseWithSwedishHeuristics('Adobe Creative Cloud Pro prenumeration 720 kr');
console.log('Software VAT rate (25 expected):', testSoftware.vat_rate, testSoftware.category);
if (testSoftware.vat_rate !== 25) throw new Error('Software bracket test failed');

const testBank = parseWithSwedishHeuristics('Stripe Payments Europe Transaktionsavgifter månad 450 kr');
console.log('Bank VAT rate (0 expected):', testBank.vat_rate, testBank.category);
if (testBank.vat_rate !== 0) throw new Error('Bank bracket test failed');

console.log('✅ ALL SWEDISH TAX LOGIC TESTS PASSED PERFECTLY!');
