import { SwedishVatRate, Receipt, Invoice } from './database';
export type { SwedishVatRate, Receipt, Invoice };

export interface VatRateBreakdown {
  rate: SwedishVatRate;
  netBase: number;
  vatAmount: number;
}

export interface MomsCalculation {
  utgaendeMoms: number; // Output VAT collected on sales
  ingaendeMoms: number; // Input VAT paid on business expenses (deductible)
  netMoms: number; // utgaende - ingaende (>0 = owe Skatteverket, <0 = refund)
  utgaendeBreakdown: Record<SwedishVatRate, VatRateBreakdown>;
  ingaendeBreakdown: Record<SwedishVatRate, VatRateBreakdown>;
  status: 'to_pay' | 'refund' | 'balanced';
}

export interface SwedishTaxBuffer {
  // Revenue and Expenses
  totalGrossRevenue: number;
  netRevenue: number; // exkl moms
  totalGrossExpenses: number;
  deductibleExpenses: number; // exkl moms
  taxableProfit: number; // netRevenue - deductibleExpenses

  // VAT (Moms)
  moms: MomsCalculation;

  // Enskild Firma Tax Reserves (Skatteverket rules)
  // 1. Schablonavdrag (25% deduction for self-employed social security calculation)
  schablonavdrag: number;
  // 2. Egenavgifter (~28.97% of net profit after schablonavdrag, effective ~21.7% of profit)
  egenavgifter: number;
  // 3. Preliminärskatt / Kommunalskatt (~32% estimated municipal tax)
  kommunalskatt: number;
  // Total Income Tax + Egenavgifter reserve (F-skatt)
  totalFSkattReserve: number;

  // Buffer summary
  totalTaxBuffer: number; // netMoms (if positive) + totalFSkattReserve
  safeToSpend: number; // netRevenue - deductibleExpenses - totalFSkattReserve - (netMoms > 0 ? netMoms : 0)
  safeToSpendPercentage: number;
  
  // Tax deadlines
  nextMomsDeadline: string;
  nextFSkattDeadline: string;
}

export interface ParsedReceiptData {
  vendor_name: string;
  vendor_org_nr?: string;
  invoice_date: string;
  currency: string;
  total_amount: number;
  vat_amount: number;
  vat_rate: SwedishVatRate;
  category: string;
  bas_account?: string;
  description?: string;
  confidence: number;
  reasoning: string;
}

export interface SwedishBasCategory {
  id: string;
  nameSwedish: string;
  nameEnglish: string;
  basAccount: string;
  defaultVatRate: SwedishVatRate;
  description: string;
}

export const SWEDISH_BAS_CATEGORIES: SwedishBasCategory[] = [
  {
    id: 'software_saas',
    nameSwedish: 'Programvaror & Molntjänster',
    nameEnglish: 'Software & Cloud SaaS',
    basAccount: '5420 / 6540',
    defaultVatRate: 25,
    description: 'Figma, GitHub, OpenAI, Google Workspace, AWS, Adobe'
  },
  {
    id: 'office_supplies',
    nameSwedish: 'Kontorsmaterial & Datatillbehör',
    nameEnglish: 'Office Supplies & Hardware',
    basAccount: '5410 / 6110',
    defaultVatRate: 25,
    description: 'Elektronik, möbler, papper, skrivare, skärmar'
  },
  {
    id: 'telephony_internet',
    nameSwedish: 'Telefoni & Internet',
    nameEnglish: 'Phone & Broadband',
    basAccount: '6210',
    defaultVatRate: 25,
    description: 'Telia, Tre, Telenor, bredbandsabonnemang'
  },
  {
    id: 'meals_representation',
    nameSwedish: 'Måltider & Representation',
    nameEnglish: 'Meals & Business Dining',
    basAccount: '6071 / 6072',
    defaultVatRate: 12,
    description: 'Restaurangbesök med kunder, matinköp (12% moms)'
  },
  {
    id: 'travel_hotel',
    nameSwedish: 'Hotell & Övernattning',
    nameEnglish: 'Hotel & Lodging',
    basAccount: '5831',
    defaultVatRate: 12,
    description: 'Hotellvistelser vid tjänsteresor (12% moms)'
  },
  {
    id: 'travel_transport',
    nameSwedish: 'Persontransport (Tåg, Taxi, Flyg)',
    nameEnglish: 'Passenger Transport',
    basAccount: '5800',
    defaultVatRate: 6,
    description: 'SJ tågbiljetter, SL månadskort, Taxi Stockholm, Uber (6% moms)'
  },
  {
    id: 'books_literature',
    nameSwedish: 'Facklitteratur & Tidningar',
    nameEnglish: 'Professional Books & Periodicals',
    basAccount: '6970',
    defaultVatRate: 6,
    description: 'Fackböcker, Dagens Industri, tekniska tidskrifter (6% moms)'
  },
  {
    id: 'financial_bank_fees',
    nameSwedish: 'Bankavgifter & Finansiella Tjänster',
    nameEnglish: 'Bank & Financial Fees',
    basAccount: '6570',
    defaultVatRate: 0,
    description: 'Stripe fee, bankens månadsavgift, valutaväxling (Momsfritt 0%)'
  },
  {
    id: 'healthcare_wellness',
    nameSwedish: 'Friskvård & Hälsa',
    nameEnglish: 'Wellness & Healthcare',
    basAccount: '7699',
    defaultVatRate: 0,
    description: 'Gymkort (friskvårdsbidrag), läkarintyg (Momsfritt 0%)'
  },
  {
    id: 'other_external_costs',
    nameSwedish: 'Övriga externa tjänster',
    nameEnglish: 'Other External Services',
    basAccount: '6990',
    defaultVatRate: 25,
    description: 'Konsultarvoden, juridik, marknadsföring, annonsering'
  }
];
