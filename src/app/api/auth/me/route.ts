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
        bankgiro: p.bankgiro || '5050-1055',
        swish_number: p.swish_number || '123 456 78 90',
        has_f_skatt: p.has_f_skatt ?? true,
      },
    });
  } catch (error: any) {
    console.error('Error fetching auth user:', error);
    return NextResponse.json({ user: null });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      userId, 
      email, 
      companyName, 
      companyType, 
      orgNr, 
      hasFSkatt, 
      vatPeriod, 
      municipalTaxRate, 
      estimatedYearlyRevenue,
      bankgiro,
      swishNumber
    } = body;

    const cookie = req.cookies.get('klaro_user');
    let sessionUser: { id?: string; email?: string } | null = null;
    if (cookie?.value) {
      try {
        sessionUser = JSON.parse(cookie.value);
      } catch {}
    }

    const targetEmail = email || sessionUser?.email;
    const targetId = userId || sessionUser?.id;

    if (!targetEmail && !targetId) {
      return NextResponse.json({ error: 'Ingen användare identifierad' }, { status: 401 });
    }

    const sql = getDb();
    const rows = await sql.query(
      `UPDATE profiles
       SET 
         company_name = COALESCE($1, company_name),
         company_type = COALESCE($2, company_type),
         org_nr = COALESCE($3, org_nr),
         has_f_skatt = COALESCE($4, has_f_skatt),
         vat_period = COALESCE($5, vat_period),
         municipal_tax_rate = COALESCE($6, municipal_tax_rate),
         estimated_yearly_revenue = COALESCE($7, estimated_yearly_revenue),
         bankgiro = COALESCE($8, bankgiro),
         swish_number = COALESCE($9, swish_number),
         updated_at = NOW()
       WHERE email = $10 OR id = $11
       RETURNING *;`,
      [
        companyName,
        companyType,
        orgNr,
        hasFSkatt,
        vatPeriod,
        municipalTaxRate,
        estimatedYearlyRevenue,
        bankgiro,
        swishNumber,
        targetEmail || null,
        targetId || null
      ]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Profil kunde inte hittas' }, { status: 404 });
    }

    const p = rows[0];
    return NextResponse.json({
      success: true,
      user: {
        id: p.id,
        email: p.email,
        company_name: p.company_name,
        company_type: p.company_type,
        org_nr: p.org_nr,
        has_f_skatt: p.has_f_skatt,
        vat_period: p.vat_period,
        municipal_tax_rate: Number(p.municipal_tax_rate),
        estimated_yearly_revenue: Number(p.estimated_yearly_revenue),
        bankgiro: p.bankgiro,
        swish_number: p.swish_number,
      }
    });
  } catch (error: any) {
    console.error('Error updating profile in Neon:', error);
    return NextResponse.json({ error: error.message || 'Kunde inte uppdatera profil' }, { status: 500 });
  }
}
