import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { INITIAL_INVOICES } from '@/lib/mock-data';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('invoice_date', { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ invoices: INITIAL_INVOICES });
    }

    return NextResponse.json({ invoices: data });
  } catch {
    return NextResponse.json({ invoices: INITIAL_INVOICES });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer_name, total_amount, vat_rate, invoice_date, invoice_number } = body;

    const rate = Number(vat_rate) || 25;
    const total = Number(total_amount) || 0;
    const vat = rate > 0 ? Math.round((total - total / (1 + rate / 100)) * 100) / 100 : 0;
    const subtotal = Math.round((total - vat) * 100) / 100;

    const newInvoice = {
      id: `inv-${Date.now()}`,
      user_id: '00000000-0000-0000-0000-000000000001',
      customer_name: customer_name || 'Kund AB',
      invoice_number: invoice_number || `FAKTURA-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`,
      invoice_date: invoice_date || new Date().toISOString().split('T')[0],
      currency: 'SEK',
      subtotal_amount: subtotal,
      vat_amount: vat,
      total_amount: total,
      vat_rate: rate,
      status: 'paid',
      created_at: new Date().toISOString(),
    };

    try {
      const supabase = await createClient();
      await supabase.from('invoices').insert(newInvoice);
    } catch {
      // dev offline fallback
    }

    return NextResponse.json({ success: true, invoice: newInvoice });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Kunde inte skapa faktura.' }, { status: 500 });
  }
}
