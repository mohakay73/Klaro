import { NextRequest, NextResponse } from 'next/server';
import { parseReceiptWithAI } from '@/lib/ai-parser';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const manualText = formData.get('text') as string | null;
    const sourceType = (formData.get('source_type') as string) || 'web_upload';

    let parsedResult;
    let fileBuffer: Buffer | null = null;

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
      const mimeType = file.type;

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

    // Attempt to persist in Supabase if configured and user is authenticated
    let savedReceipt = null;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const userId = user?.id || '00000000-0000-0000-0000-000000000001';

      // If a physical file was uploaded, try saving it to the Supabase storage bucket
      let fileUrl = file ? file.name : null;
      if (file && fileBuffer) {
        try {
          const fileExt = file.name.split('.').pop() || 'jpg';
          const filePath = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('receipts')
            .upload(filePath, fileBuffer, {
              contentType: file.type || 'image/jpeg',
              upsert: true,
            });

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from('receipts')
              .getPublicUrl(filePath);
            fileUrl = publicUrlData.publicUrl;
          }
        } catch (storageErr) {
          console.warn('Supabase storage upload fallback to filename:', storageErr);
        }
      }

      const { data, error } = await supabase
        .from('receipts')
        .insert({
          user_id: userId,
          original_file_url: fileUrl,
          source_type: sourceType,
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
          status: 'parsed',
        })
        .select()
        .single();

      if (!error && data) {
        savedReceipt = data;
      }
    } catch (dbErr) {
      // Supabase may not be initialized in local dev without live credentials
      console.warn('Supabase insert bypassed or offline:', dbErr);
    }

    // Return the parsed result along with database record if created
    return NextResponse.json({
      success: true,
      data: parsedResult,
      receipt: savedReceipt || {
        id: `rec-${Date.now()}`,
        user_id: '00000000-0000-0000-0000-000000000001',
        original_file_url: file?.name || null,
        source_type: sourceType,
        vendor_name: parsedResult.vendor_name,
        invoice_date: parsedResult.invoice_date,
        currency: parsedResult.currency || 'SEK',
        total_amount: parsedResult.total_amount,
        vat_amount: parsedResult.vat_amount,
        vat_rate: parsedResult.vat_rate,
        category: parsedResult.category,
        raw_ai_response: parsedResult,
        status: 'parsed',
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
