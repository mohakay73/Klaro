import { NextResponse } from 'next/server';
import { SWEDISH_BANKS } from '@/lib/open-banking/types';

export async function GET() {
  return NextResponse.json({
    success: true,
    market: 'SE',
    banks: SWEDISH_BANKS,
  });
}
