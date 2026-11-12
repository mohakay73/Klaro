export type SourceType = 'email_forward' | 'web_upload' | 'mobile_scan';
export type ReceiptStatus = 'parsed' | 'verified' | 'exported';
export type VatPeriod = 'monthly' | 'quarterly' | 'yearly';
export type SwedishVatRate = 25 | 12 | 6 | 0;
export type CompanyType = 'enskild_firma' | 'aktiebolag';

export interface Profile {
  id: string;
  email: string;
  company_name: string | null;
  vat_registered: boolean;
  vat_period: VatPeriod;
  created_at: string;
}

export interface Receipt {
  id: string;
  user_id: string;
  original_file_url: string | null;
  source_type: SourceType;
  vendor_name: string;
  invoice_date: string; // YYYY-MM-DD
  currency: string;
  total_amount: number;
  vat_amount: number;
  vat_rate: SwedishVatRate;
  category: string;
  raw_ai_response: Record<string, any> | null;
  status: ReceiptStatus;
  created_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  customer_name: string;
  invoice_number?: string;
  invoice_date: string;
  due_date?: string;
  currency: string;
  subtotal_amount: number;
  vat_amount: number;
  total_amount: number;
  vat_rate: SwedishVatRate;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  created_at: string;
}
