import { NextRequest, NextResponse } from 'next/server';
import { getReceiptsFromNeon, insertReceiptIntoNeon, deleteReceiptFromNeon, updateReceiptInNeon, DEFAULT_USER_ID } from '@/lib/neon';
import { INITIAL_RECEIPTS } from '@/lib/mock-data';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cookieHeader = req.cookies.get('klaro_user')?.value;
    let cookieUserId = null;
    if (cookieHeader) {
      try {
        const parsed = JSON.parse(cookieHeader);
        cookieUserId = parsed.id;
      } catch {}
    }
    const userId = searchParams.get('userId') || cookieUserId || DEFAULT_USER_ID;
    const includeSample = searchParams.get('includeSample') !== 'false';

    if (process.env.DATABASE_URL) {
      const receipts = await getReceiptsFromNeon(userId);
      if (receipts && receipts.length > 0) {
        return NextResponse.json({ receipts, source: 'neon', isSample: false, actualCount: receipts.length });
      }
    }

    if (!includeSample) {
      return NextResponse.json({ receipts: [], source: 'neon', isSample: false, actualCount: 0 });
    }

    return NextResponse.json({ receipts: INITIAL_RECEIPTS, source: 'initial', isSample: true, actualCount: 0 });
  } catch (error) {
    console.error('Error in GET /api/receipts:', error);
    return NextResponse.json({ receipts: INITIAL_RECEIPTS, source: 'fallback', isSample: true, actualCount: 0 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let savedReceipt;
    if (process.env.DATABASE_URL) {
      savedReceipt = await insertReceiptIntoNeon(body);
    } else {
      savedReceipt = {
        id: `rec-${Date.now()}`,
        ...body,
        created_at: new Date().toISOString(),
      };
    }
    return NextResponse.json({ success: true, receipt: savedReceipt });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const cookieHeader = req.cookies.get('klaro_user')?.value;
    let cookieUserId = null;
    if (cookieHeader) {
      try { cookieUserId = JSON.parse(cookieHeader).id; } catch {}
    }
    const userId = searchParams.get('userId') || cookieUserId;

    if (!id) {
      return NextResponse.json({ error: 'Receipt ID krävs' }, { status: 400 });
    }

    if (process.env.DATABASE_URL) {
      await deleteReceiptFromNeon(id, userId);
    }

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, userId: bodyUserId, ...updates } = body;
    const cookieHeader = req.cookies.get('klaro_user')?.value;
    let cookieUserId = null;
    if (cookieHeader) {
      try { cookieUserId = JSON.parse(cookieHeader).id; } catch {}
    }
    const userId = bodyUserId || cookieUserId;

    if (!id) {
      return NextResponse.json({ error: 'Receipt ID krävs' }, { status: 400 });
    }

    if (process.env.DATABASE_URL) {
      await updateReceiptInNeon(id, updates, userId);
    }

    return NextResponse.json({ success: true, id, updates });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
