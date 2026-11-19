import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateNeonProfile, getDb } from '@/lib/neon';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Vänligen ange en giltig e-postadress.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    
    // Check or create profile in Neon PostgreSQL
    const profile = await getOrCreateNeonProfile(cleanEmail);

    const userData = {
      id: profile.id,
      email: profile.email,
      company_name: profile.company_name || 'Mitt Företag',
      company_type: (profile as any).company_type || 'enskild_firma',
      org_nr: (profile as any).org_nr || '559123-4567',
    };

    const response = NextResponse.json({
      success: true,
      user: userData,
    });

    // Set cookie for session persistence (30 days)
    response.cookies.set('klaro_user', JSON.stringify({ id: profile.id, email: profile.email }), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Kunde inte logga in.' }, { status: 500 });
  }
}
