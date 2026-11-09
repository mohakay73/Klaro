import { NextRequest, NextResponse } from 'next/server';
import { parseReceiptWithAI } from '@/lib/ai-parser';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, imageBase64, mimeType } = body;

    if (!text && !imageBase64) {
      return NextResponse.json(
        { error: 'Antingen text eller bild måste tillhandahållas.' },
        { status: 400 }
      );
    }

    const parsedData = await parseReceiptWithAI({
      text,
      base64Image: imageBase64,
      mimeType,
    });

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error in /api/receipts/parse:', error);
    return NextResponse.json(
      { error: error.message || 'Kunde inte tolka kvittot.' },
      { status: 500 }
    );
  }
}
