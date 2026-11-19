import { NextRequest, NextResponse } from 'next/server';
import { getReceiptFile } from '@/lib/file-storage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Kvitto-ID saknas' }, { status: 400 });
    }

    const file = await getReceiptFile(id);

    if (!file) {
      return NextResponse.json({ error: 'Inget sparat underlagsdokument hittades för detta kvitto.' }, { status: 404 });
    }

    if (file.isExternalUrl && file.url) {
      return NextResponse.redirect(file.url);
    }

    return new NextResponse(new Uint8Array(file.buffer), {
      headers: {
        'Content-Type': file.mimeType || 'image/jpeg',
        'Content-Disposition': `inline; filename="${encodeURIComponent(file.filename || 'kvitto.jpg')}"`,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error: any) {
    console.error('Error serving receipt file:', error);
    return NextResponse.json({ error: 'Kunde inte läsa in kvittofilen' }, { status: 500 });
  }
}
