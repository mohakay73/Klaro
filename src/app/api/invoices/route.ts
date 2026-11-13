import { NextRequest, NextResponse } from 'next/server';
import { getInvoicesFromNeon, insertInvoiceIntoNeon, DEFAULT_USER_ID } from '@/lib/neon';
import { INITIAL_INVOICES } from '@/lib/mock-data';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || DEFAULT_USER_ID;

    if (process.env.DATABASE_URL) {
      const invoices = await getInvoicesFromNeon(userId);
      if (invoices && invoices.length > 0) {
        return NextResponse.json({ invoices, source: 'neon' });
      }
    }

    return NextResponse.json({ invoices: INITIAL_INVOICES, source: 'initial' });
  } catch (error) {
    console.error('Error in GET /api/invoices:', error);
    return NextResponse.json({ invoices: INITIAL_INVOICES, source: 'fallback' });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer_name, total_amount, vat_rate, invoice_date, invoice_number, user_id } = body;

    const rate = Number(vat_rate) || 25;
    const total = Number(total_amount) || 0;
    const vat = rate > 0 ? Math.round((total - total / (1 + rate / 100)) * 100) / 100 : 0;
    const subtotal = Math.round((total - vat) * 100) / 100;

    const invoiceData = {
      user_id: user_id || DEFAULT_USER_ID,
      customer_name: customer_name || 'Kund AB',
      invoice_number: invoice_number || `FAKTURA-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`,
      invoice_date: invoice_date || new Date().toISOString().split('T')[0],
      currency: 'SEK',
      subtotal_amount: subtotal,
      vat_amount: vat,
      total_amount: total,
      vat_rate: rate as any,
      status: 'paid' as const,
    };

    let createdInvoice;
    if (process.env.DATABASE_URL) {
      createdInvoice = await insertInvoiceIntoNeon(invoiceData);
    } else {
      createdInvoice = {
        id: `inv-${Date.now()}`,
        ...invoiceData,
        created_at: new Date().toISOString(),
      };
    }

    return NextResponse.json({ success: true, invoice: createdInvoice });
  } catch (error: any) {
    console.error('Error in POST /api/invoices:', error);
    return NextResponse.json({ error: error.message || 'Kunde inte skapa faktura.' }, { status: 500 });
  }
}
