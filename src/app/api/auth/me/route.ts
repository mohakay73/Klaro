import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/neon';

export async function GET(req: NextRequest) {
  try {
    const cookie = req.cookies.get('klaro_user');
    let sessionUser: { id?: string; email?: string } | null = null;

    if (cookie?.value) {
      try {
        sessionUser = JSON.parse(cookie.value);
      } catch {}
    }

    if (!sessionUser?.email) {
      return NextResponse.json({ user: null });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ user: null });
    }

    const sql = getDb();
    const rows = await sql.query('SELECT * FROM profiles WHERE email = $1 LIMIT 1', [sessionUser.email]);
    if (!rows || rows.length === 0) {
      return NextResponse.json({ user: null });
    }

    const p = rows[0];
    return NextResponse.json({
      user: {
        id: p.id,
        email: p.email,
        company_name: p.company_name || 'Mitt Företag',
        company_type: p.company_type || 'enskild_firma',
        org_nr: p.org_nr || '559123-4567',
        vat_registered: p.vat_registered ?? true,
        vat_period: p.vat_period || 'quarterly',
        tax_estimate_rate: Number(p.tax_estimate_rate) || 43,
        estimated_yearly_revenue: Number(p.estimated_yearly_revenue) || 950000,
        municipal_tax_rate: Number(p.municipal_tax_rate) || 0.32,
      },
    });
  } catch (error: any) {
    console.error('Error fetching auth user:', error);
    return NextResponse.json({ user: null });
  }
}
