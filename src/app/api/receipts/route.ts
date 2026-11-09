import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { INITIAL_RECEIPTS } from '@/lib/mock-data';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .order('invoice_date', { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ receipts: INITIAL_RECEIPTS });
    }

    return NextResponse.json({ receipts: data });
  } catch {
    return NextResponse.json({ receipts: INITIAL_RECEIPTS });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Receipt ID krävs' }, { status: 400 });
    }

    try {
      const supabase = await createClient();
      await supabase.from('receipts').delete().eq('id', id);
    } catch {
      // ignore offline
    }

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
