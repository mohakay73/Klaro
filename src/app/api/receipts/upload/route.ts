import { NextRequest, NextResponse } from 'next/server';
import { parseReceiptWithAI } from '@/lib/ai-parser';
import { insertReceiptIntoNeon, DEFAULT_USER_ID } from '@/lib/neon';
import { saveReceiptFile } from '@/lib/file-storage';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const manualText = formData.get('text') as string | null;
    const sourceType = (formData.get('source_type') as string) || 'web_upload';
    
    // Check user from cookie or form data
    const cookieHeader = req.cookies.get('klaro_user')?.value;
    let cookieUserId = null;
    if (cookieHeader) {
      try { cookieUserId = JSON.parse(cookieHeader).id; } catch {}
    }
    const userId = (formData.get('user_id') as string) || cookieUserId || DEFAULT_USER_ID;

    let parsedResult;
    let fileBuffer: Buffer | null = null;
    let mimeType = 'image/jpeg';

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
      mimeType = file.type || 'image/jpeg';

      if (mimeType.startsWith('image/')) {
        const base64Image = fileBuffer.toString('base64');
        parsedResult = await parseReceiptWithAI({
          base64Image,
          mimeType,
        });
      } else {
        // Plain text, PDF text representation or receipt document
        const textContent = fileBuffer.toString('utf-8');
        parsedResult = await parseReceiptWithAI({
          text: textContent || file.name,
        });
      }
    } else if (manualText) {
      parsedResult = await parseReceiptWithAI({ text: manualText });
    } else {
      return NextResponse.json(
        { error: 'Ingen fil eller text mottogs.' },
        { status: 400 }
      );
    }

    // Persist in Neon PostgreSQL if configured
    let savedReceipt: any = null;
    if (process.env.DATABASE_URL) {
      try {
        savedReceipt = await insertReceiptIntoNeon({
          user_id: userId,
          original_file_url: file ? file.name : null,
          source_type: sourceType as any,
          vendor_name: parsedResult.vendor_name,
          invoice_date: parsedResult.invoice_date,
          currency: parsedResult.currency || 'SEK',
          total_amount: parsedResult.total_amount,
          vat_amount: parsedResult.vat_amount,
          vat_rate: parsedResult.vat_rate,
          category: parsedResult.category,
          bas_account: parsedResult.bas_account || null,
          raw_ai_response: {
            ...parsedResult,
            uploaded_at: new Date().toISOString(),
          },
          status: 'verified',
        });

        // If file buffer exists, save permanently to Vercel Blob / Neon receipt_files
        if (file && fileBuffer && savedReceipt?.id) {
          try {
            const savedFile = await saveReceiptFile({
              receiptId: savedReceipt.id,
              filename: file.name,
              mimeType,
              buffer: fileBuffer,
            });
            savedReceipt.original_file_url = savedFile.url;
          } catch (fileErr) {
            console.warn('File archiving notice:', fileErr);
          }
        }
      } catch (dbErr) {
        console.warn('Neon database insert skipped/failed:', dbErr);
      }
    }

    // Return the parsed result along with database record if created
    return NextResponse.json({
      success: true,
      data: parsedResult,
      receipt: savedReceipt || {
        id: `rec-${Date.now()}`,
        user_id: userId,
        original_file_url: file?.name || null,
        source_type: sourceType,
        vendor_name: parsedResult.vendor_name,
        invoice_date: parsedResult.invoice_date,
        currency: parsedResult.currency || 'SEK',
        total_amount: parsedResult.total_amount,
        vat_amount: parsedResult.vat_amount,
        vat_rate: parsedResult.vat_rate,
        category: parsedResult.category,
        bas_account: parsedResult.bas_account || null,
        raw_ai_response: parsedResult,
        status: 'verified',
        created_at: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error handling receipt upload:', error);
    return NextResponse.json(
      { error: error.message || 'Kunde inte hantera kvittoinläsningen.' },
      { status: 500 }
    );
  }
}
